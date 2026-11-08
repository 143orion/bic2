/* Chapitre 8 : consignes réécrites + variantes (08/11/2026). */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const L = a => a.join(" "), T = a => "{" + a.join(", ") + "}";
const liste = (R, n, a, b) => Array.from({length: n}, () => R.entre(a, b));
const saisie = (n, t, ...plus) => [n, L(t), ...plus].join("\n");
const MOTS = ["pointeur", "adresse", "memoire", "octet", "variable", "tableau", "esilv", "clavier", "boucle", "fonction"];
const c102d = "#include <stdio.h>\n\nint main(void) {\n    int x = [[X]];\n    int *p = x;\n    printf(\"%d\\n\", *p);\n    return 0;\n}";
const c102 = c102d.replace("int *p = x;", "int *p = &x;");

export default {
  banque: "programmation-c/c-8-pointeurs.json",
  n: 8,
  items: {
    /* ---------- questions courtes ---------- */
    "c8-004": {set: {enonce: "Que vaut `x` ?\n```c\nint x = [[A]];\nint *p = &x;\n*p = *p + [[B]];\n```", "verif.attendu": "[[R]]", explication: "`p` pointe sur `x`, donc `*p` **est** `x` : [[A]] + [[B]] = **[[R]]**."},
      tirer: R => ({A: R.entre(1, 20), B: R.entre(2, 9)}), deriver: v => ({R: v.A + v.B})},
    "c8-005": {set: {enonce: "Qu'affiche ce code ?\n```c\nint a = [[A]], b = [[B]];\nint *p = &a;\np = &b;\n*p = [[C]];\nprintf(\"%d %d\", a, b);\n```\n(réponds par la valeur de b)", "verif.attendu": "[[C]]",
        explication: "Au moment de `*p = [[C]]`, `p` pointe sur `b` (il a été redirigé) : `b` vaut **[[C]]**, et `a` garde [[A]]."},
      tirer: R => { const A = R.entre(1, 9); let B, C; do { B = R.entre(1, 9); C = R.entre(0, 9); } while(B === A || C === A || C === B); return {A, B, C}; }},
    "c8-011": {set: {enonce: "Qu'affiche ce code ?\n```c\nint t[5] = [[TAB]];\nint *p = t;\np++;\np = p + [[K]];\nprintf(\"%d\", *p);\n```", "verif.attendu": "[[R]]",
        explication: "`p` part de `t[0]`, avance d'une case (`t[1]`), puis de [[K]] cases : il pointe sur `t[[[I]]]`, qui vaut **[[R]]**."},
      tirer: R => ({TAB: T(R.distincts(5, 1, 9).map(x => 10*x)), K: R.entre(1, 3)}),
      deriver: v => { const t = v.TAB.slice(1, -1).split(", "); return {I: 1 + v.K, R: t[1 + v.K]}; }},
    "c8-012": {set: {enonce: "Un `[[TY]] *p` vaut [[AD]]. Quelle adresse vaut `p + [[K]]` ? (un `[[TY]]` occupe [[O]] octets)", "verif.attendu": "[[R]]",
        explication: "`p + [[K]]` avance de [[K]] **éléments**, pas de [[K]] octets : [[AD]] + [[K]] × [[O]] = **[[R]]**."},
      tirer: R => { const [TY, O] = R.un([["double", 8], ["int", 4], ["char", 1]]); return {TY, O, AD: R.un([1000, 2000, 4000, 5000]), K: R.entre(1, 5)}; }, deriver: v => ({R: v.AD + v.K * v.O})},
    "c8-013": {set: {enonce: "Pour `int t[10]`, `int *a = &t[[[I]]]` et `int *b = &t[[[J]]]`, que vaut `b - a` ?", "verif.attendu": "[[R]]",
        explication: "La différence de deux pointeurs compte les **éléments** qui les séparent (pas les octets) : [[J]] − [[I]] = **[[R]]**."},
      tirer: R => { const I = R.entre(0, 4); return {I, J: R.entre(I + 1, 9)}; }, deriver: v => ({R: v.J - v.I})},
    "c8-014": {set: {enonce: "Qu'affiche `printf(\"%d\", *(tab + [[K]]));` avec `int tab[4] = [[TAB]];` ?", "verif.attendu": "[[R]]",
        explication: "`*(tab + [[K]])` est exactement `tab[[[K]]]` : **[[R]]**."},
      tirer: R => ({TAB: T(R.distincts(4, 2, 30)), K: R.entre(0, 3)}), deriver: v => ({R: v.TAB.slice(1, -1).split(", ")[v.K]})},
    "c8-016": {set: {enonce: "Qu'affiche `printf(\"%s\", [[NOM]][[[K]]]);` avec `char *[[NOM]][] = [[TAB]];` ?", "verif.attendu": ["[[R]]"],
        explication: "Les indices commencent à 0 : `[[NOM]][[[K]]]` est la chaîne n° [[K1]], soit **[[R]]**."},
      tirer: R => { const [NOM, mots] = R.un([["jours", ["Lundi", "Mardi", "Mercredi", "Jeudi"]], ["mois", ["Janvier", "Fevrier", "Mars", "Avril"]], ["couleurs", ["Rouge", "Vert", "Bleu", "Jaune"]], ["villes", ["Paris", "Lyon", "Lille", "Nantes"]]]);
        const K = R.entre(1, 3); return {NOM, K, K1: K + 1, R: mots[K], TAB: "{" + mots.map(m => `"${m}"`).join(", ") + "}"}; }},

    /* ---------- exos ---------- */
    "c8-101": {
      set: {
        enonce: "Écris un programme qui lit un entier `x`, déclare un pointeur `p` vers `x`, puis **double `x` en passant uniquement par `p`**, et enfin affiche `x`.\n\n" + ex("[[X]]", "[[X2]]"),
        guidage: "**Plan** : 1. `p` reçoit l'**adresse** de `x` → 2. `*p` désigne alors `x` lui-même → 3. modifier `*p`, c'est modifier `x`.\n\n**Piège** : n'écris pas `x = x * 2` : l'énoncé impose de passer par `p`.",
        ...E(0, {consigne: "Un pointeur vers un `int` se déclare avec le type `int *`, et on lui donne l'**adresse** de la variable visée (avec `&`). Écris, sur une seule ligne, la déclaration de `p` qui pointe sur `x`."}),
        ...E(1, {consigne: "`*p` (avec l'étoile) désigne la variable sur laquelle `p` pointe, ici `x`. Écris l'instruction qui double `x` **en n'écrivant que `*p`** (jamais `x`)."}),
        ...E(2, {consigne: "Premier jalon : lis `x`, déclare `p` qui pointe sur `x`, et affiche `x` **en le lisant à travers `p`** (`*p`), sans le modifier.", "verif.tests": tests("[[X]]", "[[Y]]")}),
        ...E(3, {consigne: "Au lieu de seulement lire `*p`, **double** `x` en écrivant à travers `p`, puis affiche `x` (le vrai `x`, pour vérifier qu'il a bien changé).", "verif.tests": tests("[[X]]", "[[Y]]", "0")}),
      },
      tirer: R => ({X: R.entre(2, 60), Y: R.entre(-30, -1)}), deriver: v => ({X2: 2*v.X}),
    },
    "c8-102": {
      set: {
        enonce: "Ce programme doit afficher la valeur de `x` ([[X]]) en passant par un pointeur. Il ne compile pas : le pointeur reçoit une **valeur** au lieu d'une **adresse**.\n```c\n" + c102d + "\n```",
        ...E(0, {consigne: "Une variable de type `int *` ne contient pas un nombre ordinaire. Que doit-elle contenir ? (réponse courte)"}),
        ...E(1, {consigne: "Tu l'utilises déjà dans `scanf` : quel opérateur, placé devant `x`, donne l'adresse de `x` ?"}),
        ...E(2, {consigne: "Corrige l'initialisation de `p` pour qu'il reçoive l'adresse de `x` : le programme doit compiler et afficher `[[X]]`.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[X]]"}], nombres: true, exemple: c102, exige: [{motif: "int\\s*\\*\\s*p\\s*=\\s*&\\s*x", msg: "Un pointeur reçoit une adresse : int *p = &x;"}]}, corrige: sol(c102), depart: c102d}),
      },
      tirer: R => ({X: R.entre(2, 99)}),
    },
    "c8-103": {
      set: {
        enonce: "Écris `int *chercher(int t[], int n, int v)` qui renvoie l'**adresse** de la première case qui vaut `v`, ou `NULL` si `v` est absente.\n\n`main` lit `N`, puis `N` entiers, puis `v`. Si le résultat n'est pas `NULL`, il **met la case trouvée à 0 en passant par le pointeur**, puis affiche le tableau ; sinon il affiche `absent`.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        guidage: "**Plan** : 1. la fonction parcourt le tableau → 2. à la première case égale à `v`, elle renvoie son **adresse** (`&t[i]`) → 3. sinon `NULL` → 4. `main` teste le résultat avant d'écrire dedans.\n\n**Piège** : écrire à travers un pointeur `NULL` fait planter le programme.",
        ...E(0, {consigne: "La fonction renvoie une adresse. Si la valeur n'est nulle part, il faut renvoyer une adresse spéciale qui veut dire « nulle part ». Comment s'appelle-t-elle ? (un mot)"}),
        ...E(1, {consigne: "Quand `t[i] == v`, on ne veut pas renvoyer la valeur `t[i]` (on la connaît déjà, c'est `v`), mais **l'endroit** où elle se trouve. Écris l'instruction qui renvoie l'adresse de la case `t[i]`."}),
        ...E(2, {consigne: "Dans `main`, le pointeur `r` reçoit le résultat. Avant d'écrire `*r = 0`, il faut s'assurer que la valeur a été trouvée. Écris cette condition (sans le `if`)."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `N`, les `N` entiers puis `v`. Avec un pointeur `r` qui vaut `NULL` au départ, cherche `v` : à la première occurrence, `r = &t[i];` puis `break`. Ensuite, si `r` n'est pas `NULL`, mets la case à 0 par `*r = 0` et affiche le tableau ; sinon affiche `absent`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Déplace la recherche dans la fonction `int *chercher(int t[], int n, int v)` : elle renvoie `&t[i]` dès qu'elle trouve, et `NULL` après la boucle. `main` écrit simplement `int *r = chercher(t, n, v);` puis garde son test `r != NULL`.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7), a = liste(R, n0, 1, 9), x = a[R.entre(1, n0 - 2)]; a[n0 - 1] = x; const n1 = R.entre(3, 5), b = R.distincts(n1, 1, 20); let y; do y = R.entre(1, 20); while(b.includes(y));
        const c = R.distincts(3, 1, 9); return {E0: saisie(n0, a, x), E1: saisie(n1, b, y), E2: saisie(3, c, c[0])}; },
    },
    "c8-104": {
      set: {
        enonce: "Écris un programme qui lit `N` puis `N` entiers dans un tableau, puis les affiche **en parcourant le tableau avec un pointeur** qui avance avec `p++`. Utilise un compteur pour savoir quand t'arrêter (sans comparer de pointeurs).\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `int *p = t;` (le nom du tableau est l'adresse de sa première case) → 2. `n` fois : afficher `*p`, puis `p++` (le pointeur avance d'un **élément**).",
        ...E(0, {consigne: "Le nom d'un tableau, utilisé seul, vaut l'adresse de sa première case. Écris la déclaration d'un pointeur `p` qui pointe sur le début du tableau `t`."}),
        ...E(1, {consigne: "`p` pointe sur `t[0]`. On fait `p++`. Sur quelle case (donne son indice) pointe-t-il maintenant ? Attention : un pointeur avance d'un **élément** entier, pas d'un octet."}),
        ...E(2, {consigne: "Premier jalon, sans pointeur : lis `N` puis les `N` entiers, et affiche-les séparés par une espace avec une boucle classique (`t[i]`).", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Remplace la boucle d'affichage : déclare `int *p = t;`, puis répète `n` fois « affiche `*p`, puis `p++` ». Le compteur de la boucle sert juste à compter les tours ; c'est `p` qui se déplace dans le tableau.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7), n1 = 1; return {E0: saisie(n0, liste(R, n0, -9, 50)), E1: saisie(n1, [R.entre(1, 99)])}; },
    },
    "c8-105": {
      set: {
        enonce: "Écris `int somme(int *t, int n)` qui calcule la somme des `n` cases **en notation pointeur** (`*(t + i)`, sans crochets). `main` lit `N` puis `N` entiers et affiche la somme.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `somme` reçoit un pointeur `int *t` → 2. `t[i]` s'écrit aussi `*(t + i)` → 3. on cumule dans `s`.\n\n**À retenir** : `t + i` est l'adresse de la case `i` ; l'étoile lit ce qu'il y a dedans.",
        ...E(0, {consigne: "`t + i` est l'adresse de la case `i` (on avance de `i` éléments à partir du début). Comment lire la **valeur** rangée à cette adresse ? Écris l'expression équivalente à `t[i]`, sans crochets."}),
        ...E(1, {consigne: "Si `t` pointe sur `[[TAB]]`, que vaut `*(t + [[K]])` ?", question: "Valeur de `*(t + [[K]])` ?", "verif.attendu": "[[R]]",
          corrige: "`t + [[K]]` est l'adresse de `t[[[K]]]`, qui vaut **[[R]]**.", indices: ["`*(t + [[K]])` est la même chose que `t[[[K]]]`.", "Compte à partir de 0."]}),
        ...E(2, {consigne: "Premier jalon, avec les crochets : écris `int somme(int t[], int n)` qui renvoie la somme, et un `main` qui lit `N` puis les `N` entiers et affiche `somme(t, n)`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Réécris `somme` avec un paramètre `int *t` et la **notation pointeur** : chaque `t[i]` devient `*(t + i)`. `main` ne change pas.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 7); return {TAB: T(R.distincts(4, 1, 9)), K: R.entre(1, 3), E0: saisie(n0, liste(R, n0, 1, 40)), E1: saisie(2, [R.entre(-20, -1), R.entre(1, 20)])}; },
      deriver: v => ({R: v.TAB.slice(1, -1).split(", ")[v.K]}),
    },
    "c8-106": {
      set: {
        enonce: "Écris `void modifier(int *tab, int taille)` (exemple du cours) qui **double** chaque élément du tableau. `main` lit `N` puis `N` entiers, appelle `modifier`, puis affiche le tableau.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : `modifier` reçoit l'adresse du tableau et sa taille. Elle travaille directement sur le tableau d'origine (pas sur une copie) : après l'appel, `main` voit les valeurs doublées.",
        ...E(0, {consigne: "Écris l'en-tête de `modifier` : elle reçoit un pointeur sur entier `tab` et un entier `taille`, et ne renvoie rien."}),
        ...E(1, {consigne: "Dans la boucle (indice `i`), écris l'instruction qui double la case `i` de `tab`."}),
        ...E(2, {consigne: "Premier jalon : écris `void modifier(int tab[], int taille)` (avec des crochets) qui double chaque case. `main` lit les `N` entiers, appelle `modifier(t, n)`, puis affiche le tableau.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Remplace le paramètre `int tab[]` par un **pointeur** `int *tab`. Le corps ne change pas : `tab[i]` marche aussi avec un pointeur.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 6); return {E0: saisie(n0, liste(R, n0, 1, 50)), E1: saisie(2, [R.entre(-9, -1), 0])}; },
    },
    "c8-107": {
      set: {
        enonce: "Écris `void min_max(int *t, int n, int *min, int *max)` qui range le minimum et le maximum du tableau dans les variables pointées par `min` et `max`. `main` lit `N` puis `N` entiers et affiche le minimum puis le maximum.\n\n" + ex("[[E0]]", "[[S4_0]]"),
        guidage: "**Plan** : une fonction ne renvoie qu'une valeur avec `return`. Pour en produire **deux**, on lui donne les adresses de deux variables de `main`, et elle écrit dedans à travers `*min` et `*max`.",
        ...E(0, {consigne: "Dans la fonction, `min` est l'adresse d'une variable de `main`. Écris l'instruction qui range la première case du tableau **dans cette variable** (à travers le pointeur)."}),
        ...E(1, {consigne: "Dans la boucle (indice `i`), écris la ligne qui remplace le minimum par `t[i]` quand `t[i]` est plus petit. Compare bien avec la **valeur** pointée, pas avec l'adresse."}),
        ...E(2, {consigne: "Dans `main`, les résultats doivent arriver dans les variables `mi` et `ma`. Écris l'appel de `min_max` (tableau `t`, taille `n`) en lui donnant ce qu'il faut pour qu'elle puisse écrire dans `mi` et `ma`."}),
        ...E(3, {consigne: "Premier jalon, sans fonction : lis `N` et les `N` entiers, puis calcule `mi` et `ma` dans `main` (les deux partent de `t[0]`) et affiche `mi ma`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Déplace le calcul dans `void min_max(int *t, int n, int *min, int *max)` : dans la fonction, `mi` devient `*min` et `ma` devient `*max`. `main` appelle `min_max(t, n, &mi, &ma);` puis affiche `mi` et `ma`.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7), n2 = R.entre(3, 5); return {E0: saisie(n0, liste(R, n0, -20, 50)), E1: saisie(1, [R.entre(1, 99)]), E2: saisie(n2, liste(R, n2, 10, 90))}; },
    },
    "c8-108": {
      set: {
        enonce: "Écris `int longueur(char *s)` qui compte les caractères d'une chaîne **en faisant avancer le pointeur** `s` jusqu'au `'\\0'`. `main` lit un mot et affiche sa longueur.\n\n" + ex("[[W0]]", "[[N0]]"),
        guidage: "**Plan** : `*s` est le caractère sur lequel `s` pointe. Tant que ce n'est pas le `'\\0'`, on compte un caractère et on fait avancer `s` d'une case.",
        ...E(0, {consigne: "Écris la condition du `while` (sans le mot `while`) qui continue tant que le caractère **pointé** par `s` n'est pas la fin de chaîne `'\\0'`."}),
        ...E(1, {consigne: "Écris l'instruction qui fait avancer le pointeur `s` d'un caractère (pour qu'il pointe sur le suivant)."}),
        ...E(2, {consigne: "Premier jalon, avec un indice : écris `int longueur(char s[])` qui avance un indice `n` tant que `s[n] != '\\0'` et renvoie `n`. `main` lit un mot (`%99s`) et affiche `longueur(mot)`.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Réécris `longueur(char *s)` sans indice : c'est le pointeur `s` lui-même qui avance (`s++`), et un compteur `n` compte les pas.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
    "c8-109": {
      set: {
        enonce: "Écris `double moyenne(const int *t, int n)` : le paramètre est déclaré `const`, car la fonction ne fait que **lire** le tableau. `main` lit `N` puis `N` entiers et affiche la moyenne avec 2 décimales.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `const int *t` : promesse de ne jamais modifier le tableau → 2. cumuler la somme → 3. diviser en **réel**.",
        ...E(0, {consigne: "Écris l'en-tête de `moyenne`, avec le paramètre `t` en **lecture seule** : le mot `const` se place devant le type des cases (`int`)."}),
        ...E(1, {consigne: "Si la fonction essaie quand même d'écrire `t[0] = 0;` alors que `t` est un `const int *`, que se passe-t-il ? (réponse courte)"}),
        ...E(2, {consigne: "Premier jalon, sans `const` : écris `double moyenne(int *t, int n)` qui renvoie la moyenne **réelle** (attention à la division entière), et un `main` qui lit les `N` entiers et l'affiche avec 2 décimales.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Ajoute la promesse de lecture seule : le paramètre devient `const int *t`. Rien d'autre ne change.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 6); let t; do t = liste(R, n0, 0, 20); while(t.reduce((a, b) => a + b, 0) % n0 === 0); return {E0: saisie(n0, t), E1: saisie(4, liste(R, 4, 1, 9))}; },
    },
    "c8-110": {
      set: {
        enonce: "Écris un programme qui lit un entier `x` et déclare **deux** pointeurs `p` et `q` vers `x`. Il ajoute 1 à `x` à travers `p`, multiplie `x` par 3 à travers `q`, puis affiche `x`, une espace, et `1` si `p == q` (même adresse), `0` sinon.\n\n" + ex("[[X]]", "[[R]] 1"),
        guidage: "**Plan** : 1. `p` et `q` reçoivent la **même** adresse `&x` → 2. `*p` et `*q` désignent la même case : chaque modification se voit par l'autre → 3. `p == q` compare les adresses.",
        ...E(0, {consigne: "Avec `x = [[X]]` et `p` qui pointe sur `x`, on exécute `*p = *p + 1;`. Que vaut `x` ensuite ?", question: "Valeur de `x` ?", "verif.attendu": "[[X1]]", corrige: "`*p` est `x` : [[X]] + 1 = **[[X1]]**.", indices: ["`*p` et `x` désignent la même case.", "[[X1]]"]}),
        ...E(1, {consigne: "Puis on exécute `*q = *q * 3;`, avec `q` qui pointe **aussi** sur `x` (qui vaut maintenant [[X1]]). Que vaut `x` ?", question: "Valeur de `x` ?", "verif.attendu": "[[R]]", corrige: "`*q` est aussi `x` : [[X1]] × 3 = **[[R]]**.", indices: ["Même case, autre pointeur.", "[[R]]"]}),
        ...E(2, {consigne: "Écris la déclaration du second pointeur `q`, qui pointe lui aussi sur `x`."}),
        ...E(3, {consigne: "Premier jalon : lis `x`, déclare `p` sur `x`, ajoute 1 à `x` **à travers `p`**, puis affiche `x`.", "verif.tests": tests("[[X]]", "0")}),
        ...E(4, {consigne: "Ajoute `q` (aussi sur `x`) : multiplie `x` par 3 **à travers `q`**. Affiche ensuite `x`, une espace, et le résultat de `p == q` (une comparaison vaut 1 ou 0).", "verif.tests": tests("[[X]]", "0", "[[Y]]")}),
      },
      tirer: R => ({X: R.entre(2, 20), Y: R.entre(-9, -1)}), deriver: v => ({X1: v.X + 1, R: 3*(v.X + 1)}),
    },
    "c8-111": {
      set: {
        enonce: "Écris un programme qui lit un entier `n` (au plus 10), puis `n` entiers rangés dans un tableau `t`, et affiche leur somme. **Sans indice `i`** : on parcourt le tableau avec un pointeur `p`, de `t` jusqu'à `t + n` exclu.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : une boucle `for (int *p = t; p < t + n; p++)`. `p` prend successivement les adresses des cases, de `t` (la première) jusqu'à `t + n` (juste **après** la dernière, donc exclue). Pour la saisie, `scanf(\"%d\", p)` : `p` est déjà une adresse.",
        ...E(0, {consigne: "Écris l'en-tête complet du `for` dans lequel un pointeur `p` part du début du tableau `t`, continue tant qu'il n'a pas atteint `t + n`, et avance d'une case à chaque tour."}),
        ...E(1, {consigne: "`scanf` a besoin de l'adresse où ranger la valeur. Or `p` **est** déjà une adresse (celle de la case courante). Écris l'instruction qui lit un entier directement dans la case pointée par `p`."}),
        ...E(2, {consigne: "Premier jalon, avec un indice : lis `n` (≤ 10) puis `n` entiers, et affiche leur somme, avec des boucles `for (int i = 0; …)` habituelles.", "verif.tests": tests("[[E0]]", "[[E1]]", "0")}),
        ...E(3, {consigne: "Supprime l'indice `i` : les deux boucles (saisie **et** somme) parcourent maintenant le tableau avec un pointeur `p`, de `t` à `t + n` exclu. Dans la somme, la valeur de la case courante est `*p`.", "verif.tests": tests("[[E0]]", "[[E1]]", "0")}),
      },
      tirer: R => { const n0 = R.entre(3, 8); return {E0: saisie(n0, liste(R, n0, -10, 40)), E1: saisie(1, [R.entre(-50, -1)])}; },
    },
    "c8-112": {
      set: {
        enonce: "Écris une fonction `int longueur(char *s)` qui renvoie la longueur d'une chaîne **sans compteur** : un pointeur `q` avance jusqu'au `'\\0'`, puis on renvoie `q - s`. Dans `main`, lis un mot et affiche sa longueur.\n\n" + ex("[[W0]]", "[[N0]]"),
        guidage: "**Plan** : 1. un pointeur `q` part de `s` (le début du mot) → 2. il avance jusqu'au `'\\0'` → 3. `q - s` donne le **nombre d'éléments** entre les deux adresses, c'est-à-dire la longueur.",
        ...E(0, {consigne: "Pour `s = \"[[W0]]\"` ([[N0]] lettres), `q` part de `s` et s'arrête sur le `'\\0'`. La différence de deux pointeurs compte les **éléments** qui les séparent. Que vaut `q - s` ?", question: "Valeur de `q - s` ?", "verif.attendu": "[[N0]]",
          corrige: "[[N0]] caractères séparent le début du mot du `'\\0'` : `q - s` vaut **[[N0]]**.", indices: ["Combien de lettres avant le `'\\0'` ?", "[[N0]]"]}),
        ...E(1, {consigne: "Écris l'instruction qui renvoie la longueur grâce à la différence des deux pointeurs (point d'arrivée moins point de départ)."}),
        ...E(2, {consigne: "Premier jalon : `char *q = s;`, puis `q` avance jusqu'au `'\\0'` pendant qu'un **compteur** `n` compte les pas ; la fonction renvoie `n`. `main` lit un mot et affiche sa longueur.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Supprime le compteur `n` : la boucle ne fait plus qu'avancer `q`, et la fonction renvoie directement `q - s`.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
  },
};
