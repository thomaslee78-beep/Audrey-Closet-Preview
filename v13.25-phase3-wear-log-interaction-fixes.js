/* Audrey Closet v13.25 Phase 3 — Wear Log interaction fixes
 * Layout19 targeted fixes layered after wear-log-layout2.
 * - single centered Chapter/Era/Color classifier row
 * - centered color palette popover
 * - edit-state locks for View Journal + bottom actions
 * - Save Journal exits editing after confirmed save
 * - Journal View X returns to Wear Log
 * - Journal browse rows are refreshed after detail closes
 * - duplicate Edit Journal controls are removed
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325WearLogInteractionFixStyles';
  let syncing=false;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Center the day classifiers and make Chapter read like a section label. */
      #journalDetailDialog .v1325-day-classifiers{
        justify-content:center!important;
        align-items:center!important;
        gap:7px!important;
        text-align:center!important;
      }
      #journalDetailDialog .v1325-day-classifier-label{
        font-family:var(--serif)!important;
        font-size:.84rem!important;
        line-height:1!important;
        font-weight:700!important;
        color:var(--coffee)!important;
        margin-right:1px!important;
      }
      #journalDetailDialog .v1325-day-classifiers .v1325-journal-era-row{order:2!important}
      #journalDetailDialog .v1325-day-classifiers .v1325-day-color-wrap{order:3!important}

      /* Palette behaves like a small centered chooser instead of an overflowing flyout. */
      #journalDetailDialog .v1325-color-popover{
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        top:50%!important;
        transform:translate(-50%,-50%)!important;
        width:min(310px,calc(100vw - 28px))!important;
        max-width:310px!important;
        z-index:10050!important;
        margin:0!important;
      }
      #journalDetailDialog .v1325-color-row{
        grid-template-columns:58px repeat(5,minmax(0,1fr))!important;
      }

      /* During journal editing, the modal footer becomes visibly locked. */
      #journalDetailDialog.v1325-journal-editing .journal-detail-actions{
        opacity:.42!important;
        filter:saturate(.55)!important;
      }
      #journalDetailDialog.v1325-journal-editing .journal-detail-actions button{
        pointer-events:none!important;
      }
      #journalDetailDialog.v1325-journal-editing .v1325-journal-feature-row{
        display:none!important;
      }

      @media(max-width:520px){
        #journalDetailDialog .v1325-day-classifiers{gap:5px!important}
        #journalDetailDialog .v1325-day-classifier-label{font-size:.79rem!important}
        #journalDetailDialog .v1325-color-popover{width:min(300px,calc(100vw - 20px))!important}
        #journalDetailDialog .v1325-color-row{grid-template-columns:52px repeat(5,minmax(0,1fr))!important;gap:5px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function dialog(){return document.querySelector('#journalDetailDialog');}
  function isEditing(d=dialog()){return !!d?.querySelector('.v1325-journal-sheet')?.classList.contains('editing');}

  function dedupeEraAndColor(d){
    const strip=d?.querySelector('.v1325-day-classifiers');if(!strip)return;

    const eraRows=[...d.querySelectorAll('.v1325-journal-era-row')];
    let keepEra=eraRows.find(row=>row.querySelector('#v1325JournalEra'))||eraRows[0]||null;
    const selected=keepEra?.querySelector('select')?.value||'';
    eraRows.forEach(row=>{if(row!==keepEra)row.remove();});
    if(keepEra){
      const select=keepEra.querySelector('select');if(select&&selected)select.value=selected;
      if(keepEra.parentNode!==strip)strip.appendChild(keepEra);
    }

    const colors=[...d.querySelectorAll('.v1325-day-color-wrap')];
    const keepColor=colors.shift()||null;
    colors.forEach(node=>node.remove());
    if(keepColor&&keepColor.parentNode!==strip)strip.appendChild(keepColor);

    const labels=[...strip.querySelectorAll('.v1325-day-classifier-label')];
    let label=labels.shift();labels.forEach(node=>node.remove());
    if(!label){label=document.createElement('span');label.className='v1325-day-classifier-label';label.textContent='Chapter';strip.prepend(label);}
    label.textContent='Chapter';

    /* Ensure deterministic order: label -> Era -> color. */
    strip.appendChild(label);
    if(keepEra)strip.appendChild(keepEra);
    if(keepColor)strip.appendChild(keepColor);
  }

  function dedupeEditControls(d){
    if(!d)return;
    const edits=[...d.querySelectorAll('.v1325-journal-edit-toggle')];
    let keep=d.querySelector('#v1325JournalEditToggle')||edits[0]||null;
    edits.forEach(btn=>{if(btn!==keep)btn.remove();});
    if(!keep)return;
    if(!keep.id)keep.id='v1325JournalEditToggle';
    const title=d.querySelector('.v1325-journal-context-title');if(title&&keep.parentNode!==title)title.appendChild(keep);
    keep.textContent=isEditing(d)?'Done':'Edit Journal';
  }

  function lockFooter(d,editing){
    if(!d)return;
    d.classList.toggle('v1325-journal-editing',editing);
    const view=d.querySelector('#v1325JournalViewBtn');
    if(view){view.disabled=editing;view.setAttribute('aria-disabled',editing?'true':'false');}
    ['#editJournalDetailBtn','#journalOpenBoardBtn','#cancelJournalDetailBtn','#deleteJournalDetailBtn'].forEach(sel=>{
      const btn=d.querySelector(sel);if(btn)btn.disabled=editing;
    });
  }

  function syncEditState(d=dialog()){
    if(!d)return;
    const editing=isEditing(d);
    dedupeEditControls(d);
    lockFooter(d,editing);
  }

  function refreshBrowseRows(){
    try{window.AudreyJournalTitleLog?.refresh?.();}catch{}
    requestAnimationFrame(()=>window.AudreyJournalRowPolish2?.refresh?.());
    setTimeout(()=>window.AudreyJournalRowPolish2?.refresh?.(),40);
    setTimeout(()=>window.AudreyJournalRowPolish2?.refresh?.(),120);
  }

  function waitForSaveThenExit(d){
    const start=Date.now();
    const poll=()=>{
      if(!d?.open||!isEditing(d))return;
      const feedback=d.querySelector('#v1325JournalSaveFeedback');
      const save=d.querySelector('#v1325SaveJournalBtn');
      const saved=/saved/i.test(feedback?.textContent||'')||/saved/i.test(save?.textContent||'');
      const failed=/could not save|try again/i.test(feedback?.textContent||'');
      if(saved){
        const edit=d.querySelector('#v1325JournalEditToggle');
        if(edit){edit.click();setTimeout(()=>syncEditState(d),0);}else{
          const sheet=d.querySelector('.v1325-journal-sheet');sheet?.classList.remove('editing');
          const editor=d.querySelector('#v1325JournalEditor');editor?.setAttribute('contenteditable','false');
          syncEditState(d);
        }
        return;
      }
      if(failed||Date.now()-start>2200)return;
      setTimeout(poll,60);
    };
    setTimeout(poll,40);
  }

  function returnReaderToWearLog(event){
    const close=event.target.closest?.('#v1325JournalReaderDialog .v1325-reader-close');if(!close)return;
    const reader=document.querySelector('#v1325JournalReaderDialog');
    const id=String(reader?.dataset?.journalId||viewingJournalId||'');
    event.preventDefault();event.stopImmediatePropagation();
    try{if(reader?.open)reader.close();}catch{}
    if(id&&state.journal.some(j=>String(j.id)===id)){
      viewingJournalId=id;
      setTimeout(()=>{
        if(typeof openJournalDetail==='function')openJournalDetail(id);
        setTimeout(syncAll,80);
      },0);
    }
  }

  function bindDialogCloseRefresh(d){
    if(!d||d.dataset.v1325BrowseRefreshBound==='1')return;
    d.dataset.v1325BrowseRefreshBound='1';
    d.addEventListener('close',refreshBrowseRows);
  }

  function syncAll(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const d=dialog();if(!d)return;
      dedupeEraAndColor(d);
      dedupeEditControls(d);
      syncEditState(d);
      bindDialogCloseRefresh(d);
    }finally{syncing=false;}
  }

  document.addEventListener('click',event=>{
    const d=dialog();
    if(event.target.closest?.('#v1325JournalEditToggle')){
      setTimeout(()=>{syncAll();},0);
      setTimeout(()=>{syncAll();},80);
      return;
    }
    if(event.target.closest?.('#v1325SaveJournalBtn')){
      if(d)waitForSaveThenExit(d);
      return;
    }
  },true);

  document.addEventListener('click',returnReaderToWearLog,true);

  /* Re-assert layout after each Wear Log open without a broad MutationObserver. */
  if(typeof openJournalDetail==='function'&&!openJournalDetail.__wearInteractionFixWrapped){
    const open0=openJournalDetail;
    openJournalDetail=function(){
      const out=open0.apply(this,arguments);
      requestAnimationFrame(syncAll);setTimeout(syncAll,70);setTimeout(syncAll,180);setTimeout(syncAll,340);
      return out;
    };
    openJournalDetail.__wearInteractionFixWrapped=true;
  }

  installStyles();requestAnimationFrame(syncAll);setTimeout(syncAll,120);
  window.AudreyWearLogInteractionFixes={version:VERSION,refresh:syncAll};
})();
