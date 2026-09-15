/* Audrey Closet v13.25 Phase 3 — Journal sticker interaction polish
 * Layout46
 * - lifts sticker tray above footer
 * - locks Back/Edit Journal while decorating
 * - corrects tap-to-add help text
 * - adds rotation control
 * - improves move/resize performance using transform-only live previews
 *   and a single persistence write when the gesture ends
 */
(function(){
  'use strict';
  const VERSION='1.0';
  const STYLE_ID='v1325JournalStickerInteractionPolishStyles';
  let gesture=null;

  function reader(){return document.querySelector('#v1325JournalReaderDialog');}
  function currentEntry(){const r=reader(),id=r?.dataset?.journalId||viewingJournalId||'';return state.journal.find(x=>String(x.id)===String(id))||null;}
  function creative(e){if(!e)return null;if(!e.creativePage||typeof e.creativePage!=='object')e.creativePage={};if(!Array.isArray(e.creativePage.objects))e.creativePage.objects=[];return e.creativePage;}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function persist(e){if(!e)return;e.updated=Date.now();try{Promise.resolve(saveState()).catch(()=>{});}catch{}}
  function isDecorating(){return reader()?.classList.contains('v1325-refine-decorating');}
  function findObject(id){const e=currentEntry();return creative(e)?.objects.find(o=>String(o.id)===String(id))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      /* Give the tray clear breathing room above the persistent footer. */
      #v1325JournalReaderDialog .v1325-refine-tray{bottom:94px!important}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-reader-scroll{padding-bottom:232px!important}

      /* Only Done/Add Stickers remains actionable while decorating. */
      #v1325JournalReaderDialog.v1325-refine-decorating #v1325ReaderBackBtn,
      #v1325JournalReaderDialog.v1325-refine-decorating #v1325ReaderEditBtn{
        opacity:.38!important;pointer-events:none!important;filter:grayscale(.25)!important
      }

      /* Rotation sits opposite resize so all three edit handles are distinct. */
      #v1325JournalReaderDialog .v1325-refine-rotate{
        display:none;position:absolute;left:-17px;bottom:-17px;width:28px;height:28px;min-width:28px;padding:0;
        border:1px solid rgba(85,66,52,.28);border-radius:50%;background:#fffaf0;color:#664f3f;
        box-shadow:0 2px 8px rgba(50,39,31,.20);font:800 15px/26px system-ui;text-align:center;z-index:6
      }
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected .v1325-refine-rotate{display:block}
      #v1325JournalReaderDialog .v1325-refine-sticker.v1325-gesture-active{will-change:transform;width,height;z-index:80!important}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-refine-tray{bottom:102px!important}
        #v1325JournalReaderDialog.v1325-refine-decorating .v1325-reader-scroll{padding-bottom:238px!important}
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

  function updateHelp(){
    const help=reader()?.querySelector('.v1325-refine-help');
    if(help)help.textContent='Tap to add • drag to move • use ↻ to rotate • ↘ to resize';
  }

  function syncMode(){installStyles();updateHelp();ensureRotationHandles();}

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
    gesture={mode,node,obj,e,pointerId:ev.pointerId,startX:ev.clientX,startY:ev.clientY,pageRect:rect,
      start:{x:+obj.x||0,y:+obj.y||0,w:+obj.w||16,h:+obj.h||15,rotation:+obj.rotation||0},
      centerX:box.left+box.width/2,centerY:box.top+box.height/2};
    node.classList.add('v1325-gesture-active');
    try{node.setPointerCapture(ev.pointerId);}catch{}
  }

  function moveGesture(ev){
    if(!gesture||ev.pointerId!==gesture.pointerId)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const g=gesture,dx=ev.clientX-g.startX,dy=ev.clientY-g.startY;
    if(g.mode==='move'){
      g.node.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${g.start.rotation}deg)`;
    }else if(g.mode==='resize'){
      const dxPct=dx/Math.max(1,g.pageRect.width)*100,dyPct=dy/Math.max(1,g.pageRect.height)*100;
      const nw=clamp(g.start.w+dxPct,7,50),nh=clamp(g.start.h+dyPct,7,50);
      const sx=nw/Math.max(.001,g.start.w),sy=nh/Math.max(.001,g.start.h);
      g.node.style.transform=`scale3d(${sx},${sy},1) rotate(${g.start.rotation}deg)`;
    }else if(g.mode==='rotate'){
      const a0=Math.atan2(g.startY-g.centerY,g.startX-g.centerX),a1=Math.atan2(ev.clientY-g.centerY,ev.clientX-g.centerX);
      const deg=g.start.rotation+(a1-a0)*180/Math.PI;
      g.node.style.transform=`rotate(${deg}deg)`;
      g.previewRotation=deg;
    }
  }

  function finishGesture(ev){
    if(!gesture||ev.pointerId!==gesture.pointerId)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const g=gesture,dx=ev.clientX-g.startX,dy=ev.clientY-g.startY;
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
      const deg=Number.isFinite(g.previewRotation)?g.previewRotation:g.start.rotation;
      g.obj.rotation=Math.round(deg*10)/10;
    }
    g.node.style.transform=`rotate(${+g.obj.rotation||0}deg)`;g.node.classList.remove('v1325-gesture-active');
    try{g.node.releasePointerCapture(ev.pointerId);}catch{}
    gesture=null;persist(g.e);
  }

  document.addEventListener('click',ev=>{
    if(!isDecorating())return;
    if(ev.target.closest?.('#v1325ReaderBackBtn,#v1325ReaderEditBtn')){ev.preventDefault();ev.stopImmediatePropagation();return;}
  },true);

  document.addEventListener('pointerdown',ev=>{
    if(!isDecorating())return;
    const rotate=ev.target.closest?.('.v1325-refine-rotate');if(rotate){startGesture(ev,rotate.closest('.v1325-refine-sticker'),'rotate');return;}
    const resize=ev.target.closest?.('.v1325-refine-resize');if(resize){startGesture(ev,resize.closest('.v1325-refine-sticker'),'resize');return;}
    const sticker=ev.target.closest?.('.v1325-refine-sticker');
    if(sticker&&!ev.target.closest?.('.v1325-refine-delete')){startGesture(ev,sticker,'move');}
  },true);
  document.addEventListener('pointermove',moveGesture,{capture:true,passive:false});
  document.addEventListener('pointerup',finishGesture,true);
  document.addEventListener('pointercancel',finishGesture,true);

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.v1325-refine-footer-stickers,[data-pack],[data-sticker],[data-outline]')){requestAnimationFrame(syncMode);setTimeout(syncMode,25);}
  },true);

  installStyles();requestAnimationFrame(syncMode);setTimeout(syncMode,180);
  window.AudreyJournalStickerInteractionPolish={version:VERSION,refresh:syncMode};
})();
