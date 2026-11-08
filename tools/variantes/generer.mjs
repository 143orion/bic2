/* Génère les « variantes » d'items à partir d'une spec, puis les écrit dans la banque.
   node tools/variantes/generer.mjs tools/variantes/specs/<fichier>.mjs
   Ensuite : node tools/variantes/verifier.mjs <module> (exécute chaque variante avec l'interpréteur du site).

   Une spec (module ES) exporte par défaut :
   Une spec peut aussi être une liste de specs (plusieurs chapitres) et avoir ajouter: [items complets] (ajoutés s'ils n'existent pas).
   { banque: "programmation-c/c-5-tableaux.json", n: 6,
     items: { "<id>": {
       set:    { "enonce": "… [[N]] …", "etapes.2.verif.tests": [...] },   // champs à remplacer (chemin à points)
       tirer:  R => ({N: R.un([5, 8, 10])}),                              // un jeu de valeurs (textes ou nombres)
       deriver: v => ({M: v.N - 1}),                                      // facultatif : valeurs calculées en JS
       calcul: { R: {code: "… [[N]] …", entree: ""} },                    // facultatif : valeurs = sortie d'un programme C
       n: 8                                                               // facultatif : nombre de variantes
     } } }
   Dans un test de mode c, sortie: "@auto" = sortie de l'« exemple » de l'étape (exécuté pour chaque variante).
   Le 1er jeu sert aussi de « vals » (valeurs par défaut). Ids, durées, types : jamais modifiés. */
import {readFileSync, writeFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import {executer} from "./picoc.mjs";
import {substituer} from "./commun.mjs";

const R = {
  un: a => a[Math.floor(Math.random()*a.length)],
  entre: (a, b) => a + Math.floor(Math.random()*(b - a + 1)),
  melange: a => { const x = a.slice(); for(let i = x.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; },
  distincts: (n, a, b) => { const s = new Set(); while(s.size < n) s.add(a + Math.floor(Math.random()*(b - a + 1))); return [...s]; },
};
const poser = (o, p, v) => { const k = p.split("."); let x = o; for(const c of k.slice(0, -1)) x = x[/^\d+$/.test(c) ? +c : c]; x[k.at(-1)] = v; };
const specs = [].concat((await import(pathToFileURL(resolve(process.argv[2])).href)).default);
for(const spec of specs){
const chemin = new URL(`../../site/banques/${spec.banque}`, import.meta.url);
const ch = JSON.parse(readFileSync(chemin, "utf8"));
/* items nouveaux : ajoutés à la fin s'ils n'existent pas encore (jamais d'écrasement d'un id existant) */
for(const it of spec.ajouter || []) if(!ch.items.some(x => x.id === it.id)){ ch.items.push(JSON.parse(JSON.stringify(it))); console.log(`+ ${it.id} ajouté`); }
const parId = Object.fromEntries(ch.items.map(it => [it.id, it]));
for(const [id, s] of Object.entries(spec.items)){
  const it = parId[id]; if(!it) throw new Error(`item inconnu : ${id}`);
  for(const [p, v] of Object.entries(s.set || {})) poser(it, p, v);
  /* sorties « @auto » → clés S<étape>_<test> */
  const autos = [];
  const marquer = (v, k) => (v && v.mode === "c" ? v.tests || [] : []).forEach((t, j) => { if(t.sortie === "@auto" || t.sortie === `[[S${k}_${j}]]`){ t.sortie = `[[S${k}_${j}]]`; autos.push({k, j}); } });
  marquer(it.verif, "x"); (it.etapes || []).forEach((e, k) => marquer(e.verif, k));
  const n = s.n || spec.n || 6, jeux = [], vus = new Set();
  for(let essai = 0; jeux.length < n && essai < 500; essai++){
    let v = s.tirer(R); if(s.deriver) v = Object.assign(v, s.deriver(v, R));
    const cle = JSON.stringify(v); if(vus.has(cle)) continue; vus.add(cle);
    for(const [k, c] of Object.entries(s.calcul || {})){
      const code = substituer({c:c.code}, v).c, r = await executer(code, substituer({e:c.entree || ""}, v).e);
      if(!r.ok) throw new Error(`${id} : calcul ${k} : ${r.err}`); v[k] = r.out.replace(/\n$/, "");
    }
    for(const {k, j} of autos){
      const x = substituer(it, v), ve = k === "x" ? x.verif : x.etapes[k].verif, t = ve.tests[j];
      const r = await executer(ve.exemple, t.entree || ""); if(!r.ok) throw new Error(`${id} étape ${k} : ${r.err}`);
      v[`S${k}_${j}`] = r.out.replace(/\n+$/, "");
    }
    jeux.push(Object.fromEntries(Object.entries(v).map(([a, b]) => [a, typeof b === "number" ? String(b) : b])));
  }
  if(jeux.length < 2) throw new Error(`${id} : pas assez de variantes différentes`);
  it.vals = jeux[0]; it.variantes = jeux;
  console.log(`${id} : ${jeux.length} variantes`);
}
writeFileSync(chemin, JSON.stringify(ch));
/* même mise en forme que les banques existantes (json.dumps indent=1, accents conservés) */
execFileSync("python3", ["-c", "import json,sys;p=sys.argv[1];o=json.load(open(p));open(p,'w').write(json.dumps(o,ensure_ascii=False,indent=1))", chemin.pathname]);
}
