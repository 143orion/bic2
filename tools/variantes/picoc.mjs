/* Exécute le même interpréteur C que le site (site/vendor/c-worker.js) dans Node.
   import {executer} from "./picoc.mjs"; await executer(code, entree) → {ok, out, err} */
import {readFileSync} from "node:fs";
import vm from "node:vm";
const src = readFileSync(new URL("../../site/vendor/c-worker.js", import.meta.url), "utf8");
const attente = new Map();
const ctx = {console, WebAssembly, TextEncoder, TextDecoder, Uint8Array, atob, setTimeout, clearTimeout, performance, crypto,
  postMessage: r => { const f = attente.get(r.id); if(f){ attente.delete(r.id); f(r); } }};
ctx.self = ctx; ctx.globalThis = ctx;
vm.createContext(ctx); vm.runInContext(src, ctx);
let n = 0;
export function executer(code, entree = ""){
  return new Promise(res => { const id = ++n; attente.set(id, res); ctx.onmessage({data:{id, code, stdin:entree}}); });
}
