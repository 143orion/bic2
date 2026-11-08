/* Chapitre 7 : consignes réécrites + variantes (08/11/2026). L'exo 7-114 est dans c-nouveaux-exos.mjs. */
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: String(e), sortie: "@auto"}));
const L = a => a.join(" "), T = a => "{" + a.join(", ") + "}";
const liste = (R, n, a, b) => Array.from({length: n}, () => R.entre(a, b));
const saisie = (n, t, ...plus) => [n, L(t), ...plus].join("\n");
const dec = (x, n = 2) => (Math.round(x * 10**n) / 10**n).toFixed(n);

export default {
  banque: "programmation-c/c-7-fonctions.json",
  n: 8,
  items: {
    "c7-002": {set: {enonce: "Qu'affiche `printf(\"%d\", multiplier([[A]], multiplier([[B]], [[C]])));` avec `multiplier(x, y)` qui renvoie `x * y` ?", "verif.attendu": "[[R]]",
        explication: "On évalue d'abord l'appel intérieur : `multiplier([[B]], [[C]])` vaut [[BC]]. Puis `multiplier([[A]], [[BC]])` vaut **[[R]]**."},
      tirer: R => ({A: R.entre(2, 6), B: R.entre(2, 5), C: R.entre(2, 5)}), deriver: v => ({BC: v.B * v.C, R: v.A * v.B * v.C})},
    "c7-005": {set: {enonce: "Que renvoie `f([[N]])` ?\n```c\nint f(int n) {\n    if (n > [[S]]) return 1;\n    return 2;\n    return 3;\n}\n```", "verif.attendu": "[[R]]",
        explication: "[[EXP]] Le `return 3;` n'est jamais atteint : un `return` quitte la fonction immédiatement."},
      tirer: R => ({N: R.entre(0, 12), S: R.entre(3, 8)}), deriver: v => ({R: v.N > v.S ? 1 : 2, EXP: v.N > v.S ? `${v.N} > ${v.S} : le premier \`return\` renvoie **1**.` : `${v.N} > ${v.S} est faux : on passe au \`return 2;\`, qui renvoie **2**.`})},
    "c7-007": {set: {enonce: "Qu'affiche ce programme ?\n```c\nint total = [[T0]];\nvoid ajouter(int x) { total += x; }\nint main(void) {\n    ajouter([[A]]); ajouter([[B]]);\n    printf(\"%d\", total);\n    return 0;\n}\n```", "verif.attendu": "[[R]]",
        explication: "`total` est **globale** : les deux appels modifient la même variable. [[T0]] + [[A]] + [[B]] = **[[R]]**."},
      tirer: R => ({T0: R.un([0, 0, 10, 100]), A: R.entre(1, 9), B: R.entre(1, 9)}), deriver: v => ({R: v.T0 + v.A + v.B})},
    "c7-009": {set: {enonce: "Qu'affiche ce code ?\n```c\nvoid f(int x) { x = [[Z]]; }\nint main(void) {\n    int a = [[A]];\n    f(a);\n    printf(\"%d\", a);\n    return 0;\n}\n```", "verif.attendu": "[[A]]",
        explication: "`f` reçoit une **copie** de `a` : elle met sa copie à [[Z]], mais `a` garde **[[A]]**."},
      tirer: R => { const A = R.entre(1, 20); let Z; do Z = R.un([0, 50, 99, 100, -1]); while(Z === A); return {A, Z}; }},
    "c7-010": {set: {enonce: "Qu'affiche ce code ?\n```c\nvoid f(int *x) { *x = [[Z]]; }\nint main(void) {\n    int a = [[A]];\n    f(&a);\n    printf(\"%d\", a);\n    return 0;\n}\n```", "verif.attendu": "[[Z]]",
        explication: "`f` reçoit l'**adresse** de `a` : `*x` désigne `a` lui-même, qui passe à **[[Z]]**."},
      tirer: R => { const A = R.entre(1, 20); let Z; do Z = R.un([0, 50, 99, 100, -1, 7]); while(Z === A); return {A, Z}; }},

    "c7-101": {set: {
        enonce: "Écris une fonction `int carre(int x)` qui renvoie le carré de `x`. Son **prototype** (sa déclaration, terminée par `;`) se place avant `main`, sa **définition** (avec le corps) après. Dans `main`, lis `n` et affiche `carre(n)`.\n\n" + ex("[[N]]", "[[R]]"),
        guidage: "**Pourquoi un prototype ?** Le compilateur lit le fichier de haut en bas : quand il rencontre `carre(n)` dans `main`, il doit déjà savoir que `carre` existe et ce qu'elle prend et renvoie. Le prototype le lui annonce ; la définition peut venir plus bas.",
        ...E(0, {consigne: "Le prototype, c'est la première ligne de la fonction (type renvoyé, nom, paramètres), suivie d'un `;` au lieu du corps. Écris celui de `carre`, qui reçoit un `int` et renvoie un `int`."}),
        ...E(1, {consigne: "Dans la définition, une seule instruction suffit : celle qui **renvoie** le carré de `x`. Écris-la."}),
        ...E(2, {consigne: "Premier jalon, sans fonction : lis `n` dans `main` et affiche directement son carré.", "verif.tests": tests("[[N]]", "[[M]]", "0")}),
        ...E(3, {consigne: "Transforme en fonction : prototype `int carre(int x);` avant `main`, appel `carre(n)` dans le `printf`, et définition complète après `main`.", "verif.tests": tests("[[N]]", "[[M]]", "0")}),
      }, tirer: R => ({N: R.entre(2, 30), M: R.entre(-20, -1)}), deriver: v => ({R: v.N * v.N})},
    "c7-102": {set: {
        enonce: "Écris :\n- une fonction `int maximum(int a, int b)` qui renvoie le plus grand des deux ;\n- une fonction `void afficher_ligne(int n)` qui affiche `n` tirets puis un retour à la ligne.\n\n`main` lit deux entiers, affiche une ligne de tirets de la longueur du maximum, puis le maximum.\n\n" + ex("[[A]] [[B]]", "[[S3_0]]"),
        ...E(0, {consigne: "Écris l'en-tête (sans le corps) de `maximum` : elle reçoit deux `int` nommés `a` et `b`, et renvoie un `int`."}),
        ...E(1, {consigne: "`afficher_ligne` affiche des tirets mais ne **renvoie** aucune valeur. Quel mot met-on à la place du type de retour ?"}),
        ...E(2, {consigne: "Premier jalon, sans fonctions : lis `a` et `b`, calcule le maximum `m`, affiche une ligne de `m` tirets (avec une boucle `for`), puis `m`.", "verif.tests": tests("[[A]] [[B]]", "[[C]] [[D]]", "1 1")}),
        ...E(3, {consigne: "Extrais les deux fonctions (placées avant `main`) : `maximum` renvoie le plus grand, `afficher_ligne` contient la boucle des tirets. `main` ne fait plus que lire, appeler les fonctions et afficher.", "verif.tests": tests("[[A]] [[B]]", "[[C]] [[D]]", "1 1")}),
      }, tirer: R => ({A: R.entre(1, 9), B: R.entre(1, 9), C: R.entre(1, 12), D: R.entre(1, 12)})},
    "c7-103": {set: {
        enonce: "Écris une fonction `int est_pair(int n)` qui renvoie 1 si `n` est pair, 0 sinon. `main` lit `N` puis `N` entiers et affiche **combien sont pairs**, en appelant `est_pair`.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        ...E(0, {consigne: "Écris l'en-tête de `est_pair` : un paramètre `int n`, un `int` renvoyé."}),
        ...E(1, {consigne: "Une comparaison vaut déjà 1 (vrai) ou 0 (faux) : on peut la renvoyer directement, sans `if`. Écris l'instruction qui renvoie 1 si `n` est pair, 0 sinon, en une ligne."}),
        ...E(2, {consigne: "Premier jalon, sans fonction : lis `N` puis les `N` entiers, et compte les pairs avec un test `x % 2 == 0` directement dans `main`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Sors le test dans la fonction `est_pair` (placée avant `main`), et dans la boucle de `main` écris `if (est_pair(x)) nb++;`.", "verif.tests": tests("[[E0]]", "[[E1]]", "3\n0 -2 8")}),
      }, tirer: R => { const n0 = R.entre(4, 7), n1 = R.entre(2, 5); return {E0: saisie(n0, liste(R, n0, -20, 50)), E1: saisie(n1, liste(R, n1, 1, 99))}; }},
    "c7-104": {set: {
        enonce: "Écris une variable **globale** `appels` (initialisée à 0) et une fonction `void saluer(void)` qui affiche `Bonjour` et augmente `appels`. `main` lit `n`, appelle `saluer` `n` fois, puis affiche `appels`.\n\n" + ex("[[N]]", "[[S3_0]]"),
        guidage: "**À retenir** : une variable **globale** est déclarée en dehors de toute fonction ; toutes les fonctions du fichier la voient et la modifient. Une variable locale, elle, n'existe que dans sa fonction.",
        ...E(0, {consigne: "Pour que `saluer` et `main` voient toutes les deux la même variable `appels`, où faut-il la déclarer ? (réponse courte)"}),
        ...E(1, {consigne: "Si `main` appelle `saluer` [[K]] fois, que vaut la globale `appels` à la fin ?", "verif.attendu": "[[K]]", corrige: "Chaque appel fait `appels++` sur la même variable : **[[K]]**.", indices: ["Un appel = +1.", "[[K]]"]}),
        ...E(2, {consigne: "Premier jalon, sans fonction ni globale : lis `n`, affiche `Bonjour` `n` fois (une par ligne) en comptant dans une variable locale `compteur`, puis affiche `compteur`.", "verif.tests": tests("[[N]]", "1", "0")}),
        ...E(3, {consigne: "Remplace le compteur local par une globale `int appels = 0;` en haut du fichier, et mets l'affichage de `Bonjour` et le `appels++` dans `void saluer(void)`. `main` appelle `saluer` dans sa boucle, puis affiche `appels`.", "verif.tests": tests("[[N]]", "1", "0")}),
      }, tirer: R => ({N: R.entre(2, 6), K: R.entre(3, 12)})},
    "c7-105": {set: {
        enonce: "Ce programme doit doubler `n` grâce à la fonction `doubler`, puis l'afficher : avec `[[N]]`, il devrait afficher `[[R]]`. Il affiche `[[N]]`. Corrige `doubler` (et son appel) en passant `n` **par adresse**.\n```c\n#include <stdio.h>\n\nvoid doubler(int x) {\n    x = x * 2;\n}\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    doubler(n);\n    printf(\"%d\\n\", n);\n    return 0;\n}\n```",
        ...E(0, {consigne: "Dans `void doubler(int x)`, `x` reçoit la valeur de `n` au moment de l'appel. La fonction travaille-t-elle sur l'original de `n`, ou sur une **copie** ? (un mot)"}),
        ...E(1, {consigne: "Pour modifier l'original, la fonction doit recevoir son **adresse** : le paramètre devient un pointeur sur `int`. Écris le nouvel en-tête de `doubler` (paramètre `x`)."}),
        ...E(2, {consigne: "Dans `main`, l'appel doit maintenant transmettre l'adresse de `n`. Écris cet appel."}),
        ...E(3, {consigne: "Corrige le programme : paramètre `int *x`, et dans la fonction on modifie la valeur pointée (`*x = *x * 2;`) ; l'appel devient `doubler(&n);`.", "verif.tests": tests("[[N]]", "[[M]]")}),
      }, tirer: R => ({N: R.entre(2, 50), M: R.entre(-20, -1)}), deriver: v => ({R: 2 * v.N})},
    "c7-106": {set: {
        enonce: "Écris `void echanger(int *a, int *b)` qui échange les deux valeurs pointées. `main` lit deux entiers, appelle `echanger`, puis les affiche.\n\n" + ex("[[A]] [[B]]", "[[B]] [[A]]"),
        guidage: "**Pourquoi des pointeurs ?** Une fonction ne reçoit que des copies de ses arguments. Pour qu'elle modifie les variables de `main`, on lui donne leurs **adresses**, et elle écrit à travers `*a` et `*b`.",
        ...E(0, {consigne: "Écris l'en-tête de `echanger` : deux paramètres `a` et `b`, qui sont des **pointeurs** vers des `int`, et aucune valeur renvoyée."}),
        ...E(1, {consigne: "Comme pour un échange classique, on met d'abord une valeur de côté. Écris l'instruction qui déclare `temp` et y range la valeur **pointée** par `a`."}),
        ...E(2, {consigne: "Dans `main`, on veut échanger `x` et `y`. Écris l'appel de `echanger` en lui donnant leurs adresses."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `x` et `y`, échange-les dans `main` avec une variable `temp`, et affiche-les.", "verif.tests": tests("[[A]] [[B]]", "[[E1]]")}),
        ...E(4, {consigne: "Sors l'échange dans `void echanger(int *a, int *b)` (avec `*a`, `*b` et `temp`), et appelle-la avec `echanger(&x, &y);`.", "verif.tests": tests("[[A]] [[B]]", "[[E1]]")}),
      }, tirer: R => { const A = R.entre(1, 50); let B; do B = R.entre(1, 50); while(B === A); return {A, B, E1: `${R.entre(-9, -1)} ${R.entre(1, 9)}`}; }},
    "c7-107": {set: {
        enonce: "Écris `void diviser(int dividende, int diviseur, int *quotient, int *reste)` (exemple du cours). `main` lit deux entiers et affiche le quotient puis le reste, calculés par `diviser`.\n\n" + ex("[[A]] [[B]]", "[[Q]] [[R]]"),
        guidage: "**Idée** : une fonction ne renvoie qu'une valeur avec `return`. Pour en produire deux, elle reçoit les **adresses** de deux variables de `main` et écrit dedans.",
        ...E(0, {consigne: "Dans `diviser`, `quotient` est l'adresse d'une variable de `main`. Écris l'instruction qui range, **dans cette variable**, le quotient de `dividende` par `diviseur`."}),
        ...E(1, {consigne: "Même chose pour le **reste** de la division, dans la variable pointée par `reste`."}),
        ...E(2, {consigne: "Dans `main`, `a` et `b` sont les entrées, et `q` et `r` doivent recevoir les résultats. Écris l'appel de `diviser`."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `a` et `b`, calcule `q = a / b` et `r = a % b` dans `main`, et affiche `q r`.", "verif.tests": tests("[[A]] [[B]]", "20 4", "3 7")}),
        ...E(4, {consigne: "Déplace les deux calculs dans `diviser` (qui écrit dans `*quotient` et `*reste`), et appelle-la depuis `main` avec `&q` et `&r`.", "verif.tests": tests("[[A]] [[B]]", "20 4", "3 7")}),
      }, tirer: R => ({A: R.entre(10, 99), B: R.entre(2, 9)}), deriver: v => ({Q: Math.floor(v.A / v.B), R: v.A % v.B})},
    "c7-108": {set: {
        enonce: "Reprends l'exercice du cours : écris `void remplir_tableau(int arr[], int taille)`, `void afficher_tableau(int arr[], int taille)` (format `[10, 20, 30]`) et `int somme_tableau(int arr[], int taille)`. `main` lit `N` (au plus 100), remplit le tableau, l'affiche, puis affiche la somme.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        guidage: "**Plan** : chaque fonction reçoit le tableau **et** sa taille (une fonction ne peut pas deviner combien de cases elle a reçues). `remplir` lit, `afficher` écrit au format `[a, b, c]`, `somme` renvoie un `int`.",
        ...E(0, {consigne: "Écris le prototype de `remplir_tableau` : elle reçoit un tableau d'entiers `arr` **et** sa taille `taille`, et ne renvoie rien."}),
        ...E(1, {consigne: "Dans `main`, le tableau s'appelle `t` et sa taille `n`. Écris l'appel de `remplir_tableau` (le tableau se passe par son nom, sans crochets)."}),
        ...E(2, {consigne: "Pour afficher `[10, 20, 30]`, chaque valeur est suivie d'une virgule… sauf la **dernière**. Écris la condition (indice `i`, `taille`) qui autorise l'affichage de la virgule."}),
        ...E(3, {consigne: "Premier jalon, sans fonctions : lis `N` puis les `N` entiers, affiche le tableau au format `[10, 20, 30]`, puis la somme sur la ligne suivante.", "verif.tests": tests("[[E0]]", "1\n[[UN]]")}),
        ...E(4, {consigne: "Découpe en trois fonctions `remplir_tableau`, `afficher_tableau` et `somme_tableau` (chacune reçoit `arr` et `taille`), et appelle-les dans `main`.", "verif.tests": tests("[[E0]]", "1\n[[UN]]", "[[E1]]")}),
      }, tirer: R => { const n0 = R.entre(3, 6), n1 = R.entre(2, 5); return {E0: saisie(n0, liste(R, n0, 1, 9).map(x => 10 * x)), E1: saisie(n1, liste(R, n1, -9, 30)), UN: R.entre(1, 99)}; }},
    "c7-109": {set: {
        enonce: "Écris `int est_trie(int t[], int n)` qui renvoie 1 si le tableau est trié par ordre croissant (deux valeurs égales côte à côte sont acceptées), 0 sinon. `main` lit `N` puis `N` entiers et affiche le résultat.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        ...E(0, {consigne: "Le tableau `[[TAB]]` est-il trié par ordre croissant (deux valeurs égales côte à côte sont acceptées) ? (1 oui, 0 non)", "verif.attendu": "[[RT]]", corrige: "[[EXP]]", indices: ["Compare chaque valeur à sa voisine de droite.", "[[RT]]"]}),
        ...E(1, {consigne: "Un tableau n'est pas trié dès qu'une valeur est **plus grande** que sa voisine de droite. Écris cette condition de désordre, pour `t[i]`."}),
        ...E(2, {consigne: "On lit `t[i + 1]` : il faut donc que `i + 1` reste un indice valide (au plus `n - 1`). Écris la condition de la boucle sur `i`."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `N` puis les `N` entiers, et affiche `1` si le tableau est trié, `0` sinon (un indicateur `trie` qui passe à 0 au premier désordre).", "verif.tests": tests("[[E0]]", "[[E1]]", "1\n9")}),
        ...E(4, {consigne: "Sors le test dans `int est_trie(int t[], int n)` : `return 0;` dès qu'une paire est en désordre, `return 1;` après la boucle. `main` affiche `est_trie(t, n)`.", "verif.tests": tests("[[E0]]", "[[E1]]", "1\n9")}),
      }, tirer: R => { const tri = n => liste(R, n, 1, 20).sort((a, b) => a - b), desord = n => { let t; do t = liste(R, n, 1, 20); while(t.every((x, i) => i === 0 || t[i - 1] <= x)); return t; };
        const a = R.entre(0, 1) ? tri(4) : desord(4), n0 = R.entre(4, 6), b = R.entre(0, 1) ? tri(n0) : desord(n0), n1 = R.entre(3, 5);
        return {TAB: T(a), E0: saisie(n0, b), E1: saisie(n1, R.entre(0, 1) ? tri(n1) : desord(n1))}; },
      deriver: v => { const t = v.TAB.slice(1, -1).split(", ").map(Number), k = t.findIndex((x, i) => i < t.length - 1 && x > t[i + 1]);
        return {RT: k < 0 ? 1 : 0, EXP: k < 0 ? "Chaque valeur est inférieure ou égale à la suivante : **1**." : `${t[k]} est plus grand que ${t[k + 1]}, juste après lui : **0**.`}; }},
    "c7-110": {set: {
        enonce: "Écris `int recherche_position(int t[], int n, int val)` qui renvoie l'indice de la première case qui vaut `val`, ou `-1` si `val` est absente. `main` lit `N`, les `N` entiers, puis `val`, et affiche le résultat.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        ...E(0, {consigne: "Dans `[[TAB]]`, quel indice la fonction doit-elle renvoyer pour `val = [[X]]` ? (la **première** occurrence, en comptant à partir de 0)", "verif.attendu": "[[IX]]", corrige: "La première case qui vaut [[X]] est à l'indice **[[IX]]**.", indices: ["Compte à partir de 0 et arrête-toi à la première.", "[[IX]]"]}),
        ...E(1, {consigne: "Dans la boucle, dès que `t[i] == val`, on connaît la réponse : on peut quitter la fonction tout de suite en renvoyant `i`. Écris cette instruction."}),
        ...E(2, {consigne: "Si la boucle va jusqu'au bout sans rien trouver, la valeur est absente. Écris l'instruction, placée **après** la boucle, qui le signale."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `N`, les `N` entiers, puis `val`, et affiche l'indice de la première occurrence de `val` (ou `-1`).", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Place la recherche dans `int recherche_position(int t[], int n, int val)` : `return i;` dès la première occurrence, `return -1;` après la boucle. `main` affiche le résultat.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      }, tirer: R => { const t = R.distincts(5, 1, 9), X = t[R.entre(1, 3)]; t[4] = X; const n0 = R.entre(4, 7), a = R.distincts(n0, 1, 30), x0 = a[R.entre(0, n0 - 1)]; const n1 = R.entre(3, 5), b = R.distincts(n1, 1, 30); let y; do y = R.entre(1, 30); while(b.includes(y));
        return {TAB: T(t), X, IX: t.indexOf(X), E0: saisie(n0, a, x0), E1: saisie(n1, b, y)}; }},
    "c7-111": {set: {
        enonce: "Écris `void sans_negatifs(int t[], int n)` qui remplace chaque valeur négative par 0, **dans le tableau d'origine**. `main` lit `N` puis `N` entiers, appelle la fonction, puis affiche le tableau.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        ...E(0, {consigne: "Quand on passe un tableau à une fonction, elle reçoit en fait l'adresse de sa première case. Travaille-t-elle sur une **copie** ou sur l'**original** ? (réponse courte)"}),
        ...E(1, {consigne: "Écris l'instruction qui remplace `t[i]` par 0."}),
        ...E(2, {consigne: "Premier jalon, sans fonction : lis `N` puis les `N` entiers, remplace chaque négatif par 0 directement dans `main`, et affiche le tableau.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Sors le remplacement dans `void sans_negatifs(int t[], int n)`, et appelle-la depuis `main` avant l'affichage. Comme elle travaille sur l'original, `main` voit le tableau modifié.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      }, tirer: R => { const n0 = R.entre(4, 7), n1 = R.entre(2, 4); return {E0: saisie(n0, liste(R, n0, -9, 9)), E1: saisie(n1, liste(R, n1, -20, -1))}; }},
    "c7-112": {set: {
        enonce: "Écris une fonction `double hypotenuse(double a, double b)` qui renvoie $\\sqrt{a^2 + b^2}$ en utilisant `sqrt` et `pow` de `math.h`. `main` lit deux réels et affiche le résultat avec 2 décimales.\n\n" + ex("[[A]] [[B]]", "[[R]]"),
        ...E(0, {consigne: "Quelle est l'hypoténuse d'un triangle rectangle de côtés [[A]] et [[B]] ? ($\\sqrt{[[A]]^2 + [[B]]^2}$)", "verif.attendu": "[[R]]", corrige: "$\\sqrt{[[A2]] + [[B2]]} = \\sqrt{[[S]]}$ = **[[R]]**.", indices: ["Calcule [[A]]² + [[B]]², puis prends la racine.", "[[R]]"]}),
        ...E(1, {consigne: "`sqrt` et `pow` ne sont pas disponibles sans la bonne bibliothèque. Écris la ligne qui inclut la bibliothèque mathématique."}),
        ...E(2, {consigne: "`pow(a, 2)` calcule $a^2$ et `sqrt(…)` la racine carrée. Écris l'expression complète de $\\sqrt{a^2 + b^2}$."}),
        ...E(3, {consigne: "Premier jalon, sans fonction ni racine : lis `a` et `b` (réels, avec `%lf`) et affiche $a^2 + b^2$ avec 2 décimales.", "verif.tests": tests("[[A]] [[B]]", "1 1", "[[E1]]")}),
        ...E(4, {consigne: "Écris `double hypotenuse(double a, double b)` avec `sqrt` et `pow` (n'oublie pas `#include <math.h>`), et affiche `hypotenuse(a, b)` avec 2 décimales.", "verif.tests": tests("[[A]] [[B]]", "1 1", "[[E1]]")}),
      }, tirer: R => { const [A, B] = R.un([[3, 4], [6, 8], [5, 12], [8, 15], [9, 12], [7, 24], [2, 3], [1, 2]]); return {A, B, E1: `${R.entre(1, 9)}.5 ${R.entre(1, 9)}`}; },
      deriver: v => ({A2: v.A * v.A, B2: v.B * v.B, S: v.A * v.A + v.B * v.B, R: dec(Math.sqrt(v.A * v.A + v.B * v.B))})},
    "c7-113": {set: {
        enonce: "Dans l'éditeur, il n'y a qu'un seul fichier : reproduis l'organisation d'un module `calculatrice`. En haut, les **prototypes** de `addition` et `soustraction` (ce qui irait dans `calculatrice.h`) ; puis `main`, qui lit deux entiers et affiche leur somme puis leur différence ; puis les **définitions** des deux fonctions (ce qui irait dans `calculatrice.c`).\n\n" + ex("[[A]] [[B]]", "[[S3_0]]"),
        ...E(0, {consigne: "Écris le prototype de `addition` : deux `int` en paramètres, un `int` renvoyé, et le `;` final qui en fait une simple déclaration."}),
        ...E(1, {consigne: "Dans un vrai projet, les prototypes d'un module sont regroupés dans un fichier d'en-tête, inclus par ceux qui utilisent le module. Quelle est l'extension de ce fichier ? (par exemple `.c`)"}),
        ...E(2, {consigne: "Premier jalon, sans fonctions : lis deux entiers et affiche leur somme puis leur différence, sur une ligne.", "verif.tests": tests("[[A]] [[B]]", "[[E1]]")}),
        ...E(3, {consigne: "Organise comme un module : les deux prototypes **avant** `main`, les appels `addition(a, b)` et `soustraction(a, b)` dans `main`, et les deux définitions **après** `main`.", "verif.tests": tests("[[A]] [[B]]", "[[E1]]")}),
      }, tirer: R => ({A: R.entre(1, 50), B: R.entre(1, 50), E1: `${R.entre(-20, -1)} ${R.entre(1, 20)}`})},
  },
};
