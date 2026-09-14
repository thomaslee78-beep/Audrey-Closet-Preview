/* Audrey Closet v13.25 Phase 3 — Final Journal row renderer
 * Layout30 consolidates the nearly-final Journal browse row into one owner.
 * It replaces the layered TitleLog -> DetailToolbar -> RowPolish composition for
 * browse rows so initial load and return-from-Wear-Log use identical DOM/layout.
 */
(function(){
  'use strict';

  const VERSION='1.2';
  const STYLE_ID='v1325JournalRowFinalStyles';
  const NEUTRAL_ACCENT='#9f9484';

  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}
  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''));}
  function ratingValue(entry){const n=Number(entry?.rating||0);return Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;}
  function favoriteValue(entry){return entry?.favorite===true||entry?.isFavorite===true;}
  function storedTitle(entry){return String(entry?.journalTitle||'').trim();}

  function formatCalendar(date){
    const d=new Date(`${date||''}T12:00:00`);
    if(Number.isNaN(d.getTime()))return {month:'',day:'—',year:''};
    return {month:d.toLocaleDateString('en-US',{month:'short'}),day:String(d.getDate()),year:String(d.getFullYear())};
  }

  function itemThumbs(entry){
    const items=(entry?.itemIds||[]).map(id=>state.items.find(item=>String(item.id)===String(id))).filter(Boolean).slice(0,4);
    if(!items.length)return '<span class="v1325-simple-item v1325-simple-item-empty">—</span>';
    return items.map(item=>`<span class="v1325-simple-item">${item.photo?`<img src="${esc(item.photo)}" alt="">`:'<span class="v1325-simple-item-empty">item</span>'}</span>`).join('');
  }

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .journal-row.v1325-final-row{padding:0!important;overflow:hidden!important;border-left:0!important}
      .journal-row.v1325-final-row>*:not(.v1325-simple-log){display:none!important}
      .journal-row.v1325-final-row .v1325-simple-log{
        position:relative!important;display:grid!important;
        grid-template-columns:61px minmax(184px,auto) minmax(0,1fr)!important;
        gap:10px!important;align-items:center!important;width:100%!important;
        min-height:100px!important;padding:9px 10px!important;box-sizing:border-box!important;
        overflow:hidden!important;text-align:left!important;cursor:pointer!important;
      }
      .journal-row.v1325-final-row .v1325-simple-log:before{
        content:'';position:absolute;left:0;top:0;bottom:0;width:5px;
        background:var(--journal-day-accent,${NEUTRAL_ACCENT});border-radius:10px 0 0 10px;
        z-index:2;pointer-events:none;
      }
      .journal-row.v1325-final-row .v1325-simple-date{
        width:56px!important;height:72px!important;align-self:center!important;
        display:flex!important;flex-direction:column!important;justify-content:center!important;
        border:1px solid rgba(108,81,66,.15)!important;border-radius:11px!important;
        overflow:hidden!important;background:rgba(255,253,248,.9)!important;text-align:center!important;
        box-shadow:0 2px 8px rgba(61,48,39,.05)!important;
      }
      .journal-row.v1325-final-row .v1325-simple-date-month{display:block!important;padding:3px 2px 2px!important;background:rgba(102,113,90,.10)!important;font-size:.59rem!important;font-weight:750!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:var(--olive-dark)!important}
      .journal-row.v1325-final-row .v1325-simple-date-day{display:block!important;padding:2px 2px 0!important;font-family:var(--serif)!important;font-size:1.40rem!important;line-height:1!important;font-weight:650!important;color:var(--coffee)!important}
      .journal-row.v1325-final-row .v1325-simple-date-year{display:block!important;padding:1px 2px 3px!important;font-size:.55rem!important;color:var(--muted)!important}
      .journal-row.v1325-final-row .v1325-simple-items{display:flex!important;align-items:center!important;gap:6px!important;min-width:0!important;min-height:76px!important;overflow:hidden!important}
      .journal-row.v1325-final-row .v1325-simple-item{width:62px!important;height:76px!important;flex:0 0 62px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:10px!important;background:rgba(244,239,230,.7)!important;overflow:hidden!important}
      .journal-row.v1325-final-row .v1325-simple-item img{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important}
      .journal-row.v1325-final-row .v1325-simple-item-empty{font-size:.62rem!important;color:var(--muted)!important}

      /* Rating and title are one left-aligned text stack. */
      .journal-row.v1325-final-row .v1325-simple-copy{
        position:relative!important;align-self:stretch!important;display:flex!important;
        flex-direction:column!important;justify-content:center!important;align-items:stretch!important;
        min-width:0!important;padding:7px 38px 5px 0!important;box-sizing:border-box!important;
        text-align:left!important;
      }
      .journal-row.v1325-final-row .v1325-row-rating{
        position:static!important;display:block!important;flex:0 0 auto!important;
        align-self:stretch!important;width:100%!important;min-width:0!important;
        min-height:18px!important;margin:0 0 3px!important;padding:0!important;
        color:#9b7442!important;font-size:.82rem!important;line-height:1!important;
        letter-spacing:-.01em!important;white-space:nowrap!important;text-align:left!important;
      }
      .journal-row.v1325-final-row .v1325-simple-title{
        position:static!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;
        -webkit-line-clamp:2!important;white-space:normal!important;overflow:hidden!important;
        text-overflow:ellipsis!important;width:100%!important;min-width:0!important;
        align-self:stretch!important;margin:0!important;padding:0!important;font-family:var(--serif)!important;
        font-size:.88rem!important;font-weight:650!important;line-height:1.2!important;color:var(--coffee)!important;
        text-align:left!important;
      }
      .journal-row.v1325-final-row .v1325-simple-title.empty{font-weight:500!important;color:var(--muted)!important;font-style:italic!important}
      .journal-row.v1325-final-row .v1325-row-favorite{
        position:absolute!important;right:7px!important;top:7px!important;width:30px!important;height:30px!important;
        padding:0!important;border:1px solid rgba(108,81,66,.18)!important;border-radius:50%!important;
        background:rgba(255,253,248,.94)!important;color:#95605e!important;font-size:1rem!important;
        line-height:28px!important;text-align:center!important;box-shadow:0 2px 7px rgba(61,48,39,.07)!important;z-index:3!important;
      }
      .journal-row.v1325-final-row .v1325-row-favorite.active{background:#f6e5e1!important;border-color:rgba(161,83,82,.28)!important;color:#a15352!important}

      @media(max-width:520px){
        .journal-row.v1325-final-row .v1325-simple-log{grid-template-columns:54px 120px minmax(0,1fr)!important;gap:5px!important;min-height:96px!important;padding:8px!important}
        .journal-row.v1325-final-row .v1325-simple-date{width:50px!important;height:66px!important}
        .journal-row.v1325-final-row .v1325-simple-date-month{font-size:.56rem!important}
        .journal-row.v1325-final-row .v1325-simple-date-day{font-size:1.28rem!important}
        .journal-row.v1325-final-row .v1325-simple-date-year{font-size:.52rem!important}
        .journal-row.v1325-final-row .v1325-simple-items{width:120px!important;min-height:72px!important;gap:4px!important}
        .journal-row.v1325-final-row .v1325-simple-item{width:58px!important;height:72px!important;flex-basis:58px!important}
        .journal-row.v1325-final-row .v1325-simple-items .v1325-simple-item:nth-child(n+3){display:none!important}
        .journal-row.v1325-final-row .v1325-simple-copy{padding:7px 34px 5px 0!important}
        .journal-row.v1325-final-row .v1325-row-rating{font-size:.77rem!important;min-height:17px!important;margin-bottom:3px!important}
        .journal-row.v1325-final-row .v1325-simple-title{font-size:.81rem!important}
      }
    `;
    document.head.appendChild(style);
  }

  async function toggleFavorite(entry,button){
    if(!entry)return;
    const prior=favoriteValue(entry);
    entry.favorite=!prior;entry.updated=Date.now();
    if(button){button.classList.toggle('active',entry.favorite);button.textContent=entry.favorite?'♥':'♡';button.setAttribute('aria-pressed',entry.favorite?'true':'false');}
    try{await saveState();if(typeof toast==='function')toast(entry.favorite?'Added to favorites':'Removed from favorites');}
    catch(err){entry.favorite=prior;console.error('[v13.25 final row] favorite save failed',err);if(typeof toast==='function')toast('Could not update favorite');}
    renderAll();
  }

  function renderRow(row,entry){
    if(!row||!entry)return;
    row.classList.add('v1325-simple-log-row','v1325-final-row');
    const color=validColor(entry.dayColor)?entry.dayColor:NEUTRAL_ACCENT;
    row.style.setProperty('--journal-day-accent',color);

    row.querySelector('.v1325-simple-log')?.remove();
    const date=formatCalendar(entry.date),rating=ratingValue(entry),favorite=favoriteValue(entry),title=storedTitle(entry);
    const summary=document.createElement('div');
    summary.className='v1325-simple-log';summary.setAttribute('role','button');summary.setAttribute('tabindex','0');summary.setAttribute('aria-label',`Open journal for ${entry.date||'this day'}`);
    summary.innerHTML=`<div class="v1325-simple-date"><span class="v1325-simple-date-month">${esc(date.month)}</span><span class="v1325-simple-date-day">${esc(date.day)}</span><span class="v1325-simple-date-year">${esc(date.year)}</span></div><div class="v1325-simple-items">${itemThumbs(entry)}</div><div class="v1325-simple-copy">${rating?`<span class="v1325-row-rating" aria-label="${rating} star rating">${'★'.repeat(rating)}</span>`:''}<span class="v1325-simple-title${title?'':' empty'}">${title?esc(title):'Journal day'}</span></div><button type="button" class="v1325-row-favorite${favorite?' active':''}" aria-label="${favorite?'Remove favorite day':'Favorite this day'}" aria-pressed="${favorite?'true':'false'}">${favorite?'♥':'♡'}</button>`;

    const open=event=>{event.preventDefault();event.stopPropagation();if(typeof openJournalDetail==='function')openJournalDetail(entry.id);};
    summary.addEventListener('click',event=>{if(event.target.closest('.v1325-row-favorite'))return;open(event);});
    summary.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){open(event);}});
    const fav=summary.querySelector('.v1325-row-favorite');
    fav?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();toggleFavorite(entry,fav);});
    row.appendChild(summary);
  }

  function renderAll(){
    installStyles();
    document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>renderRow(row,entryById(row.dataset.journalId)));
    window.AudreyJournalLayoutHardening?.refresh?.();
  }

  function settleRows(){
    renderAll();
    requestAnimationFrame(renderAll);
  }

  function bindDetailClose(){
    const dialog=document.querySelector('#journalDetailDialog');
    if(!dialog||dialog.dataset.v1325FinalRowsCloseBound==='1')return;
    dialog.dataset.v1325FinalRowsCloseBound='1';
    dialog.addEventListener('close',()=>{
      requestAnimationFrame(renderAll);
      setTimeout(renderAll,35);
    });
  }

  function wrapRenderJournal(){
    if(typeof renderJournal!=='function'||renderJournal.__finalRowsWrapped)return;
    const render0=renderJournal;
    renderJournal=function(){
      const out=render0.apply(this,arguments);
      requestAnimationFrame(renderAll);
      setTimeout(renderAll,35);
      return out;
    };
    renderJournal.__finalRowsWrapped=true;
  }

  installStyles();wrapRenderJournal();bindDetailClose();settleRows();setTimeout(renderAll,50);
  window.AudreyJournalFinalRows={version:VERSION,refresh:renderAll};
})();
