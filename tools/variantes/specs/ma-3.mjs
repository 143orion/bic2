/* Variantes du chapitre 3 (racines, 2nd degré) du module maths-analyse. */
import {fr, F, frE, frT, C, Cx, cE, cT, S, Sx, sE, sT, cosSin, zsE, zsT, red, angE, angT, expoE, expoT} from "./ma-outils.mjs";

const gauss = (R, m = 3) => { for(;;){ const z = C(R.entre(-m, m), R.entre(-m, m)); if(!F.zero(z.re) || !F.zero(z.im)) return z; } };
const estUn = z => F.zero(z.im) && z.re.n === 1 && z.re.d === 1, estMoinsUn = z => F.zero(z.im) && z.re.n === -1 && z.re.d === 1;
const simple = z => F.zero(z.re) || F.zero(z.im);
/* terme « coef·var » d'un polynôme, en LaTeX */
function terme(z, v, premier){
  if(F.zero(z.re) && F.zero(z.im)) return "";
  let s;
  if(v && estUn(z)) s = "+" + v; else if(v && estMoinsUn(z)) s = "-" + v;
  else if(simple(z)){ const t = cT(z); s = (t.startsWith("-") ? t : "+" + t) + v; }
  else s = "+(" + cT(z) + ")" + v;
  s = s.startsWith("+") ? (premier ? s.slice(1) : " + " + s.slice(1)) : (premier ? s : " - " + s.slice(1));
  return s;
}
const poly = (a, b, c) => (terme(a, "z^2", true) + terme(b, "z", false) + terme(c, "", false)) || "0";
const RAD = {2: S(1, 2), 3: S(1, 3)};
/* écriture q√s d'un réel positif connu par son carré entier n */
const racineEnt = n => { for(let k = Math.floor(Math.sqrt(n)); k >= 1; k--) if(n % (k*k) === 0) return S(k, n/(k*k)); return S(1, n); };
const algebrique = (r, k) => { const [c, s] = cosSin(k); return [Sx.mul(r, c), Sx.mul(r, s)]; };

export default { banque: "maths-analyse/ma-3-racines.json", n: 6, items: {
  "ma3-001": {tirer: R => { const n = R.un([4, 9, 16, 25, 36, 2, 3, 5, 7, 12]), w = racineEnt(n);
    return {Z: String(-n), W: sE(w) + " i", W_T: (sT(w) === "1" ? "" : sT(w)) + "i"}; }},
  "ma3-002": {n: 8, tirer: R => { for(;;){ const r = R.un([4, 9, 16, 25, 2, 3]), k = R.un([4, 6, 8, 12, -4, -6, -8, 2, -2]); const sr = racineEnt(r);
    return {Z: expoT(String(r), k), W: expoE(sE(sr), k/2), W_T: expoT(sT(sr), k/2), SR: sT(sr)}; } }},
  "ma3-004": {tirer: R => { const p = R.entre(1, 4), q = R.un([-4, -3, -2, -1, 1, 2, 3, 4]); return {Z: cT(C(p*p - q*q, 2*p*q)), A: p*p - q*q, B: 2*p*q, M: p*p + q*q}; }},
  "ma3-005": {tirer: R => { for(;;){ const p = R.entre(1, 4), q = R.un([-4, -3, -2, -1, 1, 2, 3, 4]); if(p === Math.abs(q)) continue;
    return {Z: cT(C(p*p - q*q, 2*p*q)), A: p*p - q*q, B: 2*p*q, M: p*p + q*q, X2: p*p, Y2: q*q, W: cE(C(p, q)), W_T: cT(C(p, q))}; } }},
  "ma3-008": {n: 8, tirer: R => { const [z, r, k] = R.un([["8", 2, 0], ["-8", 2, 12], ["8i", 2, 6], ["-8i", 2, -6], ["27", 3, 0], ["-27i", 3, -6], ["i", 1, 6], ["-1", 1, 12], ["64i", 4, 6]]);
    const ws = [0, 1, 2].map(j => algebrique(S(r), red((k + 24*j)/3)));
    return {Z: z, R: r, TH: angT(k), ZEX: expoT(String(r**3), k), W: ws.map(([a, b]) => zsE(a, b)).join(" ; "), W_T: ws.map(([a, b]) => zsT(a, b)).join(", \\ ")}; }},
  "ma3-009": {n: 8, tirer: R => { const a = R.un([C(1), C(0, 1), C(-1), C(2), C(1, 1)]), z1 = gauss(R), z2 = gauss(R);
    const b = Cx.neg(Cx.mul(a, Cx.add(z1, z2))), c = Cx.mul(a, Cx.mul(z1, z2)), d = Cx.sub(Cx.mul(b, b), Cx.mul(C(4), Cx.mul(a, c)));
    return {EQ: poly(a, b, c), A: cT(a), B: cT(b), C: cT(c), D: cE(d), D_T: cT(d)}; }},
  "ma3-010": {tirer: R => { const p = R.entre(-3, 3), q = R.entre(1, 4), b = -2*p, c = p*p + q*q;
    const bx = (b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "" : b}z` : ` - ${b === -1 ? "" : -b}z`) + ` + ${c}`;
    return {BX: bx, D: b*b - 4*c, DE: `${2*q === 1 ? "" : 2*q}i`, MB: String(-b), S1: cE(C(p, q)), S2: cE(C(p, -q)), S1T: cT(C(p, q)), S2T: cT(C(p, -q))}; }},
  "ma3-013": {tirer: R => ({K: R.entre(2, 6)})},
  "ma3-101": {n: 8, tirer: R => { const r = R.un([1, 2, 3, 4]), kp = R.un([2, 3, 4, 6, -2, -3, -4]), k = 2*kp, [a, b] = algebrique(S(r), kp);
    return {ZTR: `${r*r === 1 ? "" : r*r}\\left(\\cos ${angT(k)} + i\\sin ${angT(k)}\\right)`, RZ: r*r, SR: String(r), TH_T: angT(k), PHI: angE(kp), PHI_T: angT(kp),
      W: zsE(a, b), W_T: zsT(a, b), WN: zsE(Sx.neg(a), Sx.neg(b)), WN_T: zsT(Sx.neg(a), Sx.neg(b))}; }},
  "ma3-102": {tirer: R => { for(;;){ const p = R.entre(1, 4), q = R.un([-4, -3, -2, -1, 1, 2, 3, 4]); if(p === Math.abs(q)) continue;
    const A = p*p - q*q, B = 2*p*q, sq = x => x < 0 ? `(${x})^2` : `${x}^2`;
    return {Z: cT(C(A, B)), A, B, M: p*p + q*q, A2: sq(A), B2: sq(B), X2: p*p, Y2: q*q,
      SIG: B > 0 ? "$x$ et $y$ ont le même signe" : "$x$ et $y$ sont de signes contraires", W: cE(C(p, q)), W_T: cT(C(p, q))}; } }},
  "ma3-103": {n: 6, tirer: R => { const [z, n, rz, r, k] = R.un([["-16", 4, 16, 2, 12], ["16", 4, 16, 2, 0], ["-4", 4, 4, S(1, 2), 12], ["8", 3, 8, 2, 0], ["-8i", 3, 8, 2, -6], ["-64", 6, 64, 2, 12], ["1", 6, 1, 1, 0]]);
    const rr = typeof r === "number" ? S(r) : r, angs = [...Array(n).keys()].map(j => red((k + 24*j)/n)), ws = angs.map(a => algebrique(rr, a));
    return {NN: n, Z: z, RZ: rz, R: sT(rr), RE: sE(rr), TH: angT(k), ZEXE: k === 0 ? String(rz) + " e^(i 0)" : expoE(String(rz), k), ZEX: k === 0 ? `${rz}\\,e^{i0}` : expoT(String(rz), k),
      W0E: angs[0] === 0 ? sE(rr) + " e^(i 0)" : expoE(sE(rr), angs[0]), W0: angs[0] === 0 ? `${sT(rr)}\\,e^{i0}` : expoT(sT(rr), angs[0]),
      W: ws.map(([a, b]) => zsE(a, b)).join(" ; "), W_T: ws.map(([a, b]) => zsT(a, b)).join(", \\ "), ANGS: angs.map(angT).join(",\\ ")}; }},
  "ma3-104": {n: 8, tirer: R => { for(;;){
    const a = R.un([C(1), C(0, 1), C(-1), C(2), C(0, -1)]), z1 = gauss(R), z2 = gauss(R);
    if(F.zero(Cx.sub(z1, z2).re) && F.zero(Cx.sub(z1, z2).im)) continue;
    const b = Cx.neg(Cx.mul(a, Cx.add(z1, z2))), c = Cx.mul(a, Cx.mul(z1, z2)), d = Cx.sub(Cx.mul(b, b), Cx.mul(C(4), Cx.mul(a, c))), de = Cx.mul(a, Cx.sub(z1, z2));
    if(F.zero(b.re) && F.zero(b.im)) continue;
    return {EQ: poly(a, b, c), A: cT(a), B: cT(b), C: cT(c), D: cE(d), D_T: cT(d), DE: cE(de), DE_T: cT(de), MB: simple(b) ? cT(Cx.neg(b)) : `(${cT(Cx.neg(b))})`,
      A2T: cT(Cx.mul(C(2), a)), S1: cE(z1), S2: cE(z2), S1T: cT(z1), S2T: cT(z2)}; } }}
}};
