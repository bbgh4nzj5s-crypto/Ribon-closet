// Display-only gesture controller. All placement is delegated to the existing cell handler.
export function bindProDrag({table,strip,onDrop,document:doc=globalThis.document,delay=260}){
 if(!doc?.elementFromPoint||!strip?.addEventListener)return ()=>{};
 const screen=table.closest?.('.pro-step-one'),viewport=doc.defaultView?.visualViewport;
 let pending=null,active=null,ghost=null,hover=null,suppressUntil=0;const removers=[];
 const listen=(node,type,fn,options)=>{node.addEventListener(type,fn,options);removers.push(()=>node.removeEventListener(type,fn,options))};
 const clear=()=>{if(pending)clearTimeout(pending.timer);pending=null;active=null;ghost?.remove();ghost=null;hover?.classList.remove('pro-drop-target');hover=null;table.classList.remove('pro-drag-active')};
 if(screen&&viewport){const fit=()=>screen.style.setProperty('--pro-viewport-height',Math.round(viewport.height)+'px');fit();listen(viewport,'resize',fit);listen(viewport,'scroll',fit)}
 const targetAt=(x,y)=>{const el=doc.elementFromPoint(x,y)?.closest?.('[data-pro-cell]');return el&&table.contains(el)?el:null};
 const start=(el,id,x,y)=>{active={id,x,y};ghost=el.cloneNode(true);ghost.className='pro-drag-ghost';ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');doc.body.appendChild(ghost);ghost.style.left=x+'px';ghost.style.top=y+'px';table.classList.add('pro-drag-active');pending=null};
 const arm=(event,x,y)=>{const el=event.target.closest?.('[data-pro-image]');if(!el||!strip.contains(el))return;clear();pending={x,y,el,id:el.dataset.proImage,timer:setTimeout(()=>{const p=pending;if(p)start(p.el,p.id,p.x,p.y)},delay)}};
 const move=(event,x,y)=>{if(pending&&Math.hypot(x-pending.x,y-pending.y)>8){clear();return}if(!active)return;event.preventDefault();ghost.style.left=x+'px';ghost.style.top=y+'px';const next=targetAt(x,y);if(next!==hover){hover?.classList.remove('pro-drop-target');hover=next;hover?.classList.add('pro-drop-target')}const box=table.getBoundingClientRect();if(y<box.top+35)table.scrollTop-=14;else if(y>box.bottom-35)table.scrollTop+=14};
 const end=(event,x,y)=>{if(!active){clear();return}event.preventDefault();const id=active.id,cell=targetAt(x,y);suppressUntil=Date.now()+600;strip._proDragSuppressUntil=suppressUntil;clear();if(cell)onDrop(id,cell.dataset.proCell)};
 listen(strip,'pointerdown',e=>{if(e.pointerType!=='touch'&&e.button===0)arm(e,e.clientX,e.clientY)});
 listen(doc,'pointermove',e=>{if(e.pointerType!=='touch')move(e,e.clientX,e.clientY)},{passive:false});
 listen(doc,'pointerup',e=>{if(e.pointerType!=='touch')end(e,e.clientX,e.clientY)},{passive:false});listen(doc,'pointercancel',clear);
 listen(strip,'touchstart',e=>{if(e.touches.length===1)arm(e,e.touches[0].clientX,e.touches[0].clientY);else clear()},{passive:true});
 listen(doc,'touchmove',e=>{if(e.touches.length===1)move(e,e.touches[0].clientX,e.touches[0].clientY);else clear()},{passive:false});
 listen(doc,'touchend',e=>{const t=e.changedTouches[0];if(t)end(e,t.clientX,t.clientY)},{passive:false});listen(doc,'touchcancel',clear);
 listen(strip,'contextmenu',e=>{if(active||pending)e.preventDefault()});listen(strip,'click',e=>{if(Date.now()<Math.max(suppressUntil,strip._proDragSuppressUntil||0)){e.preventDefault();e.stopImmediatePropagation()}},true);
 listen(doc.defaultView||globalThis,'blur',clear);
 return ()=>{clear();removers.forEach(fn=>fn())};
}
