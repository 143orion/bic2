/* Exécuteur C du module Programmation C : interpréteur JSCPP (MIT) dans un Web Worker.
   Message reçu : {code, stdin}   Message envoyé : {ok, out, err}
   Le thread principal tue le worker si l'exécution dépasse le délai (boucle infinie).
   JSCPP lit mal l'entrée (scanf sans %lf, sans largeur, sans " %c") : on remplace
   scanf / getchar / gets et on ajoute fgets, avec notre propre lecteur d'entrée. */
const JSCPP = require("JSCPP");
const MAX = 20000;
const BASE = {Object: Object.assign({}, JSCPP.includes)};   /* copie des includes d'origine (mergeConfig modifie l'objet) */
const CSTDIO = JSCPP.includes["stdio.h"], CSTDIO_LOAD = CSTDIO.load;

const stdioC = {
  load(rt){
    const stdio = rt.config.stdio;
    const buf = String(stdio.drain() || "");
    const drainOrig = stdio.drain; stdio.drain = () => "";
    CSTDIO_LOAD.call(CSTDIO, rt);
    stdio.drain = drainOrig;
    const T = rt.types[rt.getTypeSignature("global")].handlers;
    for(const n of ["scanf", "getchar", "gets"]){ delete T[n]; delete rt.scope[0].variables[n]; }
    const INT = rt.intTypeLiteral, CP = rt.normalPointerType(rt.charTypeLiteral);
    let pos = 0;
    const skipWs = () => { while(pos < buf.length && /\s/.test(buf[pos])) pos++; };
    const ecrireChaine = (p, s, max) => {
      const t = p.v.target, off = p.v.position || 0;
      if(max != null && s.length + 1 > max) rt.raiseException("débordement : la chaîne ne tient pas dans le tableau (prévois un octet pour '\\0')");
      for(let i = 0; i <= s.length; i++){
        if(off + i >= t.length) rt.raiseException("débordement : la chaîne ne tient pas dans le tableau (prévois un octet pour '\\0')");
        t[off + i] = rt.val(rt.charTypeLiteral, i < s.length ? s.charCodeAt(i) : 0);
      }
    };
    const affecter = (p, v, t) => {
      if(rt.isNormalPointerType(p)){
        const tt = p.t.targetType;
        const x = t === "s" ? 0 : t === "c" ? v.charCodeAt(0) : v;
        p.v.target.v = rt.val(tt, x, true).v;
      }else if(rt.isArrayType(p)){
        ecrireChaine(p, String(v));
      }else rt.raiseException("scanf : il manque le & devant la variable");
    };
    const _scanf = function(rt, _this, fp, ...args){
      const fmt = rt.getStringFromCharArray(fp);
      let i = 0, ok = 0;
      while(i < fmt.length){
        const ch = fmt[i];
        if(/\s/.test(ch)){ skipWs(); i++; continue; }
        if(ch !== "%"){ if(buf[pos] === ch){ pos++; i++; continue; } break; }
        i++;
        let star = false; if(fmt[i] === "*"){ star = true; i++; }
        let w = ""; while(/\d/.test(fmt[i] || "")) w += fmt[i++];
        while("hlLzjt".indexOf(fmt[i] || "!") >= 0) i++;
        const t = fmt[i++];
        const lim = w ? parseInt(w, 10) : undefined;
        if(t === "%"){ skipWs(); if(buf[pos] === "%"){ pos++; continue; } break; }
        if(t !== "c") skipWs();
        if(pos >= buf.length) return rt.val(INT, ok === 0 ? -1 : ok);
        const s = buf.slice(pos, lim ? pos + lim : undefined);
        let m, v;
        if(t === "d" || t === "i" || t === "u"){ m = /^[+-]?\d+/.exec(s); if(!m) break; v = parseInt(m[0], 10); }
        else if("fFeEgG".indexOf(t) >= 0){ m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s); if(!m) break; v = parseFloat(m[0]); }
        else if(t === "x" || t === "X"){ m = /^(0[xX])?[0-9a-fA-F]+/.exec(s); if(!m) break; v = parseInt(m[0], 16); }
        else if(t === "c"){ m = [buf[pos]]; v = buf[pos]; }
        else if(t === "s"){ m = /^\S+/.exec(s); if(!m) break; v = m[0]; }
        else rt.raiseException("scanf : format %" + t + " non pris en charge ici");
        pos += m[0].length;
        if(!star){ if(args[ok] === undefined) rt.raiseException("scanf : il manque une variable pour %" + t); affecter(args[ok], v, t); ok++; }
      }
      return rt.val(INT, ok);
    };
    rt.regFunc(_scanf, "global", "scanf", [CP, "?"], INT);
    rt.regFunc(function(rt){ return rt.val(INT, pos < buf.length ? buf.charCodeAt(pos++) : -1); }, "global", "getchar", [], INT);
    const ligne = max => {
      let s = "";
      while(pos < buf.length && (max == null || s.length < max)){ const c = buf[pos++]; s += c; if(c === "\n") break; }
      return s;
    };
    rt.regFunc(function(rt, _this, p){ if(pos >= buf.length) return rt.nullPointer; let s = ligne(); s = s.replace(/\n$/, ""); ecrireChaine(p, s); return rt.val(CP, p.v); }, "global", "gets", [CP], CP);
    rt.regFunc(function(rt, _this, p, n){
      const nn = n.v;
      if(pos >= buf.length || nn <= 0) return rt.nullPointer;
      const s = ligne(nn - 1); ecrireChaine(p, s); return rt.val(CP, p.v);
    }, "global", "fgets", [CP, INT, INT], CP);
    rt.defVar("stdin", INT, rt.val(INT, 0));
  }
};

/* #define NOM valeur : traité ici (le préprocesseur de JSCPP coupe mal les valeurs décimales comme 3.14159).
   Les lignes sont vidées (numéros de ligne conservés) et les noms remplacés hors chaînes et commentaires.
   Les macros à paramètres (#define CARRE(x) …) restent à JSCPP. */
function macrosSimples(code){
  const defs = {};
  const lignes = code.split("\n").map(l => {
    const m = l.match(/^\s*#\s*define\s+([A-Za-z_]\w*)(?=\s|$)(.*)$/);
    if(!m) return l;
    defs[m[1]] = m[2].replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "").trim();
    return "";
  });
  let src = lignes.join("\n");
  if(!Object.keys(defs).length) return src;
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|^[ \t]*#[^\n]*)|([A-Za-z_]\w*)/gm;
  for(let tour = 0; tour < 5; tour++){
    let change = false;
    src = src.replace(re, (x, garde, id) => { if(garde || !(id in defs)) return x; change = true; return defs[id]; });
    if(!change) break;
  }
  return src;
}
const vide = {load(){}};

onmessage = e => {
  const {code, stdin} = e.data || {};
  let out = "";
  try{
    const includes = Object.assign({}, BASE.Object, {"stdio.h": stdioC, cstdio: stdioC, "stdbool.h": vide});
    JSCPP.run(macrosSimples(String(code || "").replace(/\(\s*void\s*\)/g, "()")), String(stdin || ""), {
      includes, maxTimeout: 3000, unsigned_overflow: "warn",
      stdio: {drain: () => String(stdin || ""), write(s){ out += s; if(out.length > MAX) throw new Error("sortie trop longue"); }}
    });
    postMessage({ok:true, out});
  }catch(err){
    postMessage({ok:false, out, err:String((err && err.message) || err).slice(0, 400)});
  }
};
