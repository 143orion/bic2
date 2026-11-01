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
    apiKey: "AIzaSyBAjUfjdpAyaVNjarM3PKpDgErYiWluCQo",
    authDomain: "bic2-exe.firebaseapp.com",
    projectId: "bic2-exe",
    storageBucket: "bic2-exe.firebasestorage.app",
    messagingSenderId: "108336614973",
    appId: "1:108336614973:web:a92286906eebc21d372454"
  },
  adminUid: "twND4HNNzZTEiCWdL3WQDUDBM6g2",
  sdk: "13.1.0"   // version du SDK Firebase chargée depuis le CDN gstatic
};
