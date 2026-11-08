/* Chapitre 1 : consignes réécrites + variantes (08/11/2026). */
const sol = c => "Une solution possible :\n```c\n" + c + "\n```";
const E = (k, o) => Object.fromEntries(Object.entries(o).map(([a, b]) => [`etapes.${k}.${a}`, b]));
const prog = (...lignes) => "#include <stdio.h>\n\n" + lignes.join("\n");
const MSGS = ["Bonjour ESILV", "Salut tout le monde", "Bienvenue en C", "Premier essai", "C est parti", "Hello BIC2"];
const c102d = prog("int Main(void) {", '    printf("[[MSG]]\\n")', "    return 0;", "}");
const c102 = prog("int main(void) {", '    printf("[[MSG]]\\n");', "    return 0;", "}");
const c103a = prog("int main(void) {", '    printf("[[L1]]\\n");', '    printf("[[L2]]\\n");', "    return 0;", "}");
const c103 = prog("int main(void) {", '    printf("[[L1]]\\n");', '    printf("[[L2]]\\n");', '    printf("[[L3]]\\n");', "    return 0;", "}");
const c104a = prog("int main(void) {", '    printf("[[N]]\\n"); // affiche [[N]]', "    return 0;", "}");
const c104 = prog("/* Programme qui affiche [[N]] */", "int main(void) {", '    printf("[[N]]\\n"); // affiche [[N]]', "    return 0;", "}");

export default {
  banque: "programmation-c/c-1-prise-en-main.json",
  n: 6,
  items: {
    "c1-017": {
      set: {enonce: "Combien de lignes s'affichent ?\n```c\n[[CODE]]\n```\n(réponds par un nombre)", "verif.attendu": ["[[R]]"],
        explication: "Tout ce qui suit `//` sur la ligne, et tout ce qui est entre `/*` et `*/`, est ignoré par le compilateur. Les lignes affichées sont : [[QUI]], soit **[[R]]**."},
      tirer: R => { const lettres = ["A", "B", "C", "D", "E"].slice(0, R.entre(4, 5)); const lignes = [], vues = [];
        for(const l of lettres){ const k = R.entre(0, 2); lignes.push(k === 0 ? `printf("${l}\\n");` : k === 1 ? `// printf("${l}\\n");` : `/* printf("${l}\\n"); */`); if(k === 0) vues.push(l); }
        if(!vues.length){ lignes[0] = `printf("${lettres[0]}\\n");`; vues.push(lettres[0]); }
        return {CODE: lignes.join("\n"), R: vues.length, QUI: vues.join(", ")}; },
    },
    "c1-101": {
      set: {
        enonce: "Écris ton tout premier programme : il affiche `Hello World` puis passe à la ligne. (TD Premiers pas, exercice 1)",
        guidage: "**Plan** : 1. inclure la bibliothèque qui contient `printf` → 2. écrire la fonction `main` → 3. afficher le texte → 4. terminer `main` proprement.\n\n**Piège** : chaque instruction se termine par `;`.",
        ...E(0, {consigne: "`printf` n'est pas connue du compilateur tant qu'on n'a pas inclus la bibliothèque d'entrées/sorties standard. C'est toujours la première ligne du fichier. Écris-la."}),
        ...E(1, {consigne: "Dans `main`, l'instruction d'affichage est `printf`, avec le texte entre guillemets. Ajoute `\\n` à la fin du texte pour passer à la ligne. Écris l'instruction complète, avec son `;`."}),
        ...E(2, {consigne: "`main` se termine en renvoyant 0 au système, pour dire « tout s'est bien passé ». Écris cette dernière instruction."}),
        ...E(3, {consigne: "Assemble tes trois réponses dans le squelette :\n```c\n#include …\n\nint main(void) {\n    … l'affichage …\n    … le retour …\n}\n```"}),
      },
    },
    "c1-102": {
      set: {
        enonce: "Ce programme devrait afficher `[[MSG]]`, mais il ne compile pas : il contient **deux** erreurs de débutant.\n```c\n" + c102d + "\n```",
        guidage: "**Diagnostic** : 1. lire le message du compilateur → 2. regarder la ligne indiquée **et celle d'avant** → 3. corriger une erreur à la fois.\n\n**À retenir** : le C fait la différence entre majuscules et minuscules, et chaque instruction se termine par `;`.",
        ...E(0, {consigne: "Le compilateur se plaint : « expected ';' ». Regarde la fin de la ligne du `printf`. Quel caractère manque ?"}),
        ...E(1, {consigne: "Tout programme C démarre par une fonction au nom bien précis, que le compilateur cherche **lettre pour lettre**. Ici elle s'appelle `Main`. Quel est son nom exact ?"}),
        ...E(2, {consigne: "Corrige les **deux** erreurs (le nom de la fonction et le caractère manquant), puis exécute : le programme doit afficher `[[MSG]]`.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[MSG]]"}], exemple: c102}, corrige: sol(c102), depart: c102d,
          indices: ["Une erreur est dans le nom `Main`, l'autre au bout de la ligne du `printf`.", "`int main(void)` et `printf(\"[[MSG]]\\n\");`"]}),
      },
      tirer: R => ({MSG: R.un(MSGS)}),
    },
    "c1-103": {
      set: {
        enonce: "Écris un programme qui affiche exactement ces trois lignes :\n```text\n[[L1]]\n[[L2]]\n[[L3]]\n```",
        guidage: "**Plan** : un `printf` par ligne, chacun terminé par `\\n`. Le texte doit être recopié à l'identique (majuscules, espaces, ponctuation).",
        ...E(0, {consigne: "Sans rien de spécial, deux `printf` à la suite écrivent sur la **même** ligne. Quelle séquence de deux caractères, placée à la fin du texte, fait passer à la ligne suivante ?"}),
        ...E(1, {consigne: "Commence par les **deux premières** lignes : `[[L1]]` puis `[[L2]]`, chacune sur sa ligne.", question: "Affiche les deux premières lignes.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[L1]]\n[[L2]]"}], exemple: c103a}, corrige: sol(c103a),
          indices: ["Un `printf` par ligne, chacun terminé par `\\n`.", "`printf(\"[[L1]]\\n\");` puis `printf(\"[[L2]]\\n\");`"]}),
        ...E(2, {consigne: "Ajoute la troisième ligne, `[[L3]]`, en recopiant le texte à l'identique.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[L1]]\n[[L2]]\n[[L3]]"}], exemple: c103}, corrige: sol(c103), depart: c103a,
          indices: ["Encore un `printf`, avec son `\\n`.", "`printf(\"[[L3]]\\n\");`"]}),
      },
      tirer: R => R.un([
        {L1: "BIC2.exe", L2: "Programmation C", L3: "Chapitre 1 : prise en main"},
        {L1: "=== MENU ===", L2: "1. Jouer", L3: "2. Quitter"},
        {L1: "Nom : Ada Lovelace", L2: "Annee : 1843", L3: "Premier programme !"},
        {L1: "+-------+", L2: "| ESILV |", L3: "+-------+"},
        {L1: "Ticket n 42", L2: "Total : 12 euros", L3: "Merci et a bientot"},
        {L1: "Liste de courses", L2: "- pain", L3: "- fromage"}]),
    },
    "c1-104": {
      set: {
        enonce: "Écris un programme qui affiche `[[N]]`, et qui contient **au moins un commentaire sur une ligne** (`//`) **et un commentaire de bloc** (`/* … */`). Les commentaires ne changent rien à l'affichage : ils servent à expliquer le code.",
        guidage: "**Plan** : 1. un commentaire `//` (il va jusqu'à la fin de la ligne) → 2. un commentaire `/* … */` (il peut couvrir plusieurs lignes) → 3. le `printf` de `[[N]]`.\n\n**À retenir** : le compilateur ignore les commentaires.",
        ...E(0, {consigne: "Un commentaire « de fin de ligne » s'ouvre avec deux caractères, et tout ce qui suit sur la ligne est ignoré. Lesquels ?"}),
        ...E(1, {consigne: "Un commentaire de **bloc** s'ouvre avec `/*` et se referme avec les deux mêmes caractères dans l'autre sens. Écris un commentaire de bloc qui contient le mot `test`."}),
        ...E(2, {consigne: "Écris un programme qui affiche `[[N]]`, avec un commentaire `//` en bout de ligne (par exemple après le `printf`).", question: "Affiche [[N]] avec un `//`.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[N]]"}], exemple: c104a, exige: [{motif: "//", brut: true, msg: "Il manque un commentaire sur une ligne (//)."}]}, corrige: sol(c104a),
          indices: ["Un `printf(\"[[N]]\\n\");` dans `main`.", "Ajoute `// ...` à la fin de la ligne."]}),
        ...E(3, {consigne: "Ajoute aussi un commentaire de bloc `/* … */`, par exemple juste au-dessus de `main`, pour dire ce que fait le programme.",
          verif: {mode: "c", tests: [{entree: "", sortie: "[[N]]"}], exemple: c104, exige: [{motif: "//", brut: true, msg: "Il manque un commentaire sur une ligne (//)."}, {motif: "/\\*[\\s\\S]*?\\*/", brut: true, msg: "Il manque un commentaire de bloc (/* … */)."}]}, corrige: sol(c104), depart: c104a}),
      },
      tirer: R => ({N: R.entre(10, 999)}),
    },
  },
};
