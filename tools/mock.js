(() => {
const store = {}, L = [];
const day = k => { const d = new Date(Date.now() - k*864e5); return d.toISOString().slice(0,10); };
const mkJours = (n, xp, eff) => { const o = {}; for(let k=1;k<=n;k++) o[day(k)] = {xp, eff}; return o; };
store["joueurs/kenza"] = {pseudo:"Kenza", plaque:"r10"};
store["classement/kenza"] = {jours:mkJours(300, 2000, 100), serie:12, modules:{"complement-electronique":{xp:9000, reussies:66, exos:18, maitrisees:30}}};
store["joueurs/yanis"] = {pseudo:"Yanis", plaque:"m:complement-electronique"};
store["classement/yanis"] = {jours:mkJours(120, 1000, 50), serie:4, modules:{"complement-electronique":{xp:5000, reussies:66, exos:18, maitrisees:10}}};
store["joueurs/lucas"] = {pseudo:"Lucas", plaque:"r9"};   // non mérité -> retombe
store["classement/lucas"] = {jours:mkJours(60, 900, 45), serie:2, modules:{}};
store["joueurs/ines"] = {pseudo:"Ines"};
store["classement/ines"] = {jours:mkJours(10, 300, 20), serie:1, modules:{}};
store["joueurs/sami"] = {pseudo:"Sami", plaque:"r7"};
store["classement/sami"] = {jours:mkJours(160, 1500, 75), modules:{}};
store["joueurs/moi"] = {pseudo:"Adam", plaque:"r1"};
window.__seed = store;
const snapDoc = p => ({exists:p in store, data:() => store[p], metadata:{fromCache:false}});
const enfants = p => Object.keys(store).filter(k => k.startsWith(p + "/") && !k.slice(p.length+1).includes("/")).map(k => ({id:k.slice(p.length+1), data:() => store[k]}));
const notif = () => L.forEach(l => l());
const db = {
  doc: p => ({ onSnapshot(cb){ const f = () => cb(snapDoc(p)); L.push(f); setTimeout(f, 10); }, async set(d){ store[p] = JSON.parse(JSON.stringify(d)); setTimeout(notif, 5); } }),
  collection: p => ({ onSnapshot(cb){ const f = () => cb({docs:enfants(p), metadata:{fromCache:false}}); L.push(f); setTimeout(f, 10); } })
};
window.claude = {use: async n => n === "db" ? db : n === "user" ? {isOwner:async () => true, id:async () => "moi"} : null};
})();
