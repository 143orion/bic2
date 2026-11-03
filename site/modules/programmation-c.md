# Module « Programmation C » (id `programmation-c`)

Cours ESILV Programmation C (BIC) : langage C de base jusqu'aux structures et à l'allocation dynamique. Créé le 03/11/2026. Sources : `Langage_C_CM1`, `Langage_C_Tableaux1D`, `Les-chaines-de-caracteres`, `Les-Fonctions`, `Les-pointeurs-et-lallocation-dynamique`, `Types-et-Structures`, TD `PremiersPas` et `Tableaux_chainex`. Pas d'annale disponible.

## Chapitres (`banques/programmation-c/`)
| ordre | id | titre | statut | sources |
|---|---|---|---|---|
| 1 | `c-1-prise-en-main` | Prise en main (21 items) | ✅ en ligne | CM1 · TD ex. 1 |
| 2 | `c-2-variables-types` | Variables, types et opérateurs (41 items) | ✅ en ligne | CM1 · Types · TD ex. 3, 5, 6 |
| 3 | `c-3-entrees-sorties` | Entrées / sorties (26 items) | ✅ en ligne | CM1 · TD ex. 2, 3 |
| 4 | `c-4-controle` | Structures de contrôle (67 items) | ✅ en ligne | CM1 · TD Premiers pas · TD Boucles (débutant) |
| 5 | `c-5-tableaux` | Tableaux (30 items) | ✅ en ligne | Tableaux1D · TD Boucles (intermédiaire ex. 1-11) |
| 6 | `c-6-chaines` | Chaînes de caractères (31 items) | ✅ en ligne | Chaînes · Fonctions (`string.h`) · TD ex. 12 |
| 7 | `c-7-fonctions` | Fonctions (31 items) | ✅ en ligne | Fonctions (exercice tableaux, module calculatrice) |
| 8 | `c-8-pointeurs` | Pointeurs (28 items) | ✅ en ligne | Pointeurs |
| 9 | `c-9-allocation` | Allocation dynamique (23 items) | ✅ en ligne | Pointeurs · Types |
| 10 | `c-10-structures` | Types et structures (26 items) | ✅ en ligne | Types et Structures (annuaire, employé, classe) |

Ids des items : `c<chapitre>-0xx` (questions courtes), `c<chapitre>-1xx` (exos). Ne jamais réutiliser un id. Ids des checks : `<chapitre>-ctl-<n°>`.

## Notions (ids figés)
1.1 langage et jargon · 1.2 structure d'un programme · 1.3 commentaires et conventions · 2.1 variables · 2.2 `#define` · 2.3 types et modificateurs · 2.4 opérateurs · 2.5 conversions · 2.6 booléen · 3.1 `printf` · 3.2 formats · 3.3 `scanf` · 4.1 `if / else` · 4.2 `switch` · 4.3 `for` · 4.4 `while` · 4.5 `do-while` · 4.6 `break` / `continue`.

5.1 déclarer, initialiser, parcourir · 5.2 taille physique et logique · 5.3 erreurs fréquentes · 5.4 algorithmes · 6.1 chaîne et `'\0'` · 6.2 déclarer, initialiser · 6.3 `scanf` / `fgets` · 6.4 parcourir · 6.5 `string.h` · 7.1 prototype et définition · 7.2 `void` / retour · 7.3 portée · 7.4 par valeur · 7.5 par adresse · 7.6 tableau en paramètre · 7.7 bibliothèque standard · 7.8 modules `.h` / `.c` · 8.1 mémoire et adresses · 8.2 `&` et `*` · 8.3 déclarer, `NULL` · 8.4 arithmétique · 8.5 pointeurs et tableaux · 8.6 `const` · 9.1 statique / dynamique · 9.2 `malloc` / `calloc` · 9.3 `realloc` · 9.4 `free`, fuites, valgrind · 9.5 tableaux dynamiques · 10.1 `typedef` · 10.2 `enum` · 10.3 `struct` · 10.4 composition · 10.5 pointeur de struct `->` · 10.6 tableaux de struct · 10.7 struct en paramètre.

## D.A. retenue : « Plan de masse » (palette Midnight Indigo / Vanilla Cream)
- Gabarit : celui de tous les modules (voir `GAMIFICATION.md` § D.A. « Gabarit de module »). Fond de page, header et header du lecteur = hub ; la D.A. du module ne concerne que sa carte du hub et les fenêtres du lecteur.
- `theme` de `liste.json` : `bg:#212842` (Midnight Indigo, fenêtres) · `fg:#F0E7D5` (Vanilla Cream, texte) · `ac:#F0E7D5` (accent) · `onAc:#212842` (texte sur accent) · police `Fira Code` (Google Fonts).
- Icône de carte : `{}`.
- Choix fait le 03/11/2026 à partir de 3 directions (Mémoire vive, Plan de masse, Diagnostic) ; prototype « Proto – Programmation C ».

## Éditeur C (mode de vérification `c`, en ligne depuis le 03/11/2026)
- Les exos « écris le programme » ont une **dernière étape « Écris le programme complet »** (`verif.mode:"c"`) : champ de code, zone « Entrée du programme » (préremplie avec le 1er test), bouton **Exécuter** qui affiche la sortie, puis la validation lance le programme sur **chaque jeu de tests** de la banque et compare ce qu'il affiche.
- Item : `verif:{mode:"c", tests:[{entree, sortie, nom?}], exemple:"<solution>", nombres?:true, tol?}`. `nombres:true` compare seulement la suite des **nombres** affichés (le texte autour est libre, tolérance 0,01) ; sinon comparaison du texte (espaces et fin de ligne normalisés, casse respectée). L'énoncé de l'étape doit **préciser le format de sortie**. `exemple` = solution montrée en correction ; **chaque solution doit passer ses propres tests** (vérifié à chaque modification : script `valider` dans la conversation de création).
- Moteur : interpréteur **PicoC** patché pour BIC2 et compilé en WebAssembly WASI par zig (sources dans `tools/c-worker/picoc/`, build `build-wasm.sh` puis `npm run build`), dans un **Web Worker** (`site/vendor/c-worker.js`, environ 210 Ko), arrêté au bout de 8 s. Depuis le 03/11/2026 : comparaison de pointeurs (`p < fin`), soustraction (`fin - t` en éléments), arithmétique sur un nom de tableau (`t + 2`), `!p`, contrôle des accès hors mémoire (message au lieu d'un plantage). Gère `scanf`/`fgets`, `string.h`, `ctype.h`, `math.h`, `malloc`/`calloc`/`realloc`/`free`, `struct`, `typedef`, `enum`, tableaux 2D. Initialisations de structures par liste réécrites avant exécution ; `const` retiré ; paramètres `T t[]` réécrits en `T *t`.
- **Limites restantes** (à traiter en QCM/saisie) : tableaux à taille variable, `sizeof(float)` vaut 8 (float stocké en double), `const` non vérifié. Un dépassement de tableau qui reste dans la mémoire du programme n'est pas détecté (comme en vrai C). Messages d'erreur traduits (ligne + explication).
- L'éditeur part du squelette `#include <stdio.h>` + `int main(void) { … return 0; }` quand l'étape n'a pas de `depart`. Il grandit avec le code (au moins 320 px) ; dans un exo qui contient du code, l'énoncé passe au-dessus et l'éditeur prend toute la largeur.
- Ne pas utiliser `mode:"c"` dans des items `qcm` / `saisie` courts : l'étape de code est un `exo` (durée 3 à 7 min).
- **Bac à sable du cours** (03/11/2026) : onglet du panneau latéral de l'Explicatif (voir `GAMIFICATION.md`), affiché parce que le module a des exos `mode:"c"`. Bouton « Essayer » sur chaque bloc ```` ```c ```` du cours. Un extrait sans `main` reçoit les `#include` utiles (`stdio.h`, plus `stdlib.h` / `string.h` / `stdbool.h` selon le code) et un `main` : le code est placé dedans, ou un `main` vide est ajouté après des définitions de fonctions. Aucune XP.


## Rédaction (polish du 03/11/2026, à garder pour les chapitres suivants)
- **Cours** : chaque notion combine texte court, blocs ```` ```c ```` (colorés façon VS Code, bouton copier), **tableaux** markdown (`| a | b |`, `\|` pour une barre dans une cellule), **encadrés** `> **Piège** : …`, `> **À retenir** : …`, `> **Astuce** : …`, `> **Exemple** : …`, intertitres `### …`. Follow-along : un écran = une idée, avec un petit bloc de code.
- **Exos de code = cœur du module** : chaque notion a au moins un exo « écris le programme » (`code_exo`) ou « corrige le programme » (`bug_exo`, code de départ `depart` qui doit **échouer** à ses tests). Chaque exo de TD « écrire un programme » finit par une étape « programme complet ». Les contraintes de l'énoncé (« sans * », « avec un switch », « avec #define ») passent par `verif.exige` / `verif.interdit` (`{motif, msg, brut?}` ; motif testé sur le code sans commentaires ni chaînes, sauf `brut:true`).
- Express : questions « qu'affiche ce code ? » avec le code dans l'énoncé.
- Compte au 03/11 : **10 chapitres, 53 notions, 326 items, 123 exos**, chacun avec une étape de code exécutée (toutes les solutions passent leurs tests ; les codes de départ des exos « corrige » échouent).

## Règles de correction propres au module
- Réponses de code en `regex` (toute la réponse, insensible à la casse, espaces libres via `\s*`) ; l'`exemple` affiché en correction est la forme canonique.
- Les notations mathématiques sont en LaTeX ; le code (identifiants, opérateurs) est en `code` ou en blocs ```` ```c ````.
- Valeurs numériques : tolérance ±1 % par défaut ; ±0,01 sur les réponses décimales arrondies.

## Choix et réserves
- Les exos écrits avec « Mock » : pas d'annale fournie ; le mock est composé depuis la sélection.
- TD2 `Tableaux_chainex` : formule de l'exercice 4 (n-ième terme de la série) illisible dans le PDF → non repris. Exercices 6 à 12 de la partie intermédiaire (tableaux, chaînes) pour les chapitres 5 et 6.
- Durées théoriques à vérifier dans le panel après les premiers passages (exos 2 à 6 min).
