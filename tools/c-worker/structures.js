/* PicoC refuse « Point p = {1, 2}; » (initialisation d'une structure par une liste).
   On réécrit ces initialisations en affectations champ par champ, en s'appuyant sur les
   définitions de structures du programme :
     typedef struct [Tag] { … } Nom;     struct Tag { … };
   Formes réécrites (dans une fonction) :
     Nom v = { … };            struct Tag v = { … };
     Nom t[N] = { {…}, {…} };  Nom t[] = { … };
     v = (Nom){ … };           t[i] = (Nom){ … };
   Les champs « char x[N] » initialisés par une chaîne passent par strcpy. */

/* découpe « a, {b, c}, "d,e" » au premier niveau */
function decouper(s){
  const parts = []; let prof = 0, cur = "", ch = null;
  for(let i = 0; i < s.length; i++){
    const c = s[i];
    if(ch){ cur += c; if(c === "\\"){ cur += s[++i] || ""; continue; } if(c === ch) ch = null; continue; }
    if(c === '"' || c === "'"){ ch = c; cur += c; continue; }
    if(c === "{" || c === "(" || c === "[") prof++;
    if(c === "}" || c === ")" || c === "]") prof--;
    if(c === "," && prof === 0){ parts.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if(cur.trim()) parts.push(cur.trim());
  return parts;
}
/* indice de l'accolade fermante correspondant à celle en position i */
function fermante(s, i){
  let prof = 0, ch = null;
  for(let k = i; k < s.length; k++){
    const c = s[k];
    if(ch){ if(c === "\\"){ k++; continue; } if(c === ch) ch = null; continue; }
    if(c === '"' || c === "'"){ ch = c; continue; }
    if(c === "{") prof++;
    else if(c === "}"){ prof--; if(prof === 0) return k; }
  }
  return -1;
}
const estAcc = v => /^\{[\s\S]*\}$/.test(v.trim());
const interieur = v => v.trim().slice(1, -1);

function lireChamps(corps){
  const champs = [];
  for(const decl of corps.split(";")){
    const d = decl.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "").trim();
    if(!d) continue;
    const m = d.match(/^((?:struct\s+)?[A-Za-z_]\w*(?:\s+[A-Za-z_]\w*)*?)\s*((?:\*?\s*[A-Za-z_]\w*\s*(?:\[[^\]]*\])*\s*,?\s*)+)$/);
    if(!m) continue;
    const type = m[1].replace(/^struct\s+/, "").trim().split(/\s+/).pop();
    for(const nom of m[2].split(",")){
      const n = nom.trim(); if(!n) continue;
      const mm = n.match(/^(\*?)\s*([A-Za-z_]\w*)\s*((?:\[[^\]]*\])*)$/);
      if(!mm) continue;
      champs.push({nom:mm[2], type, pointeur:!!mm[1], tableau:!!mm[3]});
    }
  }
  return champs;
}

export function initStructures(code){
  const S = {};
  code.replace(/typedef\s+struct\s*([A-Za-z_]\w*)?\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)\s*;/g, (x, tag, corps, nom) => {
    const ch = lireChamps(corps); S[nom] = ch; if(tag) S[tag] = ch; return x;
  });
  code.replace(/(^|[^\w])struct\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}\s*;/g, (x, a, tag, corps) => { S[tag] = lireChamps(corps); return x; });
  const types = Object.keys(S);
  if(!types.length) return code;
  let strcpyUtile = false;

  const affecter = (cible, type, valeur, out) => {
    const champs = S[type];
    if(!champs || !estAcc(valeur)){ out.push(`${cible} = ${valeur};`); return; }
    const vals = decouper(interieur(valeur));
    champs.forEach((c, i) => {
      if(i >= vals.length) return;
      const v = vals[i], cc = `${cible}.${c.nom}`;
      if(c.tableau && /^"/.test(v)){ strcpyUtile = true; out.push(`strcpy(${cc}, ${v});`); }
      else if(c.tableau && estAcc(v)) decouper(interieur(v)).forEach((w, k) => {
        if(S[c.type] && estAcc(w)) affecter(`${cc}[${k}]`, c.type, w, out); else out.push(`${cc}[${k}] = ${w};`);
      });
      else if(S[c.type] && !c.pointeur && estAcc(v)) affecter(cc, c.type, v, out);
      else out.push(`${cc} = ${v};`);
    });
  };

  const noms = types.map(t => t.replace(/[$]/g, "")).join("|");
  /* déclarations avec initialisation */
  const reDecl = new RegExp(`(^|[;{}\\n])([ \\t]*)(?:struct\\s+)?(${noms})\\s+([A-Za-z_]\\w*)\\s*(\\[\\s*(\\d*)\\s*\\])?\\s*=\\s*\\{`, "g");
  let res = "", i = 0, m;
  while((m = reDecl.exec(code))){
    const debAcc = m.index + m[0].length - 1, fin = fermante(code, debAcc);
    if(fin < 0) break;
    const pv = code.indexOf(";", fin);
    if(pv < 0 || code.slice(fin + 1, pv).trim()) continue;
    const [, avant, ind, type, nom, crochets, taille] = m;
    const valeur = code.slice(debAcc, fin + 1), out = [];
    let decl;
    if(crochets){
      const elems = decouper(interieur(valeur));
      decl = `${type} ${nom}[${taille || elems.length}];`;
      elems.forEach((w, k) => affecter(`${nom}[${k}]`, type, w, out));
    }else{
      decl = `${type} ${nom};`;
      affecter(nom, type, valeur, out);
    }
    res += code.slice(i, m.index) + avant + ind + decl + " " + out.join(" ") + "\n".repeat((code.slice(m.index, pv + 1).match(/\n/g) || []).length - (avant === "\n" ? 1 : 0));
    i = pv + 1; reDecl.lastIndex = i;
  }
  code = res + code.slice(i);

  /* littéraux composés : cible = (Type){ … }; */
  const reLit = new RegExp(`([A-Za-z_][\\w.\\[\\]>-]*)\\s*=\\s*\\(\\s*(?:struct\\s+)?(${noms})\\s*\\)\\s*\\{`, "g");
  res = ""; i = 0;
  while((m = reLit.exec(code))){
    const debAcc = m.index + m[0].length - 1, fin = fermante(code, debAcc);
    if(fin < 0) break;
    const pv = code.indexOf(";", fin);
    if(pv < 0 || code.slice(fin + 1, pv).trim()) continue;
    const out = []; affecter(m[1], m[2], code.slice(debAcc, fin + 1), out);
    res += code.slice(i, m.index) + out.join(" ") + "\n".repeat((code.slice(m.index, pv + 1).match(/\n/g) || []).length);
    i = pv + 1; reLit.lastIndex = i;
  }
  code = res + code.slice(i);
  if(strcpyUtile && !/#\s*include\s*<string\.h>/.test(code)){
    /* strcpy demande string.h : on l'écrit sur une ligne vide (numéros de ligne inchangés) */
    const L = code.split("\n"), k = L.findIndex(l => !l.trim());
    if(k >= 0){ L[k] = "#include <string.h>"; code = L.join("\n"); } else code = "#include <string.h>\n" + code;
  }
  return code;
}
