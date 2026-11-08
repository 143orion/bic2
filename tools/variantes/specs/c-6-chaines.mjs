/* Chapitre 6 : consignes réécrites + variantes (08/11/2026). Les exos 6-112 et 6-113 sont dans c-nouveaux-exos.mjs. */
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: String(e), sortie: "@auto"}));
const MOTS = ["ESILV", "Bonjour", "clavier", "souris", "octet", "Paris", "chaine", "langage", "radar", "kayak", "ecran", "tableau"];
const PHRASES = ["Bonjour ESILV", "Le langage C", "Vive les TD", "Hello World", "Salut le monde", "Je code en C", "Une ligne de texte", "Partiel de C demain", "Le C, C'EST BIEN !", "bonjour tout le monde"];
const PAL = ["radar", "kayak", "ete", "level", "rotor", "sos", "elle", "non"];
const NONPAL = ["bonjour", "ab", "chaine", "langage", "radio", "kayaks", "toto"];
const VOY = "aeiouy";
const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export default {
  banque: "programmation-c/c-6-chaines.json",
  n: 8,
  items: {
    "c6-001": {set: {enonce: "Combien de cases occupe la chaîne `\"[[W]]\"` en mémoire ?", "verif.attendu": "[[R]]", explication: "[[N]] lettres, plus le `'\\0'` qui marque la fin : **[[R]]** cases."},
      tirer: R => ({W: R.un(MOTS)}), deriver: v => ({N: v.W.length, R: v.W.length + 1})},
    "c6-004": {set: {enonce: "Combien de lettres au plus peut contenir `char [[NOM]][[[N]]];` ?", "verif.attendu": "[[R]]", explication: "Il faut garder une case pour le `'\\0'` final : [[N]] − 1 = **[[R]]** lettres."},
      tirer: R => ({NOM: R.un(["prenom", "ville", "mot", "nom", "pseudo"]), N: R.un([10, 15, 20, 30, 50, 100])}), deriver: v => ({R: v.N - 1})},
    "c6-012": {set: {enonce: "Que vaut `'[[C]]' - 'A'` ?", "verif.attendu": "[[R]]", explication: "Les codes des lettres se suivent : `'[[C]]'` est [[R]] lettres après `'A'`, donc **[[R]]**."},
      tirer: R => ({C: R.un([..."BCDEFGHJKMPRTXZ"])}), deriver: v => ({R: v.C.charCodeAt(0) - 65})},
    "c6-013": {set: {enonce: "Que vaut `'[[D]]' - '0'` ?", "verif.attendu": "[[D]]", explication: "Les codes des chiffres se suivent : `'[[D]]' - '0'` donne la **valeur** du chiffre, **[[D]]**. C'est l'astuce pour convertir un caractère chiffre en nombre."},
      tirer: R => ({D: R.entre(1, 9)})},
    "c6-014": {set: {enonce: "Quel caractère vaut `'[[C]]' - 'a' + 'A'` ? (une lettre)", "verif.attendu": ["[[M]]"], explication: "`'[[C]]' - 'a'` donne la position de la lettre dans l'alphabet ([[P]]) ; en l'ajoutant à `'A'`, on obtient la **majuscule** correspondante : **[[M]]**."},
      tirer: R => ({C: R.un([..."bcdefghkmprtwz"])}), deriver: v => ({P: v.C.charCodeAt(0) - 97, M: v.C.toUpperCase()})},
    "c6-015": {set: {enonce: "Que vaut `n` ?\n```c\nchar s[] = \"[[W]]\";\nint n = 0;\nwhile (s[n] != '\\0') n++;\n```", "verif.attendu": "[[R]]", explication: "`n` avance tant qu'on n'est pas sur le `'\\0'` : il s'arrête sur la case qui suit la dernière lettre, et vaut la longueur, **[[R]]**."},
      tirer: R => ({W: R.un(MOTS)}), deriver: v => ({R: v.W.length})},
    "c6-016": {set: {enonce: "Que vaut `strlen(\"[[P]]\")` ?", "verif.attendu": "[[R]]", explication: "`strlen` compte **tous** les caractères avant le `'\\0'`, espaces et ponctuation compris : **[[R]]**."},
      tirer: R => ({P: R.un(PHRASES)}), deriver: v => ({R: v.P.length})},
    "c6-018": {set: {enonce: "`strcmp(\"[[A]]\", \"[[B]]\")` est…", choix: ["négatif", "nul", "positif", "impossible à prévoir"], "verif.attendu": ["[[R]]"],
        explication: "`strcmp` compare lettre par lettre ; à la première différence, [[EXP]] Le résultat est donc **[[R]]**."},
      tirer: R => R.un([["chat", "chien"], ["arbre", "avion"], ["zebre", "zero"], ["lune", "lapin"], ["porte", "pomme"], ["table", "tableau"], ["merci", "mercredi"], ["soleil", "sol"]].map(([A, B]) => ({A, B}))),
      deriver: v => { const c = cmp(v.A, v.B); let i = 0; while(v.A[i] === v.B[i]) i++;
        return {R: c < 0 ? "négatif" : c > 0 ? "positif" : "nul", EXP: v.A[i] === undefined ? `« ${v.A} » s'arrête avant « ${v.B} » (le plus court est le plus petit).` : v.B[i] === undefined ? `« ${v.B} » s'arrête avant « ${v.A} » (le plus court est le plus petit).` : `\`'${v.A[i]}'\` est ${c < 0 ? "avant" : "après"} \`'${v.B[i]}'\` dans l'alphabet.`}; }},
    "c6-019": {set: {enonce: "Que contient `d` ?\n```c\nchar d[30];\nstrcpy(d, \"[[A]]\");\nstrcat(d, \"[[B]]\");\n```", "verif.attendu": ["[[A]][[B]]"], explication: "`strcpy` met « [[A]] » dans `d` (en écrasant tout), puis `strcat` **ajoute** « [[B]] » à la fin : **[[A]][[B]]**."},
      tirer: R => R.un([["BIC", "2.exe"], ["Bon", "jour"], ["Programm", "ation"], ["ESI", "LV"], ["porte", "-cle"], ["super", "marche"], ["arc-en", "-ciel"]].map(([A, B]) => ({A, B})))},

    "c6-101": {set: {
        enonce: "**Sans fonction prédéfinie** (`islower`, `isupper`, `ctype.h`… interdits) : écris un programme qui lit une ligne de texte et affiche le nombre de **lettres minuscules**, puis le nombre de **lettres majuscules**. (Tableaux_chainex, intermédiaire ex. 12)\n\n" + ex("[[P]]", "[[S3_0]]"),
        guidage: "**Idée** : les codes des lettres se suivent. Un caractère `c` est une minuscule s'il est entre `'a'` et `'z'`, une majuscule s'il est entre `'A'` et `'Z'`. On parcourt la ligne jusqu'au `'\\0'`.",
        ...E(0, {consigne: "Compte à la main : combien de lettres **minuscules** contient `[[P]]` ?", "verif.attendu": "[[MIN]]", corrige: "**[[MIN]]** minuscules (les espaces et la ponctuation ne comptent pas).", indices: ["Ne compte ni les majuscules, ni les espaces, ni la ponctuation.", "[[MIN]]"]}),
        ...E(1, {consigne: "Écris la condition (sans `if`) qui est vraie quand le caractère `c` est une lettre minuscule, en le comparant à `'a'` et `'z'`."}),
        ...E(2, {consigne: "Premier jalon : lis la ligne avec `fgets`, parcours-la jusqu'au `'\\0'`, et affiche seulement le nombre de minuscules.", "verif.tests": tests("[[P]]\n", "[[Q]]\n")}),
        ...E(3, {consigne: "Compte aussi les **majuscules** (entre `'A'` et `'Z'`) et affiche les deux nombres : `minuscules majuscules`.", "verif.tests": tests("[[P]]\n", "[[Q]]\n", "abc\n")}),
      }, tirer: R => { const [P, Q] = R.melange(PHRASES); return {P, Q}; }, deriver: v => ({MIN: [...v.P].filter(c => c >= "a" && c <= "z").length})},
    "c6-102": {set: {
        enonce: "Écris un programme qui lit une ligne (avec `fgets`) et affiche sa longueur, **sans utiliser `strlen`**. Le `'\\n'` que `fgets` garde à la fin ne compte pas.\n\n" + ex("[[P]]", "[[N]]"),
        ...E(0, {consigne: "`fgets` lit `[[W]]` puis la touche Entrée, et garde le `'\\n'` dans la chaîne, juste après la dernière lettre. À quel indice se trouve ce `'\\n'` ?", "verif.attendu": "[[NW]]", corrige: "Les [[NW]] lettres occupent les indices 0 à [[NW1]] : le `'\\n'` est à l'indice **[[NW]]**.", indices: ["Compte les lettres : les indices commencent à 0.", "[[NW]]"]}),
        ...E(1, {consigne: "Écris la condition du `while` (indice `n`, chaîne `s`) qui continue tant que `s[n]` n'est **ni** le `'\\0'` **ni** le `'\\n'`."}),
        ...E(2, {consigne: "Premier jalon : lis une ligne avec `fgets` et compte les caractères jusqu'au `'\\0'` (le `'\\n'` est encore compté à ce stade, c'est normal).", "verif.tests": tests("[[P]]\n", "[[W]]\n", "\n")}),
        ...E(3, {consigne: "Arrête aussi la boucle sur le `'\\n'`, pour qu'il ne soit plus compté.", "verif.tests": tests("[[P]]\n", "[[W]]\n", "\n")}),
      }, tirer: R => ({P: R.un(PHRASES), W: R.un(MOTS)}), deriver: v => ({N: v.P.length, NW: v.W.length, NW1: v.W.length - 1})},
    "c6-103": {set: {
        enonce: "Écris un programme qui lit une ligne avec `fgets`, **retire le `'\\n'` final**, puis l'affiche entre crochets.\n\n" + ex("[[P]]", "[[[P]]]"),
        ...E(0, {consigne: "`fgets` lit `[[P]]` puis Entrée. `strcspn(s, \"\\n\")` donne l'indice du premier `'\\n'` de la chaîne. Que vaut-il ?", "verif.attendu": "[[N]]", corrige: "Le `'\\n'` suit les [[N]] caractères de la ligne : indice **[[N]]**.", indices: ["C'est la longueur de la ligne, espaces compris.", "[[N]]"]}),
        ...E(1, {consigne: "Pour couper la chaîne à cet endroit, on remplace ce `'\\n'` par la fin de chaîne `'\\0'`. Écris cette instruction, avec `strcspn` comme indice."}),
        ...E(2, {consigne: "Premier jalon : lis une ligne avec `fgets` et affiche-la entre crochets **sans** retirer le `'\\n'`. Regarde où atterrit le `]`.", "verif.tests": tests("[[P]]\n", "C\n")}),
        ...E(3, {consigne: "Ajoute, juste après le `fgets`, l'instruction qui retire le `'\\n'` : le `]` doit rester sur la même ligne que le texte.", "verif.tests": tests("[[P]]\n", "C\n", "[[Q]]\n")}),
      }, tirer: R => { const [P, Q] = R.melange(PHRASES); return {P, Q}; }, deriver: v => ({N: v.P.length})},
    "c6-104": {set: {
        enonce: "Écris un programme qui lit un prénom puis un nom (deux mots), construit dans un tableau `complet` la chaîne `Prénom Nom` avec `strcpy` et `strcat`, puis affiche `complet` et sa longueur.\n\n" + ex("[[PR]] [[NO]]", "[[PR]] [[NO]] [[L]]"),
        ...E(0, {consigne: "On commence par mettre le prénom dans `complet`. Comme on ne peut pas faire `complet = prenom` avec des tableaux, on copie avec `strcpy` (destination d'abord). Écris cette instruction."}),
        ...E(1, {consigne: "Ensuite on **ajoute** une espace à la fin de `complet` avec `strcat`. Écris cette instruction."}),
        ...E(2, {consigne: "Pour `[[PR]]` et `[[NO]]`, quelle est la longueur de `[[PR]] [[NO]]` (espace comprise) ?", "verif.attendu": "[[L]]", corrige: "[[LP]] + 1 + [[LN]] = **[[L]]**.", indices: ["Lettres du prénom + l'espace + lettres du nom.", "[[L]]"]}),
        ...E(3, {consigne: "Premier jalon : lis le prénom et le nom (`scanf`), construis `complet` avec `strcpy` puis deux `strcat` (l'espace, puis le nom), et affiche seulement `complet`.", "verif.tests": tests("[[PR]] [[NO]]", "[[E1]]")}),
        ...E(4, {consigne: "Affiche aussi la **longueur** de `complet` après la chaîne (avec `strlen`, converti en `int`).", "verif.tests": tests("[[PR]] [[NO]]", "[[E1]]")}),
      }, tirer: R => { const p = [["Ada", "Lovelace"], ["Dennis", "Ritchie"], ["Alan", "Turing"], ["Grace", "Hopper"], ["Linus", "Torvalds"], ["Margaret", "Hamilton"], ["Ken", "Thompson"]]; const [[PR, NO], b] = R.melange(p); return {PR, NO, E1: b.join(" ")}; },
      deriver: v => ({LP: v.PR.length, LN: v.NO.length, L: v.PR.length + 1 + v.NO.length})},
    "c6-105": {set: {
        enonce: "Écris un programme qui lit deux mots et affiche `avant` si le premier vient avant le second dans l'ordre alphabétique (au sens de `strcmp`), `apres` s'il vient après, `egal` s'ils sont identiques.\n\n" + ex("[[A]] [[B]]", "[[S3_0]]"),
        ...E(0, {consigne: "`strcmp(\"[[A]]\", \"[[B]]\")` est-il `negatif`, `nul` ou `positif` ? (Négatif si le premier vient **avant** dans l'alphabet.)", "verif.attendu": ["[[R]]"], corrige: "« [[A]] » vient [[AV]] « [[B]] » : le résultat est **[[R]]**.", indices: ["Compare lettre par lettre jusqu'à la première différence.", "[[R]]"]}),
        ...E(1, {consigne: "Que renvoie `strcmp` quand les deux chaînes sont exactement identiques ?"}),
        ...E(2, {consigne: "Premier jalon : lis deux mots et affiche `egal` s'ils sont identiques, `different` sinon (avec `strcmp`).", "verif.tests": tests("c c", "[[A]] [[B]]")}),
        ...E(3, {consigne: "Distingue maintenant les trois cas selon le signe de `strcmp` : négatif → `avant`, positif → `apres`, nul → `egal`.", "verif.tests": tests("[[A]] [[B]]", "[[B]] [[A]]", "c c")}),
      }, tirer: R => { const [A, B] = R.melange(["chat", "chien", "arbre", "zebre", "lune", "maison", "avion", "pomme", "porte", "table"]); return {A, B}; },
      deriver: v => ({R: v.A < v.B ? "negatif" : "positif", AV: v.A < v.B ? "avant" : "après"})},
    "c6-106": {set: {
        enonce: "Écris un programme qui lit un mot et l'affiche à l'envers.\n\n" + ex("[[W]]", "[[INV]]"),
        ...E(0, {consigne: "`[[W]]` a [[N]] lettres. Les indices commencent à 0 : quel est l'indice de sa **dernière** lettre ?", "verif.attendu": "[[N1]]", corrige: "[[N]] lettres → indices 0 à **[[N1]]**.", indices: ["Longueur moins 1.", "[[N1]]"]}),
        ...E(1, {consigne: "Écris l'en-tête du `for` (variable `i`) qui **descend** de la dernière case (`n - 1`) jusqu'à la première (0) incluse."}),
        ...E(2, {consigne: "Premier jalon : lis un mot (`%99s`) et affiche sa longueur `n` (avec `strlen`).", "verif.tests": tests("[[W]]", "a", "[[W2]]")}),
        ...E(3, {consigne: "Affiche maintenant le mot à l'envers : la boucle descendante affiche `s[i]` avec `%c`, puis un retour à la ligne après la boucle.", "verif.tests": tests("[[W]]", "a", "[[W2]]")}),
      }, tirer: R => { const [W, W2] = R.melange(MOTS); return {W, W2}; }, deriver: v => ({N: v.W.length, N1: v.W.length - 1, INV: [...v.W].reverse().join("")})},
    "c6-107": {set: {
        enonce: "Un **palindrome** se lit pareil dans les deux sens (comme `radar`). Écris un programme qui lit un mot et affiche `oui` si c'est un palindrome, `non` sinon.\n\n" + ex("[[W]]", "[[RW]]"),
        guidage: "**Idée** : on compare la première lettre avec la dernière, la deuxième avec l'avant-dernière, etc. Dès qu'une paire diffère, ce n'est pas un palindrome.",
        ...E(0, {consigne: "Pour un mot de longueur `n`, la lettre `s[0]` se compare à `s[n - 1]`, `s[1]` à `s[n - 2]`… Écris l'expression de la lettre à comparer avec `s[i]`."}),
        ...E(1, {consigne: "Pour un mot de [[L]] lettres, combien de paires faut-il comparer ? (Si le mot a une longueur impaire, la lettre du milieu n'a pas de vis-à-vis.)", "verif.attendu": "[[NP]]", corrige: "[[L]] / 2 en division entière : **[[NP]]** paires.", indices: ["La moitié de la longueur, arrondie en dessous.", "[[NP]]"]}),
        ...E(2, {consigne: "Premier jalon : lis un mot et affiche sa **première** et sa **dernière** lettre, séparées par une espace.", "verif.tests": tests("[[W]]", "[[X]]")}),
        ...E(3, {consigne: "Compare toutes les paires `s[i]` / `s[n - 1 - i]` pour `i` de 0 à `n / 2` (exclu). Un indicateur à 1 au départ passe à 0 dès qu'une paire diffère ; affiche `oui` ou `non` à la fin.", "verif.tests": tests("[[W]]", "[[X]]", "ab", "[[Y]]")}),
      }, tirer: R => { const W = R.un([...PAL, ...NONPAL]); return {W, X: R.un(PAL), Y: R.un(NONPAL), L: R.entre(4, 9)}; },
      deriver: v => ({RW: [...v.W].reverse().join("") === v.W ? "oui" : "non", NP: Math.floor(v.L / 2)})},
    "c6-108": {set: {
        enonce: "Écris un programme qui lit une ligne et affiche le nombre de **voyelles minuscules** qu'elle contient (`a e i o u y`).\n\n" + ex("[[P]]", "[[NV]]"),
        ...E(0, {consigne: "Combien de voyelles (`a e i o u y`) contient `[[W]]` ?", "verif.attendu": "[[NW]]", corrige: "**[[NW]]** voyelle(s) : [[LV]].", indices: ["N'oublie pas le `y`.", "[[NW]]"]}),
        ...E(1, {consigne: "Écris la condition vraie quand le caractère `c` est la lettre `a` **ou** la lettre `e` (« ou » s'écrit `||`). Pour les six voyelles, il suffira d'allonger la liste."}),
        ...E(2, {consigne: "Premier jalon : lis une ligne avec `fgets` et affiche le nombre de lettres `e` qu'elle contient.", "verif.tests": tests("[[P]]\n", "rythme\n")}),
        ...E(3, {consigne: "Compte toutes les voyelles minuscules `a e i o u y`, pas seulement les `e`.", "verif.tests": tests("[[P]]\n", "rythme\n", "xyz\n")}),
      }, tirer: R => ({P: R.un(PHRASES), W: R.un(MOTS.map(m => m.toLowerCase()))}),
      deriver: v => { const vs = [...v.W].filter(c => VOY.includes(c)); return {NV: [...v.P].filter(c => VOY.includes(c)).length, NW: vs.length, LV: vs.join(", ")}; }},
    "c6-109": {set: {
        enonce: "Sans `toupper` : écris un programme qui lit une ligne et l'affiche **en majuscules** (seules les lettres minuscules changent, le reste est recopié tel quel).\n\n" + ex("[[P]]", "[[UP]]"),
        ...E(0, {consigne: "Que vaut `'[[C]]' - 'a'` ? (C'est la position de la lettre dans l'alphabet, en partant de 0.)", "verif.attendu": "[[PC]]", corrige: "`'[[C]]'` est la lettre n° [[PC1]], donc **[[PC]]** en partant de 0.", indices: ["`'a' - 'a'` vaut 0, `'b' - 'a'` vaut 1…", "[[PC]]"]}),
        ...E(1, {consigne: "En ajoutant cette position à `'A'`, on tombe sur la majuscule correspondante. Écris l'expression qui donne la majuscule de la minuscule `s[i]`."}),
        ...E(2, {consigne: "Premier jalon : lis une ligne (en retirant son `'\\n'`) et réaffiche-la **telle quelle**.", "verif.tests": tests("[[P]]\n", "[[Q]]\n")}),
        ...E(3, {consigne: "Avant l'affichage, parcours la ligne et remplace chaque lettre minuscule par sa majuscule (les autres caractères ne changent pas).", "verif.tests": tests("[[P]]\n", "[[Q]]\n")}),
      }, tirer: R => { const [P, Q] = R.melange(PHRASES); return {P, Q, C: R.un([..."cdfhkmrtwz"])}; },
      deriver: v => ({UP: v.P.replace(/[a-z]/g, c => c.toUpperCase()), PC: v.C.charCodeAt(0) - 97, PC1: v.C.charCodeAt(0) - 96})},
    "c6-110": {set: {
        enonce: "Ce programme lit un mot et doit afficher `ok` si c'est `secret`, `refuse` sinon. Il refuse toujours, même quand on tape `secret`.\n```c\n#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char mot[50];\n    scanf(\"%49s\", mot);\n    if (mot == \"secret\") {\n        printf(\"ok\\n\");\n    } else {\n        printf(\"refuse\\n\");\n    }\n    return 0;\n}\n```",
        ...E(0, {consigne: "Un nom de tableau seul, comme une chaîne entre guillemets, désigne en réalité l'endroit où les caractères sont rangés. Alors que compare `mot == \"secret\"` ? (réponse courte)"}),
        ...E(1, {consigne: "Quelle fonction de `string.h` compare le **contenu** de deux chaînes, caractère par caractère ?"}),
        ...E(2, {consigne: "Que renvoie cette fonction quand les deux chaînes sont **égales** ?"}),
        ...E(3, {consigne: "Corrige la condition du `if` avec `strcmp` pour que `secret` soit accepté (et lui seul : `Secret` avec une majuscule doit être refusé).", "verif.tests": tests("secret", "Secret", "[[X]]")}),
      }, tirer: R => ({X: R.un(["1234", "motdepasse", "secrets", "SECRET", "admin", "secre"])})},
    "c6-111": {set: {
        enonce: "Écris un programme qui lit un caractère `c`, puis une ligne de texte (sur la ligne suivante), et affiche le nombre de fois où `c` apparaît dans la ligne.\n\n" + ex("[[C]]\n[[P]]", "[[N]]"),
        ...E(0, {consigne: "Après `scanf(\" %c\", &c)`, la touche Entrée tapée après le caractère est restée en attente. Quel caractère est-ce ? (`fgets` s'arrêterait dessus immédiatement si on ne le consommait pas.)"}),
        ...E(1, {consigne: "Écris la condition (sans `if`) vraie quand le caractère `s[i]` est égal au caractère cherché `c`."}),
        ...E(2, {consigne: "Premier jalon : lis le caractère `c`, consomme le `'\\n'` qui reste (par exemple avec `getchar();`), lis la ligne avec `fgets`, et affiche simplement le **premier caractère** de la ligne.", "verif.tests": tests("[[C]]\n[[P]]\n", "z\nabc\n")}),
        ...E(3, {consigne: "Compte maintenant les **occurrences** de `c` dans toute la ligne (jusqu'au `'\\0'`) et affiche ce nombre.", "verif.tests": tests("[[C]]\n[[P]]\n", "z\nabc\n", "[[C2]]\n[[Q]]\n")}),
      }, tirer: R => { const [P, Q] = R.melange(PHRASES); const lettres = [...new Set(P.replace(/[^a-z]/g, ""))]; return {P, Q, C: R.un(lettres), C2: R.un([..."eoa"])}; },
      deriver: v => ({N: [...v.P].filter(c => c === v.C).length})},
  },
};
