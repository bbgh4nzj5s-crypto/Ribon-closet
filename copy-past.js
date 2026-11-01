import {groupCoordinates} from './coordinate-groups.js';
import {inCloset,isWanted} from './membership.js';
import {ATTR} from './core.js';

// Membership controls visibility; identity is always independent of display names.
export function copyCandidates(items, query='') {
 const words=query.normalize('NFKC').toLowerCase().trim().split(/\s+/u).filter(Boolean);
 return groupCoordinates(items.filter(i=>inCloset(i)||isWanted(i))).filter(group=>{
  const names=group.flatMap(i=>[i.coordinateGroupName,i.name]).filter(Boolean).map(s=>String(s).normalize('NFKC').toLowerCase());
  return names.some(name=>words.every(word=>name.includes(word)));
 });
}
export function copyPastFields(target, source, {tags=false,note=false}={}) {
 const result={...target};
 if(tags)for(const k of Object.keys(ATTR))result[k]=Array.isArray(source[k])?[...source[k]]:[];
 if(note)result.note=source.note||'';
 return result;
}
