/* Audrey Closet v13.25 Phase 3 — Era immediate refresh fix
 * Layout42: Era creation and management actions immediately synchronize the
 * currently visible Wear Log chooser without requiring dialog close/reopen.
 * Archived eras disappear from normal choices; if the current Journal entry
 * already references one, it remains visible as a disabled “(archived)” value.
 */
(function(){
  'use strict';

  const VERSION='1.1';
  const NEW_BUTTON_ID='v1325JournalNewEraBtn';
  const SELECT_ID='v1325JournalEra';
  const MANAGER_ID='v1325EraManagerDialog';
  const PERSONAL='personal';
  let creating=false;

  function currentEntry(){
    return state.journal.find(row=>String(row.id)===String(viewingJournalId||''))||null;
  }

  function eras(){
    return Array.isArray(state.eras)?state.eras:[];
  }

  function personalEraId(entry){
    const ids=Array.isArray(entry?.eraIds)?entry.eraIds:[];
    return ids.find(id=>{
      const era=eras().find(row=>String(row.id)===String(id));
      return era&&(era.kind||PERSONAL)===PERSONAL;
    })||'';
  }

  function eraLabel(era,{archived=false}={}){
    const prefix=era?.status==='completed'?'✓ ':'';
    return `${prefix}${String(era?.name||'').trim()}${archived?' (archived)':''}`;
  }

  function activePersonalEras(){
    return eras().filter(era=>(era.kind||PERSONAL)===PERSONAL&&era.status!=='archived').sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  }

  function rebuildSelect(select,entry){
    if(!select)return;
    const selectedId=personalEraId(entry);
    const selectedEra=selectedId?eras().find(row=>String(row.id)===String(selectedId)):null;
    const fragment=document.createDocumentFragment();

    const placeholder=document.createElement('option');
    placeholder.value='';
    placeholder.textContent='🕰️ Era / chapter';
    fragment.appendChild(placeholder);

    if(selectedEra?.status==='archived'){
      const archived=document.createElement('option');
      archived.value=selectedEra.id;
      archived.textContent=eraLabel(selectedEra,{archived:true});
      archived.disabled=true;
      archived.selected=true;
      fragment.appendChild(archived);
    }

    activePersonalEras().forEach(era=>{
      const option=document.createElement('option');
      option.value=era.id;
      option.textContent=eraLabel(era);
      option.selected=String(era.id)===String(selectedId);
      fragment.appendChild(option);
    });

    select.replaceChildren(fragment);
    select.value=selectedId;
  }

  function syncVisibleChoosers({refreshLayout=true}={}){
    const entry=currentEntry();
    const dialog=document.querySelector('#journalDetailDialog');
    const root=dialog||document;
    root.querySelectorAll(`#${SELECT_ID}`).forEach(select=>rebuildSelect(select,entry));
    if(refreshLayout)window.AudreyWearLogLayout2?.refresh?.();
  }

  function syncAfterManagementAction(){
    /* Era manager actions mutate state synchronously before saveState resolves.
       Multiple narrow passes also cover the existing injectEraControls/renderJournal
       calls which can recreate or relocate the selector during that save. */
    syncVisibleChoosers({refreshLayout:false});
    requestAnimationFrame(()=>syncVisibleChoosers());
    setTimeout(()=>syncVisibleChoosers(),40);
    setTimeout(()=>syncVisibleChoosers(),120);
  }

  async function createAndSelect(){
    if(creating)return;
    const entry=currentEntry();
    if(!entry||!window.AudreyEraFoundation)return;

    const name=window.prompt('Name this era or chapter\nExamples: Middle School, Soccer Years, Summer in Taiwan');
    if(!String(name||'').trim())return;

    creating=true;
    try{
      const era=window.AudreyEraFoundation.create(name,{kind:PERSONAL,status:'active'});
      if(!era)return;

      window.AudreyEraFoundation.assign(entry,era.id,PERSONAL);
      syncVisibleChoosers();

      const visible=[...document.querySelectorAll(`#journalDetailDialog #${SELECT_ID}`)].find(select=>select.offsetParent!==null)||document.querySelector(`#journalDetailDialog #${SELECT_ID}`);
      if(visible){
        visible.value=era.id;
        visible.dispatchEvent(new Event('change',{bubbles:true}));
      }

      try{await saveState();}
      catch(err){console.error('[v13.25 era refresh] could not save new era',err);}

      syncVisibleChoosers();
      if(typeof toast==='function')toast(`Era ready: ${era.name}`);
    }finally{
      creating=false;
    }
  }

  document.addEventListener('click',event=>{
    const newButton=event.target.closest?.(`#${NEW_BUTTON_ID}`);
    if(newButton){
      event.preventDefault();
      event.stopImmediatePropagation();
      createAndSelect();
      return;
    }

    const managerAction=event.target.closest?.(`#${MANAGER_ID} [data-era-action]`);
    if(managerAction){
      /* Let the foundation own rename/archive/restore/delete and persistence,
         then immediately synchronize the chooser from the resulting state. */
      setTimeout(syncAfterManagementAction,0);
    }
  },true);

  window.AudreyEraImmediateRefresh={version:VERSION,refresh:syncVisibleChoosers};
})();
