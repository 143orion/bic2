/* Exécuteur C du module Programmation C : interpréteur PicoC (BSD) patché pour BIC2 (comparaison et
   soustraction de pointeurs, arithmétique sur un nom de tableau), compilé en WebAssembly WASI par zig
   (voir build-wasm.sh et picoc/), exécuté dans un Web Worker avec un mini WASI en mémoire.
   Message reçu : {id, code, stdin}. Message envoyé : {id, ok, out, err, ligne?}.
   Le thread principal tue le worker si l'exécution dépasse le délai (boucle infinie).
   Prétraitement : « const » retiré (PicoC ne le connaît pas), paramètres « T t[] » → « T *t »,
   initialisation de structures « Type v = {…}; » réécrite en affectations champ par champ. */
import WASM64 from "./picoc-wasm.js";
import {initStructures} from "./structures.js";
const MAX = 20000;

/* parcourt le code en sautant chaînes, caractères et commentaires */
const RE_JETONS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\bconst\b/g;
function pretraiter(code){
  code = String(code || "").replace(/\r/g, "");
  code = code.replace(RE_JETONS, (x, garde) => garde ? x : "");
  /* paramètre « int t[] » → « int *t » (équivalent en C) : PicoC copierait le tableau et plante au-delà de 256 octets */
  code = code.replace(/([(,]\s*(?:unsigned\s+|signed\s+|struct\s+)?[A-Za-z_]\w*\s*\**\s*)\b([A-Za-z_]\w*)\s*\[\s*\d*\s*\](?=\s*[,)])/g, "$1*$2");
  return initStructures(code);
}

let module = null;
function charger(){
  if(!module){
    const bin = atob(WASM64), u = new Uint8Array(bin.length);
    for(let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
    module = WebAssembly.compile(u);
  }
  return module;
}
class Sortie extends Error {}

/* mini WASI : stdin = source, octet 0, entrée du programme ; stdout/stderr capturés */
async function executer(source, entree){
  const enc = new TextEncoder();
  const src = enc.encode(source), inp = enc.encode(entree);
  const data = new Uint8Array(src.length + 1 + inp.length);
  data.set(src, 0); data.set(inp, src.length + 1);
  let pos = 0, n = 0, trop = false, code = 0;
  const morceaux = [];
  let mem;
  const dv = () => new DataView(mem.buffer);
  const E = {BADF:8, NOSYS:52, SPIPE:70};
  const wasi = {
    fd_write(fd, iovs, cnt, nw){
      const v = dv(); let tot = 0;
      for(let k = 0; k < cnt; k++){
        const p = v.getUint32(iovs + 8 * k, true), l = v.getUint32(iovs + 8 * k + 4, true);
        if(fd === 1 || fd === 2){ morceaux.push(new Uint8Array(mem.buffer.slice(p, p + l))); n += l; }
        tot += l;
      }
      v.setUint32(nw, tot, true);
      if(n > MAX){ trop = true; throw new Sortie(); }
      return 0;
    },
    fd_read(fd, iovs, cnt, nr){
      const v = dv(); let tot = 0;
      if(fd === 0) for(let k = 0; k < cnt && pos < data.length; k++){
        const p = v.getUint32(iovs + 8 * k, true), l = v.getUint32(iovs + 8 * k + 4, true);
        const m = Math.min(l, data.length - pos);
        new Uint8Array(mem.buffer, p, m).set(data.subarray(pos, pos + m));
        pos += m; tot += m;
      }
      v.setUint32(nr, tot, true);
      return 0;
    },
    fd_fdstat_get(fd, p){
      if(fd > 2) return E.BADF;
      const v = dv(); v.setUint8(p, 2); v.setUint16(p + 2, 0, true);
      v.setBigUint64(p + 8, 0xffffffffn, true); v.setBigUint64(p + 16, 0xffffffffn, true);
      return 0;
    },
    proc_exit(c){ code = c; throw new Sortie(); },
    environ_sizes_get(a, b){ const v = dv(); v.setUint32(a, 0, true); v.setUint32(b, 0, true); return 0; },
    environ_get(){ return 0; },
    clock_time_get(id, prec, p){ dv().setBigUint64(p, BigInt(Math.round(performance.now() * 1e6)), true); return 0; },
    fd_prestat_get(){ return E.BADF; },
    fd_prestat_dir_name(){ return E.BADF; },
    fd_seek(){ return E.SPIPE; },
    fd_close(){ return 0; },
    fd_fdstat_set_flags(){ return 0; },
  };
  const imports = {wasi_snapshot_preview1: new Proxy(wasi, {get: (o, k) => o[k] || (() => E.NOSYS)})};
  const inst = await WebAssembly.instantiate(await charger(), imports);
  mem = inst.exports.memory;
  let crash = "";
  try{ inst.exports._start(); }
  catch(x){ if(!(x instanceof Sortie)) crash = String((x && x.message) || x); }
  const tout = new Uint8Array(n); let o = 0;
  for(const m of morceaux){ tout.set(m, o); o += m.length; }
  return {out: new TextDecoder().decode(tout), trop, crash, code};
}

const CRASHS = [
  [/divide by zero/i, "division by zero"],
  [/out of bounds/i, "accès mémoire invalide"],
  [/call stack|stack overflow/i, "pile d'appels saturée"],
];
onmessage = async e => {
  const {code, stdin, id} = e.data || {};
  const envoyer = r => postMessage(Object.assign({id}, r));
  const entree = String(stdin || "");
  try{
    const r = await executer(pretraiter(code), entree);
    let out = r.out; const trop = r.trop, crash = r.crash;
    if(trop){ envoyer({ok:false, out:out.slice(0, MAX), err:"sortie trop longue"}); return; }
    /* erreur PicoC : « ligne de code / ^ / file.c:L:C message » en fin de sortie */
    const lignes = out.replace(/\n$/, "").split("\n");
    const der = lignes[lignes.length - 1] || "";
    const m2 = der.match(/^file\.c:(\d+):(\d+) (.*)$/);
    if(m2){
      let k = lignes.length - 1;
      if(k > 0 && /^\s*\^\s*$/.test(lignes[k - 1])) k -= 2;
      envoyer({ok:false, out:lignes.slice(0, Math.max(k, 0)).join("\n"), err:`${m2[1]}:${m2[2]} ${m2[3]}`, ligne:+m2[1]});
      return;
    }
    if(/(^|\n)main\(\) is not defined\n?$/.test(out)){ envoyer({ok:false, out:out.replace(/main\(\) is not defined\n?$/, ""), err:"method main is not defined"}); return; }
    if(crash){ const c = CRASHS.find(([re]) => re.test(crash)); envoyer({ok:false, out, err:c ? c[1] : crash.slice(0, 300)}); }
    else envoyer({ok:true, out});
  }catch(err){
    envoyer({ok:false, out:"", err:String((err && err.message) || err).slice(0, 400)});
  }
};
