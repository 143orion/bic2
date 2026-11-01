/* =====================================================================
   BIC2.exe — simulateur Firebase (tests locaux, JAMAIS publié : hors de site/)
   Remplace le SDK compat (firebase.auth / firebase.firestore) par une base
   en mémoire, gardée dans le localStorage du navigateur de test pour survivre
   aux changements de page. Imite les règles essentielles (membres, identités
   privées, journal privé, pseudos uniques) pour tester l'interface.
   Les VRAIES règles sont testées sur l'émulateur (tests/regles.test.mjs).

   Utilisation (injecté avant toute autre script, ex. Playwright addInitScript) :
     ?mock=adam   → compte admin       ?mock=mia → membre validé
     ?mock=neo    → nouveau compte      ?mock=off → déconnecté
   window.__mock.reset() remet la base de démo.
   ===================================================================== */
(() => {
const ADMIN = "adam", CLE = "bic2.mock.base";
const qs = new URLSearchParams(location.search);
if(qs.has("mock")) sessionStorage.setItem("bic2.mock.user", qs.get("mock"));
if(qs.has("reset")) localStorage.removeItem(CLE);
const comptes = {
  adam:{uid:"adam", email:"adam@example.com", displayName:"Adam"},
  mia:{uid:"mia", email:"mia@example.com", displayName:"Mia"},
  neo:{uid:"neo", email:"neo@example.com", displayName:"Neo"},
  eve:{uid:"eve", email:"eve@example.com", displayName:"Eve"}
};

/* ---------- base de démo ---------- */
function demo(){
  const s = {}, day = k => new Date(Date.now() - k*864e5).toISOString().slice(0,10);
  const jours = (n, xp, eff) => { const o = {}; for(let k=1;k<=n;k++) o[day(k)] = {xp, eff}; return o; };
  const joueur = (uid, pseudo, plaque, cl, prenom, nom) => {
    s["membres/"+uid] = {depuis:Date.now() - 30*864e5};
    s["pseudos/"+pseudo.toLowerCase()] = {uid};
    s["joueurs/"+uid] = Object.assign({pseudo, cree:1, maj:1}, plaque ? {plaque} : {});
    s["identites/"+uid] = {prenom, nom, email:uid + "@example.com"};
    if(cl) s["classement/"+uid] = cl;
  };
  joueur("kenza", "Kenza", "r10", {jours:jours(300, 2000, 100), serie:12, modules:{"complement-electronique":{xp:9000, reussies:66, exos:18, maitrisees:30}}}, "Kenza", "B.");
  joueur("yanis", "Yanis", "m:complement-electronique", {jours:jours(120, 1000, 50), serie:4, modules:{"complement-electronique":{xp:5000, reussies:66, exos:18, maitrisees:10}}}, "Yanis", "M.");
  joueur("lucas", "Lucas", "r9", {jours:jours(60, 900, 45), serie:2, modules:{}}, "Lucas", "D.");
  joueur("ines", "Ines", null, {jours:jours(10, 300, 20), serie:1, modules:{}}, "Inès", "R.");
  joueur("sami", "Sami", "r7", {jours:jours(160, 1500, 75), modules:{}}, "Sami", "K.");
  joueur("mia", "Mia", "r1", {jours:jours(5, 200, 15), serie:1, modules:{}}, "Mia", "L.");
  s["pseudos/adam"] = {uid:"adam"}; s["joueurs/adam"] = {pseudo:"Adam", plaque:"r1", cree:1, maj:1};
  /* deux demandes en attente + une refusée */
  s["pseudos/le_sage"] = {uid:"lea"}; s["identites/lea"] = {prenom:"Léa", nom:"Fontaine", email:"lea.fontaine@gmail.com"};
  s["demandes/lea"] = {pseudo:"Le_Sage", cree:Date.now() - 3*3600e3, statut:"attente"};
  s["pseudos/x.0r"] = {uid:"omar"}; s["identites/omar"] = {prenom:"Omar", nom:"Benali", email:"omar.b@gmail.com"};
  s["demandes/omar"] = {pseudo:"x.0r", cree:Date.now() - 20*60e3, statut:"attente"};
  s["identites/eve"] = {prenom:"Ève", nom:"Inconnue", email:"eve@example.com"};
  s["demandes/eve"] = {pseudo:"eve", cree:Date.now() - 2*864e5, statut:"refusee", traite:Date.now() - 864e5};
  Object.assign(s, window.__seed || {});
  return s;
}
let base;
try{ base = JSON.parse(localStorage.getItem(CLE) || "null"); }catch(e){}
if(!base){ base = demo(); }
const sauver = () => { try{ localStorage.setItem(CLE, JSON.stringify(base)); }catch(e){} };
sauver();
const LIRE = {reads:0, writes:0};

/* ---------- règles (copie simplifiée de firestore.rules) ---------- */
const seg = p => p.split("/");
const estMembre = uid => uid === ADMIN || ("membres/" + uid) in base;
function autorise(op, chemin, uid, apres, avant){
  const s = seg(chemin), col = s[0], id = s[1];
  if(!uid) return false;
  const admin = uid === ADMIN, moi = id === uid;
  if(col === "data") return s[2] === uid && (op === "read" || /^j_/.test(s[3] || "x"));
  if(["config","calendrier","banques_edit"].includes(col)) return op === "read" ? estMembre(uid) : admin;
  if(col === "config_historique") return admin;
  if(col === "joueurs"){
    if(op === "read") return estMembre(uid);
    if(admin) return true;
    if(!moi || !estMembre(uid) || !apres) return false;
    const r = apres["pseudos/" + String(apres["joueurs/"+id] && apres["joueurs/"+id].pseudo || "").toLowerCase()];
    return !!r && r.uid === uid;
  }
  if(col === "classement") return op === "read" ? estMembre(uid) : admin || (moi && estMembre(uid));
  if(col === "contestations" || col === "signalements") return op === "read" ? (moi || admin) : (admin || (moi && estMembre(uid)));
  if(col === "decisions") return op === "read" ? (moi || admin) : admin;
  if(col === "pseudos"){
    if(op === "read") return true;
    if(op === "create") return !avant && apres && apres[chemin] && apres[chemin].uid === uid;
    if(op === "delete") return !!avant && (avant.uid === uid || admin);
    return false;
  }
  if(col === "demandes"){
    if(op === "read") return moi || admin;
    if(op === "create"){ const d = apres[chemin], r = apres["pseudos/" + String(d.pseudo).toLowerCase()]; return moi && d.statut === "attente" && r && r.uid === uid; }
    if(op === "update") return admin;
    if(op === "delete") return admin || (moi && avant && avant.statut === "refusee");
  }
  if(col === "identites") return op === "read" || op === "delete" ? (moi || admin) : moi;
  if(col === "membres") return op === "read" ? (moi || admin) : admin;
  return false;
}
const refus = () => Object.assign(new Error("Missing or insufficient permissions."), {code:"permission-denied"});
const opDe = (chemin, data) => data === null ? "delete" : (chemin in base ? "update" : "create");
function lireOk(chemin, uid){ return autorise("read", chemin, uid); }

/* ---------- écouteurs ---------- */
const ecoutes = new Set();
const copie = o => o == null ? o : JSON.parse(JSON.stringify(o));
function notifier(){ sauver(); for(const e of [...ecoutes]) setTimeout(() => ecoutes.has(e) && e.f(), 5); }

/* ---------- auth ---------- */
const auth = {
  currentUser:null, _cbs:new Set(),
  onAuthStateChanged(cb){ this._cbs.add(cb); setTimeout(() => cb(this.currentUser), 15); return () => this._cbs.delete(cb); },
  _set(u){ this.currentUser = u; sessionStorage.setItem("bic2.mock.user", u ? u.uid : "off"); this._cbs.forEach(cb => cb(u)); },
  async signInWithPopup(){ await new Promise(r => setTimeout(r, 300)); const k = sessionStorage.getItem("bic2.mock.login") || "neo"; this._set(comptes[k] || {uid:k, email:k + "@example.com"}); return {user:this.currentUser}; },
  async signInWithRedirect(){ return this.signInWithPopup(); },
  async getRedirectResult(){ return null; },
  async signOut(){ this._set(null); },
  useEmulator(){}
};
const choisi = sessionStorage.getItem("bic2.mock.user");
if(choisi && choisi !== "off") auth.currentUser = comptes[choisi] || {uid:choisi, email:choisi + "@example.com"};
const uidCourant = () => auth.currentUser && auth.currentUser.uid;

/* ---------- firestore ---------- */
function snapDoc(chemin){ const d = base[chemin]; return {id:seg(chemin).pop(), exists:d !== undefined, data:() => copie(d), metadata:{fromCache:false, hasPendingWrites:false}}; }
function enfants(col){
  const n = seg(col).length;
  return Object.keys(base).filter(k => k.startsWith(col + "/") && seg(k).length === n + 1).sort()
    .map(k => ({id:seg(k).pop(), exists:true, data:() => copie(base[k])}));
}
function docRef(chemin){
  return {
    id:seg(chemin).pop(), path:chemin,
    async get(){ await pause(); if(!lireOk(chemin, uidCourant())) throw refus(); LIRE.reads++; return snapDoc(chemin); },
    async set(data, opts){ return ecrire([[chemin, opts && opts.merge ? Object.assign(copie(base[chemin]) || {}, data) : data]]); },
    async update(data){ if(!(chemin in base)) throw Object.assign(new Error("not found"), {code:"not-found"}); return ecrire([[chemin, Object.assign(copie(base[chemin]), data)]]); },
    async delete(){ return ecrire([[chemin, null]]); },
    onSnapshot(a, b, c){
      const [next, err] = typeof a === "function" ? [a, b] : [b, c];
      const e = {f(){ if(!lireOk(chemin, uidCourant())){ ecoutes.delete(e); err && err(refus()); return; } LIRE.reads++; next(snapDoc(chemin)); }};
      ecoutes.add(e); setTimeout(() => ecoutes.has(e) && e.f(), 10); return () => ecoutes.delete(e);
    }
  };
}
function requete(col, tri, lim){
  const lister = () => { let d = enfants(col); if(tri) d.sort((x, y) => { const a = x.data()[tri[0]], b = y.data()[tri[0]]; return (a > b ? 1 : a < b ? -1 : 0) * (tri[1] === "desc" ? -1 : 1); }); if(lim) d = d.slice(0, lim); return d; };
  const snap = () => { const docs = lister(); LIRE.reads += Math.max(1, docs.length); return {docs, size:docs.length, empty:!docs.length, metadata:{fromCache:false}}; };
  const ok = () => lireOk(col + "/x", uidCourant());
  return {
    async get(){ await pause(); if(!ok()) throw refus(); return snap(); },
    orderBy(champ, sens){ return requete(col, [champ, sens], lim); },
    limit(n){ return requete(col, tri, n); },
    where(){ return requete(col, tri, lim); },
    doc(id){ return docRef(col + "/" + id); },
    onSnapshot(a, b, c){
      const [next, err] = typeof a === "function" ? [a, b] : [b, c];
      const e = {f(){ if(!ok()){ ecoutes.delete(e); err && err(refus()); return; } next(snap()); }};
      ecoutes.add(e); setTimeout(() => ecoutes.has(e) && e.f(), 10); return () => ecoutes.delete(e);
    }
  };
}
const pause = () => new Promise(r => setTimeout(r, 20));
async function ecrire(ops){
  await pause();
  const uid = uidCourant(), apres = Object.assign({}, base);
  for(const [c, d] of ops){ if(d === null) delete apres[c]; else apres[c] = copie(d); }
  for(const [c, d] of ops){ if(!autorise(opDe(c, d), c, uid, apres, base[c])) throw refus(); }
  for(const [c, d] of ops){ if(d === null) delete base[c]; else base[c] = copie(d); LIRE.writes++; }
  notifier();
}
const fs = {
  doc: docRef, collection: c => requete(c),
  batch(){ const ops = []; return {
    set(r, d){ ops.push([r.path, d]); return this; },
    update(r, d){ ops.push([r.path, Object.assign(copie(base[r.path]) || {}, d)]); return this; },
    delete(r){ ops.push([r.path, null]); return this; },
    commit(){ return ecrire(ops); } }; },
  settings(){}, useEmulator(){}, async enablePersistence(){}
};

/* ---------- faux SDK compat ---------- */
const app = {auth:() => auth, firestore:() => fs};
function GoogleAuthProvider(){} GoogleAuthProvider.prototype.setCustomParameters = function(){};
window.firebase = {apps:[], initializeApp(){ this.apps.push(app); return app; }, app:() => app, auth:Object.assign(() => auth, {GoogleAuthProvider}), firestore:() => fs};

/* la config du dépôt n'est pas remplie : on fournit une config factice et l'admin de démo */
let cfg;
Object.defineProperty(window, "BIC2_FIREBASE", {configurable:true,
  get(){ return cfg; },
  set(v){ cfg = Object.assign({}, v, {config:{apiKey:"mock", authDomain:"mock", projectId:"mock", appId:"mock"}, adminUid:ADMIN}); }});

window.__mock = {base:() => base, compteurs:LIRE, reset(){ localStorage.removeItem(CLE); location.reload(); },
  connexionSuivante(uid){ sessionStorage.setItem("bic2.mock.login", uid); }};
})();
