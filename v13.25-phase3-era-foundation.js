/* Audrey Closet v13.25 Phase 3 — Era foundation
 * Reusable era objects + Journal era assignment.
 * v2 adds safe Era management: rename in place, archive referenced eras,
 * permanently delete unused eras, and restore archived eras without breaking IDs.
 */
(function(){
  'use strict';

  const VERSION=2;
  const SELECT_ID='v1325JournalEra';
  const NEW_BUTTON_ID='v1325JournalNewEraBtn';
  const MANAGE_BUTTON_ID='v1325JournalManageEraBtn';
  const MANAGER_ID='v1325EraManagerDialog';
  const CHIP_CLASS='v1325-journal-era-chip';
  const PERSONAL='personal';
  const FASHION='fashion';

  function ensureEraStore(){if(!Array.isArray(state.eras))state.eras=[];return state.eras;}
  function newId(){return `era_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function currentEntry(){return state.journal.find(row=>String(row.id)===String(viewingJournalId||''))||null;}
  function eraIdsFor(record){return Array.isArray(record?.eraIds)?record.eraIds.filter(Boolean):[];}
  function erasForRecord(record){const ids=new Set(eraIdsFor(record));return ensureEraStore().filter(era=>ids.has(era.id));}
  function personalEraFor(record){return erasForRecord(record).find(era=>(era.kind||PERSONAL)===PERSONAL)||null;}
  function usageCount(eraId){return (state.journal||[]).reduce((n,row)=>n+(eraIdsFor(row).includes(eraId)?1:0),0);}
  function personalEras({includeArchived=false}={}){
    return ensureEraStore().filter(era=>(era.kind||PERSONAL)===PERSONAL&&(includeArchived||era.status!=='archived')).sort((a,b)=>{
      if((a.status==='active')!==(b.status==='active'))return a.status==='active'?-1:1;
      if((a.status==='archived')!==(b.status==='archived'))return a.status==='archived'?1:-1;
      return String(a.name||'').localeCompare(String(b.name||''));
    });
  }
  function createEra(name,{kind=PERSONAL,status='active'}={}){
    name=String(name||'').trim();if(!name)return null;
    const duplicate=ensureEraStore().find(era=>(era.kind||PERSONAL)===kind&&String(era.name||'').trim().toLowerCase()===name.toLowerCase());
    if(duplicate){if(duplicate.status==='archived')duplicate.status='active';return duplicate;}
    const now=Date.now(),era={id:newId(),name,kind,status,created:now,updated:now};state.eras.push(era);return era;
  }
  function assignEra(record,eraId,{kind=PERSONAL}={}){
    if(!record)return;
    const keep=eraIdsFor(record).filter(id=>{const era=ensureEraStore().find(x=>x.id===id);return era&&((era.kind||PERSONAL)!==kind);});
    if(eraId)keep.push(eraId);record.eraIds=[...new Set(keep)];record.updated=Date.now();
  }

  function installStyles(){
    document.querySelector('#v1325Phase3EraStyles')?.remove();
    const style=document.createElement('style');style.id='v1325Phase3EraStyles';style.textContent=`
      .v1325-journal-era-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px;align-items:stretch}
      .v1325-journal-era-row select{width:100%;min-width:0}
      .v1325-journal-era-new,.v1325-journal-era-manage{border:1px solid rgba(108,81,66,.18);border-radius:12px;background:#fffdf8;color:var(--coffee);padding:8px 10px;font:inherit;font-size:.76rem;font-weight:650;white-space:nowrap}
      .v1325-journal-era-manage{padding-left:9px;padding-right:9px}
      .v1325-journal-context-chip.${CHIP_CLASS}{background:rgba(244,235,205,.78);border-color:rgba(132,105,56,.20)}

      #${MANAGER_ID}{width:min(520px,calc(100vw - 24px));max-height:min(78dvh,680px);padding:0;border:0;border-radius:20px;background:#fbf5e9;color:var(--coffee);box-shadow:0 24px 70px rgba(40,31,24,.30)}
      #${MANAGER_ID}::backdrop{background:rgba(40,34,29,.42);backdrop-filter:blur(2px)}
      #${MANAGER_ID} .v1325-era-manager{display:flex;flex-direction:column;max-height:min(78dvh,680px)}
      #${MANAGER_ID} .v1325-era-manager-head{display:flex;align-items:center;gap:10px;padding:16px 16px 10px;border-bottom:1px solid rgba(108,81,66,.12)}
      #${MANAGER_ID} .v1325-era-manager-head strong{flex:1;font-family:var(--serif);font-size:1.1rem}
      #${MANAGER_ID} .v1325-era-manager-close{width:34px;height:34px;padding:0;border:1px solid rgba(108,81,66,.16);border-radius:50%;background:#eadfc9;color:#6f5d48;font-size:20px}
      #${MANAGER_ID} .v1325-era-manager-help{margin:0;padding:10px 16px 8px;color:var(--muted);font-size:.7rem;line-height:1.35}
      #${MANAGER_ID} .v1325-era-manager-list{overflow:auto;padding:4px 12px 14px;-webkit-overflow-scrolling:touch}
      #${MANAGER_ID} .v1325-era-manager-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px 4px;border-bottom:1px solid rgba(108,81,66,.10)}
      #${MANAGER_ID} .v1325-era-manager-name{min-width:0}
      #${MANAGER_ID} .v1325-era-manager-name strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.84rem}
      #${MANAGER_ID} .v1325-era-manager-name small{display:block;margin-top:2px;color:var(--muted);font-size:.63rem}
      #${MANAGER_ID} .v1325-era-manager-row.archived{opacity:.68}
      #${MANAGER_ID} .v1325-era-manager-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
      #${MANAGER_ID} .v1325-era-manager-actions button{min-height:31px;padding:5px 8px;border:1px solid rgba(108,81,66,.16);border-radius:9px;background:#fffdf8;color:var(--coffee);font:inherit;font-size:.66rem;font-weight:650}
      #${MANAGER_ID} .v1325-era-manager-actions .danger{color:#963e51}
      #${MANAGER_ID} .v1325-era-empty{padding:24px 8px;text-align:center;color:var(--muted);font-size:.78rem}
      @media(max-width:390px){.v1325-journal-era-row{grid-template-columns:minmax(0,1fr) auto auto}.v1325-journal-era-new,.v1325-journal-era-manage{min-height:38px;padding-left:8px;padding-right:8px}#${MANAGER_ID} .v1325-era-manager-row{grid-template-columns:1fr}#${MANAGER_ID} .v1325-era-manager-actions{justify-content:flex-start}}
    `;document.head.appendChild(style);
  }

  function optionMarkup(entry){
    const selectedEra=personalEraFor(entry),selected=selectedEra?.id||'';
    const rows=['<option value="">🕰️ Era / chapter</option>'];
    const eras=personalEras();
    if(selectedEra?.status==='archived'&&!eras.some(x=>x.id===selectedEra.id))rows.push(`<option value="${esc(selectedEra.id)}" selected>${esc(selectedEra.name)} (archived)</option>`);
    eras.forEach(era=>rows.push(`<option value="${esc(era.id)}"${era.id===selected?' selected':''}>${era.status==='completed'?'✓ ':''}${esc(era.name)}</option>`));
    return rows.join('');
  }

  function refreshEraChip(entry){
    const chips=document.querySelector('#v1325JournalContextChips');if(!chips||!entry)return;
    chips.querySelectorAll('.'+CHIP_CLASS).forEach(node=>node.remove());const era=personalEraFor(entry);if(!era)return;
    const chip=document.createElement('span');chip.className=`v1325-journal-context-chip ${CHIP_CLASS}`;chip.textContent=`🕰️ ${era.name}`;chips.prepend(chip);
  }

  function ensureManager(){
    let dialog=document.getElementById(MANAGER_ID);if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.id=MANAGER_ID;dialog.innerHTML='<div class="v1325-era-manager"><div class="v1325-era-manager-head"><strong>Manage Chapters</strong><button type="button" class="v1325-era-manager-close" aria-label="Close">×</button></div><p class="v1325-era-manager-help">Rename keeps every Journal reference intact. An era already used by a Journal day is archived instead of deleted, so old entries never lose their chapter.</p><div class="v1325-era-manager-list"></div></div>';
    document.body.appendChild(dialog);dialog.querySelector('.v1325-era-manager-close').onclick=()=>dialog.close();dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});return dialog;
  }

  function renderManager(){
    const dialog=ensureManager(),list=dialog.querySelector('.v1325-era-manager-list'),eras=personalEras({includeArchived:true});
    if(!eras.length){list.innerHTML='<div class="v1325-era-empty">No chapters have been created yet.</div>';return;}
    list.innerHTML=eras.map(era=>{const uses=usageCount(era.id),archived=era.status==='archived';return `<div class="v1325-era-manager-row${archived?' archived':''}" data-era-id="${esc(era.id)}"><div class="v1325-era-manager-name"><strong>${esc(era.name)}</strong><small>${uses} Journal ${uses===1?'day':'days'}${archived?' · archived':''}</small></div><div class="v1325-era-manager-actions"><button type="button" data-era-action="rename">Rename</button>${archived?'<button type="button" data-era-action="restore">Restore</button>':uses?'<button type="button" data-era-action="archive">Archive</button>':'<button type="button" class="danger" data-era-action="delete">Delete</button>'}</div></div>`;}).join('');
  }

  async function saveAndRefresh(message){
    try{await saveState();}catch(err){console.error('[v13.25 era] era management save failed',err);if(typeof toast==='function')toast('Could not save chapter changes');return false;}
    renderManager();injectEraControls();refreshEraChip(currentEntry());if(typeof renderJournal==='function')renderJournal();if(typeof toast==='function'&&message)toast(message);return true;
  }

  async function managerAction(button){
    const row=button.closest('[data-era-id]'),id=row?.dataset.eraId,era=ensureEraStore().find(x=>x.id===id);if(!era)return;
    const action=button.dataset.eraAction;
    if(action==='rename'){
      const name=String(window.prompt('Rename this chapter',era.name)||'').trim();if(!name||name===era.name)return;
      const duplicate=ensureEraStore().find(x=>x.id!==era.id&&(x.kind||PERSONAL)===(era.kind||PERSONAL)&&String(x.name||'').trim().toLowerCase()===name.toLowerCase());
      if(duplicate){window.alert('A chapter with that name already exists. Choose a different name, or archive/delete the duplicate first.');return;}
      era.name=name;era.updated=Date.now();await saveAndRefresh(`Chapter renamed to ${name}`);return;
    }
    if(action==='archive'){era.status='archived';era.updated=Date.now();await saveAndRefresh(`Archived ${era.name}`);return;}
    if(action==='restore'){era.status='active';era.updated=Date.now();await saveAndRefresh(`Restored ${era.name}`);return;}
    if(action==='delete'){
      if(usageCount(era.id)>0){window.alert('This chapter is used by Journal entries, so it cannot be permanently deleted. Archive it instead.');return;}
      if(!window.confirm(`Delete “${era.name}” from the chapter list?`))return;
      state.eras=ensureEraStore().filter(x=>x.id!==era.id);await saveAndRefresh(`Deleted ${era.name}`);
    }
  }

  function openManager(){renderManager();const dialog=ensureManager();if(!dialog.open)dialog.showModal();}

  function injectEraControls(){
    installStyles();ensureEraStore();const entry=currentEntry(),grid=document.querySelector('#v1325JournalComposer .v1325-journal-context-grid');if(!entry||!grid)return;
    grid.querySelector('.v1325-journal-era-row')?.remove();
    const row=document.createElement('div');row.className='v1325-journal-era-row';row.innerHTML=`<select id="${SELECT_ID}" aria-label="Personal era">${optionMarkup(entry)}</select><button type="button" class="v1325-journal-era-new" id="${NEW_BUTTON_ID}" aria-label="New chapter">＋</button><button type="button" class="v1325-journal-era-manage" id="${MANAGE_BUTTON_ID}" aria-label="Manage chapters" title="Manage chapters">⚙</button>`;
    grid.prepend(row);const select=row.querySelector('#'+SELECT_ID);
    select.addEventListener('change',()=>{assignEra(entry,select.value,{kind:PERSONAL});refreshEraChip(entry);const feedback=document.querySelector('#v1325JournalSaveFeedback');if(feedback){feedback.textContent='Era changed — save journal to keep it.';feedback.classList.add('show');}});
    row.querySelector('#'+NEW_BUTTON_ID)?.addEventListener('click',async()=>{
      const name=window.prompt('Name this era or chapter\nExamples: Middle School, Soccer Years, Summer in Taiwan');if(!String(name||'').trim())return;
      const era=createEra(name,{kind:PERSONAL,status:'active'});if(!era)return;assignEra(entry,era.id,{kind:PERSONAL});
      try{await saveState();}catch(err){console.error('[v13.25 era] could not save new era',err);}injectEraControls();refreshEraChip(entry);if(typeof toast==='function')toast(`Era ready: ${era.name}`);
    });
    row.querySelector('#'+MANAGE_BUTTON_ID)?.addEventListener('click',openManager);refreshEraChip(entry);
  }

  document.addEventListener('click',event=>{
    const action=event.target.closest?.(`#${MANAGER_ID} [data-era-action]`);if(action){event.preventDefault();managerAction(action);return;}
    const button=event.target.closest?.('#v1325SaveJournalBtn');if(!button)return;const entry=currentEntry(),select=document.querySelector('#'+SELECT_ID);if(!entry||!select)return;assignEra(entry,select.value,{kind:PERSONAL});
  },true);

  const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(injectEraControls);return out;};

  window.AudreyEraFoundation={version:VERSION,kinds:{personal:PERSONAL,fashion:FASHION},ensure:ensureEraStore,list:()=>ensureEraStore().map(x=>({...x})),create:createEra,assign:(record,eraId,kind=PERSONAL)=>assignEra(record,eraId,{kind}),erasFor:record=>erasForRecord(record).map(x=>({...x})),refresh:injectEraControls,manage:openManager};
  ensureEraStore();installStyles();
})();
