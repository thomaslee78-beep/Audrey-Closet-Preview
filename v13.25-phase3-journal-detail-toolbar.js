/* Audrey Closet v13.25 Phase 3 — Journal row polish + compact detail metadata toolbar
 * Backward-compatible overlay. Adds optional dayColor metadata, direct favorite
 * control on Journal rows, larger date/item thumbnails, two-line titles, and
 * compacts rating/favorite/color/era/Journal View into one top row.
 */
(function(){
  'use strict';

  const VERSION='1.1';
  const STYLE_ID='v1325JournalDetailToolbarStyles';
  let syncing=false;

  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}
  function currentEntry(){return entryById(viewingJournalId||'');}
  function ratingValue(entry){
    const n=Number(entry?.rating||0);if(n>=1&&n<=5)return Math.round(n);
    const legacy={'Would change it':1,'Just okay':3,'Felt good':4,'Loved it':5};return legacy[entry?.feel]||0;
  }
  function favoriteValue(entry){return entry?.favorite===true||entry?.isFavorite===true;}
  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''))?String(value):'';}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      /* Journal row polish */
      .journal-row.v1325-simple-log-row{position:relative;border-left:4px solid var(--journal-day-color,transparent)!important;background:color-mix(in srgb,var(--journal-day-color,#fffdf8) 10%,#fffdf8)!important}
      .v1325-simple-log{position:relative;display:grid!important;grid-template-columns:74px minmax(156px,auto) minmax(0,1fr)!important;gap:12px!important;align-items:center!important;width:100%!important;box-sizing:border-box!important;padding:10px 12px!important;min-height:94px;text-align:left}
      .v1325-simple-date{width:68px!important;align-self:center;border-radius:13px!important}
      .v1325-simple-date-month{padding:4px 2px 3px!important;font-size:.67rem!important}
      .v1325-simple-date-day{padding:3px 2px 0!important;font-size:1.76rem!important}
      .v1325-simple-date-year{padding:2px 2px 5px!important;font-size:.62rem!important}
      .v1325-simple-items{display:flex!important;align-items:center!important;align-self:center!important;gap:5px!important;min-height:66px;overflow:hidden}
      .v1325-simple-item{width:52px!important;height:66px!important;flex:0 0 52px!important;border-radius:10px!important;display:flex!important;align-items:center!important;justify-content:center!important}
      .v1325-simple-item img{width:100%!important;height:100%!important;object-fit:contain!important}
      .v1325-simple-copy{position:relative;align-self:center!important;display:flex;align-items:flex-start;justify-content:center;flex-direction:column;padding:20px 4px 3px 0!important;min-width:0;min-height:48px}
      .v1325-simple-flags{display:none!important}
      .v1325-simple-title{display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal!important;line-height:1.2;max-height:2.4em;overflow:hidden;text-overflow:ellipsis;font-size:.88rem!important;width:100%}
      .v1325-row-rating{position:absolute;right:45px;top:8px;color:#9b7442;font-size:.74rem;letter-spacing:-.02em;line-height:30px;white-space:nowrap}
      .v1325-row-favorite{position:absolute;right:9px;top:8px;width:30px;height:30px;padding:0;border:1px solid rgba(108,81,66,.18);border-radius:50%;background:rgba(255,253,248,.94);color:#95605e;font-size:1rem;line-height:28px;text-align:center;box-shadow:0 2px 7px rgba(61,48,39,.07);z-index:3}
      .v1325-row-favorite.active{background:#f6e5e1;border-color:rgba(161,83,82,.28);color:#a15352}
      .v1325-row-color-dot{position:absolute;right:82px;bottom:9px;width:10px;height:10px;border-radius:50%;background:var(--journal-day-color,transparent);border:1px solid rgba(75,59,47,.13)}

      /* Compact top metadata toolbar in Journal detail */
      #journalDetailDialog .v1325-journal-meta-toolbar{display:flex;align-items:center;gap:7px;margin:2px 0 9px;padding:7px 8px;border:1px solid rgba(108,81,66,.13);border-radius:14px;background:rgba(255,252,244,.72);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      #journalDetailDialog .v1325-journal-meta-toolbar::-webkit-scrollbar{display:none}
      #journalDetailDialog .v1325-meta-rate{display:flex;align-items:center;gap:4px;flex:0 0 auto}
      #journalDetailDialog .v1325-meta-label{font-size:.62rem;color:var(--muted);font-weight:700;white-space:nowrap}
      #journalDetailDialog #journalDetailRatingStars{display:flex;gap:0;align-items:center}
      #journalDetailDialog #journalDetailRatingStars .journal-rating-star{width:22px;height:28px;min-width:22px;padding:0;border:0;background:transparent;font-size:1.02rem;line-height:1;color:#9b7442}
      #journalDetailDialog .v1325-meta-favorite{flex:0 0 auto}
      #journalDetailDialog #journalDetailFavoriteBtn{width:31px;height:31px;min-width:31px;padding:0;border:1px solid rgba(108,81,66,.18);border-radius:50%;background:#fffdf8;font-size:0!important;color:#a15352;line-height:29px}
      #journalDetailDialog #journalDetailFavoriteBtn:before{content:'♡';font-size:1rem}
      #journalDetailDialog #journalDetailFavoriteBtn.active:before{content:'♥'}
      #journalDetailDialog .v1325-meta-color{position:relative;width:31px;height:31px;flex:0 0 31px;border:1px solid rgba(108,81,66,.18);border-radius:50%;overflow:hidden;background:#fffdf8;box-sizing:border-box}
      #journalDetailDialog .v1325-meta-color input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
      #journalDetailDialog .v1325-meta-color-swatch{position:absolute;inset:5px;border-radius:50%;background:var(--day-color,#eee6d8);box-shadow:inset 0 0 0 1px rgba(50,40,34,.10);pointer-events:none}
      #journalDetailDialog .v1325-meta-color.empty .v1325-meta-color-swatch:after{content:'+';position:absolute;inset:0;display:grid;place-items:center;color:#8a7868;font-size:.75rem;font-weight:700}
      #journalDetailDialog .v1325-meta-era-slot{display:flex;align-items:center;min-width:0;flex:0 0 auto}
      #journalDetailDialog .v1325-meta-era-slot .v1325-journal-era-row{display:flex!important;align-items:center;gap:4px;min-width:0}
      #journalDetailDialog .v1325-meta-era-slot #v1325JournalEra{width:126px;max-width:126px;height:31px;padding:0 7px;border-radius:9px;font-size:.7rem}
      #journalDetailDialog .v1325-meta-era-slot #v1325JournalNewEraBtn{width:31px;height:31px;min-width:31px;padding:0;border-radius:9px;font-size:0}
      #journalDetailDialog .v1325-meta-era-slot #v1325JournalNewEraBtn:after{content:'+';font-size:1rem}
      #journalDetailDialog .v1325-meta-journal-view{flex:0 0 auto}
      #journalDetailDialog #v1325JournalViewBtn{width:33px!important;height:33px!important;min-width:33px!important;min-height:33px!important;margin:0!important;padding:0!important;border-radius:9px!important;font-size:0!important;display:grid!important;place-items:center!important}
      #journalDetailDialog #v1325JournalViewBtn:before{content:'▣';font-size:1.05rem;line-height:1}
      #journalDetailDialog .journal-detail-rating{display:none!important}
      #journalDetailDialog .v1325-look-strip-wrap{margin-top:4px!important}
      #journalDetailDialog .v1325-journal-context-grid>.v1325-journal-era-row{display:none!important}

      @media(max-width:520px){
        .v1325-simple-log{grid-template-columns:67px minmax(112px,142px) minmax(0,1fr)!important;gap:7px!important;padding:9px 8px!important;min-height:90px}
        .v1325-simple-date{width:62px!important}.v1325-simple-date-day{font-size:1.62rem!important}
        .v1325-simple-items{min-height:62px}.v1325-simple-item{width:48px!important;height:62px!important;flex-basis:48px!important}.v1325-simple-items .v1325-simple-item:nth-child(n+4){display:none!important}
        .v1325-simple-title{font-size:.81rem!important}.v1325-row-rating{right:42px;top:7px;font-size:.69rem}.v1325-row-favorite{right:7px;top:7px}
        #journalDetailDialog .v1325-journal-meta-toolbar{gap:5px;padding:6px}
        #journalDetailDialog .v1325-meta-label{display:none}
        #journalDetailDialog #journalDetailRatingStars .journal-rating-star{width:19px;min-width:19px;font-size:.94rem}
        #journalDetailDialog .v1325-meta-era-slot #v1325JournalEra{width:108px;max-width:108px}
      }
    `;document.head.appendChild(style);
  }

  async function toggleRowFavorite(entry,button){
    if(!entry)return;
    const prior=favoriteValue(entry);entry.favorite=!prior;entry.updated=Date.now();
    if(button){button.classList.toggle('active',entry.favorite);button.textContent=entry.favorite?'♥':'♡';button.setAttribute('aria-pressed',entry.favorite?'true':'false');}
    try{
      await saveState();
      if(typeof renderJournal==='function')renderJournal();
      if(typeof toast==='function')toast(entry.favorite?'Added to favorites':'Removed from favorites');
    }catch(err){
      entry.favorite=prior;
      console.error('[v13.25 journal toolbar] favorite save failed',err);
      if(typeof renderJournal==='function')renderJournal();
      if(typeof toast==='function')toast('Could not update favorite');
    }
  }

  function enhanceRow(row,entry){
    const summary=row?.querySelector('.v1325-simple-log');if(!summary||!entry)return;
    summary.querySelectorAll('.v1325-row-rating,.v1325-row-favorite,.v1325-row-color-dot').forEach(n=>n.remove());
    const color=validColor(entry.dayColor);row.style.setProperty('--journal-day-color',color||'transparent');
    if(color){const dot=document.createElement('span');dot.className='v1325-row-color-dot';summary.appendChild(dot);}
    const rating=ratingValue(entry);if(rating){const stars=document.createElement('span');stars.className='v1325-row-rating';stars.textContent='★'.repeat(rating);stars.setAttribute('aria-label',`${rating} star rating`);summary.appendChild(stars);}
    const fav=document.createElement('button');fav.type='button';fav.className='v1325-row-favorite'+(favoriteValue(entry)?' active':'');fav.textContent=favoriteValue(entry)?'♥':'♡';fav.setAttribute('aria-label',favoriteValue(entry)?'Remove favorite day':'Favorite this day');fav.setAttribute('aria-pressed',favoriteValue(entry)?'true':'false');
    fav.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();toggleRowFavorite(entry,fav);});
    summary.appendChild(fav);
  }
  function enhanceRows(){document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>enhanceRow(row,entryById(row.dataset.journalId)));}

  function syncDayColor(entry,toolbar){
    let label=toolbar.querySelector('.v1325-meta-color');
    if(!label){
      label=document.createElement('label');label.className='v1325-meta-color';label.title='Choose a color for this day';label.innerHTML='<input type="color" id="v1325JournalDayColor" aria-label="Daily color"><span class="v1325-meta-color-swatch"></span>';toolbar.appendChild(label);
      const input=label.querySelector('input');
      input.addEventListener('input',()=>{label.style.setProperty('--day-color',input.value);label.classList.remove('empty');});
      input.addEventListener('change',async()=>{
        const live=currentEntry();if(!live)return;live.dayColor=input.value;live.updated=Date.now();
        try{await saveState();if(typeof renderJournal==='function')renderJournal();if(typeof toast==='function')toast('Daily color saved');}catch(err){console.error('[v13.25 journal toolbar] color save failed',err);}
      });
    }
    const color=validColor(entry?.dayColor),input=label.querySelector('input');if(input)input.value=color||'#d8c9b5';label.style.setProperty('--day-color',color||'#eee6d8');label.classList.toggle('empty',!color);
  }

  function ensureToolbar(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const dialog=document.querySelector('#journalDetailDialog'),entry=currentEntry();if(!dialog||!entry)return;
      const scroll=dialog.querySelector('.journal-detail-scroll'),head=scroll?.querySelector('.sheet-head');if(!scroll||!head)return;
      let toolbar=dialog.querySelector('.v1325-journal-meta-toolbar');
      if(!toolbar){toolbar=document.createElement('div');toolbar.className='v1325-journal-meta-toolbar';head.after(toolbar);}

      let rate=toolbar.querySelector('.v1325-meta-rate');if(!rate){rate=document.createElement('div');rate.className='v1325-meta-rate';rate.innerHTML='<span class="v1325-meta-label">Rate</span>';toolbar.appendChild(rate);}
      const stars=dialog.querySelector('#journalDetailRatingStars');if(stars&&stars.parentNode!==rate)rate.appendChild(stars);

      let favSlot=toolbar.querySelector('.v1325-meta-favorite');if(!favSlot){favSlot=document.createElement('div');favSlot.className='v1325-meta-favorite';toolbar.appendChild(favSlot);}
      const favorite=dialog.querySelector('#journalDetailFavoriteBtn');if(favorite&&favorite.parentNode!==favSlot)favSlot.appendChild(favorite);

      syncDayColor(entry,toolbar);

      let eraSlot=toolbar.querySelector('.v1325-meta-era-slot');if(!eraSlot){eraSlot=document.createElement('div');eraSlot.className='v1325-meta-era-slot';toolbar.appendChild(eraSlot);}
      const freshEra=[...dialog.querySelectorAll('.v1325-journal-era-row')].find(r=>!eraSlot.contains(r));
      if(freshEra){eraSlot.replaceChildren(freshEra);const newBtn=freshEra.querySelector('#v1325JournalNewEraBtn');if(newBtn){newBtn.title='New era';newBtn.setAttribute('aria-label','Create new era');}}

      let viewSlot=toolbar.querySelector('.v1325-meta-journal-view');if(!viewSlot){viewSlot=document.createElement('div');viewSlot.className='v1325-meta-journal-view';toolbar.appendChild(viewSlot);}
      const view=dialog.querySelector('#v1325JournalViewBtn');if(view&&view.parentNode!==viewSlot){view.innerHTML='Journal View';view.title='Open Journal View';view.setAttribute('aria-label','Open Journal View');viewSlot.appendChild(view);}
    }finally{syncing=false;}
  }

  function wrapRenderJournal(){
    if(typeof renderJournal!=='function'||renderJournal.__detailToolbarWrapped)return;
    const render0=renderJournal;
    renderJournal=function(){
      const out=render0.apply(this,arguments);
      requestAnimationFrame(enhanceRows);
      setTimeout(enhanceRows,20);
      return out;
    };
    renderJournal.__detailToolbarWrapped=true;
  }
  function wrapOpenJournalDetail(){
    if(typeof openJournalDetail!=='function'||openJournalDetail.__detailToolbarWrapped)return;
    const open0=openJournalDetail;
    openJournalDetail=function(){
      const out=open0.apply(this,arguments);
      requestAnimationFrame(ensureToolbar);
      setTimeout(ensureToolbar,40);
      setTimeout(ensureToolbar,120);
      return out;
    };
    openJournalDetail.__detailToolbarWrapped=true;
  }

  /* Do not observe the entire Journal DOM. The prior mutation observer reacted to
   * its own row updates, continuously rebuilt controls, and could starve normal
   * click/toggle handling on iPhone. The existing render/open hooks are enough. */
  installStyles();wrapRenderJournal();wrapOpenJournalDetail();
  requestAnimationFrame(enhanceRows);setTimeout(enhanceRows,20);
  window.AudreyJournalDetailToolbar={version:VERSION,refresh:()=>{ensureToolbar();enhanceRows();}};
})();
