/* Variantes du chapitre 4 (primitives et intégrales) du module maths-analyse. */
import {fr, F, frE, frT} from "./ma-outils.mjs";

/* polynôme Σ c_k x^k (coefficients fractions, du plus haut degré au plus bas) : LaTeX et expr */
function polyT(cs){
  let s = "";
  cs.forEach(([c, k]) => {
    if(F.zero(c)) return;
    const neg = c.n < 0, a = fr(Math.abs(c.n), c.d), un = a.n === 1 && a.d === 1 && k > 0;
    const coef = un ? "" : (a.d === 1 ? String(a.n) : `\\frac{${a.n}}{${a.d}}`);
    const v = k === 0 ? "" : k === 1 ? "x" : `x^${k}`;
    s += (s ? (neg ? " - " : " + ") : (neg ? "-" : "")) + coef + v;
  });
  return s || "0";
}
const polyE = cs => cs.filter(([c]) => !F.zero(c)).map(([c, k]) => `(${frE(c)})${k === 0 ? "" : k === 1 ? " x" : ` x^${k}`}`).join(" + ") || "0";
const evalP = (cs, x) => cs.reduce((s, [c, k]) => F.add(s, F.mul(c, fr(x**k))), fr(0));

export default { banque: "maths-analyse/ma-4-primitives.json", n: 6, items: {
  "ma4-001": {tirer: R => { const a = R.un([1, 2, 3, 4, 5, 6, -2, -3]), b = R.un([-5, -4, -3, -2, 2, 3, 4, 5]), c = R.un([-3, -1, 1, 2, 5, 7]);
    const f = [[fr(a), 2], [fr(b), 1], [fr(c), 0]], p = [[fr(a, 3), 3], [fr(b, 2), 2], [fr(c), 1]];
    return {F: polyT(f), PR: polyE(p), PR_T: polyT(p)}; }},
  "ma4-003": {tirer: R => ({A: R.un([2, 3, 4, 5, -2, -3, -4, -5])})},
  "ma4-004": {tirer: R => ({A: R.entre(2, 7)})},
  "ma4-006": {tirer: R => ({K: R.entre(2, 9)})},
  "ma4-007": {tirer: R => { const A = R.entre(0, 2), B = A + R.entre(1, 2), a = R.un([1, 2, 3, -1]), b = R.un([-3, -2, 1, 2, 4]);
    const f = [[fr(3*a), 2], [fr(b), 0]], p = [[fr(a), 3], [fr(b), 1]], I = F.sub(evalP(p, B), evalP(p, A));
    return {A, B, F: polyT(f), PR_T: polyT(p), I: frE(I), I_T: frT(I)}; }},
  "ma4-011": {tirer: R => { const C = R.entre(1, 3), B = C + R.entre(1, 4), P = R.un([-4, -2, 2, 3, 5, 7]), Q = R.un([-3, -1, 1, 4, 6]);
    return {C, B, P, Q, S: P + Q, R: -(P + Q)}; }},
  "ma4-012": {n: 8, tirer: R => { const a = R.un([-4, -3, -2, -1, 1, 2, 3, 4]), c = -a, SA = a > 0 ? `+ ${a}` : `- ${-a}`;
    if(c <= -2) return {SA, I: 4*a, COR: `$x ${SA}$ s'annule en $${c}$, hors de $]-2, 2[$ (ou au bord) : $x ${SA} \\geq 0$ sur tout l'intervalle. $\\left[\\frac{x^2}{2} ${SA}x\\right]_{-2}^{2} = ${4*a}$.`, IND: "Pas besoin de couper : enlève simplement la valeur absolue."};
    if(c >= 2) return {SA, I: -4*a, COR: `$x ${SA}$ s'annule en $${c}$, hors de $]-2, 2[$ (ou au bord) : $x ${SA} \\leq 0$, donc $|x ${SA}| = -(x ${SA})$. Résultat : $${-4*a}$.`, IND: "Pas besoin de couper : ici $|x + a| = -(x + a)$."};
    const i1 = (c + 2)**2/2, i2 = (2 - c)**2/2, f = v => Number.isInteger(v) ? String(v) : `\\frac{${2*v}}{2}`;
    return {SA, I: 4 + a*a, COR: `On coupe en $${c}$ : $\\int_{-2}^{${c}} -(x ${SA})\\,dx + \\int_{${c}}^{2}(x ${SA})\\,dx = ${f(i1)} + ${f(i2)} = ${4 + a*a}$.`, IND: `Coupe en $x = ${c}$ (Chasles).`}; }},
  "ma4-101": {n: 8, tirer: R => { for(;;){ const m = R.entre(1, 4), n = R.entre(1, 4), a = R.entre(-n + 1, m - 1); if(a === 0) continue;
    const AL = -m, BE = n, x0 = -a, i1 = fr((x0 - AL)**2, 2), i2 = fr((BE - x0)**2, 2), I = F.add(i1, i2);
    return {AL, BE, SA: a > 0 ? `+ ${a}` : `- ${-a}`, X0: x0, I1: frE(i1), I1_T: frT(i1), I2: frE(i2), I2_T: frT(i2), I: frE(I), I_T: frT(I)}; } }},
  "ma4-102": {tirer: R => { const a = R.entre(1, 4), b = R.entre(1, 3), B = R.un([1, 2]);
    const pa = fr(a, 2), I0 = F.mul(pa, fr(B*B));
    const fT = `${a === 1 ? "" : a}x + ${b === 1 ? "" : b}e^{x}`, prT = `${frT(pa)}x^2 + ${b === 1 ? "" : b}e^{x}`;
    return {B, F: fT, PR: `${frE(pa)} x^2 + ${b} e^x`, PR_T: prT, F0: b, I: `${frE(I0)} + ${b} e^(${B}) - ${b}`, I_T: `${frT(I0)} + ${b === 1 ? "" : b}e^{${B}} - ${b}`}; }},
  "ma4-103": {n: 6, tirer: R => R.un([
    {F:"\\cos^2 x", B:"\\frac{\\pi}{2}", LIN:"(1 + cos(2x))/2", LIN_T:"\\frac{1 + \\cos 2x}{2}", PR:"x/2 + sin(2x)/4", PR_T:"\\frac{x}{2} + \\frac{\\sin 2x}{4}", I:"pi/4", I_T:"\\frac{\\pi}{4}"},
    {F:"\\cos^2 x", B:"\\frac{\\pi}{4}", LIN:"(1 + cos(2x))/2", LIN_T:"\\frac{1 + \\cos 2x}{2}", PR:"x/2 + sin(2x)/4", PR_T:"\\frac{x}{2} + \\frac{\\sin 2x}{4}", I:"pi/8 + 1/4", I_T:"\\frac{\\pi}{8} + \\frac14"},
    {F:"\\cos^2 x", B:"\\pi", LIN:"(1 + cos(2x))/2", LIN_T:"\\frac{1 + \\cos 2x}{2}", PR:"x/2 + sin(2x)/4", PR_T:"\\frac{x}{2} + \\frac{\\sin 2x}{4}", I:"pi/2", I_T:"\\frac{\\pi}{2}"},
    {F:"\\sin^2 x", B:"\\frac{\\pi}{2}", LIN:"(1 - cos(2x))/2", LIN_T:"\\frac{1 - \\cos 2x}{2}", PR:"x/2 - sin(2x)/4", PR_T:"\\frac{x}{2} - \\frac{\\sin 2x}{4}", I:"pi/4", I_T:"\\frac{\\pi}{4}"},
    {F:"\\sin^2 x", B:"\\frac{\\pi}{4}", LIN:"(1 - cos(2x))/2", LIN_T:"\\frac{1 - \\cos 2x}{2}", PR:"x/2 - sin(2x)/4", PR_T:"\\frac{x}{2} - \\frac{\\sin 2x}{4}", I:"pi/8 - 1/4", I_T:"\\frac{\\pi}{8} - \\frac14"},
    {F:"\\sin^2 x", B:"\\pi", LIN:"(1 - cos(2x))/2", LIN_T:"\\frac{1 - \\cos 2x}{2}", PR:"x/2 - sin(2x)/4", PR_T:"\\frac{x}{2} - \\frac{\\sin 2x}{4}", I:"pi/2", I_T:"\\frac{\\pi}{2}"}])}
}};
