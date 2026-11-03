# Module « Programmation C » (id `programmation-c`)

Cours ESILV Programmation C (BIC) : langage C de base jusqu'aux structures et à l'allocation dynamique. Créé le 03/11/2026. Sources : `Langage_C_CM1`, `Langage_C_Tableaux1D`, `Les-chaines-de-caracteres`, `Les-Fonctions`, `Les-pointeurs-et-lallocation-dynamique`, `Types-et-Structures`, TD `PremiersPas` et `Tableaux_chainex`. Pas d'annale disponible.

## Chapitres (`banques/programmation-c/`)
| ordre | id | titre | statut | sources |
|---|---|---|---|---|
| 1 | `c-1-prise-en-main` | Prise en main | ✅ en ligne | CM1 · TD ex. 1 |
| 2 | `c-2-variables-types` | Variables, types et opérateurs | ✅ en ligne | CM1 · Types · TD ex. 3, 5, 6 |
| 3 | `c-3-entrees-sorties` | Entrées / sorties | ✅ en ligne | CM1 · TD ex. 2, 3 |
| 4 | `c-4-controle` | Structures de contrôle | ✅ en ligne | CM1 · TD Premiers pas · TD Boucles (débutant) |
| 5 | `c-5-tableaux` | Tableaux 1D | à faire | Tableaux1D · TD Boucles (intermédiaire) |
| 6 | `c-6-chaines` | Chaînes de caractères | à faire | Chaînes · Fonctions (`string.h`) |
| 7 | `c-7-fonctions` | Fonctions | à faire | Fonctions |
| 8 | `c-8-pointeurs` | Pointeurs | à faire | Pointeurs |
| 9 | `c-9-allocation` | Allocation dynamique | à faire | Pointeurs · Types |
| 10 | `c-10-structures` | Types et structures | à faire | Types et Structures |

Ids des items : `c<chapitre>-0xx` (questions courtes), `c<chapitre>-1xx` (exos). Ne jamais réutiliser un id. Ids des checks : `<chapitre>-ctl-<n°>`.

## Notions des chapitres en ligne (ids figés)
1.1 langage et jargon · 1.2 structure d'un programme · 1.3 commentaires et conventions · 2.1 variables · 2.2 `#define` · 2.3 types et modificateurs · 2.4 opérateurs · 2.5 conversions · 2.6 booléen · 3.1 `printf` · 3.2 formats · 3.3 `scanf` · 4.1 `if / else` · 4.2 `switch` · 4.3 `for` · 4.4 `while` · 4.5 `do-while` · 4.6 `break` / `continue`.

Prévu pour la suite : 5.1 déclarer/accéder · 5.2 taille physique vs logique · 5.3 erreurs fréquentes · 5.4 algorithmes · 6.1 `'\0'` · 6.2 déclarer/initialiser · 6.3 `scanf` vs `fgets` · 6.4 parcours · 6.5 `string.h` · 7.1 prototype · 7.2 `void`/retour · 7.3 portée · 7.4 passage par valeur · 7.5 passage par adresse · 7.6 tableaux en paramètre · 7.7 bibliothèque standard · 7.8 modules `.h`/`.c` · 8.1 mémoire et adresses · 8.2 `&` et `*` · 8.3 déclarer, `NULL` · 8.4 arithmétique · 8.5 tableaux et pointeurs · 8.6 `const` · 9.1 statique vs dynamique · 9.2 `malloc`/`calloc` · 9.3 `realloc` · 9.4 `free`, fuites · 9.5 tableaux dynamiques · 10.1 `typedef` · 10.2 `enum` · 10.3 `struct` · 10.4 composition · 10.5 pointeur de struct · 10.6 tableaux de struct · 10.7 struct en paramètre.

## D.A. retenue : « Plan de masse » (palette Midnight Indigo / Vanilla Cream)
- Gabarit : celui de tous les modules (voir `GAMIFICATION.md` § D.A. « Gabarit de module »). Fond de page, header et header du lecteur = hub ; la D.A. du module ne concerne que sa carte du hub et les fenêtres du lecteur.
- `theme` de `liste.json` : `bg:#212842` (Midnight Indigo, fenêtres) · `fg:#F0E7D5` (Vanilla Cream, texte) · `ac:#F0E7D5` (accent) · `onAc:#212842` (texte sur accent) · police `Fira Code` (Google Fonts).
- Icône de carte : `{}`.
- Choix fait le 03/11/2026 à partir de 3 directions (Mémoire vive, Plan de masse, Diagnostic) ; prototype « Proto – Programmation C ».

## Éditeur C (mode de vérification `c`, en ligne depuis le 03/11/2026)
- Les exos « écris le programme » ont une **dernière étape « Écris le programme complet »** (`verif.mode:"c"`) : champ de code, zone « Entrée du programme » (préremplie avec le 1er test), bouton **Exécuter** qui affiche la sortie, puis la validation lance le programme sur **chaque jeu de tests** de la banque et compare ce qu'il affiche.
- Item : `verif:{mode:"c", tests:[{entree, sortie, nom?}], exemple:"<solution>", nombres?:true, tol?}`. `nombres:true` compare seulement la suite des **nombres** affichés (le texte autour est libre, tolérance 0,01) ; sinon comparaison du texte (espaces et fin de ligne normalisés, casse respectée). L'énoncé de l'étape doit **préciser le format de sortie**. `exemple` = solution montrée en correction ; **chaque solution doit passer ses propres tests** (vérifié à chaque modification : script `valider` dans la conversation de création).
- Moteur : interpréteur **JSCPP 2.0.9** dans un **Web Worker** (`site/vendor/c-worker.js`, généré par `tools/c-worker/`, voir son README), arrêté au bout de 5 s (boucle infinie). Notre propre lecture d'entrée : `scanf` (largeurs `%19s`, `%lf`, `" %c"`), `getchar`, `gets`, `fgets(…, stdin)` ; `stdbool.h` ; `main(void)` accepté. Dépassement de tampon signalé en français.
- **Limites** : pas de `malloc` / `free` / `realloc`, pas de `typedef struct` anonyme (`typedef struct Nom {…} Nom;` à tester) → chapitres 9 et 10 sans exécution (étapes `regex` / `numerique` / `exact`). Messages d'erreur de syntaxe traduits (ligne + colonne).
- Ne pas utiliser `mode:"c"` dans des items `qcm` / `saisie` courts : l'étape de code est un `exo` (durée 3 à 7 min).

## Règles de correction propres au module
- Réponses de code en `regex` (toute la réponse, insensible à la casse, espaces libres via `\s*`) ; l'`exemple` affiché en correction est la forme canonique.
- Les notations mathématiques sont en LaTeX ; le code (identifiants, opérateurs) est en `code` ou en blocs ```` ```c ````.
- Valeurs numériques : tolérance ±1 % par défaut ; ±0,01 sur les réponses décimales arrondies.

## Choix et réserves
- Les exos écrits avec « Mock » : pas d'annale fournie ; le mock est composé depuis la sélection.
- TD2 `Tableaux_chainex` : formule de l'exercice 4 (n-ième terme de la série) illisible dans le PDF → non repris. Exercices 6 à 12 de la partie intermédiaire (tableaux, chaînes) pour les chapitres 5 et 6.
- Durées théoriques à vérifier dans le panel après les premiers passages (exos 2 à 6 min).
