export const BASIC_COLORS=[
 {key:'pink',name:'ピンク',aliases:['ピンク','pink']},{key:'lightblue',name:'水色',aliases:['水色','みずいろ','ライトブルー','スカイブルー']},{key:'yellow',name:'黄色',aliases:['黄色','きいろ','イエロー','yellow']},{key:'purple',name:'紫',aliases:['紫','むらさき','パープル','ラベンダー','バイオレット','purple','lavender']},{key:'green',name:'緑',aliases:['緑','みどり','グリーン','green']},{key:'black',name:'黒',aliases:['黒','くろ','ブラック','black']},{key:'red',name:'赤',aliases:['赤','あか','レッド','red']},{key:'white',name:'白',aliases:['白','しろ','ホワイト','white']},{key:'blue',name:'青',aliases:['青','あお','ブルー','blue']},{key:'orange',name:'オレンジ',aliases:['オレンジ','橙','orange']},{key:'brown',name:'茶色',aliases:['茶色','ブラウン','brown']},{key:'gray',name:'灰色',aliases:['灰色','グレー','グレイ','gray','grey']},{key:'beige',name:'ベージュ',aliases:['ベージュ','beige']},{key:'gold',name:'ゴールド',aliases:['ゴールド','金色','gold']},{key:'silver',name:'シルバー',aliases:['シルバー','銀色','silver']}
];
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s/gu,'');
const manualOnly=new Set(['その他','分類不能','未分類','不明','未選択','なし'].map(norm));
export const colorFamily=name=>BASIC_COLORS.find(c=>c.aliases.some(a=>norm(a)===norm(name)))?.key||'custom:'+norm(name);
const unique=values=>[...new Set(values.filter(Boolean))];
export function recommendColors({name='',existing=[],linkedColors=[],pixels=[],selected=[],limit=4}={}){
 const palette=unique(existing),query=norm(name),result=[],families=new Set();
 const representative=basic=>palette.find(t=>colorFamily(t)===basic.key)||basic.name;
 const add=(tag,source)=>{if(!tag||manualOnly.has(norm(tag)))return;const family=colorFamily(tag);if(families.has(family)||result.length>=limit)return;families.add(family);result.push({name:tag,source,isNew:!palette.some(t=>norm(t)===norm(tag))})};
 for(const tag of linkedColors)add(tag,'set');
 // Explicit custom names are preferred to generic substrings within the same name source.
 const named=palette.filter(t=>!manualOnly.has(norm(t))&&query&&query.includes(norm(t))).sort((a,b)=>norm(b).length-norm(a).length);
 for(const tag of named)add(tag,'name');
 for(const basic of BASIC_COLORS)if(basic.aliases.some(a=>query&&query.includes(norm(a)))){if(named.some(t=>norm(t).length>2&&basic.aliases.some(a=>norm(t).includes(norm(a)))))continue;add(representative(basic),'name')}
 for(const pixel of pixels){const basic=BASIC_COLORS.find(c=>c.key===(typeof pixel==='string'?pixel:pixel.key));if(basic)add(representative(basic),'image')}
 return result;
}
export function colorOptions({recommendations=[],existing=[],selected=[],expanded=false}){const names=unique([...recommendations.map(r=>r.name),...selected,...(expanded?existing:[])]);return names.map(name=>({name,isNew:recommendations.find(r=>r.name===name)?.isNew||false,checked:selected.includes(name)}))}
function bucket(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0;let h=d===0?0:max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;if(max<.22)return 'black';if(s<.13)return max>.84?'white':max>.35?'gray':'black';if(h>=20&&h<55&&max<.72)return 'brown';if(h>=25&&h<60&&s<.32&&max>.72)return 'beige';if(h>=300&&h<350||h<20&&s<.55&&max>.8)return 'pink';if(h<15||h>=350)return 'red';if(h<42)return 'orange';if(h<75)return 'yellow';if(h<170)return 'green';if(h<210&&max>.65)return 'lightblue';if(h<260)return 'blue';return 'purple'}
export function analyzeColorPixels({data,width,height}){
 if(!data||!width||!height)return [];const count=width*height,background=new Uint8Array(count),queue=[];let edgeWhite=0,edgeOpaque=0;
 const pale=i=>{const p=i*4,r=data[p],g=data[p+1],b=data[p+2];return data[p+3]>32&&Math.min(r,g,b)>220&&Math.max(r,g,b)-Math.min(r,g,b)<25};
 const edges=[];for(let x=0;x<width;x++){edges.push(x,(height-1)*width+x)}for(let y=1;y<height-1;y++)edges.push(y*width,y*width+width-1);for(const i of edges){if(data[i*4+3]>32){edgeOpaque++;if(pale(i))edgeWhite++}}
 if(edgeOpaque/edges.length>.75&&edgeWhite/edgeOpaque>.5){for(const i of edges)if(pale(i)&&!background[i]){background[i]=1;queue.push(i)}for(let n=0;n<queue.length;n++){const i=queue[n],x=i%width,y=Math.floor(i/width);for(const j of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1])if(j>=0&&!background[j]&&pale(j)){background[j]=1;queue.push(j)}}}
 const totals=new Map();let total=0;for(let i=0;i<count;i++){const p=i*4;if(background[i]||data[p+3]<40)continue;const weight=data[p+3]/255,key=bucket(data[p],data[p+1],data[p+2]);totals.set(key,(totals.get(key)||0)+weight);total+=weight}
 if(total<4)return [];return [...totals].filter(([,weight])=>weight>=3&&weight/total>=.015).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([key,weight])=>({key,fraction:weight/total}));
}
const blobCache=new WeakMap(),urlCache=new Map();let queue=Promise.resolve();
async function browserPixels(source){let url,im,canvas;try{url=typeof source==='string'?source:URL.createObjectURL(source);im=await new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=url});const scale=Math.min(1,96/Math.max(im.naturalWidth||im.width,im.naturalHeight||im.height));canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round((im.naturalWidth||im.width)*scale));canvas.height=Math.max(1,Math.round((im.naturalHeight||im.height)*scale));const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0,canvas.width,canvas.height);return analyzeColorPixels({data:c.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height})}catch{return []}finally{if(typeof source!=='string'&&url)URL.revokeObjectURL(url);if(im)im.src='';if(canvas)canvas.width=canvas.height=0}}
export function sampleImageColors(source){if(!source)return Promise.resolve([]);const cache=typeof source==='string'?urlCache:blobCache;if(cache.has(source))return cache.get(source);const promise=queue.then(()=>browserPixels(source));queue=promise.catch(()=>[]);cache.set(source,promise);if(cache===urlCache&&cache.size>80)cache.delete(cache.keys().next().value);return promise}
