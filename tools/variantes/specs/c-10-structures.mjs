/* Chapitre 10 : consignes réécrites + variantes (08/11/2026). L'exo 10-110 est dans c-nouveaux-exos.mjs. */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const dec = (x, n = 2) => (Math.round(x * 10**n) / 10**n).toFixed(n);
const NOMS = ["Alice", "Bob", "Charlie", "Lea", "Hugo", "Ines", "Sami", "Zoe", "Yann", "Nora", "Theo", "Maya"];
const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];
const STRUCT = "#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    int note;\n} Etudiant;\n\n";
const CLASSE = "    Etudiant classe[3] = {\n        {\"[[N1]]\", [[A]]},\n        {\"[[N2]]\", [[B]]},\n        {\"[[N3]]\", [[C]]}\n    };\n";
const c109a = STRUCT + "int main(void) {\n" + CLASSE + "    for (int i = 0; i < 3; i++) {\n        printf(\"%d. %s - Note : %d/20\\n\", i + 1, classe[i].nom, classe[i].note);\n    }\n    return 0;\n}";
const c109 = STRUCT + "void afficher_classe(Etudiant etudiants[], int taille) {\n    for (int i = 0; i < taille; i++) {\n        printf(\"%d. %s - Note : %d/20\\n\", i + 1, etudiants[i].nom, etudiants[i].note);\n    }\n}\n\nint main(void) {\n" + CLASSE + "    afficher_classe(classe, 3);\n    int s = 0;\n    for (int i = 0; i < 3; i++) s += classe[i].note;\n    printf(\"%.2f\\n\", s / 3.0);\n    return 0;\n}";
const tel = R => "06" + Array.from({length: 8}, () => R.entre(0, 9)).join("");

/* rédaction : ce que le programme lit, ce qu'il fait, ce qu'il affiche (reformulation du 09/11/2026) */
const num = xs => xs.map((x, i) => `${i + 1}. ${x}`).join("\n");
const lit = (...xs) => "**Au clavier**, le programme reçoit dans l'ordre :\n" + num(xs);
const fait = (...xs) => "**Ce qu'il fait** :\n" + num(xs);
const affiche = s => "**Ce qu'il affiche** : " + s;
const afaire = (...xs) => "**À faire** :\n" + num(xs);
const BLOC = (...ps) => ps.filter(Boolean).join("\n\n");

export default {
  banque: "programmation-c/c-10-structures.json",
  n: 8,
  items: {
    "c10-003": {set: {enonce: "Dans `enum Status { ERROR = -1, SUCCESS = [[S]], PENDING, COMPLETED = 100 };`, que vaut `PENDING` ?", "verif.attendu": "[[R]]",
        explication: "Une constante sans valeur prend celle d'avant **plus 1** : après `SUCCESS = [[S]]`, `PENDING` vaut **[[R]]**."},
      tirer: R => ({S: R.entre(0, 20)}), deriver: v => ({R: v.S + 1})},
    "c10-004": {set: {enonce: "Dans `typedef enum { LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE } Jour;`, que vaut `[[J]]` ?", "verif.attendu": "[[R]]",
        explication: "Les constantes sont numérotées à partir de 0 : `LUNDI` = 0, `MARDI` = 1… donc `[[J]]` = **[[R]]**."},
      tirer: R => { const k = R.entre(1, 6); return {J: JOURS[k], R: k}; }},
    "c10-009": {set: {enonce: "Que vaut `b.x` ?\n```c\nPoint a = {[[X]], [[Y]]};\nPoint b = a;\na.x = [[Z]];\n```", "verif.attendu": "[[X]]",
        explication: "`b = a` **copie** tous les champs au moment où la ligne s'exécute. Changer `a.x` ensuite ne touche pas `b` : `b.x` vaut toujours **[[X]]**."},
      tirer: R => { const X = R.entre(1, 9); let Z; do Z = R.entre(10, 50); while(Z === X); return {X, Y: R.entre(1, 9), Z}; }},
    "c10-013": {set: {enonce: "Que vaut `emp.salaire` après `augmenter_salaire(&emp, [[P]]);` si le salaire valait [[S]] ? (`augmenter_salaire` ajoute le pourcentage donné)", "verif.attendu": "[[R]]",
        explication: "La fonction reçoit l'**adresse** de `emp`, elle modifie donc l'original : [[S]] + [[P]] % = **[[R]]**."},
      tirer: R => ({S: R.un([20000, 25000, 30000, 35000, 40000, 2000, 3000]), P: R.un([5, 10, 20, 2.5])}), deriver: v => ({R: v.S * (1 + v.P / 100)})},
    "c10-014": {set: {enonce: "Que vaut `classe[[[K]]].note` dans `Etudiant classe[3] = {{\"[[N1]]\", [[A]]}, {\"[[N2]]\", [[B]]}, {\"[[N3]]\", [[C]]}};` ?", "verif.attendu": "[[R]]",
        explication: "L'indice [[K]] désigne l'élément n° [[K1]] (on compte à partir de 0) : [[QUI]], qui a **[[R]]**."},
      tirer: R => { const [N1, N2, N3] = R.melange(NOMS), [A, B, C] = R.distincts(3, 8, 20), K = R.entre(0, 2); return {N1, N2, N3, A, B, C, K, K1: K + 1, R: [A, B, C][K], QUI: [N1, N2, N3][K]}; }},
    "c10-017": {set: {enonce: "Qu'affiche ce code ?\n```c\nvoid f(Employe e) { e.age = [[Z]]; }\nint main(void) {\n    Employe emp = {\"Dubois\", [[A]], 35000.0};\n    f(emp);\n    printf(\"%d\", emp.age);\n    return 0;\n}\n```", "verif.attendu": "[[A]]",
        explication: "`f` reçoit une **copie** de `emp` (passage par valeur) : elle met la copie à [[Z]], l'original garde **[[A]]**."},
      tirer: R => ({A: R.entre(20, 60), Z: R.un([0, 99, 100, 18])})},

    "c10-101": {
      set: {
        enonce: BLOC("Le but : regrouper deux valeurs qui vont ensemble (les coordonnées d'un point) dans une **structure**.",
          "**Le type** : `typedef struct { double x; double y; } Point;` (à écrire avant `main`).",
          lit("l'abscisse `x` du point (un réel) ;", "son ordonnée `y` (un réel)."),
          fait("range les deux nombres dans une variable `Point p` ;", "affiche la distance du point à l'origine, $\\sqrt{x^2 + y^2}$, avec 2 décimales."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. `Point p;` → 2. `scanf(\"%lf %lf\", &p.x, &p.y);` (on donne l'adresse **de chaque champ**) → 3. `sqrt(p.x * p.x + p.y * p.y)`, avec `#include <math.h>`.",
        ...E(0, {consigne: "On atteint un champ d'une structure avec un point, entre le nom de la variable et le nom du champ. Pour une variable `p` de type `Point`, écris l'expression qui désigne son champ `x`."}),
        ...E(1, {consigne: "`scanf` a besoin d'une adresse pour écrire. Écris l'argument à donner à `scanf` pour qu'il range un nombre dans le champ `y` de `p`."}),
        ...E(2, {consigne: "Premier jalon, **sans** structure :\n" + num(["déclare deux réels `double x, y;` ;", "lis-les avec `scanf(\"%lf %lf\", &x, &y);` ;", "affiche `x * x + y * y` (le carré de la distance) avec 2 décimales."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Passe à la structure :\n" + num(["avant `main`, déclare le type `Point` ;", "dans `main`, remplace `x` et `y` par une variable `Point p;` et lis dans `p.x` et `p.y` ;", "affiche la **distance** `sqrt(p.x * p.x + p.y * p.y)` avec 2 décimales (ajoute `#include <math.h>` en haut)."]), "verif.tests": tests("[[E0]]", "[[E1]]", "-6 8")}),
      },
      tirer: R => { const [a, b] = R.un([[3, 4], [6, 8], [5, 12], [8, 15], [1, 1], [2, 3], [7, 24], [9, 12]]); return {E0: `${a} ${b}`, E1: `${R.entre(-9, 9)} ${R.entre(1, 9)}`}; },
    },
    "c10-102": {
      set: {
        enonce: BLOC("Le but : donner des **noms** aux valeurs 0 à 6 avec une énumération, et s'en servir dans un `switch`.",
          "**Le type** : `typedef enum { LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE } Jour;` (avant `main`). `LUNDI` vaut 0, `MARDI` 1… `DIMANCHE` 6.",
          lit("un numéro de jour entre 0 et 6."),
          fait("range ce numéro dans une variable `Jour j` ;", "avec un `switch (j)`, affiche `week-end` si c'est `SAMEDI` ou `DIMANCHE`, `semaine` sinon."),
          ex("[[N0]]", "[[S3_0]]") + "\n\n([[N0]] correspond à `[[J0]]`.)"),
        ...E(0, {consigne: "Dans une énumération, les constantes sont numérotées automatiquement à partir de 0, dans l'ordre où on les écrit. Quelle valeur entière a `SAMEDI` ?"}),
        ...E(1, {consigne: "Dans un `switch`, deux étiquettes écrites l'une après l'autre (sans `break` entre elles) mènent au même bloc. Écris, sur une ligne, les deux étiquettes pour `SAMEDI` et `DIMANCHE`."}),
        ...E(2, {consigne: "Premier jalon, **sans** `enum` :\n" + num(["lis un entier `n` (de 0 à 6) ;", "si `n` vaut 5 ou 6, affiche `week-end`, sinon `semaine` (un simple `if`)."]), "verif.tests": tests("[[N0]]", "[[N1]]", "6")}),
        ...E(3, {consigne: "Passe à l'énumération :\n" + num(["avant `main`, déclare le type `Jour` ;", "après la lecture, écris `Jour j = n;` ;", "remplace le `if` par `switch (j)` : `case SAMEDI: case DIMANCHE:` → `week-end` (puis `break;`), `default:` → `semaine`."]), "verif.tests": tests("[[N0]]", "[[N1]]", "6", "0")}),
      },
      tirer: R => { const n0 = R.entre(0, 6); let n1; do n1 = R.entre(0, 6); while((n1 >= 5) === (n0 >= 5)); return {N0: n0, J0: JOURS[n0], N1: n1}; },
    },
    "c10-103": {
      set: {
        enonce: BLOC("Le but : mettre une structure **dans** une autre (une personne a une date de naissance).",
          "**Les types** (avant `main`) :\n- `Date` : trois entiers `jour`, `mois`, `annee` ;\n- `Personne` : un nom `char nom[30]` et un champ `Date naissance`.",
          lit("un nom (un mot) ;", "le jour, le mois et l'année de naissance."),
          fait("range tout dans une variable `Personne p` ;", "affiche sur une ligne : le nom, la date au format `j/m/aaaa`, puis l'âge atteint en 2026 (2026 − année)."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**À retenir** : pour atteindre un champ d'une structure qui est elle-même dans une structure, on enchaîne les points : `p.naissance.jour`.",
        ...E(0, {consigne: "Dans `Personne`, la date de naissance est un champ comme un autre : un type, puis un nom, puis `;`. Écris la déclaration de ce champ (type `Date`, nom `naissance`)."}),
        ...E(1, {consigne: "Pour atteindre le **mois** de naissance d'une `Personne p`, on passe d'abord par le champ `naissance`, puis par le champ `mois` de cette date. Écris l'expression."}),
        ...E(2, {consigne: "Premier jalon, avec `Date` seulement :\n" + num(["avant `main`, déclare le type `Date` ;", "dans `main`, déclare `char nom[30];` et `Date d;` ;", "lis le nom, puis `d.jour`, `d.mois`, `d.annee` ;", "affiche `nom j/m/aaaa`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Ajoute le type `Personne` :\n" + num(["déclare `Personne` (un `nom` et une `Date naissance`) ;", "dans `main`, une seule variable `Personne p;` : lis dans `p.nom`, `p.naissance.jour`, etc. ;", "affiche comme avant, et ajoute en fin de ligne l'âge : `2026 - p.naissance.annee`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS); return {E0: `${a} ${R.entre(1, 28)} ${R.entre(1, 12)} ${R.entre(1950, 2010)}`, E1: `${b} ${R.entre(1, 28)} ${R.entre(1, 12)} ${R.entre(1950, 2010)}`}; },
    },
    "c10-104": {
      set: {
        enonce: BLOC("Le but : modifier une structure **à travers un pointeur**, depuis une fonction.",
          "**Le type** : `typedef struct { char nom[50]; int age; double salaire; } Employe;`\n\n**La fonction** `void augmenter_salaire(Employe *e, double pourcentage)` augmente le salaire de l'employé pointé par `e` du pourcentage donné (salaire × (1 + pourcentage / 100)).",
          lit("le nom de l'employé (un mot) ;", "son âge ;", "son salaire ;", "le pourcentage d'augmentation."),
          fait("appelle `augmenter_salaire(&emp, pct)` ;", "affiche le nouveau salaire avec 2 décimales."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**À retenir** : avec un pointeur sur structure, on atteint les champs avec la flèche : `e->salaire` (c'est la même chose que `(*e).salaire`).",
        ...E(0, {consigne: "Quand on a un **pointeur** `e` sur une structure, on n'utilise pas le point mais la flèche `->` pour atteindre un champ. Écris l'accès au champ `salaire` à travers `e`."}),
        ...E(1, {consigne: "Pour que la fonction modifie le vrai `emp` de `main` (et pas une copie), on lui donne son **adresse**. Écris l'appel de `augmenter_salaire` pour `emp`, avec le pourcentage `pct`."}),
        ...E(2, {consigne: "Premier jalon, **sans** fonction :\n" + num(["déclare le type `Employe`, puis dans `main` une variable `Employe emp;` et un `double pct;` ;", "lis le nom, l'âge, le salaire et le pourcentage (`%49s %d %lf %lf`) ;", "augmente directement `emp.salaire` : `emp.salaire = emp.salaire * (1 + pct / 100);` ;", "affiche `emp.salaire` avec 2 décimales."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Déplace l'augmentation dans la fonction :\n" + num(["écris `void augmenter_salaire(Employe *e, double pourcentage)` avant `main` ; dans la fonction, `emp.salaire` devient `e->salaire` ;", "dans `main`, remplace le calcul par `augmenter_salaire(&emp, pct);` ;", "l'affichage ne change pas."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS); return {E0: `${a} ${R.entre(20, 60)} ${R.un([1800, 2000, 2500, 3200, 35000])} ${R.un([5, 10, 2.5, 20])}`, E1: `${b} ${R.entre(20, 60)} ${R.entre(15, 50)*100} ${R.un([3, 4, 12.5])}`}; },
    },
    "c10-105": {
      set: {
        enonce: BLOC("Le but : un **tableau de structures**, où chaque case regroupe le nom et la note d'un étudiant.",
          "**Le type** : `typedef struct { char nom[30]; int note; } Etudiant;`",
          lit("le nombre d'étudiants `n` (50 au plus) ;", "puis, pour chacun, une ligne `nom note`."),
          fait("range tout dans un tableau `Etudiant classe[50]` ;", "affiche la moyenne des notes (2 décimales), une espace, puis le **nom** de l'étudiant qui a la meilleure note (le premier en cas d'égalité)."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. à chaque tour, lire `classe[i].nom` et `&classe[i].note` → 2. cumuler la somme → 3. retenir l'**indice** `best` du meilleur, pour retrouver son nom à la fin → 4. moyenne réelle.",
        ...E(0, {consigne: "Écris le `scanf` qui lit le nom puis la note de l'étudiant d'indice `i`, au format `nom note` (nom limité à 29 caractères : `%29s`). Rappel : le nom est un tableau (pas de `&`), la note un entier (avec `&`)."}),
        ...E(1, {consigne: "`best` est l'indice du meilleur étudiant trouvé jusqu'ici. Écris la condition (sans `if`) qui est vraie quand l'étudiant `i` a une note **strictement** meilleure que celle de `classe[best]` (strictement, pour garder le premier en cas d'égalité)."}),
        ...E(2, {consigne: "Premier jalon, **sans** structure, avec des notes seules :\n" + num(["lis `n`, puis `n` notes (des entiers) dans `int notes[50]` ;", "affiche la moyenne (2 décimales), une espace, puis l'**indice** de la meilleure note."]), "verif.tests": tests("[[F0]]", "[[F1]]")}),
        ...E(3, {consigne: "Passe au tableau de structures :\n" + num(["avant `main`, déclare le type `Etudiant` ;", "remplace `int notes[50]` par `Etudiant classe[50]` et lis `nom note` pour chacun ;", "à la fin, affiche la moyenne puis le **nom** du meilleur : `classe[best].nom`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const mk = n => { const noms = R.melange(NOMS).slice(0, n), notes = Array.from({length: n}, () => R.entre(5, 20)); return [noms.map((x, i) => `${x} ${notes[i]}`), notes]; };
        const n0 = R.entre(3, 5), [l0, t0] = mk(n0), [l1, t1] = mk(2);
        return {E0: [n0, ...l0].join("\n"), E1: [2, ...l1].join("\n"), F0: [n0, ...t0].join("\n"), F1: [2, ...t1].join("\n")}; },
    },
    "c10-106": {
      set: {
        enonce: BLOC("Le but : un **annuaire** dont la taille est choisie à l'exécution (tableau de structures alloué avec `calloc`).",
          "**Le type** : `typedef struct { char nom[30]; char tel[15]; } Contact;`",
          lit("le nombre de contacts `n` ;", "puis, pour chacun, une ligne `nom telephone` ;", "enfin, le nom à chercher."),
          fait("réserve avec `calloc` un tableau de `n` contacts et y range les contacts ;", "cherche le premier contact qui porte le nom cherché ;", "affiche son téléphone, ou `inconnu` si personne ne porte ce nom ;", "libère l'annuaire."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. `calloc(n, sizeof(Contact))` : `sizeof` marche aussi sur un type structure → 2. test `NULL`, lecture des contacts → 3. lire le nom cherché → 4. comparer les noms avec `strcmp(…) == 0` (jamais `==` sur des chaînes) → 5. afficher → 6. `free`.",
        ...E(0, {consigne: "Écris la ligne qui déclare `Contact *annuaire` et lui donne, avec `calloc`, la place de `n` contacts (la taille d'un élément est celle d'un `Contact`)."}),
        ...E(1, {consigne: "On ne compare pas deux chaînes avec `==` (ça comparerait des adresses) : on utilise `strcmp`, qui renvoie 0 quand elles sont égales. Écris la condition (sans `if`) vraie quand le nom du contact `i` est égal à `cherche`."}),
        ...E(2, {consigne: "Premier jalon, avec un tableau ordinaire :\n" + num(["déclare `Contact annuaire[50]` et `char cherche[30]` ;", "lis `n`, puis les `n` contacts (`%29s %14s`), puis `cherche` ;", "parcours l'annuaire : au premier nom égal à `cherche`, affiche son `tel` et arrête-toi ;", "si personne n'a été trouvé, affiche `inconnu`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Passe en mémoire dynamique :\n" + num(["supprime `Contact annuaire[50]` ;", "après la lecture de `n` : `Contact *annuaire = calloc(n, sizeof(Contact));`, puis le test `NULL` ;", "garde la lecture et la recherche ;", "`free(annuaire);` à la fin."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const mk = (n, present) => { const noms = R.melange(NOMS).slice(0, n + 1), l = noms.slice(0, n).map(x => `${x} ${tel(R)}`); return [n, ...l, present ? noms[R.entre(0, n - 1)] : noms[n]].join("\n"); };
        return {E0: mk(R.entre(3, 5), true), E1: mk(R.entre(1, 3), false), E2: mk(R.entre(2, 6), true)}; },
    },
    "c10-107": {
      set: {
        enonce: BLOC("La fonction `vieillir` doit ajouter un an à la personne. Le programme lit un nom et un âge, appelle `vieillir`, puis affiche l'âge. Avec `[[E0]]`, il devrait afficher `[[A1]]`, mais il affiche `[[A0]]`.",
          "```c\n#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    int age;\n} Personne;\n\nvoid vieillir(Personne p) {\n    p.age++;\n}\n\nint main(void) {\n    Personne moi;\n    scanf(\"%29s %d\", moi.nom, &moi.age);\n    vieillir(moi);\n    printf(\"%d\\n\", moi.age);\n    return 0;\n}\n```",
          "**À corriger** : la fonction `vieillir` et son appel, pour que la personne de `main` soit vraiment modifiée."),
        ...E(0, {consigne: "`vieillir(Personne p)` reçoit la personne **par valeur**. Quand elle fait `p.age++`, que modifie-t-elle : la variable `moi` de `main`, ou une copie ? (un mot)"}),
        ...E(1, {consigne: "Une fois le paramètre devenu un pointeur `Personne *p`, on atteint le champ `age` avec la flèche `->`. Écris l'instruction qui ajoute un an."}),
        ...E(2, {consigne: afaire("le paramètre de `vieillir` devient un pointeur : `void vieillir(Personne *p)` ;", "dans la fonction, `p.age++` devient `p->age++` ;", "dans `main`, l'appel passe l'adresse : `vieillir(&moi);`."), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS), A0 = R.entre(15, 70); return {A0, A1: A0 + 1, E0: `${a} ${A0}`, E1: `${b} ${R.entre(15, 70)}`}; },
    },
    "c10-108": {
      set: {
        enonce: BLOC("Le but : deux fonctions sur une même structure, l'une qui la **modifie**, l'autre qui la **lit** seulement.",
          "**Le type** : `typedef struct { char nom[30]; double prix; int stock; } Produit;`\n\n**Les fonctions** :\n- `int vendre(Produit *p, int quantite)` : si le stock suffit, elle retire `quantite` du stock et renvoie 1 ; sinon elle ne change rien et renvoie 0 ;\n- `void afficher(const Produit *p)` : affiche `nom stock`.",
          lit("le nom du produit (un mot) ;", "son prix ;", "son stock ;", "la quantité à vendre."),
          fait("appelle `vendre(&prod, q)` et affiche `vendu` si elle renvoie 1, `stock insuffisant` sinon ;", "puis appelle `afficher(&prod)`."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : `vendre` modifie le produit, elle reçoit donc son adresse ; `afficher` ne fait que lire, son paramètre est un pointeur `const` (promesse de ne rien modifier).",
        ...E(0, {consigne: "Dans `vendre`, quand le stock suffit, il faut retirer `quantite` du stock du produit pointé par `p`. Écris cette instruction (avec la flèche)."}),
        ...E(1, {consigne: "`afficher` ne fait que lire le produit : on le promet au compilateur avec `const` devant le type pointé. Écris l'en-tête complet de `afficher`."}),
        ...E(2, {consigne: "Premier jalon, **sans** fonction :\n" + num(["déclare le type `Produit`, puis `Produit prod;` et `int q;` dans `main` ;", "lis le nom, le prix, le stock et la quantité (`%29s %lf %d %d`) ;", "si `prod.stock >= q` : retire `q` du stock et affiche `vendu` ; sinon affiche `stock insuffisant` ;", "affiche ensuite `nom stock`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Passe aux fonctions :\n" + num(["écris `int vendre(Produit *p, int quantite)` (renvoie 1 ou 0) et `void afficher(const Produit *p)` avant `main` ;", "dans `main` : `if (vendre(&prod, q)) printf(\"vendu\\n\"); else printf(\"stock insuffisant\\n\");` ;", "puis `afficher(&prod);`."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const nom = () => R.un(["Stylo", "Cahier", "Gomme", "Classeur", "Regle", "Agenda", "Feutre"]), prix = () => `${R.entre(1, 9)}.${R.entre(0, 9)}`;
        const s0 = R.entre(5, 20), s1 = R.entre(1, 4), s2 = R.entre(3, 9);
        return {E0: `${nom()} ${prix()} ${s0} ${R.entre(1, s0)}`, E1: `${nom()} ${prix()} ${s1} ${R.entre(s1 + 1, s1 + 5)}`, E2: `${nom()} ${prix()} ${s2} ${s2}`}; },
    },
    "c10-109": {
      set: {
        enonce: BLOC("Le but : initialiser un tableau de structures dès sa déclaration, et l'afficher avec une fonction.",
          "**Le type** : `typedef struct { char nom[30]; int note; } Etudiant;`\n\n**La classe**, à recopier telle quelle dans `main` :\n```c\n" + CLASSE.replace(/^    /gm, "") + "```",
          fait("écris `void afficher_classe(Etudiant etudiants[], int taille)`, qui affiche une ligne par étudiant au format `numéro. nom - Note : note/20`, numérotée à partir de 1 ;", "dans `main`, appelle `afficher_classe(classe, 3)` ;", "puis affiche la moyenne de la classe avec 2 décimales, sur une dernière ligne."),
          "**Sortie attendue**\n```text\n[[SORTIE]]\n```"),
        guidage: "**Plan** : chaque `{\"nom\", note}` initialise une case du tableau. La fonction boucle sur les étudiants et affiche `i + 1` comme numéro (on compte à partir de 1 pour l'humain, à partir de 0 pour le C).",
        ...E(0, {consigne: "Dans la boucle de `afficher_classe` (indice `i`), écris le `printf` complet qui affiche la ligne de l'étudiant `i`. Le texte exact est `%d. %s - Note : %d/20` suivi de `\\n`, avec dans l'ordre : `i + 1`, `etudiants[i].nom`, `etudiants[i].note`. Pour le premier, on obtient `1. [[N1]] - Note : [[A]]/20`.",
          question: "Ligne d'affichage ?", corrige: "Numéro `i + 1`, puis le nom, puis la note : `printf(\"%d. %s - Note : %d/20\\n\", i + 1, etudiants[i].nom, etudiants[i].note);`"}),
        ...E(1, {consigne: "Quelle est la moyenne de [[A]], [[B]] et [[C]], arrondie à 2 décimales ?", question: "Moyenne attendue ?", "verif.attendu": "[[MOY]]",
          corrige: "([[A]] + [[B]] + [[C]]) / 3 = [[SOM]] / 3 ≈ **[[MOY]]**.", indices: ["Somme [[SOM]], divisée par 3.", "[[MOY]]"]}),
        ...E(2, {consigne: "Premier jalon, **sans** fonction :\n" + num(["déclare le type `Etudiant` avant `main` ;", "dans `main`, recopie l'initialisation de `classe` ;", "affiche la ligne de chaque étudiant avec une boucle, directement dans `main` (format `1. [[N1]] - Note : [[A]]/20`)."]),
          verif: {mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: c109a}, corrige: sol(c109a),
          indices: ["Les accolades intérieures initialisent chaque structure : `{\"[[N1]]\", [[A]]}`.", "`i + 1` pour la numérotation."]}),
        ...E(3, {consigne: "Passe à la fonction :\n" + num(["déplace la boucle d'affichage dans `void afficher_classe(Etudiant etudiants[], int taille)` (dans la fonction, `classe[i]` devient `etudiants[i]`, et `3` devient `taille`) ;", "dans `main`, appelle `afficher_classe(classe, 3);` ;", "ajoute la moyenne des trois notes, avec 2 décimales, sur une dernière ligne."]),
          verif: {mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: c109, exige: [{motif: "void\\s+afficher_classe\\s*\\(", msg: "Écris la fonction afficher_classe."}]}, corrige: sol(c109), depart: c109a,
          indices: ["La boucle d'affichage passe dans la fonction.", "Moyenne : `s / 3.0`, avec `s` la somme des trois notes."]}),
      },
      tirer: R => { const [N1, N2, N3] = R.melange(NOMS), [A, B, C] = Array.from({length: 3}, () => R.entre(6, 20)); return {N1, N2, N3, A, B, C}; },
      deriver: v => ({SOM: v.A + v.B + v.C, MOY: dec((v.A + v.B + v.C) / 3), SORTIE: `1. ${v.N1} - Note : ${v.A}/20\n2. ${v.N2} - Note : ${v.B}/20\n3. ${v.N3} - Note : ${v.C}/20\n${dec((v.A + v.B + v.C) / 3)}`}),
    },
  },
};
