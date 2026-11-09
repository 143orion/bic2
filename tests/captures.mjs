// Parcours du site avec le simulateur (tools/mock.js) + captures ordi / téléphone.
// node tests/captures.mjs [scénario…]   → images dans tests/captures/
// Sert site/ en local ; le CDN KaTeX est redirigé vers node_modules (même version).
import {createServer} from "node:http";
import {readFile, mkdir} from "node:fs/promises";
import {extname, join, normalize} from "node:path";
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const {chromium} = require("playwright");

const RACINE = new URL("..", import.meta.url).pathname;
const SITE = join(RACINE, "site"), KATEX = join(RACINE, "node_modules/katex/dist");
const TYPES = {".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".mp3":"audio/mpeg", ".woff2":"font/woff2", ".svg":"image/svg+xml"};
const serveur = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^\/+/, "") || "index.html";
  try{ const b = await readFile(join(SITE, p)); res.writeHead(200, {"content-type":TYPES[extname(p)] || "application/octet-stream"}); res.end(b); }
  catch(e){ res.writeHead(404); res.end("404"); }
}).listen(0);
const PORT = serveur.address().port, URL0 = `http://127.0.0.1:${PORT}/`;
const MOCK = await readFile(join(RACINE, "tools/mock.js"), "utf8");
await mkdir(join(RACINE, "tests/captures"), {recursive:true});

const ECRANS = {ordi:{viewport:{width:1366, height:860}}, tel:{viewport:{width:390, height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2}};
const browser = await chromium.launch();
const erreurs = [];
async function page(appareil){
  const ctx = await browser.newContext(ECRANS[appareil]);
  await ctx.addInitScript(MOCK);
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/(.*)$/, async (route, rq) => {
    const f = rq.url().replace(/^.*\/dist\//, "");
    try{ route.fulfill({body:await readFile(join(KATEX, f)), contentType:TYPES[extname(f)] || "application/octet-stream", headers:{"access-control-allow-origin":"*"}}); }catch(e){ route.abort(); }
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const pg = await ctx.newPage();
  pg.on("pageerror", e => erreurs.push(`[${appareil}] ${e.message}`));
  pg.on("console", m => { if(m.type() === "error" && !/fonts|ERR_FAILED|net::/.test(m.text())) erreurs.push(`[${appareil}] console: ${m.text()}`); });
  return pg;
}
const capture = (pg, nom) => pg.screenshot({path:join(RACINE, `tests/captures/${nom}.png`)});
const attendre = ms => new Promise(r => setTimeout(r, ms));

const SCENARIOS = {
  async connexion(app){ const pg = await page(app); await pg.goto(URL0 + "index.html?mock=off&reset"); await pg.waitForSelector("#acces .acces-google"); await attendre(400); await capture(pg, `acces-1-connexion-${app}`);
    await pg.click("#acces .acces-q"); await pg.waitForSelector("#acces-pourquoi:not([hidden])"); await attendre(200); await capture(pg, `acces-1b-pourquoi-${app}`); return pg; },
  async demande(app){
    const pg = await page(app); await pg.goto(URL0 + "index.html?mock=off&reset");
    await pg.evaluate(() => window.__mock.connexionSuivante("neo"));
    await pg.click("#acces .acces-google"); await pg.waitForSelector("#a-pseudo");
    await attendre(300); await capture(pg, `acces-2-formulaire-${app}`);
    await pg.fill("#a-pseudo", "Mia"); await pg.fill("#a-prenom", "Néo"); await pg.fill("#a-nom", "Anderson"); await pg.selectOption("#a-promo", "BIC2");
    await pg.click("#acces [type=submit]"); await pg.waitForSelector("#acces .erreur-txt:not(:empty)");
    await capture(pg, `acces-3-pseudo-pris-${app}`);
    await pg.fill("#a-pseudo", "Neo_42"); await pg.click("#acces [type=submit]");
    await pg.waitForSelector("#acces .acces-ok"); await attendre(300); await capture(pg, `acces-4-attente-${app}`);
    return pg;
  },
  async refus(app){ const pg = await page(app); await pg.goto(URL0 + "index.html?mock=eve&reset"); await pg.waitForSelector("#acces-titre"); await attendre(300); await capture(pg, `acces-5-refus-${app}`); return pg; },
  async hub(app){
    const pg = await page(app); await pg.goto(URL0 + "index.html?mock=mia&reset#modules");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    if(await pg.$("#acces")) erreurs.push(`[${app}] l'écran d'accès est resté affiché pour un membre`);
    await capture(pg, `hub-1-modules-${app}`);
    await pg.goto(URL0 + "index.html#classement"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(1200); await capture(pg, `hub-2-classement-${app}`);
    await pg.goto(URL0 + "index.html#joueurs"); await attendre(1200); await capture(pg, `hub-3-joueurs-${app}`);
    return pg;
  },
  async module(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#complement-electronique");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(1000);
    await capture(pg, `module-1-cours-${app}`);
    if(!(await pg.$$eval(".notion", e => e.length))) erreurs.push(`[${app}] aucune notion affichée dans Cours / Explicatif`);
    await pg.click('[data-m="tab"][data-v="exos"]'); await attendre(300); await capture(pg, `module-2-exos-menu-${app}`);
    return pg;
  },
  /* schémas de circuit + LaTeX (KaTeX via le CDN) : Explicatif, TL;DR, Follow-along et un exo guidé */
  async schemas(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#complement-electronique");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    const verifier = async nom => {
      const v = await pg.evaluate(() => ({katex:document.querySelectorAll(".katex").length, brut:/\$[^$\s][^$]*\$/.test(document.querySelector("#lecteur").innerText), svg:document.querySelectorAll("#lecteur svg").length}));
      if(!v.katex) erreurs.push(`[${app}] ${nom} : aucune formule KaTeX rendue`);
      if(v.brut) erreurs.push(`[${app}] ${nom} : du LaTeX brut ($…$) reste affiché`);
      console.log(`   ${nom} : ${v.katex} formules, ${v.svg} svg`);
      await capture(pg, `schema-${nom}-${app}`);
      return v;
    };
    let v = await verifier("explicatif");
    if(!v.svg) erreurs.push(`[${app}] explicatif : pas de schéma de circuit`);
    await pg.click('[data-m="sub"][data-v="tldr"]'); await attendre(500); await verifier("tldr");
    await pg.click('[data-m="sub"][data-v="follow"]'); await attendre(300);
    if(await pg.$(".fa3-nav")){ await pg.click('.fa3-nav [data-m="fch"][data-v="3"]'); await attendre(200); }   // téléphone : un chapitre à la fois
    await pg.click('[data-m="ffoc"][data-id="3.3"]'); await attendre(200);
    await capture(pg, `follow-carte-${app}`);
    await pg.click('[data-m="fa"][data-id="3.3"]'); await attendre(600);
    v = await verifier("follow"); if(!v.svg) erreurs.push(`[${app}] follow : pas de schéma de circuit`);
    await pg.click('[data-m="tab"][data-v="exos"]'); await pg.click('[data-m="pch"][data-id="elec-4-thevenin-norton"]'); await pg.click('[data-m="exsuiv"]');
    await pg.click('[data-m="gtog"]'); await pg.click('[data-m="go"]'); await attendre(900);
    v = await verifier("guide"); if(!v.svg) erreurs.push(`[${app}] guide : pas de schéma de circuit`);
    return pg;
  },
  /* nouveau layout : check flouté (carte repliée → clic → flou → réussite), puis Express / Classique / Mock jusqu'à l'écran de fin */
  async sessions(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#complement-electronique");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(1000);
    const flou = () => pg.evaluate(() => document.body.classList.contains("voile-on"));
    const id = "#c-elec-3-associations-ctl-3";
    await pg.evaluate(i => document.querySelector(i).scrollIntoView({block:"center"}), id); await attendre(400);
    if(await pg.$$eval(id + " .choix button", e => e.length)) erreurs.push(`[${app}] la question du check est visible avant le clic`);
    await pg.click(id); await attendre(300);
    if(!(await flou())) erreurs.push(`[${app}] pas de flou après le clic sur la carte du check`);
    await capture(pg, `check-flou-${app}`);
    for(const bon of [false, true]){
      for(const b of await pg.$$(id + " .choix button")){ const t = await b.textContent(); if((t.includes("2\\ \\Omega") && !t.includes("12")) === bon){ await b.click(); break; } }
      await attendre(300);
      if(!bon) await pg.click('[data-m="retry"]');
    }
    if(!(await pg.evaluate(() => window.moteur.etat().controles.includes("elec-3-associations-ctl-3")))) erreurs.push(`[${app}] check non validé après la bonne réponse`);
    if(await flou()) erreurs.push(`[${app}] le flou reste actif après la réussite`);
    const aller = async (mode, depart = false) => {
      if(depart){ await pg.click('[data-m="tab"][data-v="exos"]'); await attendre(200); await pg.click('[data-m="pall"]'); await pg.click('[data-m="exsuiv"]'); }
      else { await pg.click('[data-m="quit"]'); await attendre(300); }   /* « Retour au menu » de l'écran de fin : sélection conservée */
      await pg.click(`[data-m="mode"][data-v="${mode}"]`); await pg.click('[data-m="go"]'); await attendre(500);
    };
    const finir = async nom => {
      await attendre(600);
      if(!(await pg.$(".fin"))) erreurs.push(`[${app}] ${nom} : pas d'écran de fin`);
      const n = await pg.$$eval(".rv", e => e.length); if(!n) erreurs.push(`[${app}] ${nom} : pas de correction détaillée`);
      await capture(pg, `fin-${nom}-${app}`);
    };
    await aller("express", true);
    for(let q = 0; q < 14 && !(await pg.$(".fin")); q++){
      for(let t = 0; t < 30; t++){
        if(await pg.$(".frag")){ const nb = await pg.$$eval(".trou", e => e.length); for(let k = 0; k < nb; k++){ await pg.click(".frag >> nth=0"); await pg.click(".trou >> nth=" + k); } await pg.click("[data-a=valider]"); break; }
        if(await pg.$(".choix button")){ await pg.click(".choix button >> nth=0"); const mv = await pg.$("[data-a=valider]"); if(mv) await mv.click(); break; }
        if(await pg.$(".entree")){ await pg.fill(".entree", "1"); await pg.click("[data-a=valider]"); break; }
        await attendre(250);
      }
      await attendre(300); const sv = await pg.$("[data-a=suivant]"); if(sv){ await sv.click(); await attendre(300); }
    }
    await finir("express");
    await aller("classique"); await attendre(300);
    for(const i of await pg.$$(".mock-qs .entree")) await i.fill("1");
    await pg.click('[data-a="rendre"]'); await attendre(500); await pg.click('[data-a="fin"]'); await finir("classique");
    await aller("mock");
    for(let k = 0; k < 10 && !(await pg.$(".fin")); k++){
      const r = await pg.$('[data-a="rendre"]');
      if(r){ for(const i of await pg.$$(".mock-qs .entree")) await i.fill("1"); await r.click(); await attendre(600); continue; }
      if(await pg.$(".entree")){ await pg.fill(".entree", "1"); await pg.click("[data-a=valider]"); await attendre(400); const sv = await pg.$("[data-a=suivant]"); if(sv) await sv.click(); }
      await attendre(300);
    }
    await finir("mock");
    return pg;
  },
  /* demandes en attente sur l'accueil (Adam) : validation directe + compteur sur « Admin » ; rien pour un joueur */
  async accueilAdmin(app){
    const pg = await page(app); await pg.goto(URL0 + "index.html?mock=adam&reset");
    await pg.waitForSelector("#dem-accueil:not([hidden]) .da-ligne"); await attendre(400);
    await capture(pg, `accueil-admin-1-${app}`);
    const nb = await pg.$eval('[data-h="admin"]', a => a.dataset.nb);
    if(nb !== "2") erreurs.push(`[${app}] compteur Admin = ${nb} au lieu de 2`);
    await pg.click("#da-liste .da-ligne:first-child .btn.plein"); await attendre(700);
    const r = await pg.evaluate(() => ({lignes:document.querySelectorAll("#da-liste .da-ligne").length, membre:"membres/lea" in window.__mock.base()}));
    if(r.lignes !== 1 || !r.membre) erreurs.push(`[${app}] validation depuis l'accueil : ${JSON.stringify(r)}`);
    await pg.click("#da-liste .da-ligne .btn.danger"); await pg.click("#da-liste .da-ligne .btn.danger"); await attendre(700);
    if(!(await pg.$eval("#dem-accueil", e => e.hidden))) erreurs.push(`[${app}] la fenêtre des demandes reste affichée après traitement`);
    const j = await page(app); await j.goto(URL0 + "index.html?mock=mia&reset"); await j.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    if(!(await j.$eval("#dem-accueil", e => e.hidden))) erreurs.push(`[${app}] un joueur voit les demandes`);
    await j.context().close();
    return pg;
  },
  /* écritures groupées : rien n'est écrit tout de suite, tout part en quittant la page */
  async ecriture(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#complement-electronique");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    const r = await pg.evaluate(async () => {
      const ch = await (await fetch("banques/complement-electronique/elec-1-grandeurs.json")).json();
      window.moteur.charger(ch);
      const qs = ch.items.filter(i => i.type === "qcm").slice(0, 3);
      const avant = window.__mock.compteurs.writes;
      qs.forEach(q => window.moteur.reponse(q.id, true, 10, {bulle:false}));
      await new Promise(r => setTimeout(r, 1500));
      return {avant, apres:window.__mock.compteurs.writes, xp:window.moteur.etat().total};
    });
    if(r.apres !== r.avant) erreurs.push(`[${app}] écriture immédiate (${r.apres - r.avant}) au lieu d'être groupée`);
    await pg.goto(URL0 + "index.html#modules"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    const apres = await pg.evaluate(() => ({docs:Object.keys(window.__mock.base()).filter(k => k.startsWith("data/users/mia/")), xp:window.moteur.etat().total}));
    if(!apres.docs.length) erreurs.push(`[${app}] journal non écrit en quittant la page`);
    if(apres.xp !== r.xp) erreurs.push(`[${app}] XP différente après changement de page (${r.xp} → ${apres.xp})`);
    console.log("   XP", r.xp, "→", apres.xp, "| docs", apres.docs.length);
    return pg;
  },
  /* parcours complet : Neo demande → Adam voit la demande, valide → Neo entre ; Omar refusé */
  async admin(app){
    const neo = await page(app); await neo.goto(URL0 + "index.html?mock=neo&reset");
    await neo.waitForSelector("#a-pseudo"); await neo.fill("#a-pseudo", "Neo_42"); await neo.fill("#a-prenom", "Néo"); await neo.fill("#a-nom", "Anderson"); await neo.selectOption("#a-promo", "BIC2");
    await neo.click("#acces [type=submit]"); await neo.waitForSelector("#acces .acces-ok");
    const pg = await neo.context().newPage();
    pg.on("pageerror", e => erreurs.push(`[${app}] admin: ${e.message}`));
    await pg.goto(URL0 + "admin.html?mock=adam");
    await pg.waitForSelector('#t-demandes tr'); await attendre(800);
    if(await pg.$eval('[data-vue="demandes"]', e => e.hidden)) erreurs.push(`[${app}] l'onglet Demandes ne s'ouvre pas tout seul`);
    await capture(pg, `admin-1-demandes-${app}`);
    await pg.click('#t-demandes [data-d="ok"][data-uid="neo"]'); await attendre(600);
    await pg.click('#t-demandes [data-d="non"][data-uid="omar"]'); await pg.waitForSelector("#confirm:not([hidden])");
    await capture(pg, `admin-2-confirmer-refus-${app}`);
    await pg.click("#confirm-oui"); await attendre(800);
    await capture(pg, `admin-3-apres-${app}`);
    const b = await pg.evaluate(() => { const x = window.__mock.base(); return {membre:!!x["membres/neo"], joueur:x["joueurs/neo"], demande:!!x["demandes/neo"], omar:x["demandes/omar"], pseudoOmar:!!x["pseudos/x.0r"]}; });
    if(!b.membre || !b.joueur || b.joueur.pseudo !== "Neo_42" || b.demande) erreurs.push(`[${app}] validation incomplète ${JSON.stringify(b)}`);
    if(!b.omar || b.omar.statut !== "refusee" || b.pseudoOmar) erreurs.push(`[${app}] refus incomplet ${JSON.stringify(b)}`);
    await pg.click('#onglets [data-v="joueurs"]'); await attendre(500); await capture(pg, `admin-4-joueurs-${app}`);
    await pg.click('[data-retirer="lucas"]'); await pg.waitForSelector("#confirm:not([hidden])"); await capture(pg, `admin-5-retirer-${app}`);
    await pg.click("#confirm-oui"); await attendre(600);
    const r = await pg.evaluate(() => { const x = window.__mock.base(); return ["membres/lucas","joueurs/lucas","classement/lucas","identites/lucas","pseudos/lucas"].filter(k => k in x); });
    if(r.length) erreurs.push(`[${app}] retrait incomplet : ${r.join(", ")}`);
    if(await pg.$('[data-retirer="lucas"]')) erreurs.push(`[${app}] Lucas encore listé après retrait`);
    await pg.close();
    await neo.goto(URL0 + "index.html?mock=neo"); await neo.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    if(await neo.$("#acces")) erreurs.push(`[${app}] Neo validé mais toujours bloqué`);
    await capture(neo, `acces-6-neo-valide-${app}`);
    return neo;
  },
  /* placeholders de modules créés depuis le panel (nom, icône, 2 couleurs) → hub « coming soon » + évals */
  async placeholders(app){
    const pg = await page(app);
    pg.on("pageerror", e => erreurs.push(`[${app}] placeholders: ${e.message}`));
    await pg.goto(URL0 + "admin.html?mock=adam&reset"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    await pg.click('#onglets [data-v="modules"]'); await attendre(400);
    await pg.fill("#ph-nom", "Réseaux & Télécoms"); await pg.fill("#ph-icone", "@");
    await pg.$eval("#ph-bg", e => { e.value = "#102030"; }); await pg.$eval("#ph-ac", e => { e.value = "#ff8800"; });
    await pg.click('#f-ph button[type="submit"]'); await attendre(800);
    await capture(pg, `placeholders-1-admin-${app}`);
    const r = await pg.evaluate(() => ({ph:(window.__mock.base()["config/actuelle"] || {}).placeholders, opt:[...document.querySelectorAll("#e-module option")].map(o => o.value)}));
    if(!r.ph || r.ph.length !== 1 || r.ph[0].id !== "reseaux-telecoms" || r.ph[0].ac !== "#ff8800") erreurs.push(`[${app}] placeholder non enregistré ${JSON.stringify(r.ph)}`);
    if(!r.opt.includes("reseaux-telecoms")) erreurs.push(`[${app}] placeholder absent du menu des évals`);
    await pg.goto(URL0 + "index.html?mock=mia#modules"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(900);
    const c = await pg.$$eval(".carte.bientot", l => l.map(x => x.dataset.exe));
    if(!c.includes("reseaux-telecoms.exe")) erreurs.push(`[${app}] carte placeholder absente du hub ${JSON.stringify(c)}`);
    await capture(pg, `placeholders-2-hub-${app}`);
    await pg.goto(URL0 + "admin.html?mock=adam"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    await pg.click('#onglets [data-v="modules"]'); await pg.click("[data-del-ph]"); await attendre(800);
    const ap = await pg.evaluate(() => (window.__mock.base()["config/actuelle"] || {}).placeholders);
    if(ap && ap.length) erreurs.push(`[${app}] placeholder non supprimé`);
    return pg;
  },
  /* module Programmation C : éditeur C (interpréteur JSCPP dans un Web Worker) dans un exo Classique */
  async editeurC(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#programmation-c");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    await pg.click('[data-m="tab"][data-v="exos"]'); await attendre(200);
    await pg.click('[data-m="pk"][data-id="1.3"]'); await pg.click('[data-m="exsuiv"]');   /* 1.3 : un seul exo, de code */
    await pg.click('[data-m="mode"][data-v="classique"]'); await pg.click('[data-m="go"]'); await attendre(600);
    /* l'exo 1.3 compte plusieurs étapes, mais Classique masque les étapes guideSeul (accompagnement) : seule l'étape finale doit s'afficher */
    const banque = JSON.parse(await readFile(join(SITE, "banques/programmation-c/c-1-prise-en-main.json"), "utf8"));
    const exo = banque.items.find(x => x.notion === "1.3" && x.etapes);
    const etapes = exo.etapes.filter(e => !e.guideSeul), champs = await pg.$$(".mock-qs .entree");
    if(etapes.length !== 1) erreurs.push(`[${app}] éditeur C : l'exo 1.3 devrait n'avoir qu'une étape hors guideSeul (${etapes.length})`);
    if(champs.length !== etapes.length || !(await pg.$(".mock-qs .code-hl"))){ erreurs.push(`[${app}] éditeur C : ${champs.length} champ(s) affiché(s) pour ${etapes.length} étape(s) attendue(s) en Classique, ou éditeur coloré introuvable`); return pg; }
    /* l'exo peut avoir des variantes : on retrouve celle qui est affichée (toutes ses valeurs sont dans l'énoncé) */
    const texte = await pg.evaluate(() => document.body.innerText);
    const vals = (exo.variantes || []).find(v => Object.values(v).every(x => texte.includes(String(x).split("\n")[0]))) || exo.vals || {};
    const sub = x => typeof x === "string" ? x.replace(/\[\[(\w+)\]\]/g, (m, k) => vals[k] ?? m) : x;
    const attenduSortie = sub(etapes.at(-1).verif.tests[0].sortie);
    for(let i = 0; i < etapes.length; i++){
      const v = etapes[i].verif;
      await champs[i].fill(sub(v.mode === "exact" ? v.attendu[0] : v.exemple));
    }
    if(!(await pg.$(".mock-qs .code-hl .tk-k"))) erreurs.push(`[${app}] éditeur C : pas de coloration syntaxique`);
    await pg.click(`.mock-qs [data-a="executer"] >> nth=0`);
    await pg.waitForSelector(".mock-qs .c-sortie", {timeout:8000});
    if(!(await pg.textContent(".mock-qs .c-sortie")).includes(attenduSortie)) erreurs.push(`[${app}] éditeur C : la sortie du programme n'est pas affichée`);
    await capture(pg, `editeur-c-${app}`);
    await pg.click('[data-a="rendre"]'); await attendre(2500);
    const verdict = await pg.textContent(".q-retour");
    if(!/Copie parfaite/.test(verdict)) erreurs.push(`[${app}] éditeur C : l'exo complet n'est pas validé (${verdict.trim().slice(0, 60)})`);
    return pg;
  },
  /* panneau du Cours : fiche qui suit la lecture, « Essayer » → bac à sable C ; ordi = grand écran (colonne), tel = tiroir */
  /* variantes de la banque : valeurs tirées à l'ouverture (jamais de [[CLE]] visible), réponse chiffrée corrigée sur la valeur tirée, 🎲 qui retire */
  async variantes(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#programmation-c");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    const crochets = async quoi => { if(/\[\[\w+\]\]/.test(await pg.evaluate(() => document.body.innerText))) erreurs.push(`[${app}] variantes : [[CLE]] visible (${quoi})`); };
    await pg.click('[data-m="tab"][data-v="exos"]'); await attendre(200);
    await pg.click('[data-m="pk"][data-id="5.2"]'); await pg.click('[data-m="exsuiv"]');   /* 5.2 : 2 QCM + c5-009 (saisie à variantes) */
    await pg.click('[data-m="mode"][data-v="express"]'); await pg.click('[data-m="go"]'); await attendre(500);
    let vu = false;
    for(let q = 0; q < 6 && !(await pg.$(".fin")); q++){
      for(let t = 0; t < 30; t++){
        if(await pg.$(".choix button")){ await pg.click(".choix button >> nth=0"); const mv = await pg.$("[data-a=valider]"); if(mv) await mv.click(); break; }
        if(await pg.$(".entree")){
          await crochets("express");
          const txt = await pg.evaluate(() => document.querySelector(".q-enonce").innerText);
          const m = txt.match(/tl = (\d+)[\s\S]*?ajoute (\d+)[\s\S]*?supprime (?:(\d+) fois|une fois)/);
          if(!m){ erreurs.push(`[${app}] variantes : énoncé de c5-009 inattendu (${txt.slice(0, 80)})`); break; }
          await pg.fill(".entree", String(+m[1] + +m[2] - (m[3] ? +m[3] : 1))); await pg.click("[data-a=valider]"); await attendre(300);
          if(!(await pg.$(".q-retour.ok"))) erreurs.push(`[${app}] variantes : la bonne réponse à la valeur tirée est refusée`);
          vu = true; break;
        }
        await attendre(250);
      }
      await attendre(300); const sv = await pg.$("[data-a=suivant]"); if(sv){ await sv.click(); await attendre(300); }
    }
    if(!vu) erreurs.push(`[${app}] variantes : la saisie c5-009 n'est pas apparue en Express`);
    await pg.click('[data-m="quit"]'); await attendre(300);
    await pg.click('[data-m="mode"][data-v="classique"]'); await pg.click('[data-m="go"]'); await attendre(600);   /* Classique non guidé : c5-106 */
    await crochets("classique");
    const avant = await pg.evaluate(() => document.querySelector(".mock-qs, .q-corps, main").innerText);
    let change = false;
    for(let k = 0; k < 6 && !change; k++){ await pg.click('[data-a="de"]'); await attendre(400); change = (await pg.evaluate(() => document.querySelector(".mock-qs, .q-corps, main").innerText)) !== avant; }
    if(!change) erreurs.push(`[${app}] variantes : « Autres valeurs » ne change pas l'énoncé`);
    await crochets("après 🎲"); await capture(pg, `variantes-classique-${app}`);
    return pg;
  },
  async panneau(app){
    const pg = await page(app);
    if(app === "ordi") await pg.setViewportSize({width:1600, height:900});
    await pg.goto(URL0 + "module.html?mock=mia&reset#programmation-c");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    await pg.evaluate(() => { document.getElementById("n-5.1").scrollIntoView(); }); await attendre(400);
    const titre = await pg.textContent("#pan-fiche .pan-titre");
    if(!/5\.1/.test(titre)) erreurs.push(`[${app}] panneau : la fiche ne suit pas la notion lue (${titre.trim().slice(0, 40)})`);
    if(!(await pg.$("#pan-fiche [data-m=ftrain]"))) erreurs.push(`[${app}] panneau : bouton « S'entraîner » absent`);
    if(app === "ordi") await capture(pg, `panneau-fiche-${app}`);
    await pg.click("#n-5\\.1 .bc-essayer"); await attendre(400);
    if(!(await pg.isVisible("#pan-bac .code-c"))) { erreurs.push(`[${app}] panneau : le bac à sable ne s'ouvre pas`); return pg; }
    await pg.click('#pan-bac [data-a="executer"]');
    await pg.waitForSelector("#pan-bac .c-sortie", {timeout:8000});
    if(!(await pg.textContent("#pan-bac .c-sortie")).includes("8")) erreurs.push(`[${app}] panneau : l'extrait du cours ne s'exécute pas`);
    await capture(pg, `panneau-bac-${app}`);
    await pg.evaluate(() => document.querySelector("#pan-fiche [data-m=ftrain]").click());   /* fiche masquée par l'onglet Bac à sable */
    await attendre(300);
    if(!(await pg.$('.ex-cartes'))) erreurs.push(`[${app}] panneau : « S'entraîner » n'ouvre pas les Exos sur la notion`);
    return pg;
  },
  /* module Développement durable (page dédiée) : notes liées, QCM (XP du module), « Coche les vérités » au prorata, flashcards notées sans XP */
  async developpementDurable(app){
    const pg = await page(app); await pg.goto(URL0 + "developpement-durable.html?mock=mia&reset");
    await pg.waitForSelector("#dd-pg", {timeout:15000}); await attendre(800);
    await pg.click('#dd-pg [data-go="dd"]'); await attendre(200);
    if(!(await pg.$('#dd-pg .dd-wl[data-n="piliers"]'))) erreurs.push(`[${app}] DD : les liens entre notes ne s'affichent pas`);
    if(app === "ordi"){
      await pg.click('#dd-pg .dd-wl[data-n="piliers"]'); await attendre(200);
      if(!/3 piliers/.test(await pg.textContent("#dd-pk"))) erreurs.push(`[${app}] DD : le lien ne s'ouvre pas dans la colonne de droite`);
    }
    await capture(pg, `dd-cours-${app}`);
    /* QCM : la bonne réponse rapporte l'XP du module (10, réglée dans liste.json) */
    await pg.click('#dd-tete .dd-tab[data-v="exo"]'); await pg.click('[data-a="go"]'); await attendre(2300);
    const nOpt = (await pg.$$("#dd-chx .dd-opt")).length;
    if(nOpt !== 4) erreurs.push(`[${app}] DD : un QCM devrait proposer 4 réponses (${nOpt})`);
    const avant = await pg.evaluate(() => moteur.etat().total);
    await pg.click("#dd-chx .dd-opt >> nth=0"); await attendre(300);   /* seul le 1er clic compte : juste si aucune réponse n'est marquée fausse */
    const juste = !(await pg.$("#dd-chx .dd-opt.ko"));
    const gainQ = (await pg.evaluate(() => moteur.etat().total)) - avant;
    if(juste && gainQ < 10) erreurs.push(`[${app}] DD : QCM juste mais +${gainQ} XP (10 attendus)`);
    if(!juste && gainQ !== 0) erreurs.push(`[${app}] DD : QCM faux mais +${gainQ} XP`);
    /* Coche les vérités : on coche exactement la moitié des vraies → XP au prorata, item compté faux */
    await pg.click('[data-a="quit"]'); await pg.click('#dd-tete .dd-seg [data-s="vf"]'); await pg.click('[data-a="go"]'); await attendre(200);
    const n = (await pg.$$(".dd-vfa")).length;
    if(n !== 6) erreurs.push(`[${app}] DD : « Coche les vérités » devrait tirer 6 affirmations (${n})`);
    const a0 = await pg.evaluate(() => moteur.etat().total);
    await pg.click('[data-a="val"]'); await attendre(200);   /* rien coché : 0 XP */
    const ev = await pg.evaluate(() => moteur.evenements().filter(e => e.ty === "qcm-multi").at(-1));
    if(!ev || ev.s !== 0 || ev.ok) erreurs.push(`[${app}] DD : score partiel absent du journal (${JSON.stringify(ev)})`);
    if((await pg.evaluate(() => moteur.etat().total)) !== a0) erreurs.push(`[${app}] DD : « Coche les vérités » sans case cochée rapporte de l'XP`);
    if(/0 XP/.test(await pg.textContent(".dd-fbk"))) erreurs.push(`[${app}] DD : mention « 0 XP » affichée`);
    await capture(pg, `dd-verites-${app}`);
    /* flashcards : statut rangé dans le journal, sans XP */
    await pg.click('[data-a="quit"]'); await pg.click('#dd-tete .dd-seg [data-s="cartes"]'); await pg.click(".dd-recto"); await attendre(700);
    const a1 = await pg.evaluate(() => moteur.etat().total);
    await pg.click('[data-a="next"]'); await attendre(200);
    const carte = await pg.evaluate(() => moteur.evenements().filter(e => e.ty === "carte"));
    if(!carte.length || !carte[0].ok) erreurs.push(`[${app}] DD : la flashcard n'est pas notée « sue »`);
    if((await pg.evaluate(() => moteur.etat().total)) !== a1) erreurs.push(`[${app}] DD : une flashcard a rapporté de l'XP`);
    await capture(pg, `dd-cartes-${app}`);
    return pg;
  }
};

const choisis = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENARIOS);
for(const s of choisis) for(const app of ["ordi", "tel"]){
  try{ const pg = await SCENARIOS[s](app); await pg.context().close(); console.log("✓", s, app); }
  catch(e){ console.log("✗", s, app, e.message.split("\n")[0]); erreurs.push(`[${app}] ${s} : ${e.message.split("\n")[0]}`); }
}
await browser.close(); serveur.close();
if(erreurs.length){ console.log("\nErreurs :\n" + [...new Set(erreurs)].join("\n")); process.exitCode = 1; }
