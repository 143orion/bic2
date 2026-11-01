# Génère tools/seed.js : un faux journal (70 jours) pour le simulateur.
# python3 tools/seed.py [uid]  (depuis la racine du dépôt ; uid par défaut : mia)
import json,glob,random,time,sys
uid=sys.argv[1] if len(sys.argv)>1 else 'mia'
random.seed(3)
ids=[]
for f in glob.glob('site/banques/complement-electronique/*.json'):
  ch=json.load(open(f))
  for it in ch['items']:
    if it['type'] in ('qcm','saisie'): ids.append((it['id'],ch['id'],it['type'],it.get('duree',0.5)))
now=time.time()*1000; ev=[]; n=0
for k in range(70,-1,-1):
  if random.random()<0.35: continue
  t0=now-k*864e5-2*3600e3
  for j in range(random.randint(8,60)):
    q=random.choice(ids); n+=1
    ev.append({"i":"e%d"%n,"t":int(t0+j*40e3),"q":q[0],"m":"complement-electronique","c":q[1],"ty":q[2],"ok":1 if random.random()<.82 else 0,"d":q[3]})
open('tools/seed.js','w').write("window.__seed=window.__seed||{};window.__seed['data/users/%s/j_test_x']={ev:%s,appareil:'x',v:1};"%(uid,json.dumps(ev)))
print(len(ev))
