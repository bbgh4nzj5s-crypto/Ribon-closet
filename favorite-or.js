import {matches} from './core.js';
export function matchesCloset(item,filter,category='全て') {
 const keys=['fav','fav2','fav3'];
 return (category==='全て'||item.cat===category)&&matches(item,{...filter,fav:false,fav2:false,fav3:false})&&(!keys.some(k=>filter[k])||keys.some(k=>filter[k]&&item[k]));
}
