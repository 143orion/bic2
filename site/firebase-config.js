/* =====================================================================
   BIC2.exe — firebase-config.js
   Config web du projet Firebase. Ces valeurs ne sont PAS secrètes :
   elles identifient le projet, c'est tout. La sécurité repose entièrement
   sur firestore.rules (à la racine du dépôt).

   À remplir une fois le projet créé (voir GUIDE.md, étape « config web »).
   adminUid : l'UID Google d'Adam (même valeur que dans firestore.rules).
   Il ne sert qu'à l'interface (afficher le lien Admin) : les droits réels
   sont imposés par les règles, pas par ce fichier.
   ===================================================================== */
window.BIC2_FIREBASE = {
  config: {
    apiKey: "A_REMPLIR",
    authDomain: "A_REMPLIR.firebaseapp.com",
    projectId: "A_REMPLIR",
    appId: "A_REMPLIR"
  },
  adminUid: "A_REMPLIR",
  sdk: "13.1.0"   // version du SDK Firebase chargée depuis le CDN gstatic
};
