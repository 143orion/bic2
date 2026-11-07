/* =====================================================================
   BIC2.exe — xp.js : moteur d'XP UNIQUE + barre HUD commune
   ---------------------------------------------------------------------
   Contrat module ↔ moteur (GAMIFICATION.md) :
     await moteur.init({module:"sql"})          // une fois par page
     moteur.charger(chapitreJson)               // déclare les items d'une banque
     moteur.monterHeader({page:"module", module:{id,nom}})
     moteur.debutExo(idExo)                     // ouvre un passage d'exo long
     moteur.reponse(idQuestion, correct, tempsMisSecondes, {etape, indices, mode})  // mode d'exo : "guide" | "classique" | "mock"
     moteur.reponse(<id du check de la notion>, correct)  // check de validation d'une notion (cours) ; id = check.id ou <chapitre>-ctl-<n°>
   Les modules ne calculent JAMAIS l'XP. Tout est recalculé ici depuis le
   journal d'événements (data/users/<id>/j_<jour>_<appareil>), avec les
   chiffres du doc config/actuelle (DEFAUT ne sert que si la base est vide).
   ===================================================================== */
(function(){
"use strict";

/* ---------- réglages par défaut (miroir de GAMIFICATION.md) ---------- */
const DEFAUT = {
  xpParMinute:20, qcm:7, qcmMulti:10, trous:10, controle:5, formatProduction:1.5, modeGuide:1.2, modeClassique:1.75, modeMock:2,
  concentrationDiv:90, concentrationMax:1.5, dureeSaisie:0.67,
  rattrapage:1.1,
  progressionMax:1.5,   // multiplicateur d'XP en fin de module (×1 au début) ; réglable par module : config.modules[id].progMax
  exoSeuil1:0.30, exoSeuilN:0.15, exoPenalite:0.5, exoPassagesPleins:3, exoMultApres:0.5,
  repetitionJour:0.3, maitriseJours:3, maitriseBonus:15, maitriseMult:0.5, evalFenetre:14,
  precisionMin:10, precision:[[70,10],[80,20],[90,35],[100,50]],
  sessionInactivite:20, effortQcm:20/60, effortQcmMulti:30/60, effortSaisie:40/60,
  endurance:[[15,5],[30,10],[60,25],[90,40],[120,55]],
  serieJourMin:10, serieHeure:4, seriePas:3, seriePlafond:30, jokerTous:7, jokerMax:3,
  plafondSeuil1:240, plafondSeuil2:360, plafondMult2:0.5, plafondMult3:0.25, plafondEvalBonus:60,
  indiceCout:0.3, indicesMax:2,
  niveauCoef:50,
  classementEffortMax:600, classementTaux1:220, classementTaux2:111, classementTaux3:56, classementDebut:"2026-10-31"
};
const RANGS = ["newgen","bit","octet","registre","sudoer","daemon","compilateur","l33t","opérateur","kernel","root"];
const GLYPHS = "!<>-_\\/[]{}=+*^?#01$%&";

/* ---------- petits outils ---------- */
const pad = n => String(n).padStart(2,"0");
const ymd = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const jourDe = (t, heure) => ymd(new Date(t - heure*36e5));
const plusJours = (j, n) => { const d = new Date(j+"T12:00:00"); d.setDate(d.getDate()+n); return ymd(d); };
const ecartJours = (a, b) => Math.round((new Date(b+"T12:00:00") - new Date(a+"T12:00:00"))/864e5);
const fmt = x => (Math.round(x*100)/100).toLocaleString("fr-FR");
const nf = x => Math.round(x).toLocaleString("fr-FR");
const palier = (liste, x) => { let v = 0; for(const [s,val] of liste||[]) if(x >= s) v = val; return v; };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

function niveauDe(xp, coef){ const n = Math.floor(Math.sqrt(Math.max(0,xp)/coef)); return {n, debut:coef*n*n, suivant:coef*(n+1)*(n+1)}; }
const rangDe = n => RANGS[Math.min(Math.floor(n/10), RANGS.length-1)];
const palierDe = n => Math.min(Math.floor(Math.max(0, +n || 0)/10), RANGS.length-1);

/* ---- nameplates : une par palier de rang (auto) + une par module complété ----
   Module complété = toutes les questions réussies + tous les exos validés (examens blancs exclus).
   Pour les autres joueurs, on passe les stats déjà bornées par l'XP vérifiée. */
function moduleComplet(st, m){
  const tot = Math.floor(+(m && m.items) || 0);
  return tot > 0 && !!st && Math.max(0, Math.floor(+st.reussies || 0)) + Math.max(0, Math.floor(+st.exos || 0)) >= tot;
}
/* placeholders créés depuis le panel (config.placeholders = [{id, nom, icone, bg, ac}]) → entrées de type liste.json, bientot:true */
function lumHex(h){ const n = parseInt(h.slice(1), 16), c = k => { const v = ((n >> k) & 255)/255; return v <= .03928 ? v/12.92 : Math.pow((v + .055)/1.055, 2.4); }; return .2126*c(16) + .7152*c(8) + .0722*c(0); }
function placeholders(cfg){
  const hex = (v, d) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : d;
  return ((cfg && cfg.placeholders) || []).filter(p => p && typeof p.id === "string" && p.id && typeof p.nom === "string" && p.nom).map(p => {
    const bg = hex(p.bg, "#1b1b1e"), ac = hex(p.ac, "#7F49B4");
    return {id:p.id, nom:p.nom, icone:String(p.icone || "▣").slice(0, 4), bientot:true, chapitres:[], items:0,
      theme:{bg, fg:lumHex(bg) > .4 ? "#141414" : "#CFCFCF", ac, onAc:lumHex(ac) > .4 ? "#141414" : "#FFFFFF"}};
  });
}
function plaquesDebloquees(niveau, stats, liste){
  const out = []; for(let k = 0; k <= palierDe(niveau); k++) out.push("r" + k);
  for(const m of liste || []) if(m && m.id && moduleComplet(stats && stats[m.id], m)) out.push("m:" + m.id);
  return out;
}
function plaqueEquipee(choix, debloquees, niveau){ return typeof choix === "string" && debloquees.includes(choix) ? choix : "r" + palierDe(niveau); }

function valeursPour(cfgDoc, jour){
  const prec = ((cfgDoc && cfgDoc.precedentes) || []).slice().sort((a,b)=> a.jusqua < b.jusqua ? -1 : 1);
  for(const p of prec) if(jour <= p.jusqua) return Object.assign({}, DEFAUT, p.valeurs);
  return Object.assign({}, DEFAUT, cfgDoc && cfgDoc.valeurs);
}

/* progression dans le module : ×1 sur la 1re notion → ×progMax sur la dernière (linéaire sur le parcours de notions) */
const bornerProg = x => Math.max(1, Math.min(3, isFinite(+x) ? +x : 1));
function progMaxModule(cfgDoc, id, v){
  const r = cfgDoc && cfgDoc.modules && cfgDoc.modules[id];
  return bornerProg(r && r.progMax != null && r.progMax !== "" ? r.progMax : (v || DEFAUT).progressionMax);
}

/* =====================================================================
   CALCUL PUR : journal → XP, niveau, série, sessions, détail par réponse
   ===================================================================== */
function calculer(evenements, ctx = {}){
  const now = ctx.maintenant || Date.now();
  const cfgDoc = ctx.config || {};
  const cacheV = {}; const V = j => cacheV[j] || (cacheV[j] = valeursPour(cfgDoc, j));
  const Vn = valeursPour(cfgDoc, "9999-12-31");
  const H = Vn.serieHeure;
  const aujourdhui = jourDe(now, H);
  const durees = cfgDoc.durees || {};
  const cal = ctx.calendrier || {};
  const evals = cal.evals || [], vacances = cal.vacances || [];
  const dec = (ctx.decisions && ctx.decisions.contestations) || {};
  const corr = (ctx.corrections && ctx.corrections.items) || {};

  /* Le journal est écrit par le joueur : on ne lui fait pas confiance.
     Type, durée, module, nb d'étapes viennent des BANQUES (ctx.catalogue) ; le reste est borné. */
  const cat = ctx.catalogue || null, tMax = now + 5*6e4, TYPES = ["qcm","qcm-multi","saisie","trous","exo","controle"];
  const propre = e => {
    if(!e || typeof e !== "object" || typeof e.i !== "string" || e.i.length > 40 || typeof e.q !== "string" || e.q.length > 120) return null;
    const t = +e.t; if(!isFinite(t) || t <= 0 || t > tMax) return null;
    const x = {i:e.i, t, q:e.q, m:String(e.m || "").slice(0,60), c:String(e.c || "").slice(0,120), ty:e.ty, ok:e.ok ? 1 : 0, d:Math.max(0, +e.d || 0),
      e:Math.max(0, Math.floor(+e.e || 0)), ne:Math.max(1, Math.floor(+e.ne || 1)), h:Math.max(0, Math.min(10, Math.floor(+e.h || 0)))};
    if(e.tm != null && isFinite(+e.tm)) x.tm = Math.max(0, +e.tm);
    if(e.sd != null && isFinite(+e.sd)) x.sd = Math.max(0, +e.sd);
    if(cat){
      const it = cat[e.q]; if(!it) return null;
      x.ty = it.type; x.d = +it.duree || 0; x.m = it.module; x.c = it.chapitre; x.ne = it.etapes || 1; x.pos = Math.max(0, Math.min(1, +it.pos || 0));
      const sd = it.dureesEtapes && it.dureesEtapes[x.e]; if(sd != null) x.sd = +sd; else delete x.sd;
      /* étapes guideSeul (accompagnement, affichées en Guidé seulement) : lues dans la banque */
      if(it.seuls && it.seuls.some(Boolean)){
        x.gs = !!it.seuls[x.e]; x.nv = it.seuls.filter(g => !g).length;
        x.sv = it.seuls.reduce((a, g, k) => g ? a : a + (it.dureesEtapes[k] != null ? +it.dureesEtapes[k] : x.d/x.ne), 0);   // durée des étapes affichées en Classique / Mock
      }
    } else { x.d = Math.min(x.d, 120); if(x.sd != null) x.sd = Math.min(x.sd, x.d); }
    if(!TYPES.includes(x.ty) || x.e >= x.ne) return null;
    if(x.ty === "exo"){ x.r = String(e.r || "?").slice(0,40); x.mo = (e.mo === "mock" || e.mo === "classique") && !x.h ? e.mo : "guide"; }  // classique / mock avec indices = guidé
    return x;
  };
  const vus = new Set();
  const liste = (evenements || []).map(propre).filter(e => e && !vus.has(e.i) && vus.add(e.i)).sort((a,b)=> a.t - b.t || (a.i < b.i ? -1 : 1));
  /* passages d'exo qui contiennent une étape guideSeul (quel que soit l'ordre) : chaque étape y garde sa propre durée */
  const runsAide = new Set(liste.filter(e => e.ty === "exo" && e.gs).map(e => e.q + "|" + e.r));

  const enEval = (e, jour, v) => evals.some(ev => ev.module === e.m && (!ev.chapitres || !ev.chapitres.length || ev.chapitres.includes(e.c)) && jour <= ev.date && ecartJours(jour, ev.date) <= v.evalFenetre);
  const neutre = j => { const w = new Date(j+"T12:00:00").getDay(); return w === 0 || w === 6 || vacances.some(p => j >= p.debut && j <= p.fin); };

  const items = {}, exos = {}, ctls = {}, mods = {}, effortJour = {}, details = {};
  const mod = id => mods[id] || (mods[id] = {xp:0, reussies:new Set(), exos:new Set()});
  const parOrdre = [];

  for(const e of liste){
    const jour = jourDe(e.t, H), v = V(jour), evl = enEval(e, jour, v);
    let ok = !!e.ok, corrige = false;
    if(!ok && corr[e.q] && e.t < corr[e.q]){ ok = true; corrige = true; }
    const f = []; let xp = 0, bonus = 0, effort = 0, contestable = false, maitrise = false;
    const m = mod(e.m);

    if(e.ty === "exo"){
      const dOrig = e.d || 1, dTot = durees[e.q] != null ? +durees[e.q] : dOrig, ne = e.ne || 1;
      let sd = (e.sd != null ? e.sd : dOrig/ne) * (dTot/dOrig);
      /* passage sans étape guideSeul (Classique / Mock) : toute la durée de l'exo est répartie sur les étapes affichées */
      if(e.sv > 0 && !e.gs && !runsAide.has(e.q + "|" + e.r)) sd *= dOrig / e.sv;
      effort = sd;
      const x = exos[e.q] || (exos[e.q] = {runs:[], ok:{}, err:new Set(), valide:false, m:e.m});
      if(!x.runs.includes(e.r)) x.runs.push(e.r);
      const passage = x.runs.indexOf(e.r) + 1;
      if(ok){
        const conc = Math.min(1 + dTot/v.concentrationDiv, v.concentrationMax);
        xp = v.xpParMinute * sd * v.formatProduction * conc;
        f.push("exo ×"+fmt(v.formatProduction)); if(conc > 1.005) f.push("concentration ×"+fmt(conc));
        const mm = e.mo === "mock" ? v.modeMock : e.mo === "classique" ? v.modeClassique : v.modeGuide; xp *= mm; f.push((e.mo === "mock" ? "mock" : e.mo === "classique" ? "classique" : "guidé")+" ×"+fmt(mm));
        if(x.err.has(e.e || 0)){ xp *= v.rattrapage; f.push("rattrapage ×"+fmt(v.rattrapage)); x.err.delete(e.e || 0); }
        if(passage > v.exoPassagesPleins){ xp *= v.exoMultApres; f.push(passage+"e passage ×"+fmt(v.exoMultApres)); }
        const seuil = passage === 1 ? v.exoSeuil1 : v.exoSeuilN;
        if(e.tm != null && e.tm < sd*60*seuil){
          if(dec[e.i] === "ok") f.push("contestation validée ✓");
          else { xp *= v.exoPenalite; f.push("trop rapide ×"+fmt(v.exoPenalite)); contestable = dec[e.i] !== "non"; }
        }
        const s = x.ok[e.r] || (x.ok[e.r] = new Set()); if(!e.gs) s.add(e.e || 0);   // validé = étapes non guideSeul réussies dans un même passage
        if(s.size >= (e.nv || ne) && !x.valide){ x.valide = true; m.exos.add(e.q); }
      } else x.err.add(e.e || 0);
    } else if(e.ty === "controle"){
      /* question de contrôle du cours (follow-along) : un peu d'XP, une seule fois à vie */
      if(ctls[e.q]) f.push("contrôle déjà validé : 0 XP");
      else if(ok){ ctls[e.q] = 1; xp = v.controle; effort = v.effortQcm; f.push("contrôle du cours (1re réussite)"); }
    } else {
      const it = items[e.q] || (items[e.q] = {jours:new Set(), maitrise:false, bonusDonne:false, cred:"", erreur:false, m:e.m});
      const prod = e.ty === "saisie";
      effort = (prod ? v.effortSaisie : (e.ty === "qcm-multi" || e.ty === "trous") ? v.effortQcmMulti : v.effortQcm) * (it.maitrise ? .5 : 1);
      if(ok){
        if(e.ty === "qcm-multi"){ xp = v.qcmMulti; f.push("QCM multi"); }
        else if(e.ty === "trous"){ xp = v.trous; f.push("code à trous"); }
        else if(prod){
          const d = durees[e.q] != null ? +durees[e.q] : (e.d || v.dureeSaisie);
          const conc = Math.min(1 + d/v.concentrationDiv, v.concentrationMax);
          xp = v.xpParMinute * d * v.formatProduction * conc; f.push("tapée ×"+fmt(v.formatProduction));
        } else { xp = v.qcm; f.push("QCM"); }
        if(it.cred === jour){ xp *= v.repetitionJour; f.push("déjà faite aujourd'hui ×"+fmt(v.repetitionJour)); }
        else {
          it.cred = jour;
          if(it.maitrise){ if(evl) f.push("mode éval ×1"); else { xp *= v.maitriseMult; f.push("maîtrisée ×"+fmt(v.maitriseMult)); } }
        }
        if(it.erreur){ xp *= v.rattrapage; f.push("rattrapage ×"+fmt(v.rattrapage)); it.erreur = false; }
        it.jours.add(jour);
        if(!it.maitrise && it.jours.size >= v.maitriseJours){
          it.maitrise = true; maitrise = true;
          if(!it.bonusDonne){ it.bonusDonne = true; bonus += v.maitriseBonus; f.push("✓ Maîtrisée ! +"+v.maitriseBonus); }
        }
        m.reussies.add(e.q);
      } else { it.erreur = true; it.maitrise = false; it.jours.clear(); }
    }
    if(corrige){ const rs = ctx.corrections && ctx.corrections.raisons, r = rs && rs[e.q]; f.push("item corrigé : XP rendue" + (r ? " — " + r : "")); }
    if(ok && e.ty !== "controle" && xp > 0){
      const pm = progMaxModule(cfgDoc, e.m, v), mp = 1 + (pm - 1)*(e.pos || 0);
      if(mp > 1.005){ xp *= mp; f.push("progression ×"+fmt(mp)); }
    }
    if(ok && e.h){ const h = Math.min(e.h, v.indicesMax); xp *= Math.max(0, 1 - v.indiceCout*h); f.push(h+" indice"+(h>1?"s":"")+" −"+Math.round(v.indiceCout*h*100)+" %"); }
    const cum = effortJour[jour] || 0, plus = evl ? v.plafondEvalBonus : 0;
    const pm = cum < v.plafondSeuil1 + plus ? 1 : cum < v.plafondSeuil2 + plus ? v.plafondMult2 : v.plafondMult3;
    if(ok && pm < 1){ xp *= pm; f.push("plafond du jour ×"+fmt(pm)); }
    effortJour[jour] = cum + effort;
    const d = {i:e.i, t:e.t, q:e.q, m:e.m, ty:e.ty, jour, ok, xp, bonus, effort, f, contestable, maitrise};
    details[e.i] = d; parOrdre.push(d);
  }

  /* ---- séries (jours validés en minutes d'effort) ---- */
  const jours = Object.keys(effortJour).sort();
  const serieDe = {}; let s = 0, jokers = 0, jokersUtilises = 0;
  if(jours.length){
    for(let j = jours[0]; j <= aujourdhui; j = plusJours(j,1)){
      const v = V(j), valide = (effortJour[j] || 0) >= v.serieJourMin;
      if(valide){ s++; if(s % v.jokerTous === 0) jokers = Math.min(v.jokerMax, jokers+1); }
      else if(j === aujourdhui || neutre(j)){}
      else if(jokers > 0){ jokers--; jokersUtilises++; }
      else s = Math.floor(s/2);
      serieDe[j] = s;
    }
  }

  /* ---- sessions & bonus (précision + endurance + série) ---- */
  const sessions = []; let cur = null;
  for(const d of parOrdre){
    const v = V(d.jour), gap = cur ? d.t - cur.fin : Infinity;
    const continue_ = cur && (gap <= v.sessionInactivite*6e4 || (d.ty === "exo" && gap <= (v.sessionInactivite + 2*d.effort)*6e4));
    if(!continue_){ cur = {debut:d.t, fin:d.t, jour:d.jour, xp:0, n:0, ok:0, effort:0, parModule:{}}; sessions.push(cur); }
    cur.fin = d.t; cur.xp += d.xp + d.bonus; if(d.ty !== "controle"){ cur.n++; if(d.ok) cur.ok++; } cur.effort += d.effort;   // contrôles du cours hors précision
    cur.parModule[d.m] = (cur.parModule[d.m] || 0) + d.xp + d.bonus;
  }
  let total = 0, attente = null; const xpJour = {};
  for(const d of parOrdre){ total += d.xp + d.bonus; mod(d.m).xp += d.xp + d.bonus; xpJour[d.jour] = (xpJour[d.jour] || 0) + d.xp + d.bonus; }
  sessions.forEach((se, k) => {
    const v = V(se.jour);
    const prec = se.n >= v.precisionMin ? palier(v.precision, se.ok/se.n*100) : 0;
    const end = palier(v.endurance, se.effort);
    const ser = Math.min((serieDe[se.jour] || 0) * v.seriePas, v.seriePlafond);
    se.pct = {precision:prec, endurance:end, serie:ser, total:prec+end+ser};
    se.bonus = se.xp * se.pct.total / 100;
    se.ouverte = k === sessions.length-1 && (now - se.fin) <= v.sessionInactivite*6e4;
    se.precisionPct = se.n ? Math.round(se.ok/se.n*100) : 0;
    const prochain = (v.endurance||[]).find(([m]) => m > se.effort);
    se.enduranceProchain = prochain ? {minutes:prochain[0], pct:prochain[1]} : null;
    if(se.ouverte){ attente = se; return; }
    total += se.bonus; xpJour[se.jour] = (xpJour[se.jour] || 0) + se.bonus;
    for(const [m, x] of Object.entries(se.parModule)) if(se.xp > 0) mod(m).xp += se.bonus * x / se.xp;
  });

  const niv = niveauDe(total, Vn.niveauCoef);
  const modules = {};
  for(const [id, m] of Object.entries(mods)) modules[id] = {xp:Math.round(m.xp), reussies:m.reussies.size, exos:m.exos.size, maitrisees:0};
  for(const it of Object.values(items)) if(it.maitrise && modules[it.m]) modules[it.m].maitrisees++;
  const vAuj = V(aujourdhui);
  return {
    total:Math.round(total), niveau:niv.n, rang:rangDe(niv.n), xpDebut:niv.debut, xpSuivant:niv.suivant,
    pctNiveau: niv.suivant > niv.debut ? (total - niv.debut)/(niv.suivant - niv.debut)*100 : 0,
    serie:{jours:s, jokers, jokersUtilises, effortAujourdhui:effortJour[aujourdhui] || 0, valideAujourdhui:(effortJour[aujourdhui] || 0) >= vAuj.serieJourMin, bonusPct:Math.min(s*vAuj.seriePas, vAuj.seriePlafond), seuil:vAuj.serieJourMin},
    session:attente, sessions:sessions.length, modules, details, controles:Object.keys(ctls),
    carnet:Object.entries(items).filter(([,it]) => it.erreur).map(([q,it]) => ({q, m:it.m})),
    effortTotal:Object.values(effortJour).reduce((a,b)=>a+b,0), aujourdhui,
    jours:Object.fromEntries(Object.keys(effortJour).map(j => [j, {xp:Math.round(xpJour[j] || 0), eff:Math.round(effortJour[j]*10)/10}]))
  };
}

/* =====================================================================
   CLASSEMENT : on ne croit pas le total publié. On recalcule depuis le
   résumé par jour ; un jour au-delà de l'humainement possible (minutes
   d'effort max, XP max par minute d'effort) compte 0, en silence.
   ===================================================================== */
function xpClassement(doc, cfgDoc, depuis, jusqua, toutTemps){
  const v = valeursPour(cfgDoc, "9999-12-31"), auj = jourDe(Date.now(), v.serieHeure);
  /* plafond relevé du multiplicateur de progression le plus haut (sinon un joueur parfait en fin de module serait écrêté) */
  const regs = Object.values((cfgDoc && cfgDoc.modules) || {}).filter(r => r && typeof r === "object");
  const fp = regs.length ? Math.max(...regs.map(r => bornerProg(r.progMax != null && r.progMax !== "" ? r.progMax : v.progressionMax))) : bornerProg(v.progressionMax);
  let total = 0; const suspects = [];
  const jours = (doc && typeof doc.jours === "object" && doc.jours) || {};
  for(const [j, x] of Object.entries(jours)){
    if(!/^\d{4}-\d\d-\d\d$/.test(j) || j > auj || !x || typeof x !== "object"){ suspects.push(j); continue; }
    if((!toutTemps && v.classementDebut && j < v.classementDebut) || (depuis && j < depuis) || (jusqua && j > jusqua)) continue;
    const effBrut = Math.max(0, +x.eff || 0), eff = Math.min(effBrut, v.classementEffortMax), xp = Math.max(0, +x.xp || 0);
    const s1 = v.plafondSeuil1, s2 = v.plafondSeuil2;
    const max = fp*(v.classementTaux1*Math.min(eff, s1) + v.classementTaux2*Math.max(0, Math.min(eff, s2) - s1) + v.classementTaux3*Math.max(0, eff - s2));
    if(xp > max + 1 || effBrut > v.classementEffortMax){ suspects.push(j); continue; }   // jour anormal : compte 0, sans prévenir
    total += xp;
  }
  total = Math.round(total);
  return {total, niveau:niveauDe(total, v.niveauCoef).n, rang:rangDe(niveauDe(total, v.niveauCoef).n), suspects};
}

/* =====================================================================
   ÉTAT, SYNCHRO db
   ===================================================================== */
const E = {
  mode:"chargement",      // chargement | synchro | invite | lecture
  sync:"…", db:null, user:null, uid:null, isOwner:false,
  config:null, calendrier:null, decisions:null, corrections:null, verifies:null, joueur:null, annonce:null,
  docs:{}, miens:{}, sales:new Set(), ecriture:false, charge:false,
  items:{}, catalogue:null, runs:{}, res:null, ecouteurs:new Set(), exoEnCours:0, dernierClassement:""
};
let dev = "x" + Math.random().toString(36).slice(2,8);
try{ dev = localStorage.getItem("bic2.dev") || (localStorage.setItem("bic2.dev", dev), dev); }catch(e){}

function tousLesEvenements(){
  const m = new Map();
  for(const evs of Object.values(E.docs)) for(const e of evs) m.set(e.i, e);
  for(const evs of Object.values(E.miens)) for(const e of evs) m.set(e.i, e);
  return [...m.values()];
}
function contexte(extra){ return Object.assign({config:E.config, calendrier:E.calendrier, decisions:E.decisions, corrections:E.corrections, catalogue:E.catalogue}, extra); }
function recalculer(){
  E.res = calculer(tousLesEvenements(), contexte());
  E.ecouteurs.forEach(fn => { try{ fn(E.res, E); }catch(err){ console.error(err); } });
  rendreHUD();
  publierClassement();
}
let tRecalc = 0;
const recalculerBientot = () => { clearTimeout(tRecalc); tRecalc = setTimeout(recalculer, 60); };
setInterval(() => { if(E.res && E.res.session) recalculer(); }, 60000); // fermeture de session après inactivité

function setSync(s){ E.sync = s; rendreSync(); }

/* Budget Firestore (plan gratuit) : les réponses sont regroupées et écrites au plus
   toutes les ~50 s (le minuteur n'est PAS relancé à chaque réponse), et tout de suite
   quand la page passe en arrière-plan ou se ferme. */
const DELAI_ECRITURE = 50000, DELAI_CLASSEMENT = 180000;
let tEcr = 0;
function planifier(id){ E.sales.add(id); if(!tEcr) tEcr = setTimeout(() => { tEcr = 0; vider(); }, DELAI_ECRITURE); if(E.mode === "synchro") setSync("envoi"); }
function toutEnvoyer(){ clearTimeout(tEcr); tEcr = 0; if(E.sales.size) vider(); if(tClass){ clearTimeout(tClass); tClass = 0; envoyerClassement(); } }
async function vider(){
  if(E.ecriture || E.mode !== "synchro" || !E.charge || !E.sales.size) return;
  E.ecriture = true;
  try{
    for(const id of [...E.sales]){
      E.sales.delete(id);
      const envoi = E.miens[id].slice();
      await E.db.doc(`data/users/${E.uid}/${id}`).set({ev:envoi, appareil:dev, v:1});
      fileConfirmer(id, envoi);
    }
    setSync("ok");
  }catch(err){
    const code = err && err.code;
    if(code === "invalid_argument" || code === "not_granted" || code === "revoked" || code === "capability_disabled"){
      E.mode = "lecture"; setSync("lecture"); rendreHUD();
    } else if(code === "quota_exceeded"){ Object.keys(E.miens).forEach(id => E.sales.add(id)); setSync("plein"); setTimeout(vider, 10*60e3); /* quota gratuit du jour atteint : on garde tout et on réessaie */ }
    else { Object.keys(E.miens).forEach(id => E.sales.add(id)); setSync("erreur"); setTimeout(vider, 15000); }
  }finally{
    E.ecriture = false;
    if(E.sales.size && E.mode === "synchro") planifier([...E.sales][0]);
  }
}
/* FILE D'ENVOI : une écriture lancée au moment où l'on quitte la page est perdue par le navigateur.
   Les réponses pas encore confirmées par le serveur sont donc gardées dans une petite file locale
   (bic2.envoi.<uid>), renvoyée au chargement suivant puis VIDÉE dès que le serveur confirme.
   Ce n'est pas un stockage de progression : rien n'est calculé à partir d'elle seule,
   le journal sur le serveur reste la seule source de vérité. */
const cleFile = () => "bic2.envoi." + E.uid;
let fileOk = false;
function lireFile(){ try{ return JSON.parse(localStorage.getItem(cleFile()) || "{}") || {}; }catch(e){ return {}; } }
function ecrireFile(f){ try{ if(Object.keys(f).length) localStorage.setItem(cleFile(), JSON.stringify(f)); else localStorage.removeItem(cleFile()); fileOk = true; }catch(e){ fileOk = false; } }
function fileAjouter(id, ev){ if(!E.uid) return; const f = lireFile(); (f[id] || (f[id] = [])).push(ev); ecrireFile(f); }
function fileConfirmer(id, envoyes){ if(!E.uid) return; const f = lireFile(); if(!f[id]) return; const ok = new Set(envoyes.map(e => e.i)); f[id] = f[id].filter(e => !ok.has(e.i)); if(!f[id].length) delete f[id]; ecrireFile(f); }
function fileReprendre(){
  const f = lireFile();
  for(const [id, evs] of Object.entries(f)){
    if(!/^j_/.test(id) || !Array.isArray(evs)) continue;
    const loc = E.miens[id] || [], ids = new Set(loc.map(e => e.i));
    E.miens[id] = loc.concat(evs.filter(e => e && e.i && !ids.has(e.i))).sort((a,b) => a.t - b.t);
    E.sales.add(id);
  }
  ecrireFile(f);
}
addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") toutEnvoyer(); });
addEventListener("pagehide", toutEnvoyer);
/* alerte « quitter la page ? » seulement si la file locale est indisponible (navigation privée stricte…) */
addEventListener("beforeunload", e => { if(E.sales.size && E.mode === "synchro"){ toutEnvoyer(); if(!fileOk){ e.preventDefault(); e.returnValue = ""; } } });

function ajouter(ev){
  const id = "j_" + jourDe(ev.t, valeursPour(E.config, "9999-12-31").serieHeure) + "_" + dev;
  (E.miens[id] || (E.miens[id] = [])).push(ev);
  if(E.mode === "synchro") fileAjouter(id, ev);
  E.res = calculer(tousLesEvenements(), contexte());
  if(E.mode === "synchro") planifier(id);
  E.ecouteurs.forEach(fn => { try{ fn(E.res, E); }catch(err){ console.error(err); } });
  rendreHUD(); publierClassement();
}

/* résumé du classement : au plus une écriture toutes les 3 min (+ à la fermeture / mise en arrière-plan) */
let tClass = 0;
function donneesClassement(){ const r = E.res; return {jours:r.jours, serie:r.serie.jours, modules:r.modules}; }
/* signature stable (clés triées) : Firestore ne rend pas les champs dans l'ordre d'écriture */
const signature = o => JSON.stringify(o, (k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, c) => (a[c] = v[c], a), {}) : v);
function publierClassement(){
  if(E.mode !== "synchro" || !E.charge || !E.res) return;
  if(signature(donneesClassement()) === E.dernierClassement || tClass) return;
  /* 1re publication de la page : rapide (une écriture lancée en quittant la page serait perdue),
     les suivantes au plus toutes les 3 min */
  const delai = E.classementPublie ? DELAI_CLASSEMENT : 8000;
  tClass = setTimeout(() => { tClass = 0; E.classementPublie = true; envoyerClassement(); }, delai);
}
async function envoyerClassement(){
  if(E.mode !== "synchro" || !E.charge || !E.res) return;
  const data = donneesClassement(), sig = signature(data);
  if(sig === E.dernierClassement) return;
  E.dernierClassement = sig;
  try{ await E.db.doc("classement/" + E.uid).set(Object.assign({maj:Date.now()}, data)); }catch(e){ E.dernierClassement = ""; }
}

function ecouterDoc(chemin, cle){
  return new Promise(res => {
    let fini = false; const t = setTimeout(() => { if(!fini){ fini = true; res(); } }, 10000);
    E.db.doc(chemin).onSnapshot(s => {
      E[cle] = s.exists ? s.data() : null;
      if(!fini && !s.metadata.fromCache){ fini = true; clearTimeout(t); res(); }
      if(E.charge) recalculerBientot();
    }, () => { if(!fini){ fini = true; clearTimeout(t); res(); } });
  });
}
function ecouterJournal(){
  return new Promise(res => {
    let fini = false; const t = setTimeout(() => { if(!fini){ fini = true; setSync("lent"); res(); } }, 10000);
    E.db.collection("data/users/" + E.uid).onSnapshot(snap => {
      const docs = {};
      for(const d of snap.docs){
        if(!d.id.startsWith("j_")) continue;
        const ev = (d.data() || {}).ev || [];
        if(d.id.endsWith("_" + dev)){
          const loc = E.miens[d.id] || [], ids = new Set(loc.map(e => e.i));
          E.miens[d.id] = loc.concat(ev.filter(e => !ids.has(e.i))).sort((a,b)=> a.t - b.t);
        } else docs[d.id] = ev;
      }
      E.docs = docs;
      if(!snap.metadata.fromCache && !E.charge){ E.charge = true; if(E.sales.size) vider(); }
      if(!fini && !snap.metadata.fromCache){ fini = true; clearTimeout(t); setSync("ok"); res(); }
      recalculerBientot();
    }, () => { if(!fini){ fini = true; clearTimeout(t); res(); } setSync("erreur"); });
  });
}

/* catalogue = toutes les banques : seule source des types et durées */
async function chargerCatalogue(){
  try{
    const r = await fetch("modules/liste.json"); if(!r.ok) return;
    const liste = await r.json(); if(!Array.isArray(liste)) return;
    const cat = {};
    await Promise.all(liste.map(async m => {
      const chs = await Promise.all((m.chapitres || []).map(ch => fetch(`banques/${m.id}/${ch}.json`).then(x => x.ok ? x.json() : null).catch(() => null)));
      chs.forEach(j => { if(j) ajouterAuCatalogue(cat, j, m.id); });
      poserPositions(cat, chs);
    }));
    E.catalogue = cat;
  }catch(e){ /* hors ligne : pas de validation, l'affichage perso reste juste */ }
}
/* position (0 → 1) de chaque item dans le parcours du module : rang de sa notion parmi toutes les notions, dans l'ordre des chapitres de liste.json */
function poserPositions(cat, chs){
  const rang = {}; let n = 0;
  for(const j of chs) if(j && j.id) for(const nt of j.notions || []) if(nt && nt.id != null) rang[j.id + "|" + nt.id] = n++;
  const den = Math.max(1, n - 1);
  for(const j of chs){
    if(!j || !j.id) continue;
    const prem = (j.notions || [])[0], base = prem && prem.id != null ? rang[j.id + "|" + prem.id] : 0;
    for(const it of j.items || []){
      const c = it && cat[it.id]; if(!c) continue;
      const r = rang[j.id + "|" + it.notion];
      c.pos = (r != null ? r : (base || 0)) / den;
    }
  }
}
function ajouterAuCatalogue(cat, ch, moduleId){
  for(const it of (ch && ch.items) || []){
    if(!it || it.type === "examen" || !it.id) continue;
    const et = it.etapes || [];
    cat[it.id] = {type:it.type, duree:it.duree, module:ch.module || moduleId, chapitre:ch.id, etapes:et.length || 1, dureesEtapes:et.map(s => s.duree), seuls:et.map(s => !!(s && s.guideSeul)), pos:(cat[it.id] && cat[it.id].pos) || 0};   // pos conservée si l'item est déjà au catalogue (charger() ne la connaît pas)
  }
  /* checks de validation des notions : id = check.id, sinon <chapitre>-ctl-<n° de notion> */
  ((ch && ch.notions) || []).forEach((n, k) => {
    if(n && n.check && ch.id) cat[n.check.id || `${ch.id}-ctl-${k}`] = {type:"controle", duree:0, module:ch.module || moduleId, chapitre:ch.id, etapes:1, dureesEtapes:[]};
  });
  /* anciens chapitres (parcours + controle) */
  ((ch && ch.parcours) || []).forEach((p, k) => {
    if(p && p.controle && ch.id) cat[idControle(ch, k)] = {type:"controle", duree:0, module:ch.module || moduleId, chapitre:ch.id, etapes:1, dureesEtapes:[]};
  });
}
function idControle(ch, k){ const n = ((ch && ch.notions) || [])[k]; if(n && n.check) return n.check.id || `${ch.id}-ctl-${k}`; const p = ((ch && ch.parcours) || [])[k]; return (p && p.controle && p.controle.id) || `${ch.id}-ctl-${k}`; }

let initP = null;
async function init(opts = {}){
  if(initP) return initP;
  E.moduleCourant = opts.module || null;
  initP = (async () => {
    const use = n => (window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null);
    const [db, user] = await Promise.all([use("db"), use("user"), chargerCatalogue()]);
    E.db = db; E.user = user;
    try{ E.isOwner = user ? !!(await user.isOwner()) : false; }catch(e){}
    try{ E.uid = user ? await user.id() : null; }catch(e){}
    if(!db){ E.mode = "invite"; setSync("invite"); recalculer(); return E; }
    const attente = [
      ecouterDoc("config/actuelle", "config"), ecouterDoc("config/corrections", "corrections"),
      ecouterDoc("config/annonce", "annonce"), ecouterDoc("calendrier/principal", "calendrier")
    ];
    if(E.uid){
      E.mode = "synchro";
      fileReprendre();
      attente.push(ecouterDoc("decisions/" + E.uid, "decisions"), ecouterDoc("joueurs/" + E.uid, "joueur"), ecouterJournal(),
        /* dernier résumé publié : évite de republier le même classement à chaque changement de page */
        E.db.doc("classement/" + E.uid).get().then(s => { if(s.exists){ const c = s.data(); E.dernierClassement = signature({jours:c.jours, serie:c.serie, modules:c.modules}); } }).catch(() => {}));
    } else { E.mode = "invite"; setSync("invite"); }
    await Promise.all(attente);
    E.charge = E.charge || E.mode !== "synchro";
    recalculer();
    return E;
  })();
  return initP;
}

/* =====================================================================
   API DES MODULES
   ===================================================================== */
function charger(ch){
  if(!ch || !ch.items) return;
  ajouterAuCatalogue(E.items, ch, ch.module);
  if(E.catalogue) ajouterAuCatalogue(E.catalogue, ch, ch.module);
}
function debutExo(id){ const r = nouvelId(); E.runs[id] = r; E.exoEnCours = Date.now(); return r; }
function finExo(id){ delete E.runs[id]; E.exoEnCours = 0; }

function reponse(id, correct, tempsMis, extra = {}){
  const it = E.items[id] || extra.item;
  if(!it){ console.warn("[xp.js] item inconnu, appelle moteur.charger(chapitre) d'abord :", id); return null; }
  const ev = {i:nouvelId(), t:Date.now(), q:id, m:it.module, c:it.chapitre, ty:it.type, ok:correct ? 1 : 0, d:it.duree};
  if(tempsMis != null) ev.tm = Math.round(tempsMis*10)/10;
  if(extra.indices) ev.h = extra.indices;
  if(it.type === "exo"){
    ev.mo = (extra.mode === "mock" || extra.mode === "classique") && !extra.indices ? extra.mode : "guide";
    ev.e = extra.etape || 0; ev.ne = it.etapes; ev.r = extra.run || E.runs[id] || debutExo(id);
    const sd = it.dureesEtapes && it.dureesEtapes[ev.e]; if(sd != null) ev.sd = sd;
  }
  ajouter(ev);
  const d = E.res.details[ev.i];
  if(extra.bulle !== false) bulle(d);
  return d;
}

async function ecrireListe(chemin, item){
  if(E.mode !== "synchro") return false;
  const ref = E.db.doc(chemin);
  const s = await ref.get(); const items = ((s.exists && s.data().items) || []).slice();
  items.push(item); await ref.set({items}); return true;
}
function contester(evId, message = ""){
  const d = E.res && E.res.details[evId]; if(!d) return Promise.resolve(false);
  const ev = tousLesEvenements().find(e => e.i === evId);
  return ecrireListe("contestations/" + E.uid, {ev:evId, q:d.q, m:d.m, t:d.t, tm:ev && ev.tm, d:ev && ev.d, sd:ev && ev.sd, ne:ev && ev.ne, message, envoye:Date.now()});
}
function signaler(idItem, message = "", contexte = null){
  const it = E.items[idItem] || {};
  const doc = {q:idItem, m:it.module || E.moduleCourant, message, envoye:Date.now()};
  if(contexte && contexte.enonce != null){ doc.enonce = contexte.enonce; doc.rep = contexte.rep || []; }   /* énoncé vu + réponse(s) du joueur */
  return ecrireListe("signalements/" + E.uid, doc);
}
async function ecrireJoueur(champs){
  if(E.mode !== "synchro") return false;
  const j = E.joueur || {}, doc = {pseudo:j.pseudo || "", maj:Date.now(), cree:j.cree || Date.now()};
  if(typeof j.plaque === "string") doc.plaque = j.plaque;
  await E.db.doc("joueurs/" + E.uid).set(Object.assign(doc, champs));
  return true;
}
const definirPseudo = pseudo => ecrireJoueur({pseudo});
const definirPlaque = id => ecrireJoueur({plaque:String(id).slice(0, 60)});

/* =====================================================================
   SONS + HUD + BULLES
   ===================================================================== */
const SONS = {};
function son(n = "tap"){
  try{
    const a = SONS[n] || (SONS[n] = Object.assign(new Audio("sons/" + n + ".mp3"), {preload:"auto", volume:n === "hover" ? .6 : 1}));
    a.currentTime = 0; a.play().catch(() => {});
  }catch(e){}
}

function titreHTML(nom = "BIC2.exe"){ return [...nom].map((c,i) => `<span data-c="${esc(c)}"${i >= 4 ? ' class="ext"' : ""}>${esc(c)}</span>`).join(""); }

let H = null; // éléments du header monté
function monterHeader(opts = {}){
  const page = opts.page || "module";
  const nav = page === "module"
    ? `<div class="hud-module"><b>${esc(opts.module && opts.module.nom || "")}</b><small data-h="xpmod">— XP module</small></div>
       <div class="hud-session" data-h="session"></div>`
    : `<nav class="nav" aria-label="Navigation">
         <a href="index.html#modules" data-nav="modules" class="${page === "hub" ? "on" : ""}">Modules</a>
         <a href="index.html#classement" data-nav="classement">Classement</a>
         <a href="index.html#joueurs" data-nav="joueurs">Joueurs</a>
         <a href="index.html#archives" data-nav="archives" data-h="archives" hidden>Archives</a>
         <a href="admin.html" data-h="admin" class="${page === "admin" ? "on" : ""}" hidden>Admin</a>
       </nav>`;
  const el = document.createElement("header");
  el.className = "header"; el.id = "hud";
  el.innerHTML = `<div class="rang">
      <a class="brand" href="index.html#modules" aria-label="BIC2.exe, retour au hub" data-h="brand">${opts.sansTitre ? "" : `<span class="titre" aria-hidden="true">${titreHTML()}</span>`}</a>
      ${nav}
      <span class="serie zero" data-h="serie" title="Série"><span class="flamme" aria-hidden="true"><i></i><i></i><i></i></span><b>0</b><small>j</small></span>
      <a class="profil" href="index.html#profil" title="Mon profil"><span class="avatar" data-h="avatar">?</span><span class="nom"><b data-h="pseudo">…</b><small data-h="niv">Niv 0 · ${RANGS[0]}</small></span></a>
      <span class="sync" data-h="sync" role="status">…</span>
    </div>
    <div class="filet-xp" aria-hidden="true"><i data-h="filet" style="width:0"></i></div>`;
  const cible = opts.cible || document.body;
  cible.prepend(el);
  const ban = document.createElement("div"); ban.className = "bandeau"; ban.hidden = true; ban.setAttribute("data-h","bandeau");
  el.after(ban);
  const bulles = document.createElement("div"); bulles.className = "bulles"; bulles.setAttribute("aria-live","polite");
  document.body.appendChild(bulles);
  H = {el, bulles, page, opts}; el.querySelectorAll("[data-h]").forEach(x => H[x.dataset.h] = x); H.bandeau = ban;
  rendreHUD(); rendreSync();
  return el;
}

const SYNC_TXT = {"…":"…", ok:"☁️ synchronisé", envoi:"☁️ envoi…", erreur:"⚠ synchro en pause", lent:"☁️ réseau lent", invite:"👤 mode invité", lecture:"🔒 lecture seule", plein:"⚠ quota du jour atteint"};
function rendreSync(){ if(H && H.sync){ H.sync.textContent = SYNC_TXT[E.sync] || E.sync; H.sync.title = H.sync.textContent; H.sync.dataset.etat = E.sync; } }

function pseudoAffiche(){ return (E.joueur && E.joueur.pseudo) || (E.mode === "invite" ? "invité" : "joueur"); }
function rendreHUD(){
  if(!H || !E.res) return;
  const r = E.res;
  H.filet.style.width = Math.max(0, Math.min(100, r.pctNiveau)) + "%";
  H.pseudo.textContent = pseudoAffiche();
  H.avatar.textContent = pseudoAffiche().charAt(0).toUpperCase();
  H.niv.textContent = `Niv ${r.niveau} · ${r.rang}`;
  H.el.querySelector(".filet-xp").title = `${nf(r.total)} XP · niveau ${r.niveau+1} dans ${nf(r.xpSuivant - r.total)} XP`;
  const sr = H.serie; sr.classList.toggle("zero", !r.serie.jours);
  sr.querySelector("b").textContent = r.serie.jours;
  sr.title = `Série de ${r.serie.jours} jour(s) · +${r.serie.bonusPct} % · ${r.serie.jokers} joker(s)` + (r.serie.valideAujourdhui ? " · jour validé ✓" : ` · encore ${Math.max(0, Math.ceil(r.serie.seuil - r.serie.effortAujourdhui))} min aujourd'hui`);
  if(H.admin) H.admin.hidden = !E.isOwner;
  if(H.archives) H.archives.hidden = !(E.config && Array.isArray(E.config.saisons) && E.config.saisons.length);
  if(H.xpmod){ const m = E.moduleCourant && r.modules[E.moduleCourant]; H.xpmod.textContent = `${nf(m ? m.xp : 0)} XP module · ${m ? m.reussies : 0} réussies`;  H.xpmod.parentNode.title = H.xpmod.textContent; H.profil = H.profil || H.el.querySelector(".profil"); H.profil.title = `${pseudoAffiche()} · Niv ${r.niveau} · ${r.rang}`; }
  if(H.session){
    const s = r.session;
    const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
    const IC = {
      timer: ico('<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>'),
      cible: ico('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
      sablier: ico('<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>')
    };
    H.session.innerHTML = s
      ? `<span title="Minutes d'effort de la session${s.enduranceProchain ? ` · +${s.enduranceProchain.pct} % d'endurance à ${s.enduranceProchain.minutes} min` : ""}">${IC.timer}<b>${Math.round(s.effort)}</b> min</span>
         <span title="Précision de la session (bonus dès ${valeursPour(E.config,"9999-12-31").precisionMin} réponses)">${IC.cible}<b>${s.precisionPct}</b> %</span>
         ${s.bonus > 0 ? `<span class="attente" title="Bonus crédité en fin de session : précision ${s.pct.precision} % + endurance ${s.pct.endurance} % + série ${s.pct.serie} %">${IC.sablier}+${nf(s.bonus)} XP</span>` : ""}`
      : `<span>${IC.timer}nouvelle session</span>`;
  }
  const b = H.bandeau;
  if(E.mode === "invite"){ b.hidden = false; b.textContent = "Mode invité : tout est jouable, mais l'XP n'est pas sauvegardée. Connecte-toi à Claude pour garder ta progression."; }
  else if(E.mode === "lecture"){ b.hidden = false; b.textContent = "Lecture seule : ton compte n'a plus le droit d'enregistrer (accès retiré ?). Recharge la page ou écris à Adam."; }
  else b.hidden = true;
}

function bulle(d){
  if(!H || !d) return;
  /* jamais de « 0 XP » : rien ne s'affiche quand une réponse ne rapporte rien (sauf si elle est contestable) */
  if(!d.ok || (d.xp + d.bonus <= 0 && !d.contestable)) return;
  const b = document.createElement("div");
  b.className = "bulle" + (d.ok ? "" : " zero") + (d.maitrise ? " maitrise" : "");
  const tot = d.xp + d.bonus;
  b.innerHTML = d.ok
    ? `<b>+${nf(tot)} XP</b> · ${esc(d.f.join(" · "))}`
    : d.ty === "exo" ? `<b>0 XP</b> · étape à retravailler`
    : d.ty === "controle" ? `<b>0 XP</b> · relis l'explication, l'XP reste à prendre`
    : `<b>0 XP</b> · à retenter : ×${fmt(valeursPour(E.config, d.jour).rattrapage)} d'XP quand tu la réussiras`;
  if(d.contestable && E.mode === "synchro"){
    const c = document.createElement("button"); c.type = "button"; c.textContent = "Contester";
    c.onclick = async () => { c.disabled = true; c.textContent = "envoi…"; const ok = await contester(d.i).catch(() => false); c.textContent = ok ? "envoyé ✓" : "échec"; };
    b.append(" ", c);
  }
  H.bulles.prepend(b);
  if(d.maitrise) son("tap");
  setTimeout(() => { b.classList.add("sort"); setTimeout(() => b.remove(), 400); }, d.contestable ? 9000 : 3200);
  while(H.bulles.children.length > 4) H.bulles.lastChild.remove();
}

/* traînée d'étoiles derrière le curseur (D.A. commune) */
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastT = 0;
addEventListener("pointermove", e => {
  if(reduit || e.pointerType !== "mouse" || document.body.classList.contains("sans-trainee")) return;
  const now = performance.now(); if(now - lastT < 45) return; lastT = now;
  const t = document.createElement("span"); t.className = "trainee"; t.textContent = "✦"; t.setAttribute("aria-hidden","true");
  t.style.left = e.clientX + "px"; t.style.top = e.clientY + "px";
  document.body.appendChild(t); setTimeout(() => t.remove(), 700);
});


/* =====================================================================
   NAMEPLATES : rendu (styles dans theme.css, classes .plaque / .pl-*)
   plaque({id:"r0".."r10"|"m:<module>", pseudo, sous, niveau, module, socle})
   ===================================================================== */
const TAGS_PLAQUE = ["[new]","0b1",null,null,"uid 0",null,"-O3","1337","ops","ring 0","# root"];
let nPlaque = 0;
function plaque(o = {}){
  const id = String(o.id || "r0"), estMod = id.startsWith("m:"), k = estMod ? -1 : Math.min(Math.max(0, parseInt(id.slice(1), 10) || 0), 10);
  const el = document.createElement("div");
  const anneau = estMod || k >= 8;
  el.className = "plaque " + (estMod ? "pl-mod" : "pl-r" + k) + (anneau ? " pl-anneau" : "") + (o.socle ? " pl-socle" : "");
  const t = (estMod && o.module && o.module.theme) || {};
  if(estMod){ if(t.ac) el.style.setProperty("--pl-ac", t.ac); if(t.bg) el.style.setProperty("--pl-bg", t.bg); if(t.font) el.style.setProperty("--pl-font", t.font); }
  const pseudo = String(o.pseudo || "?");
  let deco = "", fin = "";
  if(k === 3) fin = `<span class="pl-led"></span>`;
  if(k === 5){ deco = `<svg class="pl-ekg" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34h120l8-14 10 30 10-40 8 24h60l6-8 8 8h170"/></svg>`; fin = `<span class="pl-run"><i></i>running</span>`; }
  if(k === 6) deco = `<span class="pl-code" aria-hidden="true"><span>${("gcc -O3 main.c\nld: linking...\n[ 42%] build\ncc1: ok\n-> a.out\n[ 87%] build\n").repeat(4)}</span></span><span class="pl-prog"></span>`;
  if(k === 7) deco = [[58,14,"c"],[66,62,"r"],[74,26,"b"],[82,70,"c"],[90,18,"r"],[52,72,"b"]].map(([x,y,c],n) => `<span class="pl-st pl-${c}" style="left:${x}%;top:${y}%;animation-delay:${n*.35}s">✦</span>`).join("");
  if(k === 8) deco = `<span class="pl-rings"></span><span class="pl-radar"></span>`;
  if(k === 9) deco = `<span class="pl-au"><i></i><i></i><i></i></span>`;
  if(k === 10) deco = `<span class="pl-holo"></span><span class="pl-slice"></span>`;
  if(estMod){
    const pid = "plc" + (++nPlaque);
    deco = `<svg class="pl-circ" aria-hidden="true"><defs><pattern id="${pid}" width="70" height="66" patternUnits="userSpaceOnUse"><path d="M0 18h22v22h26V12h22M10 66V48h30v-8M48 40h22"/><circle cx="22" cy="18" r="2.2"/><circle cx="48" cy="40" r="2.2"/><rect x="28" y="36" width="8" height="8"/></pattern></defs><rect width="100%" height="100%" fill="url(#${pid})"/></svg><span class="pl-om"></span>`;
    fin = `<span class="pl-stamp">100%<br>CERTIFIÉ</span>`;
  }
  const tag = !estMod && TAGS_PLAQUE[k] != null ? TAGS_PLAQUE[k] : (k === 2 ? "0x" + Math.max(0, +o.niveau || 0).toString(16).toUpperCase() : null);
  if(tag && !fin) fin = `<span class="pl-tag"></span>`;
  el.innerHTML = (k === 4 ? `<div class="pl-bar"><span class="pl-bt"></span><span aria-hidden="true">_□×</span></div>` : "")
    + `<div class="pl-in">${deco}<span class="pl-av"></span><span class="pl-tx"><b class="pl-ps"></b><small class="pl-rk"></small></span>${fin}${o.socle ? `<span class="pl-num"></span>` : ""}</div>`;
  const q = s => el.querySelector(s);
  q(".pl-av").textContent = estMod ? ((o.module && o.module.icone) || "★") : pseudo.slice(0, 2).toUpperCase();
  q(".pl-ps").textContent = pseudo; q(".pl-ps").dataset.p = pseudo;
  q(".pl-rk").textContent = o.sous || "";
  if(q(".pl-tag")) q(".pl-tag").textContent = tag;
  if(q(".pl-bt")) q(".pl-bt").textContent = "sudo — " + pseudo.toLowerCase();
  if(q(".pl-om")) q(".pl-om").textContent = (o.module && o.module.icone) || "★";
  if(q(".pl-num")) q(".pl-num").textContent = o.socle;
  el.title = estMod ? `Plaque ${(o.module && o.module.nom) || id.slice(2)} (module complété)` : `Plaque ${RANGS[k]}`;
  return el;
}
/* root : pseudo brouillé façon titre (font-swap), une fois toutes les ~4 s */
setInterval(() => {
  if(reduit || document.hidden) return;
  const P = ["'VT323'","'Silkscreen'","'Space Mono'","'JetBrains Mono'"], G = "!<>-_\\/[]{}=+*^?#01";
  document.querySelectorAll(".pl-r10:not(.pl-socle) .pl-ps").forEach(el => {
    const t = el.dataset.p || el.textContent; let f = 0;
    const it = setInterval(() => {
      el.style.fontFamily = P[f % 4];
      el.textContent = [...t].map((c, j) => j < f/2 ? c : G[Math.random()*G.length|0]).join("");
      if(++f > t.length*2 + 2){ clearInterval(it); el.textContent = t; el.style.fontFamily = ""; }
    }, 45);
  });
}, 4200);

window.moteur = {
  init, charger, debutExo, finExo, reponse, contester, signaler, definirPseudo, definirPlaque, idControle,
  plaque, placeholders, plaquesDebloquees, plaqueEquipee, moduleComplet, palierDe,
  monterHeader, bulle, son, titreHTML, GLYPHS,
  on(fn){ E.ecouteurs.add(fn); if(E.res) fn(E.res, E); return () => E.ecouteurs.delete(fn); },
  etat: () => E.res, interne: E, evenements: tousLesEvenements, contexte,
  calculer, xpClassement, valeursPour, progMaxModule, niveauDe, rangDe, DEFAUT, RANGS, outils:{jourDe, plusJours, ecartJours, fmt, nf, esc, ymd}
};
})();
