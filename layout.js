// Scene geometry is shared by the live preview, saved looks and PNG renderer.
export const SCENE={width:600,height:1300};
export function alphaBounds(data,width,height){let left=width,top=height,right=-1,bottom=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}return right<0?{x:0,y:0,w:width,h:height}:{x:left,y:top,w:right-left+1,h:bottom-top+1}}
export function visibleBounds(data,width,height){
 const alpha=alphaBounds(data,width,height);if(alpha.w<width||alpha.h<height)return alpha;
 const white=(k)=>data[k+3]>245&&data[k]>=247&&data[k+1]>=247&&data[k+2]>=247;
 let edge=0,whiteEdge=0;for(let x=0;x<width;x++){for(let y of [0,height-1]){edge++;if(white((y*width+x)*4))whiteEdge++}}for(let y=0;y<height;y++){for(let x of [0,width-1]){edge++;if(white((y*width+x)*4))whiteEdge++}}
 if(whiteEdge/edge<.98)return alpha;
 let l=width,t=height,r=-1,b=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const k=(y*width+x)*4;if(data[k+3]>12&&!white(k)){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}}
 if(r<0)return alpha;const pad=5;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(width-1,r+pad);b=Math.min(height-1,b+pad);return {x:l,y:t,w:r-l+1,h:b-t+1}
}
const clamp=(v,a,b,d=0)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):d;
export function cleanPose(p={}){p=p&&typeof p==='object'?p:{};return {dx:clamp(p.dx,-450,450),dy:clamp(p.dy,-650,650),scale:clamp(p.scale,.35,2.2,1),angle:clamp(p.angle,-180,180),flip:!!p.flip,z:clamp(p.z,-5,10)}}
export function sceneLayout(records){const byCat=Object.fromEntries(records.map(r=>[r.cat,r]));let cursor=170,layers=[];const add=(cat,width,maxHeight,top,z)=>{let r=byCat[cat];if(!r)return null;let b=r.bounds,scale=Math.min(width/b.w,maxHeight/b.h),w=b.w*scale,h=b.h*scale,p=cleanPose(r.item.pose);let l={...r,x:300+p.dx,y:top+h/2+p.dy,w:w*p.scale,h:h*p.scale,angle:p.angle,flip:p.flip,z:z+p.z};layers.push(l);return {top,bottom:top+h,height:h}};
 add('アクセ',190,145,24,5);
 if(byCat['ワンピース']){let body=add('ワンピース',440,565,cursor,3);cursor=body.bottom-14}else{let t=add('トップス',440,305,cursor,4);cursor=t?t.bottom-20:420;let b=add('ボトムス',405,285,cursor,3);cursor=b?b.bottom-12:(t?t.bottom+220:730)}
 const shoe=byCat['シューズ']?.item,legacy=shoe?.pose&&shoe.shoeSizeVersion!==2;add('シューズ',legacy?350:280,legacy?440:352,cursor,2);return layers.sort((a,b)=>a.z-b.z)}
const bitmapCache=new Map();
export async function bitmap(src){if(bitmapCache.has(src))return bitmapCache.get(src);const promise=(async()=>{const im=await new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('画像を開けませんでした'));i.src=src});let c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;let ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const b=visibleBounds(ctx.getImageData(0,0,c.width,c.height).data,c.width,c.height);let crop=document.createElement('canvas');crop.width=b.w;crop.height=b.h;crop.getContext('2d').drawImage(im,b.x,b.y,b.w,b.h,0,0,b.w,b.h);return {bounds:b,canvas:crop,url:crop.toDataURL('image/png')}})();bitmapCache.set(src,promise);if(bitmapCache.size>32)bitmapCache.delete(bitmapCache.keys().next().value);try{return await promise}catch(e){bitmapCache.delete(src);throw e}}
export async function scene(map){const cats=map['ワンピース']?['アクセ','ワンピース','シューズ']:['アクセ','トップス','ボトムス','シューズ'];const records=await Promise.all(cats.filter(c=>map[c]?.image).map(async cat=>({cat,item:map[cat],...(await bitmap(map[cat].image))})));return sceneLayout(records)}
export function drawScene(ctx,layers,x=0,y=0,width=600,height=1000){ctx.save();ctx.translate(x,y);ctx.scale(width/SCENE.width,height/SCENE.height);ctx.beginPath();ctx.rect(0,0,SCENE.width,SCENE.height);ctx.clip();for(let l of layers){ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.angle*Math.PI/180);ctx.scale(l.flip?-1:1,1);ctx.drawImage(l.canvas,-l.w/2,-l.h/2,l.w,l.h);ctx.restore()}ctx.restore()}
