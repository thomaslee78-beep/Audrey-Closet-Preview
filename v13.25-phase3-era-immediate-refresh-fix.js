/* Audrey Closet v13.25 Phase 3 — Era immediate refresh fix
 * Layout41: newly-created/restored Eras become selectable immediately in the
 * currently visible Wear Log chooser without closing/reopening the dialog.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const NEW_BUTTON_ID='v1325JournalNewEraBtn';
  const SELECT_ID='v1325JournalEra';
  let creating=false;

  function currentEntry(){
    return state.journal.find(row=>String(row.id)===String(viewingJournalId||''))||null;
  }

  function eraLabel(era){
    return `${era?.status==='completed'?'✓ ':''}${String(era?.name||'').trim()}`;
  }

  function ensureOption(select,era){
    if(!select||!era)return;
    let option=[...select.options].find(row=>String(row.value)===String(era.id));
    if(!option){
      option=document.createElement('option');
      option.value=era.id;
      select.appendChild(option);
    }
    option.textContent=eraLabel(era);
    option.disabled=false;
    option.hidden=false;
    select.value=era.id;
  }

  function refreshVisibleChoosers(entry,era){
    const dialog=document.querySelector('#journalDetailDialog');
    const selects=[...(dialog||document).querySelectorAll(`#${SELECT_ID}`)];
    selects.forEach(select=>ensureOption(select,era));

    /* Keep the current visible classifier row where Wear Log layout placed it.
       Its existing change handler owns assignment/chip/feedback behavior. */
    const visible=selects.find(select=>select.offsetParent!==null)||selects[0]||null;
    if(visible){
      visible.value=era.id;
      visible.dispatchEvent(new Event('change',{bubbles:true}));
    }else if(entry){
      window.AudreyEraFoundation?.assign?.(entry,era.id,'personal');
    }

    requestAnimationFrame(()=>{
      const current=[...(dialog||document).querySelectorAll(`#${SELECT_ID}`)];
      current.forEach(select=>ensureOption(select,era));
      window.AudreyWearLogLayout2?.refresh?.();
    });
  }

  async function createAndSelect(){
    if(creating)return;
    const entry=currentEntry();
    if(!entry||!window.AudreyEraFoundation)return;

    const name=window.prompt('Name this era or chapter\nExamples: Middle School, Soccer Years, Summer in Taiwan');
    if(!String(name||'').trim())return;

    creating=true;
    try{
      const era=window.AudreyEraFoundation.create(name,{kind:'personal',status:'active'});
      if(!era)return;

      window.AudreyEraFoundation.assign(entry,era.id,'personal');
      refreshVisibleChoosers(entry,era);

      try{await saveState();}
      catch(err){console.error('[v13.25 era refresh] could not save new era',err);}

      /* A final in-place pass covers any row relocation that occurred while the
         save was resolving; no dialog close/reopen is required. */
      refreshVisibleChoosers(entry,era);
      if(typeof toast==='function')toast(`Era ready: ${era.name}`);
    }finally{
      creating=false;
    }
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.(`#${NEW_BUTTON_ID}`);
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    createAndSelect();
  },true);

  window.AudreyEraImmediateRefresh={version:VERSION,refresh:refreshVisibleChoosers};
})();
