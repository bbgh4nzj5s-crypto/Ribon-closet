import {isWanted,inCloset,hasValidQR} from './membership.js';
import {matches} from './core.js';
import {ordered} from './ordering.js';
export function itemList(items,{mode='all',cat='',query='',sort='original',priorityFirst=false,filter={}}={},order=[]){
 const seen=new Set();
 let rows=items.filter(i=>{if(seen.has(i.id))return false;seen.add(i.id);return (mode==='all'||(mode==='wanted'?isWanted(i):inCloset(i)))&&(!cat||i.cat===cat)&&matches(i,{...filter,name:''})&&(!query||matches(i,{name:query})||String(i.coordinateGroupName||i.catalogRef?.name||'').toLowerCase().includes(query.toLowerCase()));});
 if(sort==='original'||sort==='priority') rows=ordered(rows,order);
 else {const date=i=>i.wantedAt||i.createdAt||i.updated||0;rows.sort((a,b)=>sort==='asc'?a.name.localeCompare(b.name,'ja'):sort==='desc'?b.name.localeCompare(a.name,'ja'):sort==='old'?date(a)-date(b):date(b)-date(a));}
 if(priorityFirst||sort==='priority')rows.sort((a,b)=>(b.wishPriority||0)-(a.wishPriority||0));
 return rows;
}
export function ownershipLabel(i){return hasValidQR(i)?'所持':'未所持'}
