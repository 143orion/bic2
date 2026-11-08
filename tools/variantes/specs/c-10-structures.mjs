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
        enonce: "Définis `typedef struct { double x; double y; } Point;`. Écris un programme qui lit les coordonnées d'un point dans une variable `Point`, puis affiche sa distance à l'origine, $\\sqrt{x^2 + y^2}$, avec 2 décimales.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. le type `Point` regroupe deux `double` → 2. `Point p;` → 3. `scanf(\"%lf %lf\", &p.x, &p.y);` (on donne l'adresse **de chaque champ**) → 4. `sqrt(p.x * p.x + p.y * p.y)`, avec `<math.h>`.",
        ...E(0, {consigne: "Les champs d'une structure s'atteignent avec un point, entre le nom de la variable et le nom du champ. Pour une variable `p` de type `Point`, écris l'expression qui désigne son champ `x`."}),
        ...E(1, {consigne: "`scanf` a besoin d'une adresse pour écrire. Écris l'argument à donner à `scanf` pour qu'il range un nombre dans le champ `y` de `p`."}),
        ...E(2, {consigne: "Premier jalon, sans structure : avec deux `double x, y` ordinaires, lis deux réels et affiche `x * x + y * y` (le carré de la distance) avec 2 décimales.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Regroupe `x` et `y` dans le type `Point` (déclaré avant `main`), lis dans `p.x` et `p.y`, puis affiche la **distance** `sqrt(p.x * p.x + p.y * p.y)` avec 2 décimales. N'oublie pas `#include <math.h>` pour `sqrt`.", "verif.tests": tests("[[E0]]", "[[E1]]", "-6 8")}),
      },
      tirer: R => { const [a, b] = R.un([[3, 4], [6, 8], [5, 12], [8, 15], [1, 1], [2, 3], [7, 24], [9, 12]]); return {E0: `${a} ${b}`, E1: `${R.entre(-9, 9)} ${R.entre(1, 9)}`}; },
    },
    "c10-102": {
      set: {
        enonce: "Définis `typedef enum { LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE } Jour;`. Le programme lit un numéro de jour (0 à 6) dans une variable `Jour` et affiche `week-end` pour `SAMEDI` et `DIMANCHE`, `semaine` sinon, avec un `switch` sur les constantes de l'énumération.\n\n" + ex("[[N0]]", "[[S3_0]]") + "\n\n([[N0]] correspond à `[[J0]]`)",
        guidage: "**Plan** : 1. `typedef enum { LUNDI, …, DIMANCHE } Jour;` : les constantes valent 0, 1, …, 6 → 2. lire `n`, puis `Jour j = n;` → 3. `switch (j)` : `case SAMEDI:` et `case DIMANCHE:` partagent un même bloc, `default:` gère le reste.",
        ...E(0, {consigne: "Dans une énumération, les constantes sont numérotées automatiquement à partir de 0, dans l'ordre. Quelle valeur entière a `SAMEDI` ?"}),
        ...E(1, {consigne: "Dans un `switch`, deux étiquettes écrites l'une après l'autre (sans `break` entre elles) mènent au même bloc. Écris, sur une ligne, les deux étiquettes pour `SAMEDI` et `DIMANCHE`."}),
        ...E(2, {consigne: "Premier jalon, sans `enum` : lis `n` (0 à 6) et affiche `week-end` si `n` vaut 5 ou 6, `semaine` sinon, avec un simple `if`.", "verif.tests": tests("[[N0]]", "[[N1]]", "6")}),
        ...E(3, {consigne: "Remplace les nombres par l'énumération : déclare le type `Jour` avant `main`, mets `n` dans `Jour j`, et décide avec un `switch (j)` : `case SAMEDI:` `case DIMANCHE:` → `week-end`, `default:` → `semaine`.", "verif.tests": tests("[[N0]]", "[[N1]]", "6", "0")}),
      },
      tirer: R => { const n0 = R.entre(0, 6); let n1; do n1 = R.entre(0, 6); while((n1 >= 5) === (n0 >= 5)); return {N0: n0, J0: JOURS[n0], N1: n1}; },
    },
    "c10-103": {
      set: {
        enonce: "Définis `Date` (jour, mois, annee) puis `Personne` (un nom de 30 caractères et un champ `Date naissance`). Le programme lit un nom puis une date (`jour mois annee`) et affiche `nom j/m/aaaa age`, où `age` est l'âge atteint en 2026 (2026 − année).\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `Date` regroupe 3 `int` → 2. `Personne` contient `char nom[30]` **et** une `Date` : une structure peut en contenir une autre → 3. on enchaîne les points : `p.naissance.jour` → 4. âge = `2026 - p.naissance.annee`.",
        ...E(0, {consigne: "Dans `Personne`, la date de naissance est un champ comme un autre : un type, puis un nom. Écris la déclaration de ce champ (type `Date`, nom `naissance`)."}),
        ...E(1, {consigne: "Pour atteindre le **mois** de naissance d'une `Personne p`, on passe d'abord par le champ `naissance`, puis par le champ `mois` de cette date. Écris l'expression."}),
        ...E(2, {consigne: "Premier jalon, avec `Date` seulement : lis un nom (dans `char nom[30]`) puis `jour mois annee` dans une `Date d`, et affiche `nom j/m/a`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Ajoute le type `Personne` (nom + `Date naissance`), lis directement dans `p.nom` et `p.naissance.…`, et affiche en plus l'âge atteint en 2026 en fin de ligne.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS); return {E0: `${a} ${R.entre(1, 28)} ${R.entre(1, 12)} ${R.entre(1950, 2010)}`, E1: `${b} ${R.entre(1, 28)} ${R.entre(1, 12)} ${R.entre(1950, 2010)}`}; },
    },
    "c10-104": {
      set: {
        enonce: "Reprends l'exemple du cours : `typedef struct { char nom[50]; int age; double salaire; } Employe;` et `void augmenter_salaire(Employe *e, double pourcentage)`. `main` lit un nom, un âge, un salaire et un pourcentage, appelle la fonction **avec l'adresse** de l'employé, puis affiche le nouveau salaire avec 2 décimales.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. la fonction reçoit l'**adresse** d'un `Employe` → 2. avec un pointeur sur structure, on atteint les champs par la flèche `->` : `e->salaire` → 3. `main` appelle `augmenter_salaire(&emp, pct)`.",
        ...E(0, {consigne: "Quand on a un **pointeur** `e` sur une structure, on n'utilise pas le point mais la flèche `->` pour atteindre un champ. Écris l'accès au champ `salaire` à travers `e`."}),
        ...E(1, {consigne: "Pour que la fonction modifie le vrai `emp` de `main` (et pas une copie), on lui donne son adresse. Écris l'appel de `augmenter_salaire` pour `emp` avec le pourcentage `pct`."}),
        ...E(2, {consigne: "Premier jalon, sans fonction : lis le nom, l'âge, le salaire et le pourcentage dans un `Employe emp` et un `double pct`, augmente `emp.salaire` du pourcentage directement dans `main`, et affiche-le avec 2 décimales.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Déplace l'augmentation dans `void augmenter_salaire(Employe *e, double pourcentage)` : dans la fonction, `emp.salaire` devient `e->salaire`. `main` l'appelle avec `&emp`, puis affiche le salaire.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS); return {E0: `${a} ${R.entre(20, 60)} ${R.un([1800, 2000, 2500, 3200, 35000])} ${R.un([5, 10, 2.5, 20])}`, E1: `${b} ${R.entre(20, 60)} ${R.entre(15, 50)*100} ${R.un([3, 4, 12.5])}`}; },
    },
    "c10-105": {
      set: {
        enonce: "Définis `typedef struct { char nom[30]; int note; } Etudiant;`. Le programme lit `n` (au plus 50), puis `n` lignes `nom note`, rangées dans un **tableau d'`Etudiant`**. Il affiche la moyenne (2 décimales) puis le nom du meilleur étudiant (le premier en cas d'égalité).\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `Etudiant classe[50];` → 2. à chaque tour, lire `classe[i].nom` et `&classe[i].note` → 3. cumuler la somme → 4. retenir l'**indice** `best` du meilleur → 5. moyenne réelle.",
        ...E(0, {consigne: "Écris le `scanf` qui lit le nom puis la note de l'étudiant d'indice `i` (`nom note`, nom limité à 29 caractères). Rappel : le nom est un tableau (pas de `&`), la note est un entier (avec `&`)."}),
        ...E(1, {consigne: "`best` est l'indice du meilleur étudiant trouvé jusqu'ici. Écris la condition (sans `if`) qui est vraie quand l'étudiant `i` a une note **strictement** meilleure (pour garder le premier en cas d'égalité)."}),
        ...E(2, {consigne: "Premier jalon, sans structure : lis `n` puis `n` notes seules (des entiers), et affiche la moyenne (2 décimales) puis l'**indice** de la meilleure note.", "verif.tests": tests("[[F0]]", "[[F1]]")}),
        ...E(3, {consigne: "Range maintenant le nom **et** la note dans un tableau `Etudiant classe[50]` (type déclaré avant `main`), et affiche à la fin la moyenne puis le **nom** du meilleur : `classe[best].nom`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const mk = n => { const noms = R.melange(NOMS).slice(0, n), notes = Array.from({length: n}, () => R.entre(5, 20)); return [noms.map((x, i) => `${x} ${notes[i]}`), notes]; };
        const n0 = R.entre(3, 5), [l0, t0] = mk(n0), [l1, t1] = mk(2);
        return {E0: [n0, ...l0].join("\n"), E1: [2, ...l1].join("\n"), F0: [n0, ...t0].join("\n"), F1: [2, ...t1].join("\n")}; },
    },
    "c10-106": {
      set: {
        enonce: "Définis `typedef struct { char nom[30]; char tel[15]; } Contact;`. Le programme lit `n`, alloue un annuaire de `n` contacts avec `calloc`, lit les `n` lignes `nom tel`, puis lit un nom à chercher et affiche son téléphone, ou `inconnu`. Il libère l'annuaire à la fin.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `calloc(n, sizeof(Contact))` : `sizeof` marche aussi sur un type structure → 2. test `NULL`, lecture des contacts → 3. lire le nom cherché → 4. comparer les noms avec `strcmp(…) == 0` → 5. afficher le téléphone ou `inconnu` → 6. `free`.",
        ...E(0, {consigne: "Écris la ligne qui déclare `Contact *annuaire` et lui donne, avec `calloc`, la place de `n` contacts (la taille d'un élément est celle d'un `Contact`)."}),
        ...E(1, {consigne: "On ne compare pas deux chaînes avec `==` (ça comparerait des adresses) : on utilise `strcmp`, qui renvoie 0 quand elles sont égales. Écris la condition (sans `if`) vraie quand le nom du contact `i` est égal à `cherche`."}),
        ...E(2, {consigne: "Premier jalon, avec un tableau ordinaire `Contact annuaire[50]` : lis `n`, les `n` contacts (`nom tel`), puis le nom cherché, et affiche le téléphone du premier contact qui porte ce nom, ou `inconnu`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Remplace le tableau `Contact annuaire[50]` par un bloc de `n` contacts obtenu avec `calloc` (après la lecture de `n`, avec le test `NULL`), et libère-le avec `free` à la fin.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const mk = (n, present) => { const noms = R.melange(NOMS).slice(0, n + 1), l = noms.slice(0, n).map(x => `${x} ${tel(R)}`); return [n, ...l, present ? noms[R.entre(0, n - 1)] : noms[n]].join("\n"); };
        return {E0: mk(R.entre(3, 5), true), E1: mk(R.entre(1, 3), false), E2: mk(R.entre(2, 6), true)}; },
    },
    "c10-107": {
      set: {
        enonce: "La fonction `vieillir` doit ajouter un an à la personne. Avec `[[E0]]`, le programme devrait afficher `[[A1]]`, mais il affiche `[[A0]]`. Corrige la fonction (et son appel).\n```c\n#include <stdio.h>\n\ntypedef struct {\n    char nom[30];\n    int age;\n} Personne;\n\nvoid vieillir(Personne p) {\n    p.age++;\n}\n\nint main(void) {\n    Personne moi;\n    scanf(\"%29s %d\", moi.nom, &moi.age);\n    vieillir(moi);\n    printf(\"%d\\n\", moi.age);\n    return 0;\n}\n```",
        ...E(0, {consigne: "`vieillir(Personne p)` reçoit la personne **par valeur**. Quand elle fait `p.age++`, que modifie-t-elle : la variable `moi` de `main`, ou une copie ? (un mot)"}),
        ...E(1, {consigne: "Une fois le paramètre devenu un pointeur `Personne *p`, on atteint le champ `age` avec la flèche. Écris l'instruction qui ajoute un an."}),
        ...E(2, {consigne: "Corrige le programme pour que `vieillir` modifie la personne de `main` : le paramètre devient un pointeur (`Personne *p`), l'accès se fait avec `->`, et l'appel passe l'adresse (`&moi`).", "verif.tests": tests("[[E0]]", "[[E1]]")}),
      },
      tirer: R => { const [a, b] = R.melange(NOMS), A0 = R.entre(15, 70); return {A0, A1: A0 + 1, E0: `${a} ${A0}`, E1: `${b} ${R.entre(15, 70)}`}; },
    },
    "c10-108": {
      set: {
        enonce: "Définis `typedef struct { char nom[30]; double prix; int stock; } Produit;` et `int vendre(Produit *p, int quantite)` : si le stock suffit, il le diminue et renvoie 1 ; sinon il ne change rien et renvoie 0. Écris aussi `void afficher(const Produit *p)` qui affiche `nom stock`.\n\n`main` lit un nom, un prix, un stock, puis une quantité : il affiche `vendu` ou `stock insuffisant`, puis appelle `afficher`.\n\n" + ex("[[E0]]", "[[S3_0]]"),
        guidage: "**Plan** : 1. `vendre` modifie le produit → elle reçoit son adresse (`Produit *p`) → 2. si `p->stock < quantite`, renvoyer 0 ; sinon diminuer et renvoyer 1 → 3. `afficher` ne fait que lire → pointeur `const` → 4. `main` : `if (vendre(&prod, q))` puis `afficher(&prod)`.",
        ...E(0, {consigne: "Dans `vendre`, quand le stock suffit, il faut retirer `quantite` du stock du produit pointé par `p`. Écris cette instruction."}),
        ...E(1, {consigne: "`afficher` ne fait que lire le produit : on le promet au compilateur avec `const` devant le type pointé. Écris l'en-tête de `afficher`."}),
        ...E(2, {consigne: "Premier jalon, sans fonction : lis le nom, le prix, le stock et la quantité dans un `Produit prod` et un `int q`. Si `prod.stock >= q`, diminue le stock et affiche `vendu`, sinon `stock insuffisant`. Affiche ensuite `nom stock`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(3, {consigne: "Déplace la vente dans `int vendre(Produit *p, int quantite)` (renvoie 1 ou 0) et l'affichage final dans `void afficher(const Produit *p)`. `main` les appelle tous les deux avec `&prod`.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const nom = () => R.un(["Stylo", "Cahier", "Gomme", "Classeur", "Regle", "Agenda", "Feutre"]), prix = () => `${R.entre(1, 9)}.${R.entre(0, 9)}`;
        const s0 = R.entre(5, 20), s1 = R.entre(1, 4), s2 = R.entre(3, 9);
        return {E0: `${nom()} ${prix()} ${s0} ${R.entre(1, s0)}`, E1: `${nom()} ${prix()} ${s1} ${R.entre(s1 + 1, s1 + 5)}`, E2: `${nom()} ${prix()} ${s2} ${s2}`}; },
    },
    "c10-109": {
      set: {
        enonce: "Recopie la classe ci-dessous, **initialisée à la déclaration** :\n```c\n" + CLASSE.replace(/^    /gm, "") + "```\npuis écris `void afficher_classe(Etudiant etudiants[], int taille)` qui affiche une ligne par étudiant, numérotée à partir de 1 :\n```text\n1. [[N1]] - Note : [[A]]/20\n```\nEnfin, affiche la moyenne de la classe avec 2 décimales sur une dernière ligne.",
        guidage: "**Plan** : 1. chaque `{\"nom\", note}` initialise une structure du tableau → 2. `afficher_classe` boucle sur les étudiants et affiche `i + 1` pour la numérotation → 3. moyenne réelle → 4. `main` appelle la fonction, puis calcule la moyenne.",
        ...E(0, {consigne: "Dans la boucle d'indice `i` de `afficher_classe`, écris le `printf` qui affiche la ligne de l'étudiant `i`, par exemple `1. [[N1]] - Note : [[A]]/20` pour le premier. Le numéro affiché est `i + 1` (on compte à partir de 1 pour l'humain).",
          question: "Ligne d'affichage ?", corrige: "Numéro `i + 1`, puis le nom, puis la note : `printf(\"%d. %s - Note : %d/20\\n\", i + 1, etudiants[i].nom, etudiants[i].note);`"}),
        ...E(1, {consigne: "Quelle est la moyenne de [[A]], [[B]] et [[C]], arrondie à 2 décimales ?", question: "Moyenne attendue ?", "verif.attendu": "[[MOY]]",
          corrige: "([[A]] + [[B]] + [[C]]) / 3 = [[SOM]] / 3 ≈ **[[MOY]]**.", indices: ["Somme [[SOM]], divisée par 3.", "[[MOY]]"]}),
        ...E(2, {consigne: "Premier jalon, sans fonction : déclare `Etudiant classe[3]` initialisé comme dans l'énoncé, et affiche la ligne de chaque étudiant directement dans `main`.",
          verif: {mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: c109a}, corrige: sol(c109a),
          indices: ["Les accolades intérieures initialisent chaque structure : `{\"[[N1]]\", [[A]]}`.", "`i + 1` pour la numérotation."]}),
        ...E(3, {consigne: "Déplace la boucle d'affichage dans `void afficher_classe(Etudiant etudiants[], int taille)` (dans la fonction, `classe[i]` devient `etudiants[i]`). `main` l'appelle avec `(classe, 3)`, puis affiche la moyenne avec 2 décimales sur une dernière ligne.",
          verif: {mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: c109, exige: [{motif: "void\\s+afficher_classe\\s*\\(", msg: "Écris la fonction afficher_classe."}]}, corrige: sol(c109), depart: c109a,
          indices: ["La boucle d'affichage passe dans la fonction.", "Moyenne : `s / 3.0`, avec `s` la somme des trois notes."]}),
      },
      tirer: R => { const [N1, N2, N3] = R.melange(NOMS), [A, B, C] = Array.from({length: 3}, () => R.entre(6, 20)); return {N1, N2, N3, A, B, C}; },
      deriver: v => ({SOM: v.A + v.B + v.C, MOY: dec((v.A + v.B + v.C) / 3)}),
    },
  },
};
