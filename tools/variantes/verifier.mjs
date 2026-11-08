/* Vérifie les banques d'un module, variante par variante.
   node tools/variantes/verifier.mjs programmation-c [chapitre…]
   - aucun [[CLE]] non remplacé, pas de [[ ]] dans un titre ;
   - QCM : bonnes réponses présentes dans les choix ; numérique : nombre ; regex : l'exemple passe le motif ;
   - mode c (interpréteur du site) : l'exemple passe tous les tests et respecte exige/interdit ; un « depart » échoue aux tests de son étape. */
import {readFileSync, readdirSync} from "node:fs";
import {executer} from "./picoc.mjs";
import {instances, memeSortieC, codeNu, restes} from "./commun.mjs";

const [mod, ...chaps] = process.argv.slice(2);
const dir = new URL(`../../site/banques/${mod}/`, import.meta.url);
const fichiers = readdirSync(dir).filter(f => f.endsWith(".json") && (!chaps.length || chaps.some(c => f.startsWith(c))));
let nErr = 0, nVar = 0, nC = 0;
const err = (id, msg) => { nErr++; console.log(`✗ ${id} : ${msg}`); };
const norm = s => String(s).toLowerCase().replace(/\s+/g, " ").trim();

async function verifC(id, v, depart){
  const tests = v.tests || [];
  if(v.exemple != null){
    const nu = codeNu(v.exemple);
    for(const c of v.exige || []) if(!new RegExp(c.motif, c.flags ?? "").test(c.brut ? v.exemple : nu)) err(id, `exemple ne respecte pas exige ${c.motif}`);
    for(const c of v.interdit || []) if(new RegExp(c.motif, c.flags ?? "").test(c.brut ? v.exemple : nu)) err(id, `exemple viole interdit ${c.motif}`);
    for(const t of tests){ nC++; const r = await executer(v.exemple, t.entree || "");
      if(!r.ok || !memeSortieC(r.out, t.sortie, v)) err(id, `exemple échoue (entrée ${JSON.stringify(t.entree)}) : attendu ${JSON.stringify(t.sortie)}, obtenu ${JSON.stringify(r.out)} ${r.err || ""}`); }
  }
  if(depart != null && tests.length){
    let echoue = false; const nu = codeNu(depart);
    if((v.exige || []).some(c => !new RegExp(c.motif, c.flags ?? "").test(c.brut ? depart : nu)) || (v.interdit || []).some(c => new RegExp(c.motif, c.flags ?? "").test(c.brut ? depart : nu))) echoue = true;
    for(const t of tests){ if(echoue) break; nC++; const r = await executer(depart, t.entree || ""); if(!r.ok || !memeSortieC(r.out, t.sortie, v)) echoue = true; }
    if(!echoue) err(id, "le code de départ passe déjà les tests de l'étape");
  }
}
function verifSimple(id, it, v){
  if(!v) return;
  if(v.mode === "numerique" && typeof v.attendu !== "number" && !Array.isArray(v.attendu)) err(id, `numérique non chiffré : ${JSON.stringify(v.attendu)}`);
  if(v.mode === "regex" && v.exemple != null){
    const ms = [].concat(v.motif); if(!ms.some(m => new RegExp(`^(?:${m})$`, v.flags ?? "i").test(String(v.exemple).trim()))) err(id, `l'exemple « ${v.exemple} » ne passe pas le motif`);
  }
  if((it.type === "qcm" || it.type === "qcm-multi") && v.attendu != null){
    for(const a of [].concat(v.attendu)) if(typeof a === "number" ? !(a >= 0 && a < (it.choix || []).length) : !(it.choix || []).some(c => norm(c) === norm(a))) err(id, `bonne réponse absente des choix : ${a}`);
    if(new Set((it.choix || []).map(c => String(c).trim())).size !== (it.choix || []).length) err(id, "deux choix identiques");
  }
}
for(const f of fichiers){
  const ch = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  for(const it of ch.items){
    if(/\[\[\w+\]\]/.test(it.titre || "")) err(it.id, "[[ ]] dans le titre");
    const ins = instances(it); if(it.variantes) nVar += it.variantes.length;
    for(const [k, x] of ins.entries()){
      const id = ins.length > 1 ? `${it.id} (variante ${k})` : it.id;
      const r = restes(x); if(r.length) err(id, `non remplacé : ${[...new Set(r)].join(" ")}`);
      verifSimple(id, x, x.verif);
      if(x.verif && x.verif.mode === "c") await verifC(id, x.verif, x.depart);
      for(const [n, e] of (x.etapes || []).entries()){
        verifSimple(`${id} étape ${n + 1}`, x, e.verif);
        if(e.verif && e.verif.mode === "c") await verifC(`${id} étape ${n + 1}`, e.verif, e.depart);
      }
    }
  }
  console.log(`· ${f}`);
}
console.log(`${fichiers.length} fichier(s), ${nVar} variantes, ${nC} exécutions C : ${nErr ? nErr + " erreur(s)" : "tout est bon ✓"}`);
process.exit(nErr ? 1 : 0);
