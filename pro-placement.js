import {existingPartConflicts} from './existing-parts.js';
import {qrState,clearQR,assignIndividual} from './inventory.js';
import {effectiveQR} from './pro-qr-state.js';

export const PRO_CATS=['アクセ','トップス','ボトムス','ワンピース','シューズ'];
export function proSlot(state,row,col,items=[]){
 const r=state.rows[row],image=state.images.find(i=>i.id===state.cells[`${row}:${col}`]);
 if(image)return {row:r,image,registered:false,cat:PRO_CATS[col]};
 const part=(r.existingParts||[]).find(p=>p.cat===PRO_CATS[col]);
 if(!part)return null;
 const original=items.find(i=>i.id===part.id);return {row:r,part,original,image:r.partEdits?.[part.id]||part.detailChanges||original||part,registered:true,cat:PRO_CATS[col]};
}
export function slotQR(slot){if(!slot)return null;if(slot.row.fullQRActive&&slot.row.fullQR)return {blob:slot.row.fullQR,bytes:slot.row.fullQRBytes||[],source:slot.row.fullQRSource,shared:true,scope:'full'};if(slot.row.pairQRActive&&slot.row.pairQR&&['トップス','ボトムス'].includes(slot.cat))return {blob:slot.row.pairQR,bytes:slot.row.pairQRBytes||[],source:slot.row.pairQRSource,shared:true,scope:'pair'};if(slot.registered){const q=qrState(slot.image),qr=q.individual||q.full;return qr?.image?{url:qr.image,bytes:qr.bytes||[]}:null}const blob=effectiveQR(slot.image,slot.row);return blob?{blob,bytes:slot.image.individualQRBytes||[],source:slot.image.individualQRSource}:null}
export function canPlaceItem(state,row,col,items=[]){const slot=proSlot(state,row,col,items);if(slot)return !slot.registered&&slot.image.placeholder&&!slot.image.blob;const cats=PRO_CATS.filter((_,c)=>proSlot(state,row,c,items)).concat(PRO_CATS[col]);const conflicts=existingPartConflicts([],cats);return !conflicts.duplicates.length&&!conflicts.dressConflict}
export function firstProSpace(state,mode,items=[]){for(let r=0;r<state.rows.length;r++)for(let c=0;c<PRO_CATS.length;c++){const slot=proSlot(state,r,c,items);if(mode==='qr'?(slot?!slotQR(slot):canPlaceItem(state,r,c,items)):canPlaceItem(state,r,c,items))return [r,c]}return null}
export function placeProItem(state,id,row,col,items=[]){const image=state.images.find(i=>i.id===id);if(!image)throw Error('画像が見つかりません');const slot=proSlot(state,row,col,items);if(slot&&!slot.registered&&slot.image.placeholder&&!slot.image.blob){const prior=slot.image;if(image.individualQR&&prior.individualQR)throw Error('両方にQRがあるため配置できません');Object.assign(prior,{...image,id:prior.id,proCategory:PRO_CATS[col],individualQR:prior.individualQR||image.individualQR,individualQRBytes:prior.individualQRBytes?.length?prior.individualQRBytes:image.individualQRBytes,individualQRSource:prior.individualQRSource||image.individualQRSource,placeholder:false});state.images=state.images.filter(i=>i!==image);delete state.cells[Object.keys(state.cells).find(k=>state.cells[k]===id)];return}if(!canPlaceItem(state,row,col,items))throw Error('このマスには配置できません。配置済みの内容は保持しています');const prior=Object.keys(state.cells).find(k=>state.cells[k]===id);if(prior)delete state.cells[prior];image.proCategory=PRO_CATS[col];state.cells[`${row}:${col}`]=id}
export async function placeProQR(state,candidate,row,col,{items=[],uid,read,photo}){
 if(!state.qrImages?.includes(candidate))throw Error('QR画像が見つかりません');
 const rows=state.rows,before=proSlot(state,row,col,items);if(slotQR(before))throw Error('このマスにはQRが登録済みです');if(!before&&!canPlaceItem(state,row,col,items))throw Error('ワンピースとトップス・ボトムスは同じ行に配置できません');
 const result=candidate.verified||await read(candidate.blob);
 if(state.rows!==rows||!state.qrImages?.includes(candidate))throw Error('画像の選択状態が変わりました');
 const slot=proSlot(state,row,col,items);if(slotQR(slot)||slot?.image.id!==before?.image.id)throw Error('配置状態が変わりました。もう一度操作してください');
 if(slot?.registered){(slot.row.partEdits||={})[slot.image.id]=assignIndividual(slot.image,{qr:await photo(result.blob),bytes:result.bytes});}
 else{let image=slot?.image;if(!image){image={id:uid(),blob:null,url:'',placeholder:true,proCategory:PRO_CATS[col],favorites:[]};state.images.push(image);state.cells[`${row}:${col}`]=image.id}image.individualQR=result.blob;image.individualQRBytes=[...result.bytes];image.individualQRSource=result.source||candidate.blob;}
 state.qrImages=state.qrImages.filter(i=>i!==candidate);state.selected=null;
}
export async function returnProQR(state,row,col,{items=[],uid,toBlob}){const rows=state.rows,slot=proSlot(state,row,col,items),qr=slotQR(slot);if(!qr)return;const blob=qr.blob||await toBlob(qr.url);if(state.rows!==rows)throw Error('入力中のコーデが変わりました');(state.qrImages||=[]).push({id:uid(),blob,url:'',verified:{blob,bytes:[...qr.bytes],source:qr.source||blob}});if(qr.shared){if(qr.scope==='pair')slot.row.pairQRActive=false;else slot.row.fullQRActive=false;}else if(slot.registered)(slot.row.partEdits||={})[slot.image.id]=clearQR(clearQR(slot.image,'individual'),'full');else{slot.image.individualQR=null;slot.image.individualQRBytes=[];slot.image.individualQRSource=null}state.selected=null;}
export function initializeProColors(image,palette){if(image.colorsInitialized)return;image.colorsInitialized=true;if(!Object.hasOwn(image,'colors'))image.colors=palette.slice(0,2)}
