/* Audrey Closet v13.25 Phase 2 — Closet -> Journal Log Outfit
 * Temporary Closet selection mode that hands chosen Closet IDs into the
 * existing Journal wear dialog. No parallel persistence model is introduced.
 */
(function(){
  'use strict';

  let active=false;
  let selected=new Set();
  let observer=null;

  const IDS={
    button:'closetLogOutfitBtn',
    toolbar:'closetLogModeBar',
    count:'closetLogSelectedCount',
    finish:'closetLogFinishBtn',
    cancel:'closetLogCancelBtn'
  };

  function visibleClosetItem(id){
    return state.items.find(item=>item.id===id&&!isArchived(item))||null;
  }

  function installControls(){
    const hero=document.querySelector('[data-screen="catalog"] .hero-card');
    const add=document.querySelector('#addItemBtn');
    if(!hero||!add)return;

    let actions=hero.querySelector('.v1325-closet-hero-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='v1325-closet-hero-actions';
      add.parentNode.insertBefore(actions,add);
      actions.appendChild(add);
    }

    if(!document.querySelector('#'+IDS.button)){
      const button=document.createElement('button');
      button.type='button';
      button.id=IDS.button;
      button.className='soft-btn';
      button.textContent='Log Outfit';
      button.addEventListener('click',startSelectionMode);
      actions.insertBefore(button,add);
    }

    if(!document.querySelector('#'+IDS.toolbar)){
      const bar=document.createElement('div');
      bar.id=IDS.toolbar;
      bar.className='v1325-closet-log-bar hidden';
      bar.innerHTML=`
        <div class="v1325-closet-log-copy">
          <strong>Select what you wore</strong>
          <span id="${IDS.count}">0 selected</span>
        </div>
        <div class="v1325-closet-log-actions">
          <button type="button" class="soft-btn" id="${IDS.cancel}">Cancel</button>
          <button type="button" class="primary" id="${IDS.finish}" disabled>Finish</button>
        </div>`;
      hero.insertAdjacentElement('afterend',bar);
      document.querySelector('#'+IDS.cancel).addEventListener('click',cancelSelectionMode);
      document.querySelector('#'+IDS.finish).addEventListener('click',finishSelectionMode);
    }

    if(!document.querySelector('#v1325Phase2ClosetLogStyles')){
      const style=document.createElement('style');
      style.id='v1325Phase2ClosetLogStyles';
      style.textContent=`
        .v1325-closet-hero-actions{display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
        .v1325-closet-log-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:12px 0 16px;padding:12px 14px;border:1px solid var(--line,#d8d2c5);border-radius:16px;background:var(--paper,#fffdf8);box-shadow:0 8px 24px rgba(54,50,42,.08)}
        .v1325-closet-log-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
        .v1325-closet-log-copy strong{font-size:.96rem}
        .v1325-closet-log-copy span{font-size:.82rem;opacity:.68}
        .v1325-closet-log-actions{display:flex;gap:8px;flex:0 0 auto}
        body.v1325-closet-log-mode #addItemBtn,body.v1325-closet-log-mode #closetLogOutfitBtn{display:none!important}
        body.v1325-closet-log-mode #catalogGrid .item-card{cursor:pointer;position:relative;transition:transform .14s ease,box-shadow .14s ease,outline-color .14s ease}
        body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected{outline:3px solid var(--accent,#66715a);outline-offset:-3px;box-shadow:0 8px 22px rgba(60,72,54,.18);transform:translateY(-1px)}
        body.v1325-closet-log-mode #catalogGrid .item-card.v1325-log-selected::after{content:'✓';position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:var(--accent,#66715a);color:white;font-weight:800;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:5}
        body.v1325-closet-log-mode #catalogGrid .item-card:active{transform:scale(.985)}
        @media(max-width:520px){
          .v1325-closet-hero-actions{width:100%;justify-content:stretch}
          .v1325-closet-hero-actions>button{flex:1 1 0}
          .v1325-closet-log-bar{align-items:stretch;flex-direction:column}
          .v1325-closet-log-actions{display:grid;grid-template-columns:1fr 1fr}
          .v1325-closet-log-actions>button{width:100%}
        }
      `;
      document.head.appendChild(style);
    }
  }

  function startSelectionMode(){
    if(active)return;
    active=true;
    selected=new Set();
    document.body.classList.add('v1325-closet-log-mode');
    document.querySelector('#'+IDS.toolbar)?.classList.remove('hidden');
    observeCatalog();
    refreshSelectionUI();
    document.querySelector('#catalogGrid')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function exitSelectionMode(){
    active=false;
    document.body.classList.remove('v1325-closet-log-mode');
    document.querySelector('#'+IDS.toolbar)?.classList.add('hidden');
    document.querySelectorAll('#catalogGrid .item-card.v1325-log-selected').forEach(card=>card.classList.remove('v1325-log-selected'));
    if(observer){observer.disconnect();observer=null;}
  }

  function cancelSelectionMode(){
    selected.clear();
    exitSelectionMode();
  }

  function finishSelectionMode(){
    const ids=[...selected].filter(id=>visibleClosetItem(id));
    if(!ids.length){toast('Select at least one closet piece');return;}

    exitSelectionMode();
    selected.clear();

    // Use the normal Journal add flow, then seed the same draft set the Journal
    // picker uses. Existing date-conflict and Save behavior remains authoritative.
    openWear();
    wearDraftIds=new Set(ids);
    wearCategoryFilter='All';
    renderWearPicker();
  }

  function toggleItem(id){
    if(!active||!visibleClosetItem(id))return;
    if(selected.has(id))selected.delete(id);else selected.add(id);
    refreshSelectionUI();
  }

  function refreshSelectionUI(){
    if(!active)return;
    document.querySelectorAll('#catalogGrid .item-card[data-id]').forEach(card=>{
      card.classList.toggle('v1325-log-selected',selected.has(card.dataset.id));
      card.setAttribute('aria-pressed',selected.has(card.dataset.id)?'true':'false');
    });
    const count=selected.size;
    const label=document.querySelector('#'+IDS.count);
    if(label)label.textContent=`${count} selected`;
    const finish=document.querySelector('#'+IDS.finish);
    if(finish)finish.disabled=count===0;
  }

  function observeCatalog(){
    if(observer)observer.disconnect();
    const grid=document.querySelector('#catalogGrid');
    if(!grid)return;
    observer=new MutationObserver(()=>requestAnimationFrame(refreshSelectionUI));
    observer.observe(grid,{childList:true,subtree:true});
  }

  // Selection-mode capture handlers run before the normal card edit/reorder
  // listeners. Outside selection mode they are inert.
  function interceptPress(e){
    if(!active)return;
    const card=e.target.closest?.('#catalogGrid .item-card[data-id]');
    if(!card)return;
    e.stopPropagation();
  }

  function interceptClick(e){
    if(!active)return;
    const card=e.target.closest?.('#catalogGrid .item-card[data-id]');
    if(!card)return;
    e.preventDefault();
    e.stopPropagation();
    toggleItem(card.dataset.id);
  }

  function installCaptureGuards(){
    const grid=document.querySelector('#catalogGrid');
    if(!grid||grid.dataset.v1325ClosetLogGuards==='1')return;
    ['pointerdown','mousedown','touchstart'].forEach(type=>grid.addEventListener(type,interceptPress,true));
    grid.addEventListener('click',interceptClick,true);
    grid.addEventListener('contextmenu',e=>{if(active&&e.target.closest?.('.item-card')){e.preventDefault();e.stopPropagation();}},true);
    grid.dataset.v1325ClosetLogGuards='1';
  }

  installControls();
  installCaptureGuards();
  window.addEventListener('pageshow',()=>{installControls();installCaptureGuards();if(active){observeCatalog();refreshSelectionUI();}});

  window.AudreyClosetLogOutfit={
    start:startSelectionMode,
    cancel:cancelSelectionMode,
    finish:finishSelectionMode,
    getSelected:()=>[...selected]
  };
})();
