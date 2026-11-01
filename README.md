# BIC2.exe

Hub de révision gamifié pour les cours ESILV (Bachelor Informatique & Cybersécurité).
Site statique sur **GitHub Pages**, connexion Google et base **Firebase** (plan Spark gratuit).

Règles du jeu, architecture et format des contenus : `GAMIFICATION.md` et `QUESTIONS.md`
(dans le projet Claude « BIC2.exe », ils font foi).

## Organisation

| Chemin | Rôle |
|---|---|
| `site/` | **Seul dossier publié.** Pages, moteur `xp.js`, `theme.css`, modules, banques, sons |
| `site/firebase-config.js` | Config web Firebase (publique par nature) + UID admin pour l'interface |
| `site/firebase-adapter.js` | Remplace `window.claude` : Auth Google, Firestore, écran d'accès |
| `firestore.rules` | **Règles de sécurité** : la vraie protection des données |
| `tests/regles.test.mjs` | Tests des règles sur l'émulateur Firestore |
| `tests/captures.mjs` | Parcours du site sur le simulateur + captures ordi / téléphone |
| `tools/mock.js` | Simulateur Firebase en mémoire (jamais publié) |
| `.github/workflows/pages.yml` | Tests puis publication automatique à chaque push sur `main` |
| `GUIDE.md` | Ce qu'Adam fait lui-même dans les consoles Firebase / GitHub |

## Commandes

```bash
npm ci
npm run test:regles          # règles Firestore sur l'émulateur (Java requis)
node tests/captures.mjs      # parcours + captures dans tests/captures/
```

Les règles (`firestore.rules`) se publient depuis la console Firebase (ou `firebase deploy --only firestore:rules`) :
elles ne partent **pas** avec GitHub Pages.
