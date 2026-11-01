import {sameCard} from './catalog-import.js';
import {relatedCoordinate} from './inventory.js';
const exact=s=>String(s||'').normalize('NFKC').trim();
const series=i=>(i.catalogRef?.editionId||i.catalogRef?.id||'').replace(/[-\d].*$/,'');
export function design(name){const n=exact(name).replace(/\s+/g,''),color=['サーモンピンク','ライトブルー','オレンジ','イエロー','パープル','グリーン','ホワイト','ブラック','ピンク','ブルー','レッド','ゴールド','シルバー','水色','黄色','紫','赤','青','白','黒','緑'].find(c=>n.endsWith(c));return color&&n.length>color.length+3?{base:n.slice(0,-color.length),color}:null}
export function relatedItems(i,items,coords){const c=relatedCoordinate(i,coords);if(c)return c.parts.map(p=>items.find(x=>sameCard(x,p))||{...p,name:c.name,catalogRef:c,source:c.source,total:c.total,inCloset:false,wanted:false,referenceOnly:true});return i.coordinateGroupId?items.filter(x=>!x.catalogRef?.id&&x.coordinateGroupId===i.coordinateGroupId):items.filter(x=>x.id===i.id)}
export function colorVariants(i,items){return items.filter(x=>{if(x.cat!==i.cat)return false;if(x.id===i.id)return true;if(i.designGroup||x.designGroup)return !!i.designGroup&&i.designGroup===x.designGroup;const a=design(i.catalogRef?.name||i.name),b=design(x.catalogRef?.name||x.name);return a&&b&&a.base===b.base&&a.color!==b.color&&series(i)===series(x)})}
