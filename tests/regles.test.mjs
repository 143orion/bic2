// Tests des règles Firestore sur l'émulateur.
// Lancer : npm run test:regles   (démarre l'émulateur, exécute, l'arrête)
// L'UID admin des règles (A_REMPLIR ou le vrai) est remplacé par "adam" pour le test.
import {test, before, after, beforeEach} from "node:test";
import {readFileSync} from "node:fs";
import {initializeTestEnvironment, assertSucceeds, assertFails} from "@firebase/rules-unit-testing";
import {doc, getDoc, setDoc, deleteDoc, updateDoc, getDocs, collection, writeBatch} from "firebase/firestore";

const ADMIN = "adam";
const regles = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8")
  .replace(/request\.auth\.uid == "[^"]*"/, `request.auth.uid == "${ADMIN}"`);
let env;
const ctx = (uid, email) => env.authenticatedContext(uid, {email: email || uid + "@gmail.com"}).firestore();
const anonyme = () => env.unauthenticatedContext().firestore();
const admin = () => ctx(ADMIN);
const membre = () => ctx("mia");          // compte validé
const autre = () => ctx("tom");           // autre compte validé
const nouveau = () => ctx("neo");         // connecté, pas encore validé

before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
  env = await initializeTestEnvironment({projectId: "demo-bic2", firestore: {rules: regles, host, port: +port}});
});
after(() => env && env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    const db = c.firestore();
    for(const [uid, p] of [["mia", "Mia"], ["tom", "Tom"]]){
      await setDoc(doc(db, "membres", uid), {depuis: 1});
      await setDoc(doc(db, "pseudos", p.toLowerCase()), {uid});
      await setDoc(doc(db, "joueurs", uid), {pseudo: p, cree: 1, maj: 1});
      await setDoc(doc(db, "identites", uid), {prenom: "P" + p, nom: "N" + p, email: uid + "@gmail.com"});
      await setDoc(doc(db, "classement", uid), {maj: 1, jours: {}, serie: 0, modules: {}});
      await setDoc(doc(db, `data/users/${uid}/j_2026-11-01_abc`), {ev: [], appareil: "abc", v: 1});
      await setDoc(doc(db, "contestations", uid), {items: []});
    }
    await setDoc(doc(db, "config/actuelle"), {saisonNom: "S1"});
    await setDoc(doc(db, "calendrier/principal"), {evals: []});
  });
});

/* ---------- personne non connectée ---------- */
test("anonyme : rien n'est lisible ni écrivable", async () => {
  const db = anonyme();
  await assertFails(getDoc(doc(db, "config/actuelle")));
  await assertFails(getDocs(collection(db, "joueurs")));
  await assertFails(getDoc(doc(db, "pseudos/mia")));
  await assertFails(setDoc(doc(db, "demandes/x"), {pseudo: "x", cree: 1, statut: "attente"}));
});

/* ---------- connecté non validé ---------- */
const demander = (db, uid, pseudo, email) => {
  const b = writeBatch(db);
  b.set(doc(db, "pseudos", pseudo.toLowerCase()), {uid});
  b.set(doc(db, "identites", uid), {prenom: "Néo", nom: "Anderson", email: email || uid + "@gmail.com"});
  b.set(doc(db, "demandes", uid), {pseudo, cree: Date.now(), statut: "attente"});
  return b.commit();
};
test("non validé : peut déposer sa demande (pseudo + identité) et la relire", async () => {
  const db = nouveau();
  await assertSucceeds(demander(db, "neo", "Neo_42"));
  await assertSucceeds(getDoc(doc(db, "demandes/neo")));
  await assertSucceeds(getDoc(doc(db, "identites/neo")));
  await assertSucceeds(getDoc(doc(db, "membres/neo")));
});
test("non validé : aucun accès au jeu (config, calendrier, joueurs, classement, banques)", async () => {
  const db = nouveau();
  await assertFails(getDoc(doc(db, "config/actuelle")));
  await assertFails(getDoc(doc(db, "calendrier/principal")));
  await assertFails(getDocs(collection(db, "joueurs")));
  await assertFails(getDocs(collection(db, "classement")));
  await assertFails(getDoc(doc(db, "banques_edit/x")));
  await assertFails(setDoc(doc(db, "classement/neo"), {maj: 1, jours: {}, serie: 0, modules: {}}));
  await assertFails(setDoc(doc(db, "contestations/neo"), {items: []}));
});
test("non validé : ne peut ni se valider ni créer sa fiche joueur", async () => {
  const db = nouveau();
  await demander(db, "neo", "Neo");
  await assertFails(setDoc(doc(db, "membres/neo"), {depuis: 1}));
  await assertFails(setDoc(doc(db, "joueurs/neo"), {pseudo: "Neo", cree: 1, maj: 1}));
  await assertFails(updateDoc(doc(db, "demandes/neo"), {statut: "validee"}));
  await assertFails(deleteDoc(doc(db, "demandes/neo")));            // demande en attente
});
test("unicité : impossible de prendre un pseudo déjà réservé (casse ignorée)", async () => {
  const db = nouveau();
  await assertFails(demander(db, "neo", "MIA"));
  await assertFails(setDoc(doc(db, "pseudos/mia"), {uid: "neo"}));
  // demande avec un pseudo réservé par quelqu'un d'autre, sans réservation à soi
  await assertFails(setDoc(doc(db, "demandes/neo"), {pseudo: "Mia", cree: 1, statut: "attente"}));
});
test("demande : pseudo invalide, statut forcé, e-mail d'un autre → refusé", async () => {
  const db = nouveau();
  await assertFails(demander(db, "neo", "a b"));
  await assertFails(demander(db, "neo", "Neo", "pirate@gmail.com"));
  const b = writeBatch(db);
  b.set(doc(db, "pseudos/neo"), {uid: "neo"});
  b.set(doc(db, "demandes/neo"), {pseudo: "Neo", cree: 1, statut: "validee"});
  await assertFails(b.commit());
});
test("promo : BIC1/2/3 seulement ; l'admin ne change que la promo", async () => {
  const db = nouveau();
  await assertFails(setDoc(doc(db, "identites/neo"), {prenom: "Néo", nom: "A", email: "neo@gmail.com", promo: "BIC9"}));
  await assertSucceeds(setDoc(doc(db, "identites/neo"), {prenom: "Néo", nom: "A", email: "neo@gmail.com", promo: "BIC2"}));
  await assertFails(updateDoc(doc(ctx("eve"), "identites/neo"), {promo: "BIC1"}));
  const a = admin();
  await assertSucceeds(updateDoc(doc(a, "identites/neo"), {promo: "BIC3"}));
  await assertFails(updateDoc(doc(a, "identites/neo"), {promo: "BIC4"}));
  await assertFails(updateDoc(doc(a, "identites/neo"), {nom: "Pirate"}));
});
test("non validé : ne voit pas les demandes ni les identités des autres", async () => {
  await demander(nouveau(), "neo", "Neo");
  const db = ctx("eve");
  await assertFails(getDoc(doc(db, "demandes/neo")));
  await assertFails(getDoc(doc(db, "identites/neo")));
  await assertFails(getDocs(collection(db, "demandes")));
});

/* ---------- admin ---------- */
test("admin : voit les demandes et identités, valide (membre + joueur) en une fois", async () => {
  await demander(nouveau(), "neo", "Neo");
  const db = admin();
  await assertSucceeds(getDocs(collection(db, "demandes")));
  await assertSucceeds(getDoc(doc(db, "identites/neo")));
  const b = writeBatch(db);
  b.set(doc(db, "membres/neo"), {depuis: 2});
  b.set(doc(db, "joueurs/neo"), {pseudo: "Neo", cree: 2, maj: 2});
  b.delete(doc(db, "demandes/neo"));
  await assertSucceeds(b.commit());
  // le joueur validé a maintenant accès
  await assertSucceeds(getDoc(doc(nouveau(), "config/actuelle")));
  await assertSucceeds(getDocs(collection(nouveau(), "classement")));
});
test("admin : refuse (statut + libère le pseudo) ; le joueur peut recommencer", async () => {
  await demander(nouveau(), "neo", "Neo");
  const adb = admin(), b = writeBatch(adb);
  b.update(doc(adb, "demandes/neo"), {statut: "refusee", traite: 3});
  b.delete(doc(adb, "pseudos/neo"));
  await assertSucceeds(b.commit());
  const db = nouveau();
  await assertFails(getDoc(doc(db, "config/actuelle")));
  await assertSucceeds(deleteDoc(doc(db, "demandes/neo")));
  await assertSucceeds(demander(db, "neo", "Neo2"));
});
test("admin : écrit config, calendrier, décisions ; un membre non", async () => {
  await assertSucceeds(setDoc(doc(admin(), "config/actuelle"), {saisonNom: "S2"}));
  await assertSucceeds(setDoc(doc(admin(), "decisions/mia"), {x: 1}));
  await assertSucceeds(getDocs(collection(admin(), "config_historique")));
  await assertFails(setDoc(doc(membre(), "config/actuelle"), {saisonNom: "pirate"}));
  await assertFails(setDoc(doc(membre(), "calendrier/principal"), {evals: []}));
  await assertFails(setDoc(doc(membre(), "decisions/mia"), {x: 1}));
  await assertFails(getDocs(collection(membre(), "config_historique")));
});

test("admin : retire l'accès (membre, joueur, classement, identité, pseudo) ; le joueur perd tout accès", async () => {
  const db = admin(), b = writeBatch(db);
  for(const c of ["membres/mia", "joueurs/mia", "classement/mia", "identites/mia", "pseudos/mia"]) b.delete(doc(db, c));
  await assertSucceeds(b.commit());
  await assertFails(getDoc(doc(membre(), "config/actuelle")));
  await assertFails(getDocs(collection(membre(), "classement")));
  await assertSucceeds(getDocs(collection(membre(), "data/users/mia")));   // son journal privé reste à lui
  // un membre ne peut pas retirer quelqu'un d'autre
  await assertFails(deleteDoc(doc(autre(), "classement/mia")));
  await assertFails(deleteDoc(doc(autre(), "membres/tom")));
});

/* ---------- membre ---------- */
test("membre : lit config, calendrier, joueurs, classement", async () => {
  const db = membre();
  await assertSucceeds(getDoc(doc(db, "config/actuelle")));
  await assertSucceeds(getDoc(doc(db, "calendrier/principal")));
  await assertSucceeds(getDocs(collection(db, "joueurs")));
  await assertSucceeds(getDocs(collection(db, "classement")));
});
test("confidentialité : prénom/nom invisibles pour la classe", async () => {
  await assertFails(getDoc(doc(membre(), "identites/tom")));
  await assertFails(getDocs(collection(membre(), "identites")));
  await assertSucceeds(getDoc(doc(membre(), "identites/mia")));   // les siens
});
test("journal privé : le joueur seul, même pas l'admin", async () => {
  await assertSucceeds(getDocs(collection(membre(), "data/users/mia")));
  await assertSucceeds(setDoc(doc(membre(), "data/users/mia/j_2026-11-02_abc"), {ev: [{i: "x"}], appareil: "abc", v: 1}));
  await assertFails(getDocs(collection(autre(), "data/users/mia")));
  await assertFails(getDocs(collection(admin(), "data/users/mia")));
  await assertFails(setDoc(doc(autre(), "data/users/mia/j_2026-11-02_abc"), {ev: [], appareil: "abc", v: 1}));
  await assertFails(setDoc(doc(membre(), "data/users/mia/autre"), {ev: [], appareil: "abc", v: 1}));
  await assertFails(setDoc(doc(membre(), "data/users/mia/j_2026-11-02_abc"), {ev: [], appareil: "abc", v: 1, total: 999999}));
});
test("classement / joueurs : chacun n'écrit que le sien", async () => {
  await assertSucceeds(setDoc(doc(membre(), "classement/mia"), {maj: 2, jours: {}, serie: 1, modules: {}}));
  await assertFails(setDoc(doc(membre(), "classement/tom"), {maj: 2, jours: {}, serie: 1, modules: {}}));
  await assertFails(setDoc(doc(membre(), "classement/mia"), {maj: 2, jours: {}, serie: 1, modules: {}, xp: 1e9}));
  await assertSucceeds(setDoc(doc(membre(), "joueurs/mia"), {pseudo: "Mia", plaque: "r1", cree: 1, maj: 2}));
  await assertFails(setDoc(doc(membre(), "joueurs/tom"), {pseudo: "Tom", plaque: "r9", cree: 1, maj: 2}));
});
test("pseudo : impossible de prendre celui d'un autre ; changement par écriture groupée", async () => {
  const db = membre();
  await assertFails(setDoc(doc(db, "joueurs/mia"), {pseudo: "Tom", cree: 1, maj: 2}));
  await assertFails(setDoc(doc(db, "joueurs/mia"), {pseudo: "Libre", cree: 1, maj: 2}));   // non réservé
  const b = writeBatch(db);
  b.set(doc(db, "pseudos/libre"), {uid: "mia"});
  b.delete(doc(db, "pseudos/mia"));
  b.set(doc(db, "joueurs/mia"), {pseudo: "Libre", cree: 1, maj: 2});
  await assertSucceeds(b.commit());
  await assertFails(deleteDoc(doc(db, "pseudos/tom")));           // pas le sien
});
test("contestations / signalements : privés (joueur + admin)", async () => {
  await assertSucceeds(setDoc(doc(membre(), "contestations/mia"), {items: [{ev: "e1"}]}));
  await assertSucceeds(setDoc(doc(membre(), "signalements/mia"), {items: [{q: "x"}]}));
  await assertFails(getDoc(doc(autre(), "contestations/mia")));
  await assertFails(setDoc(doc(autre(), "contestations/mia"), {items: []}));
  await assertSucceeds(getDocs(collection(admin(), "contestations")));
  await assertFails(getDocs(collection(membre(), "contestations")));
});
test("remarques_cal : écrites par le membre, lues par lui et Adam seuls", async () => {
  await assertSucceeds(setDoc(doc(membre(), "remarques_cal/mia"), {items: [{type: "manque", texte: "CC3", envoye: 1}]}));
  await assertFails(setDoc(doc(membre(), "remarques_cal/mia"), {items: [], autre: 1}));
  await assertFails(setDoc(doc(autre(), "remarques_cal/mia"), {items: []}));
  await assertFails(getDoc(doc(autre(), "remarques_cal/mia")));
  await assertSucceeds(getDocs(collection(admin(), "remarques_cal")));
  await assertFails(getDocs(collection(membre(), "remarques_cal")));
});
test("racine verrouillée : aucun chemin non prévu", async () => {
  await assertFails(setDoc(doc(membre(), "nimporte/quoi"), {a: 1}));
  await assertFails(setDoc(doc(admin(), "nimporte/quoi"), {a: 1}));
  await assertFails(setDoc(doc(membre(), "membres/mia"), {depuis: 0}));
});
