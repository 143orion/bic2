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

/* rédaction : ce que le programme lit, ce qu'il fait, ce qu'il affiche (reformulation du 09/11/2026) */
const num = xs => xs.map((x, i) => `${i + 1}. ${x}`).join("\n");
const lit = (...xs) => "**Au clavier**, le programme reçoit dans l'ordre :\n" + num(xs);
const fait = (...xs) => "**Ce qu'il fait** :\n" + num(xs);
const affiche = s => "**Ce qu'il affiche** : " + s;
const afaire = (...xs) => "**À faire** :\n" + num(xs);
const BLOC = (...ps) => ps.filter(Boolean).join("\n\n");

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
        enonce: BLOC("Le but : modifier une variable **sans écrire son nom**, en passant uniquement par un pointeur.",
          lit("un entier, rangé dans `x`."),
          fait("déclare un pointeur `p` qui pointe sur `x` ;", "double la valeur de `x` **en n'écrivant que `p`** (jamais `x = …`) ;", "affiche `x`."),
          ex("[[X]]", "[[X2]]")),
        guidage: "**Plan** : 1. `p` reçoit l'**adresse** de `x` (`&x`) → 2. `*p` désigne alors `x` lui-même → 3. écrire dans `*p`, c'est écrire dans `x`.\n\n**Piège** : n'écris pas `x = x * 2` : l'énoncé impose de passer par `p`.",
        ...E(0, {consigne: "Un pointeur vers un `int` se déclare avec le type `int *`, et on lui donne l'**adresse** de la variable visée, obtenue avec `&`. Écris, sur une seule ligne, la déclaration de `p` qui pointe sur `x`."}),
        ...E(1, {consigne: "`*p` (avec l'étoile) désigne la variable sur laquelle `p` pointe, c'est-à-dire `x`. Écris l'instruction qui double `x` en n'écrivant que `*p` (le nom `x` ne doit pas apparaître)."}),
        ...E(2, {consigne: afaire("lis un entier dans `x` ;", "déclare `int *p = &x;` ;", "affiche la valeur de `x` **en la lisant à travers `p`** : `printf(\"%d\\n\", *p);`.") + "\n\nOn ne modifie rien pour l'instant : le programme réaffiche juste le nombre tapé.", "verif.tests": tests("[[X]]", "[[Y]]")}),
        ...E(3, {consigne: afaire("garde la lecture et la déclaration de `p` ;", "avant l'affichage, double `x` **à travers `p`** (avec `*p`) ;", "affiche `x` (la vraie variable, pour vérifier qu'elle a bien changé).") + `\n\nAvec \`[[X]]\`, le programme doit afficher \`[[X2]]\`.`, "verif.tests": tests("[[X]]", "[[Y]]", "0")}),
      },
      tirer: R => ({X: R.entre(2, 60), Y: R.entre(-30, -1)}), deriver: v => ({X2: 2*v.X}),
    },
    "c8-102": {
      set: {
        enonce: "Ce programme doit afficher la valeur de `x` ([[X]]) en passant par un pointeur `p`. Il ne compile pas : à la ligne `int *p = x;`, le pointeur reçoit une **valeur** au lieu d'une **adresse**.\n```c\n" + c102d + "\n```",
        ...E(0, {consigne: "Une variable de type `int *` ne contient pas un nombre ordinaire. Que doit-elle contenir ? (réponse courte)"}),
        ...E(1, {consigne: "Tu l'utilises déjà dans `scanf(\"%d\", &x)`. Quel opérateur, placé devant `x`, donne l'adresse de `x` ?"}),
        ...E(2, {consigne: "Corrige **uniquement** la ligne `int *p = x;` pour que `p` reçoive l'adresse de `x`. Le programme doit alors compiler et afficher `[[X]]`.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[X]]"}], nombres: true, exemple: c102, exige: [{motif: "int\\s*\\*\\s*p\\s*=\\s*&\\s*x", msg: "Un pointeur reçoit une adresse : int *p = &x;"}]}, corrige: sol(c102), depart: c102d}),
      },
      tirer: R => ({X: R.entre(2, 99)}),
    },
    "c8-103": {
      set: {
        enonce: BLOC("Le but : écrire une fonction qui renvoie l'**adresse** d'une case, puis modifier cette case à travers le pointeur.",
          "**La fonction** `int *chercher(int t[], int n, int v)` parcourt le tableau `t` (de `n` cases) et renvoie l'adresse de la **première** case qui vaut `v`, ou `NULL` si aucune case ne vaut `v`.",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs du tableau `t` ;", "la valeur cherchée `v`."),
          fait("appelle `chercher(t, n, v)` et garde le résultat dans un pointeur `r` ;", "si `r` n'est pas `NULL` : met la case trouvée à 0 **à travers `r`** (`*r = 0;`), puis affiche tout le tableau sur une ligne ;", "sinon : affiche `absent`."),
          ex("[[E0]]", "[[S4_0]]") + "\n\nIci, la valeur cherchée est la dernière ligne de l'entrée."),
        guidage: "**Plan** : 1. la fonction parcourt le tableau → 2. à la première case égale à `v`, elle renvoie son **adresse** (`&t[i]`) → 3. si la boucle se termine sans rien trouver, elle renvoie `NULL` → 4. `main` teste le résultat **avant** d'écrire dedans.\n\n**Piège** : écrire à travers un pointeur `NULL` fait planter le programme.",
        ...E(0, {consigne: "La fonction renvoie une adresse. Quand la valeur n'est nulle part, il faut renvoyer une adresse spéciale qui veut dire « nulle part ». Comment s'appelle-t-elle ? (un mot)"}),
        ...E(1, {consigne: "Dans la boucle, quand `t[i] == v`, on ne veut pas renvoyer la valeur `t[i]` (on la connaît déjà, c'est `v`), mais l'**endroit** où elle se trouve. Écris l'instruction qui renvoie l'adresse de la case `t[i]`."}),
        ...E(2, {consigne: "Dans `main`, le pointeur `r` reçoit le résultat de `chercher`. Avant d'écrire `*r = 0`, il faut vérifier que la valeur a bien été trouvée. Écris cette condition (sans le `if`)."}),
        ...E(3, {consigne: "Premier jalon, **sans fonction**, tout dans `main` :\n" + num(["déclare `int t[100], n, v;` ;", "lis `n` ;", "lis les `n` valeurs dans `t` (une boucle) ;", "lis `v` ;", "déclare `int *r = NULL;` ;", "parcours le tableau : à la première case égale à `v`, fais `r = &t[i];` puis `break;` ;", "après la boucle, si `r != NULL` : `*r = 0;` puis affiche le tableau (valeurs séparées par une espace) ; sinon affiche `absent`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Déplace la recherche (la boucle qui remplit `r`) dans la fonction :\n" + num(["écris `int *chercher(int t[], int n, int v)` avant `main` : elle renvoie `&t[i]` dès qu'elle trouve, et `NULL` après la boucle ;", "dans `main`, remplace la boucle de recherche par `int *r = chercher(t, n, v);` ;", "le reste de `main` (test de `r`, mise à 0, affichage) ne change pas."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7), a = R.distincts(n0, 1, 9), x = a[R.entre(1, n0 - 2)]; a[n0 - 1] = x; const n1 = R.entre(3, 5), b = R.distincts(n1, 1, 20); let y; do y = R.entre(1, 20); while(b.includes(y));
        const c = R.distincts(3, 1, 9); return {E0: saisie(n0, a, x), E1: saisie(n1, b, y), E2: saisie(3, c, c[0])}; },
    },
    "c8-104": {
      set: {
        enonce: BLOC("Le but : parcourir un tableau avec un **pointeur** qui avance case par case (`p++`), au lieu d'un indice.",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs, rangées dans un tableau `t`."),
          fait("affiche les `n` valeurs sur une ligne, séparées par une espace, **en lisant chaque valeur à travers un pointeur `p`** qui part du début du tableau et avance de 1 à chaque tour."),
          "Un compteur sert seulement à faire `n` tours : on ne compare pas de pointeurs.",
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. `int *p = t;` (le nom du tableau est l'adresse de sa première case) → 2. `n` fois : afficher `*p`, puis `p++` (le pointeur avance d'**une case**).",
        ...E(0, {consigne: "Le nom d'un tableau, utilisé seul, vaut l'adresse de sa première case. Écris la déclaration d'un pointeur `p` qui pointe sur le début du tableau `t`."}),
        ...E(1, {consigne: "`p` pointe sur `t[0]`. On exécute `p++`. Sur quelle case pointe-t-il maintenant ? Donne son indice. (Un pointeur avance d'une **case** entière, pas d'un octet.)"}),
        ...E(2, {consigne: "Premier jalon, sans pointeur :\n" + num(["lis `n`, puis les `n` valeurs dans `int t[100]` ;", "affiche-les avec une boucle classique (`t[i]`), séparées par une espace, puis un retour à la ligne."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Remplace seulement la boucle d'affichage :\n" + num(["avant la boucle, déclare `int *p = t;` ;", "dans la boucle (qui fait toujours `n` tours), affiche `*p` puis fais `p++` ;", "n'utilise plus `t[i]` dans l'affichage : c'est `p` qui se déplace."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7); return {E0: saisie(n0, liste(R, n0, -9, 50)), E1: saisie(1, [R.entre(1, 99)])}; },
    },
    "c8-105": {
      set: {
        enonce: BLOC("Le but : écrire `t[i]` autrement, avec un pointeur : `*(t + i)`.",
          "**La fonction** `int somme(int *t, int n)` renvoie la somme des `n` cases du tableau, en lisant chaque case avec `*(t + i)` (sans crochets).",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs du tableau."),
          affiche("la somme, calculée par `somme(t, n)`."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. `somme` reçoit un pointeur `int *t` → 2. `t + i` est l'adresse de la case `i`, et `*(t + i)` sa valeur → 3. on cumule dans `s`.",
        ...E(0, {consigne: "`t + i` est l'adresse de la case `i` (on avance de `i` cases à partir du début). Comment lire la **valeur** rangée à cette adresse ? Écris l'expression qui remplace `t[i]`, sans crochets."}),
        ...E(1, {consigne: "Si `t` pointe sur `[[TAB]]`, que vaut `*(t + [[K]])` ?", question: "Valeur de `*(t + [[K]])` ?", "verif.attendu": "[[R]]",
          corrige: "`t + [[K]]` est l'adresse de `t[[[K]]]`, qui vaut **[[R]]**.", indices: ["`*(t + [[K]])` est la même chose que `t[[[K]]]`.", "Compte à partir de 0."]}),
        ...E(2, {consigne: "Premier jalon, avec les crochets :\n" + num(["écris `int somme(int t[], int n)` qui renvoie la somme des `n` cases (avec `t[i]`) ;", "dans `main`, lis `n` puis les `n` valeurs, et affiche `somme(t, n)`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Réécris seulement la fonction :\n" + num(["son paramètre devient `int *t` ;", "chaque `t[i]` devient `*(t + i)`.", "`main` ne change pas."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 7); return {TAB: T(R.distincts(4, 1, 9)), K: R.entre(1, 3), E0: saisie(n0, liste(R, n0, 1, 40)), E1: saisie(2, [R.entre(-20, -1), R.entre(1, 20)])}; },
      deriver: v => ({R: v.TAB.slice(1, -1).split(", ")[v.K]}),
    },
    "c8-106": {
      set: {
        enonce: BLOC("Le but : une fonction qui reçoit un tableau travaille sur l'**original**, pas sur une copie.",
          "**La fonction** `void modifier(int *tab, int taille)` (exemple du cours) **double** chaque case du tableau.",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs du tableau."),
          fait("appelle `modifier(t, n)` ;", "affiche le tableau sur une ligne (valeurs séparées par une espace) : on doit voir les valeurs doublées."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**À retenir** : `modifier` reçoit l'adresse du tableau. Elle écrit directement dans les cases de `main` : après l'appel, `main` voit les valeurs doublées.",
        ...E(0, {consigne: "Écris l'en-tête de `modifier` : elle reçoit un pointeur sur entier nommé `tab` et un entier nommé `taille`, et ne renvoie rien."}),
        ...E(1, {consigne: "Dans la boucle de `modifier` (indice `i`), écris l'instruction qui double la case `i` de `tab`."}),
        ...E(2, {consigne: "Premier jalon :\n" + num(["écris `void modifier(int tab[], int taille)` (avec des crochets) qui double chaque case ;", "dans `main`, lis `n` puis les `n` valeurs, appelle `modifier(t, n)`, puis affiche le tableau."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Change seulement le paramètre de `modifier` : `int tab[]` devient `int *tab`. Le corps ne change pas (`tab[i]` fonctionne aussi avec un pointeur).", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 6); return {E0: saisie(n0, liste(R, n0, 1, 50)), E1: saisie(2, [R.entre(-9, -1), 0])}; },
    },
    "c8-107": {
      set: {
        enonce: BLOC("Le but : une fonction qui produit **deux** résultats en écrivant dans deux variables de `main`.",
          "**La fonction** `void min_max(int *t, int n, int *min, int *max)` trouve le minimum et le maximum du tableau, et les range dans les variables dont elle a reçu les adresses (`min` et `max`).",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs du tableau."),
          fait("déclare deux variables `mi` et `ma` ;", "appelle `min_max(t, n, &mi, &ma);` ;", "affiche `mi` puis `ma`, séparés par une espace."),
          ex("[[E0]]", "[[S4_0]]")),
        guidage: "**Pourquoi des adresses ?** `return` ne renvoie qu'une valeur. Pour en produire deux, la fonction reçoit les adresses de `mi` et `ma` et écrit dedans à travers `*min` et `*max`.",
        ...E(0, {consigne: "Dans la fonction, `min` contient l'adresse de la variable `mi` de `main`. Écris l'instruction qui range la première case du tableau (`t[0]`) **dans cette variable**, à travers le pointeur."}),
        ...E(1, {consigne: "Dans la boucle (indice `i`), si `t[i]` est plus petit que le minimum actuel, il le remplace. Écris cette ligne complète (`if` compris). Attention : compare avec la **valeur** pointée (`*min`), pas avec l'adresse (`min`)."}),
        ...E(2, {consigne: "Dans `main`, les résultats doivent arriver dans `mi` et `ma`. Écris l'appel de `min_max` pour le tableau `t` de taille `n`, en lui donnant les adresses de `mi` et `ma`."}),
        ...E(3, {consigne: "Premier jalon, **sans fonction**, tout dans `main` :\n" + num(["lis `n` puis les `n` valeurs ;", "`mi` et `ma` partent tous les deux de `t[0]` ;", "parcours le tableau et mets-les à jour ;", "affiche `mi ma`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Déplace le calcul dans la fonction :\n" + num(["écris `void min_max(int *t, int n, int *min, int *max)` avant `main` ; dans la fonction, `mi` devient `*min` et `ma` devient `*max` ;", "dans `main`, remplace le calcul par `min_max(t, n, &mi, &ma);` ;", "l'affichage ne change pas."]), "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n0 = R.entre(4, 7), n2 = R.entre(3, 5); return {E0: saisie(n0, liste(R, n0, -20, 50)), E1: saisie(1, [R.entre(1, 99)]), E2: saisie(n2, liste(R, n2, 10, 90))}; },
    },
    "c8-108": {
      set: {
        enonce: BLOC("Le but : compter les lettres d'un mot en faisant **avancer un pointeur** jusqu'à la fin de la chaîne.",
          "**La fonction** `int longueur(char *s)` renvoie le nombre de caractères de la chaîne `s` : un compteur augmente pendant que `s` avance (`s++`), jusqu'au `'\\0'`.",
          lit("un mot (sans espace)."),
          affiche("sa longueur, calculée par `longueur`."),
          ex("[[W0]]", "[[N0]]")),
        guidage: "**Plan** : `*s` est le caractère sur lequel `s` pointe. Tant que ce n'est pas le `'\\0'`, on compte 1 et on fait avancer `s` d'une case.",
        ...E(0, {consigne: "Écris la condition du `while` (sans le mot `while`) qui continue tant que le caractère **pointé par `s`** n'est pas la fin de chaîne `'\\0'`."}),
        ...E(1, {consigne: "Écris l'instruction qui fait avancer le pointeur `s` d'un caractère (pour qu'il pointe sur le suivant)."}),
        ...E(2, {consigne: "Premier jalon, avec un indice :\n" + num(["écris `int longueur(char s[])` : un indice `n` part de 0 et augmente tant que `s[n] != '\\0'` ; la fonction renvoie `n` ;", "dans `main`, lis un mot (`scanf(\"%99s\", mot)`) et affiche `longueur(mot)`."]), "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Réécris seulement la fonction, **sans indice** :\n" + num(["son paramètre devient `char *s` ;", "tant que `*s != '\\0'` : ajoute 1 à un compteur `n`, puis `s++` ;", "renvoie `n`."]), "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
    "c8-109": {
      set: {
        enonce: BLOC("Le but : promettre au compilateur qu'une fonction **ne modifie pas** le tableau qu'elle reçoit, avec `const`.",
          "**La fonction** `double moyenne(const int *t, int n)` renvoie la moyenne des `n` cases (avec ses décimales).",
          lit("le nombre de valeurs `n` ;", "les `n` valeurs du tableau."),
          affiche("la moyenne, avec 2 décimales."),
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : 1. `const int *t` : la fonction promet de ne jamais écrire dans le tableau → 2. cumuler la somme → 3. diviser en **réel** (sinon division entière).",
        ...E(0, {consigne: "Écris l'en-tête de `moyenne` avec le paramètre `t` en lecture seule : le mot `const` se place devant le type des cases (`int`)."}),
        ...E(1, {consigne: "Si la fonction essaie quand même d'écrire `t[0] = 0;` alors que `t` est un `const int *`, que se passe-t-il ? (réponse courte)"}),
        ...E(2, {consigne: "Premier jalon, **sans `const`** :\n" + num(["écris `double moyenne(int *t, int n)` qui renvoie la moyenne réelle (attention : `s / n` avec deux `int` est une division entière) ;", "dans `main`, lis `n` puis les `n` valeurs, et affiche `moyenne(t, n)` avec `%.2f`."]), "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Ajoute la promesse de lecture seule : le paramètre de `moyenne` devient `const int *t`. Rien d'autre ne change.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const n0 = R.entre(3, 6); let t; do t = liste(R, n0, 0, 20); while(t.reduce((a, b) => a + b, 0) % n0 === 0); return {E0: saisie(n0, t), E1: saisie(4, liste(R, 4, 1, 9))}; },
    },
    "c8-110": {
      set: {
        enonce: BLOC("Le but : voir que deux pointeurs peuvent désigner **la même** variable.",
          lit("un entier, rangé dans `x`."),
          fait("déclare deux pointeurs `p` et `q` qui pointent tous les deux sur `x` ;", "ajoute 1 à `x` **à travers `p`** ;", "multiplie `x` par 3 **à travers `q`** ;", "affiche `x`, une espace, puis la valeur de `p == q` (1 si les deux pointeurs contiennent la même adresse, 0 sinon)."),
          ex("[[X]]", "[[R]] 1")),
        guidage: "**À retenir** : `p` et `q` reçoivent la **même** adresse `&x`. `*p` et `*q` sont donc deux noms pour la même case : ce qu'on écrit par l'un se lit par l'autre.",
        ...E(0, {consigne: "Avec `x = [[X]]` et `p` qui pointe sur `x`, on exécute `*p = *p + 1;`. Que vaut `x` ensuite ?", question: "Valeur de `x` ?", "verif.attendu": "[[X1]]", corrige: "`*p` est `x` : [[X]] + 1 = **[[X1]]**.", indices: ["`*p` et `x` désignent la même case.", "[[X1]]"]}),
        ...E(1, {consigne: "Puis on exécute `*q = *q * 3;`, avec `q` qui pointe **aussi** sur `x` (qui vaut maintenant [[X1]]). Que vaut `x` ?", question: "Valeur de `x` ?", "verif.attendu": "[[R]]", corrige: "`*q` est aussi `x` : [[X1]] × 3 = **[[R]]**.", indices: ["Même case, autre pointeur.", "[[R]]"]}),
        ...E(2, {consigne: "Écris la déclaration du second pointeur `q`, qui pointe lui aussi sur `x`."}),
        ...E(3, {consigne: "Premier jalon :\n" + num(["lis un entier dans `x` ;", "déclare `int *p = &x;` ;", "ajoute 1 à `x` à travers `p` (`*p = *p + 1;`) ;", "affiche `x`."]), "verif.tests": tests("[[X]]", "0")}),
        ...E(4, {consigne: "Complète :\n" + num(["déclare `q`, qui pointe aussi sur `x` ;", "après l'ajout par `p`, multiplie `x` par 3 à travers `q` ;", "affiche `x`, une espace, puis `p == q` (avec `%d` : une comparaison vaut 1 ou 0)."]), "verif.tests": tests("[[X]]", "0", "[[Y]]")}),
      },
      tirer: R => ({X: R.entre(2, 20), Y: R.entre(-9, -1)}), deriver: v => ({X1: v.X + 1, R: 3*(v.X + 1)}),
    },
    "c8-111": {
      set: {
        enonce: BLOC("Le but : parcourir un tableau **sans aucun indice**, avec un pointeur qui va de `t` (la première case) jusqu'à `t + n` (juste après la dernière).",
          lit("le nombre de valeurs `n` (10 au plus) ;", "les `n` valeurs, rangées dans `int t[10]`."),
          affiche("la somme des `n` valeurs."),
          "Contrainte : aucune variable `i`. La saisie **et** la somme se font avec un pointeur `p`.",
          ex("[[E0]]", "[[S3_0]]")),
        guidage: "**Plan** : `for (int *p = t; p < t + n; p++)`. `p` prend successivement les adresses des cases : de `t` (la première) jusqu'à `t + n` exclu. Pour la saisie, `scanf(\"%d\", p)` : `p` est déjà une adresse, pas besoin de `&`.",
        ...E(0, {consigne: "Écris l'en-tête complet du `for` dans lequel un pointeur `p` part du début du tableau `t`, continue tant qu'il n'a pas atteint `t + n`, et avance d'une case à chaque tour."}),
        ...E(1, {consigne: "`scanf` a besoin de l'adresse où ranger la valeur. Or `p` **est** déjà l'adresse de la case courante. Écris l'instruction qui lit un entier directement dans la case pointée par `p`."}),
        ...E(2, {consigne: "Premier jalon, **avec** un indice :\n" + num(["lis `n`, puis les `n` valeurs dans `t` avec une boucle `for (int i = 0; …)` ;", "calcule leur somme avec une autre boucle sur `i` ;", "affiche la somme."]), "verif.tests": tests("[[E0]]", "[[E1]]", "0")}),
        ...E(3, {consigne: "Supprime l'indice `i` des deux boucles :\n" + num(["boucle de saisie : `for (int *p = t; p < t + n; p++) scanf(\"%d\", p);` ;", "boucle de somme : même en-tête, et on ajoute `*p` (la valeur de la case courante) à la somme."]), "verif.tests": tests("[[E0]]", "[[E1]]", "0")}),
      },
      tirer: R => { const n0 = R.entre(3, 8); return {E0: saisie(n0, liste(R, n0, -10, 40)), E1: saisie(1, [R.entre(-50, -1)])}; },
    },
    "c8-112": {
      set: {
        enonce: BLOC("Le but : obtenir la longueur d'une chaîne par une **différence de pointeurs**, sans compteur.",
          "**La fonction** `int longueur(char *s)` fait avancer un second pointeur `q` du début de `s` jusqu'au `'\\0'`, puis renvoie `q - s` : le nombre de cases entre les deux.",
          lit("un mot (sans espace)."),
          affiche("sa longueur, calculée par `longueur`."),
          ex("[[W0]]", "[[N0]]")),
        guidage: "**Plan** : 1. `char *q = s;` → 2. `q` avance jusqu'au `'\\0'` → 3. `q - s` compte les **cases** entre le début et la fin : c'est la longueur.",
        ...E(0, {consigne: "Pour `s = \"[[W0]]\"` ([[N0]] lettres), `q` part de `s` et s'arrête sur le `'\\0'`. La différence de deux pointeurs compte les **cases** qui les séparent. Que vaut `q - s` ?", question: "Valeur de `q - s` ?", "verif.attendu": "[[N0]]",
          corrige: "[[N0]] caractères séparent le début du mot du `'\\0'` : `q - s` vaut **[[N0]]**.", indices: ["Combien de lettres avant le `'\\0'` ?", "[[N0]]"]}),
        ...E(1, {consigne: "Écris l'instruction qui renvoie la longueur grâce à la différence des deux pointeurs (point d'arrivée `q` moins point de départ `s`)."}),
        ...E(2, {consigne: "Premier jalon, **avec** un compteur :\n" + num(["dans `longueur`, déclare `char *q = s;` et un compteur `n = 0` ;", "tant que `*q != '\\0'` : `q++` et `n++` ;", "renvoie `n` ;", "dans `main`, lis un mot et affiche `longueur(mot)`."]), "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
        ...E(3, {consigne: "Supprime le compteur `n` : la boucle ne fait plus qu'avancer `q`, et la fonction renvoie directement `q - s`.", "verif.tests": tests("[[W0]]", "[[W1]]", "C")}),
      },
      tirer: R => { const [W0, W1] = R.melange(MOTS); return {W0, W1, N0: W0.length}; },
    },
  },
};
