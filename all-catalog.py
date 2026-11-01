import sys,pathlib,json,concurrent.futures,threading,time,urllib.parse
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
from catalog import parse,ROOT
import requests
local=threading.local();cache=pathlib.Path('/tmp/ribbon-assets');cache.mkdir(exist_ok=True)
def download(u):
 if not u:return ''
 p=cache/urllib.parse.urlparse(u).path.replace('/','_').lstrip('_')
 if p.exists():return '/catalog/assets/'+p.name
 if (ROOT/'dist/catalog/assets'/p.name).exists():return '/catalog/assets/'+p.name
 if not hasattr(local,'session'):local.session=requests.Session()
 try:
  r=local.session.get(u,timeout=35);r.raise_for_status()
  if not r.headers.get('content-type','').startswith('image/'):return ''
  p.write_bytes(r.content);return '/catalog/assets/'+p.name
 except Exception as e:print('FAILED',u,type(e).__name__,flush=True);return ''
eds=[(str(n),'ひみつのアイプリ',n) for n in range(1,7)]+[('ring'+str(n),'リングシリーズ',n) for n in range(1,7)]+[('oa'+str(n),'おねがいアイプリ',n) for n in range(1,5)]
allentries=[];index=[]
for id,series,n in eds:
 try:
  c=parse('https://aipri.jp/verse/item/'+id+'.html');print('PARSED',id,len(c),flush=True)
  allentries.append((id,c));index.append(dict(id=id,series=series,dan=n,count=len(c)))
 except Exception as e:print('PAGE FAILED',id,str(e),flush=True)
raw=pathlib.Path('/tmp/ribbon-catalog');raw.mkdir(exist_ok=True)
(raw/'metadata.json').write_text(json.dumps(allentries,ensure_ascii=False));(raw/'index.json').write_text(json.dumps(index,ensure_ascii=False))
urls=set()
for id,cs in allentries:
 for c in cs:urls.add(c['totalUrl']);urls.add(c['thumbUrl']);urls.update(p['imageUrl'] for p in c['parts'])
print('IMAGES',len(urls),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 results={}
 for k,(u,path) in enumerate(zip(urls,ex.map(download,urls))):
  results[u]=path
  if k%100==0:print('PROGRESS',k,'/',len(urls),flush=True)
for id,cs in allentries:
 for c in cs:
  c['total']=results.get(c['totalUrl'],'');c['thumb']=results.get(c['thumbUrl'],'')
  for p in c['parts']:
   p['image']=results.get(p['imageUrl'],'');p['imageStatus']='個別画像の取得成功' if p['image'] else ('トータルコーデ画像のみ取得' if c['total'] else '画像未取得')
 (raw/(id+'.json')).write_text(json.dumps(cs,ensure_ascii=False))
print('COMPLETE',len(index),sum(len(c) for _,c in allentries),sum(bool(v) for v in results.values()),flush=True)
