import {proRelatedCandidates,addProRelated} from './pro-step1-model.js';

export function bindProStep1Panel({table,state,items,cats,esc,rename,redraw,notify,photoDataURL,changed=()=>{}}){
 function panel(index){
  const row=state.rows[index],root=table.querySelector(`[data-pro-related="${index}"]`);
  if(!root)return;
  const candidates=proRelatedCandidates(items,row.name),selected=new Set((row.existingParts||[]).map(p=>p.id));
  root.innerHTML=candidates.length?`<details ${row.suggestionsLater?'':'open'}><summary>登録済みアイテムを探す・追加する</summary><p>登録済みの関連アイテムが見つかりました</p>${candidates.map((g,n)=>`<section><small>${esc(g.name)}${candidates.length>1?'・候補'+(n+1):''}</small>${g.parts.map(p=>`<div class="pro-related-item">${p.image?`<img src="${esc(p.image)}" alt="">`:'<span>画像なし</span>'}<span>${esc(g.name)}・${esc(p.cat)}</span><button type="button" data-related-add="${n}" data-related-id="${esc(p.id)}" ${selected.has(p.id)?'disabled':''}>${selected.has(p.id)?'追加済み':'追加'}</button></div>`).join('')}</section>`).join('')}<button type="button" data-related-separate>別のコーデ（関連付けを解除）</button><button type="button" data-related-later>あとで</button></details>`:'';
  root.querySelectorAll('[data-related-add]').forEach(button=>button.onclick=()=>{
   try{const group=candidates[Number(button.dataset.relatedAdd)],newCats=cats.filter((_,col)=>state.cells[`${index}:${col}`]);
    addProRelated(row,group,button.dataset.relatedId,newCats);row.suggestionsLater=true;changed();redraw();
   }catch(e){notify(e.message)}
  });
  const separate=root.querySelector('[data-related-separate]');if(separate)separate.onclick=()=>{row.existingParts=[];row.partGroups=[];row.partEdits={};row.selectedSet=null;row.step1Selection=false;row.suggestionsLater=true;changed();redraw()};
  const later=root.querySelector('[data-related-later]');if(later)later.onclick=()=>{row.suggestionsLater=true;root.querySelector('details').open=false};
 }
 table.querySelectorAll('[data-pro-step1-name]').forEach(input=>{input.oninput=()=>{const n=Number(input.dataset.proStep1Name);rename(state.rows[n],input.value);state.rows[n].suggestionsLater=false;panel(n);changed()}});
 state.rows.forEach((_,n)=>panel(n));
 table.querySelectorAll('[data-pro-thumbnail]').forEach(input=>input.onchange=async()=>{
  const file=input.files?.[0];input.value='';if(!file||state.inputMode==='qr')return;
  if(!file.type.startsWith('image/'))return notify('画像ファイルを選択してください');
  try{const row=state.rows[Number(input.dataset.proThumbnail)],image=await photoDataURL(file);if(state.inputMode==='qr')return;row.thumb=image;redraw()}catch{notify('サムネイルを保存できませんでした')}
 });
}
