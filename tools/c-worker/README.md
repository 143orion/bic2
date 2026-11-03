# Exécuteur C (module Programmation C)

`site/vendor/c-worker.js` est **généré** : interpréteur **PicoC** (BSD, https://gitlab.com/zsaleeba/picoc, commit `a97d94f` de jpoirier/picoc) patché pour BIC2, compilé en WebAssembly WASI, dans un Web Worker avec un mini WASI en mémoire (pas de dépendance npm à l'exécution).

    pip install ziglang            # zig 0.17, une fois
    cd tools/c-worker && npm install
    npm run wasm                   # picoc/ → picoc.wasm → picoc-wasm.js (base64)
    npm run build                  # worker-picoc.js → site/vendor/c-worker.js

- `picoc/` : sources PicoC patchées.
  - `expression.c` : `ExpressionPointerOp` (comparaison `< > <= >= == !=` et soustraction de pointeurs en **éléments**, `t + 2` / `2 + t` / `t - 1` sur un nom de tableau, `&&`/`||` avec des pointeurs), `!p` renvoie un int, `BicCheckAddr` (accès hors mémoire → erreur « memory access out of bounds » avec la ligne, au lieu d'arrêter le WebAssembly), `p->x` sur NULL détecté.
  - Portage WASI : `main_wasi.c` (stdin = source, octet 0, puis entrée du programme ; stdout non bufferisé), `stubs_wasi.c`, pas de readline ni de setjmp (`PlatformExit` fait `exit()`), `unistd.h` retiré.
- `worker-picoc.js` : reçoit `{id, code, stdin}`, renvoie `{id, ok, out, err, ligne?}` ; erreurs PicoC (« file.c:L:C message ») séparées de la sortie ; sortie limitée à 20 000 octets ; un module compilé, une instance neuve par exécution.
- `structures.js` : réécrit `Type v = {…};`, `Type t[] = {{…},…};` et `v = (Type){…};` en affectations champ par champ (PicoC ne sait pas initialiser une structure par une liste) ; ajoute `string.h` si besoin (sur une ligne vide, numéros de ligne conservés).
- `const` est retiré avant l'exécution (inconnu de PicoC) ; paramètres `T t[]` réécrits en `T *t`.

Limites restantes : pas de tableaux à taille variable, `float` = `double` (8 octets), `const` non vérifié.
Le lecteur (`module.html`, mode de vérification `c`) tue le worker au bout de 8 s.
