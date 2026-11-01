import json,glob,random,time
random.seed(3)
ids=[]
for f in glob.glob('banques/complement-electronique/*.json'):
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
open('seed.js','w').write("window.__seed['data/users/moi/j_test_x']={ev:%s};"%json.dumps(ev))
print(len(ev))
