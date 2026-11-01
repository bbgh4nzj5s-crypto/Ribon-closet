import {nameSuggestions} from './name-suggestions.js';
import {existingPartGroups,selectExistingParts,existingPartConflicts} from './existing-parts.js';

export function proRelatedCandidates(items,query){
 const names=new Set(nameSuggestions(items,query).map(x=>x.name));
 return [...names].flatMap(name=>existingPartGroups(items,name).map(group=>({...group,name})));
}
export function addProRelated(row,group,id,newCategories=[]){
 const part=selectExistingParts([group],[id])[0];
 if(!part)throw Error('登録済みアイテムが見つかりません');
 const prior=row.existingParts||[];
 if(prior.some(p=>p.id===id))return;
 if(prior.length&&prior.some(p=>p.identity!==group.identity))throw Error('別のコーデが選択されています。先に選択を解除してください');
 const next=[...prior,part],conflict=existingPartConflicts(next,newCategories);
 if(conflict.duplicates.length||conflict.dressConflict)throw Error('同じカテゴリ、またはワンピースとトップス・ボトムスが重複します');
 row.partGroups=[group];row.existingParts=next;row.selectedSet=group.identity;row.step1Selection=true;
}
