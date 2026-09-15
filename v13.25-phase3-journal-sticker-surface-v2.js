/* Audrey Closet v13.25 Phase 3 — Journal Sticker Surface v2
 * Layout49 architectural sticker editor.
 *
 * One fixed-coordinate transform surface owns live sticker editing:
 * - Journal content stays fixed underneath
 * - gesture frames use compositor transforms only
 * - Journal percentages/state are committed only on Done/close
 * - one read-only renderer owns stickers after editing closes
 */
(function(){
  'use strict';

  const VERSION='2.1';
  const STYLE_ID='v1325JournalStickerSurfaceV2Styles';
  const VIRTUAL_W=1000;
  const MIN_SIZE=90;
  const MAX_STICKERS=12;

  let session=null;
  let gesture=null;
  let raf=0;
  let pendingPoint=null;
  let listenersAbort=null;

  function reader(){return document.querySelector('#v1325JournalReaderDialog');}
  function readerPage(){return document.querySelector('#v1325JournalReaderPage');}
  function entry(){const r=reader(),id=r?.dataset?.journalId||viewingJournalId||'';return state.journal.find(x=>String(x.id)===String(id))||null;}
  function creative(e){if(!e)return null;if(!e.creativePage||typeof e.creativePage!=='object')e.creativePage={};if(!Array.isArray(e.creativePage.objects))e.creativePage.objects=[];return e.creativePage;}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function uid(){return `journalSticker_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
  function packs(){return Array.isArray(window.AUDREY_STICKER_PACKS_V1?.packs)?window.AUDREY_STICKER_PACKS_V1.packs:[];}
  function stickerDef(packId,id){return packs().find(p=>String(p.id)===String(packId))?.stickers?.find(s=>String(s.id)===String(id))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #v1325JournalReaderDialog.v1325-surface-editing .v1325-refine-sticker-layer,
      #v1325JournalReaderDialog.v1325-surface-editing .v1325-reader-sticker-layer{visibility:hidden!important;pointer-events:none!important}
      #v1325JournalReaderDialog.v1325-surface-editing .v1325-refine-tray{display:block!important;bottom:112px!important}
      #v1325JournalReaderDialog.v1325-surface-editing .v1325-reader-scroll{padding-bottom:250px!important}
      #v1325JournalReaderDialog.v1325-surface-editing #v1325ReaderBackBtn,
      #v1325JournalReaderDialog.v1325-surface-editing #v1325ReaderEditBtn{opacity:.38!important;pointer-events:none!important;filter:grayscale(.25)!important}
      #v1325JournalReaderDialog.v1325-surface-editing .v1325-refine-footer-stickers{background:var(--olive,#66715a)!important;color:#fff!important;border-color:var(--olive-dark,#4e5945)!important}

      #v1325JournalReaderPage{position:relative!important}
      #v1325JournalReaderPage .v1325-sticker-surface-viewport{position:absolute;inset:0;z-index:35;overflow:visible;pointer-events:none;contain:layout style paint}
      #v1325JournalReaderDialog.v1325-surface-editing #v1325JournalReaderPage .v1325-sticker-surface-viewport{pointer-events:auto}
      #v1325JournalReaderPage .v1325-sticker-surface{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;will-change:transform;contain:layout style paint}
      #v1325JournalReaderDialog.v1325-surface-editing #v1325JournalReaderPage .v1325-sticker-surface{pointer-events:auto}

      #v1325JournalReaderPage .v1325-surface-sticker{position:absolute;left:0;top:0;display:grid;place-items:center;box-sizing:border-box;transform-origin:center center;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;backface-visibility:hidden;-webkit-backface-visibility:hidden;contain:layout style paint;container-type:size}
      #v1325JournalReaderPage .v1325-surface-sticker img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none}
      #v1325JournalReaderPage .v1325-surface-sticker .v1325-surface-glyph{display:grid;place-items:center;width:100%;height:100%;font-size:min(72cqw,72cqh);line-height:1;pointer-events:none}
      #v1325JournalReaderPage .v1325-surface-sticker.outlined img{filter:drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff)}
      #v1325JournalReaderPage .v1325-surface-sticker.outlined .v1325-surface-glyph{text-shadow:-3px 0 #fff,3px 0 #fff,0 -3px #fff,0 3px #fff,-2px -2px #fff,2px 2px #fff,-2px 2px #fff,2px -2px #fff}
      #v1325JournalReaderPage .v1325-surface-sticker.selected:before{content:'';position:absolute;inset:1px;border:1.5px dashed rgba(90,72,56,.66);border-radius:6px;pointer-events:none;box-sizing:border-box}
      #v1325JournalReaderPage .v1325-surface-sticker.gesture-active{will-change:transform;z-index:999!important}
      #v1325JournalReaderPage .v1325-surface-sticker.gesture-active img{filter:none!important}
      #v1325JournalReaderPage .v1325-surface-sticker.gesture-active:before{display:none}
      #v1325JournalReaderPage .v1325-surface-sticker:not(.selected) .v1325-surface-handle{display:none!important}
      #v1325JournalReaderPage .v1325-surface-handle{position:absolute;padding:0;border:1px solid rgba(85,66,52,.28);border-radius:50%;background:#fffaf0;color:#664f3f;box-shadow:0 2px 7px rgba(50,39,31,.18);font-family:system-ui;font-weight:800;text-align:center;z-index:8;touch-action:none;box-sizing:border-box}

      #v1325JournalReaderDialog.v1325-surface-editing .v1325-refine-help{white-space:normal!important;line-height:1.25!important}
      #v1325JournalReaderDialog.v1325-surface-editing [data-outline]{opacity:1!important;pointer-events:auto!important}

      @media(max-width:560px){
        #v1325JournalReaderDialog.v1325-surface-editing .v1325-refine-tray{bottom:120px!important}
        #v1325JournalReaderDialog.v1325-surface-editing .v1325-reader-scroll{padding-bottom:258px!important}
      }
    `;document.head.appendChild(s);
  }

  function contentMarkup(model){
    const d=stickerDef(model.packId,model.stickerId),src=model.src||(d?.type==='image'?d.src:'')||'',glyph=model.glyph||d?.glyph||'✨';
    return src?`<img src="${esc(src)}" alt="${esc(model.label||d?.label||'Sticker')}" draggable="false">`:`<span class="v1325-surface-glyph">${esc(glyph)}</span>`;
  }

  function objectToModel(obj,vh){
    const x=(+obj.x||0)/100*VIRTUAL_W,y=(+obj.y||0)/100*vh;
    const w=clamp((+obj.w||16)/100*VIRTUAL_W,MIN_SIZE,VIRTUAL_W*.5);
    let h=clamp((+obj.h||15)/100*vh,MIN_SIZE,vh*.5);
    if(!obj.src&&!(stickerDef(obj.packId,obj.stickerId)?.type==='image'))h=w;
    else if(h>w*1.8||h<w*.45)h=w;
    return {id:obj.id,packId:obj.packId,stickerId:obj.stickerId,label:obj.label,glyph:obj.glyph,src:obj.src||'',x,y,w,h,rotation:+obj.rotation||0,outline:!!obj.outline,z:+obj.z||30,deleted:false};
  }

  function modelToObject(model,vh,obj){
    obj.x=clamp(model.x/VIRTUAL_W*100,0,100-model.w/VIRTUAL_W*100);
    obj.y=clamp(model.y/vh*100,0,100-model.h/vh*100);
    obj.w=clamp(model.w/VIRTUAL_W*100,4,60);
    obj.h=clamp(model.h/vh*100,2,60);
    obj.rotation=Math.round((model.rotation||0)*10)/10;obj.outline=!!model.outline;
  }

  function transformFor(m){return `translate3d(${m.x}px,${m.y}px,0) rotate(${m.rotation||0}deg)`;}
  function applyModelNode(node,m){node.style.width=m.w+'px';node.style.height=m.h+'px';node.style.zIndex=String(m.z||30);node.style.transform=transformFor(m);node.classList.toggle('outlined',!!m.outline);}

  function sizeHandles(node){
    if(!session||!node)return;
    /* The whole virtual surface is scaled to the phone. Counter-scale controls so
       they remain a finger-friendly ~30px on screen regardless of page width. */
    const visual=30,unit=visual/Math.max(.12,session.scale),font=14/Math.max(.12,session.scale),offset=8/Math.max(.12,session.scale);
    node.querySelectorAll('.v1325-surface-handle').forEach(h=>{h.style.width=unit+'px';h.style.height=unit+'px';h.style.minWidth=unit+'px';h.style.fontSize=font+'px';h.style.lineHeight=unit+'px';});
    const del=node.querySelector('.v1325-surface-delete'),rez=node.querySelector('.v1325-surface-resize'),rot=node.querySelector('.v1325-surface-rotate');
    if(del){del.style.right=-offset+'px';del.style.top=-offset+'px';}
    if(rez){rez.style.right=-offset+'px';rez.style.bottom=-offset+'px';}
    if(rot){rot.style.left=-offset+'px';rot.style.bottom=-offset+'px';}
  }

  function makeNode(model){
    const n=document.createElement('div');n.className='v1325-surface-sticker'+(model.outline?' outlined':'');n.dataset.surfaceStickerId=model.id;n.innerHTML=contentMarkup(model)+'<button type="button" class="v1325-surface-handle v1325-surface-delete" aria-label="Delete sticker">×</button><button type="button" class="v1325-surface-handle v1325-surface-resize" aria-label="Resize sticker">↘</button><button type="button" class="v1325-surface-handle v1325-surface-rotate" aria-label="Rotate sticker">↻</button>';applyModelNode(n,model);sizeHandles(n);
    const img=n.querySelector('img');
    if(img){
      const normalize=()=>{
        if(!session||!img.naturalWidth||!img.naturalHeight)return;
        const m=session.models.get(model.id);if(!m)return;
        const ratio=img.naturalWidth/img.naturalHeight,desired=clamp(m.w/Math.max(.15,ratio),MIN_SIZE,session.vh*.45);
        if(m.h>desired*1.32||m.h<desired*.68){m.h=desired;applyModelNode(n,m);}
      };
      if(img.complete)requestAnimationFrame(normalize);else img.addEventListener('load',normalize,{once:true});
    }
    return n;
  }

  function selectedModel(){return session?.selectedId?session.models.get(session.selectedId)||null:null;}
  function select(id){if(!session)return;session.selectedId=id||'';session.surface.querySelectorAll('.v1325-surface-sticker.selected').forEach(n=>n.classList.remove('selected'));if(id)session.surface.querySelector(`[data-surface-sticker-id="${CSS.escape(id)}"]`)?.classList.add('selected');syncBorderButton();}

  function createSurface(){
    const rp=readerPage();if(!rp)return null;
    rp.querySelector(':scope > .v1325-sticker-surface-viewport')?.remove();
    const pageRect=rp.getBoundingClientRect();if(pageRect.width<20||pageRect.height<20)return null;
    const scale=pageRect.width/VIRTUAL_W,vh=Math.max(700,pageRect.height/scale);
    const viewport=document.createElement('div');viewport.className='v1325-sticker-surface-viewport';
    const surface=document.createElement('div');surface.className='v1325-sticker-surface';surface.style.width=VIRTUAL_W+'px';surface.style.height=vh+'px';surface.style.transform=`scale(${scale})`;viewport.appendChild(surface);rp.appendChild(viewport);
    return {rp,viewport,surface,pageRect,scale,vh};
  }

  function openEditor(){
    if(session)return;
    const r=reader(),e=entry(),p=creative(e),base=createSurface();if(!r||!e||!p||!base)return;
    const models=new Map();session={...base,e,models,selectedId:'',dirty:false,defaultOutline:false};
    p.objects.filter(o=>o&&o.kind==='sticker').forEach(o=>{const m=objectToModel(o,base.vh);models.set(m.id,m);base.surface.appendChild(makeNode(m));});
    r.classList.remove('v1325-refine-decorating','v1325-gesture-session');r.classList.add('v1325-surface-editing');
    const b=r.querySelector('.v1325-refine-footer-stickers');if(b){b.classList.add('active');b.textContent='✓ Done';}
    const help=r.querySelector('.v1325-refine-help');if(help)help.textContent='Tap below to add • drag to move • ↻ rotate • ↘ resize';
    bindSessionEvents();syncBorderButton();
  }

  function commitSession(){
    if(!session)return;
    const p=creative(session.e),nonStickers=p.objects.filter(o=>o?.kind!=='sticker'),byId=new Map(p.objects.filter(o=>o?.kind==='sticker').map(o=>[String(o.id),o])),next=[];
    for(const m of session.models.values()){
      if(m.deleted)continue;
      let o=byId.get(String(m.id));
      if(!o)o={id:m.id,kind:'sticker',packId:m.packId,stickerId:m.stickerId,label:m.label,glyph:m.glyph,src:m.src,z:m.z||30};
      modelToObject(m,session.vh,o);next.push(o);
    }
    p.objects=[...nonStickers,...next];session.e.updated=Date.now();
    try{Promise.resolve(saveState()).catch(()=>{});}catch{}
  }

  function hideLegacyReadLayer(){
    const r=reader();if(!r)return;
    r.querySelectorAll('.v1325-reader-sticker-layer').forEach(n=>{n.style.display='none';n.setAttribute('aria-hidden','true');});
  }

  function closeEditor({commit=true}={}){
    const r=reader();if(!session){r?.classList.remove('v1325-surface-editing');return;}
    cancelGesture();if(commit)commitSession();
    session.viewport?.remove();session=null;listenersAbort?.abort();listenersAbort=null;
    r?.classList.remove('v1325-surface-editing');
    const b=r?.querySelector('.v1325-refine-footer-stickers');if(b){b.classList.remove('active');b.textContent='✦ Add Stickers';}
    /* There are two historic read renderers in this dev stack. Keep only the
       refinement renderer visible; calling the older creative-page refresh here
       was the cause of the duplicate smaller sticker set after Done. */
    hideLegacyReadLayer();
    requestAnimationFrame(()=>{try{window.AudreyJournalCreativeRefinements?.refresh?.();}catch{} hideLegacyReadLayer();});
  }

  function syncBorderButton(){
    const btn=reader()?.querySelector('[data-outline]');if(!btn||!session)return;
    const m=selectedModel(),on=m?!!m.outline:!!session.defaultOutline;
    btn.classList.toggle('active',on);btn.textContent=`Border ${on?'On':'Off'}`;
  }

  function addSticker(packId,stickerId){
    if(!session)return;const d=stickerDef(packId,stickerId);if(!d)return;
    const active=[...session.models.values()].filter(m=>!m.deleted);if(active.length>=MAX_STICKERS){if(typeof toast==='function')toast(`Journal pages can hold up to ${MAX_STICKERS} stickers`);return;}
    /* Start large enough to manipulate comfortably on an iPhone. */
    const w=d.sizeClass==='medium'?255:220,h=w,c=active.length;
    const m={id:uid(),packId,stickerId,label:d.label||stickerId,glyph:d.glyph||'✨',src:d.type==='image'?d.src:'',x:clamp(520+(c%3)*45,30,VIRTUAL_W-w-30),y:clamp(170+(c%4)*58,30,session.vh-h-30),w,h,rotation:0,outline:!!session.defaultOutline,z:50+c,deleted:false};
    session.models.set(m.id,m);session.surface.appendChild(makeNode(m));session.dirty=true;select(m.id);
  }

  function deleteSelected(id){if(!session)return;const m=session.models.get(id);if(!m)return;m.deleted=true;session.surface.querySelector(`[data-surface-sticker-id="${CSS.escape(id)}"]`)?.remove();session.dirty=true;select('');}
  function toggleBorder(){
    if(!session)return;const m=selectedModel();
    if(m){m.outline=!m.outline;session.surface.querySelector(`[data-surface-sticker-id="${CSS.escape(m.id)}"]`)?.classList.toggle('outlined',m.outline);session.dirty=true;}
    else session.defaultOutline=!session.defaultOutline;
    syncBorderButton();
  }

  function pointToVirtual(ev){const rect=session?.rp.getBoundingClientRect();if(!rect||!session)return{x:0,y:0};return{x:(ev.clientX-rect.left)/session.scale,y:(ev.clientY-rect.top)/session.scale};}

  function startGesture(ev,node,mode){
    if(!session)return;const id=node.dataset.surfaceStickerId,m=session.models.get(id);if(!m)return;
    ev.preventDefault();ev.stopImmediatePropagation();select(id);
    const p=pointToVirtual(ev),cx=m.x+m.w/2,cy=m.y+m.h/2;
    gesture={mode,node,m,pointerId:ev.pointerId,startX:p.x,startY:p.y,lastX:p.x,lastY:p.y,start:{x:m.x,y:m.y,w:m.w,h:m.h,rotation:m.rotation||0},cx,cy};
    node.classList.add('gesture-active');try{node.setPointerCapture(ev.pointerId);}catch{}
  }

  function queueGesture(ev){if(!gesture||ev.pointerId!==gesture.pointerId)return;ev.preventDefault();ev.stopImmediatePropagation();pendingPoint=pointToVirtual(ev);if(!raf)raf=requestAnimationFrame(paintGesture);}
  function paintGesture(){raf=0;if(!gesture||!pendingPoint)return;const g=gesture,p=pendingPoint;g.lastX=p.x;g.lastY=p.y;const dx=p.x-g.startX,dy=p.y-g.startY;
    if(g.mode==='move')g.node.style.transform=`translate3d(${g.start.x+dx}px,${g.start.y+dy}px,0) rotate(${g.start.rotation}deg)`;
    else if(g.mode==='resize'){const nw=clamp(g.start.w+dx,MIN_SIZE,VIRTUAL_W*.60),nh=clamp(g.start.h+dy,MIN_SIZE,session.vh*.60),sx=nw/g.start.w,sy=nh/g.start.h;g.node.style.transform=`translate3d(${g.start.x}px,${g.start.y}px,0) rotate(${g.start.rotation}deg) scale3d(${sx},${sy},1)`;g.previewW=nw;g.previewH=nh;}
    else if(g.mode==='rotate'){const a0=Math.atan2(g.startY-g.cy,g.startX-g.cx),a1=Math.atan2(p.y-g.cy,p.x-g.cx),deg=g.start.rotation+(a1-a0)*180/Math.PI;g.node.style.transform=`translate3d(${g.start.x}px,${g.start.y}px,0) rotate(${deg}deg)`;g.previewRotation=deg;}
  }

  function finishGesture(ev){if(!gesture||ev.pointerId!==gesture.pointerId)return;ev.preventDefault();ev.stopImmediatePropagation();pendingPoint=pointToVirtual(ev);if(raf){cancelAnimationFrame(raf);raf=0;}paintGesture();const g=gesture,dx=g.lastX-g.startX,dy=g.lastY-g.startY;
    if(g.mode==='move'){g.m.x=clamp(g.start.x+dx,0,VIRTUAL_W-g.m.w);g.m.y=clamp(g.start.y+dy,0,session.vh-g.m.h);}
    else if(g.mode==='resize'){g.m.w=g.previewW||g.start.w;g.m.h=g.previewH||g.start.h;g.m.x=clamp(g.start.x,0,VIRTUAL_W-g.m.w);g.m.y=clamp(g.start.y,0,session.vh-g.m.h);}
    else if(g.mode==='rotate')g.m.rotation=Math.round((Number.isFinite(g.previewRotation)?g.previewRotation:g.start.rotation)*10)/10;
    applyModelNode(g.node,g.m);g.node.classList.remove('gesture-active');session.dirty=true;try{g.node.releasePointerCapture(ev.pointerId);}catch{}gesture=null;pendingPoint=null;
  }

  function cancelGesture(){if(raf)cancelAnimationFrame(raf);raf=0;pendingPoint=null;if(gesture){applyModelNode(gesture.node,gesture.m);gesture.node.classList.remove('gesture-active');gesture=null;}}

  function bindSessionEvents(){
    listenersAbort?.abort();listenersAbort=new AbortController();const sig=listenersAbort.signal;
    session.surface.addEventListener('pointerdown',ev=>{
      const del=ev.target.closest?.('.v1325-surface-delete');if(del){ev.preventDefault();ev.stopImmediatePropagation();deleteSelected(del.closest('.v1325-surface-sticker')?.dataset.surfaceStickerId);return;}
      const rot=ev.target.closest?.('.v1325-surface-rotate');if(rot){startGesture(ev,rot.closest('.v1325-surface-sticker'),'rotate');return;}
      const rez=ev.target.closest?.('.v1325-surface-resize');if(rez){startGesture(ev,rez.closest('.v1325-surface-sticker'),'resize');return;}
      const st=ev.target.closest?.('.v1325-surface-sticker');if(st){startGesture(ev,st,'move');return;}
      select('');
    },{capture:true,signal:sig});
    window.addEventListener('pointermove',queueGesture,{capture:true,passive:false,signal:sig});window.addEventListener('pointerup',finishGesture,{capture:true,signal:sig});window.addEventListener('pointercancel',finishGesture,{capture:true,signal:sig});
  }

  document.addEventListener('click',ev=>{
    const r=reader(),addBtn=ev.target.closest?.('.v1325-refine-footer-stickers');
    if(addBtn){ev.preventDefault();ev.stopImmediatePropagation();if(session)closeEditor({commit:true});else openEditor();return;}
    if(ev.target.closest?.('#v1325ReaderCloseBtn')){if(session)closeEditor({commit:true});return;}
    if(!session)return;
    if(ev.target.closest?.('#v1325ReaderBackBtn,#v1325ReaderEditBtn')){ev.preventDefault();ev.stopImmediatePropagation();return;}
    const stickerChoice=ev.target.closest?.('[data-sticker]');if(stickerChoice){ev.preventDefault();ev.stopImmediatePropagation();addSticker(stickerChoice.dataset.packId,stickerChoice.dataset.sticker);return;}
    const outline=ev.target.closest?.('[data-outline]');if(outline){ev.preventDefault();ev.stopImmediatePropagation();toggleBorder();return;}
  },true);

  document.addEventListener('click',ev=>{if(ev.target.closest?.('#v1325JournalViewBtn')){if(session)closeEditor({commit:true});requestAnimationFrame(()=>reader()?.classList.remove('v1325-surface-editing'));}},true);

  installStyles();
  window.AudreyJournalStickerSurfaceV2={version:VERSION,open:openEditor,done:()=>closeEditor({commit:true}),reset:()=>closeEditor({commit:true}),isOpen:()=>!!session};
})();
