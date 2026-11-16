/* Variantes du chapitre 5 (intégration par parties) du module maths-analyse. */
export default { banque: "maths-analyse/ma-5-ipp.json", n: 5, items: {
  "ma5-101": {tirer: R => { const K = R.entre(2, 6); return {K, K1: K + 1, K2: K*K}; }},
  "ma5-102": {n: 6, tirer: R => { const P = R.entre(1, 3), Q = R.entre(1, 3), M = R.entre(1, 3), UM = P*M + Q; return {P, Q, M, UM, S: Q + P, T: UM + P}; }},
  "ma5-103": {tirer: R => ({K: R.entre(2, 6)})},
  "ma5-104": {tirer: R => { const K = R.entre(2, 6); return {K, K2: K*K}; }}
}};
