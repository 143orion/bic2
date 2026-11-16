/* Variantes des chapitres 0 (rappels) et 1 (forme algébrique) du module maths-analyse. */
import {fr, F, frE, frT, C, Cx, cE, cT, parT} from "./ma-outils.mjs";

const gauss = (R, m = 4, nz = true) => { for(;;){ const z = C(R.entre(-m, m), R.entre(-m, m)); if(!nz || (!F.zero(z.re) && !F.zero(z.im))) return z; } };
const lin = (p, q) => {   /* p x + q y : expr et LaTeX */
  const t = (k, v, first) => k === 0 ? "" : `${k < 0 ? (first ? "-" : " - ") : (first ? "" : " + ")}${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`;
  const e = (t(p, "x", true) + t(q, "y", p === 0)) || "0";
  return {e: e.replace(/(\d)([xy])/g, "$1 $2"), t: e};
};
const dev = (a, b) => `(${cT(a)})(${cT(b)})`;

export default [
{ banque: "maths-analyse/ma-0-rappels.json", n: 6, items: {
  "ma0-001": {tirer: R => { const A = R.entre(2, 9), B = R.entre(2, 9); return {A, B, S: A + B}; }},
  "ma0-002": {tirer: R => { const K = R.entre(3, 7); return {K, P: 2**K}; }},
  "ma0-007": {n: 8, tirer: R => R.un([
    {T:"\\frac{2\\pi}{3}", V:"-1/2", COR:"$\\frac{2\\pi}{3} = \\pi - \\frac{\\pi}{3}$ et $\\cos(\\pi - \\theta) = -\\cos\\theta$ : $-\\frac12$."},
    {T:"\\frac{3\\pi}{4}", V:"-sqrt(2)/2", COR:"$\\frac{3\\pi}{4} = \\pi - \\frac{\\pi}{4}$ : $-\\frac{\\sqrt2}{2}$."},
    {T:"\\frac{5\\pi}{6}", V:"-sqrt(3)/2", COR:"$\\frac{5\\pi}{6} = \\pi - \\frac{\\pi}{6}$ : $-\\frac{\\sqrt3}{2}$."},
    {T:"-\\frac{\\pi}{3}", V:"1/2", COR:"$\\cos(-\\theta) = \\cos\\theta$ : $\\cos\\frac{\\pi}{3} = \\frac12$."},
    {T:"-\\frac{3\\pi}{4}", V:"-sqrt(2)/2", COR:"$\\cos(-\\theta) = \\cos\\theta$ et $\\cos\\frac{3\\pi}{4} = -\\frac{\\sqrt2}{2}$."},
    {T:"\\pi", V:"-1", COR:"Le point d'angle $\\pi$ est $(-1, 0)$ : $\\cos\\pi = -1$."},
    {T:"-\\frac{\\pi}{6}", V:"sqrt(3)/2", COR:"$\\cos(-\\theta) = \\cos\\theta$ : $\\frac{\\sqrt3}{2}$."},
    {T:"\\frac{\\pi}{2}", V:"0", COR:"Le point d'angle $\\frac{\\pi}{2}$ est $(0, 1)$ : $\\cos\\frac{\\pi}{2} = 0$."}])},
  "ma0-014": {tirer: R => ({A: R.un([2, 3, 4, 5, -2, -3, -4])})},
  "ma0-015": {tirer: R => ({A: R.entre(1, 9)})}
}},
{ banque: "maths-analyse/ma-1-algebrique.json", n: 6, items: {
  "ma1-001": {tirer: R => { const N = R.entre(5, 31), Q = Math.floor(N/4), Rr = N % 4;
    return {N, Q, R: Rr, V: ["1", "i", "-1", "-i"][Rr], VT: ["1", "i", "-1", "-i"][Rr]}; }},
  "ma1-004": {tirer: R => { const a = gauss(R), b = gauss(R), p = Cx.mul(a, b);
    return {Z1: `(${cT(a)})`, Z2: `(${cT(b)})`, P: cE(p), PT: cT(p), DEV: dev(a, b)}; }},
  "ma1-005": {tirer: R => { const a = gauss(R, 5), p = Cx.mul(a, a); return {Z1: cT(a), P: cE(p), PT: cT(p)}; }},
  "ma1-007": {tirer: R => { const [a, b, m] = R.un([[3,4,5],[4,-3,5],[-6,8,10],[5,12,13],[12,-5,13],[-8,-6,10],[8,15,17],[-15,8,17],[9,-12,15]]);
    const z = C(a, b), sq = x => x < 0 ? `(${x})^2` : `${x}^2`;
    return {Z: cT(z), A2: sq(a), B2: sq(b), S: a*a + b*b, M: m}; }},
  "ma1-010": {tirer: R => { const d = gauss(R, 3), q = gauss(R, 4), n = Cx.mul(q, d);
    return {N: cT(n), D: cT(d), DB: cT(Cx.conj(d)), D2: frE(Cx.n2(d)), NUM: cT(Cx.mul(n, Cx.conj(d))), Q: cE(q), QT: cT(q)}; }},
  "ma1-013": {tirer: R => { const a = gauss(R, 3), b = gauss(R, 6), z = Cx.div(b, a);
    return {A: parT(a), B: cT(b), AB: cT(Cx.conj(a)), A2: frE(Cx.n2(a)), Z: cE(z), ZT: cT(z)}; }},
  "ma1-015": {tirer: R => { const al = gauss(R, 3), be = gauss(R, 3);
    const p = F.val(F.add(al.re, be.re)), q = F.val(F.sub(be.im, al.im)), s = F.val(F.add(al.im, be.im)), t = F.val(F.sub(al.re, be.re));
    return {AL: parT(al), BE: parT(be), RE: lin(p, q).e, RET: lin(p, q).t, IMT: lin(s, t).t}; }},
  "ma1-101": {tirer: R => {
    for(;;){
      const a = gauss(R, 3), b = gauss(R, 9), mb = Cx.neg(b), num = Cx.mul(mb, Cx.conj(a)), z = Cx.div(mb, a);
      if(F.zero(z.re) || F.zero(z.im) || z.re.d > 10 || z.im.d > 10) continue;
      const sq = v => v.n < 0 ? `(${v.n})^2` : `${v.n}^2`;
      return {A: parT(a), AE: cE(a), B: `(${cT(b)})`, MB: `(${cE(mb)})`, MBT: cT(mb), ABE: cE(Cx.conj(a)), AB: cT(Cx.conj(a)),
        A2: frE(Cx.n2(a)), A2T: `${sq(a.re)} + ${sq(a.im)}`, NUME: cE(num), NUMT: cT(num), Z: cE(z), ZT: cT(z)};
    } }},
  "ma1-102": {tirer: R => { const d = gauss(R, 3), q = gauss(R, 6), n = Cx.mul(q, d), num = Cx.mul(n, Cx.conj(d));
    const sq = v => v.n < 0 ? `(${v.n})^2` : `${v.n}^2`;
    return {N: cT(n), D: cT(d), DBE: cE(Cx.conj(d)), DB: cT(Cx.conj(d)), D2: frE(Cx.n2(d)), D2T: `${sq(d.re)} + ${sq(d.im)}`, NUME: cE(num), NUMT: cT(num), Q: cE(q), QT: cT(q)}; }},
  "ma1-103": {n: 8, tirer: R => {
    for(;;){
      const al = gauss(R, 3), be = gauss(R, 3), x = R.entre(-3, 3), y = R.entre(-3, 3);
      if(!x || !y) continue;
      const p = F.val(F.add(al.re, be.re)), q = F.val(F.sub(be.im, al.im)), s = F.val(F.add(al.im, be.im)), t = F.val(F.sub(al.re, be.re));
      if(p*t - q*s === 0) continue;
      const g = C(p*x + q*y, s*x + t*y), z = C(x, y);
      return {AL: parT(al), BE: parT(be), GA: cT(g), RE: lin(p, q).e, RET: lin(p, q).t, IM: lin(s, t).e, IMT: lin(s, t).t,
        GR: String(p*x + q*y), GI: String(s*x + t*y), X: String(x), XT: String(x), Y: String(y), YT: String(y), Z: cE(z), ZT: cT(z)};
    } }}
}}
];
