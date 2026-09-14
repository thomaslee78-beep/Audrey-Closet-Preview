/* Audrey Closet v13.25 Phase 3 — Journal View refinements
 * Layout33 presentation/interaction overlay.
 * - moves the reader close control into the upper-right page corner
 * - gives the close control the same tan/brown visual family as Wear Log
 * - adds a typewriter-style Journal title above photos/writing
 * - adds a contained horizontal photo viewer that hides reader actions
 * - locks reader/background vertical scrolling while photo viewer is open
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalReaderRefinementStyles';
  const LIGHTBOX_CLASS='v1325-photo-lightbox-open';
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
      /* Reader close control lives above the date banner, at the page corner. */
      #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close{
        position:absolute!important;
        top:17px!important;
        right:17px!important;
        left:auto!important;
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        padding:0!important;
        z-index:70!important;
        border:1px solid rgba(111,91,69,.30)!important;
        border-radius:50%!important;
        background:#eadfc9!important;
        color:#6f5d48!important;
        box-shadow:0 3px 10px rgba(74,58,44,.11)!important;
        font-size:24px!important;
        line-height:34px!important;
        -webkit-tap-highlight-color:transparent!important;
      }
      #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close:focus{outline:none!important}
      #v1325JournalReaderDialog .v1325-reader-top{padding-left:48px!important;padding-right:48px!important}

      /* Scrapbook/typewriter Journal title above the main photos + writing. */
      #v1325JournalReaderDialog .v1325-crafted-journal-title{
        position:relative;
        z-index:3;
        width:min(92%,560px);
        margin:3px auto 14px;
        padding:5px 10px 6px;
        color:#604d3d;
        font-family:"Courier New",Courier,ui-monospace,SFMono-Regular,Menlo,monospace;
        font-size:1.13rem;
        line-height:1.16;
        font-weight:700;
        letter-spacing:.015em;
        text-align:center;
        overflow-wrap:anywhere;
      }
      #v1325JournalReaderDialog .v1325-crafted-journal-title:before{
        content:'';
        position:absolute;
        left:18%;right:18%;bottom:0;
        border-bottom:1px dashed rgba(112,91,69,.28);
      }

      /* Journal photos are clearly tappable without changing their scrapbook styling. */
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{
        cursor:zoom-in;
        -webkit-tap-highlight-color:transparent;
      }

      /* Full reader-contained photo viewer. It covers the page/actions completely. */
      #v1325JournalReaderDialog .v1325-reader-photo-lightbox{
        position:absolute;
        inset:0;
        z-index:120;
        display:flex;
        flex-direction:column;
        overflow:hidden;
        background:rgba(42,35,29,.96);
        color:#fff;
      }
      #v1325JournalReaderDialog .v1325-reader-photo-lightbox[hidden]{display:none!important}
      #v1325JournalReaderDialog .v1325-reader-photo-close{
        position:absolute;
        top:14px;
        right:14px;
        z-index:3;
        width:40px;
        height:40px;
        min-width:40px;
        padding:0;
        border:1px solid rgba(235,223,202,.42);
        border-radius:50%;
        background:#eadfc9;
        color:#6f5d48;
        font-size:25px;
        line-height:36px;
        box-shadow:0 4px 16px rgba(0,0,0,.22);
      }
      #v1325JournalReaderDialog .v1325-reader-photo-track{
        flex:1 1 auto;
        width:100%;
        height:100%;
        display:flex;
        overflow-x:auto;
        overflow-y:hidden;
        scroll-snap-type:x mandatory;
        overscroll-behavior-x:contain;
        overscroll-behavior-y:none;
        -webkit-overflow-scrolling:touch;
        scrollbar-width:none;
        touch-action:pan-x;
      }
      #v1325JournalReaderDialog .v1325-reader-photo-track::-webkit-scrollbar{display:none}
      #v1325JournalReaderDialog .v1325-reader-photo-slide{
        flex:0 0 100%;
        width:100%;
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:62px 18px 34px;
        box-sizing:border-box;
        scroll-snap-align:center;
        scroll-snap-stop:always;
      }
      #v1325JournalReaderDialog .v1325-reader-photo-slide img{
        display:block;
        max-width:100%;
        max-height:100%;
        width:auto;
        height:auto;
        object-fit:contain;
        border-radius:6px;
        box-shadow:0 12px 36px rgba(0,0,0,.34);
      }
      #v1325JournalReaderDialog .v1325-reader-photo-count{
        position:absolute;
        left:50%;
        bottom:max(13px,env(safe-area-inset-bottom));
        transform:translateX(-50%);
        z-index:3;
        padding:5px 9px;
        border-radius:999px;
        background:rgba(0,0,0,.38);
        font-size:.69rem;
        letter-spacing:.03em;
      }

      /* When photo detail is open, nothing behind it can scroll or remain actionable. */
      #v1325JournalReaderDialog.${LIGHTBOX_CLASS} .v1325-reader-scroll{
        overflow:hidden!important;
        touch-action:none!important;
      }
      #v1325JournalReaderDialog.${LIGHTBOX_CLASS}>.v1325-reader-actions{
        display:none!important;
      }

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-reader-page>.v1325-reader-close{
          top:12px!important;
          right:12px!important;
          width:36px!important;
          height:36px!important;
          min-width:36px!important;
          font-size:23px!important;
          line-height:32px!important;
        }
        #v1325JournalReaderDialog .v1325-reader-top{padding-left:42px!important;padding-right:42px!important}
        #v1325JournalReaderDialog .v1325-crafted-journal-title{
          width:92%;
          margin-top:1px;
          margin-bottom:11px;
          padding:4px 7px 6px;
          font-size:1rem;
        }
        #v1325JournalReaderDialog .v1325-reader-photo-slide{padding:58px 10px 30px}
      }
    `;
    document.head.appendChild(style);
  }

  function moveCloseToPage(reader,page){
    if(!reader||!page)return;
    const close=reader.querySelector('#v1325ReaderCloseBtn,.v1325-reader-close');
    if(close&&close.parentNode!==page)page.prepend(close);
  }

  function ensureTitle(page){
    if(!page)return;
    const entry=currentEntry();
    const text=String(entry?.journalTitle||'').trim();
    let title=page.querySelector('.v1325-crafted-journal-title');
    if(!text){title?.remove();return;}
    if(!title){
      title=document.createElement('div');
      title.className='v1325-crafted-journal-title';
      const body=page.querySelector('.v1325-crafted-body');
      const chips=page.querySelector('.v1325-reader-chips');
      if(body)body.before(title);else if(chips)chips.after(title);else page.querySelector('.v1325-reader-top')?.after(title);
    }
    title.textContent=text;
  }

  function ensureLightbox(reader){
    let box=reader?.querySelector('.v1325-reader-photo-lightbox');
    if(box)return box;
    box=document.createElement('div');
    box.className='v1325-reader-photo-lightbox';
    box.hidden=true;
    box.innerHTML='<button type="button" class="v1325-reader-photo-close" aria-label="Close photos">×</button><div class="v1325-reader-photo-track"></div><div class="v1325-reader-photo-count" aria-live="polite"></div>';
    reader.appendChild(box);
    box.querySelector('.v1325-reader-photo-close').addEventListener('click',()=>closeLightbox(reader));
    return box;
  }

  function updatePhotoCount(box){
    const track=box?.querySelector('.v1325-reader-photo-track');
    const count=box?.querySelector('.v1325-reader-photo-count');
    if(!track||!count)return;
    const total=track.children.length;
    const index=total?Math.max(0,Math.min(total-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth)))):0;
    count.textContent=total>1?`${index+1} / ${total}`:'';
  }

  function openLightbox(reader,index){
    const entry=currentEntry();
    const photos=Array.isArray(entry?.journalPhotos)?entry.journalPhotos.filter(Boolean):[];
    if(!reader||!photos.length)return;
    const box=ensureLightbox(reader),track=box.querySelector('.v1325-reader-photo-track');
    track.innerHTML=photos.map((src,i)=>`<div class="v1325-reader-photo-slide"><img src="${src}" alt="Journal photo ${i+1}"></div>`).join('');
    box.hidden=false;
    reader.classList.add(LIGHTBOX_CLASS);
    track.onscroll=()=>updatePhotoCount(box);
    requestAnimationFrame(()=>{
      track.scrollLeft=Math.max(0,index)*track.clientWidth;
      updatePhotoCount(box);
      box.querySelector('.v1325-reader-photo-close')?.focus({preventScroll:true});
    });
  }

  function closeLightbox(reader){
    const box=reader?.querySelector('.v1325-reader-photo-lightbox');
    if(!box)return;
    box.hidden=true;
    reader.classList.remove(LIGHTBOX_CLASS);
    const track=box.querySelector('.v1325-reader-photo-track');if(track){track.onscroll=null;track.innerHTML='';}
  }

  function bindPhotos(reader,page){
    const photos=[...page.querySelectorAll('.v1325-crafted-photos .v1325-reader-photos img')];
    photos.forEach((img,index)=>{
      if(img.dataset.v1325PhotoViewerBound==='1')return;
      img.dataset.v1325PhotoViewerBound='1';
      img.setAttribute('role','button');
      img.setAttribute('tabindex','0');
      img.setAttribute('aria-label',`View journal photo ${index+1}`);
      const open=()=>openLightbox(reader,index);
      img.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open();});
      img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
    });
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const reader=document.querySelector('#v1325JournalReaderDialog');
      const page=reader?.querySelector('#v1325JournalReaderPage');
      if(!reader||!page)return;
      moveCloseToPage(reader,page);
      ensureTitle(page);
      bindPhotos(reader,page);
    }finally{syncing=false;}
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;
    if(!api?.openReader||api.__readerRefinementsWrapped)return;
    const open0=api.openReader.bind(api);
    api.openReader=function(id){
      const out=open0(id);
      requestAnimationFrame(sync);
      setTimeout(sync,35);
      setTimeout(sync,120);
      return out;
    };
    api.__readerRefinementsWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalViewBtn')){
      requestAnimationFrame(sync);setTimeout(sync,40);setTimeout(sync,130);
    }
  },true);

  installStyles();wrapReader();requestAnimationFrame(sync);setTimeout(sync,150);
  window.AudreyJournalReaderRefinements={version:VERSION,refresh:sync,closePhotos:()=>closeLightbox(document.querySelector('#v1325JournalReaderDialog'))};
})();
