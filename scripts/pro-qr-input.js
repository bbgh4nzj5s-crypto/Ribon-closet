import {readQR} from './media.js';
// readQR regenerates the symbol and compares all decoded bytes before returning.
// Retain the original photograph separately; never silently fall back to it as a verified QR.
export async function prepareProQR(file,reader=readQR){
 const result=await reader(file);
 if(!/^data:image\/png;base64,/.test(result.qr)||!Array.isArray(result.bytes)||!result.bytes.length)throw Error('QRの検証結果が不正です。登録を中止しました。');
 const bytes=Uint8Array.from(atob(result.qr.split(',')[1]),c=>c.charCodeAt(0));
 return {blob:new Blob([bytes],{type:'image/png'}),bytes:[...result.bytes],source:file};
}
// Canonical saved items remain JSON-backup compatible; retain the photograph without resizing.
export async function photoDataURL(file){const bytes=new Uint8Array(await file.arrayBuffer()),chunks=[];for(let i=0;i<bytes.length;i+=8192)chunks.push(String.fromCharCode(...bytes.subarray(i,i+8192)));return 'data:'+(file.type||'application/octet-stream')+';base64,'+btoa(chunks.join(''))}
