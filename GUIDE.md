# Guide : ce qu'Adam fait lui-même (consoles Firebase / GitHub)

Rien ici n'est secret, mais **ne mets jamais ton e-mail ni ton mot de passe dans le dépôt**.

## A. GitHub (fait ✓)
1. Dépôt `143orion/bic2` public, sans fichier initial.
2. Settings → Pages → Source : **GitHub Actions**.
3. Application Claude installée sur le dépôt.

## B. Projet Firebase
1. https://console.firebase.google.com → **Créer un projet** → nom `bic2` → **désactiver Google Analytics** → Créer.
   Le plan est **Spark** (gratuit) par défaut : n'ajoute pas de carte bancaire.
2. **Authentication** → Commencer → onglet *Sign-in method* → **Google** → Activer → choisis ton e-mail d'assistance → Enregistrer.
3. **Authentication** → onglet *Paramètres* → **Domaines autorisés** → Ajouter un domaine → `143orion.github.io`.
4. **Firestore Database** → Créer une base de données → édition **Standard** → ID `(default)` → emplacement **`europe-west9` (Paris)** (définitif, impossible à changer ensuite) → démarrer en **mode production** (tout est refusé tant que nos règles ne sont pas publiées : c'est voulu).
5. ⚙️ **Paramètres du projet** → Général → *Vos applications* → icône **`</>`** (Web) → surnom `bic2-web` → **ne coche pas** Firebase Hosting → Enregistrer.
   Copie le bloc `const firebaseConfig = { … }` affiché.

➡️ **À renvoyer à Claude : le bloc `firebaseConfig`** (apiKey, authDomain, projectId, appId…). Ces valeurs sont publiques par nature.

## C. Ton UID admin (après le branchement)
1. Ouvre https://143orion.github.io/bic2/ → Se connecter avec Google (ton compte).
2. L'écran de demande s'affiche : **n'envoie rien**.
3. Console Firebase → **Authentication** → onglet *Utilisateurs* → copie la colonne **UID** de ta ligne.

➡️ **À renvoyer à Claude : ton UID.** Il sera mis dans `firestore.rules` et `firebase-config.js`.

## D. Publier les règles
1. Console Firebase → **Firestore Database** → onglet **Règles**.
2. Remplace tout le contenu par celui de `firestore.rules` (version avec ton UID, fournie par Claude) → **Publier**.
3. Recharge le site : tu arrives directement sur le hub, avec le lien Admin.

Les règles ne partent **pas** avec GitHub Pages : à chaque modification de `firestore.rules`, il faut refaire D.

## E. Surveiller le budget
Console Firebase → **Firestore Database** → onglet **Utilisation** : lectures / écritures du jour
(plafond gratuit : 50 000 lectures, 20 000 écritures, remis à zéro vers 9 h, heure de Paris).
