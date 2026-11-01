// Suggestions are a read-only view: the stored records are never changed.
export function nameSuggestions(items,query){
 const key=s=>String(s||'').replace(/\s/gu,'');
 const q=key(query);if(!q)return [];
 const rank={トップス:0,ボトムス:1,アクセ:2,シューズ:3,ワンピース:4};
 const groups=new Map();
 for(const item of items){const name=String(item.name||''),k=key(name);if(!k||!k.includes(q))continue;const old=groups.get(k);if(!old||(item.image&&!old.image)||(!!item.image===!!old.image&&(rank[item.cat]??99)<(rank[old.cat]??99)))groups.set(k,item)}
 return [...groups.values()].sort((a,b)=>Number(key(b.name).startsWith(q))-Number(key(a.name).startsWith(q))).map(i=>({name:i.name,image:i.image||''}));
}
