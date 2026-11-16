/* Outils des specs du module « Maths analyse » : fractions et complexes exacts, écriture en LaTeX et en réponse « expr ».
   Pas une spec : importé par les specs ma-*.mjs. */
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while(b){ [a, b] = [b, a % b]; } return a || 1; };
export function fr(n, d = 1){ if(d < 0){ n = -n; d = -d; } const g = pgcd(n, d); return {n: n/g, d: d/g}; }
export const F = {
  add: (a, b) => fr(a.n*b.d + b.n*a.d, a.d*b.d), sub: (a, b) => fr(a.n*b.d - b.n*a.d, a.d*b.d),
  mul: (a, b) => fr(a.n*b.n, a.d*b.d), div: (a, b) => fr(a.n*b.d, a.d*b.n), neg: a => fr(-a.n, a.d),
  zero: a => a.n === 0, val: a => a.n/a.d
};
/* fraction → réponse « expr » (7/2) et LaTeX (\frac{7}{2}) */
export const frE = a => a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
export const frT = a => a.d === 1 ? String(a.n) : `${a.n < 0 ? "-" : ""}\\frac{${Math.abs(a.n)}}{${a.d}}`;

/* complexes à parties rationnelles : {re, im} */
export const C = (re, im = 0) => ({re: typeof re === "number" ? fr(re) : re, im: typeof im === "number" ? fr(im) : im});
export const Cx = {
  add: (a, b) => C(F.add(a.re, b.re), F.add(a.im, b.im)), sub: (a, b) => C(F.sub(a.re, b.re), F.sub(a.im, b.im)),
  mul: (a, b) => C(F.sub(F.mul(a.re, b.re), F.mul(a.im, b.im)), F.add(F.mul(a.re, b.im), F.mul(a.im, b.re))),
  conj: a => C(a.re, F.neg(a.im)), neg: a => C(F.neg(a.re), F.neg(a.im)),
  n2: a => F.add(F.mul(a.re, a.re), F.mul(a.im, a.im)),
  div(a, b){ const n = Cx.n2(b), p = Cx.mul(a, Cx.conj(b)); return C(F.div(p.re, n), F.div(p.im, n)); }
};
/* coefficient devant i : 1 → « i », −1 → « −i », 3/2 → « 3/2 i » */
function partI(b, tex){
  if(b.n === 1 && b.d === 1) return "i";
  if(b.n === -1 && b.d === 1) return "-i";
  return (tex ? frT(b) : frE(b)) + (tex ? "i" : " i");
}
/* a + bi → réponse « expr » (forme algébrique acceptée par le correcteur) */
export function cE(z){
  const a = z.re, b = z.im;
  if(F.zero(b)) return frE(a);
  const im = partI(b, false);
  if(F.zero(a)) return im;
  return `${frE(a)} ${im.startsWith("-") ? "- " + im.slice(1) : "+ " + im}`;
}
export function cT(z){
  const a = z.re, b = z.im;
  if(F.zero(b)) return frT(a);
  const im = partI(b, true);
  if(F.zero(a)) return im;
  return `${frT(a)} ${im.startsWith("-") ? "- " + im.slice(1) : "+ " + im}`;
}
/* écriture « (a + bi) » pour un coefficient dans une équation : parenthèses seulement si deux termes */
export const parT = z => (F.zero(z.re) || F.zero(z.im)) ? cT(z) : `(${cT(z)})`;

/* angles en multiples de π/12 : k → LaTeX, expr, ramené dans ]−π, π] */
export const red = k => { k = ((k % 24) + 24) % 24; return k > 12 ? k - 24 : k; };
export function angT(k){
  if(k === 0) return "0";
  const g = pgcd(k, 12), p = k/g, q = 12/g, s = p < 0 ? "-" : "", n = Math.abs(p) === 1 ? "" : Math.abs(p);
  return q === 1 ? `${s}${n}\\pi` : `${s}\\frac{${n}\\pi}{${q}}`;
}
export function angE(k){
  if(k === 0) return "0";
  const g = pgcd(k, 12), p = k/g, q = 12/g;
  return q === 1 ? `${p === -1 ? "-" : p === 1 ? "" : p + " "}pi` : `${p === -1 ? "-" : p === 1 ? "" : p + " "}pi/${q}`;
}
/* nombre de la forme (num/den)·√s (s = 1, 2 ou 3) : LaTeX et expr */
export function racT(num, den, s){
  const q = fr(num, den), rac = s === 1 ? "" : `\\sqrt{${s}}`;
  if(s === 1) return frT(q);
  const n = Math.abs(q.n) === 1 ? "" : String(Math.abs(q.n)), sg = q.n < 0 ? "-" : "";
  return q.d === 1 ? `${sg}${n}${rac}` : `${sg}\\frac{${n}${rac}}{${q.d}}`;
}
export function racE(num, den, s){
  const q = fr(num, den);
  if(s === 1) return frE(q);
  const n = Math.abs(q.n) === 1 ? "" : Math.abs(q.n) + " ", sg = q.n < 0 ? "-" : "";
  return q.d === 1 ? `${sg}${n}sqrt(${s})` : `${sg}${n}sqrt(${s})/${q.d}`;
}
/* r·e^{iθ} en réponse expr (k en π/12) */
export const expoE = (rE, k) => k === 0 ? rE : `${rE === "1" ? "" : rE + " "}e^(i ${angE(k)})`.replace("i -", "-i ");
export const expoT = (rT, k) => k === 0 ? rT : `${rT === "1" ? "" : rT}\\,e^{i${angT(k)}}`.replace("i-", "-i");

/* nombres q·√s (q rationnel, s sans facteur carré) : produits exacts pour les formes trigo / expo */
const sansCarre = s => { let k = 1; for(let p = 2; p*p <= s; p++) while(s % (p*p) === 0){ s /= p*p; k *= p; } return [k, s]; };
export const S = (q, s = 1) => ({q: typeof q === "number" ? fr(q) : q, s});
export const Sx = {
  mul(a, b){ const [k, s] = sansCarre(a.s*b.s); return S(F.mul(F.mul(a.q, b.q), fr(k)), s); },
  pow(a, n){ let r = S(1); for(let i = 0; i < n; i++) r = Sx.mul(r, a); return r; },
  zero: a => a.q.n === 0, neg: a => S(F.neg(a.q), a.s), val: a => F.val(a.q)*Math.sqrt(a.s)
};
export function sE(a){
  if(a.s === 1) return frE(a.q);
  const n = Math.abs(a.q.n), sg = a.q.n < 0 ? "-" : "";
  return `${sg}${n === 1 ? "" : n + " "}sqrt(${a.s})${a.q.d === 1 ? "" : "/" + a.q.d}`;
}
export function sT(a){
  if(a.s === 1) return frT(a.q);
  const n = Math.abs(a.q.n), sg = a.q.n < 0 ? "-" : "", c = `${n === 1 ? "" : n}\\sqrt{${a.s}}`;
  return a.q.d === 1 ? sg + c : `${sg}\\frac{${c}}{${a.q.d}}`;
}
/* cos, sin exacts de k·π/12 quand k est multiple de 2 ou de 3 */
const VR = {0:[S(1), S(0)], 2:[S(fr(1,2),3), S(fr(1,2))], 3:[S(fr(1,2),2), S(fr(1,2),2)], 4:[S(fr(1,2)), S(fr(1,2),3)], 6:[S(0), S(1)]};
export function cosSin(k){
  k = red(k); const q = Math.abs(k), sg = k < 0 ? -1 : 1;
  const base = q <= 6 ? VR[q] : (() => { const [c, s] = VR[12 - q]; return [Sx.neg(c), s]; })();   /* cos(π−α) = −cos α */
  if(!base) throw new Error("angle non remarquable : " + k);
  return [base[0], sg < 0 ? Sx.neg(base[1]) : base[1]];
}
/* a + bi avec a, b de la forme q√s : réponse expr (forme algébrique) et LaTeX */
export function zsE(a, b){
  if(Sx.zero(b)) return sE(a);
  const im = b.s === 1 && Math.abs(b.q.n) === 1 && b.q.d === 1 ? (b.q.n < 0 ? "-i" : "i") : sE(b) + " i";
  if(Sx.zero(a)) return im;
  return `${sE(a)} ${im.startsWith("-") ? "- " + im.slice(1) : "+ " + im}`;
}
export function zsT(a, b){
  if(Sx.zero(b)) return sT(a);
  let im = b.s === 1 && Math.abs(b.q.n) === 1 && b.q.d === 1 ? (b.q.n < 0 ? "-i" : "i") : sT(b) + "\\,i";
  if(Sx.zero(a)) return im;
  return `${sT(a)} ${im.startsWith("-") ? "- " + im.slice(1) : "+ " + im}`;
}
/* bases à angle remarquable : |b| = √2 (s=2) ou 2, angle k (en π/12) */
export const BASES = [
  {t:"1 + i", re:S(1), im:S(1), m:S(1,2), k:3}, {t:"1 - i", re:S(1), im:S(-1), m:S(1,2), k:-3},
  {t:"-1 + i", re:S(-1), im:S(1), m:S(1,2), k:9}, {t:"-1 - i", re:S(-1), im:S(-1), m:S(1,2), k:-9},
  {t:"\\sqrt3 + i", re:S(1,3), im:S(1), m:S(2), k:2}, {t:"\\sqrt3 - i", re:S(1,3), im:S(-1), m:S(2), k:-2},
  {t:"-\\sqrt3 + i", re:S(-1,3), im:S(1), m:S(2), k:10}, {t:"-\\sqrt3 - i", re:S(-1,3), im:S(-1), m:S(2), k:-10},
  {t:"1 + i\\sqrt3", re:S(1), im:S(1,3), m:S(2), k:4}, {t:"1 - i\\sqrt3", re:S(1), im:S(-1,3), m:S(2), k:-4},
  {t:"-1 + i\\sqrt3", re:S(-1), im:S(1,3), m:S(2), k:8}, {t:"-1 - i\\sqrt3", re:S(-1), im:S(-1,3), m:S(2), k:-8}
];
