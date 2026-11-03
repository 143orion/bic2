# Module « Complément électronique » (id `complement-electronique`)

Cours ESILV Électricité-Électronique, partie électrocinétique (CMO1-3 + TD1-3). Créé le 31/10/2026.

## Chapitres (`banques/complement-electronique/`)
| ordre | id | titre | sources |
|---|---|---|---|
| 0 | `elec-0-prerequis` | Prérequis | rappels (préfixes, fractions, systèmes, lire un schéma, flèches) |
| 1 | `elec-1-grandeurs` | Grandeurs, Ohm, générateurs | CMO1 |
| 2 | `elec-2-kirchhoff` | Lois de Kirchhoff | CMO1 · TD1 |
| 3 | `elec-3-associations` | Associations & diviseurs | CMO2 · TD2 ex. 1-3 |
| 4 | `elec-4-thevenin-norton` | Thévenin & Norton | CMO2 · TD2 ex. 4-5 |
| 5 | `elec-5-superposition-millman` | Superposition & Millman | CMO3 · TD3 (+ examen blanc multi-chapitres `e5-901`) |

Ids des items : `e<chapitre>-0xx` (questions courtes), `e<chapitre>-1xx` (exos), `e5-901` (examen). Ne jamais réutiliser un id.

## D.A. retenue : « C · Bureau 2002 épuré »
- La D.A. du hub en version calme : chaque bloc est une fenêtre à barre de titre (`cours/`, `exos/`, `tldr.txt`, `labo.txt`…), un halo aurora, quelques ✦, lignes CRT seulement derrière les schémas.
- Variables : `--m-bg:#1b1b1e` · `--m-fg:#CFCFCF` · `--m-ac:#7F49B4` (violet du hub) · `--m-font:'JetBrains Mono'`. Surlignage des schémas en `--violet-clair` avec halo.
- Icônes SVG façon Lucide (pas d'emojis) : boussole (follow-along), feuillets (classique), éclair (TL;DR), cible (compréhension), liste cochée (guidé), stylo (mock), dé (variantes), ampoule (indice), alerte (piège), fiole (labo).
- Notations en LaTeX partout (KaTeX embarqué dans `katex/`). Les étiquettes des schémas imitent le rendu LaTeX (italique + indice).

## Extension `modules/complement-electronique.js` (`ext: true` dans liste.json)
- **schemas** (modèles de circuits) : `diviseur`, `thev-L` (`src:"I"` pour la version source de courant), `thev-eq`, `norton-eq`, `par3`, `serie-I`, `td2-ex1`, `gen-reel`, `deux-gen`, `gen-par2`, `td3-ex1`, `millman3`, `td3-ex3`, `td3-ex4`, `td1-ex1`, `td1-ex3`, `td1-ex4`.
- **generateurs** (bouton 🎲, valeurs rondes calculables de tête, plus E12) : `thev-L`, `norton-L`, `par3`, `serie-I`, `gen-par2`, `gen-reel`, `millman3`, `sys2`, `ohm-P`, `td1-ex1`, `td1-ex3`, `td1-ex4`, `td2-ex1`, `deux-gen`, `td3-ex1`, `norton-millman`, `td3-ex3`, `td3-ex4` → **tous les exos en ont un**. Renvoient `{vals, rep[], corr[]}` ; les textes de l'item (énoncé, consignes, **indices**) utilisent `[[CLE]]`, y compris des valeurs intermédiaires (ex. `[[RP]]` = $R_1 \parallel R_2$). Les `vals` par défaut de l'item (valeurs du TD, utilisées en mock) doivent contenir toutes les clés.

## Exos guidés (01/11/2026)
- Nouvelles valeurs tirées **à chaque ouverture** en mode guidé (le mock garde les valeurs du TD).
- **Valeurs calculables de tête** : entrées rondes (résistances 1 / 1,5 / 2 / 2,5 / 3 / 4 / 5 / 6 / 8 × 100 Ω ou 1 kΩ, tensions 5…24 V, courants 2…50 mA). `propre()` retire au sort jusqu'à ce que toutes les réponses **et** les valeurs intermédiaires des indices (`chk`) tombent juste avec le bon préfixe : d'abord entier ou 2 chiffres significatifs (6 V, 2,5 mA, 37 V), sinon 1 décimale, sinon 2. Un nouveau générateur doit être enveloppé dans `propre()` et lister ses intermédiaires dans `chk`.
- `guidage` sur chaque exo : « Plan d'attaque » affiché en haut (montage, loi utilisée, plan des étapes, pièges).
- Consignes détaillées ; **indices = d'où ça vient** : indice 1 = le raisonnement (quelle loi, pourquoi elle s'applique ici), indice 2 = la formule appliquée avec les valeurs du tirage.
- **labos** (mode Classique) : `diviseur` (ch. 3), `thev-charge` (ch. 4).
- États de schéma par étape / écran : `surligne`, `eteint` (grisé = débranché ou source de courant éteinte), `court` (source de tension éteinte dessinée comme un fil « = 0 »).

## Migration vers le layout baseline (03/11/2026, branche refonte-lecteur)
- **Chapitre 3 migré** (test) au format `notions[]` : 3.1 série · 3.2 parallèle · 3.3 diviseur de tension (schéma + labo `diviseur`) · 3.4 diviseur de courant · 3.5 association de générateurs. Chaque notion a `corps`, `rec`, `alt`, `pre`, `ecrans` et `check`.
- Ids des checks **explicites** pour garder l'historique des anciens contrôles : 3.3 = `elec-3-associations-ctl-0`, 3.4 = `-ctl-1` (anciens parcours), 3.1 = `-ctl-2`, 3.2 = `-ctl-3`, 3.5 = `-ctl-4`.
- Nouveaux items : `e3-011` et `e3-012` (code à trous). Les items pointent vers une notion par son id (`notion: "3.2"`).
- Chapitres 0, 1, 2, 4, 5 : encore à l'ancien format, affichés par la compatibilité du lecteur (notion `<ordre>.<n° de carte de fiche>`, contrôle repris du parcours). À migrer en gardant ces ids.

## Règles de correction propres au module
- Réponses numériques en mode `numerique` avec `unite` (V, A, Ω, W, Hz, S) : « 5 mA », « 0,005 », « 4,7 kΩ » acceptés ; tolérance ±1 % (absolue 0,01 quand la réponse vaut 0 ou est négative).
- Signes : le sens est celui des flèches du schéma ; une valeur négative est attendue quand le sens réel est opposé.

## Choix et réserves
- **TD1 ex. 2** non repris : le fléchage du schéma ne donne que 2 équations pour 3 inconnues. À ajouter quand le corrigé du prof sera disponible.
- **TD2 ex. 2** : $D_2$ est considéré **en opposition** (déduit du sens de la flèche $U_2$) → $I = 2\ \text{A}$.
- **TD2 ex. 5** : $U_{BM}$ demandé en valeur absolue (5 V), le sens de la source n'étant pas lisible sans ambiguïté.
- Durées théoriques à vérifier dans le panel après les premiers passages (exos 3 à 12 min).
