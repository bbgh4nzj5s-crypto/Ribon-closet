export const defaultBackground=image=>({image,x:0,y:0,scale:1,angle:0,flip:false});
export function copyBackgrounds(sides){return [0,1].map(n=>sides?.[n]?{...defaultBackground(sides[n].image),...sides[n]}:null)}
export function backgroundTransform(bg){return `translate(${bg.x||0}%, ${bg.y||0}%) rotate(${bg.angle||0}deg) scale(${bg.flip?-Math.abs(bg.scale||1):Math.abs(bg.scale||1)}, ${Math.abs(bg.scale||1)})`}
export const backgroundPosition=bg=>`${50+(bg?.x||0)}% ${50+(bg?.y||0)}%`;
export function dragBackground(bg,dx,dy,width,height){return {...bg,x:(bg.x||0)+dx/width*100,y:(bg.y||0)+dy/height*100}}

// Preserve both backgrounds while moving the selected pair side to the single view.
export function closePairBackgrounds(sides,active){const copy=copyBackgrounds(sides);return active===1?[copy[1],copy[0]]:copy}
// Store a private snapshot; missing legacy backgrounds are represented as null.
export function bestBackgroundSnapshot(sides,paired,active){const copy=copyBackgrounds(sides);return paired?copy:[copy[active===1?1:0],null]}
