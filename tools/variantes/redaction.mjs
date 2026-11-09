/* Aides de rédaction des exos guidés (voir QUESTIONS.md, « Rédaction des exos guidés »).
   Modules de programmation : énoncé = [La fonction / Le type] + Au clavier + Ce qu'il fait + Ce qu'il affiche + Exemple ;
   étapes de code = liste numérotée des modifications. */
export const num = xs => xs.map((x, i) => `${i + 1}. ${x}`).join("\n");
export const BLOC = (...ps) => ps.filter(Boolean).join("\n\n");
export const but = s => "Le but : " + s;
export const lit = (...xs) => "**Au clavier**, le programme reçoit dans l'ordre :\n" + num(xs);
export const rien = "**Au clavier** : rien, le programme ne lit aucune donnée.";
export const fait = (...xs) => "**Ce qu'il fait** :\n" + num(xs);
export const affiche = s => "**Ce qu'il affiche** : " + s;
export const afaire = (...xs) => "**À faire** :\n" + num(xs);
export const jalon = (intro, ...xs) => intro + "\n" + num(xs);
export const ex = (e, s) => "**Exemple**\n```text\nEntrée :\n" + e + "\nSortie :\n" + s + "\n```";
export const sortie = s => "**Sortie attendue**\n```text\n" + s + "\n```";
export const corriger = s => "**À corriger** : " + s;
