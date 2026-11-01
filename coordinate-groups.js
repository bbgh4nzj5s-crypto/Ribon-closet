// A missing ID is deliberately distinct for every item; names never establish identity.
export function coordinateIdentity(item){
 if(item.catalogRef?.id)return JSON.stringify(['official',item.catalogRef.gameId||'aipri-verse',item.catalogRef.editionId||'',item.catalogRef.id]);
 if(item.coordinateGroupId)return JSON.stringify(['manual',item.coordinateGroupId]);
 return JSON.stringify(['unlinked',item.id]);
}
export function groupCoordinates(items){const groups=new Map();for(const item of items){const key=coordinateIdentity(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}return [...groups.values()]}

export function selectCoordinateGroup(target, mode, {name="", group=null, createId=()=>crypto.randomUUID()}={}){
 if(mode==="new"){const n=name.trim();if(!n)throw Error("コーデ名を入力してください");target.coordinateGroupId=createId();target.coordinateGroupName=n}
 else if(mode==="existing"){if(!group?.[0]?.coordinateGroupId)throw Error("コーデを選択してください");target.coordinateGroupId=group[0].coordinateGroupId;target.coordinateGroupName=group[0].coordinateGroupName||group[0].name}
 else if(mode==="none"){target.coordinateGroupId="";target.coordinateGroupName=""}
 else throw Error("選択内容が不正です");return target
}
