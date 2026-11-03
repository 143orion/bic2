/* BIC2 : point d'entrée WebAssembly. stdin = source C, octet 0, puis l'entrée du programme. */
#include <stdio.h>
#include <stdlib.h>
#include "picoc.h"
int main(void)
{
    static char src[200000];
    int n = 0, c;
    Picoc pc;
    setvbuf(stdout, NULL, _IONBF, 0);
    while ((c = getchar()) != EOF && c != 0 && n < (int)sizeof(src) - 1) src[n++] = (char)c;
    src[n] = 0;
    PicocInitialize(&pc, 128000 * 8);
    PicocParse(&pc, "file.c", src, n, true, false, false, false);
    PicocCallMain(&pc, 0, NULL);
    fflush(stdout);
    PicocCleanup(&pc);
    return pc.PicocExitValue;
}
