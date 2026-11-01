export function assignPro(cells,image,slot,replace=false){const next={...cells},old=Object.entries(next).find(([,v])=>v===image)?.[0];if(next[slot]&&next[slot]!==image&&!replace)return null;if(old&&old!==slot)delete next[old];next[slot]=image;return next}
export function removePro(cells,image){return Object.fromEntries(Object.entries(cells).filter(([,v])=>v!==image))}
