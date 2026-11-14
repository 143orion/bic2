# Module « Capteurs analogiques » (id `capteurs-analogiques`)

Cours ESILV « Capteurs analogiques » : cours 1 (signaux, capteurs, CAN/CNA, paramètres), cours 2 (AOP, montages, filtres), TD1, TD AOP, corrigé du devoir maison, TP0 Arduino. Créé le 14/11/2026.

## Chapitres (`banques/capteurs-analogiques/`)
| ordre | id | titre | sources |
|---|---|---|---|
| 0 | `ca-0-rappels` | Rappels d'électricité | cours 2 · rappels (renvoi vers Complément électronique) |
| 1 | `ca-1-signaux` | Les signaux | cours 1 §1 · DM (binaire) |
| 2 | `ca-2-capteurs` | Les capteurs | cours 1 §2 et §4 · TD1 ex. 1, 3, 4, 5 · corrigé DM ex. 5 |
| 3 | `ca-3-can` | Convertisseurs CAN et CNA | cours 1 §3 · TD1 ex. 2, 6 |
| 4 | `ca-4-aop` | L'amplificateur opérationnel | cours 2 I.1 à I.3.1 · TD AOP ex. 1 |
| 5 | `ca-5-montages` | Montages linéaires à AOP | cours 2 I.3.2 · TD AOP ex. 2, 3 |
| 6 | `ca-6-filtres` | Filtres actifs d'ordre 1 | cours 2 II |
| 7 | `ca-7-arduino` | Prise en main d'Arduino | TP0 |

43 notions (0.1-0.4 · 1.1-1.6 · 2.1-2.7 · 3.1-3.6 · 4.1-4.5 · 5.1-5.8 · 6.1-6.3 · 7.1-7.4), 117 items (41 saisies, 39 QCM, 16 trous, 7 QCM multi, 14 exos). Ids : `ca<chapitre>-0xx` (questions courtes), `ca<chapitre>-1xx` (exos). Checks : id par défaut `<chapitre>-ctl-<n° de notion>`. Ne jamais réutiliser un id.

## D.A. retenue : « Datasheet » (14/11/2026)
- Fiche technique de composant : graphite, orange « pointe de sonde », typo mono technique, aucun effet.
- `theme` : `bg #1d1f24` · `fg #e8e6e1` · `ac #FF7A1A` · `onAc #1a0e04` (texte sombre sur l'accent clair) · police IBM Plex Mono · icône `∿`.
- Prototype : artefact « Proto – Capteurs analogiques » (v3, sélecteur de directions A Phosphore / B Datasheet / C Carte Arduino).

## Extension `modules/capteurs-analogiques.js` (`ext: true`)
- **schemas** : `chaine`, `chaine-cna` (blocs) · `suiveur`, `inverseur`, `non-inverseur` (`R3` facultatif entre + et masse), `comparateur`, `sommateur`, `derivateur`, `passe-bas`, `passe-haut`, `td-ex1` (4 montages), `td-ex3a`, `td-ex3b`, `td-ex3c` (cascades) · `millman3b` · graphes `caract` (vals `a`, `b` : droite $V = aP + b$ sur grille 0,1 V / 0,5 bar), `signal` (`forme` sin|tri|carre|scie, `U`, `O`, `T`, `A`, `moy`), `escalier` (CAN), `saturation`, `gain` (`type` pb|ph).
- Nouveaux éléments de schéma ajoutés au lecteur (module.html, `SV.rendre`) pour ce module : `AO` (ampli op), `C` (condensateur), `g` (masse), `B` (bloc), `c` (courbe, classes `tr`/`tr2`/`gr`/`ax`/`pt` dans theme.css). Utilisables par tout module.
- **generateurs** : signaux (`periode`, `frequence`, `pwm-moy`, `pwm`, `bin-tete`, `bin-dm`, `bin-dec`, `bin-octet`, `bin-exo`), capteurs (`caract`, `tmp36`, `pt100`), CAN (`can-q`, `can-code`, `can-exo`, `can-tension`, `ard-volts`), AOP (`gain-inv`, `gain-ninv`, `sat`, `somme`, `td-ex2`, `td-ex3a`, `td-ex3b`, `td-ex3c`), filtres (`fc`, `db`, `passe-bas`). Une réponse numérique tirée doit être une clé « brute » (point décimal : `FN`, `TN`, `MN`…) ; les clés avec virgule servent à l'affichage.
- **labos** (cours) : `oscillo` (1.3), `can` (3.2), `aop` (5.3, avec le comparateur), `filtre` (6.1). Chaque labo affiche un bloc de calcul en LaTeX recalculé en direct.

## Règles de correction propres au module
- **Code d'un CAN** : la partie entière **et** l'arrondi sont acceptés (mode `exact` avec les deux valeurs).
- **Binaire** : deux familles de variantes : « de tête » (5 à 63, au plus quatre 1) et « comme au DM » (100 à 2000, correction avec le tableau des divisions).
- Lecture de graphe (`caract`) : tolérances absolues (0,02 V pour l'offset, 0,006 V/bar pour la pente).
- Réponses numériques avec `unite` (V, A, Hz, Ω, s, S) : préfixes SI acceptés.

## Choix et réserves
- **Corrigé du DM, ex. 5** : incohérent ($S = (0{,}86 - 0{,}5)/(4 - 2)$ annoncé à 0,72 V/bar). Non repris : l'exo `ca2-101` régénère une caractéristique cohérente à chaque tirage.
- **Cours 2 (AOP)** : polycopié à trous ; les formules des montages et des filtres ont été rédigées à partir des résultats classiques.
- **Non-inverseur** : le poly nomme $R_1$ la contre-réaction ; le module suit la convention du TD ($R_2$ en contre-réaction, $R_1$ vers la masse : $A_v = 1 + R_2/R_1$) et signale la différence dans la notion 5.4.
- **TD AOP ex. 1** : schémas manuscrits peu lisibles, remplacés par 4 montages types (suiveur, réaction sur +, boucle ouverte, inverseur).
- **TD1 ex. 4** : figures non reproduites, décrites dans l'énoncé (`ca2-007`).
- **Arduino** : chapitre léger (QCM, saisies, code à trous), sans exécution de code.
- Durées théoriques à vérifier dans le panel après les premiers passages.
