/* Audrey Closet v13.25 Phase 3 — Journal layout hardening
 * Layout58 stability overlay for all three Journal surfaces.
 * Prevents horizontal drift, makes the layered Wear Log open atomic so older
 * presentation passes cannot visibly repaint after first display, keeps Journal
 * View clothing thumbnails a consistent horizontally-scrollable size, explicitly
 * re-centers the app viewport after edit/view transitions, always opens Journal
 * View at the top, and contains vertical scrolling inside the Journal sheet.
 */
(function(){
  'use strict';

  const VERSION='1.7';
  const STYLE_ID='v1325JournalLayoutHardeningStyles';
  let syncing=false;
  let readerTouchY=null;
  let readerTouchX=null;
  let titleFocusScrollTop=null;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* The Journal screen itself is a hard horizontal boundary. Internal
         carousels can still scroll, but no descendant may widen the app page. */
      #app>.screen[data-screen="journal"]{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-x:clip!important;overscroll-behavior-x:none!important}
      #app>.screen[data-screen="journal"]>*{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
      #app>.screen[data-screen="journal"] .journal-section-block,
      #app>.screen[data-screen="journal"] .today-journal-section,
      #app>.screen[data-screen="journal"] .planned-journal-section,
      #app>.screen[data-screen="journal"] .wear-insights-section,
      #app>.screen[data-screen="journal"] .wear-log-content,
      #app>.screen[data-screen="journal"] .today-journal-content,
      #app>.screen[data-screen="journal"] .journal-list,
      #app>.screen[data-screen="journal"] .journal-toolbar,
      #app>.screen[data-screen="journal"] .wear-log-filter-row{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}

      .v1325-journal-browse-host{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;overflow-x:clip!important;overscroll-behavior-x:none!important;box-sizing:border-box!important}
      .v1325-journal-browse-host .journal-row{width:100%!important;max-width:100%!important;min-width:0!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important}
      .v1325-journal-browse-host .v1325-simple-log{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow:hidden!important}
      .v1325-journal-browse-host .v1325-simple-date,.v1325-journal-browse-host .v1325-simple-items,.v1325-journal-browse-host .v1325-simple-copy{min-width:0!important;box-sizing:border-box!important}

      body.journal-detail-open{left:0!important;right:0!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important}
      body.journal-detail-open #app{width:100%!important;max-width:100vw!important;overflow-x:hidden!important;overflow-x:clip!important}
      #journalDetailDialog{overflow-x:hidden!important;overscroll-behavior-x:none!important;outline:none!important}
      #journalDetailDialog .journal-detail-scroll{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;overflow-x:clip!important;overscroll-behavior-x:none!important;box-sizing:border-box!important}
      #journalDetailDialog .journal-detail-scroll>*{max-width:100%;box-sizing:border-box}
      #journalDetailDialog .v1325-journal-sheet{max-width:calc(100% + 28px)!important;box-sizing:border-box!important}
      #journalDetailDialog .v1325-look-strip-wrap,#journalDetailDialog .v1325-day-classifiers,#journalDetailDialog .v1325-journal-primary-view{max-width:100%!important;box-sizing:border-box!important}
      #journalDetailDialog .v1325-journal-title-field{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow-x:hidden!important}
      #journalDetailDialog .v1325-journal-title-input{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin-left:0!important;margin-right:0!important;transform:none!important}

      #journalDetailDialog #journalDetailFavoriteBtn,
      #journalDetailDialog #journalDetailFavoriteBtn:focus,
      #journalDetailDialog #journalDetailFavoriteBtn:active{outline:none!important;-webkit-tap-highlight-color:transparent!important}
      #journalDetailDialog #journalDetailFavoriteBtn:focus-visible{outline:none!important;box-shadow:0 0 0 2px rgba(161,83,82,.16),0 3px 10px rgba(61,48,39,.08)!important}

      /* Journal View is a self-contained vertical scroller. The modal and page
         do not participate in document scrolling, and boundary rubber-banding
         is suppressed so the app background cannot peek through below it. */
      #v1325JournalReaderDialog{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}
      #v1325JournalReaderDialog .v1325-reader-scroll{width:100%!important;max-width:100%!important;height:100%!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:none!important;touch-action:pan-y!important;box-sizing:border-box!important;background:#f8efdf!important;-webkit-overflow-scrolling:touch!important}
      #v1325JournalReaderDialog .v1325-reader-page{width:100%!important;max-width:680px!important;min-width:0!important;min-height:100%!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important;overflow-x:hidden!important}
      #v1325JournalReaderDialog .v1325-crafted-body,#v1325JournalReaderDialog .v1325-crafted-right,#v1325JournalReaderDialog .v1325-crafted-writing-top,#v1325JournalReaderDialog .v1325-crafted-writing-bottom{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}

      /* Full-width keepsake strip. The strip may scroll horizontally, but the
         journal page itself remains vertical-only. Fixed card widths prevent
         clothing from shrinking as more worn pieces are added. */
      #v1325JournalReaderDialog .v1325-crafted-lookbar{width:auto!important;max-width:none!important;margin:16px -10px 4px!important;padding:8px 10px 5px!important;border:0!important;border-radius:0!important;background:linear-gradient(90deg,rgba(217,184,124,.10),rgba(255,255,255,.20),rgba(217,184,124,.10))!important;box-shadow:none!important;overflow:hidden!important;box-sizing:border-box!important}
      #v1325JournalReaderDialog .v1325-crafted-look{min-width:0!important;max-width:100%!important;overflow:hidden!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{width:100%!important;max-width:100%!important;display:flex!important;justify-content:flex-start!important;align-items:flex-end!important;gap:7px!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain!important;touch-action:pan-x pan-y!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;scroll-snap-type:x proximity!important;padding:1px 3px 5px!important;box-sizing:border-box!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look::-webkit-scrollbar{display:none!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{flex:0 0 120px!important;width:120px!important;min-width:120px!important;max-width:120px!important;scroll-snap-align:start!important}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:112px!important;min-width:112px!important;max-width:112px!important;height:124px!important;margin:0 auto!important;object-fit:contain!important}
      #v1325JournalReaderDialog .v1325-crafted-look-label{display:block!important;width:100%!important;margin:3px 0 0!important;padding:0!important;text-align:center!important;transform:none!important}

      @media(max-width:560px){
        /* iOS Safari can pan/zoom the visual viewport when an editable control is
           below 16px. Keep every Journal edit target at 16px so leaving the
           keyboard cannot strand the fixed Wear Log or browse page off-center. */
        #journalDetailDialog .v1325-journal-sheet.editing input,
        #journalDetailDialog .v1325-journal-sheet.editing select,
        #journalDetailDialog .v1325-journal-sheet.editing textarea,
        #journalDetailDialog .v1325-journal-sheet.editing [contenteditable="true"]{font-size:16px!important}
        #v1325JournalReaderDialog .v1325-reader-page{width:100%!important;max-width:100%!important;min-height:100%!important}
        #v1325JournalReaderDialog .v1325-crafted-lookbar{margin-left:-8px!important;margin-right:-8px!important;padding-left:8px!important;padding-right:8px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{gap:6px!important;padding-left:2px!important;padding-right:2px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{flex-basis:108px!important;width:108px!important;min-width:108px!important;max-width:108px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:102px!important;min-width:102px!important;max-width:102px!important;height:114px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function journalSurfaceActive(){
    const screen=document.querySelector('#app>.screen[data-screen="journal"]');
    const detail=document.querySelector('#journalDetailDialog');
    const reader=document.querySelector('#v1325JournalReaderDialog');
    return !!(screen?.classList.contains('active')||detail?.open||reader?.open);
  }

  function normalizePageX(){
    if(!journalSurfaceActive())return;
    const root=document.documentElement,body=document.body,app=document.getElementById('app'),screen=document.querySelector('#app>.screen[data-screen="journal"]');
    if(root&&root.scrollLeft!==0)root.scrollLeft=0;
    if(body&&body.scrollLeft!==0)body.scrollLeft=0;
    if(app&&app.scrollLeft!==0)app.scrollLeft=0;
    if(screen&&screen.scrollLeft!==0)screen.scrollLeft=0;
    if(window.scrollX!==0){const y=window.scrollY;try{window.scrollTo(0,y);}catch{}}
  }

  function resetReaderTop(){
    const dialog=document.querySelector('#v1325JournalReaderDialog');
    const scroll=dialog?.querySelector('.v1325-reader-scroll');
    if(!dialog?.open||!scroll)return;
    if(scroll.scrollTop!==0)scroll.scrollTop=0;
    if(scroll.scrollLeft!==0)scroll.scrollLeft=0;
    if(dialog.scrollTop!==0)dialog.scrollTop=0;
  }

  function markBrowseHosts(){document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>{const parent=row.parentElement;if(parent)parent.classList.add('v1325-journal-browse-host');});}

  function normalizeScrollLeft(){
    normalizePageX();
    const detail=document.querySelector('#journalDetailDialog .journal-detail-scroll');if(detail&&detail.scrollLeft!==0)detail.scrollLeft=0;
    const reader=document.querySelector('#v1325JournalReaderDialog .v1325-reader-scroll');if(reader&&reader.scrollLeft!==0)reader.scrollLeft=0;
    document.querySelectorAll('.v1325-journal-browse-host').forEach(host=>{if(host.scrollLeft!==0)host.scrollLeft=0;});
  }

  function normalizeDetailFocus(dialog){
    if(!dialog)return;dialog.setAttribute('tabindex','-1');
    const favorite=dialog.querySelector('#journalDetailFavoriteBtn');if(document.activeElement===favorite)favorite.blur();
    try{dialog.focus({preventScroll:true});}catch{}
  }

  function sync(){if(syncing)return;syncing=true;try{installStyles();markBrowseHosts();normalizeScrollLeft();}finally{syncing=false;}}

  /* The v13.25 preview is intentionally layered: Contextual Journal, Era,
     Journal Experience, title/toolbar polish, Wear Log layout, editor hierarchy,
     and refinements all wrap openJournalDetail(). Several older passes schedule
     their DOM moves at 0/40/60/70/80/120/160/180/200/320/340ms or on RAF.
     That caused the already-visible Journal area to be moved repeatedly.

     During the single openJournalDetail call only, collapse those short layout
     callbacks into the same JavaScript turn. The base openJournalDetail itself
     is synchronous and has no timers/RAF, so the completed hierarchy is ready
     before Safari gets its first paint. Longer application timers are untouched. */
  function atomicOpen(open0,context,args){
    const nativeTimeout=window.setTimeout.bind(window);
    const nativeRAF=window.requestAnimationFrame.bind(window);
    const immediateTimeout=(fn,delay,...rest)=>{
      const ms=Number(delay||0);
      if(typeof fn==='function'&&ms>=0&&ms<=400){try{fn(...rest);}catch(err){nativeTimeout(()=>{throw err;},0);}return 0;}
      return nativeTimeout(fn,delay,...rest);
    };
    const immediateRAF=fn=>{
      if(typeof fn==='function'){try{fn(performance.now());}catch(err){nativeTimeout(()=>{throw err;},0);}return 0;}
      return nativeRAF(fn);
    };
    window.setTimeout=immediateTimeout;
    window.requestAnimationFrame=immediateRAF;
    try{return open0.apply(context,args);}
    finally{window.setTimeout=nativeTimeout;window.requestAnimationFrame=nativeRAF;}
  }

  function settleDetail(dialog){
    sync();normalizeDetailFocus(dialog);
    try{window.AudreyWearLogLayout2?.refresh?.();}catch{}
    try{window.AudreyWearLogInteractionFixes?.refresh?.();}catch{}
    try{window.AudreyJournalEditorLayout?.refresh?.();}catch{}
    try{window.AudreyJournalEditorRefinements?.refresh?.();}catch{}
    sync();normalizeDetailFocus(dialog);
  }

  function blurJournalEditor(){
    const active=document.activeElement;
    if(!active)return;
    const detail=document.querySelector('#journalDetailDialog');
    if(detail?.contains(active)&&(active.matches?.('input,select,textarea,[contenteditable="true"]')||active.isContentEditable)){
      try{active.blur();}catch{}
    }
  }

  function settleViewport(){
    sync();
    requestAnimationFrame(sync);
    setTimeout(sync,35);
    setTimeout(sync,120);
    setTimeout(sync,280);
    setTimeout(sync,520);
  }

  function settleAfterJournalEdit(){
    /* Dismiss the iOS keyboard before the editor DOM is rearranged. Safari can
       otherwise retain a visual-viewport pan after the body-fixed modal returns
       to read mode. Re-center again as the keyboard/visual viewport settles. */
    blurJournalEditor();
    sync();
    requestAnimationFrame(sync);
    setTimeout(sync,60);
    setTimeout(sync,180);
    setTimeout(sync,360);
    setTimeout(sync,620);
  }

  function settleTitleFocus(){
    const d=document.querySelector('#journalDetailDialog');
    const scroll=d?.querySelector('.journal-detail-scroll');
    if(!d?.open||!scroll)return;
    const targetTop=titleFocusScrollTop;
    const restore=()=>{
      normalizePageX();
      if(scroll.scrollLeft!==0)scroll.scrollLeft=0;
      if(targetTop!=null&&Math.abs(scroll.scrollTop-targetTop)>1)scroll.scrollTop=targetTop;
    };
    restore();
    requestAnimationFrame(restore);
    setTimeout(restore,40);
    setTimeout(restore,120);
    setTimeout(restore,260);
  }

  function settleReaderOpen(){
    resetReaderTop();sync();
    requestAnimationFrame(()=>{resetReaderTop();sync();});
    setTimeout(resetReaderTop,40);
    setTimeout(resetReaderTop,140);
    setTimeout(resetReaderTop,260);
  }

  function bindReaderBoundaryLock(){
    const scroll=document.querySelector('#v1325JournalReaderDialog .v1325-reader-scroll');
    if(!scroll||scroll.dataset.v1325BoundaryLock==='1')return;
    scroll.dataset.v1325BoundaryLock='1';
    scroll.addEventListener('touchstart',event=>{
      const touch=event.touches?.[0];readerTouchY=touch?.clientY??null;readerTouchX=touch?.clientX??null;
    },{passive:true});
    scroll.addEventListener('touchmove',event=>{
      const touch=event.touches?.[0];if(!touch||readerTouchY==null||readerTouchX==null)return;
      const dy=touch.clientY-readerTouchY,dx=touch.clientX-readerTouchX;
      readerTouchY=touch.clientY;readerTouchX=touch.clientX;
      if(Math.abs(dx)>Math.abs(dy))return;
      const atTop=scroll.scrollTop<=0;
      const atBottom=scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-1;
      if((atTop&&dy>0)||(atBottom&&dy<0))event.preventDefault();
    },{passive:false});
    scroll.addEventListener('touchend',()=>{readerTouchY=null;readerTouchX=null;},{passive:true});
    scroll.addEventListener('touchcancel',()=>{readerTouchY=null;readerTouchX=null;},{passive:true});
  }

  function bindCloseNormalization(){
    const detail=document.querySelector('#journalDetailDialog');
    if(detail&&detail.dataset.v1325ViewportCloseBound!=='1'){
      detail.dataset.v1325ViewportCloseBound='1';detail.addEventListener('close',settleViewport);
    }
    const reader=document.querySelector('#v1325JournalReaderDialog');
    if(reader&&reader.dataset.v1325ViewportCloseBound!=='1'){
      reader.dataset.v1325ViewportCloseBound='1';reader.addEventListener('close',settleViewport);
    }
    bindReaderBoundaryLock();
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
      const out=atomicOpen(open0,this,arguments);
      settleDetail(dialog);bindCloseNormalization();
      return out;
    };
    openJournalDetail.__journalHardeningWrapped=true;
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__journalHardeningWrapped)return;
    const open0=api.openReader.bind(api);
    api.openReader=function(id){
      const out=open0(id);
      bindCloseNormalization();
      settleReaderOpen();
      return out;
    };
    api.__journalHardeningWrapped=true;
  }

  document.addEventListener('scroll',event=>{const target=event.target;if(target?.matches?.('.journal-detail-scroll,.v1325-reader-scroll,.v1325-journal-browse-host')&&target.scrollLeft!==0)target.scrollLeft=0;},true);

  document.addEventListener('click',event=>{
    const edit=event.target.closest?.('#v1325JournalEditToggle');
    const sheet=document.querySelector('#journalDetailDialog .v1325-journal-sheet');
    if(edit&&sheet?.classList.contains('editing'))settleAfterJournalEdit();
    else if(edit||event.target.closest?.('#v1325SaveJournalBtn,#v1325ReaderCloseBtn,.v1325-reader-close'))settleViewport();
    if(event.target.closest?.('#v1325JournalViewBtn'))settleReaderOpen();
  },true);

  document.addEventListener('pointerdown',event=>{
    if(event.target?.closest?.('#v1325JournalTitle')){
      const scroll=document.querySelector('#journalDetailDialog .journal-detail-scroll');
      titleFocusScrollTop=scroll?.scrollTop??null;
    }
  },true);

  document.addEventListener('focusin',event=>{
    if(event.target?.matches?.('#v1325JournalTitle'))settleTitleFocus();
  },true);

  document.addEventListener('focusout',event=>{
    if(event.target?.closest?.('#journalDetailDialog .v1325-journal-sheet.editing'))settleViewport();
    if(event.target?.matches?.('#v1325JournalTitle'))titleFocusScrollTop=null;
  },true);

  window.addEventListener('resize',settleViewport,{passive:true});
  window.addEventListener('pageshow',settleViewport,{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',()=>{if(journalSurfaceActive())settleViewport();},{passive:true});
    window.visualViewport.addEventListener('scroll',()=>{if(journalSurfaceActive())normalizePageX();},{passive:true});
  }

  installStyles();wrapRenderJournal();wrapOpenDetail();wrapReader();bindCloseNormalization();requestAnimationFrame(sync);setTimeout(sync,150);
  window.AudreyJournalLayoutHardening={version:VERSION,refresh:sync,atomicOpen:true,normalizeViewport:settleViewport,settleAfterEdit:settleAfterJournalEdit,settleTitleFocus,resetReaderTop:settleReaderOpen};
})();
