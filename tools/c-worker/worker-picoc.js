/* Exécuteur C du module Programmation C : interpréteur PicoC (BSD, via picoc-web ISC) compilé en
   WebAssembly, dans un Web Worker. Message reçu : {code, stdin}. Message envoyé : {ok, out, err}.
   Le thread principal tue le worker si l'exécution dépasse le délai (boucle infinie).
   Prétraitement : « const » retiré (PicoC ne le connaît pas), initialisation de structures
   « Type v = {…}; » réécrite en affectations champ par champ. */
import PicoModule from "./node_modules/picoc-web/picoc.mjs";
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

onmessage = async e => {
  const {code, stdin, id} = e.data || {};
  const envoyer = r => postMessage(Object.assign({id}, r));
  const entree = String(stdin || "");
  let out = "", trop = false, pos = 0;
  const ecrire = t => { if(trop) return; out += t + "\n"; if(out.length > MAX){ trop = true; } };
  try{
    const m = await PicoModule({print:ecrire, printErr:ecrire, noInitialRun:true,
      stdin:() => pos < entree.length ? entree.charCodeAt(pos++) : null});
    m.FS.writeFile("/file.c", pretraiter(code));
    let crash = "";
    try{ m.callMain(["file.c"]); }
    catch(x){ const s = String((x && x.message) || x); if(!/ExitStatus|exit\(/i.test(s) && !(x && x.name === "ExitStatus")) crash = s; }
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
    if(crash) envoyer({ok:false, out, err:/divide by zero/i.test(crash) ? "division by zero" : crash.slice(0, 300)});
    else envoyer({ok:true, out});
  }catch(err){
    envoyer({ok:false, out, err:String((err && err.message) || err).slice(0, 400)});
  }
};
