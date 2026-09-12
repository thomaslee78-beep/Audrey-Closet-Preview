/* Audrey Closet v13.25 Phase 3 — Era foundation
 * Reusable era objects + Journal era assignment. Personal eras are exposed in
 * the Phase 3 UI first; the schema already leaves room for fashion eras and for
 * Closet / Portfolio references later.
 */
(function(){
  'use strict';

  const VERSION=1;
  const SELECT_ID='v1325JournalEra';
  const NEW_BUTTON_ID='v1325JournalNewEraBtn';
  const CHIP_CLASS='v1325-journal-era-chip';
  const PERSONAL='personal';
  const FASHION='fashion';

  function ensureEraStore(){
    if(!Array.isArray(state.eras))state.eras=[];
    return state.eras;
  }
  function newId(){return `era_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function currentEntry(){return state.journal.find(row=>String(row.id)===String(viewingJournalId||''))||null;}
  function eraIdsFor(record){return Array.isArray(record?.eraIds)?record.eraIds.filter(Boolean):[];}
  function erasForRecord(record){
    const ids=new Set(eraIdsFor(record));
    return ensureEraStore().filter(era=>ids.has(era.id));
  }
  function personalEraFor(record){return erasForRecord(record).find(era=>(era.kind||PERSONAL)===PERSONAL)||null;}
  function activePersonalEras(){
    return ensureEraStore().filter(era=>(era.kind||PERSONAL)===PERSONAL&&era.status!=='archived').sort((a,b)=>{
      if((a.status==='active')!==(b.status==='active'))return a.status==='active'?-1:1;
      return String(a.name||'').localeCompare(String(b.name||''));
    });
  }
  function createEra(name,{kind=PERSONAL,status='active'}={}){
    name=String(name||'').trim();if(!name)return null;
    const duplicate=ensureEraStore().find(era=>(era.kind||PERSONAL)===kind&&String(era.name||'').trim().toLowerCase()===name.toLowerCase());
    if(duplicate)return duplicate;
    const now=Date.now();
    const era={id:newId(),name,kind,status,created:now,updated:now};
    state.eras.push(era);return era;
  }
  function assignEra(record,eraId,{kind=PERSONAL}={}){
    if(!record)return;
    const keep=eraIdsFor(record).filter(id=>{
      const era=ensureEraStore().find(x=>x.id===id);
      return era&&((era.kind||PERSONAL)!==kind);
    });
    if(eraId)keep.push(eraId);
    record.eraIds=[...new Set(keep)];
    record.updated=Date.now();
  }

  function installStyles(){
    if(document.querySelector('#v1325Phase3EraStyles'))return;
    const style=document.createElement('style');style.id='v1325Phase3EraStyles';style.textContent=`
      .v1325-journal-era-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:stretch}
      .v1325-journal-era-row select{width:100%;min-width:0}
      .v1325-journal-era-new{border:1px solid rgba(108,81,66,.18);border-radius:12px;background:#fffdf8;color:var(--coffee);padding:8px 10px;font:inherit;font-size:.76rem;font-weight:650;white-space:nowrap}
      .v1325-journal-context-chip.${CHIP_CLASS}{background:rgba(244,235,205,.78);border-color:rgba(132,105,56,.20)}
      @media(max-width:390px){.v1325-journal-era-row{grid-template-columns:1fr}.v1325-journal-era-new{min-height:38px}}
    `;document.head.appendChild(style);
  }
  function optionMarkup(entry){
    const selected=personalEraFor(entry)?.id||'';
    const rows=['<option value="">🕰️ Era / chapter</option>'];
    activePersonalEras().forEach(era=>rows.push(`<option value="${esc(era.id)}"${era.id===selected?' selected':''}>${era.status==='completed'?'✓ ':''}${esc(era.name)}</option>`));
    return rows.join('');
  }
  function refreshEraChip(entry){
    const chips=document.querySelector('#v1325JournalContextChips');if(!chips||!entry)return;
    chips.querySelectorAll('.'+CHIP_CLASS).forEach(node=>node.remove());
    const era=personalEraFor(entry);if(!era)return;
    const chip=document.createElement('span');chip.className=`v1325-journal-context-chip ${CHIP_CLASS}`;chip.textContent=`🕰️ ${era.name}`;chips.prepend(chip);
  }
  function injectEraControls(){
    installStyles();ensureEraStore();
    const entry=currentEntry(),grid=document.querySelector('#v1325JournalComposer .v1325-journal-context-grid');
    if(!entry||!grid)return;
    grid.querySelector('.v1325-journal-era-row')?.remove();
    const row=document.createElement('div');row.className='v1325-journal-era-row';row.innerHTML=`<select id="${SELECT_ID}" aria-label="Personal era">${optionMarkup(entry)}</select><button type="button" class="v1325-journal-era-new" id="${NEW_BUTTON_ID}">＋ New era</button>`;
    grid.prepend(row);
    const select=row.querySelector('#'+SELECT_ID);
    select.addEventListener('change',()=>{assignEra(entry,select.value,{kind:PERSONAL});refreshEraChip(entry);const feedback=document.querySelector('#v1325JournalSaveFeedback');if(feedback){feedback.textContent='Era changed — save journal to keep it.';feedback.classList.add('show');}});
    row.querySelector('#'+NEW_BUTTON_ID)?.addEventListener('click',async()=>{
      const name=window.prompt('Name this era or chapter\nExamples: Middle School, Soccer Years, Summer in Taiwan');
      if(!String(name||'').trim())return;
      const era=createEra(name,{kind:PERSONAL,status:'active'});if(!era)return;
      assignEra(entry,era.id,{kind:PERSONAL});
      try{await saveState();}catch(err){console.error('[v13.25 era] could not save new era',err);}
      injectEraControls();refreshEraChip(entry);
      if(typeof toast==='function')toast(`Era created: ${era.name}`);
    });
    refreshEraChip(entry);
  }

  /* Save Journal already persists the whole app state. Capture its click first so
   * the selected era reference is on the record before Phase 3 runs saveState(). */
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#v1325SaveJournalBtn');if(!button)return;
    const entry=currentEntry(),select=document.querySelector('#'+SELECT_ID);if(!entry||!select)return;
    assignEra(entry,select.value,{kind:PERSONAL});
  },true);

  const open0=openJournalDetail;
  openJournalDetail=function(){
    const out=open0.apply(this,arguments);
    requestAnimationFrame(injectEraControls);
    return out;
  };

  window.AudreyEraFoundation={
    version:VERSION,
    kinds:{personal:PERSONAL,fashion:FASHION},
    ensure:ensureEraStore,
    list:()=>ensureEraStore().map(x=>({...x})),
    create:createEra,
    assign:(record,eraId,kind=PERSONAL)=>assignEra(record,eraId,{kind}),
    erasFor:record=>erasForRecord(record).map(x=>({...x})),
    refresh:injectEraControls
  };

  ensureEraStore();installStyles();
})();
