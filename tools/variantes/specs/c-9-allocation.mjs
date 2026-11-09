/* Chapitre 9 : consignes réécrites + variantes (08/11/2026). Les exos 9-109 à 9-111 sont dans c-nouveaux-exos.mjs. */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const L = a => a.join(" ");
const liste = (R, n, a, b) => Array.from({length: n}, () => R.entre(a, b));
const saisie = (n, t, ...plus) => [n, L(t), ...plus].join("\n");
const MOTS = ["Bonjour", "allocation", "memoire", "pointeur", "ESILV", "malloc", "tableau", "dynamique", "octet", "programme"];
const c107a = "#include <stdio.h>\n\nint main(void) {\n    int t[20], n;\n    scanf(\"%d\", &n);\n    for (int i = 0; i < n; i++) {\n        t[i] = [[K]] * (i + 1);\n        printf(\"%d \", t[i]);\n    }\n    printf(\"\\n\");\n    return 0;\n}";
const c107 = "#include <stdio.h>\n#include <stdlib.h>\n\nint *creer_tableau(int n) {\n    return calloc(n, sizeof(int));\n}\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = creer_tableau(n);\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) {\n        t[i] = [[K]] * (i + 1);\n        printf(\"%d \", t[i]);\n    }\n    printf(\"\\n\");\n    free(t);\n    return 0;\n}";

/* rédaction : ce que le programme lit, ce qu'il fait, ce qu'il affiche (reformulation du 09/11/2026) */
const num = xs => xs.map((x, i) => `${i + 1}. ${x}`).join("\n");
const lit = (...xs) => "**Au clavier**, le programme reçoit dans l'ordre :\n" + num(xs);
const fait = (...xs) => "**Ce qu'il fait** :\n" + num(xs);
const affiche = s => "**Ce qu'il affiche** : " + s;
const afaire = (...xs) => "**À faire** :\n" + num(xs);
const BLOC = (...ps) => ps.filter(Boolean).join("\n\n");

export default {
  banque: "programmation-c/c-9-allocation.json",
  n: 8,
  items: {
    "c9-006": {set: {enonce: "Combien d'octets réserve `malloc([[N]] * sizeof([[TY]]))` ? (un `[[TY]]` = [[O]] octets)", "verif.attendu": "[[R]]", explication: "`malloc` compte en octets : [[N]] éléments × [[O]] octets = **[[R]]** octets."},
      tirer: R => { const [TY, O] = R.un([["double", 8], ["int", 4], ["char", 1]]); return {TY, O, N: R.entre(3, 25)}; }, deriver: v => ({R: v.N * v.O})},
    "c9-013": {set: {enonce: "Combien d'appels à `free` faut-il pour ce code ? (un nombre)\n```c\n[[CODE]]\n```", "verif.attendu": ["[[R]]"], explication: "Il faut un `free` par bloc obtenu avec `malloc` ou `calloc` (un tableau déclaré normalement, lui, se libère tout seul) : **[[R]]**."},
      tirer: R => { const lignes = R.melange(["int *a = malloc(10 * sizeof(int));", "int *b = calloc(5, sizeof(int));", "char *c = malloc(20);", "double *d = calloc(8, sizeof(double));", "int t[50];", "char nom[30];"]).slice(0, R.entre(3, 5));
        if(!lignes.some(l => /alloc/.test(l))) lignes[0] = "int *a = malloc(10 * sizeof(int));"; return {CODE: lignes.join("\n"), R: lignes.filter(l => /alloc/.test(l)).length}; }},
    "c9-014": {set: {enonce: "Pour copier le mot `\"[[W]]\"` dans un bloc dynamique, combien d'octets faut-il réserver ?", "verif.attendu": "[[R]]", explication: "`strlen` vaut [[N]], plus 1 pour le `'\\0'` final : **[[R]]** octets."},
      tirer: R => ({W: R.un(MOTS)}), deriver: v => ({N: v.W.length, R: v.W.length + 1})},

    "c9-101": {
      set: {
        enonce: BLOC("Le but : réserver **exactement** la place nécessaire avec `malloc`, quand on ne connaît la taille qu'au moment de l'exécution.",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs."),
          fait("réserve avec `malloc` un bloc de `n` entiers (et vérifie que ça a marché) ;", "range les `n` valeurs dedans ;", "les affiche **à l'envers** (de la dernière à la première), sur une ligne ;", "libère le bloc avec `free`."),
          ex("[[E0]]", "[[S4_0]]")),
        guidage: "**Plan** : 1. lire `n` → 2. `malloc(n * sizeof(int))` → 3. si le résultat vaut `NULL`, quitter → 4. remplir, afficher à l'envers → 5. `free`.",
        ...E(0, {consigne: "`malloc` attend une taille en **octets** : pour `n` entiers, c'est `n` fois la taille d'un `int` (`sizeof(int)`). Écris la ligne qui déclare `int *t` et lui donne un bloc de `n` entiers."}),
        ...E(1, {consigne: "Si la mémoire manque, `malloc` renvoie l'adresse spéciale `NULL`. Écris la condition (sans `if`) qui détecte cet échec pour `t`."}),
        ...E(2, {consigne: "Tout bloc obtenu avec `malloc` doit être rendu une fois qu'on n'en a plus besoin. Écris l'instruction qui libère `t`."}),
        ...E(3, {consigne: "Premier jalon, **sans** mémoire dynamique :\n" + num(["déclare un tableau ordinaire `int t[20]` (on suppose `n` ≤ 20) ;", "lis `n`, puis les `n` valeurs dans `t` ;", "affiche-les à l'envers : boucle de `i = n - 1` jusqu'à `i = 0`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Passe en mémoire dynamique :\n" + num(["supprime `int t[20]` ;", "**après** avoir lu `n`, écris `int *t = malloc(n * sizeof(int));` ;", "si `t == NULL`, quitte avec `return 1;` ;", "garde la saisie et l'affichage tels quels (`t[i]` marche pareil) ;", "juste avant `return 0;`, libère avec `free(t);`."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 7), n2 = R.entre(5, 9); return {E0: saisie(n0, liste(R, n0, 1, 50)), E1: saisie(1, [R.entre(1, 99)]), E2: saisie(n2, liste(R, n2, -9, 9))}; },
    },
    "c9-102": {
      set: {
        enonce: BLOC("Le but : voir ce que fait `calloc` de plus que `malloc` : il met toutes les cases à 0.",
          lit("un entier `n`."),
          fait("réserve avec `calloc` un tableau de `n` entiers ;", "affiche ses `n` cases sur une ligne (ce sont des 0) ;", "range `i * i` dans chaque case `i` ;", "affiche de nouveau les `n` cases, sur une deuxième ligne ;", "libère le tableau."),
          ex("[[N]]", "[[S3_0]]")),
        ...E(0, {consigne: "`calloc` prend **deux** arguments : le nombre d'éléments, puis la taille d'un élément. Écris la ligne qui déclare `int *t` et lui donne un bloc de `n` entiers avec `calloc`."}),
        ...E(1, {consigne: "Que contient `t[0]` juste après l'appel à `calloc` ? (un nombre) C'est justement ce qui distingue `calloc` de `malloc`."}),
        ...E(2, {consigne: "Premier jalon, **sans** mémoire dynamique :\n" + num(["lis `n` (20 au plus) et déclare `int t[20] = {0};` (toutes les cases à 0) ;", "affiche les `n` premières cases sur une ligne ;", "range `i * i` dans chaque case `i` ;", "affiche-les de nouveau, sur une deuxième ligne."]), "verif.tests": tests("[[N]]", "1")}),
        ...E(3, {consigne: "Passe en mémoire dynamique :\n" + num(["remplace `int t[20] = {0};` par `int *t = calloc(n, sizeof(int));`, écrit **après** la lecture de `n` (plus besoin du `= {0}` : `calloc` met déjà tout à 0) ;", "si `t == NULL`, quitte avec `return 1;` ;", "garde les deux affichages ;", "libère avec `free(t);` à la fin."]), "verif.tests": tests("[[N]]", "1", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(3, 8), N2: R.entre(9, 12)}),
    },
    "c9-103": {
      set: {
        enonce: BLOC("Le but : **agrandir** un bloc déjà rempli avec `realloc`, sans perdre ce qu'il contient.",
          lit("le nombre de valeurs `n` ;", "les `n` premières valeurs ;", "le nombre de valeurs supplémentaires `m` ;", "les `m` valeurs supplémentaires."),
          fait("réserve un bloc de `n` entiers avec `malloc` et y range les `n` premières valeurs ;", "après avoir lu `m`, agrandit le bloc à `n + m` entiers avec `realloc`, en passant par un pointeur temporaire `tmp` ;", "range les `m` nouvelles valeurs à la suite (cases `n` à `n + m - 1`) ;", "affiche la somme des `n + m` valeurs, puis libère le bloc."),
          ex("[[E0]]", "[[S4_0]]")),
        guidage: "**Plan** : 1. `malloc` de `n` entiers, saisie → 2. lire `m` → 3. `int *tmp = realloc(t, (n + m) * sizeof(int));` → 4. si `tmp == NULL` : `free(t)` et quitter ; sinon `t = tmp;` → 5. lire les `m` valeurs à partir de la case `n` → 6. somme, `free`.",
        ...E(0, {consigne: "`realloc(ancien_bloc, nouvelle_taille_en_octets)` renvoie l'adresse du bloc agrandi. Écris la ligne qui déclare `int *tmp` et lui donne le bloc `t` agrandi à `n + m` entiers. Attention aux parenthèses : c'est `(n + m)` qui est multiplié par `sizeof(int)`."}),
        ...E(1, {consigne: "Pourquoi ranger le résultat dans `tmp` plutôt que d'écrire directement `t = realloc(t, …)` ? Pense à ce qui se passe si `realloc` échoue et renvoie `NULL`. (quelques mots)"}),
        ...E(2, {consigne: "Les `n` premières cases sont déjà remplies. Écris l'en-tête du `for` (variable `i`) qui parcourt les `m` cases **suivantes**, c'est-à-dire de `n` jusqu'à `n + m - 1`."}),
        ...E(3, {consigne: "Premier jalon, **sans** mémoire dynamique :\n" + num(["déclare un tableau ordinaire `int t[100]` ;", "lis `n`, puis les `n` valeurs dans les cases 0 à `n - 1` ;", "lis `m`, puis les `m` valeurs dans les cases `n` à `n + m - 1` ;", "affiche la somme des `n + m` valeurs."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Passe en mémoire dynamique :\n" + num(["après la lecture de `n` : `int *t = malloc(n * sizeof(int));` (avec le test `NULL`) ;", "après la lecture de `m` : `int *tmp = realloc(t, (n + m) * sizeof(int));` ;", "si `tmp == NULL` : `free(t); return 1;` ; sinon `t = tmp;` ;", "la suite (lecture des `m` valeurs, somme) ne change pas ;", "`free(t);` à la fin."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const mk = () => { const n = R.entre(1, 4), m = R.entre(1, 4); return saisie(n, liste(R, n, -10, 30), m, L(liste(R, m, -10, 30))); }; return {E0: mk(), E1: mk(), E2: mk()}; },
    },
    "c9-104": {
      set: {
        enonce: BLOC("Ce programme lit un entier `n`, réserve un bloc de `n` entiers, range `2 × i` dans chaque case `i`, puis affiche la dernière case. Il donne le bon résultat… mais il a une **fuite de mémoire** : le bloc n'est jamais rendu.",
          "```c\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n * sizeof(int));\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = 2 * i;\n    printf(\"%d\\n\", t[n - 1]);\n    return 0;\n}\n```",
          "**À corriger** : libérer le bloc à la fin, puis remettre `t` à `NULL`. L'affichage ne doit pas changer.",
          ex("[[N]]", "[[S2_0]]")),
        ...E(0, {consigne: "Chaque bloc obtenu avec `malloc` doit être rendu exactement une fois. Combien d'appels à `free` faut-il pour ce programme, qui fait un seul `malloc` ?"}),
        ...E(1, {consigne: "Après `free(t)`, `t` contient toujours l'adresse du bloc rendu ; s'en resservir par erreur serait dangereux. Écris l'instruction qui donne à `t` une valeur sûre, facile à tester."}),
        ...E(2, {consigne: afaire("garde tout le programme ;", "juste avant `return 0;`, ajoute `free(t);` ;", "puis ajoute `t = NULL;`."), "verif.tests": tests("[[N]]", "1", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(2, 15), N2: R.entre(16, 40)}),
    },
    "c9-105": {
      set: {
        enonce: BLOC("Ce programme lit un entier `n`, réserve un tableau, y range `1, 2, …, n`, puis affiche leur somme. Problème : il réserve `n` **octets** au lieu de la place de `n` **entiers**.",
          "```c\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n);\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = i + 1;\n    int s = 0;\n    for (int i = 0; i < n; i++) s += t[i];\n    printf(\"%d\\n\", s);\n    free(t);\n    return 0;\n}\n```",
          "**À corriger** : la ligne du `malloc`, pour réserver la place de `n` entiers.",
          ex("[[N]]", "[[S2_0]]")),
        ...E(0, {consigne: "`malloc(n)` réserve `n`… quoi ? En quelle unité `malloc` compte-t-il la taille demandée ? (un mot)"}),
        ...E(1, {consigne: "Un `int` occupe 4 octets. Combien d'octets faut-il pour ranger [[K]] `int` ?", question: "Octets pour [[K]] `int` ?", "verif.attendu": "[[K4]]",
          corrige: "[[K]] × 4 = **[[K4]]** octets. `malloc([[K]])` n'en réserverait que [[K]] : de quoi ranger à peine [[KQ]] entier(s).", indices: ["Nombre d'éléments × taille d'un élément.", "[[K4]]"]}),
        ...E(2, {consigne: "Remplace `malloc(n)` par `malloc(n * sizeof(int))` : le nombre d'éléments multiplié par la taille d'un élément. Rien d'autre ne change.", "verif.tests": tests("[[N]]", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(3, 12), N2: R.entre(13, 30), K: R.entre(5, 25)}), deriver: v => ({K4: 4*v.K, KQ: Math.floor(v.K / 4)}),
    },
    "c9-106": {
      set: {
        enonce: BLOC("Le but : copier un mot dans un bloc **juste assez grand**, ni trop petit ni trop grand.",
          lit("un mot (sans espace), lu dans un tableau `char tampon[100]`."),
          fait("réserve avec `malloc` un bloc de `strlen(tampon) + 1` caractères (le `+ 1` est pour le `'\\0'`) ;", "y copie le mot avec `strcpy` ;", "affiche la copie, une espace, puis sa longueur ;", "libère le bloc."),
          ex("[[W0]]", "[[W0]] [[N0]]")),
        ...E(0, {consigne: "`strlen` donne le nombre de lettres **sans** compter le `'\\0'` final, qui a pourtant besoin d'une case. Écris la ligne qui déclare `char *copie` et lui donne un bloc juste assez grand pour le mot de `tampon`."}),
        ...E(1, {consigne: "`strcpy` copie une chaîne dans une autre. L'ordre des arguments : la **destination** d'abord, la source ensuite. Écris la copie de `tampon` dans `copie`."}),
        ...E(2, {consigne: "Premier jalon, sans copie :\n" + num(["lis un mot dans `char tampon[100]` avec `scanf(\"%99s\", tampon)` ;", "affiche-le, une espace, puis sa longueur : `(int)strlen(tampon)`."]), "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Ajoute la copie :\n" + num(["`char *copie = malloc(strlen(tampon) + 1);` puis le test `NULL` ;", "`strcpy(copie, tampon);` ;", "affiche maintenant **`copie`** et sa longueur (au lieu de `tampon`) ;", "`free(copie);` à la fin."]), "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
    "c9-107": {
      set: {
        enonce: BLOC("Le but : une fonction qui **crée** un tableau dynamique et le renvoie à `main`.",
          "**La fonction** `int *creer_tableau(int n)` réserve avec `calloc` un tableau de `n` entiers et renvoie son adresse (ou `NULL` si ça échoue).",
          lit("un entier `n`."),
          fait("obtient le tableau avec `creer_tableau(n)` (et vérifie qu'il n'est pas `NULL`) ;", "range `[[K]] * (i + 1)` dans chaque case `i` ;", "affiche le tableau sur une ligne ;", "libère le tableau."),
          ex("[[N]]", "[[S3_0]]")),
        guidage: "**Qui libère ?** Le bloc doit survivre à la fin de `creer_tableau`, puisque `main` s'en sert ensuite. C'est donc `main`, qui le reçoit, qui fait le `free`.",
        ...E(0, {consigne: "La fonction peut tenir en une seule ligne : elle renvoie directement le bloc que fournit `calloc` pour `n` entiers. Écris cette ligne."}),
        ...E(1, {consigne: "Le bloc doit rester utilisable après la fin de `creer_tableau`. Qui doit donc appeler `free` : `creer_tableau` ou `main` ? (un mot)"}),
        ...E(2, {consigne: "Premier jalon, sans fonction ni mémoire dynamique :\n" + num(["déclare `int t[20], n;` et lis `n` (20 au plus) ;", "dans une boucle, range `[[K]] * (i + 1)` dans `t[i]` et affiche-le ;", "termine par un retour à la ligne."]),
          verif: {mode: "c", tests: tests("[[N]]", "1"), exemple: c107a}, corrige: sol(c107a), indices: ["Une seule boucle suffit : remplir et afficher.", "`t[i] = [[K]] * (i + 1);`"]}),
        ...E(3, {consigne: "Passe à la fonction :\n" + num(["écris `int *creer_tableau(int n)` avant `main` (une ligne : `return calloc(n, sizeof(int));`) ;", "dans `main`, remplace `int t[20]` par `int *t = creer_tableau(n);` (après la lecture de `n`), puis le test `NULL` ;", "garde la boucle ;", "ajoute `free(t);` à la fin de `main`."]),
          verif: {mode: "c", tests: tests("[[N]]", "1", "[[N2]]"), nombres: true, exemple: c107, exige: [{motif: "int\\s*\\*\\s*creer_tableau\\s*\\(", msg: "Écris int *creer_tableau(int n)."}, {motif: "\\bfree\\s*\\(", msg: "Libère la mémoire avec free."}]}, corrige: sol(c107), depart: c107a,
          indices: ["La fonction tient en une ligne : `return calloc(n, sizeof(int));`.", "`int *t = creer_tableau(n); if (t == NULL) return 1;` puis `free(t);` à la fin de `main`."]}),
      },
      tirer: R => ({K: R.un([2, 3, 5, 7, 10, 25]), N: R.entre(3, 7), N2: R.entre(8, 12)}),
    },
    "c9-108": {
      set: {
        enonce: BLOC("Le but : utiliser un tableau dynamique quand on ne connaît pas la taille de la classe à l'avance.",
          lit("le nombre d'élèves `n` ;", "les `n` notes (des entiers)."),
          fait("range les notes dans un bloc de `n` entiers réservé avec `malloc` ;", "calcule la moyenne (avec ses décimales) ;", "compte les notes **strictement** au-dessus de la moyenne ;", "affiche la moyenne (2 décimales), une espace, puis ce nombre ;", "libère le bloc."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Pourquoi garder les notes ?** La moyenne n'est connue qu'une fois toutes les notes lues. Pour savoir lesquelles sont au-dessus, il faut donc les relire ensuite : d'où le tableau.",
        ...E(0, {consigne: "On pourrait se contenter de cumuler la somme au fil de la saisie… Pourquoi faut-il quand même **garder** toutes les notes dans un tableau ? (quelques mots)"}),
        ...E(1, {consigne: "La somme `s` et `n` sont des `int` : `s / n` serait une division entière. Écris la déclaration de `double moy` qui calcule la moyenne **avec ses décimales**."}),
        ...E(2, {consigne: "Premier jalon, avec un tableau ordinaire :\n" + num(["déclare `int notes[100]` ;", "lis `n`, puis les `n` notes en cumulant leur somme `s` ;", "calcule `moy` ;", "reparcours le tableau pour compter les notes strictement supérieures à `moy` ;", "affiche `moy` (2 décimales) et ce compte."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Passe en mémoire dynamique :\n" + num(["remplace `int notes[100]` par `int *notes = malloc(n * sizeof(int));`, écrit après la lecture de `n` ;", "ajoute le test `NULL` ;", "garde tout le reste ;", "`free(notes);` à la fin."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 8), n2 = R.entre(3, 6); return {E0: saisie(n0, liste(R, n0, 4, 20)), E1: saisie(3, [5, 5, R.entre(15, 20)]), E2: saisie(n2, liste(R, n2, 0, 20))}; },
    },
  },
};
