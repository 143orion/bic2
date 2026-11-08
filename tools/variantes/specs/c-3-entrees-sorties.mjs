/* Chapitre 3 : consignes réécrites + variantes (08/11/2026). */
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const dec = (x, n = 2) => (Math.round(x * 10**n) / 10**n).toFixed(n);
const PRENOMS = ["Lea", "Adam", "Ines", "Hugo", "Sami", "Jade", "Noah", "Lina", "Yanis", "Chloe", "Rayan", "Maya"];
const LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default {
  banque: "programmation-c/c-3-entrees-sorties.json",
  n: 8,
  items: {
    "c3-004": {set: {enonce: "Combien de valeurs `printf(\"[[FMT]]\", [[ARGS]])` attend-elle après le texte ?", choix: ["[[K]]", "1", "[[K1]]", "0"],
        explication: "Chaque format (`%d`, `%c`…) est remplacé par une valeur, dans l'ordre : [[K]] formats, donc **[[K]]** valeurs."},
      tirer: R => { const K = R.entre(2, 4), noms = ["a", "b", "c", "d"].slice(0, K), f = R.un([["%d", " et "], ["%d", ", "], ["%d", " - "]]);
        return {K, K1: K + 1, FMT: noms.map(() => f[0]).join(f[1]), ARGS: noms.join(", ")}; }},
    "c3-007": {set: {enonce: "Quel nombre affiche `printf(\"%.2f\", [[X]])` ?", "verif.attendu": "[[R]]", explication: "`%.2f` garde 2 chiffres après la virgule (en arrondissant) : **[[R]]**."},
      tirer: R => { const d = R.entre(0, 9), c = R.entre(0, 9), t = R.un([0, 1, 2, 3, 6, 7, 8, 9]); return {X: `${R.entre(0, 50)}.${d}${c}${t}${R.entre(1, 9)}`}; },
      deriver: v => ({R: dec(+v.X)})},
    "c3-008": {set: {enonce: "Que s'affiche avec `printf(\"%x\", [[N]])` ? (en minuscules)", "verif.attendu": ["[[R]]"], explication: "`%x` affiche en hexadécimal : [[N]] = [[H]] × 16 + [[L]], soit **[[R]]**."},
      tirer: R => ({N: R.entre(17, 255)}), deriver: v => ({H: Math.floor(v.N / 16), L: v.N % 16, R: v.N.toString(16)})},
    "c3-016": {set: {enonce: "Qu'affiche ce code ?\n```c\nprintf(\"%d %d\\n\", [[A]] / [[B]], [[A]] % [[B]]);\n```", "verif.attendu": ["[[Q]] [[R]]"], explication: "[[A]] = [[Q]] × [[B]] + [[R]] : la division entière donne [[Q]] et le reste vaut [[R]]."},
      tirer: R => ({A: R.entre(5, 40), B: R.entre(2, 7)}), deriver: v => ({Q: Math.floor(v.A / v.B), R: v.A % v.B})},
    "c3-017": {set: {enonce: "Qu'affiche `printf(\"[%c%c]\", '[[X]]', '[[Y]]');` ?", "verif.attendu": ["[[[X]][[Y]]]"], explication: "Les deux `%c` sont remplacés, dans l'ordre, par `[[X]]` puis `[[Y]]` ; les crochets sont du texte ordinaire."},
      tirer: R => ({X: R.un([...LETTRES]), Y: R.un([...LETTRES])})},
    "c3-018": {set: {enonce: "Quel nombre affiche `printf(\"%d\", '[[C]]');` ? (code ASCII)", "verif.attendu": "[[R]]", explication: "Un `char` est un petit entier : 'A' vaut 65, 'a' vaut 97, et les lettres se suivent. '[[C]]' vaut donc **[[R]]**."},
      tirer: R => ({C: R.un([..."BCDEFGHKMPRSTXZbcdehkmrtxz"])}), deriver: v => ({R: v.C.charCodeAt(0)})},

    "c3-101": {
      set: {
        enonce: "Écris un programme qui lit un prénom (un seul mot) et affiche `Bonjour` suivi de ce prénom. (TD Premiers pas, exercice 2)\n\n" + ex("[[P0]]", "Bonjour [[P0]]"),
        guidage: "**Plan** : 1. un tableau de `char` pour ranger le prénom → 2. le lire avec `scanf` → 3. l'afficher avec `%s`.\n\n**Piège** : pas de `&` devant un tableau, et on limite le nombre de caractères lus.",
        ...E(0, {consigne: "Un prénom est une suite de caractères : on le range dans un **tableau** de `char`. Déclare un tableau `prenom` de 20 caractères."}),
        ...E(1, {consigne: "Lis le prénom avec `scanf`. Deux détails : le format d'un mot est `%s`, avec un nombre devant pour ne jamais lire plus de 19 caractères (la 20e case est réservée à la fin de chaîne) ; et **pas de `&`** devant un tableau."}),
        ...E(2, {consigne: "Affiche `Bonjour`, une espace, le prénom (format `%s`), puis un retour à la ligne."}),
        ...E(3, {consigne: "Assemble le tout : déclaration, lecture, affichage, dans `main`.", "verif.tests": tests("[[P0]]", "[[P1]]"),
          indices: ["Trois lignes dans `main` : `char prenom[20];`, `scanf(\"%19s\", prenom);`, puis le `printf`.", "`printf(\"Bonjour %s\\n\", prenom);`"]}),
      },
      tirer: R => { const [P0, P1] = R.melange(PRENOMS); return {P0, P1}; },
    },
    "c3-102": {
      set: {
        enonce: "Écris un programme qui lit deux entiers `a` et `b`, puis affiche sur une ligne : leur somme, leur différence, leur produit, puis leur **quotient réel** avec 2 décimales. (TD Premiers pas, exercice 3)\n\n" + ex("[[A]] [[B]]", "[[S3_0]]"),
        guidage: "**Plan** : une lecture avec deux `%d`, puis un seul `printf` pour les quatre résultats.\n\n**Piège** : `a / b` entre deux `int` est une division entière ; pour obtenir [[QR]], il faut convertir un opérande en réel.",
        ...E(0, {consigne: "Lis les deux entiers `a` et `b` avec **un seul** `scanf` : un `%d` par variable, et un `&` devant chaque nom de variable."}),
        ...E(1, {consigne: "Avec `a = [[A]]` et `b = [[B]]`, quel nombre affiche `printf(\"%d\", a / b)` ? Rappel : deux `int` donnent une division entière.", "verif.attendu": "[[Q]]",
          corrige: "Division entière : [[A]] / [[B]] = **[[Q]]** (le reste [[RE]] est perdu).", indices: ["Combien de fois [[B]] rentre-t-il dans [[A]] ?"]}),
        ...E(2, {consigne: "Et `printf(\"%.2f\", (double)a / b)` ? Le `(double)` convertit `a` **avant** la division, qui devient réelle.", "verif.attendu": "[[QR]]",
          corrige: "(double)[[A]] / [[B]] = [[QR]].", indices: ["Le cast agit sur `a` avant la division.", "[[A]] / [[B]] ≈ [[QR]]."]}),
        ...E(3, {consigne: "Écris le programme : lis `a` et `b`, puis affiche sur une ligne `somme différence produit quotient`, le quotient réel avec 2 décimales.", "verif.tests": tests("[[A]] [[B]]", "[[E1]]", "7 2"),
          indices: ["Format : `\"%d %d %d %.2f\\n\"`.", "Le quatrième argument est `(double)a / b`."]}),
      },
      tirer: R => { const B = R.un([2, 4, 5, 8]); let A; do A = R.entre(B + 3, 50); while(A % B === 0); return {A, B, E1: `${R.entre(10, 99)} ${R.un([3, 4, 6, 7])}`}; },
      deriver: v => ({Q: Math.floor(v.A / v.B), RE: v.A % v.B, QR: dec(v.A / v.B)}),
    },
    "c3-103": {
      set: {
        enonce: "Écris un programme qui lit un prix unitaire (réel) puis une quantité (entier), et affiche sur une ligne le **total HT**, la **TVA à 20 %** et le **total TTC**, chacun avec 2 décimales.\n\n" + ex("[[P]] [[Q]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. lire le prix (`%lf`) et la quantité (`%d`) → 2. HT = prix × quantité → 3. TVA = HT × 0,2 → 4. TTC = HT + TVA → 5. afficher avec `%.2f`.",
        ...E(0, {consigne: "Pour un prix de [[P]] € et une quantité de [[Q]], quel est le total HT (prix × quantité) ?", "verif.attendu": "[[HT]]", corrige: "[[P]] × [[Q]] = [[HT]].", indices: ["Prix × quantité.", "[[HT]]"]}),
        ...E(1, {consigne: "La TVA à 20 % représente 20 % du HT, soit HT × 0,2. Pour un total HT de [[HT]], combien vaut la TVA ?", "verif.attendu": "[[TVA]]", corrige: "[[HT]] × 0,2 = [[TVA]].", indices: ["20 % = 0,2.", "[[TVA]]"]}),
        ...E(2, {consigne: "Premier jalon : lis le prix (réel) et la quantité (entier) avec un seul `scanf`, et affiche **seulement le total HT**, avec 2 décimales.", "verif.tests": tests("[[P]] [[Q]]", "[[E1]]", "100 1")}),
        ...E(3, {consigne: "Ajoute la **TVA** (HT × 0,2) et le **TTC** (HT + TVA) : affiche `HT TVA TTC` sur une ligne, chacun avec 2 décimales.", "verif.tests": tests("[[P]] [[Q]]", "[[E1]]", "100 1")}),
      },
      tirer: R => ({P: R.un(["2.5", "4", "12.5", "7.5", "1.25", "15", "3.5", "20"]), Q: R.entre(2, 9), E1: `${R.entre(1, 49)}.${R.entre(10, 99)} ${R.entre(1, 6)}`}),
      deriver: v => ({HT: dec(+v.P * v.Q), TVA: dec(+v.P * v.Q * 0.2)}),
    },
    "c3-104": {
      set: {
        enonce: "Ce programme doit lire un âge (entier) et une taille en mètres (réel), puis les afficher. Il contient **deux** erreurs dans les `scanf`.\n```c\n#include <stdio.h>\n\nint main(void) {\n    int age;\n    double taille;\n    scanf(\"%d\", age);\n    scanf(\"%f\", &taille);\n    printf(\"%d %.2f\\n\", age, taille);\n    return 0;\n}\n```\n" + ex("[[A]] [[T]]", "[[S2_0]]"),
        ...E(0, {consigne: "`scanf` doit **écrire** dans la variable : on ne lui donne donc pas sa valeur, mais l'endroit où elle se trouve. Dans `scanf(\"%d\", age);`, que manque-t-il devant `age` ?"}),
        ...E(1, {consigne: "Dans `scanf`, `%f` lit un `float`. Quel format faut-il pour lire un `double` ?"}),
        ...E(2, {consigne: "Corrige les **deux** `scanf` : le programme doit afficher l'âge puis la taille avec 2 décimales.", "verif.tests": tests("[[A]] [[T]]", "[[E1]]")}),
      },
      tirer: R => ({A: R.entre(17, 30), T: `1.${R.entre(50, 95)}`, E1: `${R.entre(31, 80)} 1.${R.entre(55, 99)}`}),
    },
    "c3-105": {
      set: {
        enonce: "Écris un programme qui lit **un caractère** et affiche ce caractère, une espace, puis son code ASCII.\n\n" + ex("[[C]]", "[[C]] [[CODE]]"),
        ...E(0, {consigne: "Les codes ASCII des lettres se suivent : `'A'` vaut 65, `'B'` vaut 66… et `'a'` vaut 97. Quel est le code de `[[C]]` ?", question: "Code ASCII de `[[C]]` ?", "verif.attendu": "[[CODE]]",
          corrige: "`'[[C]]'` vaut **[[CODE]]**.", indices: ["[[BASE]], puis compte les lettres.", "[[CODE]]"]}),
        ...E(1, {consigne: "Un `char` est en fait un petit entier. Quel format `printf` l'affiche sous forme de **nombre** (son code) plutôt que de lettre ?"}),
        ...E(2, {consigne: "Premier jalon : lis **un caractère** (`scanf(\" %c\", &c);`, l'espace avant `%c` ignore les blancs) et affiche-le seul.", "verif.tests": tests("[[C]]", "[[D]]", "0")}),
        ...E(3, {consigne: "Affiche le caractère **puis son code**, séparés par une espace : la même variable, une fois avec `%c`, une fois avec `%d`.", "verif.tests": tests("[[C]]", "[[D]]", "0")}),
      },
      tirer: R => ({C: R.un([..."BDGKMQTWbdgkmqtw"]), D: R.un([..."AEHLNRUZaehlnruz"])}),
      deriver: v => ({CODE: v.C.charCodeAt(0), BASE: v.C < "a" ? "`'A'` = 65" : "`'a'` = 97"}),
    },
    "c3-106": {
      set: {
        enonce: "Écris un programme qui lit un prénom (un mot) puis un âge, et affiche exactement :\n```text\nPrenom : <prénom>\nAge : <âge> ans\n```\n" + ex("[[P0]] [[A0]]", "Prenom : [[P0]]\nAge : [[A0]] ans"),
        ...E(0, {consigne: "Pour lire un mot dans `char prenom[20]` sans risquer de déborder, on indique dans le format le nombre maximum de caractères (une case est réservée à la fin de chaîne). Quel format ?"}),
        ...E(1, {consigne: "Premier jalon : lis le prénom puis l'âge avec un seul `scanf` (`prenom` sans `&`, `age` avec), et affiche **seulement** la ligne `Prenom : <prénom>`.", "verif.tests": tests("[[P0]] [[A0]]", "[[P1]] [[A1]]")}),
        ...E(2, {consigne: "Ajoute la deuxième ligne : `Age : <âge> ans`.", "verif.tests": tests("[[P0]] [[A0]]", "[[P1]] [[A1]]")}),
      },
      tirer: R => { const [P0, P1] = R.melange(PRENOMS); return {P0, P1, A0: R.entre(17, 25), A1: R.entre(26, 60)}; },
    },
    "c3-107": {
      set: {
        enonce: "Écris un programme qui lit trois nombres réels et affiche leur somme avec **une** décimale.\n\n" + ex("[[X]] [[Y]] [[Z]]", "[[SOM]]"),
        ...E(0, {consigne: "Écris le **format** (avec ses guillemets) d'un `scanf` qui lit trois `double` séparés par des espaces."}),
        ...E(1, {consigne: "Quel format `printf` affiche un réel avec **une seule** décimale ?"}),
        ...E(2, {consigne: "Premier jalon : lis les trois réels et affiche leur somme avec le format par défaut `%f` (qui donne 6 décimales).", "verif.tests": tests("[[X]] [[Y]] [[Z]]", "0.1 0.2 0.3", "[[E1]]")}),
        ...E(3, {consigne: "Il ne reste qu'à changer le format : affiche la somme avec **une** décimale.", "verif.tests": tests("[[X]] [[Y]] [[Z]]", "0.1 0.2 0.3", "[[E1]]")}),
      },
      tirer: R => ({X: `${R.entre(0, 9)}.${R.entre(1, 9)}`, Y: `${R.entre(0, 9)}.${R.entre(1, 9)}`, Z: String(R.entre(1, 9)), E1: `-${R.entre(1, 5)} -${R.entre(1, 5)}.5 ${R.entre(6, 20)}`}),
      deriver: v => ({SOM: dec(+v.X + +v.Y + +v.Z, 1)}),
    },
  },
};
