import {PRO_CATS,proSlot,slotQR,canPlaceItem} from './pro-placement.js';

export function qrMode(row){return row.step1QRMode|| (row.fullQRActive?'full':row.pairQRActive?'pair':'individual')}
export function setQRMode(row,mode){if(!['full','pair','individual'].includes(mode))throw Error('QRの設定が不正です');row.step1QRMode=mode;if(mode!=='full')row.fullQRActive=false;if(mode!=='pair')row.pairQRActive=false;}
export function sharedTargets(state,row,mode,items=[]){return PRO_CATS.flatMap((cat,col)=>{const slot=proSlot(state,row,col,items);return slot&&(mode==='full'||['トップス','ボトムス'].includes(cat))?[{cat,col,slot}]:[]})}
export async function placeSharedQR(state,candidate,row,col,{items=[],uid,read,confirmReplace=()=>false}){
 const r=state.rows[row],mode=qrMode(r),rows=state.rows;
 if(!['full','pair'].includes(mode))throw Error('共通QRの対象を選択してください');
 if(mode==='pair'&&!['トップス','ボトムス'].includes(PRO_CATS[col]))throw Error('トップスまたはボトムスの枠に置いてください');
 if(!state.qrImages.includes(candidate))throw Error('未配置のQR画像を選択してください');
 const result=candidate.verified||await read(candidate.blob);
 if(state.rows!==rows||!state.qrImages.includes(candidate))throw Error('入力状態が変わりました');
 const current=proSlot(state,row,col,items);if(!current&&!canPlaceItem(state,row,col,items))throw Error('このコーデの構成と競合しています');
 const targets=sharedTargets(state,row,mode,items),conflicts=targets.filter(t=>slotQR(t.slot));
 if(conflicts.length&&!confirmReplace(conflicts.map(t=>t.cat)))return false;
 // Prior shared images and all individual QR remain recoverable; registered records are never written.
 (r.sharedQRHistory||=[]).push({fullQR:r.fullQR,fullQRBytes:r.fullQRBytes,fullQRSource:r.fullQRSource,fullQRActive:r.fullQRActive,pairQR:r.pairQR,pairQRBytes:r.pairQRBytes,pairQRSource:r.pairQRSource,pairQRActive:r.pairQRActive});
 if(!current){const image={id:uid(),blob:null,url:'',placeholder:true,proCategory:PRO_CATS[col],favorites:[]};state.images.push(image);state.cells[`${row}:${col}`]=image.id}
 for(const t of sharedTargets(state,row,mode,items))if(!t.slot.registered)t.slot.image.proCategory=t.cat;
 const prefix=mode==='full'?'fullQR':'pairQR';r[prefix]=result.blob;r[prefix+'Bytes']=[...result.bytes];r[prefix+'Source']=result.source||candidate.blob;r.fullQRActive=mode==='full';r.pairQRActive=mode==='pair';
 state.qrImages=state.qrImages.filter(i=>i!==candidate);state.selected=null;return true;
}
