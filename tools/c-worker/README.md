# Exécuteur C (module Programmation C)

`site/vendor/c-worker.js` est **généré** : interpréteur **PicoC** (WebAssembly, paquet `picoc-web` 1.1.0) dans un Web Worker.

    cd tools/c-worker && npm install && npm run build

- `worker-picoc.js` : reçoit `{code, stdin}`, renvoie `{ok, out, err}` ; erreurs PicoC (« file.c:L:C message ») séparées de la sortie.
- `structures.js` : réécrit `Type v = {…};`, `Type t[] = {{…},…};` et `v = (Type){…};` en affectations champ par champ (PicoC ne sait pas initialiser une structure par une liste) ; ajoute `string.h` si besoin (sur une ligne vide, numéros de ligne conservés).
- `const` est retiré avant l'exécution (inconnu de PicoC).

Limites connues de PicoC : pas d'arithmétique sur un **nom de tableau** (`t + 2`, mais `p = t; p = p + 2;` marche), pas de **comparaison ni de soustraction de pointeurs**, pas de tableaux à taille variable, `float` = `double` (8 octets).
Le lecteur (`module.html`, mode de vérification `c`) tue le worker au bout de 5 s.
