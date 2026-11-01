// Migration is deliberately opt-in. Legacy coordinateGroup was only a name;
// it is not proof that two records belong to the same group.
const BACKUP_ID='coordinateMigrationBackup-v1';
const req=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const done=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||new Error('移行を中止しました'));tx.onerror=()=>{} });
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// approvedGroups are explicit user-reviewed lists of item IDs, never inferred from names.
export function planCoordinateMigration(items,approvedGroups=[],makeId=()=>crypto.randomUUID()) {
 const byId=new Map(items.map(i=>[i.id,i]));
 const used=new Set(items.map(i=>i.coordinateGroupId).filter(Boolean));
 const selected=new Set(),changes=[];
 for(const group of approvedGroups){
  if(!Array.isArray(group.itemIds)||!group.itemIds.length)throw Error('確認済みグループにアイテムがありません');
  const members=group.itemIds.map(id=>{const item=byId.get(id);if(!item||selected.has(id))throw Error('アイテムが存在しないか重複しています');selected.add(id);if(item.catalogRef?.id||item.coordinateGroupId)throw Error('公式アイテムまたはID設定済みアイテムは変更できません');return item});
  const id=makeId();if(typeof id!=='string'||!id.trim()||used.has(id))throw Error('グループIDを安全に生成できませんでした');used.add(id);
  for(const item of members)changes.push({before:item,after:{...item,coordinateGroupId:id,coordinateGroupName:group.name||item.coordinateGroup||item.name||''}});
 }
 return {changes,unresolved:items.filter(i=>!i.catalogRef?.id&&!i.coordinateGroupId&&!selected.has(i.id)).length};
}

// Snapshot and updates share a single transaction: an abort commits neither.
export async function migrateCoordinateGroups(db,approvedGroups=[],options={}){
 const tx=db.transaction(['items','best','state'],'readwrite'),finished=done(tx);
 try{
  const itemStore=tx.objectStore('items'),state=tx.objectStore('state');
  const [items,best,states,prior]=await Promise.all([req(itemStore.getAll()),req(tx.objectStore('best').getAll()),req(state.getAll()),req(state.get(BACKUP_ID))]);
  if(prior){await finished;return {changed:0,alreadyMigrated:true,snapshot:prior.snapshot};}
  const plan=planCoordinateMigration(items,approvedGroups,options.makeId);
  const snapshot={format:'ribbon-closet',version:3,createdAt:new Date().toISOString(),items,best,state:states};
  state.put({id:BACKUP_ID,snapshot,changes:plan.changes});
  for(const c of plan.changes)itemStore.put(c.after);
  if(options.testAbort)tx.abort();
  await finished;return {changed:plan.changes.length,unresolved:plan.unresolved,snapshot};
 }catch(e){try{tx.abort()}catch{}await finished.catch(()=>{});throw e}
}

// Only revert if all affected records still equal the migrated versions. This
// prevents a restore from overwriting edits made after migration.
export async function restoreCoordinateMigration(db){
 const tx=db.transaction(['items','state'],'readwrite'),finished=done(tx);
 try{
  const state=tx.objectStore('state'),items=tx.objectStore('items'),backup=await req(state.get(BACKUP_ID));
  if(!backup)throw Error('移行前バックアップがありません');
  const current=await Promise.all(backup.changes.map(c=>req(items.get(c.after.id))));
  if(backup.changes.some((c,n)=>!eq(current[n],c.after)))throw Error('移行後にアイテムが変更されたため、自動復元を中止しました');
  for(const c of backup.changes)items.put(c.before);
  state.delete(BACKUP_ID);await finished;return backup.changes.length;
 }catch(e){try{tx.abort()}catch{}await finished.catch(()=>{});throw e}
}
export {BACKUP_ID};
