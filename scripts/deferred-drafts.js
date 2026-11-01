// Each deferred session is stored under a separate key in the existing state store.
// Explicitly selected unfinished fields are kept per row/category, never inferred from emptiness.
export const DEFERRED_PREFIX='deferred-registration:';
export const DEFERRED_FIELDS=['image','qr','name','related','tags'];
export function deferredKey(id){if(typeof id!=='string'||!id||id.startsWith(DEFERRED_PREFIX))throw Error('下書きIDが不正です');return DEFERRED_PREFIX+id}
export function makeDeferredDraft({id,batch,stage=1,editingItem=null,pending={}}){if(!batch||!['individual','bulk','pro'].includes(batch.mode))throw Error('登録形式が不正です');const clean={};for(const [key,fields] of Object.entries(pending)){if(!Array.isArray(fields)||fields.some(f=>!DEFERRED_FIELDS.includes(f)))throw Error('後回し項目が不正です');clean[key]=[...new Set(fields)]}return {id:deferredKey(id),draftId:id,batch:structuredClone(batch),stage,editingItem,pending:clean,updated:Date.now()}}
export function matchesDeferred(draft,selected=[]){return !selected.length||Object.values(draft.pending||{}).some(fields=>fields.some(f=>(selected.includes(f)||(selected.includes('related_tags')&&(f==='related'||f==='tags')))))}
export async function saveDeferredDraft(writeFn,draft){await writeFn('state',[draft]);return draft}
export async function deleteDeferredDraft(writeFn,id){await writeFn('state',[],[deferredKey(id)])}
// Atomically write every item and mark the draft as completed. A retained marker
// makes retries return the same IDs even after the draft has been removed.
export function completeDeferred(db,id,records){const key=deferredKey(id),marker='deferred-completed:'+id;return new Promise((resolve,reject)=>{const tx=db.transaction(['items','state'],'readwrite'),state=tx.objectStore('state'),items=tx.objectStore('items');let result;const lookup=state.get(marker);lookup.onsuccess=()=>{if(lookup.result){result={alreadyCompleted:true,ids:lookup.result.ids};return}result={alreadyCompleted:false,ids:records.map(r=>r.id)};for(const record of records)items.put(record);state.put({id:marker,ids:result.ids,completedAt:Date.now()});state.delete(key)};tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||Error('登録できませんでした'));tx.onerror=()=>{};})}
