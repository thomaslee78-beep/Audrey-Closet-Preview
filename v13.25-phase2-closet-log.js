/* Audrey Closet v13.25 Phase 2 — Closet -> Journal Log Outfit */
(function(){
  'use strict';
  let active=false,selected=new Set(),observer=null,shapeObserver=null;
  const IDS={button:'closetLogOutfitBtn',toolbar:'closetLogModeBar',count:'closetLogSelectedCount',finish:'closetLogFinishBtn',cancel:'closetLogCancelBtn'};
  const item=id=>state.items.find(x=>x.id===id&&!isArchived(x))||null;

  function copyRadius(el,style){
    if(!el||!style)return;
    [['border-top-left-radius','borderTopLeftRadius'],['border-top-right-radius','borderTopRightRadius'],['border-bottom-right-radius','borderBottomRightRadius'],['border-bottom-left-radius','borderBottomLeftRadius']].forEach(([p,k])=>el.style.setProperty(p,style[k],'important'));
  }
  function syncShape(){
    const add=document.querySelector('#addItemBtn');if(!add)return;
    const s=getComputedStyle(add);
    copyRadius(document.querySelector('#'+IDS.button),s);
    copyRadius(document.querySelector('#'+IDS.toolbar),s);
    copyRadius(document.querySelector('#'+IDS.cancel),s);
    copyRadius(document.querySelector('#'+IDS.finish),s);
  }
  function scheduleShapeSync(){[0,40,120,260].forEach(ms=>setTimeout(syncShape,ms));}
  function observeAddShape(){
    const add=document.querySelector('#addItemBtn');if(!add)return;
    shapeObserver?.disconnect();shapeObserver=new MutationObserver(scheduleShapeSync);
    shapeObserver.observe(add,{attributes:true,attributeFilter:['class','style']});
  }
  function syncTrayPosition(){
    const bar=document.querySelector('#'+IDS.toolbar),nav=document.querySelector('.bottom-nav');
    if(!bar||!nav)return;
    const r=nav.getBoundingClientRect();
    const vh=window.visualViewport?.height||window.innerHeight;
    const gap=6;
    const bottom=Math.max(4,Math.round(vh-r.top+gap));
    bar.style.bottom=bottom+'px';
  }
  function scheduleTrayPosition(){[0,50,150].forEach(ms=>setTimeout(syncTrayPosition,ms));}
  function locks(){
    const q=document.querySelector('#quickAddBtn'),nav=document.querySelector('.bottom-nav');
    if(q){q.disabled=active;q.setAttribute('aria-disabled',active?'true':'false');}
    nav?.querySelectorAll('button').forEach(b=>{b.disabled=active;b.setAttribute('aria-disabled',active?'true':'false');});
  }

  function install(){
    const hero=document.querySelector('[data-screen="catalog"] .hero-card'),add=document.querySelector('#addItemBtn');if(!hero||!add)return;
    hero.classList.add('v1325-closet-hero');hero.firstElementChild?.classList.add('v1325-closet-hero-copy');
    let actions=hero.querySelector('.v1325-closet-hero-actions');
    if(!actions){actions=document.createElement('div');actions.className='v1325-closet-hero-actions';add.parentNode.insertBefore(actions,add);actions.appendChild(add);}
    add.classList.add('v1325-closet-hero-button');
    if(!document.querySelector('#'+IDS.button)){
      const b=document.createElement('button');b.type='button';b.id=IDS.button;b.className='soft-btn v1325-closet-hero-button';b.textContent='Log Outfit';b.onclick=start;actions.insertBefore(b,add);
    }
    if(!document.querySelector('#'+IDS.toolbar)){
      const bar=document.createElement('div');bar.id=IDS.toolbar;bar.className='v1325-closet-log-bar hidden';bar.setAttribute('role','region');bar.setAttribute('aria-label','Log outfit selection');
      bar.innerHTML=`<div class="v1325-closet-log-copy"><strong>Select what you wore</strong><span>Select what you wore and click Finish to log to journal.</span><small id="${IDS.count}">0 selected</small></div><div class="v1325-closet-log-actions"><button type="button" class="soft-btn" id="${IDS.cancel}">Cancel</button><button type="button" class="primary" id="${IDS.finish}" disabled>Finish</button></div>`;
      document.body.appendChild(bar);document.querySelector('#'+IDS.cancel).onclick=cancel;document.querySelector('#'+IDS.finish).onclick=finish;
    }
    if(!document.querySelector('#v1325Phase2ClosetLogStyles')){
      const st=document.createElement('style');st.id='v1325Phase2ClosetLogStyles';st.textContent=`
      [data-screen="catalog"] .hero-card.v1325-closet-hero{align-items:center;gap:12px;padding:18px 18px 18px 20px}.v1325-closet-hero-copy{flex:1 1 auto;min-width:0}.v1325-closet-hero-copy .script,.v1325-closet-hero-copy h2{white-space:nowrap}.v1325-closet-hero-copy .script{font-size:clamp(18px,5vw,23px)}.v1325-closet-hero-copy h2{font-size:clamp(25px,6.2vw,31px);margin-bottom:5px}.v1325-closet-hero-actions{position:relative;z-index:2;display:flex;flex-direction:column;gap:9px;align-items:stretch;justify-content:center;flex:0 0 auto;width:132px}.v1325-closet-hero-button{width:100%;min-height:44px;padding:10px 12px!important;font-size:13.5px!important;line-height:1.1;white-space:nowrap;font-family:inherit;font-weight:750}#closetLogOutfitBtn{background:rgba(255,250,240,.94);color:var(--olive-dark,#3f4937);border:1px solid rgba(255,255,255,.42)}
      .v1325-closet-log-bar{position:fixed;left:50%;transform:translateX(-50%);z-index:999;width:min(760px,calc(100% - 24px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 16px;border:1px solid rgba(102,91,73,.34);background:rgba(243,238,226,.97);backdrop-filter:blur(20px) saturate(1.06);-webkit-backdrop-filter:blur(20px) saturate(1.06);box-shadow:0 -12px 30px rgba(54,50,42,.22),0 8px 22px rgba(54,50,42,.16),0 0 0 1px rgba(255,255,255,.48) inset}.v1325-closet-log-copy{display:flex;flex-direction:column;gap:2px;min-width:0;line-height:1.3}.v1325-closet-log-copy strong{font-size:1rem;color:var(--ink,#292820)}.v1325-closet-log-copy span{font-size:.78rem;color:#655d50;max-width:430px}.v1325-closet-log-copy small{font-size:.78rem;color:var(--olive-dark,#3f4937);font-weight:750;margin-top:3px}.v1325-closet-log-actions{display:flex;gap:9px;flex:0 0 auto}.v1325-closet-log-actions>button{min-width:82px;min-height:42px;padding:10px 13px;font-size:13px}
      body.v1325-closet-log-mode{padding-bottom:calc(176px + env(safe-area-inset-bottom))}body.v1325-closet-log-mode #addItemBtn,body.v1325-closet-log-mode #closetLogOutfitBtn{visibility:hidden;pointer-events:none}body.v1325-closet-log-mode #quickAddBtn{opacity:.32;pointer-events:none}body.v1325-closet-log-mode .bottom-nav{opacity:.48;pointer-events:none}body.v1325-closet-log-mode #catalogGrid .item-card{cursor:pointer;position:relative;transition:transform .14s ease,box-shadow .14s ease,outline-color .14s ease}body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected{outline:3px solid var(--olive,#66715a);outline-offset:-3px;box-shadow:0 8px 22px rgba(60,72,54,.18);transform:translateY(-1px)}body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected::after{content:'✓';position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:var(--olive,#66715a);color:white;font-weight:800;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:5}
      @media(max-width:520px){[data-screen="catalog"] .hero-card.v1325-closet-hero{padding:15px 14px 15px 16px;gap:8px}.v1325-closet-hero-copy .muted{font-size:11px;line-height:1.25;max-width:170px}.v1325-closet-hero-actions{width:120px;gap:8px}.v1325-closet-hero-button{min-height:42px;padding:9px 10px!important;font-size:13px!important}.v1325-closet-log-bar{width:calc(100% - 24px);gap:10px;padding:13px 13px 14px}.v1325-closet-log-copy span{font-size:.72rem;max-width:205px}.v1325-closet-log-actions{gap:7px}.v1325-closet-log-actions>button{min-width:72px;min-height:40px;padding:9px 10px;font-size:12px}}@media(max-width:390px){.v1325-closet-hero-copy .muted{display:none}.v1325-closet-hero-copy .script{font-size:18px}.v1325-closet-hero-copy h2{font-size:24px}.v1325-closet-hero-actions{width:112px}.v1325-closet-log-copy span{max-width:165px}}`;
      document.head.appendChild(st);
    }
    scheduleShapeSync();observeAddShape();scheduleTrayPosition();
  }

  function start(){if(active)return;active=true;selected=new Set();document.body.classList.add('v1325-closet-log-mode');document.querySelector('#'+IDS.toolbar)?.classList.remove('hidden');locks();observe();refresh();scheduleTrayPosition();scheduleShapeSync();}
  function exit(){active=false;document.body.classList.remove('v1325-closet-log-mode');document.querySelector('#'+IDS.toolbar)?.classList.add('hidden');document.querySelectorAll('#catalogGrid .item-card.v1325-log-selected').forEach(c=>c.classList.remove('v1325-log-selected'));observer?.disconnect();observer=null;locks();}
  function cancel(){selected.clear();exit();}
  function finish(){const ids=[...selected].filter(item);if(!ids.length){toast('Select at least one closet piece');return;}exit();selected.clear();openWear();wearDraftIds=new Set(ids);wearCategoryFilter='All';renderWearPicker();}
  function refresh(){if(!active)return;document.querySelectorAll('#catalogGrid .item-card[data-id]').forEach(c=>{c.classList.toggle('v1325-log-selected',selected.has(c.dataset.id));c.setAttribute('aria-pressed',selected.has(c.dataset.id)?'true':'false');});const n=selected.size;document.querySelector('#'+IDS.count).textContent=`${n} selected`;document.querySelector('#'+IDS.finish).disabled=n===0;}
  function observe(){observer?.disconnect();const g=document.querySelector('#catalogGrid');if(!g)return;observer=new MutationObserver(()=>requestAnimationFrame(refresh));observer.observe(g,{childList:true,subtree:true});}
  function guardPress(e){if(!active)return;const c=e.target.closest?.('#catalogGrid .item-card[data-id]');if(c)e.stopPropagation();}
  function guardClick(e){if(!active)return;const c=e.target.closest?.('#catalogGrid .item-card[data-id]');if(!c)return;e.preventDefault();e.stopPropagation();const id=c.dataset.id;if(!item(id))return;selected.has(id)?selected.delete(id):selected.add(id);refresh();}
  function guards(){const g=document.querySelector('#catalogGrid');if(!g||g.dataset.v1325ClosetLogGuards==='1')return;['pointerdown','mousedown','touchstart'].forEach(t=>g.addEventListener(t,guardPress,true));g.addEventListener('click',guardClick,true);g.addEventListener('contextmenu',e=>{if(active&&e.target.closest?.('.item-card')){e.preventDefault();e.stopPropagation();}},true);g.dataset.v1325ClosetLogGuards='1';}
  document.addEventListener('change',e=>{if(e.target?.closest?.('dialog,.settings-card,#settingsDialog')){scheduleShapeSync();scheduleTrayPosition();}},true);
  document.addEventListener('click',e=>{if(e.target?.closest?.('dialog,.settings-card,#settingsDialog')){scheduleShapeSync();scheduleTrayPosition();}},true);
  window.addEventListener('resize',scheduleTrayPosition);window.visualViewport?.addEventListener('resize',scheduleTrayPosition);
  install();guards();locks();window.addEventListener('pageshow',()=>{install();guards();scheduleShapeSync();scheduleTrayPosition();locks();if(active){observe();refresh();}});
  window.AudreyClosetLogOutfit={start,cancel,finish,getSelected:()=>[...selected]};
})();
