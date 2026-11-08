/* Outils partagés : substitution [[CLE]] (comme module.html), comparaison des sorties C (comme module.html). */
export function substituer(it, vals){
  const sub = v => typeof v === "string" ? v.replace(/\[\[(\w+)\]\]/g, (m, k) => vals[k] != null ? String(vals[k]) : m)
    : Array.isArray(v) ? v.map(sub) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, w]) => [k, sub(w)])) : v;
  const y = sub(JSON.parse(JSON.stringify(it)));
  const num = v => { if(v && v.mode === "numerique" && typeof v.attendu === "string" && v.attendu.trim() !== "" && !isNaN(+v.attendu)) v.attendu = +v.attendu; };
  num(y.verif); (y.etapes || []).forEach(e => num(e.verif));
  return y;
}
export const instances = it => Array.isArray(it.variantes) && it.variantes.length ? it.variantes.map(v => substituer(it, Object.assign({}, it.vals || {}, v))) : [substituer(it, it.vals || {})];
const nombresC = s => (String(s ?? "").match(/[-+]?\d+(?:[.,]\d+)?/g) || []).map(x => +x.replace(",", "."));
export function memeSortieC(a, b, v){
  if(v.nombres){
    const x = nombresC(a), y = nombresC(b), tol = v.tol != null ? +v.tol : 0.01;
    return x.length === y.length && x.every((q, i) => Math.abs(q - y[i]) <= tol + 1e-12);
  }
  const f = s => String(s ?? "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\s+$/, "").replace(/[ \t]+/g, " ");
  return f(a) === f(b);
}
export const codeNu = c => String(c ?? "").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, " ").replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
export const restes = o => (JSON.stringify(o).match(/\[\[\w+\]\]/g) || []).filter(x => x !== "[[_]]");
