/* Saisie d'expressions mathématiques (mode de vérification « expr » du lecteur) : analyse, LaTeX, calcul dans ℂ, vérification.
   Utilisé par module.html (window.EXPR) et par tools/variantes/verifier.mjs. Voir QUESTIONS.md, « Modes de vérification ». */
(function(){
const FN = ["arctan","arcsin","arccos","sqrt","sin","cos","tan","exp","abs","log","ln","sh","ch"];
const MOTS = ["theta","pi"].concat(FN);
const LETTRES = "eixtuyC";
const erreur = m => { const e = new Error(m); e.saisie = true; return e; };

function prep(s){
  return String(s ?? "").replace(/[−–]/g,"-").replace(/[×·∙⋅]/g,"*").replace(/÷/g,"/")
    .replace(/π/g," pi ").replace(/√/g," sqrt ").replace(/θ/g," theta ")
    .replace(/²/g,"^2").replace(/³/g,"^3").replace(/⁴/g,"^4").replace(/⁵/g,"^5").replace(/⁶/g,"^6")
    .replace(/\*\*/g,"^");
}
function decouperMot(w, T){
  let k = 0;
  while(k < w.length){
    const reste = w.slice(k), mot = MOTS.find(m => reste.startsWith(m));
    if(mot){ T.push(FN.includes(mot) ? {t:"fn", n: mot === "log" ? "ln" : mot} : {t:"id", n:mot}); k += mot.length; continue; }
    if(LETTRES.includes(w[k])){ T.push({t:"id", n:w[k]}); k++; continue; }
    throw erreur(`je ne connais pas « ${reste} »`);
  }
}
function jetons(s){
  s = prep(s); const T = []; let k = 0;
  while(k < s.length){
    const c = s[k];
    if(/\s/.test(c)){ k++; continue; }
    let m = s.slice(k).match(/^\d+(?:[.,]\d+)?/);
    if(m){ T.push({t:"n", v:parseFloat(m[0].replace(",",".")), s:m[0]}); k += m[0].length; continue; }
    m = s.slice(k).match(/^[a-zA-Z]+/);
    if(m){ decouperMot(m[0], T); k += m[0].length; continue; }
    if("+-*/^()|".includes(c)){ T.push({t:c}); k++; continue; }
    throw erreur(`caractère inconnu « ${c} »`);
  }
  return T;
}
function analyser(s){
  const T = jetons(s); let p = 0;
  if(!T.length) throw erreur("réponse vide");
  const pk = () => T[p], nx = () => T[p++];
  const debut = t => t && (t.t === "n" || t.t === "id" || t.t === "fn" || t.t === "(");
  function expr(){ let a = terme(); while(pk() && (pk().t === "+" || pk().t === "-")){ const o = nx().t; a = {k: o === "+" ? "add" : "sub", a, b: terme()}; } return a; }
  function terme(){
    let a = unaire();
    for(;;){
      const t = pk();
      if(t && (t.t === "*" || t.t === "/")){ nx(); a = {k: t.t === "*" ? "mul" : "div", a, b: unaire()}; }
      else if(debut(t)) a = {k:"mul", a, b: puissance(), impl:true};
      else return a;
    }
  }
  function unaire(){ const t = pk(); if(t && (t.t === "-" || t.t === "+")){ nx(); const a = unaire(); return t.t === "-" ? {k:"neg", a} : a; } return puissance(); }
  /* « 4x », « -4x » collés après une fonction ou un ^ : sin 2x = sin(2x), e^-4x = e^(-4x) */
  const coef = n => n.k === "num" || (n.k === "neg" && n.a.k === "num");
  const coller = a => { while(coef(a) && pk() && pk().t === "id"){ const b = puissance(); a = a.k === "neg" ? {k:"neg", a:{k:"mul", a:a.a, b, impl:true}} : {k:"mul", a, b, impl:true}; } return a; };
  function puissance(){ const a = primaire(); if(pk() && pk().t === "^"){ nx(); return {k:"pow", a, b: coller(unaire())}; } return a; }
  function primaire(){
    const t = nx();
    if(!t) throw erreur("expression incomplète");
    if(t.t === "n") return {k:"num", v:t.v, s:t.s};
    if(t.t === "id") return {k:"id", n:t.n};
    if(t.t === "fn" && pk() && pk().t === "^" && t.n !== "sqrt"){ /* sin²x = (sin x)² */
      nx(); const e = primaire(); const a = (pk() && pk().t === "(") ? primaire() : coller(puissance());
      return {k:"pow", a:{k:"fn", f:t.n, a}, b:e, fp:true};
    }
    if(t.t === "fn"){ const a = (pk() && pk().t === "(") || t.n === "sqrt" ? primaire() : coller(puissance()); return {k:"fn", f:t.n, a}; }
    if(t.t === "("){ const a = expr(); if(!pk() || pk().t !== ")") throw erreur("parenthèse non fermée"); nx(); return {k:"par", a}; }
    if(t.t === "|"){ const a = expr(); if(!pk() || pk().t !== "|") throw erreur("barre | non fermée"); nx(); return {k:"abs", a}; }
    throw erreur(`« ${t.t} » mal placé`);
  }
  const r = expr();
  if(p < T.length) throw erreur(`« ${T[p].t === "n" ? T[p].s : T[p].n || T[p].t} » en trop`);
  return r;
}

/* ---- LaTeX ---- */
const sans = n => n && n.k === "par" ? n.a : n;
const NOMS = {sin:"\\sin",cos:"\\cos",tan:"\\tan",ln:"\\ln",exp:"\\exp",arctan:"\\arctan",arcsin:"\\arcsin",arccos:"\\arccos",sh:"\\operatorname{sh}",ch:"\\operatorname{ch}",abs:"\\operatorname{abs}"};
function tex(n){
  switch(n.k){
    case "num": return n.s.replace(/[.,]/, "{,}");
    case "id": return ({pi:"\\pi", theta:"\\theta"})[n.n] ?? n.n;
    case "par": return `\\left(${tex(n.a)}\\right)`;
    case "neg": return "-" + tex(n.a);
    case "add": return tex(n.a) + "+" + tex(n.b);
    case "sub": return tex(n.a) + "-" + tex(n.b);
    case "mul": {
      const b = n.b.k === "pow" ? n.b.a : n.b;
      return tex(n.a) + (n.impl ? (b.k === "num" ? "\\cdot " : (n.a.k === "num" && n.b.k === "id") ? "" : "\\,") : "\\times ") + tex(n.b);
    }
    case "div": return `\\frac{${tex(sans(n.a))}}{${tex(sans(n.b))}}`;
    case "pow":
      if(n.fp) return NOMS[n.a.f] + `^{${tex(sans(n.b))}}` + (n.a.a.k === "par" ? tex(n.a.a) : `{${tex(n.a.a)}}`);
      return `{${tex(n.a)}}^{${tex(sans(n.b))}}`;
    case "abs": return `\\left|${tex(n.a)}\\right|`;
    case "fn":
      if(n.f === "sqrt") return `\\sqrt{${tex(sans(n.a))}}`;
      return NOMS[n.f] + (n.a.k === "par" ? tex(n.a) : `{${tex(n.a)}}`);
  }
  return "";
}

/* ---- calcul dans ℂ : [re, im] ---- */
const add = (a,b) => [a[0]+b[0], a[1]+b[1]], sub = (a,b) => [a[0]-b[0], a[1]-b[1]];
const mul = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
const div = (a,b) => { const d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; };
const cexp = a => { const r = Math.exp(a[0]); return [r*Math.cos(a[1]), r*Math.sin(a[1])]; };
const cln = a => [Math.log(Math.hypot(a[0],a[1])), Math.atan2(a[1],a[0])];
const I = [0,1];
function cpow(a, b){
  if(Math.abs(b[1]) < 1e-15 && Number.isInteger(b[0]) && Math.abs(b[0]) <= 64){
    let r = [1,0]; for(let k = 0; k < Math.abs(b[0]); k++) r = mul(r, a);
    return b[0] < 0 ? div([1,0], r) : r;
  }
  if(a[0] === 0 && a[1] === 0) return [0,0];
  return cexp(mul(b, cln(a)));
}
const csin = z => div(sub(cexp(mul(I,z)), cexp(mul([0,-1],z))), [0,2]);
const ccos = z => div(add(cexp(mul(I,z)), cexp(mul([0,-1],z))), [2,0]);
const reel = (z, f) => Math.abs(z[1]) < 1e-12 ? [f(z[0]), 0] : [NaN, NaN];
const FCT = {
  sqrt: z => (Math.abs(z[1]) < 1e-15 && z[0] >= 0) ? [Math.sqrt(z[0]),0] : cexp(mul([.5,0], cln(z))),
  exp: cexp, ln: cln, sin: csin, cos: ccos, tan: z => div(csin(z), ccos(z)),
  sh: z => div(sub(cexp(z), cexp([-z[0],-z[1]])), [2,0]), ch: z => div(add(cexp(z), cexp([-z[0],-z[1]])), [2,0]),
  arctan: z => reel(z, Math.atan), arcsin: z => reel(z, Math.asin), arccos: z => reel(z, Math.acos),
  abs: z => [Math.hypot(z[0],z[1]), 0]
};
function evaluer(n, env){
  switch(n.k){
    case "num": return [n.v, 0];
    case "id":
      if(n.n === "i") return I;
      if(n.n === "pi") return [Math.PI, 0];
      if(n.n === "e") return [Math.E, 0];
      if(n.n === "C") return [env.C || 0, 0];
      if(env[n.n] == null) throw erreur(`la variable ${n.n} n'a rien à faire ici`);
      return [env[n.n], 0];
    case "par": return evaluer(n.a, env);
    case "neg": { const a = evaluer(n.a, env); return [-a[0], -a[1]]; }
    case "add": return add(evaluer(n.a, env), evaluer(n.b, env));
    case "sub": return sub(evaluer(n.a, env), evaluer(n.b, env));
    case "mul": return mul(evaluer(n.a, env), evaluer(n.b, env));
    case "div": return div(evaluer(n.a, env), evaluer(n.b, env));
    case "pow": return cpow(evaluer(n.a, env), evaluer(n.b, env));
    case "abs": return FCT.abs(evaluer(n.a, env));
    case "fn": return FCT[n.f](evaluer(n.a, env));
  }
}
const contient = (n, test) => !!n && (test(n) || ["a","b"].some(k => n[k] && contient(n[k], test)));
const aI = n => contient(n, m => m.k === "id" && m.n === "i");
const aC = n => contient(n, m => m.k === "id" && m.n === "C");

/* ---- formes exigées ---- */
function termes(n, out = []){
  if(n.k === "add"){ termes(n.a, out); termes(n.b, out); }
  else if(n.k === "sub"){ termes(n.a, out); termes({k:"neg", a:n.b}, out); }
  else out.push(n);
  return out;
}
function nbI(n){ /* nb de i « en facteur » dans un terme ; -1 si i est mal placé */
  switch(n.k){
    case "id": return n.n === "i" ? 1 : 0;
    case "num": return 0;
    case "neg": return nbI(n.a);
    case "mul": { const a = nbI(n.a), b = nbI(n.b); return a < 0 || b < 0 || a + b > 1 ? -1 : a + b; }
    case "div": return aI(n.b) ? -1 : nbI(n.a);
    default: return aI(n) ? -1 : 0;
  }
}
function formeAlgebrique(n){
  while(n.k === "par" || (n.k === "neg" && n.a.k === "par")) n = n.k === "par" ? n.a : {k:"neg", a:n.a.a};   /* ±(a + bi) accepté */
  if(n.k === "neg" && (n.a.k === "add" || n.a.k === "sub")) return formeAlgebrique(n.a);
  const ts = termes(n); let re = 0, im = 0;
  for(const t of ts){ const k = nbI(t); if(k < 0) return "écris-le sous la forme $a + bi$ : pas de $i$ au dénominateur, ni dans une parenthèse, une puissance ou une exponentielle"; k ? im++ : re++; }
  if(re > 1 || im > 1) return "regroupe la partie réelle et la partie imaginaire : un seul terme de chaque";
  return "";
}
function facteurs(n, out = [], inv = false){
  if(n.k === "mul"){ facteurs(n.a, out, inv); facteurs(n.b, out, inv); }
  else if(n.k === "div"){ facteurs(n.a, out, inv); facteurs(n.b, out, !inv); }
  else out.push({n, inv});
  return out;
}
function partiesExpo(n){
  const fs = facteurs(n), estE = f => !f.inv && f.n.k === "pow" && f.n.a.k === "id" && f.n.a.n === "e";
  const es = fs.filter(estE);
  if(es.length !== 1 || fs.some(f => f !== es[0] && aI(f.n))) return null;
  const autres = fs.filter(f => f !== es[0]);
  const r = autres.reduce((acc, f) => f.inv ? {k:"div", a:acc, b:f.n} : {k:"mul", a:acc, b:f.n}, {k:"num", v:1, s:"1"});
  return {r, x: es[0].n.b};
}
function formeExpo(n){
  const p = partiesExpo(n);
  if(!p || !aI(p.x)) return "écris-le sous la forme $r\\,e^{i\\theta}$";
  const r = p.r ? evaluer(p.r, {}) : [1,0], x = evaluer(p.x, {});
  if(Math.abs(r[1]) > 1e-9 || r[0] <= 0) return "le module $r$ doit être un réel positif";
  if(Math.abs(x[0]) > 1e-9) return "l'exposant doit être de la forme $i\\theta$";
  if(x[1] <= -Math.PI + 1e-9 || x[1] > Math.PI + 1e-9) return "ramène l'argument dans $]-\\pi, \\pi]$ (ajoute ou retire des $2\\pi$)";
  return "";
}
function formeTrigo(n){
  const a = contient(n, m => m.k === "fn" && m.f === "cos"), b = contient(n, m => m.k === "fn" && m.f === "sin");
  if(!a || !b || contient(n, m => m.k === "pow" && m.a.k === "id" && m.a.n === "e")) return "écris-le sous la forme $r(\\cos\\theta + i\\sin\\theta)$";
  return "";
}

/* ---- vérification ----
   v = {mode:"expr", attendu, forme?:"algebrique"|"expo"|"trigo", var?:"x" | vars?:["x","y"], primitive?, constante?, domaine?:[a,b], liste?, parmi?,
        interdit?:[{motif, msg}] (regex sur la réponse brute : empêche de recopier l'énoncé, ex. « ln » quand on demande la valeur)}
   liste : plusieurs réponses séparées par « ; » (ou « et »), dans n'importe quel ordre ; « ±w » compte pour w et −w.
   parmi : une seule réponse, l'une quelconque de celles de attendu (« ; »). */
const proche = (a, b, tol = 1e-6) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) <= tol * Math.max(1, Math.hypot(b[0], b[1]));
const morceaux = s => String(s ?? "").split(/;|\bet\b/).map(x => x.trim()).filter(Boolean)
  .flatMap(x => /±/.test(x) ? [x.replace(/±/, "+"), x.replace(/±/, "-")] : [x]);
function verifierUn(v, rep){
  for(const r of [].concat(v.interdit || [])) if(new RegExp(r.motif, r.flags ?? "i").test(String(rep))) return {ok:false, msg: r.msg || "Simplifie davantage ta réponse."};
  let n, att;
  try{ n = analyser(rep); }catch(e){ if(e.saisie) return {ok:false, msg:"Je n'arrive pas à lire ta réponse : " + e.message + "."}; throw e; }
  att = analyser(v.attendu);
  const vars = v.vars || (v.var ? [v.var] : []);
  try{
    if(!vars.length){
      const a = evaluer(n, {}), b = evaluer(att, {});
      if(!isFinite(a[0]) || !isFinite(a[1])) return {ok:false, msg:"Ta réponse ne donne pas un nombre (division par 0 ?)."};
      if(!proche(a, b)) return {ok:false};
      const f = v.forme === "algebrique" ? formeAlgebrique(n) : v.forme === "expo" ? formeExpo(n) : v.forme === "trigo" ? formeTrigo(n) : "";
      return f ? {ok:false, msg:"La valeur est juste, mais " + f + "."} : {ok:true};
    }
    const [lo, hi] = v.domaine || [0.35, 2.65], T = [0, .23, .41, .57, .78, .9];
    const d = [];
    T.forEach((t, k) => {
      const env = {C:0}; vars.forEach((x, j) => env[x] = lo + ((t + j*.37) % 1)*(hi - lo));
      const a = evaluer(n, env), b = evaluer(att, env);
      if(isFinite(b[0]) && isFinite(a[0])) d.push(sub(a, b));
    });
    if(d.length < 3) return {ok:false, msg:"Je n'ai pas pu tester ta réponse."};
    if(v.primitive){
      if(!d.every(z => proche(z, d[0], 1e-6))) return {ok:false};
      if(v.constante && !aC(n)) return {ok:false, msg:"C'est bien une primitive, mais il manque la constante : ajoute $+ C$ ($C \\in \\mathbb{R}$)."};
      return {ok:true};
    }
    return {ok: d.every(z => proche(z, [0,0], 1e-6))};
  }catch(e){
    if(e.saisie) return {ok:false, msg: e.message[0].toUpperCase() + e.message.slice(1) + "."};
    throw e;
  }
}
function verifier(v, rep){
  if(v.parmi){   /* une seule réponse attendue, n'importe laquelle de la liste (ex. une racine carrée de Δ : δ ou −δ) */
    let msg = "";
    for(const a of morceaux(v.attendu)){ const x = verifierUn(Object.assign({}, v, {attendu:a}), rep); if(x.ok) return x; if(x.msg && !msg) msg = x.msg; }
    return {ok:false, msg};
  }
  if(!v.liste) return verifierUn(v, rep);
  const atts = morceaux(v.attendu), reps = morceaux(rep);
  if(!reps.length) return {ok:false, msg:"Réponse vide."};
  if(reps.length !== atts.length) return {ok:false, msg:`Il faut ${atts.length} réponses, séparées par « ; ».`};
  const libres = atts.slice(); let msg = "";
  for(const r of reps){
    const k = libres.findIndex(a => { const x = verifierUn(Object.assign({}, v, {attendu:a}), r); if(!x.ok && x.msg && !msg) msg = x.msg; return x.ok; });
    if(k < 0) return {ok:false, msg: /^La valeur est juste|^Je n'arrive/.test(msg) ? msg : ""};
    libres.splice(k, 1);
  }
  return {ok:true};
}
function apercu(rep){
  try{ return {tex: morceaux(rep).map(x => tex(analyser(x))).join(" \\;;\\; ") || ""}; }catch(e){ return {err: e.message}; }
}
(typeof window !== "undefined" ? window : globalThis).EXPR = {analyser, tex, evaluer, verifier, apercu};
})();
