/* =====================================================================
   BIC2.exe — extension du module « Maths analyse » (nombres complexes + intégrales)
   Chargée par module.html quand liste.json a ext:true. Fournit :
   - schemas : plan complexe (points, cercle, polygone des racines), cercle trigo, aire sous une courbe
   - labos   : plan complexe (module, argument, quadrant), aire de |x + a| (Chasles)
   Les fonctions des schémas d'aire sont écrites comme les réponses des élèves et évaluées par expr.js.
   ===================================================================== */
(function(){
"use strict";
const nb = (x, d = 3) => String(Math.round(x*10**d)/10**d).replace(".", ",");
const num = s => typeof s === "number" ? s : parseFloat(String(s ?? "").replace(",", "."));
const tex = el => { if(window.renderMathInElement) renderMathInElement(el, {delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}], throwOnError:false}); };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

/* f(x) à partir d'une expression texte (« |x+4| », « x e^(-4x) ») */
function fonction(src){
  try{ const n = EXPR.analyser(src); return x => { try{ const z = EXPR.evaluer(n, {x}); return Math.abs(z[1]) < 1e-9 ? z[0] : NaN; }catch(e){ return NaN; } }; }
  catch(e){ return () => NaN; }
}
/* repère : graduations, axes ; X(), Y() en coordonnées du SVG */
function repere(o){
  const {x0 = 50, x1 = 450, yb = 220, yh = 20, xmin, xmax, ymin, ymax, gx = [], gy = [], lx = "", ly = "", grille = true} = o;
  const X = v => x0 + (v - xmin)/(xmax - xmin)*(x1 - x0), Y = v => yb - (v - ymin)/(ymax - ymin)*(yb - yh);
  const el = [], ax = Y(Math.min(Math.max(0, ymin), ymax)), ay = X(Math.min(Math.max(0, xmin), xmax));
  gx.forEach(v => { if(grille) el.push(["c",[[X(v),yh],[X(v),yb]],{cls:"gr"}]); el.push(["t",X(v),ax+15,nb(v,2),{cls:"val"}]); });
  gy.forEach(v => { if(grille) el.push(["c",[[x0,Y(v)],[x1,Y(v)]],{cls:"gr"}]); el.push(["t",ay-6,Y(v)+4,nb(v,2),{a:"end",cls:"val"}]); });
  el.push(["c",[[x0,ax],[x1+8,ax]],{cls:"ax"}], ["c",[[ay,yb],[ay,yh-8]],{cls:"ax"}]);
  if(lx) el.push(["t",x1+6,ax-8,lx,{a:"end",cls:"val"}]);
  if(ly) el.push(["t",ay+8,yh-2,ly,{a:"start",cls:"val"}]);
  return {X, Y, el};
}
const pas = m => m <= 2 ? .5 : m <= 5 ? 1 : m <= 10 ? 2 : m <= 25 ? 5 : 10;
const grad = (a, b, p) => { const r = []; for(let v = Math.ceil(a/p)*p; v <= b + 1e-9; v += p) if(Math.abs(v) > 1e-9) r.push(Math.round(v*1000)/1000); return r; };

const schemas = {
  /* plan complexe : pts = [[re, im, "étiquette"], …] ; r = rayon d'un cercle (centre = [re, im], 0 par défaut) ; poly : relie les points ;
     vecteur : segment O→1er point + arc de l'argument ; m = demi-largeur de la fenêtre (sinon calculée) */
  "plan": v => {
    const pts = (v.pts || []).map(p => [num(p[0]), num(p[1]), p[2] ?? ""]);
    const m = num(v.m) || Math.max(1, ...pts.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1]))), (num(v.r) || 0) + Math.max(...[0].concat((v.centre || []).map(x => Math.abs(num(x)))))) * 1.25;
    const P = pas(m), R = repere({x0:60, x1:400, yb:330, yh:10, xmin:-m, xmax:m, ymin:-m, ymax:m, gx:grad(-m, m, P), gy:grad(-m, m, P), lx:"Re(z)", ly:"Im(z)"});
    const k = (R.X(1) - R.X(0)), el = R.el.slice();
    const ce = v.centre ? [num(v.centre[0]), num(v.centre[1])] : [0, 0];
    if(v.r) el.push(["o", R.X(ce[0]), R.Y(ce[1]), num(v.r)*k, {cls:"cercle"}]);
    if(v.poly && pts.length > 2) el.push(["p", pts.map(p => [R.X(p[0]), R.Y(p[1])]), {cls:"aire"}]);
    if(v.vecteur && pts.length){
      const [a, b] = pts[0], th = Math.atan2(b, a), ra = Math.min(.3*m, .45*Math.hypot(a, b))*k;
      el.push(["c",[[R.X(0),R.Y(0)],[R.X(a),R.Y(b)]],{cls:"tr"}], ["c",[[R.X(a),R.Y(0)],[R.X(a),R.Y(b)]],{cls:"pt"}], ["c",[[R.X(0),R.Y(b)],[R.X(a),R.Y(b)]],{cls:"pt"}]);
      const arc = []; for(let i = 0; i <= 24; i++){ const t = th*i/24; arc.push([R.X(0) + ra*Math.cos(t), R.Y(0) - ra*Math.sin(t)]); }
      el.push(["c", arc, {cls:"tr2"}], ["t", R.X(0) + (ra + 12)*Math.cos(th/2), R.Y(0) - (ra + 12)*Math.sin(th/2) + 4, "θ", {cls:"ac2"}]);
    }
    pts.forEach(([a, b, l], i) => { el.push(["o", R.X(a), R.Y(b), 5, {cls: i && v.vecteur ? "pz2" : "pz"}]); if(l) el.push(["t", R.X(a) + (a >= 0 ? 9 : -9), R.Y(b) - 8, l, {a: a >= 0 ? "start" : "end", cls:"ac"}]); });
    return {vb:"0 0 460 345", el};
  },
  /* cercle trigonométrique : k = angle en multiples de π/12 (ex. 8 → 2π/3) ; lab = étiquette de l'angle */
  "cercle": v => {
    const c = 175, r = 120, k = num(v.k) || 0, t = k*Math.PI/12, x = c + r*Math.cos(t), y = c - r*Math.sin(t), el = [];
    el.push(["c",[[c-150,c],[c+150,c]],{cls:"ax"}], ["c",[[c,c+150],[c,c-150]],{cls:"ax"}], ["o", c, c, r, {cls:"cercle"}]);
    for(let i = 0; i < 24; i++){ const a = i*Math.PI/12; if(i % 2 === 0 || i % 3 === 0) el.push(["o", c + r*Math.cos(a), c - r*Math.sin(a), 2.5, {cls:"pg"}]); }
    el.push(["t", c+r+6, c+15, "1", {a:"start", cls:"val"}], ["t", c+6, c-r-6, "1", {a:"start", cls:"val"}], ["t", c-r-6, c+15, "−1", {a:"end", cls:"val"}]);
    el.push(["c",[[c,c],[x,y]],{cls:"tr"}], ["c",[[x,c],[x,y]],{cls:"pt"}], ["c",[[c,y],[x,y]],{cls:"pt"}]);
    const arc = []; for(let i = 0; i <= 24; i++){ const a = t*i/24; arc.push([c + 34*Math.cos(a), c - 34*Math.sin(a)]); }
    el.push(["c", arc, {cls:"tr2"}], ["o", x, y, 5, {cls:"pz"}]);
    el.push(["t", x, c + (y > c ? -8 : 16), "cos θ", {cls:"ac2"}], ["t", c + (x > c ? -8 : 8), y + 4, "sin θ", {a: x > c ? "end" : "start", cls:"ac2"}]);
    if(v.lab) el.push(["t", c + 52*Math.cos(t/2), c - 52*Math.sin(t/2) + 4, v.lab, {cls:"ac"}]);
    return {vb:"0 0 350 350", el};
  },
  /* aire sous une courbe : f (expression en x), entre a et b ; coupe = abscisse où l'on coupe (Chasles, 2 couleurs) */
  "aire": v => {
    const f = fonction(v.f || "x"), a = num(v.a), b = num(v.b), xmin = num(v.xmin ?? a - 1), xmax = num(v.xmax ?? b + 1);
    const xs = []; for(let i = 0; i <= 240; i++) xs.push(xmin + (xmax - xmin)*i/240);
    const ys = xs.map(f).filter(isFinite);
    const ymin = num(v.ymin ?? Math.min(0, ...ys)), ymax = num(v.ymax ?? Math.max(.5, ...ys)*1.1);
    const R = repere({x0:40, x1:430, yb:230, yh:16, xmin, xmax, ymin, ymax, gx:grad(xmin, xmax, pas((xmax - xmin)/2)), gy:grad(ymin, ymax, pas((ymax - ymin)/2))});
    const el = R.el.slice(), surf = (u, w, cls) => { const p = [[R.X(u), R.Y(0)]]; for(let i = 0; i <= 80; i++){ const x = u + (w - u)*i/80, y = f(x); if(isFinite(y)) p.push([R.X(x), R.Y(Math.max(ymin, Math.min(ymax, y)))]); } p.push([R.X(w), R.Y(0)]); el.push(["p", p, {cls}]); };
    const c = v.coupe != null ? num(v.coupe) : null;
    if(c != null && c > a && c < b){ surf(a, c, "aire2"); surf(c, b, "aire"); el.push(["o", R.X(c), R.Y(0), 4, {cls:"pz2"}]); }
    else surf(a, b, "aire");
    el.push(["c", xs.map((x, i) => [x, f(x)]).filter(p => isFinite(p[1]) && p[1] >= ymin - 1e-9 && p[1] <= ymax + 1e-9).map(([x, y]) => [R.X(x), R.Y(y)]), {cls:"tr"}]);
    el.push(["c",[[R.X(a),R.Y(0)],[R.X(a),16]],{cls:"pt"}], ["c",[[R.X(b),R.Y(0)],[R.X(b),16]],{cls:"pt"}]);
    if(v.lab) el.push(["t", 426, 30, v.lab, {a:"end", cls:"ac"}]);
    return {vb:"0 0 460 250", el};
  }
};

/* ---------- labos (cours, sans XP) ---------- */
const PRESETS = [
  {n:"16 + 16i", z:"16+16i", a:16, b:16, r:"16\\sqrt2", c:"\\frac{\\sqrt2}{2}", s:"\\frac{\\sqrt2}{2}", al:"\\frac{\\pi}{4}", q:1, th:"\\frac{\\pi}{4}", src:"DST 1"},
  {n:"−1 + i√3", z:"-1+i\\sqrt3", a:-1, b:Math.sqrt(3), r:"2", c:"-\\frac12", s:"\\frac{\\sqrt3}{2}", al:"\\frac{\\pi}{3}", q:2, th:"\\frac{2\\pi}{3}", src:"cours"},
  {n:"−√6 + i√2", z:"-\\sqrt6+i\\sqrt2", a:-Math.sqrt(6), b:Math.sqrt(2), r:"2\\sqrt2", c:"-\\frac{\\sqrt3}{2}", s:"\\frac12", al:"\\frac{\\pi}{6}", q:2, th:"\\frac{5\\pi}{6}", src:"sujet blanc"},
  {n:"−√3 − i", z:"-\\sqrt3-i", a:-Math.sqrt(3), b:-1, r:"2", c:"-\\frac{\\sqrt3}{2}", s:"-\\frac12", al:"\\frac{\\pi}{6}", q:3, th:"-\\frac{5\\pi}{6}", src:"cours"},
  {n:"(1 − i)/5", z:"\\frac{1-i}{5}", a:.2, b:-.2, r:"\\frac{\\sqrt2}{5}", c:"\\frac{\\sqrt2}{2}", s:"-\\frac{\\sqrt2}{2}", al:"\\frac{\\pi}{4}", q:4, th:"-\\frac{\\pi}{4}", src:"prép CC3"},
  {n:"3i", z:"3i", a:0, b:3, r:"3", c:"0", s:"1", al:null, q:0, th:"\\frac{\\pi}{2}", src:"sur un axe"}
];
const VR = {0:["1","0"], 2:["\\frac{\\sqrt3}{2}","\\frac12"], 3:["\\frac{\\sqrt2}{2}","\\frac{\\sqrt2}{2}"], 4:["\\frac12","\\frac{\\sqrt3}{2}"], 6:["0","1"]};
function fracPi(k){
  if(k === 0) return "0";
  const g = (a, b) => b ? g(b, a % b) : a, d = g(Math.abs(k), 12), p = k/d, q = 12/d, s = p < 0 ? "-" : "", n = Math.abs(p) === 1 ? "" : Math.abs(p);
  return q === 1 ? `${s}${n}\\pi` : `${s}\\frac{${n}\\pi}{${q}}`;
}
function angleLibre(k){
  const t = k*Math.PI/12, rem = k % 2 === 0 || k % 3 === 0;
  const q = [0, 6, 12, -6].includes(k) ? 0 : k > 0 && k < 6 ? 1 : k > 6 ? 2 : k < -6 ? 3 : 4;
  const a12 = q === 1 ? k : q === 2 ? 12 - k : q === 3 ? 12 + k : -k;
  const sg = (x, v) => x === "0" ? "0" : (v < 0 ? "-" : "") + x;
  let c, s;
  if(q === 0){ c = {0:"1", 6:"0", 12:"-1", "-6":"0"}[k]; s = {0:"0", 6:"1", 12:"0", "-6":"-1"}[k]; }
  else if(rem){ const [cc, ss] = VR[a12]; c = sg(cc, Math.cos(t)); s = sg(ss, Math.sin(t)); }
  else { c = "\\approx " + nb(Math.cos(t)).replace(",", "{,}"); s = "\\approx " + nb(Math.sin(t)).replace(",", "{,}"); }
  return {z:"e^{i\\theta}", a:Math.cos(t), b:Math.sin(t), r:"1", c, s, al: q ? fracPi(a12) : null, q, th:fracPi(k), rem, libre:true};
}
const QUAD = {1:["+","+","1er (haut droite)","\\theta = \\alpha"], 2:["−","+","2e (haut gauche)","\\theta = \\pi - \\alpha"], 3:["−","−","3e (bas gauche)","\\theta = -(\\pi - \\alpha)"], 4:["+","−","4e (bas droite)","\\theta = -\\alpha"]};

const labos = {
  /* 2.1 · module, argument, quadrant : z des sujets, ou point qu'on fait glisser sur le cercle (crans de π/12) */
  "plan"(el){
    let cur = 0, k = 4;
    el.innerHTML = `<p class="vide-txt">Choisis un $z$ des sujets, ou fais glisser le point sur le cercle. Le labo donne le quadrant, l'angle $\\alpha$ du 1er quadrant et la règle qui donne $\\theta$.</p>
      <div class="lab-chips">${PRESETS.map((p, i) => `<button type="button" data-i="${i}">${esc(p.n)}</button>`).join("")}<button type="button" data-i="k">Glisser le point</button></div>
      <div class="fc-2col"><div class="lab-sch"></div><div class="lab-f"></div></div>`;
    const sch = el.querySelector(".lab-sch"), z = el.querySelector(".lab-f");
    const C = 150, R = 110;
    const maj = () => {
      const d = cur === "k" ? angleLibre(k) : PRESETS[cur], th = Math.atan2(d.b, d.a), x = C + R*Math.cos(th), y = C - R*Math.sin(th);
      el.querySelectorAll(".lab-chips button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.i === String(cur))));
      const hl = d.q ? [[C, C - 140], [C - 140, C - 140], [C - 140, C], [C, C]][d.q - 1] : null;
      const arc = []; for(let i = 0; i <= 30; i++){ const a = th*i/30; arc.push(`${(C + 30*Math.cos(a)).toFixed(1)},${(C - 30*Math.sin(a)).toFixed(1)}`); }
      let s = (hl ? `<rect x="${hl[0]}" y="${hl[1]}" width="140" height="140" class="lab-quad"/>` : "")
        + `<line class="ax" x1="${C - 145}" y1="${C}" x2="${C + 145}" y2="${C}"/><line class="ax" x1="${C}" y1="${C + 145}" x2="${C}" y2="${C - 145}"/>`
        + `<text class="val" x="${C + 140}" y="${C - 8}" text-anchor="end">Re</text><text class="val" x="${C + 8}" y="${C - 132}">Im</text>`
        + `<circle class="cercle" cx="${C}" cy="${C}" r="${R}"/>`;
      for(let i = 0; i < 24; i++){ const a = i*Math.PI/12; s += `<circle class="pg" cx="${(C + R*Math.cos(a)).toFixed(1)}" cy="${(C - R*Math.sin(a)).toFixed(1)}" r="${i % 2 === 0 || i % 3 === 0 ? 3 : 1.6}"/>`; }
      s += `<line class="pt" x1="${x}" y1="${C}" x2="${x}" y2="${y}"/><line class="pt" x1="${C}" y1="${y}" x2="${x}" y2="${y}"/>`
        + `<text class="ac2" x="${x}" y="${y > C ? C - 8 : C + 16}" text-anchor="middle">cos θ</text><text class="ac2" x="${x > C ? C - 6 : C + 6}" y="${y + 4}" text-anchor="${x > C ? "end" : "start"}">sin θ</text>`
        + (Math.abs(th) > 1e-9 ? `<polyline class="tr2" points="${arc.join(" ")}"/>` : "")
        + `<line class="tr" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/><circle class="pz lab-poignee" cx="${x}" cy="${y}" r="8"/><text class="ac" x="${C + 128*Math.cos(th)}" y="${C - 128*Math.sin(th) + 4}" text-anchor="middle">z</text>`;
      sch.innerHTML = `<div class="schema"><svg class="circ lab-plan" viewBox="0 0 300 300" role="img" aria-label="Plan complexe">${s}</svg></div>`;
      const Q = QUAD[d.q], r1 = d.r === "1" ? "" : d.r;
      z.innerHTML = (d.libre ? `<p>$z = e^{i\\theta}$, sur le cercle de rayon $1$.</p>` : `<p>$z = ${d.z}$ <small class="vide-txt">(${d.src})</small></p>`)
        + `$$r = |z| = ${d.r}$$$$\\cos\\theta = \\frac{a}{r} = ${d.c} \\qquad \\sin\\theta = \\frac{b}{r} = ${d.s}$$`
        + (Q ? `<p>Signes $(${Q[0]},\\ ${Q[1]})$ : quadrant <b>${Q[2]}</b>. Angle du 1er quadrant : $\\alpha = ${d.al}$, donc $${Q[3]} = ${d.th}$.</p>` : `<p>Le point est sur un axe : $\\theta = ${d.th}$ directement.</p>`)
        + (d.rem === false ? `<p class="vide-txt">Angle non remarquable : il ne tombe pas au CC (on n'y voit que des multiples de $\\frac{\\pi}{6}$ et de $\\frac{\\pi}{4}$).</p>`
          : `$$z = ${r1}\\left(\\cos ${d.th} + i\\sin ${d.th}\\right) = ${r1}\\,e^{i${d.th}}$$`);
      tex(z);
      const svg = sch.querySelector("svg");
      let drag = false;
      const bouger = e => {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        let kk = Math.round(Math.atan2(C - p.y, p.x - C)/(Math.PI/12)); if(kk === -12) kk = 12;
        if(cur !== "k" || kk !== k){ cur = "k"; k = kk; maj(); }
      };
      svg.onpointerdown = e => { drag = true; try{ svg.setPointerCapture(e.pointerId); }catch(_){} bouger(e); };
      svg.onpointermove = e => { if(drag) bouger(e); };
      svg.onpointerup = svg.onpointercancel = () => { drag = false; };
    };
    el.querySelector(".lab-chips").onclick = e => { const b = e.target.closest("button"); if(!b) return; cur = b.dataset.i === "k" ? "k" : +b.dataset.i; maj(); };
    maj(); tex(el.querySelector(".vide-txt"));
  },
  /* 4.5 · ∫ de |x + a| sur [−2, 2] : on coupe dès que x + a s'annule dans l'intervalle */
  "aire"(el, o = {}){
    el.innerHTML = `<p class="vide-txt">$\\displaystyle\\int_{-2}^{2}|x+a|\\,dx$ : DST 2 ($a = 4$), prép CC3 ($a = 2$). Fais varier $a$ : dès que $x + a$ s'annule <b>dans</b> l'intervalle, il faut couper en deux (Chasles).</p>
      <div class="fc-2col"><div class="lab-sch"></div><div class="lab-ctl"><div class="sl"><label for="la-a"><span>$a$</span><b></b></label><input type="range" id="la-a" min="-4" max="4" step="1" value="1"></div></div></div><div class="lab-f"></div>`;
    const inp = el.querySelector("#la-a"), z = el.querySelector(".lab-f");
    const maj = () => {
      const a = +inp.value, c = -a, coupe = c > -2 && c < 2;
      el.querySelector(".sl b").textContent = a;
      el.querySelector(".lab-sch").innerHTML = (o.SV ? o.SV.rendre({modele:"aire", vals:{f:`|x+${a}|`.replace("+-", "-"), a:-2, b:2, xmin:-3, xmax:3, ymin:0, ymax:7, coupe: coupe ? c : null}}) : "");
      const s = a < 0 ? "-" : "+", A = Math.abs(a), xa = `x ${s} ${A}`, P = `\\frac{x^2}{2} ${s} ${A}x`;
      if(!coupe){
        const pos = c <= -2, v = pos ? 4*a : -4*a;
        z.innerHTML = `<p>$${xa}$ s'annule en $x = ${c}$, <b>hors</b> de $]-2, 2[$ : sur tout l'intervalle $${xa} ${pos ? "\\geq" : "\\leq"} 0$, donc $|${xa}| = ${pos ? xa : `-(${xa})`}$. Pas besoin de couper.</p>`
          + `$$\\int_{-2}^{2}|${xa}|\\,dx = ${pos ? "" : "-"}\\left[${P}\\right]_{-2}^{2} = ${v}$$`;
      } else {
        const v1 = (c + 2)**2/2, v2 = (2 - c)**2/2, fr = v => Number.isInteger(v) ? String(v) : `\\frac{${2*v}}{2}`;
        z.innerHTML = `<p>$${xa}$ s'annule en $x = ${c}$, <b>dans</b> $]-2, 2[$ : on coupe en $${c}$. À gauche $|${xa}| = -(${xa})$, à droite $|${xa}| = ${xa}$.</p>`
          + `$$\\int_{-2}^{2}|${xa}|\\,dx = \\int_{-2}^{${c}}-(${xa})\\,dx + \\int_{${c}}^{2}(${xa})\\,dx = ${fr(v1)} + ${fr(v2)} = ${fr(v1 + v2)}$$`;
      }
      tex(z);
    };
    inp.oninput = maj; maj(); tex(el.querySelector(".vide-txt")); tex(el.querySelector(".lab-ctl"));
  }
};

window.EXT_MODULE = {schemas, generateurs:{}, labos};
})();
