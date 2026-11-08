/* Chapitre 2 : consignes réécrites + variantes (08/11/2026). */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const dec = (x, n = 2) => (Math.round(x * 10**n) / 10**n).toFixed(n);
const c109d = "#include <stdio.h>\n\nint main(void) {\n    int a = [[A]], b = [[B]];\n    double r = a / b;\n    printf(\"%.2f\\n\", r);\n    return 0;\n}";
const c109 = c109d.replace("double r = a / b;", "double r = (double)a / b;");

export default {
  banque: "programmation-c/c-2-variables-types.json",
  n: 8,
  items: {
    /* ---------- questions courtes ---------- */
    "c2-001": {set: {enonce: "Après `int i = [[A]]; i = i + [[B]];`, que vaut `i` ?", "verif.attendu": "[[R]]", explication: "On calcule d'abord `i + [[B]]` avec l'ancienne valeur ([[A]]), ce qui donne [[R]], puis on range le résultat dans `i`."},
      tirer: R => ({A: R.entre(1, 20), B: R.entre(1, 15)}), deriver: v => ({R: v.A + v.B})},
    "c2-012": {set: {enonce: "Que vaut `[[A]] % [[B]]` ?", "verif.attendu": "[[R]]", explication: "[[A]] = [[Q]] × [[B]] + [[R]] : le reste est **[[R]]**."},
      tirer: R => ({A: R.entre(10, 60), B: R.entre(3, 9)}), deriver: v => ({Q: Math.floor(v.A / v.B), R: v.A % v.B})},
    "c2-013": {set: {enonce: "Que vaut `[[A]] / [[B]]` avec des entiers ?", "verif.attendu": "[[Q]]", explication: "Division entière : [[A]] = [[Q]] × [[B]] + [[R]], on garde le quotient **[[Q]]** et on jette le reste."},
      tirer: R => { const B = R.entre(3, 9); let A; do A = R.entre(10, 60); while(A % B === 0); return {A, B}; }, deriver: v => ({Q: Math.floor(v.A / v.B), R: v.A % v.B})},
    "c2-014": {set: {enonce: "Que vaut `[[A]] == [[B]]` en C ? (0 ou 1)", "verif.attendu": "[[R]]", explication: "Une comparaison vaut 1 si elle est vraie, 0 sinon. Ici [[A]] et [[B]] sont [[QUOI]], donc **[[R]]**."},
      tirer: R => { const A = R.entre(1, 9); return {A, B: R.entre(0, 1) ? A : R.entre(1, 9)}; }, deriver: v => ({R: v.A === v.B ? 1 : 0, QUOI: v.A === v.B ? "égaux" : "différents"})},
    "c2-018": {set: {enonce: "Que vaut `(int)[[X]]` ?", "verif.attendu": "[[R]]", explication: "Le cast vers `int` coupe la partie décimale, sans arrondir : **[[R]]**."},
      tirer: R => ({X: `${R.entre(1, 20)}.${R.entre(1, 9)}${R.entre(0, 9)}`}), deriver: v => ({R: Math.trunc(+v.X)})},
    "c2-019": {set: {enonce: "Que vaut `[[A]] / [[B]]` avec des entiers ?", "verif.attendu": "[[Q]]", explication: "Division entière : [[A]] / [[B]] donne **[[Q]]**, la partie décimale est perdue."},
      tirer: R => { const B = R.un([2, 4, 5, 8]); let A; do A = R.entre(B + 1, 4*B); while(A % B === 0); return {A, B}; }, deriver: v => ({Q: Math.floor(v.A / v.B)})},
    "c2-020": {set: {enonce: "Que vaut `[[A]].0 / [[B]]` ?", "verif.attendu": "[[R]]", explication: "Un seul opérande réel (`[[A]].0`) suffit pour que la division soit réelle : **[[R]]**."},
      tirer: R => { const B = R.un([2, 4, 5, 8]); let A; do A = R.entre(B + 1, 4*B); while(A % B === 0); return {A, B}; }, deriver: v => ({R: String(v.A / v.B)})},
    "c2-021": {set: {enonce: "Après `int x = [[X]];`, que contient `x` ?", choix: ["[[N]]", "[[X]]", "[[N1]]", "0"], explication: "La valeur réelle est convertie en `int` : la partie décimale est coupée (pas d'arrondi). `x` vaut **[[N]]**."},
      tirer: R => ({X: `${R.entre(2, 30)}.${R.entre(5, 9)}${R.entre(1, 9)}${R.entre(0, 9)}`}), deriver: v => ({N: Math.trunc(+v.X), N1: Math.trunc(+v.X) + 1})},
    "c2-026": {set: {enonce: "Que vaut `i` à la fin ?\n```c\nint i = [[A]];\ni++;\ni += [[B]];\ni *= [[C]];\n```", "verif.attendu": "[[R]]", explication: "[[A]] → [[A1]] (`i++`) → [[AB]] (`+= [[B]]`) → **[[R]]** (`*= [[C]]`)."},
      tirer: R => ({A: R.entre(1, 10), B: R.entre(1, 6), C: R.entre(2, 4)}), deriver: v => ({A1: v.A + 1, AB: v.A + 1 + v.B, R: (v.A + 1 + v.B) * v.C})},
    "c2-027": {set: {enonce: "Que vaut `x` ?\n```c\nint x = [[A]];\nx %= [[B]];\n```", "verif.attendu": "[[R]]", explication: "`x %= [[B]]` veut dire `x = x % [[B]]` : [[A]] = [[Q]] × [[B]] + [[R]], donc **[[R]]**."},
      tirer: R => ({A: R.entre(7, 40), B: R.entre(3, 7)}), deriver: v => ({Q: Math.floor(v.A / v.B), R: v.A % v.B})},
    "c2-028": {set: {enonce: "Que vaut `(int)[[X]] + (int)[[Y]]` ?", "verif.attendu": "[[R]]", explication: "On tronque chaque réel **avant** d'additionner : [[XI]] + [[YI]] = **[[R]]**."},
      tirer: R => ({X: `${R.entre(1, 9)}.${R.entre(5, 9)}`, Y: `${R.entre(1, 9)}.${R.entre(5, 9)}`}), deriver: v => ({XI: Math.trunc(+v.X), YI: Math.trunc(+v.Y), R: Math.trunc(+v.X) + Math.trunc(+v.Y)})},
    "c2-030": {set: {enonce: "Qu'affiche `printf(\"%d\", ([[A]] < [[B]]) + ([[C]] == [[D]]) + !([[F]]));` ?", "verif.attendu": "[[R]]", explication: "Chaque comparaison vaut 1 si elle est vraie, 0 sinon, et `!` inverse : [[R1]] + [[R2]] + [[R3]] = **[[R]]**."},
      tirer: R => ({A: R.entre(1, 9), B: R.entre(1, 9), C: R.entre(1, 4), D: R.entre(1, 4), F: R.entre(0, 2)}),
      deriver: v => { const r1 = v.A < v.B ? 1 : 0, r2 = v.C === v.D ? 1 : 0, r3 = v.F ? 0 : 1; return {R1: r1, R2: r2, R3: r3, R: r1 + r2 + r3}; }},

    /* ---------- exos ---------- */
    "c2-101": {
      set: {
        enonce: "Écris un programme qui lit deux entiers `a` et `b`, puis affiche sur une ligne, séparés par des espaces : leur **somme**, leur **différence** (`a - b`), leur **produit**, le **quotient entier** de `a` par `b` et le **reste** de cette division. (TD Premiers pas, exercice 3)\n\n" + ex("[[E0]]", "[[S5_0]]"),
        guidage: "**Plan** : d'abord calculer chaque résultat à la main avec `a = [[A]]` et `b = [[B]]`, pour savoir ce qu'on attend. Puis tout afficher avec un seul `printf`.\n\n**Outils** : `+ - * / %`. **Piège** : `a / b` entre deux `int` est une division entière.",
        ...E(0, {consigne: "Pour vérifier ton programme plus tard, calcule d'abord à la main avec `a = [[A]]` et `b = [[B]]`. Combien vaut `a + b` ?", question: "`a + b` = ?", "verif.attendu": "[[S]]", corrige: "[[A]] + [[B]] = [[S]].", indices: ["Une simple addition."]}),
        ...E(1, {consigne: "Toujours avec `a = [[A]]` et `b = [[B]]` : combien vaut `a - b` ?", question: "`a - b` = ?", "verif.attendu": "[[D]]", corrige: "[[A]] − [[B]] = [[D]].", indices: ["a moins b."]}),
        ...E(2, {consigne: "Et `a * b` ?", question: "`a * b` = ?", "verif.attendu": "[[P]]", corrige: "[[A]] × [[B]] = [[P]].", indices: ["[[A]] fois [[B]]."]}),
        ...E(3, {consigne: "`a` et `b` sont des `int` : `a / b` est donc une **division entière**, qui ne garde que la partie entière du résultat. Combien vaut `a / b` ?", question: "`a / b` = ?", "verif.attendu": "[[Q]]", corrige: "[[A]] = [[B]] × [[Q]] + [[RE]] : `a / b` vaut **[[Q]]**.", indices: ["Combien de fois [[B]] rentre-t-il dans [[A]] ?", "[[B]] × [[Q]] = [[BQ]], ça ne va pas plus loin."]}),
        ...E(4, {consigne: "Le reste de cette division s'obtient avec `%`. Combien vaut `a % b` ?", question: "`a % b` = ?", "verif.attendu": "[[RE]]", corrige: "[[A]] − [[BQ]] = [[RE]].", indices: ["Le modulo donne ce qui reste après la division entière.", "[[A]] − [[BQ]]."]}),
        ...E(5, {consigne: "Écris le programme : lis `a` et `b` avec un seul `scanf`, puis affiche les cinq résultats sur une ligne, dans l'ordre somme, différence, produit, quotient, reste.",
          "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]"),
          indices: ["`int a, b;` puis `scanf(\"%d %d\", &a, &b);`", "Un seul `printf` avec cinq `%d` : `printf(\"%d %d %d %d %d\\n\", a + b, a - b, a * b, a / b, a % b);`"]}),
      },
      tirer: R => { const B = R.entre(3, 9); let A; do A = R.entre(B + 5, 60); while(A % B === 0); const t = () => { const b = R.entre(2, 9); return `${R.entre(b, 80)} ${b}`; };
        return {A, B, E0: `${A} ${B}`, E1: t(), E2: t()}; },
      deriver: v => ({S: v.A + v.B, D: v.A - v.B, P: v.A * v.B, Q: Math.floor(v.A / v.B), RE: v.A % v.B, BQ: v.B * Math.floor(v.A / v.B)}),
    },
    "c2-102": {
      set: {
        enonce: "On convertit une température de degrés Celsius en Fahrenheit avec la formule $F = C \\times \\frac{9}{5} + 32$. (TD Premiers pas, exercice 5)\n\nÉcris un programme qui lit une température **entière** en °C et affiche sa valeur en °F avec 2 décimales.\n\n" + ex("[[C]]", "[[F2]]"),
        guidage: "**Piège** : en C, `9 / 5` entre deux entiers vaut **1**, pas 1,8. L'ordre des opérations et le type des opérandes changent le résultat : on va le vérifier avec `c = [[C]]`.",
        ...E(0, {consigne: "Avec `int c = [[C]];`, évalue `c * (9 / 5) + 32` comme le ferait le C : on calcule d'abord la parenthèse, **entre entiers**.", "verif.attendu": "[[FAUX]]",
          corrige: "`9 / 5` vaut 1 en division entière, donc [[C]] × 1 + 32 = [[FAUX]]. C'est faux : la vraie réponse est [[F]].", indices: ["Calcule d'abord `9 / 5` entre entiers.", "`9 / 5` = 1, donc [[C]] × 1 + 32."]}),
        ...E(1, {consigne: "Écrivons plutôt `c * 9.0 / 5 + 32` : avec `9.0` (un réel), tout le calcul devient réel. Que vaut cette expression pour `c = [[C]]` ?", "verif.attendu": "[[F]]",
          corrige: "[[C]] × 9,0 = [[C9]] ; [[C9]] / 5 = [[C95]] ; + 32 = **[[F]]**.", indices: ["Un opérande réel (9.0) rend le calcul réel.", "[[C]] × 9 / 5 = [[C95]]."]}),
        ...E(2, {consigne: "Le résultat a une partie décimale : il faut le ranger dans une variable **réelle**. Quel type donnes-tu à `f` ?"}),
        ...E(3, {consigne: "Écris le programme : lis `c` (un `int`), calcule `f` avec la formule réelle, puis affiche `f` avec 2 décimales (`%.2f`).",
          "verif.tests": tests("[[C]]", "[[E1]]", "-40"), indices: ["`double f = c * 9.0 / 5 + 32;`", "`printf(\"%.2f\\n\", f);`"]}),
      },
      tirer: R => ({C: R.un([20, 25, 30, 35, 40, 15, 10, 100, 45, 50]), E1: String(R.entre(-20, 45))}),
      deriver: v => ({FAUX: v.C + 32, C9: v.C * 9, C95: v.C * 9 / 5, F: v.C * 9 / 5 + 32, F2: dec(v.C * 9 / 5 + 32)}),
    },
    "c2-103": {
      set: {
        enonce: "Un mile vaut 1,609344 km : pour convertir des kilomètres en miles, on calcule `km / 1.609344`. (TD Premiers pas, exercice 6)\n\nÉcris un programme qui lit une distance en km (un réel) et affiche la distance en miles avec 2 décimales.\n\n" + ex("[[KM]]", "[[MI]]"),
        guidage: "**Outils** : division réelle, format d'affichage. Le résultat n'est pas un entier : on travaille avec des `double` du début à la fin.",
        ...E(0, {consigne: "Avec `double km = [[KM]];`, calcule `km / 1.609344` (arrondi à 0,01).", question: "Combien de miles (arrondi à 0,01) ?", "verif.attendu": "[[MI]]",
          corrige: "[[KM]] / 1,609344 ≈ **[[MI]]** miles.", indices: ["Une division réelle.", "Un mile fait un peu plus de 1,6 km : le résultat est un peu plus petit que [[KM]] / 1,6."]}),
        ...E(1, {consigne: "`printf` affiche un `double` avec 6 décimales par défaut. Quel format écris-tu pour n'en garder que **2** ?"}),
        ...E(2, {consigne: "Écris le programme : lis `km` dans un `double` (format `%lf` pour `scanf`), puis affiche `km / 1.609344` avec 2 décimales.",
          "verif.tests": tests("[[KM]]", "[[E1]]", "0"), indices: ["`double km;` puis `scanf(\"%lf\", &km);`", "`printf(\"%.2f\\n\", km / 1.609344);`"]}),
      },
      tirer: R => ({KM: R.un(["10", "5", "21.1", "42.195", "100", "15", "3.5", "60"]), E1: String(R.entre(1, 300))}),
      deriver: v => ({MI: dec(+v.KM / 1.609344)}),
    },
    "c2-104": {
      set: {
        enonce: "Écris un programme qui lit deux entiers `a` et `b`, **échange** leurs valeurs à l'aide d'une variable temporaire, puis affiche `a` puis `b`.\n\n" + ex("[[A]] [[B]]", "[[B]] [[A]]"),
        guidage: "**Plan** : 1. mettre `a` de côté dans `tmp` → 2. copier `b` dans `a` → 3. remettre `tmp` dans `b`.\n\n**Piège** : `a = b; b = a;` perd l'ancienne valeur de `a`.",
        ...E(0, {consigne: "Essayons sans variable temporaire. Avec `a = [[A]]` et `b = [[B]]`, on exécute `a = b;` puis `b = a;`. Que vaut `b` à la fin ? Suis les deux lignes dans l'ordre.", "verif.attendu": "[[B]]",
          corrige: "Après `a = b;`, `a` vaut [[B]] et le [[A]] est perdu ; `b = a;` recopie donc [[B]]. Il faut sauvegarder `a` **avant**.", indices: ["Après la première ligne, que vaut `a` ?", "[[B]] : le [[A]] a disparu."]}),
        ...E(1, {consigne: "Pour ne rien perdre, on commence par mettre `a` de côté. Écris l'instruction qui déclare une variable `tmp` et lui donne la valeur de `a`."}),
        ...E(2, {consigne: "Première version : lis `a` et `b`, et affiche-les **sans rien changer**, séparés par une espace. (On ajoutera l'échange juste après.)", "verif.tests": tests("[[A]] [[B]]", "[[E1]]")}),
        ...E(3, {consigne: "Entre la lecture et l'affichage, ajoute les trois lignes de l'échange : sauvegarde `a` dans `tmp`, copie `b` dans `a`, puis remets `tmp` dans `b`. Le `printf` ne change pas : il affiche toujours `a` puis `b`.",
          "verif.tests": tests("[[A]] [[B]]", "[[E1]]", "7 7")}),
      },
      tirer: R => { const A = R.entre(1, 50); let B; do B = R.entre(1, 50); while(B === A); return {A, B, E1: `${R.entre(-20, -1)} ${R.entre(1, 30)}`}; },
    },
    "c2-105": {
      set: {
        enonce: "Écris un programme qui définit `PI` avec `#define` (valeur 3.14159), lit un rayon réel, puis affiche sur une ligne l'**aire** du disque puis son **périmètre**, avec 2 décimales.\n\n" + ex("[[R]]", "[[S4_0]]"),
        ...E(0, {consigne: "Une constante définie avec `#define` s'écrit sans `=` et sans `;` : le préprocesseur remplace simplement le nom par la valeur. Écris la ligne qui définit `PI` à 3.14159."}),
        ...E(1, {consigne: "Pour lire un réel dans une variable `double` avec `scanf`, le format n'est pas `%f` mais une variante avec une lettre en plus. Lequel ?"}),
        ...E(2, {consigne: "L'aire d'un disque vaut $\\pi r^2$. Le C n'a pas d'opérateur « puissance » : écris l'expression de l'aire avec `PI` et `r`, en multipliant."}),
        ...E(3, {consigne: "Premier jalon : avec `#define PI 3.14159`, lis le rayon dans un `double` et affiche **seulement l'aire**, avec 2 décimales.", "verif.tests": tests("[[R]]", "[[E1]]", "10")}),
        ...E(4, {consigne: "Ajoute le **périmètre** ($2 \\pi r$, soit `2 * PI * r`) sur la même ligne, après l'aire, lui aussi avec 2 décimales.", "verif.tests": tests("[[R]]", "[[E1]]", "10")}),
      },
      tirer: R => ({R: R.un(["2.5", "1.5", "3", "4.2", "0.5", "7", "12.5", "6.1"]), E1: `${R.entre(1, 20)}.${R.entre(0, 9)}`}),
    },
    "c2-107": {
      set: {
        enonce: "Écris un programme qui lit une durée en secondes et l'affiche en **heures, minutes et secondes** (trois nombres séparés par des espaces).\n\n" + ex("[[S]]", "[[H]] [[M]] [[SE]]") + "\n\n([[S]] s = [[H]] h [[M]] min [[SE]] s)",
        guidage: "**Plan** : heures = `s / 3600` ; ce qui reste après les heures = `s % 3600` ; minutes = ce reste `/ 60` ; secondes = `s % 60`.\n\n**Outils** : la division entière donne le quotient, le modulo donne le reste.",
        ...E(0, {consigne: "Une heure fait 3600 s. Pour `s = [[S]]`, combien d'heures **complètes** y a-t-il ? (c'est la division entière `s / 3600`)", question: "Heures pour [[S]] s ?", "verif.attendu": "[[H]]",
          corrige: "`[[S]] / 3600` en entiers vaut **[[H]]**.", indices: ["Division entière : on jette la partie décimale.", "3600 × [[H]] = [[H3600]], 3600 × [[H1]] dépasserait."]}),
        ...E(1, {consigne: "Une fois les heures retirées, combien de secondes reste-t-il ? C'est `[[S]] % 3600`.", question: "Reste après les heures ?", "verif.attendu": "[[RH]]",
          corrige: "[[S]] − [[H3600]] = **[[RH]]** secondes.", indices: ["Le modulo donne le reste de la division.", "[[S]] − [[H3600]]."]}),
        ...E(2, {consigne: "Premier jalon : lis `s` et affiche les **heures** puis les **minutes**. Les minutes se calculent sur ce qui reste après les heures : `(s % 3600) / 60`.", "verif.tests": tests("[[S]]", "[[E1]]", "59")}),
        ...E(3, {consigne: "Ajoute les **secondes restantes** en troisième valeur. Astuce : `s % 60` les donne directement.", "verif.tests": tests("[[S]]", "[[E1]]", "59", "86399")}),
      },
      tirer: R => ({S: R.entre(3601, 30000), E1: String(R.entre(60, 86000))}),
      deriver: v => ({H: Math.floor(v.S / 3600), H1: Math.floor(v.S / 3600) + 1, H3600: 3600*Math.floor(v.S / 3600), RH: v.S % 3600, M: Math.floor((v.S % 3600) / 60), SE: v.S % 60}),
    },
    "c2-108": {
      set: {
        enonce: "Écris un programme qui lit trois entiers et affiche leur moyenne **réelle**, avec 2 décimales.\n\n" + ex("[[A]] [[B]] [[C]]", "[[MOY]]"),
        ...E(0, {consigne: "Avec `a = [[A]]`, `b = [[B]]`, `c = [[C]]` (trois `int`), que vaut `(a + b + c) / 3` en C ? Attention, tous les opérandes sont entiers.", "verif.attendu": "[[QE]]",
          corrige: "[[SOM]] / 3 en division entière vaut **[[QE]]** : la partie décimale est perdue, alors que la vraie moyenne est [[MOY]].", indices: ["[[SOM]] divisé par 3, sans décimales.", "[[QE]]"]}),
        ...E(1, {consigne: "Pour que la division garde ses décimales, il suffit qu'**un** des deux opérandes soit réel. Écris l'expression de la moyenne de `a`, `b`, `c` qui donne un résultat réel."}),
        ...E(2, {consigne: "Premier jalon : lis les trois entiers et affiche leur **somme**.", "verif.tests": tests("[[A]] [[B]] [[C]]", "[[E1]]")}),
        ...E(3, {consigne: "Remplace la somme par la **moyenne réelle**, affichée avec 2 décimales.", "verif.tests": tests("[[A]] [[B]] [[C]]", "[[E1]]", "10 11 12")}),
      },
      tirer: R => { let a, b, c; do { a = R.entre(1, 20); b = R.entre(1, 20); c = R.entre(1, 20); } while((a + b + c) % 3 === 0); return {A: a, B: b, C: c, E1: `${R.entre(-5, 30)} ${R.entre(0, 30)} ${R.entre(0, 30)}`}; },
      deriver: v => ({SOM: v.A + v.B + v.C, QE: Math.floor((v.A + v.B + v.C) / 3), MOY: dec((v.A + v.B + v.C) / 3)}),
    },
    "c2-109": {
      set: {
        enonce: "Ce programme doit afficher `[[R]]` ([[A]] divisé par [[B]]), mais il affiche `[[FAUX]]`. Corrige-le **sans changer les types de `a` et `b`**.\n```c\n" + c109d + "\n```",
        ...E(0, {consigne: "`a` et `b` sont des `int`. Que vaut `a / b` en C, avec `a = [[A]]` et `b = [[B]]` ?", "verif.attendu": "[[Q]]",
          corrige: "Deux entiers donnent une division entière : **[[Q]]**. Ranger ce [[Q]] dans un `double` ne rend pas les décimales perdues : on obtient [[FAUX]].", indices: ["[[A]] = [[B]] × [[Q]] + [[RE]].", "[[Q]]"]}),
        ...E(1, {consigne: "On peut forcer la conversion d'une valeur en écrivant le type voulu entre parenthèses devant elle. Quel opérateur, placé devant `a`, rend la division réelle ?"}),
        ...E(2, {consigne: "Corrige la ligne du calcul pour afficher `[[R]]`. Ne change **pas** la ligne `int a = [[A]], b = [[B]];` : la correction se fait dans le calcul.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[R]]"}], nombres: true, exemple: c109, exige: [{motif: "int\\s+a\\s*=\\s*[[A]]\\s*,\\s*b\\s*=\\s*[[B]]", msg: "Garde int a = [[A]], b = [[B]] : la correction se fait dans le calcul."}]},
          corrige: sol(c109), depart: c109d, indices: ["Convertis `a` avant la division : le résultat devient réel.", "`double r = (double)a / b;`"]}),
      },
      tirer: R => { const B = R.un([2, 4, 5, 8]); let A; do A = R.entre(B + 1, 6*B); while(A % B === 0); return {A, B}; },
      deriver: v => ({Q: Math.floor(v.A / v.B), RE: v.A % v.B, R: dec(v.A / v.B), FAUX: dec(Math.floor(v.A / v.B))}),
    },
    "c2-110": {
      set: {
        ...E(0, {consigne: "Un nombre est pair quand le reste de sa division par 2 est nul. Écris cette condition pour `n` (juste l'expression, sans `if`)."}),
        ...E(1, {consigne: "En C, une comparaison est une valeur comme une autre : elle vaut 1 si elle est vraie, 0 sinon. Que vaut `([[N]] % 2 == 0)` ?", question: "Valeur de `([[N]] % 2 == 0)` ?", "verif.attendu": "[[R]]",
          corrige: "[[N]] % 2 vaut [[M]] : [[N]] est [[PI]], la condition vaut **[[R]]**.", indices: ["Calcule d'abord [[N]] % 2.", "[[R]]"]}),
        ...E(2, {consigne: "Premier jalon : lis un entier `n` et affiche le reste de sa division par 2 (`0` ou `1`)."}),
        ...E(3, {consigne: "Range dans une variable `int est_pair` le résultat de la condition « `n` est pair », puis affiche `est_pair`. Tu dois obtenir `1` pour un nombre pair et `0` sinon, sans écrire de `if`."}),
      },
      tirer: R => ({N: R.entre(3, 99)}), deriver: v => ({M: v.N % 2, R: v.N % 2 ? 0 : 1, PI: v.N % 2 ? "impair" : "pair"}),
    },
  },
};
