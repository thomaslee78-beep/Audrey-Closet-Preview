/* Audrey Closet v13.25 Phase 3 — Journal layout hardening
 * Layout25 stability overlay for all three Journal surfaces.
 * Prevents accidental horizontal drift/overflow, recenters browse/detail surfaces,
 * suppresses browser focus artifacts on the favorite control, and stages the
 * initial Wear Log reveal so layered presentation passes settle before display.
 */
(function(){
  'use strict';

  const VERSION='1.2';
  const STYLE_ID='v1325JournalLayoutHardeningStyles';
  let syncing=false;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .v1325-journal-browse-host{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;overscroll-behavior-x:none!important;box-sizing:border-box!important}
      .v1325-journal-browse-host .journal-row{width:100%!important;max-width:100%!important;min-width:0!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important}
      .v1325-journal-browse-host .v1325-simple-log{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow:hidden!important}
      .v1325-journal-browse-host .v1325-simple-date,.v1325-journal-browse-host .v1325-simple-items,.v1325-journal-browse-host .v1325-simple-copy{min-width:0!important;box-sizing:border-box!important}

      #journalDetailDialog{overflow-x:hidden!important;overscroll-behavior-x:none!important;outline:none!important}
      #journalDetailDialog.v1325-detail-preparing{opacity:0!important;pointer-events:none!important}
      #journalDetailDialog.v1325-detail-settled{opacity:1;transition:opacity .09s ease-out}
      #journalDetailDialog .journal-detail-scroll{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;overscroll-behavior-x:none!important;box-sizing:border-box!important}
      #journalDetailDialog .journal-detail-scroll>*{max-width:100%;box-sizing:border-box}
      #journalDetailDialog .v1325-journal-sheet{max-width:calc(100% + 28px)!important;box-sizing:border-box!important}
      #journalDetailDialog .v1325-look-strip-wrap,#journalDetailDialog .v1325-day-classifiers,#journalDetailDialog .v1325-journal-primary-view{max-width:100%!important;box-sizing:border-box!important}

      /* Safari was drawing its blue focus geometry around the relocated heart.
         Keep keyboard focus visible with a subtle app-native ring instead. */
      #journalDetailDialog #journalDetailFavoriteBtn,
      #journalDetailDialog #journalDetailFavoriteBtn:focus,
      #journalDetailDialog #journalDetailFavoriteBtn:active{
        outline:none!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      #journalDetailDialog #journalDetailFavoriteBtn:focus-visible{
        outline:none!important;
        box-shadow:0 0 0 2px rgba(161,83,82,.16),0 3px 10px rgba(61,48,39,.08)!important;
      }

      #v1325JournalReaderDialog{overflow:hidden!important;overscroll-behavior-x:none!important}
      #v1325JournalReaderDialog .v1325-reader-scroll{width:100%!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-x:none!important;touch-action:pan-y!important;box-sizing:border-box!important}
      #v1325JournalReaderDialog .v1325-reader-page{width:100%!important;max-width:680px!important;min-width:0!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important;overflow-x:hidden!important}
      #v1325JournalReaderDialog .v1325-crafted-body,#v1325JournalReaderDialog .v1325-crafted-right,#v1325JournalReaderDialog .v1325-crafted-writing-top,#v1325JournalReaderDialog .v1325-crafted-writing-bottom{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}

      #v1325JournalReaderDialog .v1325-crafted-lookbar{width:auto!important;max-width:none!important;margin:16px -10px 4px!important;padding:8px 10px 5px!important;border:0!important;border-radius:0!important;background:linear-gradient(90deg,rgba(217,184,124,.10),rgba(255,255,255,.20),rgba(217,184,124,.10))!important;box-shadow:none!important;overflow:hidden!important;box-sizing:border-box!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{width:100%!important;max-width:100%!important;display:flex!important;justify-content:center!important;align-items:flex-end!important;gap:5px!important;overflow:hidden!important;overscroll-behavior-x:none!important;touch-action:pan-y!important;box-sizing:border-box!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{flex:1 1 0!important;width:auto!important;min-width:0!important;max-width:124px!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:100%!important;max-width:116px!important;height:124px!important;margin:0 auto!important;object-fit:contain!important}
      #v1325JournalReaderDialog .v1325-crafted-look-label{display:block!important;width:100%!important;margin:3px 0 0!important;padding:0!important;text-align:center!important;transform:none!important}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-reader-page{width:100%!important;max-width:100%!important}
        #v1325JournalReaderDialog .v1325-crafted-lookbar{margin-left:-8px!important;margin-right:-8px!important;padding-left:8px!important;padding-right:8px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{max-width:108px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{max-width:104px!important;height:114px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function markBrowseHosts(){document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>{const parent=row.parentElement;if(parent)parent.classList.add('v1325-journal-browse-host');});}

  function normalizeScrollLeft(){
    const detail=document.querySelector('#journalDetailDialog .journal-detail-scroll');if(detail&&detail.scrollLeft!==0)detail.scrollLeft=0;
    const reader=document.querySelector('#v1325JournalReaderDialog .v1325-reader-scroll');if(reader&&reader.scrollLeft!==0)reader.scrollLeft=0;
    document.querySelectorAll('.v1325-journal-browse-host').forEach(host=>{if(host.scrollLeft!==0)host.scrollLeft=0;});
  }

  function normalizeDetailFocus(dialog){
    if(!dialog)return;
    dialog.setAttribute('tabindex','-1');
    const favorite=dialog.querySelector('#journalDetailFavoriteBtn');
    if(document.activeElement===favorite)favorite.blur();
    try{dialog.focus({preventScroll:true});}catch{}
  }

  function sync(){if(syncing)return;syncing=true;try{installStyles();markBrowseHosts();normalizeScrollLeft();}finally{syncing=false;}}

  function settleDetail(dialog){
    try{window.AudreyWearLogDetailPolish?.refresh?.();}catch{}
    try{window.AudreyWearLogLayout2?.refresh?.();}catch{}
    try{window.AudreyWearLogInteractionFixes?.refresh?.();}catch{}
    try{window.AudreyJournalEditorLayout?.refresh?.();}catch{}
    try{window.AudreyJournalEditorRefinements?.refresh?.();}catch{}
    sync();
    normalizeDetailFocus(dialog);
  }

  function wrapRenderJournal(){
    if(typeof renderJournal!=='function'||renderJournal.__journalHardeningWrapped)return;
    const render0=renderJournal;renderJournal=function(){const out=render0.apply(this,arguments);requestAnimationFrame(sync);setTimeout(sync,30);return out;};renderJournal.__journalHardeningWrapped=true;
  }

  function wrapOpenDetail(){
    if(typeof openJournalDetail!=='function'||openJournalDetail.__journalHardeningWrapped)return;
    const open0=openJournalDetail;
    openJournalDetail=function(){
      const dialog=document.querySelector('#journalDetailDialog');
      if(dialog){dialog.classList.remove('v1325-detail-settled');dialog.classList.add('v1325-detail-preparing');}
      const out=open0.apply(this,arguments);
      requestAnimationFrame(()=>settleDetail(dialog));
      setTimeout(()=>settleDetail(dialog),70);
      setTimeout(()=>{
        settleDetail(dialog);
        if(dialog){dialog.classList.remove('v1325-detail-preparing');dialog.classList.add('v1325-detail-settled');}
      },175);
      return out;
    };
    openJournalDetail.__journalHardeningWrapped=true;
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__journalHardeningWrapped)return;
    const open0=api.openReader.bind(api);api.openReader=function(id){const out=open0(id);requestAnimationFrame(sync);setTimeout(sync,60);return out;};api.__journalHardeningWrapped=true;
  }

  document.addEventListener('scroll',event=>{const target=event.target;if(target?.matches?.('.journal-detail-scroll,.v1325-reader-scroll,.v1325-journal-browse-host')&&target.scrollLeft!==0)target.scrollLeft=0;},true);

  /* Do not resync on reader close. The interaction layer restores the preserved
     Wear Log DOM directly; extra delayed syncs here were visible as flicker. */
  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle,#v1325SaveJournalBtn,#v1325JournalViewBtn')){
      requestAnimationFrame(sync);setTimeout(sync,60);
    }
  },true);

  installStyles();wrapRenderJournal();wrapOpenDetail();wrapReader();requestAnimationFrame(sync);setTimeout(sync,150);
  window.AudreyJournalLayoutHardening={version:VERSION,refresh:sync};
})();
