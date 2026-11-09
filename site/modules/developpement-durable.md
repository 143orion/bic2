# Module « Développement durable » (`dev-durable`)

Cours ESILV d'introduction au développement durable (9 cours de la Direction Soft Skills, DD & Carrières). L'éval se fait en **questions ouvertes** (quiz de 5 questions notées de 0 à 4, toutes les 2 séances) : le module sert surtout à **restituer le cours** avec le plus de détails possible.

Identifiant **`dev-durable`** : c'est celui du placeholder créé dans le panel, que le module remplace (sa carte, son icône ☘ et l'éval du calendrier s'y rattachent). C'est une **exception au gabarit** des autres modules : il a sa **propre page**, `site/developpement-durable.html` (champ `page` de `liste.json`), qui réutilise `xp.js` mais pas le lecteur `module.html`. Rien de ce module ne s'applique aux autres.

## Structure de la page
- **Cours** en notes liées (style Obsidian), sur 3 colonnes :
  - gauche : les 9 cours ; le cours ouvert se déplie en **parcours** de notes (fil de lecture, « précédent / suivant ») + « Toutes les dates » ;
  - centre : la page lue (sommaire d'un cours avec « L'essentiel », une note, une question du jour J) ; liens `[[…]]` avec aperçu au survol, « Mentionné dans » (liens entrants), « Utile pour » (questions) ;
  - droite, toujours visible : **Questions** (les 16 questions du jour J) · **Lien** (un lien cliqué s'ouvre ici sans quitter la note : « ‹ retour », « ouvrir ici ») · **Voisinage** (graphe local de la page centrale).
- **S'exercer** :
  - **QCM** (`type: "qcm"`) : 4 réponses = la bonne + 3 leurres tirés dans `choix` + `leurres` ; réponses affichées 2 s après la question.
  - **Coche les vérités** (`type: "qcm-multi"`) : 6 affirmations tirées dans `affirmations` (toujours au moins une vraie et une fausse) ; XP **au prorata** (bonnes cochées − mauvaises cochées) / nombre de vraies, envoyé au moteur par `moteur.reponse(id, juste, temps, {score})`.
  - **Flashcards** (sans XP) : les 16 questions ; au verso, on touche dans la réponse modèle les éléments oubliés (`pts`) ; **sue à partir de 80 %** des éléments cités. Mode « Rédiger » : on écrit sa réponse puis on compare. Statut rangé dans le journal par `moteur.noter(idQuestion, sue)` (type `carte`, ignoré par le calcul d'XP).
  - « Revoir la notion » ouvre la note dans une **fenêtre centrée** (fond flouté) sans quitter l'exercice ; « Signaler une erreur » sur chaque item.
- **Chevrons** des questions : double rouge = **Annoncée** (les notes de la classe disent qu'elle tombe ; pulse 2 fois à l'ouverture), simple gris = **Insistée** (le prof a appuyé dessus). Statut : coche verte (sue) / flèche orange (à revoir).

## XP (propres au module, `xp` dans `liste.json`, surchargeables dans le panel → onglet Modules)
- QCM juste : **10 XP** · Coche les vérités : **jusqu'à 20 XP** au prorata, effort **45 s** · Flashcards : aucune XP.
- Le reste suit GAMIFICATION.md (une fois par jour, maîtrise, rattrapage, progression dans le module, plafonds).

## D.A. « Carnet phosphorescent »
- Couleurs (`theme` de `liste.json`) : celles du placeholder du panel (fond des fenêtres `bg`, accent `ac`). Toute la page en dérive (liens, halos, surlignages via `color-mix` sur `--m-ac`). Fond de page et header = D.A. du hub.
- Notes, réponses et cartes en **Newsreader** (serif de lecture, Google Fonts) ; interface en JetBrains Mono.
- Grain de papier + lignes CRT très légères sur les fenêtres ; liens `[[…]]` verts qui luisent ; étiquettes `#tags` ; flashcards en fiches bristol lignées avec marge verte ; éléments à citer surlignés.
- Classes préfixées `dd-` (aucun conflit avec `theme.css`).

## Format des banques (`site/banques/dev-durable/<chapitre>.json`)
Format propre au module (les notions sont des notes atomiques partagées entre cours) :
```js
{ id: "dd-1-principes", module: "dev-durable", titre, ordre, sources: [...],
  essentiel: ["…"],                       // « L'essentiel » du cours (HTML simple, jetons {S} {O} {C})
  fil: ["dd", "principes", …],            // ordre de lecture ; peut citer des notes rangées dans un autre cours
  notions: [ { id: "externalite", titre, o: "slides" | "dit en cours" | "complément" | "slides + complément",
               corps: "texte ; **gras**, *italique*, listes « - », liens [[id]] ou [[id|texte]]" } ],
  questions: [ { id: "dd-q-externalite", force: 2 | 1, q, rep: "HTML", pts: ["extraits exacts de rep"], src: [[titre, url]], notes: [ids] } ],
  dates: [ { annee, texte } ],
  items: [
    { id: "dd-1-qcm-01", type: "qcm", notion, enonce, choix: [bonne, leurres…], leurres: [réserve], verif: {mode: "exact", attendu: [0]}, explication, duree: 0.33 },
    { id: "dd-1-vf-01", type: "qcm-multi", notion, enonce, affirmations: [ {t, vrai} ], explication, duree: 0.75 } ] }
```
- `rep` : jetons de provenance `{S}` slides · `{O}` dit en cours · `{C}` complément (sources dans `src`) ; références `{{dd-q-…}}` → « cf. Qn ».
- `pts` : chaque extrait doit apparaître **tel quel** dans `rep` (première occurrence surlignée) ; viser 6 à 17 éléments.
- `affirmations` : au moins 2 vraies et 2 fausses, idéalement 7 ou 8 (on en tire 6).
- Ids des items, des notes et des questions : **stables à vie** (journal, statut des flashcards). Ne jamais supprimer un item.

## Chapitres
1. `dd-1-principes` — Principes et enjeux du DD
2. `dd-2-limites` — Les limites planétaires
3. `dd-3-entreprises` — Le DD dans les entreprises
4. `dd-4-territoires` — Le DD dans les territoires
5. `dd-5-debats` — Débats et controverses
6. `dd-6-gouvernance` — Gouvernance et démarche multi-acteurs
7. `dd-7-modeles` — Nouveaux modèles économiques
8. `dd-8-complexite` — Comprendre la complexité
9. `dd-9-esprit-critique` — Construire son esprit critique

Total : 64 notes, 16 questions du jour J, 41 QCM, 15 séries « Coche les vérités » (56 items comptés dans `liste.json`).

## Sources du contenu
Slides des 9 cours, notes de cours de la classe (questions annoncées, contenu dit à l'oral), compléments sourcés (vie-publique.fr, ministère de la Transition écologique, Direction générale du Trésor, OQLF, bilan 2025 des limites planétaires de l'Institut de Potsdam, décision 2024 de l'IUGS sur l'Anthropocène).
À jour : 7 limites sur 9 dépassées (2025) ; Anthropocène rejeté comme époque officielle (mars 2024).
