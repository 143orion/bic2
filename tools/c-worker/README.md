# Exécuteur C (module Programmation C)

`site/vendor/c-worker.js` est **généré** : interpréteur C JSCPP 2.0.9 + notre lecture d'entrée (`scanf` avec largeur / `%lf` / `" %c"`, `getchar`, `gets`, `fgets`, `stdin`, `stdbool.h`), dans un Web Worker.

    cd tools/c-worker && npm install && npm run build

Limites connues de JSCPP : pas de `malloc`/`free`, pas de `typedef struct` anonyme, `main(void)` réécrit en `main()`.
Le lecteur (`module.html`, mode de vérification `c`) tue le worker au bout de 5 s.
