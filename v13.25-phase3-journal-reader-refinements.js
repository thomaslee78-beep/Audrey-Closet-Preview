/* Audrey Closet v13.25 Phase 3 — Journal View refinements
 * Layout35 presentation/interaction overlay.
 * - moves the reader close control into the upper-right page corner
 * - gives the close control the same tan/brown visual family as Wear Log
 * - adds a typewriter-style Journal title above photos/writing
 * - centers the empty written-memory state beneath the banner/title area
 * - hardens the existing swipeable photo viewer into a photo-only surface
 * - hides reader actions and locks all vertical/background scrolling while photos are open
 */
(function(){
  'use strict';

  const VERSION='1.2';
  const STYLE_ID='v1325JournalReaderRefinementStyles';
  let syncing=false;

  function currentEntry(){
    const reader=document.querySelector('#v1325JournalReaderDialog');
    const id=reader?.dataset?.journalId||viewingJournalId||'';
    return state.journal.find(j=>String(j.id)===String(id))||null;
  }

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close{
        position:absolute!important;top:17px!important;right:17px!important;left:auto!important;
        width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;z-index:70!important;
        border:1px solid rgba(111,91,69,.30)!important;border-radius:50%!important;background:#eadfc9!important;color:#6f5d48!important;
        box-shadow:0 3px 10px rgba(74,58,44,.11)!important;font-size:24px!important;line-height:34px!important;-webkit-tap-highlight-color:transparent!important;
      }
      #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close:focus{outline:none!important}
      #v1325JournalReaderDialog .v1325-reader-top{padding-left:48px!important;padding-right:48px!important}

      #v1325JournalReaderDialog .v1325-crafted-journal-title{
        position:relative;z-index:3;width:min(92%,560px);margin:3px auto 14px;padding:5px 10px 6px;color:#604d3d;
        font-family:"Courier New",Courier,ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.13rem;line-height:1.16;font-weight:700;
        letter-spacing:.015em;text-align:center;overflow-wrap:anywhere;
      }
      #v1325JournalReaderDialog .v1325-crafted-journal-title:before{content:'';position:absolute;left:18%;right:18%;bottom:0;border-bottom:1px dashed rgba(112,91,69,.28)}

      /* Empty Journal View should read as an intentional centered state, not text
         hanging in the right writing column. */
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing.empty{
        width:100%!important;min-height:76px!important;display:flex!important;align-items:center!important;justify-content:center!important;
        padding:14px 8px!important;text-align:center!important;background:none!important;color:var(--muted)!important;font-style:italic!important;
        box-sizing:border-box!important;
      }
      #v1325JournalReaderDialog .v1325-crafted-body:has(.v1325-crafted-writing-top .v1325-reader-writing.empty):not(:has(.v1325-crafted-photos)){
        display:block!important;
      }
      #v1325JournalReaderDialog .v1325-crafted-body:has(.v1325-crafted-writing-top .v1325-reader-writing.empty):not(:has(.v1325-crafted-photos)) .v1325-crafted-right{
        width:100%!important;
      }

      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{cursor:zoom-in;-webkit-tap-highlight-color:transparent}

      #v1325JournalReaderDialog #v1325JournalPhotoLightbox{z-index:180!important;inset:0!important;overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}
      #v1325JournalReaderDialog #v1325JournalPhotoLightbox.open{display:flex!important}
      #v1325JournalReaderDialog:has(#v1325JournalPhotoLightbox.open){overflow:hidden!important;overscroll-behavior:none!important}
      #v1325JournalReaderDialog:has(#v1325JournalPhotoLightbox.open) .v1325-reader-scroll{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}
      #v1325JournalReaderDialog:has(#v1325JournalPhotoLightbox.open) > .v1325-reader-actions{display:none!important}
      #v1325JournalReaderDialog:has(#v1325JournalPhotoLightbox.open) .v1325-reader-page{pointer-events:none!important}
      #v1325JournalReaderDialog:has(#v1325JournalPhotoLightbox.open) #v1325JournalPhotoLightbox{pointer-events:auto!important}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close{top:12px!important;right:12px!important;width:36px!important;height:36px!important;min-width:36px!important;font-size:23px!important;line-height:32px!important}
        #v1325JournalReaderDialog .v1325-reader-top{padding-left:42px!important;padding-right:42px!important}
        #v1325JournalReaderDialog .v1325-crafted-journal-title{width:92%;margin-top:1px;margin-bottom:11px;padding:4px 7px 6px;font-size:1rem}
        #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing.empty{min-height:68px!important;padding:12px 6px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function moveCloseToPage(reader,page){if(!reader||!page)return;const close=reader.querySelector('#v1325ReaderCloseBtn,.v1325-reader-close');if(close&&close.parentNode!==page)page.prepend(close);}

  function ensureTitle(page){
    if(!page)return;const entry=currentEntry(),text=String(entry?.journalTitle||'').trim();let title=page.querySelector('.v1325-crafted-journal-title');
    if(!text){title?.remove();return;}
    if(!title){title=document.createElement('div');title.className='v1325-crafted-journal-title';const body=page.querySelector('.v1325-crafted-body'),chips=page.querySelector('.v1325-reader-chips');if(body)body.before(title);else if(chips)chips.after(title);else page.querySelector('.v1325-reader-top')?.after(title);}
    title.textContent=text;
  }

  function lockLegacyPhotoViewer(reader){
    const box=reader?.querySelector('#v1325JournalPhotoLightbox');if(!reader||!box)return;const open=box.classList.contains('open');reader.classList.toggle('v1325-photo-only-mode',open);
    const scroll=reader.querySelector('.v1325-reader-scroll');
    if(open){if(scroll&&!scroll.dataset.v1325LockedTop)scroll.dataset.v1325LockedTop=String(scroll.scrollTop||0);if(scroll)scroll.scrollTop=Number(scroll.dataset.v1325LockedTop||0);}
    else if(scroll?.dataset.v1325LockedTop){scroll.scrollTop=Number(scroll.dataset.v1325LockedTop||0);delete scroll.dataset.v1325LockedTop;}
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{installStyles();const reader=document.querySelector('#v1325JournalReaderDialog'),page=reader?.querySelector('#v1325JournalReaderPage');if(!reader||!page)return;moveCloseToPage(reader,page);ensureTitle(page);lockLegacyPhotoViewer(reader);}finally{syncing=false;}
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__readerRefinementsWrapped)return;
    const open0=api.openReader.bind(api);api.openReader=function(id){const out=open0(id);requestAnimationFrame(sync);setTimeout(sync,35);setTimeout(sync,120);return out;};api.__readerRefinementsWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalViewBtn,#v1325JournalReaderDialog .v1325-reader-photos img,#v1325JournalPhotoLightbox .v1325-lightbox-close,#v1325JournalPhotoLightbox')){requestAnimationFrame(sync);setTimeout(sync,20);setTimeout(sync,80);}
  },true);

  document.addEventListener('touchmove',event=>{const reader=document.querySelector('#v1325JournalReaderDialog'),box=reader?.querySelector('#v1325JournalPhotoLightbox.open');if(box&&event.target.closest?.('#v1325JournalPhotoLightbox'))event.preventDefault();},{capture:true,passive:false});

  installStyles();wrapReader();requestAnimationFrame(sync);setTimeout(sync,150);
  window.AudreyJournalReaderRefinements={version:VERSION,refresh:sync};
})();
