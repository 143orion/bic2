/* Variantes du chapitre 2 (formes trigonométrique et exponentielle) du module maths-analyse. */
import {fr, frE, frT, S, Sx, sE, sT, cosSin, zsE, zsT, BASES, red, angE, angT, expoE, expoT} from "./ma-outils.mjs";

const quad = k => k > 0 && k < 6 ? "1er" : k > 6 && k < 12 ? "2e" : k < -6 ? "3e" : k < 0 && k > -6 ? "4e" : "axe";
/* z = m × base (m entier) : écriture, module, angle */
function zm(b, m){
  const re = Sx.mul(b.re, S(m)), im = Sx.mul(b.im, S(m)), r = Sx.mul(b.m, S(m)), [c, s] = cosSin(b.k);
  return {Z: zsT(re, im), R: sE(r), R_T: sT(r), C: sE(c), C_T: sT(c), S: sE(s), S_T: sT(s), Q: quad(b.k), TH: angE(b.k), TH_T: angT(b.k),
    TRI: `${sE(r)} (cos(${angE(b.k)}) + i sin(${angE(b.k)}))`, TRI_T: `${sT(r)}\\left(\\cos ${angT(b.k)} + i\\sin ${angT(b.k)}\\right)`,
    EX: expoE(sE(r), b.k), EX_T: expoT(sT(r), b.k)};
}
const algebrique = (r, k) => { const [c, s] = cosSin(k); return [Sx.mul(r, c), Sx.mul(r, s)]; };
const som = (k1, k2, op) => `${angT(k1)} ${op === "+" ? (k2 < 0 ? "-" : "+") : (k2 < 0 ? "+" : "-")} ${angT(Math.abs(k2))}`;
const KS = [2, 3, 4, 6, 8, 9, 10, -2, -3, -4, -6, -8, -9, -10];

export default { banque: "maths-analyse/ma-2-trigo-expo.json", n: 6, items: {
  "ma2-001": {tirer: R => { const z = zm(R.un(BASES), R.entre(1, 5)); return {Z: z.Z, R: z.R, R_T: z.R_T}; }},
  "ma2-002": {n: 8, tirer: R => { const z = zm(R.un(BASES), R.entre(1, 4)); return {Z: z.Z, TH: z.TH, TH_T: z.TH_T, C: z.C_T, S: z.S_T, Q: z.Q}; }},
  "ma2-005": {tirer: R => { const z = zm(R.un(BASES), R.entre(1, 4)); return {Z: z.Z, TRI: z.TRI, TRI_T: z.TRI_T, R_T: z.R_T, TH_T: z.TH_T}; }},
  "ma2-006": {tirer: R => { const z = zm(R.un(BASES), R.entre(1, 4)); return {Z: z.Z, EX: z.EX, EX_T: z.EX_T, R_T: z.R_T, TH_T: z.TH_T}; }},
  "ma2-009": {tirer: R => { for(;;){ const k1 = R.un(KS), k2 = R.un(KS), k = red(k1 + k2); if(k === 0 || (k % 2 && k % 3)) continue;
    const r1 = R.entre(2, 5), r2 = R.entre(2, 5);
    return {R1: r1, R2: r2, Z1: expoT(String(r1), k1), Z2: expoT(String(r2), k2), SOM: som(k1, k2, "+"), RP: r1*r2, AP: angT(k), EX: expoE(String(r1*r2), k), EX_T: expoT(String(r1*r2), k)}; } }},
  "ma2-010": {tirer: R => { for(;;){ const k1 = R.un(KS), k2 = R.un(KS), k = red(k1 - k2); if(k === 0 || (k % 2 && k % 3)) continue;
    const r1 = R.entre(2, 9), r2 = R.entre(2, 5), q = fr(r1, r2);
    return {R1: r1, R2: r2, Z1: expoT(String(r1), k1), Z2: expoT(String(r2), k2), SOM: som(k1, k2, "-"), AP: angT(k), EX: expoE(frE(q), k), EX_T: expoT(frT(q), k)}; } }},
  "ma2-012": {n: 8, tirer: R => { for(;;){ const b = R.un(BASES), n = R.entre(3, 8), k = red(n*b.k); if(k === 0 || (k % 2 && k % 3)) continue;
    const rn = Sx.pow(b.m, n), [a, c] = algebrique(rn, k);
    return {B: b.t, N: n, BEX: expoT(sT(b.m), b.k), PEX: expoT(sT(rn), k), P: zsE(a, c), P_T: zsT(a, c)}; } }},
  "ma2-013": {tirer: R => { const r = R.un([2, 3, 4, 6, 8]), k = R.un(KS), [a, c] = algebrique(S(r), k);
    return {EXT: expoT(String(r), k), P: zsE(a, c), P_T: zsT(a, c), TH_T: angT(k)}; }},
  "ma2-101": {n: 8, tirer: R => { const b = R.un(BASES); return zm(b, b.m.s === 2 ? R.entre(2, 6) : R.entre(1, 4)); }},
  "ma2-102": {n: 8, tirer: R => { for(;;){
    const b = R.un(BASES), d = R.un([2, 3, 4, 5]), n = R.entre(2, 6), k = red(n*b.k); if(k === 0 || (k % 2 && k % 3)) continue;
    const r = Sx.mul(b.m, S(fr(1, d))), rn = Sx.pow(r, n);
    return {ZF: `\\frac{${b.t}}{${d}}`, B: b.t, D: d, N: n, R: sE(r), R_T: sT(r), MB_T: sT(b.m), TH: angE(b.k), TH_T: angT(b.k),
      EX: expoE(sE(r), b.k), EX_T: expoT(sT(r), b.k), RN: sE(rn), RN_T: sT(rn), THN: angE(k), NTH_T: angT(n*b.k), THN_T: angT(k),
      PEX: expoE(sE(rn), k), PEX_T: expoT(sT(rn), k)}; } }},
  "ma2-103": {n: 8, tirer: R => { for(;;){
    const b = R.un(BASES), n = R.entre(3, 7), k = red(n*b.k); if(k === 0 || k === 12 || (k % 2 && k % 3)) continue;
    const rn = Sx.pow(b.m, n), [a, c] = algebrique(rn, k);
    return {B: b.t, N: n, BEXE: expoE(sE(b.m), b.k), BEX: expoT(sT(b.m), b.k), PEXE: expoE(sE(rn), k), PEX: expoT(sT(rn), k), P: zsE(a, c), P_T: zsT(a, c)}; } }},
  "ma2-104": {tirer: R => { for(;;){ const k1 = R.un(KS), k2 = R.un(KS), k = red(k1 + k2); if(k === 0 || k === 12 || (k % 2 && k % 3)) continue;
    const r1 = R.entre(2, 4), r2 = R.entre(2, 4), [a, c] = algebrique(S(r1*r2), k);
    return {R1: r1, R2: r2, Z1: expoT(String(r1), k1), Z2: expoT(String(r2), k2), SOM: som(k1, k2, "+"), RP: r1*r2, AP: angT(k), AP_E: angE(k), EX_T: expoT(String(r1*r2), k), P: zsE(a, c), P_T: zsT(a, c)}; } }}
}};
