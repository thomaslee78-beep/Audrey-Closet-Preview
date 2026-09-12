/* Audrey Closet v13.25 Phase 2 — Closet -> Journal Log Outfit
 * Temporary Closet selection mode that hands chosen Closet IDs into the
 * existing Journal wear dialog. No parallel persistence model is introduced.
 */
(function(){
  'use strict';

  let active=false;
  let selected=new Set();
  let observer=null;
  let shapeObserver=null;

  const IDS={button:'closetLogOutfitBtn',toolbar:'closetLogModeBar',count:'closetLogSelectedCount',finish:'closetLogFinishBtn',cancel:'closetLogCancelBtn'};

  function visibleClosetItem(id){return state.items.find(item=>item.id===id&&!isArchived(item))||null;}

  function syncButtonShape(){
    const button=document.querySelector('#'+IDS.button);
    const add=document.querySelector('#addItemBtn');
    if(!button||!add)return;
    const style=getComputedStyle(add);
    button.style.setProperty('border-top-left-radius',style.borderTopLeftRadius,'important');
    button.style.setProperty('border-top-right-radius',style.borderTopRightRadius,'important');
    button.style.setProperty('border-bottom-right-radius',style.borderBottomRightRadius,'important');
    button.style.setProperty('border-bottom-left-radius',style.borderBottomLeftRadius,'important');
  }

  function scheduleShapeSync(){[0,40,120,260].forEach(delay=>setTimeout(syncButtonShape,delay));}

  function observeAddPieceShape(){
    const add=document.querySelector('#addItemBtn');
    if(!add)return;
    if(shapeObserver)shapeObserver.disconnect();
    shapeObserver=new MutationObserver(scheduleShapeSync);
    shapeObserver.observe(add,{attributes:true,attributeFilter:['class','style']});
  }

  function syncModeLocks(){
    const quick=document.querySelector('#quickAddBtn');
    const nav=document.querySelector('.bottom-nav');
    if(quick){quick.disabled=active;quick.setAttribute('aria-disabled',active?'true':'false');}
    if(nav){nav.setAttribute('aria-disabled',active?'true':'false');nav.querySelectorAll('button').forEach(btn=>{btn.disabled=active;btn.setAttribute('aria-disabled',active?'true':'false');});}
  }

  function installControls(){
    const hero=document.querySelector('[data-screen="catalog"] .hero-card');
    const add=document.querySelector('#addItemBtn');
    if(!hero||!add)return;
    hero.classList.add('v1325-closet-hero');
    const copy=hero.firstElementChild;if(copy)copy.classList.add('v1325-closet-hero-copy');

    let actions=hero.querySelector('.v1325-closet-hero-actions');
    if(!actions){actions=document.createElement('div');actions.className='v1325-closet-hero-actions';add.parentNode.insertBefore(actions,add);actions.appendChild(add);}
    add.classList.add('v1325-closet-hero-button');

    if(!document.querySelector('#'+IDS.button)){
      const button=document.createElement('button');button.type='button';button.id=IDS.button;button.className='soft-btn v1325-closet-hero-button';button.textContent='Log Outfit';button.addEventListener('click',startSelectionMode);actions.insertBefore(button,add);
    }
    scheduleShapeSync();
    observeAddPieceShape();

    if(!document.querySelector('#'+IDS.toolbar)){
      const bar=document.createElement('div');bar.id=IDS.toolbar;bar.className='v1325-closet-log-bar hidden';bar.setAttribute('role','region');bar.setAttribute('aria-label','Log outfit selection');
      bar.innerHTML=`<div class="v1325-closet-log-copy"><strong>Select what you wore</strong><span>Select what you wore and click Finish to log to journal.</span><small id="${IDS.count}">0 selected</small></div><div class="v1325-closet-log-actions"><button type="button" class="soft-btn" id="${IDS.cancel}">Cancel</button><button type="button" class="primary" id="${IDS.finish}" disabled>Finish</button></div>`;
      document.body.appendChild(bar);document.querySelector('#'+IDS.cancel).addEventListener('click',cancelSelectionMode);document.querySelector('#'+IDS.finish).addEventListener('click',finishSelectionMode);
    }

    if(!document.querySelector('#v1325Phase2ClosetLogStyles')){
      const style=document.createElement('style');style.id='v1325Phase2ClosetLogStyles';style.textContent=`
        [data-screen="catalog"] .hero-card.v1325-closet-hero{align-items:center;gap:12px;padding:18px 18px 18px 20px}
        .v1325-closet-hero-copy{flex:1 1 auto;min-width:0}.v1325-closet-hero-copy .script,.v1325-closet-hero-copy h2{white-space:nowrap}.v1325-closet-hero-copy .script{font-size:clamp(18px,5vw,23px)}.v1325-closet-hero-copy h2{font-size:clamp(25px,6.2vw,31px);margin-bottom:5px}
        .v1325-closet-hero-actions{position:relative;z-index:2;display:flex;flex-direction:column;gap:9px;align-items:stretch;justify-content:center;flex:0 0 auto;width:132px}
        .v1325-closet-hero-button{width:100%;min-height:44px;padding:10px 12px!important;font-size:13.5px!important;line-height:1.1;white-space:nowrap;font-family:inherit;font-weight:750}
        #closetLogOutfitBtn{background:rgba(255,250,240,.94);color:var(--olive-dark,#3f4937);border:1px solid rgba(255,255,255,.42)}
        .v1325-closet-log-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + max(env(safe-area-inset-bottom),4px));z-index:999;width:min(760px,calc(100% - 24px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 16px;border:1px solid rgba(102,91,73,.34);border-radius:18px;background:rgba(243,238,226,.97);backdrop-filter:blur(20px) saturate(1.06);-webkit-backdrop-filter:blur(20px) saturate(1.06);box-shadow:0 -12px 30px rgba(54,50,42,.22),0 8px 22px rgba(54,50,42,.16),0 0 0 1px rgba(255,255,255,.48) inset}
        .v1325-closet-log-copy{display:flex;flex-direction:column;gap:2px;min-width:0;line-height:1.3}.v1325-closet-log-copy strong{font-size:1rem;color:var(--ink,#292820)}.v1325-closet-log-copy span{font-size:.78rem;color:#655d50;max-width:430px}.v1325-closet-log-copy small{font-size:.78rem;color:var(--olive-dark,#3f4937);font-weight:750;margin-top:3px}
        .v1325-closet-log-actions{display:flex;gap:9px;flex:0 0 auto}.v1325-closet-log-actions>button{min-width:82px;min-height:42px;padding:10px 13px;font-size:13px}
        body.v1325-closet-log-mode{padding-bottom:calc(176px + env(safe-area-inset-bottom))}body.v1325-closet-log-mode #addItemBtn,body.v1325-closet-log-mode #closetLogOutfitBtn{visibility:hidden;pointer-events:none}body.v1325-closet-log-mode #quickAddBtn{opacity:.32;pointer-events:none}body.v1325-closet-log-mode .bottom-nav{opacity:.48;pointer-events:none}
        body.v1325-closet-log-mode #catalogGrid .item-card{cursor:pointer;position:relative;transition:transform .14s ease,box-shadow .14s ease,outline-color .14s ease}body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected{outline:3px solid var(--olive,#66715a);outline-offset:-3px;box-shadow:0 8px 22px rgba(60,72,54,.18);transform:translateY(-1px)}body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected::after{content:'✓';position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:var(--olive,#66715a);color:white;font-weight:800;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:5}body.v1325-closet-log-mode #catalogGrid .item-card:active{transform:scale(.985)}
        @media(max-width:520px){[data-screen="catalog"] .hero-card.v1325-closet-hero{padding:15px 14px 15px 16px;gap:8px}.v1325-closet-hero-copy .muted{font-size:11px;line-height:1.25;max-width:170px}.v1325-closet-hero-actions{width:120px;gap:8px}.v1325-closet-hero-button{min-height:42px;padding:9px 10px!important;font-size:13px!important}.v1325-closet-log-bar{width:calc(100% - 24px);gap:10px;padding:13px 13px 14px}.v1325-closet-log-copy span{font-size:.72rem;max-width:205px}.v1325-closet-log-actions{gap:7px}.v1325-closet-log-actions>button{min-width:72px;min-height:40px;padding:9px 10px;font-size:12px}}
        @media(max-width:390px){.v1325-closet-hero-copy .muted{display:none}.v1325-closet-hero-copy .script{font-size:18px}.v1325-closet-hero-copy h2{font-size:24px}.v1325-closet-hero-actions{width:112px}.v1325-closet-log-copy span{max-width:165px}}
      `;document.head.appendChild(style);
    }
  }

  function startSelectionMode(){if(active)return;active=true;selected=new Set();document.body.classList.add('v1325-closet-log-mode');document.querySelector('#'+IDS.toolbar)?.classList.remove('hidden');syncModeLocks();observeCatalog();refreshSelectionUI();}
  function exitSelectionMode(){active=false;document.body.classList.remove('v1325-closet-log-mode');document.querySelector('#'+IDS.toolbar)?.classList.add('hidden');document.querySelectorAll('#catalogGrid .item-card.v1325-log-selected').forEach(card=>card.classList.remove('v1325-log-selected'));if(observer){observer.disconnect();observer=null;}syncModeLocks();}
  function cancelSelectionMode(){selected.clear();exitSelectionMode();}
  function finishSelectionMode(){const ids=[...selected].filter(id=>visibleClosetItem(id));if(!ids.length){toast('Select at least one closet piece');return;}exitSelectionMode();selected.clear();openWear();wearDraftIds=new Set(ids);wearCategoryFilter='All';renderWearPicker();}
  function toggleItem(id){if(!active||!visibleClosetItem(id))return;if(selected.has(id))selected.delete(id);else selected.add(id);refreshSelectionUI();}
  function refreshSelectionUI(){if(!active)return;document.querySelectorAll('#catalogGrid .item-card[data-id]').forEach(card=>{card.classList.toggle('v1325-log-selected',selected.has(card.dataset.id));card.setAttribute('aria-pressed',selected.has(card.dataset.id)?'true':'false');});const count=selected.size;const label=document.querySelector('#'+IDS.count);if(label)label.textContent=`${count} selected`;const finish=document.querySelector('#'+IDS.finish);if(finish)finish.disabled=count===0;}
  function observeCatalog(){if(observer)observer.disconnect();const grid=document.querySelector('#catalogGrid');if(!grid)return;observer=new MutationObserver(()=>requestAnimationFrame(refreshSelectionUI));observer.observe(grid,{childList:true,subtree:true});}
  function interceptPress(e){if(!active)return;const card=e.target.closest?.('#catalogGrid .item-card[data-id]');if(!card)return;e.stopPropagation();}
  function interceptClick(e){if(!active)return;const card=e.target.closest?.('#catalogGrid .item-card[data-id]');if(!card)return;e.preventDefault();e.stopPropagation();toggleItem(card.dataset.id);}
  function installCaptureGuards(){const grid=document.querySelector('#catalogGrid');if(!grid||grid.dataset.v1325ClosetLogGuards==='1')return;['pointerdown','mousedown','touchstart'].forEach(type=>grid.addEventListener(type,interceptPress,true));grid.addEventListener('click',interceptClick,true);grid.addEventListener('contextmenu',e=>{if(active&&e.target.closest?.('.item-card')){e.preventDefault();e.stopPropagation();}},true);grid.dataset.v1325ClosetLogGuards='1';}
  function observeViewSetting(){
    document.addEventListener('change',e=>{
      const context=[e.target?.id,e.target?.name,e.target?.getAttribute?.('aria-label'),e.target?.closest?.('label')?.textContent,e.target?.closest?.('.settings-card')?.textContent].filter(Boolean).join(' ').toLowerCase();
      if(context.includes('closet')||context.includes('view')||e.target?.closest?.('dialog'))scheduleShapeSync();
    },true);
    document.addEventListener('click',e=>{if(e.target?.closest?.('dialog,.settings-card,#settingsDialog'))scheduleShapeSync();},true);
  }

  installControls();installCaptureGuards();observeViewSetting();syncModeLocks();window.addEventListener('pageshow',()=>{installControls();installCaptureGuards();scheduleShapeSync();syncModeLocks();if(active){observeCatalog();refreshSelectionUI();}});
  window.AudreyClosetLogOutfit={start:startSelectionMode,cancel:cancelSelectionMode,finish:finishSelectionMode,getSelected:()=>[...selected]};
})();
