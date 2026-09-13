/* Audrey Closet v13.25 Phase 3 dev3 — Journal reader polish fixes
 * Keeps date-aware look labels tied to the entry being rendered and restores
 * reader item-card metadata every time Journal View is reopened, including
 * after returning from a clothing-item preview.
 */
(function(){
  'use strict';

  const VERSION='1.0';

  function entryById(id){
    return state.journal.find(j=>String(j.id)===String(id||''))||null;
  }

  function fallbackLookLabel(entry){
    const date=String(entry?.date||'');
    const today=typeof localTodayISO==='function'
      ? localTodayISO()
      : (()=>{const d=new Date(),pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;})();
    if(!date||date===today)return "Today's Look";
    if(date>today)return 'Planned Look';
    return 'What I Wore';
  }

  function labelFor(entry){
    return window.AudreyJournalDev3FunctionalFixes?.lookLabel?.(entry)||fallbackLookLabel(entry);
  }

  function syncReader(id){
    const entry=entryById(id);if(!entry)return;
    const reader=document.querySelector('#v1325JournalReaderDialog');if(!reader)return;

    /* Always refresh the functional reader metadata. This is what makes every
       clothing thumbnail clickable again after returning from item preview. */
    window.AudreyJournalDev3FunctionalFixes?.showReader?.(entry);
    reader.dataset.journalId=String(entry.id||'');

    /* The crafted label must come from this entry, never from previously cached
       reader state or whichever Journal detail happened to be open earlier. */
    const label=reader.querySelector('.v1325-crafted-look-label');
    if(label)label.textContent=labelFor(entry);

    const lookSection=[...reader.querySelectorAll('.v1325-reader-section')]
      .find(section=>section.querySelector('.v1325-reader-look'));
    const legacyTitle=lookSection?.querySelector('.v1325-reader-section-title');
    if(legacyTitle)legacyTitle.textContent=labelFor(entry);
  }

  function scheduleSync(id){
    requestAnimationFrame(()=>syncReader(id));
    setTimeout(()=>syncReader(id),0);
    setTimeout(()=>syncReader(id),40);
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;
    if(!api?.openReader||api.__readerPolishWrapped)return;
    const open0=api.openReader.bind(api);
    api.openReader=function(id){
      const out=open0(id);
      scheduleSync(String(id||''));
      return out;
    };
    api.__readerPolishWrapped=true;
  }

  wrapReader();

  /* Defensive refresh for direct UI opens in case another overlay replaces the
     reader function later in the load sequence. */
  document.addEventListener('click',event=>{
    if(!event.target.closest?.('#v1325JournalViewBtn'))return;
    const id=String(viewingJournalId||'');
    if(id)scheduleSync(id);
  },true);

  window.AudreyJournalReaderPolishFix={version:VERSION,refresh:syncReader};
})();
