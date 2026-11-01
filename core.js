import {membership,hasValidQR} from './membership.js';
import {cardKey} from './catalog-import.js';
import {syncQR} from './inventory.js';
export const CATS=['アクセ','トップス','ボトムス','ワンピース','シューズ'];
export const LETTER={アクセ:'A',トップス:'T',ボトムス:'B',ワンピース:'W',シューズ:'S'};
export const ATTR={colors:['ピンク','水色','黄色','紫','緑','黒','赤','白','青','オレンジ','茶色','その他'],materials:['ノーマル','ふわふわ','キラキラ','その他'],tastes:['キュート','セクシー','ポップ','クール','エレガント','その他'],motifs:['ジュエル','花','動物','食べ物','その他']};
export const LABEL={colors:'色',materials:'素材・質感',tastes:'テイスト・系統',motifs:'モチーフ・ジャンル'};
export const uid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
export function normalize(i){let clean={...i};if(!clean.cardId)delete clean.cardId;else clean.cardId=cardKey(clean.cardId);return membership(syncQR({...clean,fav:!!i.fav,fav2:!!i.fav2,fav3:!!i.fav3,colors:i.colors|| (i.color?[i.color]:[]),materials:i.materials||[],tastes:i.tastes||(i.genre?[({'かわいい':'キュート'}[i.genre]||i.genre)]:[]),motifs:i.motifs||[],wantedAt:i.wantedAt||(i.status==='wanted'?(i.createdAt||i.updated||0):undefined),status:i.status||'owned'}));}
export function order(map){return (map['ワンピース']?['アクセ','ワンピース','シューズ']:['アクセ','トップス','ボトムス','シューズ']).map(c=>({cat:c,item:map[c]}));}
export function pick(map,item){const next={...map};if(item.cat==='ワンピース'){delete next['トップス'];delete next['ボトムス']}if(['トップス','ボトムス'].includes(item.cat))delete next['ワンピース'];next[item.cat]=item;return next;}
export function matches(i,f){return (!f.name||i.name.toLowerCase().includes(f.name.toLowerCase())||(i.cardId||'').toLowerCase().includes(f.name.toLowerCase())||(i.note||'').toLowerCase().includes(f.name.toLowerCase()))&&['fav','fav2','fav3'].every(k=>!f[k]||i[k])&&(!f.qrOnly||hasValidQR(i))&&Object.keys(ATTR).every(k=>!f[k]?.length||f[k].every(v=>v==='未選択'?!i[k]?.length:i[k]?.includes(v)));}
export let db;
export const request=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
export async function initDB(){let r=indexedDB.open('ribbon-closet',3);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains('items'))d.createObjectStore('items',{keyPath:'id'});let items=r.transaction.objectStore('items');if(!items.indexNames.contains('cardId'))items.createIndex('cardId','cardId',{unique:true});for(let n of ['best','state'])if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})};db=await request(r);return db}
export const all=s=>request(db.transaction(s).objectStore(s).getAll());
export const get=(s,id)=>request(db.transaction(s).objectStore(s).get(id));
export function write(s,records,remove=[]){return new Promise((r,j)=>{const tx=db.transaction(s,'readwrite'),st=tx.objectStore(s);remove.forEach(id=>st.delete(id));records.forEach(i=>st.put(i));tx.oncomplete=r;tx.onerror=()=>j(tx.error);tx.onabort=()=>j(tx.error)})}
export async function saveItems(records){records=records.map(normalize);const prior=await all('items'),ids=new Set(records.map(i=>i.id)),seen=new Set(prior.filter(i=>!ids.has(i.id)&&i.cardId).map(i=>cardKey(i.cardId)));for(const i of records){if(i.cardId){const k=cardKey(i.cardId);if(seen.has(k))throw Error('同じカードIDが登録済みです：'+i.cardId);seen.add(k)}}await write('items',records)}
