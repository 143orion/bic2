/* Variantes du chapitre 6 (changement de variable) du module maths-analyse. */
import {fr, F, frE, frT} from "./ma-outils.mjs";

export default { banque: "maths-analyse/ma-6-changement-variable.json", n: 5, items: {
  "ma6-001": {n: 7, tirer: R => R.un([
    {F:"x\\cos(x^2)", U:"x^2", COR:"$\\cos(x^2)$ contient $x^2$, et $x$ est (à $\\frac12$ près) sa dérivée : $u = x^2$."},
    {F:"\\frac{x}{1 + x^2}", U:"1 + x^2 ; x^2", COR:"$(1 + x^2)' = 2x$ et il y a un $x$ en haut : $u = 1 + x^2$."},
    {F:"\\frac{1}{x\\ln x}", U:"ln(x)", COR:"$(\\ln x)' = \\frac1x$ : $u = \\ln x$, et l'intégrale devient $\\int\\frac{du}{u}$."},
    {F:"\\frac{\\sin x}{\\cos x + 3}", U:"cos(x) ; cos(x) + 3", COR:"$(\\cos x)' = -\\sin x$ : $u = \\cos x$ (ou $u = \\cos x + 3$)."},
    {F:"\\frac{\\arctan x}{1 + x^2}", U:"arctan(x)", COR:"$(\\arctan x)' = \\frac{1}{1 + x^2}$ : $u = \\arctan x$."},
    {F:"\\frac{e^x}{1 + e^{2x}}", U:"e^x", COR:"$e^{2x} = (e^x)^2$ et $(e^x)' = e^x$ : $u = e^x$."},
    {F:"x^2e^{x^3}", U:"x^3", COR:"$(x^3)' = 3x^2$ : $u = x^3$."}])},
  "ma6-005": {tirer: R => { const A = R.un([2, 3, 4, -2, -3]); return {A, A2: 2*A}; }},
  "ma6-008": {n: 4, tirer: R => { const K = R.entre(2, 5), I = fr(2**(K + 1) - 1, 2*(K + 1)); return {K, K1: K + 1, D: 2*(K + 1), I: frE(I), I_T: frT(I)}; }},
  "ma6-010": {tirer: R => ({A: R.entre(2, 5)})},
  "ma6-101": {n: 8, tirer: R => { const A = R.entre(2, 5), haut = R.un(["pi3", "pi2"]);
    const c = haut === "pi3" ? fr(1, 2) : fr(0), ca = F.add(c, fr(A)), q = F.div(fr(1 + A), ca);
    return {A, A1: 1 + A, B: haut === "pi3" ? "\\frac{\\pi}{3}" : "\\frac{\\pi}{2}", C: frE(c), C_T: frT(c), CA_T: frT(ca),
      J: `ln(${frE(q)})`, J_T: `\\ln ${q.d === 1 ? q.n : `\\frac{${q.n}}{${q.d}}`}`}; }},
  "ma6-102": {n: 3, tirer: R => R.un([
    {B:"1", UB:"pi/4", UB_T:"\\frac{\\pi}{4}", J:"pi^2/32", J_T:"\\frac{\\pi^2}{32}"},
    {B:"\\sqrt3", UB:"pi/3", UB_T:"\\frac{\\pi}{3}", J:"pi^2/18", J_T:"\\frac{\\pi^2}{18}"},
    {B:"\\frac{1}{\\sqrt3}", UB:"pi/6", UB_T:"\\frac{\\pi}{6}", J:"pi^2/72", J_T:"\\frac{\\pi^2}{72}"}])},
  "ma6-103": {n: 3, tirer: R => R.un([
    {B:"\\frac{\\pi}{4}", C:"sqrt(2)/2", C_T:"\\frac{\\sqrt2}{2}", J:"2/3 - 5 sqrt(2)/12", J_T:"\\frac23 - \\frac{5\\sqrt2}{12}"},
    {B:"\\frac{\\pi}{3}", C:"1/2", C_T:"\\frac12", J:"5/24", J_T:"\\frac{5}{24}"},
    {B:"\\frac{\\pi}{2}", C:"0", C_T:"0", J:"2/3", J_T:"\\frac23"}])},
  "ma6-104": {tirer: R => ({A: R.entre(2, 7)})},
  "ma6-105": {tirer: R => ({A: R.entre(2, 5)})}
}};
