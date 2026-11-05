/* =====================================================================
   BIC2.exe — firebase-adapter.js
   Remplace window.claude (artefact claude.ai) par Firebase :
   - Authentication Google ;
   - Firestore, exposé avec EXACTEMENT l'interface que xp.js / admin.html
     utilisaient : db.doc(chemin).onSnapshot/set/get,
     db.collection(chemin).onSnapshot/get/doc/orderBy/limit,
     user.id(), user.isOwner(), user.profiles(ids) ;
   - la PORTE D'ENTRÉE : tant que le compte n'est pas validé par Adam,
     window.claude.use() ne répond pas et un écran couvre la page
     (connexion → demande → attente / refus). Les règles Firestore
     bloquent de toute façon toute lecture tant que membres/<uid> n'existe pas.
   À charger APRÈS firebase-config.js et AVANT xp.js.
   Aucune logique d'XP ici.
   ===================================================================== */
(() => {
"use strict";
const CFG = window.BIC2_FIREBASE || {};
const VERSION = CFG.sdk || "13.1.0";
const PSEUDO_OK = /^[A-Za-z0-9_.\-]{3,16}$/;

/* ---------- mode émulateur (tests locaux) : ?emu dans l'adresse, gardé pour la session ---------- */
let EMU = false;
try{
  if(new URLSearchParams(location.search).has("emu")) sessionStorage.setItem("bic2.emu", "1");
  EMU = sessionStorage.getItem("bic2.emu") === "1";
}catch(e){}
const configOk = c => c && c.apiKey && !/A_REMPLIR/.test(c.apiKey + c.projectId + c.appId);

/* ---------- chargement du SDK compat depuis le CDN (sauf s'il est déjà là) ---------- */
const script = src => new Promise((ok, ko) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => ko(new Error("chargement " + src));
  document.head.appendChild(s);
});
async function chargerSDK(){
  if(window.firebase && window.firebase.firestore && window.firebase.auth) return;
  const base = `https://www.gstatic.com/firebasejs/${VERSION}/`;
  await script(base + "firebase-app-compat.js");
  await Promise.all([script(base + "firebase-auth-compat.js"), script(base + "firebase-firestore-compat.js")]);
}

/* ---------- erreurs Firestore → codes que xp.js connaît déjà ---------- */
const CODES = {"permission-denied":"not_granted", "unauthenticated":"not_granted", "resource-exhausted":"quota_exceeded", "invalid-argument":"invalid_argument"};
function traduire(err){
  if(err && CODES[err.code]){ const e = new Error(err.message); e.code = CODES[err.code]; e.origine = err.code; return e; }
  return err;
}
const garde = p => p.catch(err => { throw traduire(err); });

/* =====================================================================
   ENVELOPPE db : même interface que window.claude.use("db")
   ===================================================================== */
function envelopper(fs, auth, etat){
  /* Firestore refuse les tableaux imbriqués (ex. paliers [[70,10],[80,20]] des réglages) :
     on enveloppe chaque tableau interne dans {__a:[…]} à l'écriture et on le déballe à la lecture. */
  const objPlat = x => x && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype;
  const encoder = (x, dansTab) => Array.isArray(x) ? (dansTab ? {__a:x.map(y => encoder(y, true))} : x.map(y => encoder(y, true)))
    : objPlat(x) ? Object.fromEntries(Object.entries(x).map(([k, y]) => [k, encoder(y, false)])) : x;
  const decoder = x => Array.isArray(x) ? x.map(decoder)
    : objPlat(x) ? (Object.keys(x).length === 1 && Array.isArray(x.__a) ? x.__a.map(decoder) : Object.fromEntries(Object.entries(x).map(([k, y]) => [k, decoder(y)]))) : x;
  const snapDoc = s => ({id:s.id, exists:s.exists, data:() => decoder(s.data()), metadata:{fromCache:s.metadata.fromCache, hasPendingWrites:s.metadata.hasPendingWrites}});
  const snapCol = s => ({docs:s.docs.map(d => ({id:d.id, exists:true, data:() => decoder(d.data())})), size:s.size, empty:s.empty, metadata:{fromCache:s.metadata.fromCache}});
  const surErreur = err => e => { if(err) err(traduire(e)); else console.warn("[firebase]", e); };

  function doc(chemin){
    const ref = fs.doc(chemin);
    return {
      id: ref.id, chemin,
      /* includeMetadataChanges : sans lui, Firestore ne signale pas le passage « cache → serveur »
         quand rien n'a changé, et xp.js attendrait la confirmation du serveur jusqu'au délai de 10 s. */
      onSnapshot(cb, err){ return ref.onSnapshot({includeMetadataChanges:true}, s => cb(snapDoc(s)), surErreur(err)); },
      get(){ return garde(ref.get().then(snapDoc)); },
      set(data, opts){
        const m = /^joueurs\/([^/]+)$/.exec(chemin);
        if(m && data && typeof data.pseudo === "string") return ecrireJoueur(m[1], data);
        return garde(ref.set(encoder(data, false), opts || {}));
      },
      delete(){ return garde(ref.delete()); }
    };
  }
  function requete(q){
    return {
      onSnapshot(cb, err){ return q.onSnapshot({includeMetadataChanges:true}, s => cb(snapCol(s)), surErreur(err)); },
      get(){ return garde(q.get().then(snapCol)); },
      /* lecture ponctuelle économe : une écoute brève, coupée dès la réponse du serveur.
         Relancée moins de 30 min après la précédente, Firestore ne facture que les documents
         modifiés entre-temps (alors qu'un get() relit et facture toute la collection). */
      lireUneFois(){
        return new Promise((ok, ko) => {
          let dernier = null, fini = false, stop = () => {};
          const finir = s => { if(fini) return; fini = true; clearTimeout(t); stop(); s ? ok(s) : ko(Object.assign(new Error("délai dépassé"), {code:"unavailable"})); };
          const t = setTimeout(() => finir(dernier), 10000);
          stop = q.onSnapshot({includeMetadataChanges:true}, s => { dernier = snapCol(s); if(!s.metadata.fromCache) finir(dernier); }, e => { fini = true; clearTimeout(t); ko(traduire(e)); });
          if(fini) stop();
        });
      },
      orderBy(champ, sens){ return requete(q.orderBy(champ, sens)); },
      limit(n){ return requete(q.limit(n)); },
      where(a, op, b){ return requete(q.where(a, op, b)); }
    };
  }
  function collection(chemin){
    const r = requete(fs.collection(chemin));
    r.doc = id => doc(chemin + "/" + id);
    return r;
  }

  /* joueurs/<uid> : le pseudo est réservé dans pseudos/<minuscules> (unicité),
     dans la même écriture groupée que la fiche joueur (imposé par les règles). */
  async function ecrireJoueur(uid, data){
    const nouveau = String(data.pseudo).trim();
    const ref = fs.doc("joueurs/" + uid);
    const avant = await garde(ref.get());
    const ancien = avant.exists && typeof avant.data().pseudo === "string" ? avant.data().pseudo : "";
    if(nouveau.toLowerCase() === ancien.toLowerCase()) return garde(ref.set(Object.assign({}, data, {pseudo:nouveau})));
    if(!PSEUDO_OK.test(nouveau)){ const e = new Error("Pseudo invalide : 3 à 16 caractères (lettres, chiffres, _ . -)"); e.code = "pseudo_invalide"; throw e; }
    const resa = fs.doc("pseudos/" + nouveau.toLowerCase());
    const pris = await garde(resa.get());
    if(pris.exists && pris.data().uid !== uid){ const e = new Error("Ce pseudo est déjà pris"); e.code = "pseudo_pris"; throw e; }
    const b = fs.batch();
    if(!pris.exists) b.set(resa, {uid});
    if(ancien) b.delete(fs.doc("pseudos/" + ancien.toLowerCase()));
    b.set(ref, Object.assign({}, data, {pseudo:nouveau}));
    return garde(b.commit()).catch(err => { if(err.code === "not_granted"){ err.code = "pseudo_pris"; err.message = "Ce pseudo est déjà pris"; } throw err; });
  }

  return {doc, collection, persistant:etat.persistant};
}

/* =====================================================================
   ACCÈS : demandes, validation (Adam), refus
   ===================================================================== */
function outilsAcces(fs, adminUid){
  const maintenant = () => Date.now();
  return {
    /* côté joueur */
    async demander(u, {pseudo, prenom, nom}){
      pseudo = String(pseudo || "").trim(); prenom = String(prenom || "").trim(); nom = String(nom || "").trim();
      if(!PSEUDO_OK.test(pseudo)) throw Object.assign(new Error("Pseudo : 3 à 16 caractères (lettres, chiffres, _ . -)"), {code:"pseudo_invalide"});
      if(!prenom || !nom || prenom.length > 40 || nom.length > 40) throw Object.assign(new Error("Prénom et nom obligatoires (40 caractères max)"), {code:"identite"});
      const resa = fs.doc("pseudos/" + pseudo.toLowerCase());
      const pris = await resa.get().catch(() => null);
      if(pris && pris.exists && pris.data().uid !== u.uid) throw Object.assign(new Error("Ce pseudo est déjà pris"), {code:"pseudo_pris"});
      const b = fs.batch();
      if(!pris || !pris.exists) b.set(resa, {uid:u.uid});
      b.set(fs.doc("identites/" + u.uid), {prenom, nom, email:u.email || ""});
      b.set(fs.doc("demandes/" + u.uid), {pseudo, cree:maintenant(), statut:"attente"});
      try{ await b.commit(); }
      catch(err){ if(err.code === "permission-denied") throw Object.assign(new Error("Ce pseudo est déjà pris"), {code:"pseudo_pris"}); throw err; }
    },
    async recommencer(u){
      const b = fs.batch();
      b.delete(fs.doc("demandes/" + u.uid)); b.delete(fs.doc("identites/" + u.uid));
      await b.commit();
    },
    /* côté Adam (refusé par les règles pour tout autre compte) */
    ecouterDemandes(cb, err){
      return fs.collection("demandes").onSnapshot(s => cb(s.docs.map(d => Object.assign({uid:d.id}, d.data()))), err || (e => console.warn(e)));
    },
    async identite(uid){ const s = await fs.doc("identites/" + uid).get(); return s.exists ? s.data() : null; },
    async valider(uid){
      const d = await fs.doc("demandes/" + uid).get(); if(!d.exists) throw new Error("Demande introuvable");
      const {pseudo} = d.data(), t = maintenant();
      const b = fs.batch();
      b.set(fs.doc("membres/" + uid), {depuis:t});
      b.set(fs.doc("joueurs/" + uid), {pseudo, cree:t, maj:t});
      b.delete(fs.doc("demandes/" + uid));
      await b.commit();
    },
    async refuser(uid){
      const d = await fs.doc("demandes/" + uid).get(); if(!d.exists) return;
      const b = fs.batch();
      b.update(fs.doc("demandes/" + uid), {statut:"refusee", traite:maintenant()});
      const p = d.data().pseudo;
      if(typeof p === "string" && p) b.delete(fs.doc("pseudos/" + p.toLowerCase()));
      await b.commit();
    },
    /* retire l'accès d'un joueur validé : il disparaît du classement, son pseudo est libéré ;
       son journal privé reste (personne d'autre n'y a accès). S'il revient, il refait une demande. */
    async retirer(uid){
      if(uid === adminUid) throw new Error("Impossible de retirer ton propre accès");
      const j = await fs.doc("joueurs/" + uid).get(), p = j.exists ? j.data().pseudo : "";
      const b = fs.batch();
      b.delete(fs.doc("membres/" + uid)); b.delete(fs.doc("joueurs/" + uid)); b.delete(fs.doc("classement/" + uid));
      b.delete(fs.doc("identites/" + uid));
      if(typeof p === "string" && p) b.delete(fs.doc("pseudos/" + p.toLowerCase()));
      await b.commit();
    },
    estAdmin: uid => !!adminUid && uid === adminUid
  };
}

/* =====================================================================
   ÉCRAN D'ACCÈS (couvre la page tant que le joueur n'est pas validé)
   Texte venant de l'utilisateur : toujours textContent, jamais innerHTML.
   ===================================================================== */
const ECRAN = {el:null};
function ecran(){
  if(ECRAN.el) return ECRAN.el;
  const el = document.createElement("div");
  el.className = "acces"; el.id = "acces"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "acces-titre");
  const poser = () => { document.body.appendChild(el); document.documentElement.classList.add("acces-ouvert"); };
  if(document.body) poser(); else document.addEventListener("DOMContentLoaded", poser, {once:true});
  ECRAN.el = el; return el;
}
function fermerEcran(){ if(ECRAN.el){ ECRAN.el.remove(); ECRAN.el = null; } document.documentElement.classList.remove("acces-ouvert"); }
function h(tag, attrs, ...enfants){
  const e = document.createElement(tag);
  for(const [k, v] of Object.entries(attrs || {})){
    if(k === "on") for(const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if(k === "texte") e.textContent = v;
    else if(v === true) e.setAttribute(k, "");
    else if(v !== false && v != null) e.setAttribute(k, v);
  }
  for(const c of enfants) if(c != null) e.append(c);
  return e;
}
function fenetre(nomFichier, titre, ...contenu){
  const el = ecran();
  el.replaceChildren(h("div", {class:"acces-fond", "aria-hidden":"true"}),
    h("section", {class:"fenetre acces-fenetre", "data-titre":nomFichier},
      h("p", {class:"acces-marque", "aria-hidden":"true"}, "BIC2", h("span", {class:"ext"}, ".exe")),
      h("h1", {id:"acces-titre", class:"acces-h", texte:titre}),
      ...contenu));
  const f = el.querySelector("input,button"); if(f) setTimeout(() => f.focus(), 30);
}
const lienSortie = auth => h("button", {class:"lien acces-sortie", type:"button", texte:"Se déconnecter", on:{click:() => auth.signOut().then(() => location.reload())}});

function ecranConfig(){
  fenetre("config.err", "Site pas encore branché",
    h("p", {texte:"La configuration Firebase n'est pas encore renseignée (firebase-config.js). Rien à faire de ton côté : Adam s'en occupe."}));
}
function ecranErreur(msg){
  fenetre("erreur.log", "Connexion impossible",
    h("p", {texte:msg}),
    h("div", {class:"actions"}, h("button", {class:"btn plein", type:"button", texte:"Réessayer", on:{click:() => location.reload()}})));
}

function ecranConnexion(auth){
  return new Promise(() => {
    const err = h("span", {class:"erreur-txt", role:"alert"});
    const btn = h("button", {class:"btn plein acces-google", type:"button"},
      h("span", {class:"g", "aria-hidden":"true", texte:"G"}), "Se connecter avec Google");
    btn.addEventListener("click", async () => {
      btn.disabled = true; err.textContent = "";
      const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt:"select_account"});
      try{ await auth.signInWithPopup(prov); /* onAuthStateChanged prend le relais */ }
      catch(e){
        if(e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")){ try{ await auth.signInWithRedirect(prov); return; }catch(e2){ e = e2; } }
        if(e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") err.textContent = "Connexion refusée (" + (e.code || e.message) + ")";
        btn.disabled = false;
      }
    });
    const aide = h("div", {class:"acces-pourquoi", id:"acces-pourquoi", hidden:true},
      h("p", {texte:"Pourquoi tout ça ?"}),
      h("ul", {},
        h("li", {texte:"Google sert à te reconnaître : ta progression est enregistrée sur ton compte, et tu la retrouves sur tous tes appareils."}),
        h("li", {texte:"Adam valide chaque demande pour que seule la classe soit dans le classement (pas d'inconnus ni de faux comptes)."}),
        h("li", {texte:"Si le site était ouvert à tout le monde, n'importe qui pourrait remplir la base de données (elle est gratuite, donc limitée) et la faire saturer : plus personne ne pourrait enregistrer sa progression."}),
        h("li", {texte:"Seul Adam peut modifier le site : tu joues, sans risque de casser quoi que ce soit."}),
        h("li", {texte:"Ce que les autres voient : ton pseudo, ton niveau et ton XP, rien d'autre. Ton prénom et ton nom ne sont visibles que par Adam. Le détail de tes réponses reste privé, même pour lui."})));
    const q = h("button", {class:"acces-q", type:"button", "aria-expanded":"false", "aria-controls":"acces-pourquoi", title:"Pourquoi ce processus ?", texte:"?"});
    q.addEventListener("click", () => { const o = aide.hidden; aide.hidden = !o; q.setAttribute("aria-expanded", String(o)); });
    fenetre("connexion.exe", "Connexion",
      h("p", {}, "Le hub de révision de la classe. Connecte-toi avec ton compte Google : à ta première visite, tu demandes l'accès, et Adam le valide. ", q),
      aide,
      h("div", {class:"actions"}, btn, err));
  });
}

function ecranFormulaire(auth, acces, u){
  return new Promise(() => {
    const err = h("span", {class:"erreur-txt", role:"alert"});
    const champ = (lib, id, attrs) => h("label", {class:"champ"}, lib, h("input", Object.assign({id, autocomplete:"off", required:true}, attrs)));
    const form = h("form", {class:"acces-form", novalidate:true},
      champ("Pseudo", "a-pseudo", {maxlength:16, pattern:"[A-Za-z0-9_.\\-]{3,16}", spellcheck:"false", autocapitalize:"off", "aria-describedby":"a-pseudo-aide"}),
      h("small", {id:"a-pseudo-aide", class:"acces-aide", texte:"C'est le seul nom que la classe verra. 3 à 16 caractères : lettres, chiffres, _ . -"}),
      h("div", {class:"acces-duo"},
        champ("Prénom", "a-prenom", {maxlength:40, autocomplete:"given-name"}),
        champ("Nom", "a-nom", {maxlength:40, autocomplete:"family-name"})),
      h("small", {class:"acces-aide acces-prive", texte:"🔒 Prénom et nom : visibles uniquement par Adam, pour savoir qui tu es."}),
      h("p", {class:"acces-compte"}, "Compte Google : ", h("b", {texte:u.email || u.uid})),
      h("div", {class:"actions"}, h("button", {class:"btn plein", type:"submit", texte:"Envoyer la demande"}), err));
    form.addEventListener("submit", async e => {
      e.preventDefault(); err.textContent = "";
      const v = id => form.querySelector("#" + id).value;
      const btn = form.querySelector("[type=submit]"); btn.disabled = true;
      try{ await acces.demander(u, {pseudo:v("a-pseudo"), prenom:v("a-prenom"), nom:v("a-nom")}); /* l'écoute de la demande affiche l'attente */ }
      catch(ex){ err.textContent = ex.message || "Envoi impossible"; btn.disabled = false; }
    });
    fenetre("demande.exe", "Demande d'accès", form, lienSortie(auth));
  });
}
function ecranAttente(auth, d){
  fenetre("attente.exe", "Demande envoyée à Adam",
    h("p", {class:"acces-ok"}, h("span", {class:"acces-coche", "aria-hidden":"true", texte:"✓"}), "Ta demande est partie."),
    h("p", {}, "Pseudo demandé : ", h("b", {texte:d.pseudo || "?"})),
    h("p", {texte:"Dès qu'Adam l'aura validée, cette page s'ouvrira toute seule (tu peux aussi la fermer et revenir plus tard)."}),
    h("p", {class:"acces-attente", "aria-hidden":"true"}, h("i"), h("i"), h("i")),
    lienSortie(auth));
}
function ecranRefus(auth, acces, u){
  fenetre("refus.log", "Demande refusée",
    h("p", {texte:"Adam a refusé cette demande (compte inconnu, pseudo à changer…). Tu peux en refaire une."}),
    h("div", {class:"actions"}, h("button", {class:"btn plein", type:"button", texte:"Refaire une demande", on:{click:async ev => { ev.target.disabled = true; try{ await acces.recommencer(u); }catch(e){ ev.target.disabled = false; } }}})),
    lienSortie(auth));
}

/* attend que l'utilisateur soit membre (ou admin) ; pilote les écrans en attendant */
function porte(fs, auth, acces, u){
  return new Promise(resolve => {
    if(acces.estAdmin(u.uid)){ resolve(); return; }
    const cle = "bic2.membre." + u.uid;
    try{ if(sessionStorage.getItem(cle) === "1"){
      resolve();
      /* vérification discrète : si l'accès a été retiré, on revient à l'écran d'accès */
      fs.doc("membres/" + u.uid).get().then(s => { if(!s.exists){ sessionStorage.removeItem(cle); location.reload(); } }).catch(() => {});
      return;
    } }catch(e){}
    let membre = false, demande, vu = {m:false, d:false};
    const decider = () => {
      if(membre){ stopM(); stopD(); try{ sessionStorage.setItem(cle, "1"); }catch(e){} fermerEcran(); resolve(); return; }
      if(!vu.m || !vu.d) return;
      if(!demande) ecranFormulaire(auth, acces, u);
      else if(demande.statut === "refusee") ecranRefus(auth, acces, u);
      else ecranAttente(auth, demande);
    };
    const stopM = fs.doc("membres/" + u.uid).onSnapshot(s => { membre = s.exists; vu.m = true; decider(); },
      e => { vu.m = true; console.warn(e); decider(); });
    const stopD = fs.doc("demandes/" + u.uid).onSnapshot(s => { demande = s.exists ? s.data() : null; vu.d = true; decider(); },
      e => { vu.d = true; console.warn(e); decider(); });
  });
}

/* =====================================================================
   DÉMARRAGE
   ===================================================================== */
const ETAT = {persistant:false, pret:null};
async function demarrer(){
  if(!EMU && !configOk(CFG.config)){ ecranConfig(); return new Promise(() => {}); }
  try{ await chargerSDK(); }
  catch(e){ ecranErreur("Impossible de charger Firebase (connexion internet ?)."); return new Promise(() => {}); }
  const config = EMU ? {apiKey:"demo-cle", authDomain:"demo-bic2.firebaseapp.com", projectId:"demo-bic2", appId:"demo"} : CFG.config;
  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
  const auth = app.auth(), fs = app.firestore();
  if(EMU){
    const hote = location.hostname || "127.0.0.1";
    try{ auth.useEmulator(`http://${hote}:9099`, {disableWarnings:true}); }catch(e){}
    try{ fs.useEmulator(hote, 8080); }catch(e){}
  }
  try{ fs.settings({ignoreUndefinedProperties:true, merge:true}); }catch(e){}
  /* cache local Firestore (IndexedDB) : les écritures en attente survivent au changement de page,
     et une écoute relancée < 30 min ne fait payer que les documents modifiés.
     Ce n'est pas un stockage de progression : le serveur reste la seule source de vérité. */
  try{ await fs.enablePersistence({synchronizeTabs:true}); ETAT.persistant = true; }catch(e){ ETAT.persistant = false; }

  const acces = outilsAcces(fs, CFG.adminUid);
  try{ await auth.getRedirectResult(); }catch(e){}
  const u = await new Promise(resolve => {
    const stop = auth.onAuthStateChanged(x => { if(x){ stop(); resolve(x); } else ecranConnexion(auth); });
  });
  await porte(fs, auth, acces, u);
  /* si le compte est déconnecté ailleurs (autre onglet), on revient à l'écran de connexion */
  auth.onAuthStateChanged(x => { if(!x) location.reload(); });

  const db = envelopper(fs, auth, ETAT);
  const user = {
    id: async () => u.uid,
    isOwner: async () => acces.estAdmin(u.uid),
    email: () => u.email || "",
    /* noms réels : lisibles par Adam seul (règles) → {uid: {name, email}} */
    profiles: async ids => {
      const out = {};
      await Promise.all(ids.map(async id => { try{ const d = await acces.identite(id); if(d) out[id] = {name:`${d.prenom} ${d.nom}`.trim(), email:d.email}; }catch(e){} }));
      return out;
    }
  };
  window.BIC2 = Object.assign(window.BIC2 || {}, {
    acces, firestore:fs, auth, persistant:ETAT.persistant, emu:EMU,
    deconnexion: () => auth.signOut().then(() => { try{ sessionStorage.removeItem("bic2.membre." + u.uid); }catch(e){} location.href = "index.html"; })
  });
  return {db, user};
}

window.claude = {
  use(nom){
    ETAT.pret = ETAT.pret || demarrer();
    return ETAT.pret.then(x => nom === "db" ? x.db : nom === "user" ? x.user : null);
  }
};
window.BIC2 = Object.assign(window.BIC2 || {}, {fileLocale: () => ETAT.persistant});
})();
