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
    await pg.fill("#a-pseudo", "Mia"); await pg.fill("#a-prenom", "Néo"); await pg.fill("#a-nom", "Anderson");
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
    await capture(pg, `module-1-accueil-${app}`);
    const ch = await pg.$("[data-chapitre], .carte-chapitre, .chapitres a, .chapitres button");
    if(ch){ await ch.click(); await attendre(900); await capture(pg, `module-2-chapitre-${app}`); }
    return pg;
  },
  /* schémas de circuit + LaTeX (KaTeX via le CDN) dans les 3 vues de cours et un exo guidé */
  async schemas(app){
    const pg = await page(app); await pg.goto(URL0 + "module.html?mock=mia&reset#complement-electronique");
    await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(800);
    const ouvrirCh = async () => { await pg.click('[data-ch="elec-4-thevenin-norton"]'); await pg.waitForSelector('.mode-tuile[data-a="fa"]'); await attendre(300); };
    const verifier = async nom => {
      const v = await pg.evaluate(() => ({katex:document.querySelectorAll(".katex").length, brut:/\$[^$\s][^$]*\$/.test(document.querySelector("#lecteur").innerText), svg:document.querySelectorAll("#lecteur svg").length}));
      if(!v.katex) erreurs.push(`[${app}] ${nom} : aucune formule KaTeX rendue`);
      if(v.brut) erreurs.push(`[${app}] ${nom} : du LaTeX brut ($…$) reste affiché`);
      console.log(`   ${nom} : ${v.katex} formules, ${v.svg} svg`);
      await capture(pg, `schema-${nom}-${app}`);
      return v;
    };
    for(const [a, nom] of [["fa", "follow"], ["cl", "fiche"], ["tl", "tldr"], ["gu", "guide"]]){
      await ouvrirCh();
      if(await pg.$eval(`.mode-tuile[data-a="${a}"]`, b => b.disabled)){ console.log(`   ${nom} : pas de contenu dans ce chapitre`); await pg.goto(URL0 + "module.html?v=x" + a + "#complement-electronique"); await attendre(800); continue; }
      await pg.click(`.mode-tuile[data-a="${a}"]`); await attendre(900);
      if(a === "gu"){ const exo = await pg.$("#lecteur .exos-liste button, #lecteur [data-exo], #lecteur .exo-carte"); if(exo){ await exo.click(); await attendre(900); } }
      const v = await verifier(nom);
      if((a === "fa" || a === "gu") && !v.svg) erreurs.push(`[${app}] ${nom} : pas de schéma de circuit`);
      await pg.goto(URL0 + "module.html?v=" + a + "#complement-electronique"); await pg.waitForFunction(() => window.moteur && window.moteur.etat()); await attendre(500);
    }
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
    await neo.waitForSelector("#a-pseudo"); await neo.fill("#a-pseudo", "Neo_42"); await neo.fill("#a-prenom", "Néo"); await neo.fill("#a-nom", "Anderson");
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
  }
};

const choisis = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENARIOS);
for(const s of choisis) for(const app of ["ordi", "tel"]){
  try{ const pg = await SCENARIOS[s](app); await pg.context().close(); console.log("✓", s, app); }
  catch(e){ console.log("✗", s, app, e.message.split("\n")[0]); erreurs.push(`[${app}] ${s} : ${e.message.split("\n")[0]}`); }
}
await browser.close(); serveur.close();
if(erreurs.length){ console.log("\nErreurs :\n" + [...new Set(erreurs)].join("\n")); process.exitCode = 1; }
