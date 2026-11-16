# Module « Maths analyse » (id `maths-analyse`)

Cours ESILV d'analyse (F. Salvarani) : poly *Nombres complexes* (2025-26), poly *Intégration* (2026-27), notes manuscrites du prof (groupes 2.2 à 2.5 et 3.1 à 3.5), DST 1 (oct. 2024), DST 2 variante B (2025-26), rattrapage (mars 2026), exos de prépa du CC3 (2025-26). Créé le 16/11/2026. Remplace le placeholder `maths-analyse` du panel.

## Chapitres (`banques/maths-analyse/`) et parties
| ordre | id | titre | partie | sources |
|---|---|---|---|---|
| 0 | `ma-0-rappels` | Rappels : fonctions usuelles | commune | notes 3.1 · poly Intégration § 2.3 |
| 1 | `ma-1-algebrique` | Forme algébrique | ℂ complexes | poly § 1 à 3, 6, 7 · DST 1 ex. 1, 2, 5 · DST 2 ex. 1 · prép CC3 |
| 2 | `ma-2-trigo-expo` | Formes trigonométrique et exponentielle | ℂ complexes | poly § 3 à 7 · DST 1 ex. 3 · DST 2 ex. 2 · rattrapage ex. 1 · prép CC3 |
| 3 | `ma-3-racines` | Racines et équations du 2nd degré | ℂ complexes | poly § 8, 9 · DST 1 ex. 4 · rattrapage ex. 2, 3 |
| 4 | `ma-4-primitives` | Primitives et intégrales | ∫ intégrales | poly Intégration § 1 à 3, 6, 7 · DST 2 ex. 3 · prép CC3 |
| 5 | `ma-5-ipp` | Intégration par parties | ∫ intégrales | poly § 4.3 · DST 2 ex. 5 · rattrapage ex. 4 · prép CC3 |
| 6 | `ma-6-changement-variable` | Changement de variable | ∫ intégrales | poly § 4.2, 7 · DST 2 ex. 4 · rattrapage ex. 5 · prép CC3 |

41 notions (0.1-0.5 · 1.1-1.7 · 2.1-2.6 · 3.1-3.5 · 4.1-4.7 · 5.1-5.6 · 6.1-6.5), 152 items hors examens (61 saisies, 30 QCM, 10 trous, 7 QCM multi, 44 exos) + 3 examens (Mock « Annale ») : `ma3-301` DST 1, `ma6-301` DST 2, `ma6-302` rattrapage. Ids : `ma<chapitre>-0xx` (questions courtes), `ma<chapitre>-1xx` (exos de cours / TD), `ma<chapitre>-2xx` (exos d'annale, valeurs du sujet), `ma<chapitre>-3xx` (examens). Ne jamais réutiliser un id.

**Parties** (`parties` dans `liste.json`, évolution générique du lecteur) : ℂ Nombres complexes (ch. 1 à 3, `#8fc7e8`) et ∫ Intégrales (ch. 4 à 6, `#f0a35e`) ; le ch. 0 n'est dans aucune partie, il est donc commun. Le sélecteur « Tout · ℂ · ∫ » de la barre du lecteur filtre l'Explicatif, le Follow-along, le TL;DR et le menu des Exos ; un lien « cf. » vers l'autre partie bascule le filtre.

## D.A. retenue : A « Tableau noir » (16/11/2026)
- Ardoise vert-de-gris, texte craie, accent craie jaune ; l'italique cursive de Victor Mono rappelle l'écriture au tableau.
- `theme` : `bg #1b2420` · `fg #e6e2d3` · `ac #F2D16B` · `onAc #1d1a0c` (texte sombre sur l'accent clair) · police Victor Mono · icône `∫`.
- Teintes des parties : ℂ `#8fc7e8`, ∫ `#f0a35e`. Contrastes : texte 12,3:1 · accent 10,7:1 · texte sur accent 11,7:1.
- Prototype : artefact « Proto – Maths analyse » (v4 : parties, saisie d'expressions, exo pas à pas, labos, 3 directions de D.A.).

## Saisie d'expressions : mode de vérification `expr` (`site/expr.js`, partagé)
- L'élève tape comme sur sa copie (`7/2 + 9/2 i`, `16√2 e^(iπ/4)`, `x e^x - e^x + C`, `±(2+i)`) : barre de symboles et aperçu LaTeX (KaTeX) sous le champ.
- Vérification numérique dans ℂ : toute forme équivalente est acceptée. Options : `forme` (`algebrique` / `expo` / `trigo` : une réponse juste mais mal présentée est refusée avec un message), `var` ou `vars` (fonction de $x$, de $x$ et $y$…), `primitive` (égalité à une constante près), `constante` (exige `+ C`), `domaine`, `liste` (plusieurs réponses séparées par « ; », dans n'importe quel ordre, `±` développé), `parmi` (une réponse parmi plusieurs, ex. $\delta$ ou $-\delta$), `interdit` (regex sur la réponse brute, pour empêcher de recopier l'énoncé), `exemple` (texte d'aide dans le champ).
- `tools/variantes/verifier.mjs` vérifie que chaque `attendu` (et chaque variante) se lit et passe sa propre vérification.

## Extension `modules/maths-analyse.js` (`ext: true`)
- **schemas** : `plan` (plan complexe : `pts` [[re, im, "étiquette"]…], `r` + `centre` pour un cercle, `poly` pour relier les racines, `vecteur` pour le module et l'argument), `cercle` (cercle trigonométrique, angle `k` en multiples de π/12), `aire` (aire sous une courbe : `f` écrite comme une réponse `expr`, bornes `a`, `b`, `coupe` pour Chasles).
- Éléments de schéma ajoutés au lecteur (`SV.rendre`), utilisables par tout module : `p` (surface pleine, classes `aire` / `aire2`) et `o` (cercle ou point, classes `cercle` / `pz` / `pz2` / `pg`).
- **labos** (cours, sans XP) : `plan` (2.1 : z des sujets ou point qu'on fait glisser ; quadrant, α, θ, formes trigo/expo) et `aire` (4.5 : ∫ de |x + a| sur [−2, 2], coupe de Chasles).
- Pas de `generateurs` : toutes les variantes sont écrites dans les banques par les specs `tools/variantes/specs/ma-*.mjs` (outils exacts : fractions, complexes, nombres $q\sqrt s$, angles en π/12 dans `ma-outils.mjs`).

## Rédaction des exos
- Les exos suivent les types qui tombent aux CC. **Guidé** : une idée par étape (questions courtes `guideSeul`), 2 indices sur l'étape finale. **Classique / Mock** : l'énoncé et le résultat final seulement.
- Les paramètres des sujets (« avec $c = 7$ », « $b = 5$ ») deviennent des variantes 🎲 ; les exos `2xx` gardent les valeurs exactes du sujet pour les examens.

## Choix et réserves
- **DST 2, ex. 1** : le sujet écrit $(2i - c)z + (3 - i)z + (1 + i) = 0$, avec deux $z$ (sans conjugué). Repris tel quel ($z = \frac{3}{17} + \frac{5}{17}i$) ; le type « $z$ et $\bar z$ » est travaillé avec les exos de prépa du CC3 (`ma1-103`).
- **DST 2, ex. 2** : $z = \frac{2 - i}{5}$ n'a pas d'argument remarquable : $\theta = -\arctan\frac12$ (accepté par le correcteur).
- **Rattrapage, ex. 2** : $\sqrt{4\sqrt2} = 2^{5/4}$ ; les racines sont acceptées sous toute forme ($\pm 2^{5/4}e^{-i\pi/8}$).
- **Rattrapage, ex. 5** : lu comme $\int\frac{1}{\sqrt y}\cdot\frac{1}{\sqrt y + 5}\,dy$ (mise en page du PDF ambiguë).
- **Fractions rationnelles** (poly Intégration § 5 : Ruffini, éléments simples) : pas reprises (jamais tombées aux CC), ajoutables plus tard en ch. 7.
- Le résumé claude.ai « Nombres complexes — Résumé ultime (prépa DST) » a servi de base au découpage des chapitres 1 à 3 (son sujet blanc est repris dans les exos).
- Durées théoriques à vérifier dans le panel après les premiers passages.
