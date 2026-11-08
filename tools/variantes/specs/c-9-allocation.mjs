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
        enonce: "Écris un programme qui lit `N`, **alloue dynamiquement** un tableau de `N` entiers, le remplit avec les `N` valeurs tapées ensuite, l'affiche **à l'envers**, puis libère la mémoire.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        guidage: "**Plan** : 1. lire `n` → 2. demander la place de `n` entiers avec `malloc` → 3. vérifier que `malloc` n'a pas échoué → 4. remplir, puis afficher à l'envers → 5. rendre la mémoire avec `free`.",
        ...E(0, {consigne: "`malloc` attend une taille en **octets** : pour `n` entiers, c'est `n` fois la taille d'un `int`. Écris la ligne qui déclare `int *t` et lui donne un bloc de `n` entiers."}),
        ...E(1, {consigne: "Si la mémoire manque, `malloc` renvoie une adresse spéciale qui veut dire « échec ». Écris la condition (sans `if`) qui détecte cet échec."}),
        ...E(2, {consigne: "Tout bloc obtenu avec `malloc` doit être rendu à la fin. Écris l'instruction qui libère `t`."}),
        ...E(3, {consigne: "Premier jalon, sans mémoire dynamique : lis `n` (au plus 20) puis les `n` entiers dans un tableau **ordinaire** `int t[20]`, et affiche-les à l'envers (de la case `n - 1` à la case 0).", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Remplace le tableau `int t[20]` par un bloc de **exactement** `n` entiers obtenu avec `malloc` (après avoir lu `n`), vérifie qu'il n'est pas `NULL`, et libère-le avec `free` juste avant `return 0;`. Le reste ne change pas : `t[i]` marche pareil.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 7), n2 = R.entre(5, 9); return {E0: saisie(n0, liste(R, n0, 1, 50)), E1: saisie(1, [R.entre(1, 99)]), E2: saisie(n2, liste(R, n2, -9, 9))}; },
    },
    "c9-102": {
      set: {
        enonce: "Écris un programme qui lit `N`, alloue avec **`calloc`** un tableau de `N` entiers (tous à 0), l'affiche, puis range `i * i` dans chaque case `i` et l'affiche de nouveau. Libère la mémoire à la fin.\n\n" + ex("[[N]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `calloc` donne `n` cases **déjà mises à 0** → 2. afficher (que des 0) → 3. remplir avec `i * i` → 4. afficher → 5. `free`.",
        ...E(0, {consigne: "`calloc` prend **deux** arguments : le nombre d'éléments, puis la taille d'un élément. Écris la ligne qui déclare `int *t` et lui donne un bloc de `n` entiers avec `calloc`."}),
        ...E(1, {consigne: "Que contient `t[0]` juste après `calloc` ? C'est justement ce qui distingue `calloc` de `malloc`. (un nombre)"}),
        ...E(2, {consigne: "Premier jalon, sans mémoire dynamique : lis `n` (au plus 20), déclare `int t[20] = {0};`, affiche les `n` premières cases (des 0), puis range `i * i` dans chaque case et affiche-les sur une deuxième ligne.", "verif.tests": tests("[[N]]", "1")}),
        ...E(3, {consigne: "Remplace `int t[20] = {0}` par un bloc de `n` entiers obtenu avec `calloc` (plus besoin de mettre à 0 : `calloc` le fait). Vérifie `NULL`, et libère le bloc à la fin.", "verif.tests": tests("[[N]]", "1", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(3, 8), N2: R.entre(9, 12)}),
    },
    "c9-103": {
      set: {
        enonce: "Écris un programme qui lit `N` puis `N` entiers dans un bloc alloué avec `malloc`, puis lit `M` et `M` entiers supplémentaires. Pour les ranger aussi, il **agrandit le bloc avec `realloc`** (via un pointeur temporaire). Il affiche ensuite la somme des `N + M` valeurs, puis libère la mémoire.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        guidage: "**Plan** : 1. `malloc` de `n` entiers, saisie → 2. lire `m` → 3. agrandir le bloc à `n + m` entiers avec `realloc`, en passant par `tmp` → 4. si `tmp == NULL` : `free(t)` et quitter ; sinon `t = tmp;` → 5. lire les `m` nouvelles valeurs **à partir de la case `n`** → 6. somme, `free`.",
        ...E(0, {consigne: "`realloc(ancien_bloc, nouvelle_taille_en_octets)` renvoie l'adresse du bloc agrandi. Écris la ligne qui déclare `int *tmp` et lui donne le bloc `t` agrandi à `n + m` entiers."}),
        ...E(1, {consigne: "Pourquoi ranger le résultat dans `tmp` plutôt que d'écrire directement `t = realloc(t, …)` ? Pense à ce qui arrive si `realloc` échoue et renvoie `NULL`. (quelques mots)"}),
        ...E(2, {consigne: "Les `n` premières cases sont déjà remplies. Écris l'en-tête du `for` (variable `i`) qui lit les `m` **nouvelles** valeurs, dans les cases qui suivent : de `n` jusqu'à `n + m - 1`."}),
        ...E(3, {consigne: "Premier jalon, sans mémoire dynamique : avec un tableau ordinaire `int t[100]`, lis `n`, les `n` entiers, `m`, les `m` entiers (à partir de la case `n`), puis affiche la somme des `n + m` valeurs.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Passe en mémoire dynamique : `malloc` de `n` entiers au début ; après avoir lu `m`, `realloc` vers `tmp` pour passer à `n + m` entiers (avec le test `NULL`), puis `t = tmp;`. N'oublie pas `free(t)` à la fin.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const mk = () => { const n = R.entre(1, 4), m = R.entre(1, 4); return saisie(n, liste(R, n, -10, 30), m, L(liste(R, m, -10, 30))); }; return {E0: mk(), E1: mk(), E2: mk()}; },
    },
    "c9-104": {
      set: {
        enonce: "Ce programme fonctionne… mais il a une **fuite de mémoire** : un bloc est alloué et jamais rendu. Corrige-le, et remets le pointeur à `NULL` après la libération.\n```c\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n * sizeof(int));\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = 2 * i;\n    printf(\"%d\\n\", t[n - 1]);\n    return 0;\n}\n```\n" + ex("[[N]]", "[[S2_0]]"),
        ...E(0, {consigne: "Chaque bloc obtenu avec `malloc` doit être rendu exactement une fois. Combien d'appels à `free` faut-il pour un `malloc` ?"}),
        ...E(1, {consigne: "Après `free(t)`, `t` contient toujours l'adresse du bloc rendu : s'en servir par erreur serait dangereux. Écris l'instruction qui lui donne une valeur sûre, facile à tester."}),
        ...E(2, {consigne: "Corrige la fuite : juste avant `return 0;`, libère `t`, puis remets-le à `NULL`. L'affichage ne change pas.", "verif.tests": tests("[[N]]", "1", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(2, 15), N2: R.entre(16, 40)}),
    },
    "c9-105": {
      set: {
        enonce: "Ce programme alloue un tableau de `n` entiers… mais réserve `n` **octets** au lieu de la place de `n` entiers. Corrige l'allocation.\n```c\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    int *t = malloc(n);\n    if (t == NULL) return 1;\n    for (int i = 0; i < n; i++) t[i] = i + 1;\n    int s = 0;\n    for (int i = 0; i < n; i++) s += t[i];\n    printf(\"%d\\n\", s);\n    free(t);\n    return 0;\n}\n```\n" + ex("[[N]]", "[[S2_0]]"),
        ...E(0, {consigne: "`malloc(n)` réserve `n`… quoi ? En quelle unité `malloc` compte-t-il la taille demandée ? (un mot)"}),
        ...E(1, {consigne: "Combien d'octets faut-il pour ranger [[K]] `int`, si un `int` occupe 4 octets ?", question: "Octets pour [[K]] `int` ?", "verif.attendu": "[[K4]]",
          corrige: "[[K]] × 4 = **[[K4]]** octets. `malloc([[K]])` n'en réserverait que [[K]] : de quoi ranger à peine [[KQ]] entier(s).", indices: ["Nombre d'éléments × taille d'un élément.", "[[K4]]"]}),
        ...E(2, {consigne: "Corrige l'allocation pour qu'elle réserve la place de `n` **entiers** : la taille à donner à `malloc` est le nombre d'éléments multiplié par `sizeof(int)`.", "verif.tests": tests("[[N]]", "[[N2]]")}),
      },
      tirer: R => ({N: R.entre(3, 12), N2: R.entre(13, 30), K: R.entre(5, 25)}), deriver: v => ({K4: 4*v.K, KQ: Math.floor(v.K / 4)}),
    },
    "c9-106": {
      set: {
        enonce: "Écris un programme qui lit un mot dans un tampon de 100 caractères, alloue **exactement** la place nécessaire pour le copier (sa longueur + 1), le copie avec `strcpy`, affiche la copie et sa longueur, puis libère la mémoire.\n\n" + ex("[[W0]]", "[[W0]] [[N0]]"),
        guidage: "**Plan** : 1. lire dans `tampon[100]` → 2. `malloc(strlen(tampon) + 1)` (le `+ 1` est pour le `'\\0'`) → 3. `strcpy(copie, tampon)` → 4. afficher la copie et sa longueur → 5. `free`.",
        ...E(0, {consigne: "`strlen` donne le nombre de lettres, **sans** compter le `'\\0'` final, qui a pourtant besoin d'une case. Écris la ligne qui déclare `char *copie` et lui donne un bloc juste assez grand pour le mot de `tampon`."}),
        ...E(1, {consigne: "`strcpy` copie une chaîne dans une autre. Attention à l'ordre : la **destination** d'abord, la source ensuite. Écris la copie de `tampon` dans `copie`."}),
        ...E(2, {consigne: "Premier jalon, sans copie : lis un mot (`%99s`) dans `tampon` et affiche-le suivi de sa longueur (`(int)strlen(tampon)`).", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Ajoute la copie : alloue `copie` à la taille exacte, vérifie `NULL`, copie le mot avec `strcpy`, puis affiche la **copie** et sa longueur. Libère `copie` à la fin.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
    "c9-107": {
      set: {
        enonce: "Écris `int *creer_tableau(int n)` qui alloue avec `calloc` un tableau de `n` entiers et le renvoie (ou `NULL` en cas d'échec). `main` lit `n`, appelle `creer_tableau`, range `[[K]] * (i + 1)` dans chaque case `i`, affiche le tableau, puis **libère** le bloc.\n\n" + ex("[[N]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `creer_tableau` renvoie directement ce que donne `calloc` → 2. `main` récupère le bloc et teste `NULL` → 3. remplir et afficher → 4. `free(t)` dans `main` : c'est celui qui reçoit le bloc qui le libère.",
        ...E(0, {consigne: "La fonction peut tenir en une ligne : elle renvoie directement le bloc de `n` entiers à 0 que fournit `calloc`. Écris cette ligne."}),
        ...E(1, {consigne: "Le bloc doit rester valable après la fin de `creer_tableau`, puisque `main` s'en sert. Qui doit donc appeler `free` : `creer_tableau` ou `main` ? (un mot)"}),
        ...E(2, {consigne: "Premier jalon, sans fonction ni mémoire dynamique : lis `n` (au plus 20), range `[[K]] * (i + 1)` dans chaque case d'un tableau `int t[20]` et affiche-le.",
          verif: {mode: "c", tests: tests("[[N]]", "1"), exemple: c107a}, corrige: sol(c107a), indices: ["Une seule boucle suffit : remplir et afficher.", "`t[i] = [[K]] * (i + 1);`"]}),
        ...E(3, {consigne: "Écris `int *creer_tableau(int n)` (avec `calloc`). Dans `main`, remplace le tableau par `int *t = creer_tableau(n);`, teste `NULL`, remplis, affiche, puis fais le `free`.",
          verif: {mode: "c", tests: tests("[[N]]", "1", "[[N2]]"), nombres: true, exemple: c107, exige: [{motif: "int\\s*\\*\\s*creer_tableau\\s*\\(", msg: "Écris int *creer_tableau(int n)."}, {motif: "\\bfree\\s*\\(", msg: "Libère la mémoire avec free."}]}, corrige: sol(c107), depart: c107a,
          indices: ["La fonction tient en une ligne : `return calloc(n, sizeof(int));`.", "`int *t = creer_tableau(n); if (t == NULL) return 1;` puis `free(t);` à la fin de `main`."]}),
      },
      tirer: R => ({K: R.un([2, 3, 5, 7, 10, 25]), N: R.entre(3, 7), N2: R.entre(8, 12)}),
    },
    "c9-108": {
      set: {
        enonce: "Écris un programme qui lit le nombre d'élèves `n`, puis leurs `n` notes (entiers), et affiche la moyenne (2 décimales) puis le **nombre de notes au-dessus de la moyenne**. Le tableau de notes est alloué **dynamiquement**, puisqu'on ne connaît pas `n` à l'avance.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. lire `n`, allouer le tableau → 2. lire les notes en cumulant la somme → 3. moyenne réelle → 4. **reparcourir** le tableau pour compter les notes `> moy` → 5. afficher, `free`.\n\n**Pourquoi un tableau ?** La moyenne n'est connue qu'à la fin de la saisie : il faut garder les notes pour les comparer ensuite.",
        ...E(0, {consigne: "On pourrait se contenter de cumuler la somme au fil de la saisie… Pourquoi faut-il quand même **garder** toutes les notes dans un tableau ? (quelques mots)"}),
        ...E(1, {consigne: "La somme `s` et `n` sont des `int`. Écris la déclaration de `double moy` qui calcule la moyenne **avec ses décimales** (pense à la division entière)."}),
        ...E(2, {consigne: "Premier jalon, avec un tableau ordinaire `int notes[100]` : lis `n` puis les `n` notes (en cumulant la somme), affiche la moyenne (2 décimales) puis le nombre de notes **strictement** supérieures à la moyenne.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "La classe n'a plus de taille maximale : remplace `int notes[100]` par un bloc de `n` entiers obtenu avec `malloc` (après la lecture de `n`, avec le test `NULL`), et libère-le à la fin.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 8), n2 = R.entre(3, 6); return {E0: saisie(n0, liste(R, n0, 4, 20)), E1: saisie(3, [5, 5, R.entre(15, 20)]), E2: saisie(n2, liste(R, n2, 0, 20))}; },
    },
  },
};
