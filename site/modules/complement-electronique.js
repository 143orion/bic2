/* =====================================================================
   BIC2.exe — extension du module « Complément électronique »
   Chargée par module.html quand liste.json a ext:true. Fournit :
   - schemas    : modèles de circuits (format d'éléments de module.html)
   - generateurs: variantes « mêmes questions, autres valeurs » → {vals, rep, corr}
   - labos      : petits labos interactifs du mode Classique (0 XP)
   ===================================================================== */
(function(){
"use strict";
/* ---------- formats : unités SI avec préfixes, version texte et LaTeX ---------- */
const PFX = [[1e6,"M"],[1e3,"k"],[1,""],[1e-3,"m"],[1e-6,"µ"]];
function parts(v, u){
  const a = Math.abs(v); const p = u === "Ω" && a >= 0.1 && a < 1 ? [1,""] : PFX.find(([m]) => a >= m*0.9995) || PFX[PFX.length-1];   /* 0,5 Ω plutôt que 500 mΩ */
  const n = v/p[0], s = (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"");
  return [s, p[1]];
}
const f = (v, u) => { const [s, p] = parts(v, u); return s.replace(".", ",") + " " + p + u; };          /* 4,7 kΩ */
const t = (v, u) => { const [s, p] = parts(v, u); const pre = p === "" ? "" : p === "µ" ? "\\mu" : "\\text{" + p + "}"; return s.replace(".", "{,}") + "\\ " + pre + (u === "Ω" ? "\\Omega" : "\\text{" + u + "}"); };   /* 4{,}7\ \text{k}\Omega */
/* valeurs « calculables de tête » : résistances, tensions et courants ronds */
const MAN = [1,1.5,2,2.5,3,4,5,6,8], EV = [5,6,8,9,10,12,15,20,24], IA = [2,4,5,10,20,30,50].map(x => x*1e-3);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const rR = (dec = [100,1000]) => Math.round(rnd(MAN)*rnd(dec)*100)/100;
/* tirage propre : les réponses (rep) et les valeurs intermédiaires des indices (chk) doivent tomber juste, avec le bon préfixe.
   Niveau 0 : entier ou 2 chiffres significatifs (6 V, 250 Ω, 2,5 mA, 37 V) · 1 : une décimale (12,5 V) · 2 : deux (1,25 V).
   On retire au sort jusqu'à trouver le niveau le plus simple possible. */
const mant = v => { const a = Math.abs(v), p = PFX.find(([m]) => a >= m*0.9995) || PFX[PFX.length-1]; return a/p[0]; };
const entier = x => Math.abs(x - Math.round(x)) < 1e-6*Math.max(1, x);
const juste = (v, niv) => { if(Math.abs(v) < 1e-12) return true; const m = mant(v);
  if(niv === 0){ if(entier(m)) return true; for(let j = 1; j <= 2; j++) if(entier(m*Math.pow(10, j))) return String(Math.round(m*Math.pow(10, j))).replace(/0+$/, "").length <= 2; return false; }
  return entier(m*Math.pow(10, niv)); };
const propre = gen => () => { let r; for(let n = 0; n < 4000; n++){ r = gen(); const niv = n < 1500 ? 0 : n < 3000 ? 1 : 2; if(r.rep.concat(r.chk || []).every(v => juste(v, niv))) break; } delete r.chk; return r; };
const par = (a, b) => a*b/(a+b);

/* ---------- schémas ---------- */
const nodesAB = (x, y1, y2, a = "A", b = "B") => [["n",x,y1],["n",x,y2],["t",x+12,y1+6,a,{a:"start"}],["t",x+12,y2+6,b,{a:"start"}]];
const schemas = {
  "diviseur": v => ({vb:"0 -14 370 214", el:[
    ["S",50,170,50,40,{id:"E",label:"E",val:v.E}],["w",[[50,40],[90,40]]],["R",90,40,200,40,{id:"R1",label:"R1",val:v.R1}],["w",[[200,40],[270,40]]],
    ["R",270,40,270,170,{id:"R2",label:"R2",val:v.R2,lp:"left"}],["w",[[270,170],[50,170]]],["n",270,40],["n",270,170],["w",[[270,40],[315,40]]],["w",[[270,170],[315,170]]],
    ["a",305,160,305,52,"V2",330,110],["a",180,64,110,64,"V1",145,84],["a",212,24,250,24,"I",231,12]]}),
  "thev-L": v => ({vb:"-34 0 474 215", el:[
    ["S",45,170,45,40,{id:"E",label:v.src === "I" ? "I" : "E",val:v.E,kind:v.src === "I" ? "I" : "E"}],["w",[[45,40],[70,40]]],["R",70,40,170,40,{id:"R1",label:"R1",val:v.R1}],["w",[[170,40],[250,40]]],["n",215,40],
    ["R",215,40,215,170,{id:"R2",label:"R2",val:v.R2,lp:"right"}],["R",250,40,340,40,{id:"R3",label:"R3",val:v.R3}],["w",[[340,40],[380,40]]],["n",380,40],
    ["R",380,40,380,170,{id:"R",label:"R",val:v.R,lp:"right"}],["w",[[380,170],[45,170]]],["n",215,170],["n",380,170],["t",394,34,"B",{a:"start"}],["t",215,197,"M"]]}),
  "thev-eq": v => ({vb:"-34 0 340 215", el:[
    ["S",40,170,40,40,{id:"Eth",label:"Eth",val:v.Eth}],["w",[[40,40],[80,40]]],["R",80,40,190,40,{id:"Rth",label:"Rth",val:v.Rth}],["w",[[190,40],[250,40]]],["w",[[40,170],[250,170]]]]
    .concat(v.R ? [["R",250,40,250,170,{id:"R",label:"R",val:v.R,lp:"right"}]] : []).concat(nodesAB(250,40,170,v.A || "A",v.B || "B"))}),
  "norton-eq": v => ({vb:"-34 0 340 215", el:[
    ["S",40,170,40,40,{id:"IN",label:"I_N",val:v.IN,kind:"I"}],["w",[[40,40],[250,40]]],["w",[[40,170],[250,170]]],["R",130,40,130,170,{id:"RN",label:"R_N",val:v.RN,lp:"right"}],["n",130,40],["n",130,170]]
    .concat(v.R ? [["R",250,40,250,170,{id:"R",label:"R",val:v.R,lp:"right"}]] : []).concat(nodesAB(250,40,170,v.A || "A",v.B || "B"))}),
  "par3": v => ({vb:"0 0 470 210", el:[
    ["S",50,170,50,40,{id:"E",label:"E",val:v.E}],["w",[[50,40],[400,40]]],["w",[[50,170],[400,170]]],
    ...[[170,"R1"],[285,"R2"],[400,"R3"]].flatMap(([x,l]) => [["R",x,40,x,170,{id:l,label:l,val:v[l],lp:"right"}],["n",x,40],["n",x,170],["a",x-12,52,x-12,74,"I"+l.slice(1),x-26,68]]),
    ["a",70,26,110,26,"I",90,16],["t",34,44,"A"],["t",34,176,"M"]]}),
  "serie-I": v => ({vb:"20 0 400 225", el:[
    ["S",80,180,80,40,{id:"I",label:"I",val:v.I,kind:"I"}],["w",[[80,40],[110,40]]],["R",110,40,270,40,{id:"R1",label:"R1",val:v.R1}],["w",[[270,40],[300,40]]],
    ["R",300,40,300,180,{id:"R2",label:"R2",val:v.R2,lp:"right"}],["w",[[300,180],[270,180]]],["R",270,180,110,180,{id:"R3",label:"R3",val:v.R3,lp:"bottom"}],["w",[[110,180],[80,180]]],
    ["n",80,40],["n",300,40],["n",300,180],["n",80,180],["t",70,30,"A"],["t",312,30,"B"],["t",312,198,"C"],["t",66,198,"M"],
    ["a",230,62,150,62,"V1",190,80],["a",350,160,350,60,"V2",368,112],["a",230,160,150,160,"V3",190,152]]}),
  "td2-ex1": v => ({vb:"-34 0 520 235", el:[
    ["S",40,200,40,80,{id:"E",label:"E",val:v.E}],["w",[[40,80],[60,80]]],["R",60,80,150,80,{id:"R1",label:"R1",val:v.R1}],["w",[[150,80],[180,80]]],["n",180,80],
    ["R",180,80,270,80,{id:"R3",label:"R3",val:v.R3,lp:"bottom"}],["w",[[270,80],[290,80]]],["R",290,80,380,80,{id:"R4",label:"R4",val:v.R4,lp:"bottom"}],["w",[[380,80],[440,80]]],["n",410,80],
    ["w",[[180,80],[180,30],[250,30]]],["R",250,30,340,30,{id:"R2",label:"R2",val:v.R2}],["w",[[340,30],[410,30],[410,80]]],
    ["R",440,80,440,200,{id:"R5",label:"R5",val:v.R5,lp:"right"}],["w",[[440,200],[40,200]]],["t",440,224,"M"]]}),
  "gen-reel": v => ({vb:"-34 0 380 215", el:[
    ["S",40,170,40,40,{id:"E",label:"E",val:v.E}],["w",[[40,40],[70,40]]],["R",70,40,170,40,{id:"RG",label:"R_G",val:v.RG}],["w",[[170,40],[260,40]]],
    ["R",260,40,260,170,{id:"R",label:"R",val:v.R,lp:"right"}],["w",[[260,170],[40,170]]],["n",260,40],["n",260,170],["a",320,160,320,52,"U",335,110],["a",190,26,230,26,"I",210,14]]}),
  "deux-gen": v => ({vb:"-40 0 480 225", el:[
    ["S",40,190,40,60,{id:"E1",label:"E1",val:v.E1}],["w",[[40,60],[60,60]]],["R",60,60,140,60,{id:"r1",label:"r1",val:v.r1}],["w",[[140,60],[160,60]]],
    ["S",235,60,160,60,{id:"E2",label:"E2",val:v.E2}],["w",[[235,60],[255,60]]],["R",255,60,335,60,{id:"r2",label:"r2",val:v.r2}],["w",[[335,60],[380,60]]],
    ["R",380,60,380,190,{id:"R",label:"R",val:v.R,lp:"right"}],["w",[[380,190],[40,190]]],["t",100,214,"D₁ = (E₁, r₁)",{cls:"val"}],["t",245,24,"D₂ = (E₂, r₂)",{cls:"val"}]]}),
  "gen-par2": v => ({vb:"-34 0 470 215", el:[
    ["S",45,170,45,40,{id:"E",label:"E",val:v.E}],["w",[[45,40],[70,40]]],["R",70,40,170,40,{id:"r",label:"r",val:v.r}],["w",[[170,40],[400,40]]],
    ["n",250,40],["n",250,170],["R",250,40,250,170,{id:"R1",label:"R1",val:v.R1,lp:"right"}],["R",360,40,360,170,{id:"R2",label:"R2",val:v.R2,lp:"right"}],["w",[[360,170],[45,170]]],
    ["w",[[360,40],[400,40]]],["w",[[360,170],[400,170]]],["a",190,26,230,26,"I",210,14],["a",412,160,412,52,"U",426,110],["t",250,26,"P"],["t",250,196,"N"]]}),
  "td3-ex1": v => ({vb:"0 0 460 238", el:[
    ["w",[[50,50],[50,130]]],["w",[[50,50],[70,50]]],["S",70,50,170,50,{id:"I1",label:"I1",val:v.I1,kind:"I"}],["w",[[170,50],[190,50]]],
    ["w",[[50,130],[70,130]]],["R",70,130,170,130,{id:"R1",label:"R1",val:v.R1,lp:"bottom"}],["w",[[170,130],[190,130]]],["w",[[190,50],[190,130]]],
    ["w",[[190,90],[240,90]]],["n",190,90],["n",240,90],["w",[[240,50],[240,130]]],["w",[[240,50],[260,50]]],["R",260,50,360,50,{id:"R2",label:"R2",val:v.R2}],["w",[[360,50],[380,50]]],
    ["w",[[240,130],[260,130]]],["S",360,130,260,130,{id:"I2",label:"I2",val:v.I2,kind:"I",lp:"bottom"}],["w",[[360,130],[380,130]]],["w",[[380,50],[380,130]]],
    ["w",[[380,90],[420,90],[420,210],[310,210]]],["R",310,210,150,210,{id:"R",label:"R",val:v.R,lp:"bottom"}],["w",[[150,210],[20,210],[20,90],[50,90]]],
    ["n",50,90],["n",380,90],["t",36,82,"A"],["t",200,82,"C"],["t",232,82,"D"],["t",396,82,"B"],["a",60,198,100,198,"I",80,190]]}),
  "millman3": v => ({vb:"-40 0 470 215", el:[
    ["S",40,170,40,40,{id:"E1",label:"E1",val:v.E1}],["w",[[40,40],[60,40]]],["R",60,40,160,40,{id:"R1",label:"R1",val:v.R1}],["w",[[160,40],[240,40]]],["n",200,40],
    ["R",200,40,200,170,{id:"R3",label:"R3",val:v.R3,lp:"right"}],["R",240,40,340,40,{id:"R2",label:"R2",val:v.R2}],["w",[[340,40],[370,40]]],
    ["S",370,170,370,40,{id:"E2",label:"E2",val:v.E2,lp:"right"}],["w",[[370,170],[40,170]]],["n",200,170],["t",200,26,"A"],["t",200,196,"M"]]}),
  "td3-ex3": v => ({vb:"-40 0 400 215", el:[
    ["S",40,170,40,40,{id:"E1",label:"E1",val:v.E1}],["w",[[40,40],[60,40]]],["R",60,40,160,40,{id:"R1",label:"R1",val:v.R1}],["w",[[160,40],[300,40]]],["n",220,40],
    ["S",220,170,220,40,{id:"I2",label:"I2",val:v.I2,kind:"I",lp:"right"}],["R",300,40,300,170,{id:"R",label:"R",val:v.R,lp:"right"}],["w",[[300,170],[40,170]]],["n",220,170],["t",220,26,"A"],["t",220,196,"M"]]}),
  "td3-ex4": v => ({vb:"-40 0 480 215", el:[
    ["S",40,170,40,40,{id:"I1",label:"I1",val:v.I1,kind:"I"}],["w",[[40,40],[150,40]]],["n",120,40],["R",120,40,120,170,{id:"R1",label:"R1",val:v.R1,lp:"right"}],
    ["S",150,40,230,40,{id:"E2",label:"E2",val:v.E2}],["w",[[230,40],[250,40]]],["R",250,40,340,40,{id:"R2",label:"R2",val:v.R2}],["w",[[340,40],[380,40]]],
    ["R",380,40,380,170,{id:"Rx",label:"R_x",val:v.Rx,lp:"right"}],["w",[[380,170],[40,170]]],["n",120,170],["t",120,196,"M"]]}),
  "td1-ex1": () => ({vb:"30 0 330 215", el:[
    ["w",[[50,50],[120,50]]],["n",100,50],["R",120,50,220,50,{label:"R1"}],["w",[[220,50],[300,50]]],["n",260,50],["R",260,50,260,170,{label:"R2",lp:"left"}],
    ["w",[[300,170],[220,170]]],["n",260,170],["R",220,170,120,170,{label:"R3",lp:"bottom"}],["w",[[120,170],[100,170],[100,50]]],
    ["a",55,38,85,38,"I1",70,28],["a",104,38,118,38,"I4",112,28],["a",270,38,300,38,"I3",285,28],["a",270,182,300,182,"I2",285,200],
    ["a",275,160,275,135,"I5",292,150],["a",88,130,88,95,"I6",74,115]]}),
  "td1-ex3": () => ({vb:"0 5 460 200", el:[
    ["w",[[40,40],[60,40]]],["R",60,40,180,40,{}],["w",[[180,40],[260,40]]],["R",260,40,380,40,{}],["w",[[380,40],[420,40]]],
    ["R",40,40,40,160,{}],["R",220,40,220,160,{}],["R",400,40,400,160,{}],["w",[[20,160],[440,160]]],
    ["n",40,40],["n",220,40],["n",400,40],["n",40,160],["n",220,160],["n",400,160],["t",40,26,"A"],["t",220,26,"D"],["t",400,26,"B"],["t",40,186,"E"],["t",220,186,"C"],["t",400,186,"F"]]}),
  "td1-ex4": () => ({vb:"60 0 470 275", el:[
    ["w",[[80,40],[160,40]]],["R",160,40,260,40,{}],["w",[[260,40],[320,40]]],["R",320,40,420,40,{}],["w",[[420,40],[460,40]]],
    ["R",140,40,140,170,{}],["R",300,40,300,170,{}],["R",460,40,460,170,{}],["w",[[80,170],[460,170]]],
    ["w",[[200,170],[200,220],[240,220]]],["R",240,220,340,220,{}],["w",[[340,220],[380,220],[380,170]]],
    ["n",140,40],["n",300,40],["n",460,40],["n",140,170],["n",200,170],["n",300,170],["n",380,170],["n",460,170],
    ["a",250,18,170,18,"U2",210,12],["a",410,18,330,18,"U5",370,12],["a",112,150,112,60,"U3",96,108],["a",232,150,290,72,"U1",248,100],["a",490,60,490,150,"U4",508,108],["a",240,248,340,248,"U6",290,266]]})
};

/* ---------- générateurs : {vals (textes du schéma/énoncé), rep (réponse de chaque étape), corr (corrigé LaTeX)} ---------- */
const generateurs = {
  "thev-L": propre(() => {
    const E = rnd(EV), R1 = rR(), R2 = rR(), R3 = rR(), R = rR();
    const Eth = E*R2/(R1+R2), p = par(R1,R2), Rth = p + R3, U = Eth*R/(Rth+R);
    return {chk:[p], vals:{E:f(E,"V"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω"),R:f(R,"Ω"),R12:f(R1+R2,"Ω"),RP:f(p,"Ω"),ETH:f(Eth,"V"),RTR:f(Rth+R,"Ω")}, rep:[Eth, Rth, U], corr:[
      `$E_{th} = E\\,\\dfrac{R_2}{R_1+R_2} = ${t(E,"V")} \\times \\dfrac{${t(R2,"Ω")}}{${t(R1+R2,"Ω")}} = \\mathbf{${t(Eth,"V")}}$`,
      `$R_{th} = (R_1 \\parallel R_2) + R_3 = ${t(p,"Ω")} + ${t(R3,"Ω")} = \\mathbf{${t(Rth,"Ω")}}$`,
      `$U_R = E_{th}\\,\\dfrac{R}{R_{th}+R} = ${t(Eth,"V")} \\times \\dfrac{${t(R,"Ω")}}{${t(Rth+R,"Ω")}} = \\mathbf{${t(U,"V")}}$`]};
  }),
  "norton-L": propre(() => {
    const I = rnd(IA), R1 = rR(), R2 = rR(), R3 = rR(), R = rR();
    const IN = I*R2/(R2+R3), RN = R2+R3, U = IN*par(RN,R);
    return {chk:[par(RN,R)], vals:{E:f(I,"A"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω"),R:f(R,"Ω"),R23:f(RN,"Ω"),RNR:f(par(RN,R),"Ω")}, rep:[IN, RN, U], corr:[
      `B et M en court-circuit : $R_2$ et $R_3$ en parallèle se partagent $I$ (diviseur de courant) : $I_N = I\\,\\dfrac{R_2}{R_2+R_3} = \\mathbf{${t(IN,"A")}}$ ($R_1$, en série avec la source de courant, ne change rien)`,
      `Source de courant éteinte = circuit ouvert : $R_1$ ne compte plus, $R_N = R_2 + R_3 = \\mathbf{${t(RN,"Ω")}}$`,
      `$U_{BM} = I_N\\,(R_N \\parallel R) = ${t(IN,"A")} \\times ${t(par(RN,R),"Ω")} = \\mathbf{${t(U,"V")}}$`]};
  }),
  "par3": propre(() => {
    const E = rnd(EV), R1 = rR(), R2 = rR(), R3 = rR();
    const I1 = E/R1, I2 = E/R2, I3 = E/R3, I = I1+I2+I3;
    return {vals:{E:f(E,"V"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω")}, rep:[I1, I2, I3, I], corr:[
      `Chaque résistance a $E$ à ses bornes : $I_1 = E/R_1 = \\mathbf{${t(I1,"A")}}$`, `$I_2 = E/R_2 = \\mathbf{${t(I2,"A")}}$`, `$I_3 = E/R_3 = \\mathbf{${t(I3,"A")}}$`,
      `Loi des nœuds : $I = I_1 + I_2 + I_3 = \\mathbf{${t(I,"A")}}$`]};
  }),
  "serie-I": propre(() => {
    const I = rnd(IA), R1 = rR(), R2 = rR(), R3 = rR();
    return {vals:{I:f(I,"A"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω")}, rep:[R1*I, R2*I, R3*I, (R1+R2+R3)*I], corr:[
      `Une seule maille : le même courant $I$ partout. $V_1 = R_1 I = \\mathbf{${t(R1*I,"V")}}$`, `$V_2 = R_2 I = \\mathbf{${t(R2*I,"V")}}$`, `$V_3 = R_3 I = \\mathbf{${t(R3*I,"V")}}$`,
      `Loi des mailles : $U_{AM} = V_1 + V_2 + V_3 = \\mathbf{${t((R1+R2+R3)*I,"V")}}$`]};
  }),
  "gen-par2": propre(() => {
    const E = rnd([4.5,6,9,12,15,18]), r = rnd([0.5,1,1.5,2]), R1 = rnd([2,3,4,6,8,10,12,15,20]), R2 = rnd([2,3,4,6,8,10,12,15,20]);
    const Rp = par(R1,R2), I = E/(r+Rp), U = E - r*I;
    return {chk:[Rp, r*I], vals:{E:f(E,"V"),r:f(r,"Ω"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),RP:f(Rp,"Ω"),RT:f(r+Rp,"Ω"),UR:f(r*I,"V")}, rep:[I, U, U/R1, U/R2], corr:[
      `$R_1 \\parallel R_2 = ${t(Rp,"Ω")}$ puis $I = \\dfrac{E}{r + R_1\\parallel R_2} = \\mathbf{${t(I,"A")}}$`, `$U = E - rI = \\mathbf{${t(U,"V")}}$`,
      `$I_1 = U/R_1 = \\mathbf{${t(U/R1,"A")}}$`, `$I_2 = U/R_2 = \\mathbf{${t(U/R2,"A")}}$`]};
  }),
  "gen-reel": propre(() => {
    const E = rnd([6,9,12,15,18,24]), RG = rnd([0.5,1,1.5,2]), R = rnd([1,2,2.5,3,4,5,6,8,10]);
    const I = E/(RG+R), U = R*I;
    return {chk:[RG*I], vals:{E:f(E,"V"),RG:f(RG,"Ω"),R:f(R,"Ω"),RT:f(RG+R,"Ω"),UG:f(RG*I,"V")}, rep:[I, U, U*I], corr:[
      `Une seule maille : $I = \\dfrac{E}{R_G + R} = \\mathbf{${t(I,"A")}}$`, `$U = E - R_G I = R\\,I = \\mathbf{${t(U,"V")}}$`, `$P = U\\,I = \\mathbf{${t(U*I,"W")}}$`]};
  }),
  "millman3": propre(() => {
    const E1 = rnd(EV), E2 = rnd(EV), R1 = rR([10,100]), R2 = rR([10,100]), R3 = rR([10,100]);
    const U1 = E1*par(R2,R3)/(R1+par(R2,R3)), U2 = E2*par(R1,R3)/(R2+par(R1,R3)), U = U1 + U2;
    return {chk:[par(R2,R3), par(R1,R3)], vals:{E1:f(E1,"V"),E2:f(E2,"V"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω"),P23:f(par(R2,R3),"Ω"),P13:f(par(R1,R3),"Ω")}, rep:[U1, U2, U], corr:[
      `$E_2$ éteinte (fil) : $R_2 \\parallel R_3 = ${t(par(R2,R3),"Ω")}$, diviseur : $U_1 = E_1\\,\\dfrac{R_2\\parallel R_3}{R_1 + R_2\\parallel R_3} = \\mathbf{${t(U1,"V")}}$`,
      `$E_1$ éteinte : $U_2 = E_2\\,\\dfrac{R_1\\parallel R_3}{R_2 + R_1\\parallel R_3} = \\mathbf{${t(U2,"V")}}$`,
      `$U_{AM} = U_1 + U_2 = \\mathbf{${t(U,"V")}}$ (Millman donne pareil : $\\dfrac{E_1/R_1 + E_2/R_2}{1/R_1+1/R_2+1/R_3}$)`]};
  }),
  /* ---- variantes ajoutées le 01/11/2026 (exos guidés : nouvelles valeurs à chaque ouverture) ---- */
  "sys2"(){
    const I1 = rnd([1,1.5,2,2.5,3,4,5]), k = rnd([2,3,4]), S = I1*(1+k);
    return {vals:{S:f(S,"A"),K:String(k),K1:String(k+1),EQ2:`$${k}I_1 - I_2 = 0$`}, rep:[I1, k*I1], corr:[
      `$I_2 = ${k}\\,I_1$ donc $${k+1}\\,I_1 = ${t(S,"A")}$ et $I_1 = \\mathbf{${t(I1,"A")}}$`, `$I_2 = ${k} \\times ${t(I1,"A")} = \\mathbf{${t(k*I1,"A")}}$`]};
  },
  "ohm-P": propre(() => {
    const R = rnd([50,100,150,200,250,400,500,1000]), I = rnd([10,20,50,100])*1e-3, U = R*I;
    return {vals:{R:f(R,"Ω"),I:f(I,"A"),IA:String(I).replace(".",",")}, rep:[U, U*I], corr:[
      `$U = R\\,I = ${t(R,"Ω")} \\times ${t(I,"A")} = \\mathbf{${t(U,"V")}}$`, `$P = U\\,I = ${t(U,"V")} \\times ${t(I,"A")} = \\mathbf{${t(U*I,"W")}}$`]};
  }),
  "td1-ex1"(){
    const I2 = rnd([1,2,3,4,5]), I3 = rnd([1,2,3,4,5,6]), I4 = rnd([1,2,3,4,5,6,7].filter(x => x !== I3)), I1 = I2+I3, I5 = I3-I4, I6 = I4-I1;
    return {vals:{I1:f(I1,"A"),I2:f(I2,"A"),I3:f(I3,"A"),I4:f(I4,"A")}, rep:[I1, I5, I6], corr:[
      `$I_1 = I_2 + I_3 = \\mathbf{${t(I1,"A")}}$`, `$I_5 = I_3 - I_4 = \\mathbf{${t(I5,"A")}}$${I5 < 0 ? " : il descend en réalité" : " : il monte bien"}`,
      `$I_6 = I_4 - I_1 = \\mathbf{${t(I6,"A")}}$${I6 < 0 ? " : il descend en réalité" : ""}`]};
  },
  "td1-ex3"(){
    const UDA = rnd([4,5,6,8,10,12,15]), UAC = rnd([5,8,10,12,15,20,25]), UBF = rnd([2,3,5,7,9,12]);
    const VA = -UDA, VC = VA-UAC, VB = VC+UBF;
    return {vals:{UDA:f(UDA,"V"),UAC:f(UAC,"V"),UBF:f(UBF,"V"),VA:f(VA,"V"),VF:f(VC,"V")}, rep:[VA, VC, VC, VB], corr:[
      `$V_A = V_D - U_{DA} = \\mathbf{${t(VA,"V")}}$`, `$V_C = V_A - U_{AC} = \\mathbf{${t(VC,"V")}}$`, `$V_E = V_F = V_C = \\mathbf{${t(VC,"V")}}$ (même fil)`,
      `$V_B = V_F + U_{BF} = \\mathbf{${t(VB,"V")}}$`]};
  },
  "td1-ex4"(){
    const U1 = rnd([10,12,15,18,20,24,30]), U2 = rnd([2,3,4,5,6,8]), U4 = -rnd([3,5,6,8,10,12]), VD = -U4;
    return {vals:{U1:f(U1,"V"),U2:f(U2,"V"),U4:f(U4,"V"),VD:f(VD,"V")}, rep:[U1+U2, U1-VD, 0], corr:[
      `$V_{\\text{milieu}} = U_1$ et $U_3 = U_1 + U_2 = \\mathbf{${t(U1+U2,"V")}}$`, `$V_{\\text{droite}} = -U_4 = ${t(VD,"V")}$, $U_5 = U_1 - V_{\\text{droite}} = \\mathbf{${t(U1-VD,"V")}}$`,
      `$U_6 = \\mathbf{0\\ \\text{V}}$ : ses deux bornes sont sur le fil du bas, elle est court-circuitée`]};
  },
  "td2-ex1": propre(() => {
    const E = rnd(EV), R1 = rR(), R2 = rR(), R3 = rR(), R4 = rR(), R5 = rR();
    const R34 = R3+R4, Rp = par(R2,R34), Req = R1+Rp+R5, I1 = E/Req, V2 = Rp*I1, I2 = V2/R2, I3 = I1-I2;
    return {chk:[Rp, I3, R1*I1, R5*I1, R4*I3], vals:{E:f(E,"V"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω"),R4:f(R4,"Ω"),R5:f(R5,"Ω"),R34:f(R34,"Ω"),RP:f(Rp,"Ω"),REQ:f(Req,"Ω"),I3:f(I3,"A"),V1:f(R1*I1,"V"),V5:f(R5*I1,"V")},
      rep:[Req, I1, V2, I2, R3*I3], corr:[
      `$R_3 + R_4 = ${t(R34,"Ω")}$, $R_2 \\parallel (R_3+R_4) = ${t(Rp,"Ω")}$, $R_{eq} = R_1 + ${t(Rp,"Ω")} + R_5 = \\mathbf{${t(Req,"Ω")}}$`,
      `$I_1 = E/R_{eq} = \\mathbf{${t(I1,"A")}}$ (c'est aussi $I_5$)`, `$V_2 = ${t(Rp,"Ω")} \\times I_1 = \\mathbf{${t(V2,"V")}}$`,
      `$I_2 = V_2/R_2 = \\mathbf{${t(I2,"A")}}$ (et $I_3 = I_1 - I_2 = ${t(I3,"A")}$)`,
      `$V_3 = R_3 I_3 = \\mathbf{${t(R3*I3,"V")}}$ ($V_4 = ${t(R4*I3,"V")}$, $V_1 = ${t(R1*I1,"V")}$, $V_5 = ${t(R5*I1,"V")}$)`]};
  }),
  "deux-gen": propre(() => {
    const E1 = rnd([24,30,36,48]), E2 = rnd([6,9,12,18,24].filter(x => x <= E1-6)), r1 = rnd([0.5,1,1.5,2]), r2 = rnd([0.5,1,1.5]), R = rnd([4,5,6,8,10,12,15,20]);
    const I = (E1-E2)/(r1+r2+R);
    return {chk:[r1*I, r2*I], vals:{E1:f(E1,"V"),E2:f(E2,"V"),r1:f(r1,"Ω"),r2:f(r2,"Ω"),R:f(R,"Ω"),DE:f(E1-E2,"V"),RT:f(r1+r2+R,"Ω"),UR1:f(r1*I,"V"),UR2:f(r2*I,"V")},
      rep:[I, E1-r1*I, E2+r2*I, R*I], corr:[
      `$I = \\dfrac{E_1 - E_2}{r_1 + r_2 + R} = \\dfrac{${t(E1-E2,"V")}}{${t(r1+r2+R,"Ω")}} = \\mathbf{${t(I,"A")}}$`, `$U_1 = E_1 - r_1 I = \\mathbf{${t(E1-r1*I,"V")}}$`,
      `$U_2 = E_2 + r_2 I = \\mathbf{${t(E2+r2*I,"V")}}$`, `$U = R\\,I = \\mathbf{${t(R*I,"V")}}$ (et bien $U_1 = U_2 + U$)`]};
  }),
  "td3-ex1": propre(() => {
    let I1, I2, R1, R2;
    do { I1 = rnd([2,4,5,6,8,10]); I2 = rnd([1,2,3,4,5,6]); R1 = rnd([10,20,30,40,50]); R2 = rnd([10,20,30,40,50]); } while(Math.abs(R1*I1 - R2*I2) < 5);
    const R = rnd([20,40,50,60,80,100]), RT = R1+R2+R, Ip = -R1*I1/RT, Ipp = R2*I2/RT;
    return {vals:{I1:f(I1,"A"),I2:f(I2,"A"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R:f(R,"Ω"),E1V:f(R1*I1,"V"),E2V:f(R2*I2,"V"),RT:f(RT,"Ω")}, rep:[Ip, Ipp, Ip+Ipp], corr:[
      `$I' = -\\dfrac{R_1 I_1}{R_1+R_2+R} = -\\dfrac{${t(R1*I1,"V")}}{${t(RT,"Ω")}} = \\mathbf{${t(Ip,"A")}}$`,
      `$I'' = \\dfrac{R_2 I_2}{R_1+R_2+R} = \\dfrac{${t(R2*I2,"V")}}{${t(RT,"Ω")}} = \\mathbf{${t(Ipp,"A")}}$`, `$I = I' + I'' = \\mathbf{${t(Ip+Ipp,"A")}}$`]};
  }),
  "norton-millman": propre(() => {
    const E1 = rnd(EV), E2 = rnd(EV), R1 = rR([10,100]), R2 = rR([10,100]), R3 = rR([10,100]);
    const IN = E1/R1 + E2/R2, RN = par(R1,R2), U = IN*par(RN,R3);
    return {chk:[E1/R1, E2/R2, par(RN,R3)], vals:{E1:f(E1,"V"),E2:f(E2,"V"),R1:f(R1,"Ω"),R2:f(R2,"Ω"),R3:f(R3,"Ω"),J1:f(E1/R1,"A"),J2:f(E2/R2,"A"),PN3:f(par(RN,R3),"Ω")}, rep:[IN, RN, U], corr:[
      `$I_N = E_1/R_1 + E_2/R_2 = ${t(E1/R1,"A")} + ${t(E2/R2,"A")} = \\mathbf{${t(IN,"A")}}$`, `$R_N = R_1 \\parallel R_2 = \\mathbf{${t(RN,"Ω")}}$`,
      `$U = I_N\\,(R_N \\parallel R_3) = ${t(IN,"A")} \\times ${t(par(RN,R3),"Ω")} = \\mathbf{${t(U,"V")}}$`]};
  }),
  "td3-ex3": propre(() => {
    const E1 = rnd(EV), R1 = rR(), I2 = rnd(IA), R = rR();
    const Ip = E1/(R1+R), Ipp = I2*R1/(R1+R), VA = (E1/R1 + I2)/(1/R1 + 1/R);
    return {chk:[VA], vals:{E1:f(E1,"V"),R1:f(R1,"Ω"),I2:f(I2,"A"),R:f(R,"Ω"),R1R:f(R1+R,"Ω")}, rep:[Ip, Ipp, Ip+Ipp], corr:[
      `$I' = \\dfrac{E_1}{R_1 + R} = \\mathbf{${t(Ip,"A")}}$`, `$I'' = I_2\\,\\dfrac{R_1}{R_1 + R} = \\mathbf{${t(Ipp,"A")}}$`,
      `$I = I' + I'' = \\mathbf{${t(Ip+Ipp,"A")}}$ ; Millman : $V_A = \\dfrac{E_1/R_1 + I_2}{1/R_1 + 1/R} = ${t(VA,"V")}$, donc $I = V_A/R$, pareil`]};
  }),
  "td3-ex4": propre(() => {
    const I1 = rnd(IA), R1 = rR(), E2 = rnd(EV), R2 = rR(), Rx = rR(), RT = R1+R2+Rx, Ip = I1*R1/RT, Ipp = E2/RT;
    return {vals:{I1:f(I1,"A"),R1:f(R1,"Ω"),E2:f(E2,"V"),R2:f(R2,"Ω"),Rx:f(Rx,"Ω"),R2X:f(R2+Rx,"Ω"),RT:f(RT,"Ω")}, rep:[Ip, Ipp, Ip+Ipp], corr:[
      `$I' = I_1\\,\\dfrac{R_1}{R_1 + R_2 + R_x} = \\mathbf{${t(Ip,"A")}}$`, `$I'' = \\dfrac{E_2}{R_1 + R_2 + R_x} = \\mathbf{${t(Ipp,"A")}}$`, `$I = I' + I'' = \\mathbf{${t(Ip+Ipp,"A")}}$`]};
  })
};

/* ---------- labos (mode Classique, 0 XP) ---------- */
function slider(el, id, lib, min, max, step, val){
  const d = document.createElement("div"); d.className = "sl";
  d.innerHTML = `<label for="${id}"><span>${lib}</span><b></b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">`;
  el.appendChild(d); return d;
}
const logR = x => Math.round(100*Math.pow(100, x/100)/10)*10;   /* 100 Ω → 10 kΩ */
const labos = {
  "diviseur"(el, o){
    el.innerHTML = `<div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-f"></div><div class="defi"></div>`;
    el.querySelector(".defi").innerHTML = o.ic("target") + " <b>Défi :</b> avec $E = 12$ V, règle $R_1$ et $R_2$ pour obtenir $V_2 = 3$ V (± 2 %).";
    const c = el.querySelector(".lab-ctl"), sE = slider(c, "lab-de", "$E$", 1, 24, .5, 12), s1 = slider(c, "lab-d1", "$R_1$", 0, 100, 1, 50), s2 = slider(c, "lab-d2", "$R_2$", 0, 100, 1, 50);
    let fini = false;
    const maj = () => {
      const E = +sE.querySelector("input").value, R1 = logR(+s1.querySelector("input").value), R2 = logR(+s2.querySelector("input").value), V2 = E*R2/(R1+R2), I = E/(R1+R2);
      sE.querySelector("b").textContent = f(E,"V"); s1.querySelector("b").textContent = f(R1,"Ω"); s2.querySelector("b").textContent = f(R2,"Ω");
      el.querySelector(".lab-sch").innerHTML = o.SV.rendre({modele:"diviseur", vals:{E:f(E,"V"), R1:f(R1,"Ω"), R2:f(R2,"Ω")}});
      const tex = `$$V_2 = E\\,\\frac{R_2}{R_1+R_2} = ${t(E,"V")} \\times \\frac{${t(R2,"Ω")}}{${t(R1+R2,"Ω")}} = \\mathbf{${t(V2,"V")}} \\qquad I = \\mathbf{${t(I,"A")}}$$`;
      const z = el.querySelector(".lab-f"); z.textContent = tex; if(window.renderMathInElement) renderMathInElement(z, {delimiters:[{left:"$$",right:"$$",display:true}]});
      if(!fini && E === 12 && Math.abs(V2 - 3) <= .06){ fini = true; const d = el.querySelector(".defi"); d.classList.add("gagne"); d.innerHTML = o.ic("check") + " <b>Défi réussi :</b> il faut $R_1 = 3R_2$ pour que $V_2 = E/4$."; if(window.renderMathInElement) renderMathInElement(d, {delimiters:[{left:"$",right:"$",display:false}]}); }
    };
    el.querySelectorAll("input").forEach(i => i.oninput = maj); maj();
  },
  "thev-charge"(el, o){
    el.innerHTML = `<div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"></div></div><div class="lab-f"></div><div class="defi"></div>`;
    el.querySelector(".defi").innerHTML = o.ic("target") + " <b>Défi :</b> règle la charge $R$ pour que $U = E_{th}/2$. Que remarques-tu ?";
    const c = el.querySelector(".lab-ctl"), sE = slider(c, "lab-te", "$E_{th}$", 1, 20, .5, 10), sR = slider(c, "lab-tr", "$R_{th}$", 0, 100, 1, 40), sC = slider(c, "lab-tc", "$R$ (charge)", 0, 100, 1, 75);
    let fini = false;
    const maj = () => {
      const E = +sE.querySelector("input").value, Rt = logR(+sR.querySelector("input").value), R = logR(+sC.querySelector("input").value), I = E/(Rt+R), U = R*I;
      sE.querySelector("b").textContent = f(E,"V"); sR.querySelector("b").textContent = f(Rt,"Ω"); sC.querySelector("b").textContent = f(R,"Ω");
      el.querySelector(".lab-sch").innerHTML = o.SV.rendre({modele:"thev-eq", vals:{Eth:f(E,"V"), Rth:f(Rt,"Ω"), R:f(R,"Ω")}});
      const z = el.querySelector(".lab-f"); z.textContent = `$$I = \\frac{E_{th}}{R_{th}+R} = \\mathbf{${t(I,"A")}} \\qquad U = R\\,I = \\mathbf{${t(U,"V")}}$$`;
      if(window.renderMathInElement) renderMathInElement(z, {delimiters:[{left:"$$",right:"$$",display:true}]});
      if(!fini && Math.abs(U - E/2) <= E*0.015){ fini = true; const d = el.querySelector(".defi"); d.classList.add("gagne"); d.innerHTML = o.ic("check") + " <b>Bien vu :</b> $U = E_{th}/2$ quand $R = R_{th}$. C'est même une façon de mesurer $R_{th}$ en TP."; if(window.renderMathInElement) renderMathInElement(d, {delimiters:[{left:"$",right:"$",display:false}]}); }
    };
    el.querySelectorAll("input").forEach(i => i.oninput = maj); maj();
  }
};

window.EXT_MODULE = {schemas, generateurs, labos};
})();
