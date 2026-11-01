import {hasValidQR} from './membership.js';
import {coordinateIdentity,groupCoordinates} from './coordinate-groups.js';
import {sameCard} from './catalog-import.js';
export const isOwned=i=>typeof i?.ownershipOverride==='boolean'?i.ownershipOverride:!!i&&hasValidQR(i);
export const requiredCats=parts=>parts.some(p=>p.cat==='ワンピース')?['アクセ','ワンピース','シューズ']:['アクセ','トップス','ボトムス','シューズ'];
export function coordinateCover(records,ref){
 const all=[...records,ref].filter(Boolean),pick=keys=>{for(const key of keys)for(const record of all)if(typeof record[key]==='string'&&record[key])return record[key];return ''};
 const explicit=pick(['thumb','thumbnail','total']);if(explicit)return explicit;
 const full=pick(['fullImage','fullBodyImage']);if(full)return full;
 const parts=[...records,...(ref?.parts||[])];
 for(const cat of ['ワンピース','トップス','ボトムス','シューズ','アクセ']){const part=parts.find(p=>p.cat===cat&&p.image);if(part)return part.image}return '';
}
export function coordinateRows(items,catalog=[],coordinates=[]){
 const rows=[];const seen=new Set(),covered=new Set();
 for(const record of coordinates){if(record.kind!=='coordinate-record'||!record.key)continue;const linked=(record.itemIds||[]).map(id=>items.find(i=>i.id===id)).filter(Boolean),ref=linked.find(i=>i.catalogRef)?.catalogRef,cats=requiredCats(ref?.parts||linked),parts=cats.map(cat=>{const item=linked.find(i=>i.cat===cat),reference=ref?.parts?.find(p=>p.cat===cat);return {cat,item:item||null,reference:reference||null,owned:!!item&&isOwned(item)}}),owned=parts.filter(p=>p.owned).length;rows.push({key:record.key,name:record.name,total:coordinateCover([record,...linked],ref),ref,record,parts,owned,count:cats.length,complete:owned===cats.length});seen.add(record.key);linked.forEach(i=>covered.add(i.id))}

 for(const group of groupCoordinates(items)){
  if(group.every(i=>covered.has(i.id)))continue;const first=group[0];let ref=first.catalogRef;
  if(!ref?.parts?.length&&!first.coordinateGroupId)ref=catalog.find(c=>c.parts?.some(p=>sameCard(p,first)));
  const key=ref?.id?coordinateIdentity({catalogRef:ref}):coordinateIdentity(first);
  if(seen.has(key))continue;seen.add(key);
  const linked=ref?.id?items.filter(i=>coordinateIdentity(i)===key||ref.parts?.some(p=>sameCard(i,p))):group;
  const sourceParts=ref?.parts?.length?ref.parts:linked;
  const cats=requiredCats(sourceParts);
  const parts=cats.map(cat=>{const p=sourceParts.find(p=>p.cat===cat);const saved=p&&(linked.find(i=>sameCard(i,p))||linked.find(i=>i.cat===cat));return {cat,item:saved||null,reference:p||null,owned:!!saved&&isOwned(saved)}});
  const owned=parts.filter(p=>p.owned).length;
  rows.push({key,name:ref?.name||first.coordinateGroupName||first.name||'名称未登録',total:coordinateCover(linked,ref),ref,parts,owned,count:cats.length,complete:owned===cats.length});
 }
 return rows;
}
export function filterCoordinates(rows,{subgroup='',filter='all'}={},classification={}){return rows.filter(r=>(!subgroup||(classification.assignments?.[r.key]||[]).includes(subgroup))&&(filter==='all'||(filter==='owned'?r.owned>0:r.complete)))}
export function emptyClassification(){return {groups:[],subgroups:[],assignments:{}}}
export function mergeClassification(current,incoming,overwrite=false){const out=structuredClone(current||emptyClassification());if(!incoming)return out;for(const key of ['groups','subgroups']){out[key]||=[];for(const row of incoming[key]||[]){if(!row.id||typeof row.name!=='string'||key==='subgroups'&&!row.groupId)throw Error('分類データの形式が違います');const prior=out[key].find(x=>x.id===row.id);if(prior){if(overwrite)Object.assign(prior,row)}else out[key].push(structuredClone(row))}}out.assignments||={};for(const [key,ids]of Object.entries(incoming.assignments||{})){if(!Array.isArray(ids)||ids.some(x=>typeof x!=='string'))throw Error('分類の所属情報が不正です');out.assignments[key]=overwrite?[...new Set(ids)]:[...new Set([...(out.assignments[key]||[]),...ids])]}return out}
