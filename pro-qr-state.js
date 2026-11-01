// QR data stays on the image or row, never on a transient table-cell position.
export function pairMember(image){return ['トップス','ボトムス'].includes(image.proCategory)}
export function effectiveQR(image,row){return row.fullQRActive&&row.fullQR?row.fullQR:row.pairQRActive&&row.pairQR&&pairMember(image)?row.pairQR:image.individualQR||null}
export function assignQR(image,row,blob){if(!(blob instanceof Blob))throw Error('QR画像を選択してください');if(row.fullQRActive)row.fullQR=blob;else if(row.pairQRActive&&pairMember(image))row.pairQR=blob;else image.individualQR=blob}
