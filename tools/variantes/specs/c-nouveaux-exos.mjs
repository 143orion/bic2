/* 08/11/2026 : un exo guidé pour chaque notion qui n'en avait pas (1.1, 3.1, 6.1, 6.2, 7.4, 8.1, 9.1, 9.2, 9.3, 10.1), avec variantes. */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const cC = (code, v = {}) => Object.assign({mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: code}, v);
const exo = (id, notion, titre, duree, enonce, guidage, etapes) => ({id, type: "exo", notion, origine: "cours", titre, enonce, guidage, duree, etapes});
const st = (o, final) => Object.assign(final ? {} : {guideSeul: true}, o);
const rgx = (motif, exemple, flags) => Object.assign({mode: "regex", motif, exemple}, flags != null ? {flags} : {});

/* ---------- 1.1 : du code source à l'exécutable ---------- */
const c1ok = `#include <stdio.h>

int main(void) {
    printf("[[MSG]]\\n");
    return 0;
}`;
const c1 = exo("c1-105", "1.1", "Ça ne compile pas !", 3,
  "Tu as tapé ce programme dans le fichier `[[F]].c`. Il doit afficher `[[MSG]]`, mais la **compilation** échoue à cause d'une faute de frappe.\n```c\n[[BUG]]\n```",
  "**Plan** : 1. retrouver ce que produit la commande de compilation → 2. comprendre à quel moment une faute de frappe est repérée → 3. corriger la faute et lancer le programme.\n\n**À retenir** : tant que le code ne compile pas, il n'y a pas d'exécutable, donc rien ne s'exécute.",
  [st({consigne: "Pour compiler, on tape `gcc [[F]].c -o [[X]]`. L'option `-o` donne le nom du fichier produit. Comment s'appelle le programme exécutable obtenu ?",
      question: "Nom de l'exécutable ?", verif: {mode: "exact", attendu: ["[[X]]", "./[[X]]"]}, duree: 0.5,
      corrige: "`-o [[X]]` : l'exécutable s'appelle **[[X]]**, et on le lance avec `./[[X]]`.", indices: ["Regarde ce qui suit `-o`."]}),
   st({consigne: "La faute de frappe dans ce programme sera-t-elle signalée **à la compilation** ou **à l'exécution** ? (réponds « compilation » ou « exécution »)",
      question: "Quand la faute est-elle repérée ?", verif: {mode: "exact", attendu: ["compilation", "a la compilation", "à la compilation"]}, duree: 0.5,
      corrige: "Une faute de syntaxe est repérée **à la compilation** : le compilateur refuse de produire l'exécutable, donc le programme ne démarre même pas.", indices: ["Le compilateur lit tout le code avant de produire quoi que ce soit.", "Compilation."]}),
   st({consigne: "Corrige la faute pour que le programme compile, puis exécute-le : il doit afficher `[[MSG]]`.\n\nLe bouton **Exécuter** fait les deux étapes pour toi (compiler, puis lancer). S'il y a une erreur, lis bien le message : il donne le numéro de la ligne.",
      question: "Corrige le programme.", verif: cC(c1ok), depart: "[[BUG]]", duree: 2, corrige: sol(c1ok) + "\n\nLa faute : [[QUOI]].",
      indices: ["Lance-le une première fois pour lire le message d'erreur : il indique la ligne fautive.", "[[QUOI_MAJ]]"]}, true)]);

/* ---------- 3.1 : printf, séquences d'échappement ---------- */
const c3a = `#include <stdio.h>

int main(void) {
    printf("Fiche \\"[[NOM]]\\"\\n");
    return 0;
}`;
const c3b = `#include <stdio.h>

int main(void) {
    int age = [[AGE]];
    int progression = [[P]];
    printf("Fiche \\"[[NOM]]\\"\\n");
    printf("Age : %d ans\\n", age);
    printf("Progression : %d%%\\n", progression);
    return 0;
}`;
const c3 = exo("c3-108", "3.1", "Fiche d'identité", 4,
  "Écris un programme qui déclare `int age = [[AGE]];` et `int progression = [[P]];`, puis affiche exactement ces trois lignes, en utilisant les variables pour les nombres :\n```text\n[[SORTIE]]\n```",
  "**Plan** : 1. savoir écrire un guillemet dans un texte → 2. savoir écrire le signe `%` → 3. un `printf` par ligne, avec `%d` pour chaque variable.\n\n**Piège** : le retour à la ligne n'est jamais automatique, chaque ligne finit par `\\n`.",
  [st({consigne: "Dans `printf(\"…\")`, le texte est entouré de guillemets. Pour **afficher** un guillemet sans fermer le texte, on le précède d'un caractère spécial. Écris cette séquence (deux caractères).",
      question: "Séquence pour afficher un guillemet ?", verif: rgx('\\\\"', '\\"'), duree: 0.4,
      corrige: "`\\\"` : la barre oblique inversée annonce un caractère spécial, ici le guillemet.", indices: ["C'est la même barre que dans `\\n`.", "`\\\"`"]}),
   st({consigne: "Dans un `printf`, `%` annonce un emplacement pour une valeur (`%d`…). Comment écrire un vrai signe `%` dans le texte affiché ?",
      question: "Comment afficher `%` ?", verif: rgx("%%", "%%"), duree: 0.4,
      corrige: "`%%` affiche un seul `%`.", indices: ["On double le caractère.", "`%%`"]}),
   st({consigne: "Commence par la première ligne seulement : `Fiche \"[[NOM]]\"`, guillemets compris.",
      question: "Affiche la première ligne.", verif: cC(c3a), duree: 1.2, corrige: sol(c3a),
      indices: ["Les guillemets à afficher s'écrivent `\\\"` dans le texte.", "`printf(\"Fiche \\\"[[NOM]]\\\"\\n\");`"]}),
   st({consigne: "Ajoute les deux variables et les deux lignes suivantes :\n```text\nAge : [[AGE]] ans\nProgression : [[P]]%\n```\nLes nombres doivent venir des variables (`%d`), pas être écrits en dur dans le texte.",
      question: "Écris le programme complet.", verif: cC(c3b, {exige: [{motif: "%d[^\"]*\"\\s*,\\s*age", brut: true, msg: "Affiche l'âge avec %d et la variable age."}, {motif: "%%", brut: true, msg: "Pour afficher le signe %, écris %% dans le texte."}]}), duree: 2, depart: c3a, corrige: sol(c3b),
      indices: ["Un `printf` par ligne : `printf(\"Age : %d ans\\n\", age);`.", "Pour la dernière ligne : `printf(\"Progression : %d%%\\n\", progression);`"]}, true)]);

/* ---------- 6.1 : une chaîne finit par '\0' ---------- */
const c61 = `#include <stdio.h>

int main(void) {
    char mot[] = "[[MOT]]";
    int n = 0;
    while (mot[n] != '\\0') {
        n++;
    }
    printf("%d caracteres, %d cases\\n", n, n + 1);
    return 0;
}`;
const c61a = `#include <stdio.h>

int main(void) {
    char mot[] = "[[MOT]]";
    int n = 0;
    while (mot[n] != '\\0') {
        n++;
    }
    printf("%d\\n", n);
    return 0;
}`;
const c6a = exo("c6-112", "6.1", "Où s'arrête la chaîne ?", 4,
  "Écris un programme qui part de `char mot[] = \"[[MOT]]\";` et compte **lui-même** ses caractères, en avançant case par case jusqu'au `'\\0'` (sans `strlen`). Il affiche ensuite le nombre de caractères visibles et le nombre de cases occupées :\n```text\n[[SORTIE]]\n```",
  "**Plan** : 1. combien de cases pour ce mot ? → 2. quelle condition arrête le parcours ? → 3. compter, puis afficher les deux nombres.\n\n**À retenir** : le `'\\0'` est la seule façon de savoir où finit le texte.",
  [st({consigne: "Le mot `\"[[MOT]]\"` a [[N]] lettres. Combien de **cases** occupe-t-il dans le tableau `mot` ?",
      question: "Nombre de cases occupées ?", verif: {mode: "numerique", attendu: "[[N1]]"}, duree: 0.4,
      corrige: "[[N]] lettres + le `'\\0'` final = **[[N1]]** cases.", indices: ["N'oublie pas le caractère invisible de la fin.", "[[N]] + 1."]}),
   st({consigne: "On avance avec un indice `n` tant qu'on n'a pas atteint la fin du texte. Écris seulement la **condition** du `while` qui continue tant que la case `mot[n]` n'est pas le caractère de fin.",
      question: "Condition du `while` ?", verif: rgx("\\(?\\s*mot\\s*\\[\\s*n\\s*\\]\\s*!=\\s*('\\\\0'|0)\\s*\\)?|\\(?\\s*mot\\s*\\[\\s*n\\s*\\]\\s*\\)?", "mot[n] != '\\0'"), duree: 0.5,
      corrige: "`mot[n] != '\\0'` : on continue tant qu'on n'est pas sur le marqueur de fin.", indices: ["Le caractère de fin s'écrit `'\\0'`.", "`mot[n] != '\\0'`"]}),
   st({consigne: "Compte les caractères : `n` part de 0 et augmente tant que `mot[n]` n'est pas `'\\0'`. Affiche seulement `n`.",
      question: "Compte les caractères.", verif: cC(c61a, {interdit: [{motif: "strlen", msg: "Sans strlen : avance case par case jusqu'au '\\0'."}]}), duree: 1.3, corrige: sol(c61a),
      indices: ["`int n = 0;` puis `while (…) { n++; }`.", "`while (mot[n] != '\\0') { n++; }` puis `printf(\"%d\\n\", n);`"]}),
   st({consigne: "Termine : affiche sur une ligne `[[SORTIE]]`, c'est-à-dire le nombre de caractères puis le nombre de cases (une de plus, pour le `'\\0'`).",
      question: "Écris le programme complet.", verif: cC(c61, {interdit: [{motif: "strlen", msg: "Sans strlen : avance case par case jusqu'au '\\0'."}]}), duree: 1.8, depart: c61a, corrige: sol(c61),
      indices: ["Le nombre de cases, c'est `n + 1`.", "`printf(\"%d caracteres, %d cases\\n\", n, n + 1);`"]}, true)]);

/* ---------- 6.2 : initialiser une chaîne case par case ---------- */
const c62a = `#include <stdio.h>

int main(void) {
    char sigle[] = "[[S]]";
    printf("%s\\n", sigle);
    return 0;
}`;
const c62 = `#include <stdio.h>

int main(void) {
    char sigle[4];
    sigle[0] = '[[C0]]';
    sigle[1] = '[[C1]]';
    sigle[2] = '[[C2]]';
    sigle[3] = '\\0';
    printf("%s\\n", sigle);
    return 0;
}`;
const c6b = exo("c6-113", "6.2", "Un sigle lettre par lettre", 4,
  "Écris un programme qui déclare `char sigle[4];`, le remplit **case par case** pour qu'il contienne la chaîne `\"[[S]]\"`, puis l'affiche avec `printf(\"%s\\n\", sigle);`.\n\nInterdit d'écrire `sigle = \"[[S]]\"` : on construit la chaîne à la main.",
  "**Plan** : 1. combien de cases faut-il ? → 2. que mettre dans la dernière ? → 3. remplir les cases une par une, puis afficher.\n\n**Piège** : sans le `'\\0'` final, `printf` ne sait pas où s'arrêter.",
  [st({consigne: "La chaîne `\"[[S]]\"` a 3 lettres. Combien de cases faut-il **au minimum** pour la ranger dans un tableau de `char` ?",
      question: "Nombre minimum de cases ?", verif: {mode: "numerique", attendu: 4}, duree: 0.4,
      corrige: "3 lettres + le `'\\0'` = **4** cases.", indices: ["Une chaîne se termine toujours par un caractère invisible.", "3 + 1."]}),
   st({consigne: "Après avoir rangé les 3 lettres dans `sigle[0]`, `sigle[1]` et `sigle[2]`, il faut marquer la fin de la chaîne dans la dernière case. Écris cette instruction.",
      question: "Instruction qui termine la chaîne ?", verif: rgx("sigle\\s*\\[\\s*3\\s*\\]\\s*=\\s*('\\\\0'|0)\\s*;", "sigle[3] = '\\0';"), duree: 0.5,
      corrige: "`sigle[3] = '\\0';` : la case d'indice 3 reçoit le caractère nul.", indices: ["La dernière case a l'indice 3.", "`sigle[3] = '\\0';`"]}),
   st({consigne: "Pour voir le résultat attendu, commence par la forme la plus simple : déclare `char sigle[] = \"[[S]]\";` (le compilateur ajoute le `'\\0'` tout seul) et affiche-la avec `%s`.",
      question: "Déclare et affiche le sigle.", verif: cC(c62a), duree: 1, corrige: sol(c62a),
      indices: ["`%s` affiche une chaîne.", "`printf(\"%s\\n\", sigle);`"]}),
   st({consigne: "Maintenant, à la main : déclare `char sigle[4];`, range chaque lettre dans sa case (`sigle[0] = '[[C0]]';`…), mets le `'\\0'` dans la dernière, puis affiche.\n\nUn caractère seul s'écrit entre **apostrophes** : `'[[C0]]'`, pas `\"[[C0]]\"`.",
      question: "Écris le programme complet.", verif: cC(c62, {exige: [{motif: "\\[\\s*3\\s*\\]\\s*=\\s*('\\\\0'|0)\\s*;", brut: true, msg: "N'oublie pas de terminer la chaîne : sigle[3] = '\\0';"}], interdit: [{motif: "sigle\\s*\\[\\s*\\d*\\s*\\]\\s*=\\s*\"", brut: true, msg: "Remplis le tableau case par case, sans = \"…\"."}, {motif: "strcpy", msg: "Remplis le tableau case par case, sans strcpy."}]}), duree: 2.1, depart: c62a, corrige: sol(c62),
      indices: ["Quatre affectations : trois lettres, puis `sigle[3] = '\\0';`.", "`sigle[0] = '[[C0]]'; sigle[1] = '[[C1]]'; sigle[2] = '[[C2]]'; sigle[3] = '\\0';`"]}, true)]);

/* ---------- 7.4 : passage par valeur ---------- */
const c74d = `#include <stdio.h>

void [[F]](int x) {
    x = x + [[K]];
}

int main(void) {
    int [[V]];
    scanf("%d", &[[V]]);
    [[F]]([[V]]);
    printf("%d\\n", [[V]]);
    return 0;
}`;
const c74 = `#include <stdio.h>

int [[F]](int x) {
    return x + [[K]];
}

int main(void) {
    int [[V]];
    scanf("%d", &[[V]]);
    [[V]] = [[F]]([[V]]);
    printf("%d\\n", [[V]]);
    return 0;
}`;
const c7 = exo("c7-114", "7.4", "La fonction qui ne change rien", 4,
  "Ce programme lit `[[V]]` puis appelle `[[F]]` pour lui ajouter [[K]] [[UNITE]]. Il devrait afficher la nouvelle valeur, mais il réaffiche toujours celle de départ.\n```c\n" + c74d + "\n```\n" + ex("[[A]]", "[[R]]"),
  "**Diagnostic** : 1. ce que reçoit vraiment `x` → 2. ce que le programme affiche → 3. corriger en faisant **renvoyer** le résultat par la fonction.\n\n**À retenir** : une fonction travaille sur une **copie** de ses arguments.",
  [st({consigne: "Si on tape `[[A]]`, qu'affiche ce programme ? Rappelle-toi : `x` est une **copie** de `[[V]]`, et changer la copie ne touche pas l'original.",
      question: "Que s'affiche-t-il pour `[[A]]` ?", verif: {mode: "numerique", attendu: "[[A]]"}, duree: 0.6,
      corrige: "La fonction modifie sa copie `x`, puis la copie disparaît à la fin de la fonction. `[[V]]` vaut toujours **[[A]]**.", indices: ["`[[F]]` ne renvoie rien (`void`).", "La valeur n'a pas bougé : [[A]]."]}),
   st({consigne: "Pour récupérer le résultat, la fonction doit le **renvoyer**. Réécris sa première ligne (son en-tête) pour qu'elle renvoie un `int`, sans changer son nom ni son paramètre.",
      question: "Nouvel en-tête de `[[F]]` ?", verif: rgx("int\\s+[[F]]\\s*\\(\\s*int\\s+x\\s*\\)\\s*\\{?", "int [[F]](int x)", ""), duree: 0.6,
      corrige: "`int [[F]](int x)` : `void` devient `int`, le type de la valeur renvoyée.", indices: ["Le mot avant le nom de la fonction, c'est le type renvoyé.", "`int [[F]](int x)`"]}),
   st({consigne: "Corrige le programme : la fonction **renvoie** `x + [[K]]` avec `return`, et dans `main` on range ce résultat dans `[[V]]` (`[[V]] = [[F]]([[V]]);`).\n\nPas de pointeur ici : on utilise seulement `return`.",
      question: "Corrige le programme.", verif: cC(c74, {tests: tests("[[A]]", "[[B]]", "0"), exige: [{motif: "return", msg: "La fonction doit renvoyer le résultat avec return."}, {motif: "[[V]]\\s*=\\s*[[F]]\\s*\\(", msg: "Range le résultat : [[V]] = [[F]]([[V]]);"}], interdit: [{motif: "\\*\\s*\\w+\\s*[=+]|int\\s*\\*", msg: "Pas de pointeur ici : utilise return."}]}), duree: 2.8, depart: c74d, corrige: sol(c74),
      indices: ["Deux changements : `return x + [[K]];` dans la fonction, et `[[V]] = [[F]]([[V]]);` dans `main`.", "N'oublie pas de remplacer `void` par `int` dans l'en-tête."]}, true)]);

/* ---------- 8.1 : mémoire, octets, sizeof ---------- */
const c81a = `#include <stdio.h>

int main(void) {
    char c;
    int n;
    double d;
    printf("%d %d %d\\n", (int)sizeof(c), (int)sizeof(n), (int)sizeof(d));
    return 0;
}`;
const c81 = `#include <stdio.h>

int main(void) {
    char c;
    int n;
    double d;
    int t[[[N]]];
    printf("%d %d %d %d\\n", (int)sizeof(c), (int)sizeof(n), (int)sizeof(d), (int)sizeof(t));
    return 0;
}`;
const c8 = exo("c8-113", "8.1", "Combien de place en mémoire ?", 4,
  "Écris un programme qui déclare un `char`, un `int`, un `double` et un tableau `int t[[[N]]];`, puis affiche sur une ligne la taille de chacun **en octets**, dans cet ordre, avec `sizeof` :\n```text\n[[SORTIE]]\n```",
  "**Plan** : 1. une variable occupe plusieurs octets à la suite → 2. un tableau occupe la place de toutes ses cases → 3. `sizeof` donne ces tailles.\n\n**À retenir** : `sizeof` renvoie un nombre d'octets ; on le convertit en `int` pour l'afficher avec `%d`.",
  [st({consigne: "Un `int` de 4 octets commence à l'adresse `[[AD]]` : il occupe cet octet et les 3 suivants, à la suite. Quelle est l'adresse de son **dernier** octet ? (écris-la en hexadécimal, comme `0x…`)",
      question: "Adresse du dernier octet ?", verif: {mode: "exact", attendu: ["[[AF]]"]}, duree: 0.6,
      corrige: "Les 4 octets sont `[[AD]]`, puis +1, +2, +3 : le dernier est à **`[[AF]]`**.", indices: ["Ajoute 3 (pas 4) : le premier octet compte déjà.", "[[AD]] + 3 = [[AF]]."]}),
   st({consigne: "Un `int` occupe 4 octets. Combien d'octets occupe le tableau `int t[[[N]]];` en tout ?",
      question: "Taille de `t` en octets ?", verif: {mode: "numerique", attendu: "[[TT]]"}, duree: 0.5,
      corrige: "[[N]] cases × 4 octets = **[[TT]]** octets.", indices: ["Toutes les cases sont rangées à la suite.", "[[N]] × 4."]}),
   st({consigne: "Déclare un `char c`, un `int n` et un `double d`, et affiche leurs tailles sur une ligne, séparées par un espace. Écris `(int)sizeof(c)` pour pouvoir l'afficher avec `%d`.",
      question: "Affiche les trois tailles.", verif: cC(c81a, {nombres: true, exige: [{motif: "sizeof", msg: "Utilise sizeof pour obtenir les tailles."}]}), duree: 1.2, corrige: sol(c81a),
      indices: ["Trois `(int)sizeof(…)` dans un seul `printf`.", "`printf(\"%d %d %d\\n\", (int)sizeof(c), (int)sizeof(n), (int)sizeof(d));`"]}),
   st({consigne: "Ajoute le tableau `int t[[[N]]];` et affiche aussi sa taille en dernier. Laisse `sizeof` faire le calcul : n'écris pas [[TT]] en dur.",
      question: "Écris le programme complet.", verif: cC(c81, {nombres: true, exige: [{motif: "sizeof\\s*\\(\\s*t\\s*\\)", msg: "Affiche la taille du tableau avec sizeof(t)."}]}), duree: 1.7, depart: c81a, corrige: sol(c81),
      indices: ["`sizeof(t)` donne la taille du tableau entier.", "Ajoute `, (int)sizeof(t)` et un 4e `%d`."]}, true)]);

/* ---------- 9.1 : la limite d'un tableau statique ---------- */
const c91 = `#include <stdio.h>

#define TP [[TP]]

int main(void) {
    int t[TP], n, s = 0;
    scanf("%d", &n);
    if (n > TP) {
        printf("trop grand\\n");
        return 0;
    }
    for (int i = 0; i < n; i++) {
        scanf("%d", &t[i]);
        s += t[i];
    }
    printf("%d\\n", s);
    return 0;
}`;
const c9a = exo("c9-109", "9.1", "Le tableau qui ne peut pas grandir", 4,
  "Avec un tableau **statique** `int t[TP];` (`#define TP [[TP]]`), la taille est fixée une fois pour toutes. Écris un programme qui lit `n` : si `n` dépasse `TP`, il affiche `trop grand` et s'arrête ; sinon il lit les `n` entiers dans `t` et affiche leur somme.\n\n" + ex("[[E0]]", "[[S2_0]]") + "\n\n" + ex("[[E1]]", "[[S2_1]]"),
  "**Plan** : 1. quand la taille d'un tableau statique est-elle fixée ? → 2. qui libère sa mémoire ? → 3. protéger le tableau avant de le remplir.\n\n**À retenir** : c'est cette limite que l'allocation dynamique (`malloc`, notion suivante) fait sauter.",
  [st({consigne: "Pour `int t[TP];`, la taille est-elle décidée **à la compilation** (avant de lancer le programme) ou **à l'exécution** (selon ce que tape l'utilisateur) ? Réponds « compilation » ou « exécution ».",
      question: "Taille fixée quand ?", verif: {mode: "exact", attendu: ["compilation", "a la compilation", "à la compilation"]}, duree: 0.5,
      corrige: "**À la compilation** : `TP` est une constante, la taille est connue avant même de lancer le programme. Elle ne peut plus changer ensuite.", indices: ["`TP` est remplacé par [[TP]] avant la compilation.", "Compilation."]}),
   st({consigne: "À la fin du bloc où `t` est déclaré, que devient sa mémoire : est-elle libérée **automatiquement**, ou faut-il appeler **free** ? (réponds « automatiquement » ou « free »)",
      question: "Libération de `t` ?", verif: {mode: "exact", attendu: ["automatiquement", "automatique"]}, duree: 0.5,
      corrige: "La mémoire statique est libérée **automatiquement** à la fin du bloc. `free` sert seulement pour la mémoire qu'on a demandée soi-même.", indices: ["On n'a rien demandé à `malloc`.", "Automatiquement."]}),
   st({consigne: "Écris le programme : `#define TP [[TP]]`, un tableau `int t[TP];`, lis `n`. **Avant** de remplir le tableau, si `n > TP`, affiche `trop grand` et arrête-toi (`return 0;`). Sinon, lis les `n` entiers et affiche leur somme.",
      question: "Écris le programme complet.", verif: cC(c91, {tests: tests("[[E0]]", "[[E1]]", "[[E2]]"), exige: [{motif: "#\\s*define\\s+TP\\b", brut: true, msg: "Définis la taille avec #define TP [[TP]]."}], interdit: [{motif: "malloc|calloc", msg: "Ici, on reste avec un tableau statique (pas de malloc)."}]}), duree: 3, corrige: sol(c91),
      indices: ["Juste après le `scanf` de `n` : `if (n > TP) { printf(\"trop grand\\n\"); return 0; }`.", "Ensuite une boucle qui lit `t[i]` et ajoute chaque valeur à `s` (qui part de 0)."]}, true)]);

/* ---------- 9.2 : malloc ---------- */
const c92a = `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int *t = malloc(n * sizeof(int));
    if (t == NULL) {
        printf("Erreur d'allocation\\n");
        return 1;
    }
    for (int i = 0; i < n; i++) {
        t[i] = i * [[K]];
    }
    for (int i = 0; i < n; i++) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    free(t);
    return 0;
}`;
const c92 = `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int *t = malloc(n * sizeof(int));
    if (t == NULL) {
        printf("Erreur d'allocation\\n");
        return 1;
    }
    for (int i = 0; i < n; i++) {
        scanf("%d", &t[i]);
    }
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    free(t);
    return 0;
}`;
const c9b = exo("c9-110", "9.2", "Un tableau à la bonne taille", 5,
  "Écris un programme qui lit `n`, réserve avec `malloc` un tableau d'exactement `n` entiers, y range les `n` entiers tapés ensuite, puis les affiche **à l'envers** (du dernier au premier), avant de libérer la mémoire.\n\n" + ex("[[E0]]", "[[S3_0]]"),
  "**Plan** : 1. calculer la taille à demander, en octets → 2. vérifier que `malloc` n'a pas renvoyé `NULL` → 3. utiliser `t` comme un tableau → 4. `free(t)` à la fin.\n\n**Piège** : `malloc(n)` réserve `n` **octets**, pas `n` entiers.",
  [st({consigne: "Un `int` fait 4 octets. Combien d'octets réserve `malloc([[N]] * sizeof(int))` ?",
      question: "Nombre d'octets réservés ?", verif: {mode: "numerique", attendu: "[[NO]]"}, duree: 0.5,
      corrige: "[[N]] × 4 = **[[NO]]** octets, de quoi ranger [[N]] entiers.", indices: ["`sizeof(int)` vaut 4.", "[[N]] × 4."]}),
   st({consigne: "Écris l'appel à `malloc` qui réserve la place pour `n` entiers (juste l'expression, sans le `int *t =` devant).",
      question: "Appel à `malloc` pour `n` entiers ?", verif: rgx("(\\(\\s*int\\s*\\*\\s*\\)\\s*)?malloc\\s*\\(\\s*(n\\s*\\*\\s*sizeof\\s*\\(\\s*int\\s*\\)|sizeof\\s*\\(\\s*int\\s*\\)\\s*\\*\\s*n)\\s*\\)\\s*;?", "malloc(n * sizeof(int))"), duree: 0.6,
      corrige: "`malloc(n * sizeof(int))` : le nombre d'éléments multiplié par la taille d'un élément.", indices: ["La taille se donne en octets : nombre d'éléments × taille d'un élément.", "`malloc(n * sizeof(int))`"]}),
   st({consigne: "Premier jalon : lis `n`, réserve `n` entiers avec `malloc` (vérifie que le pointeur n'est pas `NULL`), remplis la case `i` avec `i * [[K]]`, affiche le tableau sur une ligne, puis libère-le avec `free`.",
      question: "Réserve, remplis et affiche.", verif: cC(c92a, {tests: tests("[[N]]", "3"), exige: [{motif: "malloc|calloc", msg: "Réserve le tableau avec malloc."}, {motif: "free\\s*\\(", msg: "Libère la mémoire avec free."}]}), duree: 1.6, corrige: sol(c92a),
      indices: ["`int *t = malloc(n * sizeof(int));` puis `if (t == NULL) { … return 1; }`.", "Ensuite `t[i] = i * [[K]];` dans une boucle, comme avec un tableau ordinaire."]}),
   st({consigne: "Version finale : au lieu de calculer les valeurs, **lis-les** au clavier dans `t`, puis affiche-les en partant de la dernière case (`n - 1`) jusqu'à la première (0). N'oublie pas `free(t)` à la fin.",
      question: "Écris le programme complet.", verif: cC(c92, {nombres: true, tests: tests("[[E0]]", "[[E1]]", "1\n[[UN]]"), exige: [{motif: "malloc|calloc", msg: "Réserve le tableau avec malloc."}, {motif: "free\\s*\\(", msg: "Libère la mémoire avec free."}]}), duree: 2.3, depart: c92a, corrige: sol(c92),
      indices: ["Remplace le remplissage par `scanf(\"%d\", &t[i]);`.", "Boucle d'affichage à l'envers : `for (int i = n - 1; i >= 0; i--)`."]}, true)]);

/* ---------- 9.3 : realloc ---------- */
const c93 = `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = [[C]], n = 0, x;
    int *t = malloc(cap * sizeof(int));
    if (t == NULL) return 1;
    scanf("%d", &x);
    while (x != 0) {
        if (n == cap) {
            int *tmp = realloc(t, 2 * cap * sizeof(int));
            if (tmp == NULL) {
                free(t);
                return 1;
            }
            t = tmp;
            cap = 2 * cap;
        }
        t[n] = x;
        n++;
        scanf("%d", &x);
    }
    printf("%d valeurs, capacite %d\\n", n, cap);
    for (int i = 0; i < n; i++) printf("%d ", t[i]);
    printf("\\n");
    free(t);
    return 0;
}`;
const c9c = exo("c9-111", "9.3", "La liste qui grandit", 6,
  "Écris un programme qui lit des entiers jusqu'à ce qu'on tape `0`, et les range dans un tableau dynamique. Au départ, le tableau a une capacité de **[[C]]** entiers ; chaque fois qu'il est plein, sa capacité **double** grâce à `realloc`. À la fin, le programme affiche le nombre de valeurs et la capacité finale, puis les valeurs.\n\n" + ex("[[E0]]", "[[S2_0]]"),
  "**Plan** : 1. `malloc` de [[C]] entiers, `n = 0` → 2. pour chaque valeur lue (tant qu'elle n'est pas 0) : si `n == cap`, doubler avec `realloc` → 3. ranger la valeur → 4. afficher, puis `free`.\n\n**Piège** : `t = realloc(t, …)` perd l'ancien bloc si `realloc` échoue ; passe par un pointeur temporaire.",
  [st({consigne: "Capacité de départ : [[C]]. On range [[V]] valeurs, et on double la capacité chaque fois que le tableau est plein au moment d'en ajouter une. Quelle est la capacité à la fin ?",
      question: "Capacité finale ?", verif: {mode: "numerique", attendu: "[[CF]]"}, duree: 0.7,
      corrige: "La capacité passe par [[SUITE]] : la première qui suffit pour [[V]] valeurs est **[[CF]]**.", indices: ["Double [[C]] jusqu'à dépasser ou atteindre [[V]].", "[[SUITE]]."]}),
   st({consigne: "Quand le tableau est plein, on demande un bloc deux fois plus grand **sans écraser `t` tout de suite**. Écris la ligne qui déclare `int *tmp` et lui donne le résultat de `realloc` pour une capacité de `2 * cap` entiers.",
      question: "Ligne avec `realloc` ?", verif: rgx("int\\s*\\*\\s*tmp\\s*=\\s*(\\(\\s*int\\s*\\*\\s*\\)\\s*)?realloc\\s*\\(\\s*t\\s*,\\s*(2\\s*\\*\\s*cap\\s*\\*\\s*sizeof\\s*\\(\\s*int\\s*\\)|cap\\s*\\*\\s*2\\s*\\*\\s*sizeof\\s*\\(\\s*int\\s*\\)|2\\s*\\*\\s*sizeof\\s*\\(\\s*int\\s*\\)\\s*\\*\\s*cap|sizeof\\s*\\(\\s*int\\s*\\)\\s*\\*\\s*2\\s*\\*\\s*cap)\\s*\\)\\s*;", "int *tmp = realloc(t, 2 * cap * sizeof(int));"), duree: 0.8,
      corrige: "`int *tmp = realloc(t, 2 * cap * sizeof(int));` : si ça échoue, `tmp` vaut `NULL` mais `t` pointe toujours vers les données.", indices: ["`realloc(ancien_pointeur, nouvelle_taille_en_octets)`.", "`int *tmp = realloc(t, 2 * cap * sizeof(int));`"]}),
   st({consigne: "Écris le programme : `cap = [[C]]`, `n = 0`, un `malloc` de `cap` entiers. Lis les valeurs jusqu'au `0`. Avant de ranger une valeur, si `n == cap` : `realloc` vers `tmp`, vérifie `tmp != NULL`, puis `t = tmp;` et `cap = 2 * cap;`. À la fin, affiche `n valeurs, capacite cap` puis les valeurs sur une ligne, et libère `t`.",
      question: "Écris le programme complet.", verif: cC(c93, {tests: tests("[[E0]]", "[[E1]]", "0"), nombres: true, exige: [{motif: "realloc", msg: "Agrandis le tableau avec realloc."}, {motif: "free\\s*\\(", msg: "Libère la mémoire avec free."}]}), duree: 4.5, corrige: sol(c93),
      indices: ["Structure : `scanf` d'une valeur, puis `while (x != 0) { … scanf(\"%d\", &x); }`. Dans la boucle, d'abord le test `if (n == cap)`, puis `t[n] = x; n++;`.", "Dans le `if` : `int *tmp = realloc(t, 2 * cap * sizeof(int)); if (tmp == NULL) { free(t); return 1; } t = tmp; cap = 2 * cap;`"]}, true)]);

/* ---------- 10.1 : typedef ---------- */
const c101 = `#include <stdio.h>

typedef double [[TA]];
typedef int [[TB]];

int main(void) {
    [[TA]] prix;
    [[TB]] [[VB]];
    scanf("%lf %d", &prix, &[[VB]]);
    [[TA]] total = prix * [[VB]];
    printf("Total : %.2f\\n", total);
    return 0;
}`;
const c10 = exo("c10-110", "10.1", "Des types qui parlent", 4,
  "[[CONTEXTE]] Écris un programme qui crée deux alias avec `typedef` : `[[TA]]` pour `double` et `[[TB]]` pour `int`. Il lit [[QUOI_A]] (de type `[[TA]]`) puis [[QUOI_B]] (de type `[[TB]]`), et affiche le total avec 2 décimales.\n\n" + ex("[[E0]]", "[[S2_0]]"),
  "**Plan** : 1. écrire les deux `typedef` (en haut du fichier, avant `main`) → 2. déclarer les variables avec ces nouveaux noms → 3. lire, multiplier, afficher.\n\n**À retenir** : `[[TA]]` reste un `double` : on le lit avec `%lf` et on l'affiche avec `%.2f`.",
  [st({consigne: "Écris la ligne qui fait de `[[TA]]` un autre nom pour `double`.",
      question: "Alias `[[TA]]` ?", verif: rgx("typedef\\s+double\\s+[[TA]]\\s*;", "typedef double [[TA]];", ""), duree: 0.5,
      corrige: "`typedef double [[TA]];` : le type existant d'abord, le nouveau nom ensuite.", indices: ["`typedef type_existant nouveau_nom;`", "`typedef double [[TA]];`"]}),
   st({consigne: "Après `typedef double [[TA]];`, `[[TA]]` est-il un **nouveau type**, différent de `double` ? (oui / non)",
      question: "Nouveau type ?", verif: {mode: "exact", attendu: ["non"]}, duree: 0.4,
      corrige: "**Non** : c'est exactement `double`, sous un autre nom. Il se lit avec `%lf` et s'affiche avec `%f`.", indices: ["On parle d'un *alias*.", "Non."]}),
   st({consigne: "Écris le programme complet : les deux `typedef` avant `main`, une variable `prix` de type `[[TA]]` et une variable `[[VB]]` de type `[[TB]]`. Lis-les avec `scanf(\"%lf %d\", …)`, puis affiche `Total : …` avec 2 décimales.",
      question: "Écris le programme complet.", verif: cC(c101, {tests: tests("[[E0]]", "[[E1]]"), nombres: true, exige: [{motif: "typedef\\s+double\\s+[[TA]]", msg: "Crée l'alias : typedef double [[TA]];"}, {motif: "typedef\\s+int\\s+[[TB]]", msg: "Crée l'alias : typedef int [[TB]];"}, {motif: "\\b[[TA]]\\s+\\w+", msg: "Déclare au moins une variable avec le type [[TA]]."}, {motif: "\\b[[TB]]\\s+\\w+\\s*[;,=]", msg: "Déclare au moins une variable avec le type [[TB]]."}]}), duree: 3.1, corrige: sol(c101),
      indices: ["En haut : `typedef double [[TA]];` et `typedef int [[TB]];`. Dans `main` : `[[TA]] prix; [[TB]] [[VB]];`.", "`scanf(\"%lf %d\", &prix, &[[VB]]);` puis `printf(\"Total : %.2f\\n\", prix * [[VB]]);`"]}, true)]);

/* ---------- variantes ---------- */
const BUGS = [
  [m => `#include <stdio.h>\n\nint main(void) {\n    printf("${m}\\n")\n    return 0;\n}`, "il manquait le `;` à la fin de la ligne du `printf`", "Il manque un caractère à la fin de la ligne du `printf`."],
  [m => `#include <stdio.h>\n\nint main(void) {\n    printf("${m}\\n");\n    return 0;\n`, "il manquait l'accolade `}` qui ferme `main`", "Compte les accolades : chaque `{` a besoin de son `}`."],
  [m => `#include <stdio.h>\n\nint main(void) {\n    printf("${m}\\n";\n    return 0;\n}`, "il manquait la parenthèse `)` qui ferme le `printf`", "Compte les parenthèses de la ligne du `printf`."],
  [m => `#include <stdio.h>\n\nint main(void) {\n    printf("${m}\\n");\n    return 0\n}`, "il manquait le `;` après `return 0`", "Il manque un caractère à la fin de la ligne du `return`."],
];
const MOTS = ["programme", "clavier", "octet", "binaire", "variable", "compilateur", "souris", "memoire", "pixel", "reseau", "processeur", "fichier"];
const SIGLES = ["BIC", "CPU", "RAM", "USB", "DNS", "TCP", "LED", "GPU", "SQL", "PDF", "URL", "SSD"];
const ent = (R, n, a, b) => Array.from({length: n}, () => R.entre(a, b));

export default [
  {banque: "programmation-c/c-1-prise-en-main.json", ajouter: [c1], items: {"c1-105": {tirer: R => {
    const [b, quoi, ind] = R.un(BUGS), MSG = R.un(["Bonjour ESILV !", "Hello, world!", "Premier programme", "Ca compile !", "C'est parti !", "Bienvenue en C"]);
    const [F, X] = R.un([["hello", "hello"], ["premier", "premier"], ["essai", "essai"], ["tp1", "tp1"], ["main", "prog"], ["bonjour", "bonjour"]]);
    return {MSG, F, X, BUG: b(MSG), QUOI: quoi, QUOI_MAJ: ind}; }}}},
  {banque: "programmation-c/c-3-entrees-sorties.json", ajouter: [c3], items: {"c3-108": {tirer: R => {
    const NOM = R.un(["Lina", "Hugo", "Sami", "Jade", "Noah", "Ines", "Yanis", "Lea"]), AGE = R.entre(17, 25), P = R.entre(10, 99);
    return {NOM, AGE, P, SORTIE: `Fiche "${NOM}"\nAge : ${AGE} ans\nProgression : ${P}%`}; }}}},
  {banque: "programmation-c/c-6-chaines.json", ajouter: [c6a, c6b], items: {
    "c6-112": {tirer: R => ({MOT: R.un(MOTS)}), deriver: v => ({N: v.MOT.length, N1: v.MOT.length + 1, SORTIE: `${v.MOT.length} caracteres, ${v.MOT.length + 1} cases`})},
    "c6-113": {tirer: R => ({S: R.un(SIGLES)}), deriver: v => ({C0: v.S[0], C1: v.S[1], C2: v.S[2]})}}},
  {banque: "programmation-c/c-7-fonctions.json", ajouter: [c7], items: {"c7-114": {tirer: R => {
    const [F, V, UNITE] = R.un([["augmenter", "score", "points"], ["bonus", "note", "points"], ["vieillir", "age", "ans"], ["recharger", "batterie", "%"], ["gagner", "pieces", "pièces"]]);
    const K = R.entre(2, 15), A = R.entre(1, 60), B = R.entre(-20, 100); return {F, V, UNITE, K, A, B, R: A + K}; }}}},
  {banque: "programmation-c/c-8-pointeurs.json", ajouter: [c8], items: {"c8-113": {tirer: R => {
    const N = R.entre(3, 25), base = R.un([0x1000, 0x2A00, 0x7F10, 0x3B08, 0x1FF0, 0x4C2C]) + 4*R.entre(0, 3);
    return {N, TT: 4*N, AD: "0x" + base.toString(16).toUpperCase(), AF: "0x" + (base + 3).toString(16).toUpperCase(), SORTIE: `1 4 8 ${4*N}`}; }}}},
  {banque: "programmation-c/c-9-allocation.json", ajouter: [c9a, c9b, c9c], items: {
    "c9-109": {tirer: R => { const TP = R.un([5, 8, 10, 20]), n0 = R.entre(2, Math.min(TP, 6));
      return {TP, E0: [n0, ent(R, n0, 1, 30).join(" ")].join("\n"), E1: String(TP + R.entre(1, 20)), E2: [TP, ent(R, TP, 0, 9).join(" ")].join("\n")}; }},
    "c9-110": {tirer: R => { const N = R.entre(3, 12), n0 = R.entre(4, 7), n1 = R.entre(2, 5);
      return {N, NO: 4*N, K: R.un([2, 3, 5, 10]), UN: R.entre(1, 99), E0: [n0, ent(R, n0, 1, 50).join(" ")].join("\n"), E1: [n1, ent(R, n1, -9, 9).join(" ")].join("\n")}; }},
    "c9-111": {tirer: R => { const C = R.un([2, 3, 4]), V = R.entre(C + 1, 6*C), suite = [C]; while(suite.at(-1) < V) suite.push(2*suite.at(-1));
      const k0 = R.entre(2*C + 1, 4*C), k1 = R.entre(1, C);
      return {C, V, CF: suite.at(-1), SUITE: suite.join(" → "), E0: ent(R, k0, 1, 99).join(" ") + " 0", E1: ent(R, k1, 1, 99).join(" ") + " 0"}; }}}},
  {banque: "programmation-c/c-10-structures.json", ajouter: [c10], items: {"c10-110": {tirer: R => {
    const [CONTEXTE, TA, TB, VB, QUOI_A, QUOI_B, pa, qb] = R.un([
      ["Au supermarché, on calcule le prix de plusieurs articles identiques.", "euros", "quantite", "nb", "le prix d'un article", "le nombre d'articles", [0.5, 9.99], [1, 12]],
      ["Au cinéma, on calcule le prix d'un groupe.", "euros", "nb_places", "places", "le prix d'une place", "le nombre de places", [5, 14.5], [1, 9]],
      ["Pour une location de voiture, on calcule le coût total.", "tarif", "jours", "duree", "le tarif journalier", "le nombre de jours", [20, 89.9], [1, 14]],
      ["Pour un abonnement, on calcule ce qu'on paie sur plusieurs mois.", "montant", "mois", "nb_mois", "le prix mensuel", "le nombre de mois", [4.99, 29.99], [1, 24]]]);
    const p = () => (Math.round((pa[0] + Math.random()*(pa[1] - pa[0]))*100)/100).toFixed(2);
    return {CONTEXTE, TA, TB, VB, QUOI_A, QUOI_B, E0: `${p()} ${R.entre(qb[0], qb[1])}`, E1: `${p()} ${R.entre(qb[0], qb[1])}`}; }}}},
];
