/* Chapitre 5 (Tableaux) : variantes + consignes réécrites (échantillon du 08/11/2026). */
const T = a => "{" + a.join(", ") + "}", L = a => a.join(" ");
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
const exSans = s => "**Sortie attendue**\n```text\n" + s + "\n```";
const tests = (...es) => es.map(e => ({entree: e, sortie: "@auto"}));
const cC = (v, code) => Object.assign({mode: "c", tests: [{entree: "", sortie: "@auto"}], exemple: code}, v);
const tirerDistincts = (R, n, a, b) => R.distincts(n, a, b);
const ENT = "#include <stdio.h>\n\nint main(void) {\n";

/* ---------- codes des exos (les [[CLE]] sont remplacés pour chaque variante) ---------- */
const c101a = ENT + `    int t[[[N]]] = [[TAB]];
    for (int i = 0; i < [[N]]; i += 2) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    return 0;
}`;
const c101b = ENT + `    int t[[[N]]] = [[TAB]];
    printf("{ ");
    for (int i = 0; i < [[N]]; i += 2) {
        printf("%d ", t[i]);
    }
    printf("}\\n");
    return 0;
}`;
const c102a = ENT + `    int t[14] = [[TAB]];
    for (int i = 0; i < 14; i++) {
        if (t[i] % 2 != 0) {
            printf("%d ", t[i]);
        }
    }
    printf("\\n");
    return 0;
}`;
const c102b = ENT + `    int t[14] = [[TAB]];
    int p = 1;
    for (int i = 0; i < 14; i++) {
        if (t[i] % 2 != 0) {
            p *= t[i];
        }
    }
    printf("%d\\n", p);
    return 0;
}`;
const c103a = ENT + `    int t[[[N]]];
    for (int i = 0; i < [[N]]; i++) {
        t[i] = 1;
    }
    for (int i = 0; i < [[N]]; i++) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    return 0;
}`;
const c103b = ENT + `    int t[[[N]]];
    for (int i = 0; i < [[N]]; i++) {
        t[i] = 1;
    }
    for (int i = 0; i < [[N]]; i++) {
        t[i] = t[i] * ([[K]] * i);
        printf("%d ", t[i]);
    }
    printf("\\n");
    return 0;
}`;
const c104a = ENT + `    int jours[12] = {31, [[FEV]], 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    for (int i = 0; i < 12; i++) {
        printf("%d\\n", jours[i]);
    }
    return 0;
}`;
const c104b = ENT + `    int jours[12] = {31, [[FEV]], 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    for (int i = 0; i < 12; i++) {
        printf("Mois %d : %d jours\\n", i + 1, jours[i]);
    }
    return 0;
}`;
const c105a = ENT + `    int t[[[N]]];
    for (int i = 0; i < [[N]]; i++) {
        scanf("%d", &t[i]);
    }
    for (int i = 0; i < [[N]]; i++) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    return 0;
}`;
const c105b = ENT + `    int t[[[N]]], s = 0;
    for (int i = 0; i < [[N]]; i++) {
        scanf("%d", &t[i]);
    }
    for (int i = 0; i < [[N]]; i++) {
        printf("%d ", t[i]);
        s += t[i];
    }
    printf("\\n%d %.2f\\n", s, s / [[N]].0);
    return 0;
}`;
const c106a = `#include <stdio.h>

#define TP [[TP]]

int main(void) {
    int t[TP], tl, x;
    scanf("%d", &tl);
    for (int i = 0; i < tl; i++) {
        scanf("%d", &t[i]);
    }
    scanf("%d", &x);
    if (tl < TP) {
        t[tl] = x;
        tl++;
    }
    for (int i = 0; i < tl; i++) printf("%d ", t[i]);
    printf("\\n");
    return 0;
}`;
const c106b = c106a.replace(`    printf("\\n");
    return 0;`, `    printf("\\n");
    if (tl > 0) {
        tl--;
    }
    for (int i = 0; i < tl; i++) printf("%d ", t[i]);
    printf("\\n");
    return 0;`);
const c107d = ENT + `    int t[[[N]]] = [[TAB]];
    printf("%d\\n", t);
    return 0;
}`;
const c107 = ENT + `    int t[[[N]]] = [[TAB]];
    for (int i = 0; i < [[N]]; i++) {
        printf("%d ", t[i]);
    }
    printf("\\n");
    return 0;
}`;
const c108d = ENT + `    int t1[[[N]]], t2[[[N]]];
    for (int i = 0; i < [[N]]; i++) scanf("%d", &t1[i]);
    for (int i = 0; i < [[N]]; i++) scanf("%d", &t2[i]);
    if (t1 == t2) {
        printf("egaux\\n");
    } else {
        printf("differents\\n");
    }
    return 0;
}`;
const c108 = ENT + `    int t1[[[N]]], t2[[[N]]], egaux = 1;
    for (int i = 0; i < [[N]]; i++) scanf("%d", &t1[i]);
    for (int i = 0; i < [[N]]; i++) scanf("%d", &t2[i]);
    for (int i = 0; i < [[N]]; i++) {
        if (t1[i] != t2[i]) {
            egaux = 0;
        }
    }
    if (egaux) {
        printf("egaux\\n");
    } else {
        printf("differents\\n");
    }
    return 0;
}`;
const c109a = ENT + `    int t[19] = [[TAB]];
    int val, trouve = 0;
    scanf("%d", &val);
    for (int i = 0; i < 19; i++) {
        if (t[i] == val) {
            trouve = 1;
            break;
        }
    }
    printf("%d\\n", trouve);
    return 0;
}`;
const c109b = c109a.replace(`    printf("%d\\n", trouve);`, `    if (trouve) printf("trouve\\n");
    else printf("absent\\n");`);

/* ---------- tirages communs ---------- */
const liste = (R, n, a, b) => Array.from({length: n}, () => R.entre(a, b));
const saisie = (n, t, ...plus) => [n, L(t), ...plus].join("\n");

export default {
  banque: "programmation-c/c-5-tableaux.json",
  n: 8,
  items: {
    /* ======================= questions courtes ======================= */
    "c5-001": {
      set: {enonce: "Combien de cases contient le tableau déclaré par `[[TYPE]] [[NOM]][[[N]]];` ?", "verif.attendu": "[[N]]",
        explication: "Le nombre entre crochets, c'est le nombre de cases : ici **[[N]]**. Le type (`[[TYPE]]`) dit seulement ce que contient chaque case."},
      tirer: R => { const [TYPE, NOM] = R.un([["int", "notes"], ["double", "prix"], ["char", "lettres"], ["int", "scores"], ["double", "temperatures"], ["int", "t"]]); return {TYPE, NOM, N: R.entre(4, 16)}; },
    },
    "c5-002": {
      set: {enonce: "Quel est l'indice de la **dernière** case de `[[TYPE]] [[NOM]][[[N]]];` ?", "verif.attendu": "[[M]]",
        explication: "Les cases sont numérotées à partir de 0 : de `[[NOM]][0]` à `[[NOM]][[[M]]]`. Le dernier indice vaut donc [[N]] − 1 = **[[M]]**."},
      tirer: R => { const [TYPE, NOM] = R.un([["int", "notes"], ["double", "prix"], ["char", "lettres"], ["int", "scores"], ["double", "temperatures"], ["int", "t"]]); return {TYPE, NOM, N: R.entre(4, 16)}; },
      deriver: v => ({M: v.N - 1}),
    },
    "c5-003": {
      set: {enonce: "Que vaut `t[[[K]]]` après `int t[[[N]]] = {[[A]], [[B]]};` ?",
        explication: "On n'a donné que 2 valeurs : elles remplissent `t[0]` et `t[1]`. Toutes les autres cases, dont `t[[[K]]]`, sont mises à **0**."},
      tirer: R => { const N = R.entre(4, 9); return {N, A: R.entre(1, 20), B: R.entre(1, 20), K: R.entre(2, N - 1)}; },
    },
    "c5-004": {
      set: {enonce: "Qu'affiche ce code ?\n```c\nint t[4] = {[[A]], [[B]], [[C]], [[D]]};\nint s = 0;\nfor (int i = 0; i < 4; i++) s += t[i];\nprintf(\"%d\", s);\n```",
        "verif.attendu": "[[S]]", explication: "La boucle additionne les 4 cases une par une : [[A]] + [[B]] + [[C]] + [[D]] = **[[S]]**."},
      tirer: R => { const [A, B, C, D] = liste(R, 4, 0, 9); return {A, B, C, D}; },
      deriver: v => ({S: v.A + v.B + v.C + v.D}),
    },
    "c5-006": {
      set: {enonce: "Qu'affiche ce code ? (nombres séparés par des espaces)\n```c\nint t[5] = [[TAB]];\nfor (int i = [[DEB]]; i >= 0; i -= [[PAS]]) printf(\"%d \", t[i]);\n```",
        "verif.attendu": ["[[R]]"], explication: "`i` vaut successivement [[IDX]], puis devient négatif et la boucle s'arrête. On affiche donc les cases correspondantes : **[[R]]**."},
      tirer: R => ({TAB: T(R.distincts(5, 1, 9).map(x => x*10)), DEB: R.un([4, 3]), PAS: R.un([1, 2, 2, 3])}),
      deriver: v => { const t = v.TAB.slice(1, -1).split(", "), idx = []; for(let i = v.DEB; i >= 0; i -= v.PAS) idx.push(i);
        return {IDX: idx.join(", "), R: idx.map(i => t[i]).join(" ")}; },
    },
    "c5-009": {
      set: {enonce: "Un tableau a une taille physique de [[TP]] et une taille logique `tl = [[A]]`. On ajoute [[XA]] à la fin, puis on supprime [[YS]] le dernier élément. Que vaut `tl` maintenant ?",
        "verif.attendu": "[[R]]", explication: "Chaque ajout fait `tl++`, chaque suppression `tl--` : [[A]] + [[X]] − [[Y]] = **[[R]]**. La taille physique, elle, ne bouge jamais."},
      tirer: R => { const X = R.entre(1, 3), Y = R.entre(1, 3); return {TP: R.un([10, 15, 20, 50]), A: R.entre(2, 8), X, Y, XA: X > 1 ? `${X} éléments` : "1 élément", YS: Y > 1 ? `${Y} fois` : "une fois"}; },
      deriver: v => ({R: v.A + v.X - v.Y}),
    },
    "c5-012": {
      set: {enonce: "Quelle boucle **sort** du tableau `int t[[[N]]];` (elle lit une case qui n'existe pas) ?",
        choix: ["for (int i = 0; i <= [[N]]; i++)", "for (int i = 0; i < [[N]]; i++)", "for (int i = [[M]]; i >= 0; i--)", "for (int i = 1; i < [[N]]; i++)"],
        explication: "Avec `i <= [[N]]`, le dernier tour lit `t[[[N]]]`, qui n'existe pas : le dernier indice est [[M]]. Les autres boucles restent entre 0 et [[M]] (celle qui part de 1 saute juste la première case)."},
      tirer: R => ({N: R.entre(4, 12)}), deriver: v => ({M: v.N - 1}),
    },
    "c5-013": {
      set: {enonce: "Combien vaut `nb` à la fin ?\n```c\nint t[6] = [[TAB]];\nint nb = 0;\nfor (int i = 0; i < 6; i++) if (t[i] == [[X]]) nb++;\n```",
        "verif.attendu": "[[R]]", explication: "`nb` augmente de 1 à chaque case égale à [[X]] : [[X]] apparaît aux indices [[POS]], donc **[[R]]** fois."},
      tirer: R => { const pool = R.melange([2, 3, 4, 5, 7, 8, 9]).slice(0, 3), t = Array.from({length: 6}, () => R.un(pool)); return {TAB: T(t), X: t[R.entre(0, 5)]}; },
      deriver: v => { const t = v.TAB.slice(1, -1).split(", ").map(Number), p = t.map((x, i) => x === v.X ? i : -1).filter(i => i >= 0);
        return {POS: p.join(", "), R: p.length}; },
    },
    "c5-014": {
      set: {enonce: "Que vaut `pos` à la fin ?\n```c\nint t[5] = [[TAB]];\nint pos = -1;\nfor (int i = 0; i < 5; i++) {\n    if (t[i] == [[X]]) { pos = i; break; }\n}\n```",
        "verif.attendu": "[[R]]", explication: "La première case qui vaut [[X]] est à l'indice **[[R]]** ; le `break` arrête la boucle tout de suite, donc une éventuelle deuxième occurrence n'est jamais vue."},
      tirer: R => { const t = R.distincts(5, 1, 9), X = t[R.entre(0, 4)], j = R.entre(0, 4); if(R.entre(0, 1)) t[j] = X; return {TAB: T(t), X}; },
      deriver: v => ({R: v.TAB.slice(1, -1).split(", ").map(Number).indexOf(v.X)}),
    },
    "c5-015": {
      set: {enonce: "Après un décalage circulaire **à gauche** de `[[TAB]]`, que contient le tableau ? (nombres séparés par des espaces)", "verif.attendu": ["[[R]]"],
        explication: "Chaque valeur recule d'une case, et la première ([[P]]) fait le tour pour se placer à la fin : **[[R]]**."},
      tirer: R => ({TAB: T(R.distincts(4, 1, 9))}),
      deriver: v => { const t = v.TAB.slice(1, -1).split(", "); return {P: t[0], R: L(t.slice(1).concat(t[0]))}; },
    },

    /* ======================= exos ======================= */
    "c5-101": {
      set: {
        enonce: "On a le tableau de [[N]] entiers `[[TAB]]`.\n\nÉcris un programme qui affiche, sur une seule ligne, les valeurs rangées dans les cases d'**indice pair** (cases 0, 2, 4…), entre accolades et séparées par des espaces.\n\n" + exSans("[[RES]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 1)",
        guidage: "**Plan** : 1. repérer quelles cases ont un indice pair → 2. les parcourir en sautant une case sur deux → 3. ajouter les accolades autour.\n\n**Piège** : on parle de la **position** paire (l'indice), pas de la valeur paire.",
        ...E(0, {consigne: "Les [[N]] cases sont numérotées de 0 à [[M]]. Compte celles dont le numéro est pair (0, 2, 4…) : c'est le nombre de valeurs que ton programme devra afficher.",
          question: "Combien de cases ont un indice pair ?", "verif.attendu": "[[NP]]",
          corrige: "Les indices pairs vont de 0 à [[MP]] de 2 en 2 : cela fait **[[NP]]** cases.", indices: ["Écris les numéros de 0 à [[M]] et barre les impairs.", "0, 2, 4… jusqu'à [[MP]] : compte-les."]}),
        ...E(1, {consigne: "Première version, sans les accolades : affiche les valeurs des cases d'indice pair, séparées par un espace.\n\nD'habitude, une boucle `for` avance d'une case à la fois avec `i++`. Ici tu veux sauter une case sur deux : fais avancer `i` de **2** à chaque tour.",
          question: "Affiche les valeurs des cases d'indice pair.", verif: cC({}, c101a), corrige: sol(c101a),
          indices: ["Remplace `i++` par une instruction qui ajoute 2 à `i`.", "`for (int i = 0; i < [[N]]; i += 2)`, et dans la boucle `printf(\"%d \", t[i]);`."]}),
        ...E(2, {consigne: "Il ne reste qu'à habiller l'affichage : écris `{ ` avant la boucle et `}` après, le tout sur **une seule ligne** :\n```text\n[[RES]]\n```",
          question: "Écris le programme complet.", verif: cC({}, c101b), corrige: sol(c101b), depart: c101a,
          indices: ["Un `printf(\"{ \");` avant la boucle, un `printf(\"}\\n\");` après.", "Chaque valeur est déjà suivie d'une espace : le `}` final tombe donc au bon endroit."]}),
      },
      tirer: R => { const N = R.entre(10, 15), t = R.distincts(N, -40, 99); return {N, TAB: T(t), RES: "{ " + t.filter((_, i) => i % 2 === 0).join(" ") + " }"}; },
      deriver: v => ({M: v.N - 1, NP: Math.ceil(v.N / 2), MP: (v.N - 1) % 2 ? v.N - 2 : v.N - 1}),
    },
    "c5-102": {
      set: {
        enonce: "On a le tableau de 14 entiers `[[TAB]]`.\n\nÉcris un programme qui **multiplie entre elles** toutes les valeurs **impaires** du tableau (négatives comprises) et affiche le produit obtenu.\n\n" + exSans("[[P]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 2)",
        guidage: "**Plan** : 1. savoir reconnaître un entier impair, même négatif → 2. ne garder que ces valeurs → 3. les multiplier dans une variable qui part de **1**.\n\n**Piège** : en C, `-3 % 2` vaut `-1`, pas `1`.",
        ...E(0, {consigne: "Pour savoir si un nombre est impair, on regarde le reste de sa division par 2 avec `%`. Attention : en C, ce reste garde le **signe** du nombre de départ. Que vaut `-[[A]] % 2` ?",
          question: "Que vaut `-[[A]] % 2` ?", corrige: "-[[A]] = 2 × ([[Q]]) + (-1) : le reste vaut **-1**. Un test `t[i] % 2 == 1` raterait donc les impairs négatifs.",
          indices: ["Le reste a le même signe que -[[A]].", "Le reste vaut -1."]}),
        ...E(1, {consigne: "Écris seulement la **condition** (ce qu'on mettrait entre les parenthèses d'un `if`) qui est vraie quand `t[i]` est impair, **y compris** s'il est négatif.",
          question: "Condition « `t[i]` est impair » ?", indices: ["Un nombre pair a un reste nul. Un impair a un reste… pas nul.", "Teste si le reste est **différent de 0** : `!=`."]}),
        ...E(2, {consigne: "Avant de multiplier, vérifie que tu repères bien les bonnes valeurs : affiche les valeurs **impaires** du tableau, séparées par un espace.",
          question: "Affiche les valeurs impaires.", verif: cC({}, c102a), corrige: sol(c102a),
          indices: ["Une boucle sur les 14 cases, avec un `if` dedans.", "`if (t[i] % 2 != 0) { printf(\"%d \", t[i]); }`"]}),
        ...E(3, {consigne: "Maintenant, au lieu d'afficher chaque valeur impaire, **multiplie-la** dans une variable `p`, et affiche seulement `p` à la fin.\n\nAttention à la valeur de départ de `p` : un produit qui commence à 0 reste toujours 0.",
          question: "Écris le programme complet.", verif: cC({nombres: true}, c102b), corrige: sol(c102b), depart: c102a,
          indices: ["Déclare `int p = 1;` avant la boucle, puis `p *= t[i];` à la place du `printf`.", "Le `printf(\"%d\\n\", p);` se place **après** la boucle."]}),
      },
      tirer: R => {
        for(;;){ const t = Array.from({length: 14}, () => R.entre(0, 2) ? 2*R.entre(-16, 15) : 2*R.entre(-4, 9) + 1);
          const imp = t.filter(x => x % 2 !== 0), neg = imp.filter(x => x < 0);
          const p = imp.reduce((a, b) => a*b, 1);
          if(imp.length >= 4 && imp.length <= 7 && neg.length && Math.abs(p) < 2e9 && !imp.includes(1) && !imp.includes(-1)) return {TAB: T(t), P: p, A: R.un([3, 5, 7, 9])}; }
      },
      deriver: v => ({Q: (1 - v.A) / 2}),
    },
    "c5-103": {
      set: {
        enonce: "Écris un programme qui crée un tableau de [[N]] entiers, met **toutes** les cases à 1, puis multiplie chaque case par **[[K]] fois son indice** (la case `i` devient `1 × [[K]] × i`). Affiche ensuite le tableau sur une ligne, valeurs séparées par un espace.\n\nL'affichage commence par `0 [[K]] [[K2]] [[K3]] …` (Tableaux_chainex, intermédiaire ex. 3, adapté).",
        guidage: "**Plan** : 1. déclarer [[N]] cases → 2. les mettre toutes à 1 → 3. multiplier chacune par `[[K]] * i` → 4. afficher.\n\n**Piège** : les indices vont de 0 à **[[M]]**, pas jusqu'à [[N]].",
        ...E(0, {consigne: "La case d'indice `i` vaut 1 au départ, puis on la multiplie par `[[K]] * i`. Que contient la case d'indice [[J]] à la fin ?",
          question: "Valeur de `t[[[J]]]` ?", "verif.attendu": "[[KJ]]", corrige: "1 × ([[K]] × [[J]]) = **[[KJ]]**.", indices: ["Remplace `i` par [[J]] dans `[[K]] * i`."]}),
        ...E(1, {consigne: "Ta boucle doit passer par toutes les cases, de 0 à [[M]], sans jamais aller jusqu'à [[N]]. Écris seulement la **condition** qu'on met au milieu du `for` (entre les deux `;`), avec la variable `i`.",
          question: "Condition de la boucle ?", verif: {mode: "regex", motif: "\\(?\\s*i\\s*<\\s*[[N]]\\s*\\)?|\\(?\\s*i\\s*<=\\s*[[M]]\\s*\\)?", exemple: "i < [[N]]"},
          corrige: "Les indices valides vont de 0 à [[M]] : `i < [[N]]` (ou `i <= [[M]]`).", indices: ["Le dernier indice est [[M]], pas [[N]].", "`i < [[N]]`."]}),
        ...E(2, {consigne: "Commence sans la multiplication : déclare un tableau `t` de [[N]] entiers, mets **toutes les cases à 1** avec une boucle, puis affiche le tableau sur une ligne (valeurs séparées par un espace). Tu dois voir [[N]] fois `1`.",
          question: "Remplis de 1 et affiche.", verif: cC({}, c103a), corrige: sol(c103a),
          indices: ["Une boucle pour remplir (`t[i] = 1;`), une autre pour afficher.", "Deux `for (int i = 0; i < [[N]]; i++)` à la suite."]}),
        ...E(3, {consigne: "Ajoute la multiplication : chaque case doit être multipliée par `[[K]] * i`, soit `t[i] = t[i] * ([[K]] * i);`. Tu peux la mettre dans la boucle de remplissage ou juste avant le `printf` de la boucle d'affichage.",
          question: "Écris le programme complet.", verif: cC({nombres: true}, c103b), corrige: sol(c103b), depart: c103a,
          indices: ["Une seule ligne à ajouter : `t[i] = t[i] * ([[K]] * i);`, avant le `printf` de cette case.", "La case 0 vaut 1 × 0 = 0 : l'affichage doit commencer par `0 [[K]] [[K2]] …`."]}),
      },
      tirer: R => { const N = R.entre(15, 30); return {N, K: R.un([2, 3, 4, 5, 10]), J: R.entre(3, N - 1)}; },
      deriver: v => ({M: v.N - 1, K2: 2*v.K, K3: 3*v.K, KJ: v.K*v.J}),
    },
    "c5-104": {
      set: {
        enonce: "Écris un programme qui range dans un tableau `jours` le nombre de jours de chacun des 12 mois d'une année **[[ANNEE]]** (`31, [[FEV]], 31, 30, 31, 30, 31, 31, 30, 31, 30, 31`), puis affiche une ligne par mois :\n```text\nMois 1 : 31 jours\nMois 2 : [[FEV]] jours\n…\nMois 12 : 31 jours\n```\n(Tableaux_chainex, intermédiaire ex. 4, adapté)",
        guidage: "**Plan** : 1. un tableau de 12 entiers → 2. une boucle sur les 12 cases → 3. pour la case `i`, afficher `i + 1` (le numéro du mois) et `jours[i]` (son nombre de jours).\n\n**Piège** : janvier est rangé à l'indice 0, mais on l'affiche « Mois 1 ».",
        ...E(0, {consigne: "Le tableau commence par janvier, puis février, mars… Comme les indices démarrent à 0, à quel **indice** se trouve [[MOIS]] ?",
          question: "Indice de [[MOIS]] ?", "verif.attendu": "[[IM]]", corrige: "[[MOIS]] est le mois n° [[NM]] ; on enlève 1 parce qu'on compte à partir de 0 : indice **[[IM]]**.",
          indices: ["Janvier → 0, février → 1, mars → 2…", "Numéro du mois moins 1."]}),
        ...E(1, {consigne: "Pour la case d'indice `i`, quel numéro de mois faut-il afficher ? Écris l'expression avec `i` (par exemple, la case 2 doit afficher « Mois 3 »).",
          question: "Numéro de mois affiché pour la case `i` ?"}),
        ...E(2, {consigne: "Première version : déclare le tableau `jours` (12 entiers) et affiche les 12 valeurs, **une par ligne**, sans texte autour pour l'instant.",
          question: "Affiche les 12 durées.", verif: cC({}, c104a), corrige: sol(c104a),
          indices: ["`int jours[12] = {31, [[FEV]], …};` puis une boucle de 0 à 11.", "`for (int i = 0; i < 12; i++) printf(\"%d\\n\", jours[i]);`"]}),
        ...E(3, {consigne: "Ajoute le texte autour : chaque ligne doit devenir `Mois 1 : 31 jours`, `Mois 2 : [[FEV]] jours`… Ton `printf` affiche maintenant **deux** nombres : le numéro du mois, puis son nombre de jours.",
          question: "Écris le programme complet.", verif: cC({}, c104b), corrige: sol(c104b), depart: c104a}),
      },
      tirer: R => { const b = R.entre(0, 1), m = R.entre(3, 12); const noms = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
        return {ANNEE: b ? "bissextile" : "non bissextile", FEV: b ? 29 : 28, MOIS: noms[m - 1], NM: m, IM: m - 1}; },
    },
    "c5-105": {
      set: {
        enonce: "Écris un programme qui déclare un tableau de [[N]] entiers et les fait saisir au clavier. Il affiche ensuite le tableau sur une ligne, puis, sur la ligne suivante, la **somme** et la **moyenne** (avec 2 décimales).\n\n" + ex("[[E0]]", "[[S3_0]]") + "\n\n(exercice du cours Tableaux)",
        guidage: "**Plan** : 1. remplir le tableau avec `scanf` dans une boucle → 2. l'afficher, en ajoutant chaque valeur à la somme au passage → 3. calculer une moyenne **réelle**.\n\n**Piège** : `s / [[N]]` avec deux `int` est une division entière : la partie décimale est perdue.",
        ...E(0, {consigne: "Dans la boucle de saisie, `scanf` doit ranger l'entier tapé dans la case d'indice `i` du tableau `t`. Écris cette instruction (n'oublie pas que `scanf` veut l'**adresse** de la case)."}),
        ...E(1, {consigne: "La somme `s` est un `int` qui vaut [[SS]]. Que vaut `s / [[N]]` en C, où les deux opérandes sont des entiers ?",
          question: "Valeur de `s / [[N]]` ?", "verif.attendu": "[[SD]]", corrige: "[[SS]] = [[N]] × [[SD]] + [[SR]] : la division entière garde **[[SD]]** et jette le reste. Pour une moyenne exacte, il faut un réel : `s / [[N]].0`.",
          indices: ["Combien de fois [[N]] rentre-t-il dans [[SS]] ?", "La partie décimale est perdue : [[SD]]."]}),
        ...E(2, {consigne: "Déclare un tableau de [[N]] entiers, remplis-le au clavier avec une boucle, puis affiche-le sur une ligne (valeurs séparées par un espace).",
          question: "Saisis puis affiche le tableau.", verif: cC({tests: tests("[[E0]]", "[[E1]]")}, c105a), corrige: sol(c105a),
          indices: ["Une boucle de saisie, puis une boucle d'affichage.", "`scanf(\"%d\", &t[i]);` dans la première, `printf(\"%d \", t[i]);` dans la seconde."]}),
        ...E(3, {consigne: "Ajoute la somme et la moyenne sur une **deuxième ligne** : `somme moyenne`, la moyenne avec 2 décimales. Tu peux cumuler la somme pendant la boucle d'affichage.",
          question: "Écris le programme complet.", verif: cC({nombres: true, tests: tests("[[E0]]", "[[E1]]")}, c105b), corrige: sol(c105b), depart: c105a,
          indices: ["`int s = 0;` avant la boucle, `s += t[i];` dedans. Après : `printf(\"\\n%d %.2f\\n\", s, s / [[N]].0);`", "`%.2f` affiche 2 décimales ; `[[N]].0` (un réel) évite la division entière."]}),
      },
      tirer: R => { const N = R.entre(4, 6); let SS; do SS = R.entre(11, 49); while(SS % N === 0);
        return {N, SS, E0: L(liste(R, N, -5, 20)), E1: L(liste(R, N, 0, 99))}; },
      deriver: v => ({SD: Math.floor(v.SS / v.N), SR: v.SS % v.N}),
    },
    "c5-106": {
      set: {
        enonce: "Le tableau a une taille physique `TP = [[TP]]` (avec `#define`). Le programme lit d'abord la taille logique `tl` (au plus `TP`), puis les `tl` entiers du tableau, puis un entier `x`.\n\nIl **ajoute** `x` à la fin (seulement s'il reste de la place) et affiche le tableau ; puis il **supprime** le dernier élément (s'il y en a un) et affiche de nouveau le tableau. Un affichage par ligne.\n\n" + ex("[[E0]]", "[[S4_0]]") + "\n\n(exercice du cours Tableaux)",
        guidage: "**Plan** : 1. lire `tl`, les `tl` valeurs, puis `x` → 2. ajouter : ranger `x` dans `t[tl]` puis `tl++` (seulement si `tl < TP`) → 3. afficher → 4. supprimer : un simple `tl--` (si `tl > 0`) → 5. afficher.\n\n**À retenir** : on ne touche jamais à la taille physique ; seule la taille **logique** change.",
        ...E(0, {consigne: "Le tableau contient `tl` valeurs, rangées dans les cases 0 à `tl - 1`. La première case libre est donc juste après. Écris l'instruction qui range `x` dans cette case."}),
        ...E(1, {consigne: "Après l'ajout, le tableau contient une valeur de plus. Écris l'instruction qui met à jour la taille logique `tl`."}),
        ...E(2, {consigne: "Écris le début du programme : `#define TP [[TP]]`, lis `tl`, les `tl` entiers, puis `x`. Ajoute `x` à la fin **seulement si `tl < TP`** (sinon le tableau est plein), et affiche le tableau sur une ligne.",
          question: "Lis, ajoute et affiche.", verif: cC({tests: tests("[[E0]]", "[[E1]]", "[[E2]]")}, c106a), corrige: sol(c106a),
          indices: ["Dans l'ordre : `scanf` de `tl`, boucle de saisie, `scanf` de `x`, ajout, affichage.", "L'ajout est protégé par `if (tl < TP) { t[tl] = x; tl++; }`."]}),
        ...E(3, {consigne: "Pour **supprimer le dernier élément**, faut-il vraiment effacer sa case ? Non : il suffit que le programme ne la compte plus. Écris l'unique instruction qui fait ça."}),
        ...E(4, {consigne: "Termine : si `tl > 0`, supprime le dernier élément, puis affiche de nouveau le tableau sur une **deuxième ligne**.\n\nPense au cas où le tableau était déjà plein : `x` n'a pas pu être ajouté, et c'est alors une valeur d'origine qui disparaît.",
          question: "Écris le programme complet.", verif: cC({nombres: true, tests: tests("[[E0]]", "[[E1]]", "[[E2]]"), exige: [{motif: "#\\s*define\\s+TP\\b", brut: true, msg: "Définis la taille physique avec #define TP [[TP]]."}]}, c106b), corrige: sol(c106b), depart: c106a,
          indices: ["Après le premier affichage : `if (tl > 0) { tl--; }` puis la même boucle d'affichage.", "Deux lignes en sortie, la seconde a une valeur de moins que la première."]}),
      },
      tirer: R => { const TP = R.un([10, 12, 15, 20]), n = R.entre(2, 6);
        return {TP, E0: saisie(n, liste(R, n, 1, 50), R.entre(51, 99)), E1: saisie(1, [R.entre(1, 9)], R.entre(10, 20)), E2: saisie(TP, liste(R, TP, 1, 9), R.entre(10, 99))}; },
    },
    "c5-107": {
      set: {
        enonce: "Ce programme doit afficher les [[N]] valeurs du tableau, séparées par des espaces : `[[RES]]`. Il affiche pourtant tout autre chose.\n```c\n" + c107d + "\n```",
        guidage: "**Diagnostic** : 1. que désigne vraiment `t` tout seul dans `printf(\"%d\\n\", t)` ? → 2. comment afficher chaque case ? → 3. corriger.\n\n**À retenir** : en C, un tableau ne s'affiche jamais d'un coup, mais case par case.",
        ...E(0, {consigne: "Dans `printf(\"%d\\n\", t);`, on donne à `printf` le nom du tableau, sans crochets. Que désigne `t` tout seul ? (réponds en quelques mots)"}),
        ...E(1, {consigne: "Pour afficher les cases une par une, il faut une boucle. Écris l'en-tête complet du `for` (variable `i`) qui passe par les [[N]] cases du tableau.",
          question: "En-tête de la boucle ?", verif: {mode: "regex", motif: "for\\s*\\(\\s*(int\\s+)?i\\s*=\\s*0\\s*;\\s*i\\s*(<\\s*[[N]]|<=\\s*[[M]])\\s*;\\s*(i\\+\\+|\\+\\+i|i\\s*\\+=\\s*1|i\\s*=\\s*i\\s*\\+\\s*1)\\s*\\)\\s*\\{?", exemple: "for (int i = 0; i < [[N]]; i++)"},
          corrige: "[[N]] cases, indices de 0 à [[M]] : `for (int i = 0; i < [[N]]; i++)`.", indices: ["[[N]] cases : indices de 0 à [[M]].", "`for (int i = 0; i < [[N]]; i++)`"]}),
        ...E(2, {consigne: "Corrige le programme : remplace le `printf` fautif par une boucle qui affiche chaque case suivie d'une espace, pour obtenir `[[RES]]`.",
          question: "Corrige le programme.", verif: cC({nombres: true}, c107), corrige: sol(c107), depart: c107d,
          indices: ["Remplace le `printf` actuel par une boucle qui affiche `t[i]`.", "`for (int i = 0; i < [[N]]; i++) { printf(\"%d \", t[i]); }` puis `printf(\"\\n\");`"]}),
      },
      tirer: R => { const N = R.entre(3, 5), t = R.distincts(N, 2, 60).sort((a, b) => a - b); return {N, M: N - 1, TAB: T(t), RES: L(t)}; },
    },
    "c5-108": {
      set: {
        enonce: "Ce programme lit deux tableaux de [[N]] entiers et doit afficher `egaux` s'ils contiennent les mêmes valeurs dans le même ordre, `differents` sinon. Problème : il répond **toujours** `differents`.\n```c\n" + c108d + "\n```",
        guidage: "**Diagnostic** : 1. que compare vraiment `t1 == t2` ? → 2. comment comparer les valeurs ? → 3. corriger.\n\n**Astuce** : pars du principe que les tableaux sont égaux, et change d'avis dès qu'une case diffère.",
        ...E(0, {consigne: "Rappel : un nom de tableau seul (sans crochets) ne donne pas son contenu. Alors, que compare `t1 == t2` ? (réponse courte)"}),
        ...E(1, {consigne: "On utilise un indicateur : `egaux = 1` au départ (« jusqu'ici, tout est pareil »). Dans la boucle, si `t1[i] != t2[i]`, quelle instruction faut-il exécuter ?"}),
        ...E(2, {consigne: "Corrige le programme : compare les deux tableaux **case par case** avec l'indicateur `egaux`, puis affiche `egaux` ou `differents` selon sa valeur.",
          question: "Corrige le programme.", verif: cC({tests: tests("[[E0]]", "[[E1]]", "[[E2]]", "[[E3]]"), interdit: [{motif: "t1\\s*==\\s*t2|t2\\s*==\\s*t1", msg: "t1 == t2 compare des adresses : compare case par case."}]}, c108), corrige: sol(c108), depart: c108d,
          indices: ["`int egaux = 1;`, une boucle sur les [[N]] cases, et `if (t1[i] != t2[i]) egaux = 0;`.", "Après la boucle : `if (egaux) printf(\"egaux\\n\"); else printf(\"differents\\n\");`"]}),
      },
      tirer: R => { const N = R.entre(3, 5), a = liste(R, N, 0, 9), b = a.slice(); b[N - 1] = (b[N - 1] + R.entre(1, 8)) % 10;
        const c = liste(R, N, 0, 9), d = c.slice(); d[0] = (d[0] + R.entre(1, 8)) % 10; const e = liste(R, N, 1, 9);
        return {N, E0: L(a) + "\n" + L(a), E1: L(a) + "\n" + L(b), E2: L(c) + "\n" + L(d), E3: L(e) + "\n" + L(e)}; },
    },
    "c5-109": {
      set: {
        enonce: "Le tableau `[[TAB]]` contient 19 entiers, dans le désordre.\n\nÉcris un programme qui lit un entier `val` et affiche `trouve` si `val` est dans le tableau, `absent` sinon.\n\n" + ex("[[E0]]", "[[S3_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 5)",
        guidage: "**Plan** : 1. un indicateur `trouve = 0` → 2. parcourir le tableau, et mettre `trouve = 1` si une case vaut `val` → 3. afficher selon l'indicateur.\n\n**Piège** : on ne peut dire « absent » qu'après avoir regardé **toutes** les cases.",
        ...E(0, {consigne: "Le tableau n'est pas trié. Tu compares `val` à la première case : ce n'est pas elle. Peux-tu déjà conclure que `val` est absent ? (oui / non)"}),
        ...E(1, {consigne: "Écris seulement la **condition** (ce qu'on mettrait dans un `if`) qui est vraie quand la case d'indice `i` contient la valeur cherchée `val`."}),
        ...E(2, {consigne: "Lis `val`, puis parcours le tableau avec un indicateur `trouve` : 0 au départ, 1 dès qu'une case vaut `val` (et `break` pour arrêter de chercher). Pour l'instant, affiche juste la valeur de l'indicateur : **1 ou 0**.",
          question: "Affiche l'indicateur (1 ou 0).", verif: cC({tests: tests("[[E0]]", "[[E1]]", "[[E2]]")}, c109a), corrige: sol(c109a),
          indices: ["Déclare `int val, trouve = 0;`, lis `val`, puis une boucle avec un `if`.", "Dans le `if` : `trouve = 1; break;`. Affiche `trouve` après la boucle."]}),
        ...E(3, {consigne: "Dernière touche : au lieu d'afficher 1 ou 0, affiche le **mot** `trouve` ou `absent` selon l'indicateur.",
          question: "Écris le programme complet.", verif: cC({tests: tests("[[E0]]", "[[E1]]", "[[E2]]", "[[E3]]")}, c109b), corrige: sol(c109b), depart: c109a,
          indices: ["Remplace le dernier `printf` par un `if (trouve) … else …`.", "`if (trouve) printf(\"trouve\\n\"); else printf(\"absent\\n\");`"]}),
      },
      tirer: R => { const t = R.distincts(19, -30, 130); let abs; do abs = R.entre(-30, 130); while(t.includes(abs));
        return {TAB: T(t), E0: String(t[R.entre(1, 17)]), E1: String(abs), E2: String(t[18]), E3: String(t[0])}; },
    },
    "c5-110": {
      set: {
        enonce: "Écris un programme qui lit un entier `n` (au plus 100), puis `n` entiers qu'il range dans un tableau. Il affiche ensuite le **minimum** du tableau et la **moyenne** (2 décimales), sur une ligne.\n\n" + ex("[[E0]]", "[[S3_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 6 et 7)",
        guidage: "**Plan** : 1. lire `n` puis les `n` valeurs (tableau de taille physique 100) → 2. cumuler la somme pendant la saisie → 3. minimum : partir de `t[0]` puis comparer aux autres cases → 4. moyenne **réelle**.\n\n**Pièges** : démarrer `min` à 0 donne un faux résultat si toutes les valeurs sont positives ; `s / n` avec deux `int` est une division entière.",
        ...E(0, {consigne: "Pour chercher le minimum, on part d'une valeur puis on la remplace dès qu'on trouve plus petit. Démarrer à 0 est un piège : avec `{5, 8, 12}`, on trouverait 0, qui n'est même pas dans le tableau ! Quelle valeur du tableau prendre comme point de départ ? (écris l'expression)"}),
        ...E(1, {consigne: "Lis `n` puis les `n` entiers dans un tableau de taille physique 100, et affiche seulement le **minimum**.",
          question: "Lis les valeurs et affiche le minimum.", verif: cC({tests: tests("[[E0]]", "[[E1]]", "[[E2]]")}, `#include <stdio.h>

int main(void) {
    int t[100], n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &t[i]);
    }
    int min = t[0];
    for (int i = 1; i < n; i++) {
        if (t[i] < min) min = t[i];
    }
    printf("%d\\n", min);
    return 0;
}`)}),
        ...E(2, {consigne: "La somme `s` et le nombre de valeurs `n` sont deux `int`. Écris l'expression qui calcule la moyenne **avec ses décimales** (sans division entière)."}),
        ...E(3, {consigne: "Complète le programme : cumule aussi la somme `s` (dans la boucle de saisie, juste après chaque `scanf`), puis affiche sur une ligne `minimum moyenne`, la moyenne avec 2 décimales.",
          question: "Écris le programme complet.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const n = R.entre(4, 7); return {E0: saisie(n, liste(R, n, -20, 40)), E1: saisie(1, [R.entre(-9, 50)]), E2: saisie(4, liste(R, 4, 5, 90))}; },
    },
    "c5-111": {
      set: {
        enonce: "Écris un programme qui lit `n`, puis `n` entiers, puis une valeur `val`, et affiche le **nombre de fois** où `val` apparaît dans le tableau.\n\n" + ex("[[E0]]", "[[S3_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 8)",
        guidage: "**Plan** : 1. un compteur `nb` à 0 → 2. parcourir **toutes** les cases → 3. `nb++` à chaque case égale à `val` → 4. afficher `nb`.\n\n**Différence avec la recherche** : ici on ne s'arrête jamais avant la fin.",
        ...E(0, {consigne: "Imagine que `val` n'apparaît **nulle part** dans le tableau. Quel nombre le programme doit-il afficher ? (C'est aussi la valeur de départ du compteur.)"}),
        ...E(1, {consigne: "Pour vérifier que tu repères les bonnes cases : lis `n`, les `n` entiers puis `val`, et affiche les **indices** des cases égales à `val`, séparés par un espace.",
          question: "Affiche les indices où se trouve `val`.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(2, {consigne: "Chaque fois qu'une case vaut `val`, le compteur `nb` doit augmenter de 1. Écris cette instruction."}),
        ...E(3, {consigne: "Au lieu d'afficher les indices, **compte** les cases égales à `val` dans `nb`, et affiche seulement ce nombre à la fin.",
          question: "Écris le programme complet.", "verif.tests": tests("[[E0]]", "[[E2]]", "[[E1]]")}),
      },
      tirer: R => { const mk = (n, x, k) => { const t = liste(R, n, 1, 9).map(v => v === x ? x + 1 : v); for(const i of R.melange([...Array(n).keys()]).slice(0, k)) t[i] = x; return t; };
        const n0 = R.entre(5, 8), x0 = R.entre(1, 8), n1 = R.entre(4, 6), x1 = R.entre(1, 8), n2 = R.entre(3, 5), x2 = R.entre(1, 8);
        return {E0: saisie(n0, mk(n0, x0, R.entre(2, 3)), x0), E1: saisie(n1, mk(n1, x1, R.entre(1, 2)), x1), E2: saisie(n2, mk(n2, x2, 0), x2)}; },
    },
    "c5-112": {
      set: {
        enonce: "Écris un programme qui lit `n`, puis `n` entiers, décale toutes les valeurs d'une case **vers la gauche de façon circulaire** (la première passe à la fin), puis affiche le tableau.\n\n" + ex("[[E0]]", "[[S4_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 9)",
        guidage: "**Plan** : 1. mettre `t[0]` de côté → 2. faire reculer chaque case d'un cran (`t[i] = t[i + 1]`, pour `i` de 0 à `n - 2`) → 3. replacer l'ancien premier dans la dernière case → 4. afficher.\n\n**Piège** : sans la sauvegarde, la première valeur est écrasée et perdue.",
        ...E(0, {consigne: "Un décalage circulaire à gauche de `[[TAB]]` donne `[[RES]]`. Que vaut la **dernière** case du résultat ?",
          question: "Dernière valeur du résultat ?", "verif.attendu": "[[P]]", corrige: "Le premier élément ([[P]]) fait le tour et se retrouve à la fin : **[[P]]**.", indices: ["Le premier élément « boucle » vers la fin.", "[[P]]"]}),
        ...E(1, {consigne: "Avant de décaler, on met la première valeur à l'abri dans une variable `premier` (sinon elle sera écrasée). Écris sa déclaration, avec son initialisation."}),
        ...E(2, {consigne: "Dans la boucle de décalage (indice `i`), chaque case prend la valeur de sa voisine de **droite**. Écris cette instruction."}),
        ...E(3, {consigne: "Version sans circularité : lis `n` et les `n` entiers, fais reculer les valeurs d'une case (la première est perdue, on ne la remet **pas** à la fin), puis affiche les `n - 1` premières cases.",
          question: "Décale sans remettre le premier.", "verif.tests": tests("[[E0]]", "[[E1]]")}),
        ...E(4, {consigne: "Rends le décalage **circulaire** : sauvegarde `premier` avant la boucle de décalage, range-le dans la dernière case (`t[n - 1]`) juste après, puis affiche les **`n`** cases.",
          question: "Écris le programme complet.", "verif.tests": tests("[[E0]]", "1\n[[UN]]", "[[E1]]")}),
      },
      tirer: R => { const t = R.distincts(4, 1, 9), n0 = R.entre(4, 7), n1 = R.entre(3, 6);
        return {TAB: T(t), RES: T(t.slice(1).concat(t[0])), P: t[0], UN: R.entre(1, 99), E0: saisie(n0, R.distincts(n0, 1, 50)), E1: saisie(n1, R.distincts(n1, -20, 20))}; },
    },
    "c5-113": {
      set: {
        enonce: "Écris un programme qui lit `n`, puis `n` entiers, puis `val`, et affiche l'**indice de la première case** qui contient `val`, ou `-1` si `val` n'est pas dans le tableau.\n\n" + ex("[[E0]]", "[[S3_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 10)",
        guidage: "**Plan** : 1. `pos = -1` (la valeur « pas trouvé ») → 2. parcourir, et à la première case égale à `val` : `pos = i` puis `break` → 3. afficher `pos`.\n\n**Piège** : l'indice 0 est un vrai indice, donc 0 ne peut pas vouloir dire « absent ».",
        ...E(0, {consigne: "Dans `[[TAB]]`, à quel **indice** se trouve la première case qui vaut [[X]] ?",
          question: "Indice de la 1re occurrence de [[X]] ?", "verif.attendu": "[[IX]]", corrige: "En comptant à partir de 0, la première case qui vaut [[X]] est à l'indice **[[IX]]**.", indices: ["Compte à partir de 0.", "[[IX]]"]}),
        ...E(1, {consigne: "Il faut une valeur de `pos` qui veut dire « pas trouvé ». Elle ne doit jamais pouvoir être confondue avec un vrai indice (et 0 en est un). Laquelle ?"}),
        ...E(2, {consigne: "Lis `n`, les `n` entiers, puis `val`. Affiche l'indice de la **première** case égale à `val` (un `break` évite d'afficher les suivantes). Si `val` est absente, ton programme n'affiche rien pour l'instant.",
          question: "Affiche l'indice de la 1re occurrence.", "verif.tests": tests("[[E0]]", "[[E2]]")}),
        ...E(3, {consigne: "Gère maintenant l'absence : une variable `pos` démarre à -1, retient l'indice trouvé, et tu l'affiches **toujours** à la fin (une seule fois, après la boucle).",
          question: "Écris le programme complet.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const t = R.distincts(5, 1, 9), X = t[R.entre(1, 3)]; t[4] = X; const n0 = R.entre(5, 8), a = R.distincts(n0, 1, 30), x0 = a[R.entre(1, n0 - 2)]; a[n0 - 1] = x0;
        const n1 = R.entre(3, 5), b = R.distincts(n1, 1, 30); let x1; do x1 = R.entre(1, 30); while(b.includes(x1)); const c = R.entre(1, 9);
        return {TAB: T(t), X, IX: t.indexOf(X), E0: saisie(n0, a, x0), E1: saisie(n1, b, x1), E2: saisie(2, [c, c], c)}; },
    },
    "c5-114": {
      set: {
        enonce: "Sans utiliser de fonction toute prête : le programme lit `n`, puis `n` entiers, puis `val`. Il **supprime la première case** qui contient `val` (les cases suivantes reculent d'un cran pour boucher le trou) et affiche le tableau restant. Si `val` est absente, le tableau est affiché tel quel.\n\n" + ex("[[E0]]", "[[S4_0]]") + "\n\n(Tableaux_chainex, intermédiaire ex. 11)",
        guidage: "**Plan** : 1. trouver `pos`, l'indice de la 1re occurrence (comme à l'exo précédent) → 2. si `pos != -1`, boucher le trou : `t[i] = t[i + 1]` pour `i` de `pos` à `n - 2` → 3. `n--` → 4. afficher les `n` cases restantes.\n\n**Piège** : ne décale que si la valeur a été trouvée.",
        ...E(0, {consigne: "On supprime la première occurrence de [[X]] dans `[[TAB]]` : on obtient `[[RES]]`. Que contient alors la case d'indice [[IX]] (celle où était [[X]]) ?",
          question: "Contenu de la case [[IX]] après suppression ?", "verif.attendu": "[[V]]", corrige: "La case suivante a reculé d'un cran pour boucher le trou : `t[[[IX]]]` vaut maintenant **[[V]]**.", indices: ["Chaque case à droite recule d'une place.", "[[V]]"]}),
        ...E(1, {consigne: "Première étape, déjà vue à l'exo précédent : lis `n`, les `n` entiers puis `val`, et affiche `pos`, l'indice de la première occurrence de `val` (ou `-1` si elle est absente).",
          question: "Trouve `pos`.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
        ...E(2, {consigne: "Pour boucher le trou, une boucle part de `pos` et recopie à chaque tour `t[i + 1]` dans `t[i]`. Elle doit s'arrêter avant que `i + 1` atteigne `n` (sinon on lirait en dehors du tableau). Écris l'en-tête complet de ce `for` (variable `i`)."}),
        ...E(3, {consigne: "Une fois le trou bouché, le tableau contient une valeur de moins. Écris l'instruction qui le prend en compte."}),
        ...E(4, {consigne: "Assemble le tout : **si** `pos != -1`, bouche le trou avec la boucle puis fais `n--` ; ensuite affiche les `n` cases sur une ligne. Si `val` est absente, rien ne change et le tableau s'affiche en entier.",
          question: "Écris le programme complet.", "verif.tests": tests("[[E0]]", "[[E1]]", "[[E2]]")}),
      },
      tirer: R => { const t = R.distincts(5, 1, 9), ix = R.entre(0, 3), X = t[ix]; t[4] = X;
        const n0 = R.entre(5, 7), a = R.distincts(n0, 1, 30), x0 = a[R.entre(1, n0 - 2)]; a[n0 - 1] = x0;
        const n1 = R.entre(3, 5), b = R.distincts(n1, 1, 30); let x1; do x1 = R.entre(1, 30); while(b.includes(x1));
        const n2 = R.entre(3, 5), c = R.distincts(n2, 1, 30);
        return {TAB: T(t), X, IX: ix, V: t[ix + 1], RES: T(t.slice(0, ix).concat(t.slice(ix + 1))), E0: saisie(n0, a, x0), E1: saisie(n1, b, x1), E2: saisie(n2, c, c[0])}; },
    },
  },
};
