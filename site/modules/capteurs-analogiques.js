/* =====================================================================
   BIC2.exe — extension du module « Capteurs analogiques »
   Chargée par module.html quand liste.json a ext:true. Fournit :
   - schemas    : montages à AOP, graphes (caractéristique, signaux, CAN, gain), chaîne de mesure
   - generateurs: variantes « mêmes questions, autres valeurs » → {vals, rep, corr}
   - labos      : oscilloscope, CAN, montages AOP, filtres (mode Cours, sans XP)
   ===================================================================== */
(function(){
"use strict";
/* ---------- formats ---------- */
const PFX = [[1e6,"M"],[1e3,"k"],[1,""],[1e-3,"m"],[1e-6,"µ"],[1e-9,"n"]];
function parts(v, u){
  const a = Math.abs(v); const p = a === 0 ? [1,""] : PFX.find(([m]) => a >= m*0.9995) || PFX[PFX.length-1];
  const n = v/p[0], s = (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"");
  return [s, p[1]];
}
const f = (v, u) => { const [s, p] = parts(v, u); return s.replace(".", ",") + " " + p + u; };
const t = (v, u) => { const [s, p] = parts(v, u); const pre = p === "" ? "" : p === "µ" ? "\\mu " : "\\text{" + p + "}"; return s.replace(".", "{,}") + "\\ " + pre + (u === "Ω" ? "\\Omega" : "\\text{" + u + "}"); };
const nb = (x, d = 3) => String(Math.round(x*10**d)/10**d).replace(".", ",");          /* 2,639 */
const nt = (x, d = 3) => String(Math.round(x*10**d)/10**d).replace(".", "{,}");        /* 2{,}639 (LaTeX) */
const num = s => typeof s === "number" ? s : parseFloat(String(s ?? "").replace(",", ".").replace(/[^0-9.\-e]/g, ""));
const rnd = a => a[Math.floor(Math.random()*a.length)];
const ent = (a, b) => a + Math.floor(Math.random()*(b - a + 1));
const pw2 = n => n.toString(2).split("").map((c, i, s) => c === "1" ? s.length - 1 - i : -1).filter(x => x >= 0);
const tex = el => { if(window.renderMathInElement) renderMathInElement(el, {delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}], throwOnError:false}); };

/* ---------- briques de schémas à AOP (entrée à gauche en y=90, sortie à droite en y=110) ---------- */
const lab = (x, y, s, a = "end") => ["t", x, y, s, {a}];
function SUIV(dx, o = {}){ return [
  ["w",[[dx,90],[dx+40,90]]], ["AO",dx+40,110,{id:o.id || "AO",haut:"+"}],
  ["w",[[dx+40,130],[dx+20,130],[dx+20,175],[dx+140,175],[dx+140,110]]], ["w",[[dx+120,110],[dx+160,110]]], ["n",dx+140,110]]; }
function INV(dx, o = {}){ const a = o.a || "R1", b = o.b || "R2"; return [
  ["R",dx,90,dx+95,90,{id:a,label:a,val:o.va}], ["w",[[dx+95,90],[dx+150,90]]], ["n",dx+115,90],
  ["AO",dx+150,110,{id:o.id || "AO",haut:"-"}], ["w",[[dx+150,130],[dx+130,130],[dx+130,150]]], ["g",dx+130,150],
  [o.cf ? "C" : "R",dx+140,35,dx+235,35,{id:b,label:b,val:o.vb}], ["w",[[dx+115,90],[dx+115,35],[dx+140,35]]], ["w",[[dx+235,35],[dx+260,35],[dx+260,110]]],
  ["w",[[dx+230,110],[dx+280,110]]], ["n",dx+260,110]]; }
function NINV(dx, o = {}){ const a = o.a || "R1", b = o.b || "R2"; return [
  ["w",[[dx,90],[dx+150,90]]], ["AO",dx+150,110,{id:o.id || "AO",haut:"+"}],
  ...(o.c ? [["n",dx+45,90],["R",dx+45,90,dx+45,175,{id:o.c,label:o.c,val:o.vc,lp:"right"}],["g",dx+45,175]] : []),
  ["w",[[dx+150,130],[dx+95,130]]], ["R",dx+95,130,dx+95,205,{id:a,label:a,val:o.va,lp:"left"}], ["g",dx+95,205], ["n",dx+115,130],
  ["w",[[dx+115,130],[dx+115,180],[dx+140,180]]], ["R",dx+140,180,dx+235,180,{id:b,label:b,val:o.vb,lp:"bottom"}], ["w",[[dx+235,180],[dx+260,180],[dx+260,110]]],
  ["w",[[dx+230,110],[dx+280,110]]], ["n",dx+260,110]]; }
const ES = (xi, xo, ei = "V_e", es = "V_s") => [["n",xi,90], lab(xi-6,84,ei), ["n",xo,110], lab(xo+6,104,es,"start")];

/* ---------- graphes (repère : zone x0..x1, y0 (bas)..y1 (haut)) ---------- */
function repere(o){
  const {x0 = 60, x1 = 460, yb = 220, yh = 20, xmin = 0, xmax, ymin = 0, ymax, gx = [], gy = [], fx = v => nb(v, 2), fy = v => nb(v, 2), lx = "", ly = ""} = o;
  const X = v => x0 + (v - xmin)/(xmax - xmin)*(x1 - x0), Y = v => yb - (v - ymin)/(ymax - ymin)*(yb - yh);
  const el = [];
  gx.forEach(v => { el.push(["c",[[X(v),yh],[X(v),yb]],{cls:"gr"}]); el.push(["t",X(v),yb+16,fx(v),{cls:"val"}]); });
  gy.forEach(v => { el.push(["c",[[x0,Y(v)],[x1,Y(v)]],{cls:"gr"}]); el.push(["t",x0-6,Y(v)+4,fy(v),{a:"end",cls:"val"}]); });
  const y0 = Y(Math.min(Math.max(0, ymin), ymax));
  el.push(["c",[[x0,y0],[x1+8,y0]],{cls:"ax"}], ["c",[[x0,yb],[x0,yh-8]],{cls:"ax"}]);
  if(lx) el.push(["t",x1+6,y0-8,lx,{a:"end",cls:"val"}]);
  if(ly) el.push(["t",x0+8,yh-2,ly,{a:"start",cls:"val"}]);
  return {X, Y, el};
}
function sig(fo, x, T, U, O, a){ const ph = ((x % T) + T) % T / T;
  if(fo === "sin") return O + U*Math.sin(2*Math.PI*ph);
  if(fo === "tri") return O + U*(ph < .5 ? -1 + 4*ph : 3 - 4*ph);
  if(fo === "scie") return O + U*ph;
  return O + (ph < a ? U : 0); }

const schemas = {
  /* chaîne de mesure : grandeur → capteur → CAN → calculateur */
  "chaine": () => ({vb:"0 0 640 120", el:[
    ["t",50,52,"grandeur"],["t",50,68,"physique"],["a",95,60,135,60],
    ["B",140,35,110,50,"Capteur",{id:"cap"}],["a",250,60,300,60],["t",275,48,"signal",{cls:"val"}],["t",275,90,"analogique",{cls:"val"}],
    ["B",305,35,90,50,"CAN",{id:"can"}],["a",395,60,445,60],["t",420,48,"code",{cls:"val"}],["t",420,90,"numérique",{cls:"val"}],
    ["B",450,35,150,50,"Calculateur",{id:"calc"}]]}),
  "chaine-cna": () => ({vb:"0 0 640 120", el:[
    ["B",20,35,150,50,"Calculateur",{id:"calc"}],["a",170,60,220,60],["t",195,48,"code",{cls:"val"}],
    ["B",225,35,90,50,"CNA",{id:"cna"}],["a",315,60,365,60],["t",340,48,"tension",{cls:"val"}],
    ["B",370,35,130,50,"Actionneur",{id:"act"}]]}),
  /* montages à AOP */
  "suiveur": () => ({vb:"-40 20 300 175", el:[...SUIV(40), ...ES(40,200)]}),
  "inverseur": v => ({vb:"-40 0 400 175", el:[...INV(40,{va:v.R1,vb:v.R2}), ...ES(40,320)]}),
  "non-inverseur": v => ({vb:"-40 20 400 215", el:[...NINV(40,{va:v.R1,vb:v.R2,c:v.R3 != null ? "R3" : null,vc:v.R3}), ...ES(40,320)]}),
  "comparateur": v => ({vb:"-40 20 380 160", el:[
    ["w",[[40,90],[150,90]]], ["AO",150,110,{id:"AO",haut:"+"}], ["w",[[150,130],[90,130]]], ["n",90,130], lab(84,146,v.ref || "V_ref"),
    ["w",[[230,110],[280,110]]], ...ES(40,280)]}),
  "sommateur": v => ({vb:"-40 0 400 200", el:[
    ["R",40,90,135,90,{id:"R1",label:"R1",val:v.R1}], ["n",40,90], lab(34,84,"V_1"),
    ["R",40,150,135,150,{id:"R2",label:"R2",val:v.R2,lp:"bottom"}], ["n",40,150], lab(34,144,"V_2"), ["w",[[135,150],[155,150],[155,90]]],
    ["w",[[135,90],[190,90]]], ["n",155,90], ["AO",190,110,{id:"AO",haut:"-"}], ["w",[[190,130],[175,130],[175,175]]], ["g",175,175],
    ["w",[[155,90],[155,35],[180,35]]], ["R",180,35,275,35,{id:"R",label:"R",val:v.R}], ["w",[[275,35],[300,35],[300,110]]],
    ["w",[[270,110],[320,110]]], ["n",300,110], ["n",320,110], lab(326,104,"V_s","start")]}),
  "derivateur": v => ({vb:"-40 0 400 175", el:[...INV(40,{a:"C",b:"R",va:v.C,vb:v.R}).map(e => e[0] === "R" && e[5] && e[5].id === "C" ? ["C",...e.slice(1)] : e), ...ES(40,320)]}),
  "passe-bas": v => ({vb:"-40 -45 400 220", el:[
    ["R",40,90,135,90,{id:"R",label:"R",val:v.R}], ["w",[[135,90],[190,90]]], ["n",155,90],
    ["AO",190,110,{id:"AO",haut:"-"}], ["w",[[190,130],[170,130],[170,150]]], ["g",170,150],
    ["w",[[155,90],[155,-15],[180,-15]]], ["R",180,-15,275,-15,{id:"R'",label:"R'",val:v.Rp}], ["w",[[275,-15],[300,-15],[300,110]]],
    ["w",[[155,40],[180,40]]], ["C",180,40,275,40,{id:"C",label:"C",val:v.C}], ["w",[[275,40],[300,40]]], ["n",155,40], ["n",300,40],
    ["w",[[270,110],[320,110]]], ["n",300,110], ...ES(40,320)]}),
  "passe-haut": v => ({vb:"-40 0 470 175", el:[
    ["R",40,90,120,90,{id:"R'",label:"R'",val:v.Rp}], ["C",120,90,185,90,{id:"C",label:"C",val:v.C}],
    ...INV(185,{a:"_",b:"R",vb:v.R}).filter(e => !(e[0] === "R" && e[5] && e[5].id === "_")), ["w",[[185,90],[280,90]]], ...ES(40,465)]}),
  /* TD AOP ex. 3 : cascades */
  "td-ex3a": v => ({vb:"-40 20 520 175", el:[...SUIV(40,{id:"A1"}), ...INV(200,{va:v.R1,vb:v.R2,id:"A2"}), ...ES(40,480,"V_i","V_o")]}),
  "td-ex3b": v => ({vb:"-40 20 400 215", el:[...NINV(40,{va:v.R1,vb:v.R2,c:"R3",vc:v.R3}), ...ES(40,320,"V_i","V_o")]}),
  "td-ex3c": v => ({vb:"-40 20 800 215", el:[...SUIV(40,{id:"A1"}), ...INV(200,{va:v.R1,vb:v.R2,id:"A2"}), ["w",[[480,110],[480,90]]],
    ...NINV(480,{va:v.R1,vb:v.R2,c:"R3",vc:v.R3,id:"A3"}).map(e => e[0] === "R" && e[5] ? ["R",e[1],e[2],e[3],e[4],Object.assign({},e[5],{id:e[5].id+"b"})] : e), ...ES(40,760,"V_i","V_o")]}),
  /* TD AOP ex. 1 : 4 montages, lesquels sont linéaires ? */
  "td-ex1": () => {
    const el = [], box = (dx, n) => el.push(["t",dx+10,30,"("+n+")",{a:"start",cls:"val"}]);
    /* 1 : suiveur */ box(0,1); el.push(["w",[[10,90],[40,90]]],["AO",40,110,{haut:"+"}],["w",[[40,130],[25,130],[25,165],[135,165],[135,110]]],["w",[[120,110],[150,110]]]);
    /* 2 : réaction sur + */ box(170,2); el.push(["w",[[180,130],[210,130]]],["AO",210,110,{haut:"+"}],["w",[[210,90],[195,90],[195,50],[305,50],[305,110]]],["w",[[290,110],[320,110]]]);
    /* 3 : boucle ouverte */ box(340,3); el.push(["w",[[350,90],[380,90]]],["AO",380,110,{haut:"+"}],["w",[[380,130],[365,130],[365,150]]],["g",365,150],["w",[[460,110],[490,110]]]);
    /* 4 : inverseur */ box(510,4); el.push(["R",515,90,575,90,{}],["w",[[575,90],[600,90]]],["AO",600,110,{haut:"-"}],["w",[[600,130],[590,130],[590,150]]],["g",590,150],
      ["w",[[585,90],[585,45],[610,45]]],["R",610,45,670,45,{}],["w",[[670,45],[695,45],[695,110]]],["w",[[680,110],[710,110]]]);
    return {vb:"0 10 720 175", el};
  },
  /* Millman : 3 branches (rappels) */
  "millman3b": v => ({vb:"0 0 420 225", el:[
    ["w",[[60,40],[330,40]]], ["w",[[60,200],[330,200]]],
    ["R",60,40,60,110,{id:"R1",label:"R1",val:v.R1,lp:"left"}], ["S",60,200,60,130,{id:"V1",label:"V1",val:v.V1,lp:"left"}], ["w",[[60,110],[60,130]]],
    ["R",190,40,190,200,{id:"R2",label:"R2",val:v.R2,lp:"right"}],
    ["R",330,40,330,110,{id:"R3",label:"R3",val:v.R3,lp:"right"}], ["S",330,130,330,200,{id:"V3",label:"V3",val:v.V3,lp:"right"}], ["w",[[330,110],[330,130]]],
    ["n",190,40], ["n",190,200], ["t",190,26,"a"], ["t",190,222,"b"]]}),
  /* graphe : caractéristique d'un capteur linéaire V = a·x + b */
  "caract": v => {
    const a = num(v.a), b = num(v.b), xmax = num(v.xmax) || 5, ymax = Math.ceil((b + a*xmax*1.08)*5)/5 + 0.2;
    const gy = []; for(let y = 0; y <= ymax + 1e-9; y += 0.1) gy.push(Math.round(y*10)/10);
    const gx = []; for(let x = 0; x <= xmax + 1e-9; x += 0.5) gx.push(x);
    const R = repere({xmax:xmax*1.08, ymax, gx, gy, fx:x => Number.isInteger(x) ? String(x) : "", fy:y => Math.round(y*10) % 2 === 0 ? nb(y,1) : "", lx:v.lx || "P (bar)", ly:v.ly || "V (V)"});
    const el = R.el.concat([["c",[[R.X(0),R.Y(b)],[R.X(xmax*1.05),R.Y(b + a*xmax*1.05)]],{cls:"tr"}]]);
    for(let x = 1; x <= xmax; x++) el.push(["n",R.X(x),R.Y(b + a*x)]);
    return {vb:"0 0 500 250", el};
  },
  /* graphe : signal périodique (forme sin|tri|carre|scie, U, O offset, T en ms, A rapport cyclique) */
  "signal": v => {
    const fo = v.forme || "sin", U = num(v.U) || 2, O = num(v.O) || 0, T = num(v.T) || 4, a = num(v.A) || .5, tmax = 3*T;
    const hi = Math.max(O + U, 0, 1), lo = Math.min(fo === "sin" || fo === "tri" ? O - U : O, 0);
    const R = repere({xmax:tmax, ymin:lo - .5, ymax:hi + .8, gx:[0,T,2*T,3*T], gy:[...new Set([lo, 0, O, hi].map(x => Math.round(x*10)/10))], fx:x => nb(x,2), fy:y => nb(y,1), lx:"t (ms)", ly:"v (V)"});
    const pts = []; for(let i = 0; i <= 600; i++){ const x = i/600*tmax; pts.push([R.X(x), R.Y(sig(fo, x - 1e-9, T, U, O, a))]); }
    const el = R.el.concat([["c",pts,{cls:"tr"}]]);
    if(v.moy) { const m = fo === "carre" ? O + a*U : fo === "scie" ? O + U/2 : O; el.push(["c",[[R.X(0),R.Y(m)],[R.X(tmax),R.Y(m)]],{cls:"pt"}]); }
    return {vb:"0 0 500 250", el};
  },
  /* graphe : escalier d'un CAN 3 bits */
  "escalier": v => {
    const N = num(v.N) || 3, n = 2**N, Vm = num(v.Vmax) || 8;
    const R = repere({xmax:Vm*1.05, ymax:n+.3, gx:[...Array(n+1).keys()].map(k => k*Vm/n), gy:[...Array(n).keys()], fx:x => nb(x,2), fy:y => String(y), lx:"U_e (V)", ly:"code"});
    const pts = []; for(let k = 0; k < n; k++) pts.push([R.X(k*Vm/n), R.Y(k)], [R.X((k+1)*Vm/n), R.Y(k)]);
    return {vb:"0 0 500 250", el:R.el.concat([["c",pts,{cls:"tr"}], ["a",R.X(0),R.Y(1)-8,R.X(Vm/n),R.Y(1)-8,"q",R.X(Vm/n/2),R.Y(1)-16]])};
  },
  /* graphe : saturation de l'AOP, Vs en fonction de ε */
  "saturation": () => {
    const R = repere({xmin:-3, xmax:3, ymin:-18, ymax:18, gx:[], gy:[-15,0,15], fy:y => (y > 0 ? "+" : "") + y, lx:"ε", ly:"V_s (V)"});
    return {vb:"0 0 500 250", el:R.el.concat([["c",[[R.X(-3),R.Y(-15)],[R.X(-.5),R.Y(-15)],[R.X(.5),R.Y(15)],[R.X(3),R.Y(15)]],{cls:"tr"}],
      ["t",R.X(1.6),R.Y(15)-8,"saturation +Vcc",{cls:"val"}],["t",R.X(-1.6),R.Y(-15)+18,"saturation −Vcc",{cls:"val"}],["t",R.X(.9),R.Y(2),"zone linéaire (pente A)",{a:"start",cls:"val"}]])};
  },
  /* graphe : gain en dB d'un filtre d'ordre 1 (type pb|ph) */
  "gain": v => {
    const ty = v.type || "pb", R = repere({xmin:-2, xmax:2, ymin:-30, ymax:6, gx:[-2,-1,0,1,2], gy:[-20,-3,0], fx:x => ({"-2":"fc/100","-1":"fc/10","0":"fc","1":"10 fc","2":"100 fc"})[x], fy:y => String(y), lx:"f", ly:"G (dB)"});
    const pts = []; for(let i = 0; i <= 300; i++){ const lx = -2 + 4*i/300, r = Math.pow(10, lx), H = ty === "pb" ? 1/Math.sqrt(1 + r*r) : r/Math.sqrt(1 + r*r); pts.push([R.X(lx), R.Y(Math.max(-30, 20*Math.log10(H)))]); }
    return {vb:"0 0 500 250", el:R.el.concat([["c",pts,{cls:"tr"}], ["c",[[R.X(-2),R.Y(-3)],[R.X(2),R.Y(-3)]],{cls:"pt"}], ["c",[[R.X(0),R.Y(6)],[R.X(0),R.Y(-30)]],{cls:"pt"}]])};
  }
};

/* ---------- générateurs ---------- */
const binCorr = n => { const b = n.toString(2), p = pw2(n);
  return {B:b, PUIS:p.map(k => `2^{${k}}`).join(" + "), SOMME:p.map(k => 2**k).join(" + ")}; };
const divs = n => { const r = []; while(n >= 1){ r.push(`| ${n} ÷ 2 | ${Math.floor(n/2)} | **${n%2}** |`); n = Math.floor(n/2); } return "| division | quotient | reste |\n|---|---|---|\n" + r.join("\n"); };
const generateurs = {
  "bin-tete"(){ let n; do { n = ent(5, 63); } while(pw2(n).length > 4); const c = binCorr(n); return {vals:Object.assign({N:String(n)}, c)}; },
  "bin-dm"(){ const n = ent(100, 2000), c = binCorr(n); return {vals:Object.assign({N:String(n), DIV:divs(n)}, c)}; },
  "bin-dec"(){ let n; do { n = ent(5, 63); } while(pw2(n).length > 4); const c = binCorr(n); return {vals:Object.assign({N:String(n)}, c)}; },
  "bin-octet"(){ const n = ent(1, 255), b = n.toString(2).padStart(8, "0"); return {vals:{B8:b, MSB:b[0], LSB:b[7], N:String(n)}}; },
  "periode"(){ const T = rnd([0.5,1,2,2.5,4,5,10,20,25,50]); return {vals:{T:nb(T), F:nb(1000/T, 2), FN:String(Math.round(1e5/T)/100), FT:nt(1000/T, 2), TT:nt(T)}}; },
  "frequence"(){ const F = rnd([50,100,200,250,400,500,1000,2000,5000]); return {vals:{F:String(F), T:nb(1000/F, 3), TN:String(1/F), TT:nt(1000/F, 3)}}; },
  "pwm-moy"(){ const U = rnd([3.3,5,10,12]), a = rnd([0.1,0.2,0.25,0.4,0.5,0.6,0.75,0.8]), O = 0; return {vals:{U:nb(U,1), UT:nt(U,1), A:nb(a,2), AT:nt(a,2), M:nb(a*U,3), MN:String(Math.round(a*U*1000)/1000), MT:nt(a*U,3), APC:String(Math.round(a*100))}}; },
  "pwm": () => { const T = rnd([1,2,4,5,10,20]), a = rnd([0.1,0.2,0.25,0.4,0.5,0.6,0.75,0.8]), U = rnd([5,10,12]), th = a*T;
    return {vals:{T:nb(T), TH:nb(th), U:String(U)}, rep:[a, 1000/T, a*U], corr:[
      `$\\alpha = \\dfrac{t_h}{T} = \\dfrac{${nt(th)}}{${nt(T)}} = \\mathbf{${nt(a,2)}}$ (soit ${Math.round(a*100)} %)`,
      `$F = \\dfrac{1}{T} = \\dfrac{1}{${nt(T)} \\times 10^{-3}\\ \\text{s}} = \\mathbf{${t(1000/T,"Hz")}}$`,
      `Le signal vaut $U$ pendant $t_h$ et 0 le reste du temps : $\\langle v \\rangle = \\alpha U = ${nt(a,2)} \\times ${U} = \\mathbf{${t(a*U,"V")}}$`]}; },
  "bin-exo"(){ const ns = [ent(20,63), ent(64,255), ent(256,1023), ent(1024,2047)];
    return {vals:Object.fromEntries(ns.map((n, k) => ["N"+k, String(n)])), rep:ns.map(n => [n.toString(2)]), corr:ns.map(n => { const p = pw2(n);
      return `$${n} = ${p.map(k => `2^{${k}}`).join(" + ")}$, donc $(${n})_{10} = (\\mathbf{${n.toString(2)}})_2$ (${n.toString(2).length} bits)`; })}; },
  /* caractéristique d'un capteur de pression : valeurs sur la grille (b multiple de 0,1 V, a multiple de 0,02 V/bar) */
  "caract": () => { const b = ent(2, 9)/10, a = ent(2, 12)*0.02, p = rnd([1.5,2.5,3.5,4.5]), V = a*p + b, Vc = rnd([1,2,3,4])*a + b, Pc = (Vc - b)/a;
    return {vals:{a:String(a), b:String(b), P:nb(p,1), VC:nb(Vc,2)}, rep:[["pression", "la pression"], b, a, V, Pc], corr:[
      "L'axe horizontal porte la grandeur mesurée : le **mesurande** est la pression ; la sortie est une **tension** analogique.",
      `On lit la tension pour $P = 0$ : $V_0 = \\mathbf{${t(b,"V")}}$`,
      `Deux points éloignés : $S = \\dfrac{V(5) - V(0)}{5 - 0} = \\dfrac{${nt(b+5*a,2)} - ${nt(b,1)}}{5} = \\mathbf{${nt(a,2)}\\ \\text{V/bar}}$`,
      `$V(P) = ${nt(a,2)}\\,P + ${nt(b,1)}$, donc $V(${nt(p,1)}) = ${nt(a,2)} \\times ${nt(p,1)} + ${nt(b,1)} = \\mathbf{${t(V,"V")}}$`,
      `On inverse : $P = \\dfrac{V - V_0}{S} = \\dfrac{${nt(Vc,2)} - ${nt(b,1)}}{${nt(a,2)}} = \\mathbf{${nt(Pc,2)}\\ \\text{bar}}$`]}; },
  "tmp36": () => { const T = rnd([-20,-10,0,15,20,30,37,40,50,60,80,100]), V = 0.5 + 0.01*T, V2 = rnd([0.6,0.65,0.7,0.8,0.85,0.9,1.0,1.1,1.25]), T2 = (V2 - 0.5)/0.01;
    return {vals:{T:String(T), V2:nb(V2,2)}, rep:[0.01, 0.75, V, T2], corr:[
      "La datasheet donne un facteur d'échelle de **10 mV/°C** : c'est la sensibilité ($S = 0{,}01\\ \\text{V/°C}$).",
      "Le tableau de la datasheet donne $\\mathbf{750\\ \\text{mV}}$ à 25 °C.",
      `$V = 0{,}5 + 0{,}01\\,T = 0{,}5 + 0{,}01 \\times (${T}) = \\mathbf{${t(V,"V")}}$`,
      `$T = \\dfrac{V - 0{,}5}{0{,}01} = \\dfrac{${nt(V2,2)} - 0{,}5}{0{,}01} = \\mathbf{${nb(T2,1)}\\ °\\text{C}}$`]}; },
  "pt100": () => { const T = rnd([20,25,40,50,80,100,150,200]), R = 100*(1 + 0.00385*T);
    return {vals:{T:String(T)}, rep:[0.385, R], corr:[
      "$S = \\dfrac{dR}{dT} = a R_0 = 0{,}00385 \\times 100 = \\mathbf{0{,}385\\ \\Omega/°\\text{C}}$ : constante, le capteur est linéaire.",
      `$R(${T}) = R_0(1 + aT) = 100 \\times (1 + 0{,}00385 \\times ${T}) = \\mathbf{${nt(R,2)}\\ \\Omega}$`]}; },
  /* CAN */
  "can-q"(){ const N = rnd([3,4,8,10,12]), Vm = rnd([1,2,4,5,8,10]), Vmin = 0, q = (Vm - Vmin)/2**N;
    return {vals:{N:String(N), VM:nb(Vm,1), Q:String(q), QT:t(q,"V"), NC:String(2**N)}}; },
  "can-code"(){ const N = rnd([8,10]), Vm = rnd([5,10]), q = Vm/2**N; let U, r; do { U = ent(5, Vm*100 - 5)/100; r = U/q; } while(Math.abs(r - Math.round(r)) < 0.05);
    const cf = Math.floor(r), cr = Math.round(r);
    return {vals:{N:String(N), VM:String(Vm), U:nb(U,2), UT:nt(U,2), Q:t(q,"V"), QT:nt(q*1000,3), R:nb(r,2), RT:nt(r,2), CF:String(cf), CR:String(cr), NC:String(2**N)}}; },
  "can-exo"(){ const N = rnd([8,10]), Vm = rnd([5,10]), q = Vm/2**N; let U, r; do { U = ent(5, Vm*100 - 5)/100; r = U/q; } while(Math.abs(r - Math.round(r)) < 0.05);
    const cf = Math.floor(r), cr = Math.round(r), bf = cf.toString(2).padStart(N, "0");
    return {vals:{N:String(N), VM:String(Vm), U:nb(U,2), NC:String(2**N), CF:String(cf)}, rep:[q, r, [String(cf), String(cr)], [bf, cr.toString(2).padStart(N, "0")]], corr:[
      `$q = \\dfrac{V_{max} - V_{min}}{2^N} = \\dfrac{${Vm}}{2^{${N}}} = \\dfrac{${Vm}}{${2**N}} = \\mathbf{${t(q,"V")}}$`,
      `$\\dfrac{U_e - V_{min}}{q} = \\dfrac{${nt(U,2)}}{${nt(q,5)}} = \\mathbf{${nt(r,2)}}$`,
      `Le code est un entier : partie entière **${cf}**${cr !== cf ? ` (ou **${cr}** en arrondissant : les deux sont acceptés)` : ""}.`,
      `$${cf} = ${pw2(cf).map(k => `2^{${k}}`).join(" + ") || "0"}$ → sur ${N} bits : \`${bf}\``]}; },
  "can-tension"(){ const N = 10, Vmin = rnd([0,0.5,1]), Vmax = rnd([3,4,5]), c = ent(100, 1000), q = (Vmax - Vmin)/1024, U = Vmin + c*q;
    return {vals:{VMIN:nb(Vmin,1), VMAX:nb(Vmax,1), C:String(c)}, rep:[q, c*q, U], corr:[
      `$q = \\dfrac{${nt(Vmax,1)} - ${nt(Vmin,1)}}{2^{10}} = \\dfrac{${nt(Vmax-Vmin,1)}}{1024} = \\mathbf{${t(q,"V")}}$`,
      `$${c} \\times q = ${c} \\times ${nt(q*1000,3)}\\ \\text{mV} = \\mathbf{${t(c*q,"V")}}$ : c'est l'écart au-dessus de $V_{min}$`,
      `$U_e = V_{min} + ${c}\\,q = ${nt(Vmin,1)} + ${nt(c*q,3)} = \\mathbf{${t(U,"V")}}$`]}; },
  "ard-volts"(){ const c = ent(50, 1000), v = c*5/1024; return {vals:{C:String(c), V:String(Math.round(v*1000)/1000), VT:nt(v,3)}}; },
  /* AOP */
  "gain-inv"(){ const R1 = rnd([1,2,2.2,4.7,5,10]), k = rnd([2,3,4,5,10]), R2 = Math.round(R1*k*10)/10; return {vals:{R1:nb(R1,1), R2:nb(R2,1), G:String(-k)}}; },
  "gain-ninv"(){ const R1 = rnd([1,2,5,10]), k = rnd([1,2,3,4,9]), R2 = R1*k; return {vals:{R1:String(R1), R2:String(R2), G:String(1+k)}}; },
  "sat"(){ const Ve = rnd([0.5,1,2,3]), k = rnd([5,10,20]), Vs = -k*Ve, sat = Math.abs(Vs) > 15;
    return {vals:{VE:nb(Ve,1), K:String(k), VS:String(sat ? -15 : Vs), VST:String(Vs)}}; },
  "somme"(){ const R = rnd([10,20]), V1 = rnd([0.5,1,1.5,2]), V2 = rnd([0.5,1,2,3]), R1 = rnd([10,20]), R2 = rnd([5,10,20]); const Vs = -R*(V1/R1 + V2/R2);
    return {vals:{R:String(R), R1:String(R1), R2:String(R2), V1:nb(V1,1), V2:nb(V2,1), VS:String(Math.round(Vs*1000)/1000)}}; },
  "td-ex2"(){ const R1 = rnd([1,2,4,5]), k = rnd([2,3,4,5]), R2 = R1*k, E = rnd([1,2,2.5,3]), w = rnd([100,200,300,400]);
    return {vals:{R1:R1+" kΩ", R2:R2+" kΩ", R1N:String(R1), R2N:String(R2), E:nb(E,1), W:String(w)}, rep:[-k, k*E, 180], corr:[
      `$A_v = -\\dfrac{R_2}{R_1} = -\\dfrac{${R2}}{${R1}} = \\mathbf{${-k}}$`,
      `$V_s = ${-k} \\times ${nt(E,1)}\\cos(${w}\\pi t) = ${nt(k*E,1)}\\cos(${w}\\pi t + \\pi)$ : amplitude $\\mathbf{${t(k*E,"V")}}$ (sous les 15 V, pas de saturation)`,
      "Le signe − inverse le signal : déphasage de $\\pi$, soit **180°** (opposition de phase)."]}; },
  "td-ex3a": () => { const R1 = rnd([1,2,5]), R2 = R1*rnd([5,10,20]); return {vals:{R1:R1+" kΩ", R2:R2+" kΩ"}, rep:[1, -R2/R1, -R2/R1], corr:[
      "Premier étage : suiveur, $A_1 = \\mathbf{1}$.", `Second étage : inverseur, $A_2 = -\\dfrac{R_2}{R_1} = -\\dfrac{${R2}}{${R1}} = \\mathbf{${-R2/R1}}$`,
      `$A_v = A_1 \\times A_2 = \\mathbf{${-R2/R1}}$`]}; },
  "td-ex3b": () => { const R1 = rnd([1,2,5]), R2 = R1*rnd([5,10,20]), R3 = rnd([10,47,100]); return {vals:{R1:R1+" kΩ", R2:R2+" kΩ", R3:R3+" kΩ"}, rep:[0, 1 + R2/R1], corr:[
      `$i^+ = 0$ : aucun courant dans $R_3$, donc aucune chute de tension, $V^+ = V_i$. $R_3$ ne joue **aucun rôle** : l'écart vaut $\\mathbf{0}$.`,
      `Non-inverseur : $A_v = 1 + \\dfrac{R_2}{R_1} = 1 + \\dfrac{${R2}}{${R1}} = \\mathbf{${1 + R2/R1}}$`]}; },
  "td-ex3c": () => { const R1 = rnd([1,2,5]), R2 = R1*rnd([5,10,20]), R3 = rnd([10,47,100]), k = R2/R1; return {vals:{R1:R1+" kΩ", R2:R2+" kΩ", R3:R3+" kΩ"}, rep:[1, -k, 1 + k, -k*(1 + k)], corr:[
      "Étage 1 : suiveur, $A_1 = \\mathbf{1}$.", `Étage 2 : inverseur, $A_2 = -\\dfrac{R_2}{R_1} = \\mathbf{${-k}}$`, `Étage 3 : non-inverseur, $A_3 = 1 + \\dfrac{R_2}{R_1} = \\mathbf{${1 + k}}$`,
      `$A_v = A_1 A_2 A_3 = 1 \\times (${-k}) \\times ${1 + k} = \\mathbf{${-k*(1 + k)}}$`]}; },
  /* filtres */
  "fc"(){ const R = rnd([1,2.2,4.7,10,22,47]), C = rnd([10,22,47,100,220]), fc = 1/(2*Math.PI*R*1e3*C*1e-9);
    return {vals:{R:nb(R,1), C:String(C), FC:String(Math.round(fc)), FCT:t(fc,"Hz")}}; },
  "db"(){ const G = rnd([0.1,0.5,0.707,1,2,5,10,100]), d = 20*Math.log10(G); return {vals:{G:nb(G,3), DB:String(Math.round(d*10)/10)}}; },
  "passe-bas": () => { const R = rnd([1,2,5,10]), k = rnd([1,2,5,10]), Rp = R*k, C = rnd([10,22,47,100]), fc = 1/(2*Math.PI*Rp*1e3*C*1e-9);
    return {vals:{R:R+" kΩ", Rp:Rp+" kΩ", C:C+" nF", RN:String(R), RPN:String(Rp), CN:String(C)}, rep:[k, 20*Math.log10(k), fc, 20*Math.log10(k) - 3], corr:[
      `En basse fréquence, $C$ est un circuit ouvert : il reste un inverseur de gain $\\dfrac{R'}{R} = \\dfrac{${Rp}}{${R}} = \\mathbf{${k}}$ (en valeur absolue)`,
      `$G_0 = 20\\log_{10}(${k}) = \\mathbf{${nt(20*Math.log10(k),1)}\\ \\text{dB}}$`,
      `$f_c = \\dfrac{1}{2\\pi R'C} = \\dfrac{1}{2\\pi \\times ${Rp}\\times 10^{3} \\times ${C}\\times 10^{-9}} = \\mathbf{${t(fc,"Hz")}}$`,
      `À $f_c$, le gain a perdu 3 dB : $${nt(20*Math.log10(k),1)} - 3 = \\mathbf{${nt(20*Math.log10(k) - 3,1)}\\ \\text{dB}}$`]}; }
};

/* ---------- labos (cours, sans XP) ---------- */
function slider(el, id, lib, min, max, step, val){
  const d = document.createElement("div"); d.className = "sl";
  d.innerHTML = `<label for="${id}"><span>${lib}</span><b></b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;
  el.appendChild(d); return d;
}
function choix(el, id, lib, opts){
  const d = document.createElement("div"); d.className = "sl";
  d.innerHTML = `<label for="${id}"><span>${lib}</span></label><select id="${id}">${opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>`;
  el.appendChild(d); return d.querySelector("select");
}
function coche(el, id, lib){
  const d = document.createElement("label"); d.className = "lab-coche"; d.innerHTML = `<input type="checkbox" id="${id}"> ${lib}`; el.appendChild(d); return d.querySelector("input");
}
const val = s => +s.querySelector("input").value;
const graphe = (W, H, body) => `<div class="schema"><svg class="circ" viewBox="0 0 ${W} ${H}" role="img" aria-label="Graphe">${body}</svg></div>`;
const pl = (pts, cls) => `<polyline class="${cls}" points="${pts.map(p => p.map(x => x.toFixed(1)).join(",")).join(" ")}"/>`;
function axesSVG(W, H, m, xr, yr, gx, gy, fx, fy){
  const X = x => m.l + (x - xr[0])/(xr[1] - xr[0])*(W - m.l - m.r), Y = y => H - m.b - (y - yr[0])/(yr[1] - yr[0])*(H - m.t - m.b);
  let s = "";
  gx.forEach(x => s += `<line class="gr" x1="${X(x)}" x2="${X(x)}" y1="${m.t}" y2="${H-m.b}"/><text class="val" x="${X(x)}" y="${H-m.b+15}" text-anchor="middle">${fx(x)}</text>`);
  gy.forEach(y => s += `<line class="gr" x1="${m.l}" x2="${W-m.r}" y1="${Y(y)}" y2="${Y(y)}"/><text class="val" x="${m.l-6}" y="${Y(y)+4}" text-anchor="end">${fy(y)}</text>`);
  const y0 = Y(Math.min(Math.max(0, yr[0]), yr[1]));
  s += `<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${y0}" y2="${y0}"/><line class="ax" x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H-m.b}"/>`;
  return {X, Y, s};
}
const labos = {
  /* 1 · oscilloscope : forme, amplitude, offset, période, rapport cyclique, échantillonnage, quantification */
  "oscillo"(el){
    el.innerHTML = `<div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-f"></div>`;
    const c = el.querySelector(".lab-ctl");
    const fo = choix(c, "lo-f", "Forme", [["sin","Sinusoïdal"],["tri","Triangulaire"],["carre","Rectangulaire (PWM)"],["scie","Dents de scie"]]);
    const sU = slider(c, "lo-u", "Amplitude $U$", .5, 5, .5, 2), sO = slider(c, "lo-o", "Offset", -3, 3, .5, 0), sT = slider(c, "lo-t", "Période $T$", 1, 20, 1, 5), sA = slider(c, "lo-a", "Rapport cyclique $\\alpha$", .05, .95, .05, .5);
    const ce = coche(c, "lo-e", "Échantillonner (signal discret)"), cq = coche(c, "lo-q", "Quantifier (signal numérique)");
    const maj = () => {
      const F = fo.value, U = val(sU), O = val(sO), T = val(sT), a = val(sA), ech = ce.checked, qu = cq.checked;
      sU.querySelector("b").textContent = nb(U,1) + " V"; sO.querySelector("b").textContent = nb(O,1) + " V"; sT.querySelector("b").textContent = T + " ms"; sA.querySelector("b").textContent = nb(a,2);
      sA.style.opacity = F === "carre" ? 1 : .35;
      const W = 520, H = 260, A = axesSVG(W, H, {l:40,r:10,t:10,b:24}, [0,40], [-8,8], [0,10,20,30,40], [-8,-4,0,4,8], x => x + " ms", y => y);
      const q = v => Math.round(v), Te = T/10; let s = A.s, p = [];
      for(let i = 0; i <= 800; i++){ const x = i/800*40; p.push([A.X(x), A.Y(sig(F, x, T, U, O, a))]); }
      if(!ech && !qu) s += pl(p, "tr");
      else { s += pl(p, "pt");
        if(ech) for(let x = 0; x <= 40; x += Te){ let v = sig(F, x, T, U, O, a); if(qu) v = q(v); s += `<line class="tr2" x1="${A.X(x)}" x2="${A.X(x)}" y1="${A.Y(0)}" y2="${A.Y(v)}"/><circle class="node" cx="${A.X(x)}" cy="${A.Y(v)}" r="3"/>`; }
        else { const p2 = []; for(let i = 0; i <= 800; i++){ const x = i/800*40; p2.push([A.X(x), A.Y(q(sig(F, x, T, U, O, a)))]); } s += pl(p2, "tr2"); } }
      const m = F === "carre" ? O + a*U : F === "scie" ? O + U/2 : O;
      s += `<line class="pt" x1="${A.X(0)}" x2="${A.X(40)}" y1="${A.Y(m)}" y2="${A.Y(m)}"/>`;
      el.querySelector(".lab-sch").innerHTML = graphe(W, H, s);
      const mt = {sin:`\\langle v\\rangle = \\text{offset} = ${nt(O,1)}\\ \\text{V}`, tri:`\\langle v\\rangle = \\text{offset} = ${nt(O,1)}\\ \\text{V}`,
        scie:`\\langle v\\rangle = \\text{offset} + \\frac{U}{2} = ${nt(m,2)}\\ \\text{V}`, carre:`\\langle v\\rangle = \\text{offset} + \\alpha U = ${nt(O,1)} + ${nt(a,2)} \\times ${nt(U,1)} = ${nt(m,2)}\\ \\text{V}`}[F];
      const z = el.querySelector(".lab-f");
      z.innerHTML = `$$F = \\frac{1}{T} = \\frac{1}{${T}\\times 10^{-3}\\ \\text{s}} = ${nt(1000/T,1)}\\ \\text{Hz}$$` + (F === "carre" ? `$$t_h = \\alpha T = ${nt(a,2)} \\times ${T} = ${nt(a*T,2)}\\ \\text{ms}$$` : "")
        + `$$${mt}$$<p>Valeur moyenne ${Math.abs(m) < .01 ? "nulle : le signal est <b>alternatif</b>" : "non nulle : <b>pas alternatif</b> (il a une composante continue)"}. Nature : <b>${ech ? "discret" : "continu"} et ${qu ? "numérique" : "analogique"}</b>.</p>`;
      tex(z);
    };
    el.querySelectorAll("input, select").forEach(i => i.oninput = maj); maj(); tex(c);
  },
  /* 3 · CAN : quantum, code (partie entière / arrondi), binaire, CNA */
  "can"(el){
    el.innerHTML = `<div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-bits"></div><div class="lab-f"></div>`;
    const c = el.querySelector(".lab-ctl");
    const sN = slider(c, "lc-n", "Nombre de bits $N$", 2, 10, 1, 3), sm = slider(c, "lc-m", "$V_{min}$", 0, 2, .5, 0), sM = slider(c, "lc-M", "$V_{max}$", 3, 10, 1, 5), sU = slider(c, "lc-u", "Tension d'entrée $U_e$", 0, 1, .001, .42);
    const maj = () => {
      const N = val(sN), vmin = val(sm), vmax = val(sM), u = vmin + val(sU)*(vmax - vmin), n = 2**N, q = (vmax - vmin)/n, r = (u - vmin)/q;
      const cf = Math.min(n - 1, Math.floor(r + 1e-9)), cr = Math.min(n - 1, Math.round(r));
      sN.querySelector("b").textContent = N + " bits"; sm.querySelector("b").textContent = nb(vmin,1) + " V"; sM.querySelector("b").textContent = vmax + " V"; sU.querySelector("b").textContent = nb(u,3) + " V";
      const W = 520, H = 260, A = axesSVG(W, H, {l:44,r:12,t:12,b:24}, [vmin, vmax], [0, n], [vmin, (vmin + vmax)/2, vmax], N <= 4 ? [...Array(n + 1).keys()] : [0, n/2, n], x => nb(x,2), y => y);
      const p = []; for(let k = 0; k < n; k++) p.push([A.X(vmin + k*q), A.Y(k)], [A.X(vmin + (k + 1)*q), A.Y(k)]);
      let s = A.s + pl(p, "tr") + `<line class="pt" x1="${A.X(u)}" x2="${A.X(u)}" y1="${A.Y(0)}" y2="${A.Y(cf)}"/><line class="pt" x1="${A.X(vmin)}" x2="${A.X(u)}" y1="${A.Y(cf)}" y2="${A.Y(cf)}"/><circle class="node" cx="${A.X(u)}" cy="${A.Y(cf)}" r="4"/>`;
      el.querySelector(".lab-sch").innerHTML = graphe(W, H, s);
      const b = cf.toString(2).padStart(N, "0");
      el.querySelector(".lab-bits").innerHTML = `<div class="bits">${[...b].map((x, i) => `<span class="${x === "1" ? "un" : ""}" title="${i === 0 ? "MSB" : i === N - 1 ? "LSB" : ""}">${x}</span>`).join("")}</div><small class="vide-txt">MSB à gauche · LSB à droite</small>`;
      const qs = q < 0.1 ? `${nt(q*1000,2)}\\ \\text{mV}` : `${nt(q,3)}\\ \\text{V}`, z = el.querySelector(".lab-f");
      z.innerHTML = `$$q = \\frac{V_{max} - V_{min}}{2^N} = \\frac{${nt(vmax,1)} - ${nt(vmin,1)}}{2^{${N}}} = ${qs}$$`
        + `$$\\frac{U_e - V_{min}}{q} = \\frac{${nt(u,3)} - ${nt(vmin,1)}}{${nt(q,5)}} = ${nt(r,2)}$$`
        + `<p>Code : partie entière <b>${cf}</b>${cr !== cf ? ` · arrondi <b>${cr}</b>` : ""} · en binaire <b>${b}</b></p>`
        + `<p>CNA (sens inverse) : $U = V_{min} + \\text{code} \\times q$</p>$$U = ${nt(vmin,1)} + ${cf} \\times ${nt(q,5)} = ${nt(vmin + cf*q,3)}\\ \\text{V}$$`;
      tex(z);
    };
    el.querySelectorAll("input").forEach(i => i.oninput = maj); maj(); tex(c);
  },
  /* 4-5 · montages à AOP : schéma, Ve et Vs, saturation à ±15 V, calcul du gain */
  "aop"(el, o){
    el.innerHTML = `<div class="lab-sch2"></div><div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-f"></div>`;
    const c = el.querySelector(".lab-ctl");
    const mo = choix(c, "la-m", "Montage", [["inv","Inverseur"],["ninv","Non-inverseur"],["suiv","Suiveur"],["comp","Comparateur (sans contre-réaction)"]]);
    const s1 = slider(c, "la-1", "$R_1$", 1, 20, 1, 2), s2 = slider(c, "la-2", "$R_2$", 1, 100, 1, 6), sE = slider(c, "la-e", "Amplitude de $V_e$", .5, 10, .5, 2);
    const maj = () => {
      const m = mo.value, R1 = val(s1), R2 = val(s2), E = val(sE), Vcc = 15;
      s1.querySelector("b").textContent = R1 + " kΩ"; s2.querySelector("b").textContent = R2 + " kΩ"; sE.querySelector("b").textContent = nb(E,1) + " V";
      [s1, s2].forEach(s => s.style.opacity = m === "inv" || m === "ninv" ? 1 : .35);
      const G = {inv:-R2/R1, ninv:1 + R2/R1, suiv:1, comp:1e5}[m];
      el.querySelector(".lab-sch2").innerHTML = o.SV.rendre({modele:{inv:"inverseur", ninv:"non-inverseur", suiv:"suiveur", comp:"comparateur"}[m], vals:{R1:R1 + " kΩ", R2:R2 + " kΩ", ref:"0 V"}});
      const W = 520, H = 240, tm = 2/150*1000, A = axesSVG(W, H, {l:36,r:10,t:10,b:22}, [0, tm], [-17, 17], [0, tm/2, tm], [-15, 0, 15], x => nb(x,1) + " ms", y => y);
      const pe = [], ps = []; let sat = false;
      for(let i = 0; i <= 600; i++){ const x = i/600*tm, ve = E*Math.cos(300*Math.PI*x/1000); let vs = G*ve; if(Math.abs(vs) > Vcc){ vs = Math.sign(vs)*Vcc; sat = true; } pe.push([A.X(x), A.Y(ve)]); ps.push([A.X(x), A.Y(vs)]); }
      el.querySelector(".lab-sch").innerHTML = graphe(W, H, A.s + `<line class="pt" x1="${A.X(0)}" x2="${A.X(tm)}" y1="${A.Y(15)}" y2="${A.Y(15)}"/><line class="pt" x1="${A.X(0)}" x2="${A.X(tm)}" y1="${A.Y(-15)}" y2="${A.Y(-15)}"/>` + pl(pe, "tr2") + pl(ps, "tr")
        + `<text class="val" x="${W-14}" y="22" text-anchor="end">— V_e (violet) · V_s (accent)</text>`);
      const k = Math.abs(G); let h = "";
      if(m === "inv") h = `$$A_v = \\frac{V_s}{V_e} = -\\frac{R_2}{R_1} = -\\frac{${R2}}{${R1}} = -${nt(k,2)}$$`;
      if(m === "ninv") h = `$$A_v = 1 + \\frac{R_2}{R_1} = 1 + \\frac{${R2}}{${R1}} = ${nt(k,2)}$$`;
      if(m === "suiv") h = `$$V_s = V_e \\quad (A_v = 1)$$`;
      if(m === "comp") h = `$$V_s = \\begin{cases} +V_{cc} & \\text{si } \\varepsilon > 0 \\\\ -V_{cc} & \\text{si } \\varepsilon < 0 \\end{cases}$$<p>Pas de contre-réaction : l'AOP sature, il fonctionne en <b>commutation</b>.</p>`;
      if(m !== "comp") h += `$$V_s(t) = ${G < 0 ? "-" : ""}${nt(k,2)} \\times ${nt(E,1)}\\cos(300\\pi t) = ${nt(k*E,2)}\\cos(300\\pi t${G < 0 ? " + \\pi" : ""})$$<p>Déphasage <b>${G < 0 ? "π (180°)" : "0"}</b>.${k*E > Vcc ? ` <b>Saturé</b> : ${nb(k*E,2)} V dépasse 15 V, la sortie est écrêtée.` : " Régime <b>linéaire</b>."}</p>`;
      const z = el.querySelector(".lab-f"); z.innerHTML = h; tex(z);
    };
    el.querySelectorAll("input, select").forEach(i => i.oninput = maj); maj(); tex(c);
  },
  /* 6 · filtres d'ordre 1 : gain en dB, fc, −3 dB */
  "filtre"(el, o){
    el.innerHTML = `<div class="lab-sch2"></div><div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-f"></div>`;
    const c = el.querySelector(".lab-ctl");
    const ty = choix(c, "lf-t", "Filtre", [["pb","Passe-bas d'ordre 1"],["ph","Passe-haut d'ordre 1"]]);
    const sR = slider(c, "lf-r", "$R$", 1, 100, 1, 10), sP = slider(c, "lf-p", "$R'$", 1, 100, 1, 10), sC = slider(c, "lf-c", "$C$", 1, 100, 1, 10);
    const maj = () => {
      const pb = ty.value === "pb", R = val(sR)*1e3, Rp = val(sP)*1e3, C = val(sC)*1e-9, fc = 1/(2*Math.PI*Rp*C), K = pb ? Rp/R : R/Rp, g0 = 20*Math.log10(K);
      sR.querySelector("b").textContent = R/1e3 + " kΩ"; sP.querySelector("b").textContent = Rp/1e3 + " kΩ"; sC.querySelector("b").textContent = Math.round(C*1e9) + " nF";
      el.querySelector(".lab-sch2").innerHTML = o.SV.rendre({modele:pb ? "passe-bas" : "passe-haut", vals:{R:f(R,"Ω"), Rp:f(Rp,"Ω"), C:f(C,"F")}});
      const H = fr => pb ? K/Math.sqrt(1 + (fr/fc)**2) : K*(fr/fc)/Math.sqrt(1 + (fr/fc)**2);
      const W = 520, Hh = 260, A = axesSVG(W, Hh, {l:44,r:10,t:10,b:24}, [1, 6], [g0 - 40, g0 + 8], [1,2,3,4,5,6], [Math.round(g0 - 40), Math.round(g0 - 20), Math.round(g0)], x => "10^" + x + " Hz", y => y + " dB");
      const p = []; for(let i = 0; i <= 400; i++){ const lx = 1 + 5*i/400; p.push([A.X(lx), A.Y(Math.max(g0 - 40, 20*Math.log10(H(10**lx))))]); }
      const lf = Math.log10(fc);
      el.querySelector(".lab-sch").innerHTML = graphe(W, Hh, A.s + `<line class="pt" x1="${A.X(1)}" x2="${A.X(6)}" y1="${A.Y(g0 - 3)}" y2="${A.Y(g0 - 3)}"/>`
        + (lf > 1 && lf < 6 ? `<line class="pt" x1="${A.X(lf)}" x2="${A.X(lf)}" y1="10" y2="${Hh-24}"/><text class="val" x="${A.X(lf)+4}" y="22">fc</text>` : "") + pl(p, "tr"));
      const z = el.querySelector(".lab-f");
      z.innerHTML = `$$\\underline{H}(j\\omega) = ${pb ? "-\\frac{R'/R}{1 + jR'C\\omega}" : "-\\frac{R}{R'}\\cdot\\frac{jR'C\\omega}{1 + jR'C\\omega}"}$$`
        + `$$f_c = \\frac{1}{2\\pi R'C} = ${t(fc,"Hz")}$$$$|H|_{max} = ${pb ? "\\frac{R'}{R}" : "\\frac{R}{R'}"} = ${nt(K,2)}\\ (${nt(g0,1)}\\ \\text{dB})$$`
        + `<p>Laisse passer les fréquences <b>${pb ? "inférieures" : "supérieures"} à $f_c$</b>. À $f_c$, le gain vaut le maximum − 3 dB (pointillés).</p>`;
      tex(z);
    };
    el.querySelectorAll("input, select").forEach(i => i.oninput = maj); maj(); tex(c);
  }
};

window.EXT_MODULE = {schemas, generateurs, labos};
})();
