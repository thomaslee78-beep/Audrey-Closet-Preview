/* Audrey Closet v13.25 Phase 3 — Journal sticker interaction polish
 * Layout47
 * - sticker mode always resets closed when leaving/reopening Journal View
 * - tighter selection frame/handles around sticker artwork
 * - locks Back/Edit Journal while decorating
 * - tap-to-add help text + move/resize/rotate controls
 * - rAF-coalesced transform-only gesture previews for smoother iPhone interaction
 * - one persistence write after each completed gesture
 */
(function(){
  'use strict';
  const VERSION='1.1';
  const STYLE_ID='v1325JournalStickerInteractionPolishStyles';
  let gesture=null;

  function reader(){return document.querySelector('#v1325JournalReaderDialog');}
  function currentEntry(){const r=reader(),id=r?.dataset?.journalId||viewingJournalId||'';return state.journal.find(x=>String(x.id)===String(id))||null;}
  function creative(e){if(!e)return null;if(!e.creativePage||typeof e.creativePage!=='object')e.creativePage={};if(!Array.isArray(e.creativePage.objects))e.creativePage.objects=[];return e.creativePage;}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function persist(e){if(!e)return;e.updated=Date.now();setTimeout(()=>{try{Promise.resolve(saveState()).catch(()=>{});}catch{}},0);}
  function isDecorating(){return reader()?.classList.contains('v1325-refine-decorating');}
  function findObject(id){const e=currentEntry();return creative(e)?.objects.find(o=>String(o.id)===String(id))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      /* Give the tray clear breathing room above the persistent footer. */
      #v1325JournalReaderDialog .v1325-refine-tray{bottom:100px!important}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-reader-scroll{padding-bottom:238px!important}

      /* Only Done/Add Stickers remains actionable while decorating. */
      #v1325JournalReaderDialog.v1325-refine-decorating #v1325ReaderBackBtn,
      #v1325JournalReaderDialog.v1325-refine-decorating #v1325ReaderEditBtn{
        opacity:.38!important;pointer-events:none!important;filter:grayscale(.25)!important
      }

      /* Keep the editable frame visually close to the artwork instead of the larger hit box. */
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected{outline:none!important}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected:before{
        content:'';position:absolute;inset:7%;border:1.5px dashed rgba(90,72,56,.58);border-radius:7px;pointer-events:none;box-sizing:border-box
      }
      #v1325JournalReaderDialog .v1325-refine-delete{right:-5px!important;top:-5px!important}
      #v1325JournalReaderDialog .v1325-refine-resize{right:-5px!important;bottom:-5px!important}

      /* Rotation sits opposite resize so all three edit handles are distinct. */
      #v1325JournalReaderDialog .v1325-refine-rotate{
        display:none;position:absolute;left:-5px;bottom:-5px;width:28px;height:28px;min-width:28px;padding:0;
        border:1px solid rgba(85,66,52,.28);border-radius:50%;background:#fffaf0;color:#664f3f;
        box-shadow:0 2px 8px rgba(50,39,31,.20);font:800 15px/26px system-ui;text-align:center;z-index:6
      }
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected .v1325-refine-rotate{display:block}

      /* Promote sticker layer/active sticker to their own cheap compositor path. */
      #v1325JournalReaderDialog .v1325-refine-sticker-layer{contain:layout style;transform:translateZ(0)}
      #v1325JournalReaderDialog .v1325-refine-sticker{transform:translateZ(0);backface-visibility:hidden;-webkit-backface-visibility:hidden}
      #v1325JournalReaderDialog .v1325-refine-sticker.v1325-gesture-active{will-change:transform;z-index:80!important}
      #v1325JournalReaderDialog .v1325-refine-sticker.v1325-gesture-active img{filter:none!important}
      #v1325JournalReaderDialog .v1325-refine-sticker.v1325-gesture-active:before{display:none!important}
      #v1325JournalReaderDialog.v1325-gesture-session .v1325-refine-sticker:not(.v1325-gesture-active){pointer-events:none!important}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-refine-tray{bottom:108px!important}
        #v1325JournalReaderDialog.v1325-refine-decorating .v1325-reader-scroll{padding-bottom:244px!important}
      }
    `;document.head.appendChild(s);
  }

  function ensureRotationHandles(){
    const r=reader();if(!r)return;
    r.querySelectorAll('.v1325-refine-sticker').forEach(node=>{
      if(node.querySelector('.v1325-refine-rotate'))return;
      const b=document.createElement('button');b.type='button';b.className='v1325-refine-rotate';b.setAttribute('aria-label','Rotate sticker');b.textContent='↻';node.appendChild(b);
    });
  }

  function updateHelp(){const help=reader()?.querySelector('.v1325-refine-help');if(help)help.textContent='Tap to add • drag to move • ↻ rotate • ↘ resize';}
  function syncMode(){installStyles();updateHelp();ensureRotationHandles();}

  function resetStickerMode(){
    const r=reader();if(!r)return;
    if(gesture){if(gesture.raf)cancelAnimationFrame(gesture.raf);gesture.node?.classList.remove('v1325-gesture-active');gesture=null;}
    r.classList.remove('v1325-refine-decorating','v1325-gesture-session');
    r.querySelectorAll('.v1325-refine-sticker.selected').forEach(n=>n.classList.remove('selected'));
    const b=r.querySelector('.v1325-refine-footer-stickers');
    if(b){b.classList.remove('active');b.textContent='✦ Add Stickers';}
  }

  function selectNode(node){
    const r=reader();if(!r||!node)return;
    r.querySelectorAll('.v1325-refine-sticker.selected').forEach(n=>{if(n!==node)n.classList.remove('selected');});
    node.classList.add('selected');ensureRotationHandles();
  }

  function startGesture(ev,node,mode){
    const rp=document.querySelector('#v1325JournalReaderPage');
    const id=node?.dataset?.stickerId,obj=findObject(id),e=currentEntry();
    if(!rp||!node||!obj||!e)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    selectNode(node);
    const rect=rp.getBoundingClientRect(),box=node.getBoundingClientRect();
    gesture={mode,node,obj,e,pointerId:ev.pointerId,startX:ev.clientX,startY:ev.clientY,lastX:ev.clientX,lastY:ev.clientY,pageRect:rect,raf:0,
      start:{x:+obj.x||0,y:+obj.y||0,w:+obj.w||16,h:+obj.h||15,rotation:+obj.rotation||0},
      centerX:box.left+box.width/2,centerY:box.top+box.height/2};
    node.classList.add('v1325-gesture-active');reader()?.classList.add('v1325-gesture-session');
    try{node.setPointerCapture(ev.pointerId);}catch{}
  }

  function paintGesture(){
    if(!gesture)return;gesture.raf=0;
    const g=gesture,dx=g.lastX-g.startX,dy=g.lastY-g.startY;
    if(g.mode==='move'){
      g.node.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${g.start.rotation}deg)`;
    }else if(g.mode==='resize'){
      const dxPct=dx/Math.max(1,g.pageRect.width)*100,dyPct=dy/Math.max(1,g.pageRect.height)*100;
      const nw=clamp(g.start.w+dxPct,7,50),nh=clamp(g.start.h+dyPct,7,50);
      const sx=nw/Math.max(.001,g.start.w),sy=nh/Math.max(.001,g.start.h);
      g.node.style.transform=`translateZ(0) scale3d(${sx},${sy},1) rotate(${g.start.rotation}deg)`;
    }else if(g.mode==='rotate'){
      const a0=Math.atan2(g.startY-g.centerY,g.startX-g.centerX),a1=Math.atan2(g.lastY-g.centerY,g.lastX-g.centerX);
      const deg=g.start.rotation+(a1-a0)*180/Math.PI;
      g.node.style.transform=`translateZ(0) rotate(${deg}deg)`;g.previewRotation=deg;
    }
  }

  function moveGesture(ev){
    if(!gesture||ev.pointerId!==gesture.pointerId)return;
    ev.preventDefault();ev.stopImmediatePropagation();gesture.lastX=ev.clientX;gesture.lastY=ev.clientY;
    if(!gesture.raf)gesture.raf=requestAnimationFrame(paintGesture);
  }

  function finishGesture(ev){
    if(!gesture||ev.pointerId!==gesture.pointerId)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const g=gesture;if(g.raf){cancelAnimationFrame(g.raf);g.raf=0;}g.lastX=ev.clientX;g.lastY=ev.clientY;paintGesture();
    const dx=g.lastX-g.startX,dy=g.lastY-g.startY;
    if(g.mode==='move'){
      const dxPct=dx/Math.max(1,g.pageRect.width)*100,dyPct=dy/Math.max(1,g.pageRect.height)*100;
      g.obj.x=clamp(g.start.x+dxPct,0,100-g.start.w);g.obj.y=clamp(g.start.y+dyPct,0,100-g.start.h);
      g.node.style.left=g.obj.x+'%';g.node.style.top=g.obj.y+'%';
    }else if(g.mode==='resize'){
      const dxPct=dx/Math.max(1,g.pageRect.width)*100,dyPct=dy/Math.max(1,g.pageRect.height)*100;
      g.obj.w=clamp(g.start.w+dxPct,7,50);g.obj.h=clamp(g.start.h+dyPct,7,50);
      g.obj.x=clamp(g.start.x,0,100-g.obj.w);g.obj.y=clamp(g.start.y,0,100-g.obj.h);
      g.node.style.width=g.obj.w+'%';g.node.style.height=g.obj.h+'%';g.node.style.left=g.obj.x+'%';g.node.style.top=g.obj.y+'%';
    }else if(g.mode==='rotate'){
      const deg=Number.isFinite(g.previewRotation)?g.previewRotation:g.start.rotation;g.obj.rotation=Math.round(deg*10)/10;
    }
    g.node.style.transform=`translateZ(0) rotate(${+g.obj.rotation||0}deg)`;g.node.classList.remove('v1325-gesture-active');reader()?.classList.remove('v1325-gesture-session');
    try{g.node.releasePointerCapture(ev.pointerId);}catch{}
    gesture=null;persist(g.e);
  }

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#v1325ReaderCloseBtn')){resetStickerMode();return;}
    if(ev.target.closest?.('#v1325JournalViewBtn')){resetStickerMode();requestAnimationFrame(syncMode);return;}
    if(!isDecorating())return;
    if(ev.target.closest?.('#v1325ReaderBackBtn,#v1325ReaderEditBtn')){ev.preventDefault();ev.stopImmediatePropagation();return;}
  },true);

  document.addEventListener('pointerdown',ev=>{
    if(!isDecorating())return;
    const rotate=ev.target.closest?.('.v1325-refine-rotate');if(rotate){startGesture(ev,rotate.closest('.v1325-refine-sticker'),'rotate');return;}
    const resize=ev.target.closest?.('.v1325-refine-resize');if(resize){startGesture(ev,resize.closest('.v1325-refine-sticker'),'resize');return;}
    const sticker=ev.target.closest?.('.v1325-refine-sticker');if(sticker&&!ev.target.closest?.('.v1325-refine-delete'))startGesture(ev,sticker,'move');
  },true);
  document.addEventListener('pointermove',moveGesture,{capture:true,passive:false});
  document.addEventListener('pointerup',finishGesture,true);
  document.addEventListener('pointercancel',finishGesture,true);

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.v1325-refine-footer-stickers,[data-pack],[data-sticker],[data-outline]')){requestAnimationFrame(syncMode);setTimeout(syncMode,25);}
  },true);

  installStyles();requestAnimationFrame(syncMode);setTimeout(syncMode,180);
  window.AudreyJournalStickerInteractionPolish={version:VERSION,refresh:syncMode,reset:resetStickerMode};
})();
