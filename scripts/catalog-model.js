import {cardKey} from './catalog-import.js';
import {coordinateRef} from './inventory.js';
export const searchKey=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('ja');
export function searchCatalog(entries,query){const q=searchKey(query).trim();return entries.filter(c=>!q||searchKey(c.name).includes(q)||c.parts.some(p=>searchKey(p.cardId).includes(q)))}
export function missingWishParts(coords,items){const seen=new Set(items.filter(i=>i.cardId).map(i=>cardKey(i.cardId)));const out=[];for(let c of coords)for(let p of c.parts){const key=cardKey(p.cardId);if(seen.has(key))continue;seen.add(key);out.push({...p,catalogRef:coordinateRef({...c,parts:c.originalParts||c.parts}),name:c.name,wanted:true,inCloset:false,status:'wanted',total:c.total,source:c.source})}return out}
