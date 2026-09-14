/* Audrey Closet v13.25 Phase 3 — Journal row polish pass 2
 * Presentation-only overlay for Journal browse rows. Keeps a visible neutral
 * accent when no Daily Color is chosen (including Today's Look), removes the
 * redundant color dot, balances date/clothing sizing, and keeps rating/title
 * in deterministic non-overlapping rows after returning from Wear Log.
 */
(function(){
  'use strict';

  const VERSION='1.5';
  const STYLE_ID='v1325JournalRowPolish2Styles';
  const NEUTRAL_ACCENT='#9f9484';

  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .journal-row.v1325-simple-log-row{border-left:0!important}
      .journal-row.v1325-simple-log-row .v1325-simple-log{position:relative!important;overflow:hidden}
      .journal-row.v1325-simple-log-row .v1325-simple-log:before{
        content:'';position:absolute;left:0;top:0;bottom:0;width:5px;
        background:var(--journal-day-accent,${NEUTRAL_ACCENT});
        border-radius:10px 0 0 10px;z-index:2;pointer-events:none;
      }
      #todayJournalList .journal-row.v1325-simple-log-row .v1325-simple-log:before{
        width:5px;background:var(--journal-day-accent,${NEUTRAL_ACCENT})!important;
      }
      .v1325-row-color-dot{display:none!important}

      .v1325-simple-log{
        grid-template-columns:61px minmax(184px,auto) minmax(0,1fr)!important;
        gap:10px!important;min-height:100px!important;align-items:center!important;
      }
      .v1325-simple-date{width:56px!important;height:72px!important;align-self:center!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
      .v1325-simple-date-month{font-size:.59rem!important;padding:3px 2px 2px!important}
      .v1325-simple-date-day{font-size:1.40rem!important;padding:2px 2px 0!important}
      .v1325-simple-date-year{font-size:.55rem!important;padding:1px 2px 3px!important}
      .v1325-simple-items{min-height:76px!important;gap:6px!important;align-items:center!important}
      .v1325-simple-item{width:62px!important;height:76px!important;flex:0 0 62px!important;border-radius:10px!important}
      .v1325-simple-item img{width:100%!important;height:100%!important;object-fit:contain!important}

      /* Rating and title use two real rows instead of absolute positioning.
         This prevents the stars from landing over the title after the row DOM
         is rebuilt when the Wear Log dialog closes. */
      .v1325-simple-copy{
        position:relative!important;
        align-self:stretch!important;
        display:grid!important;
        grid-template-rows:30px minmax(0,1fr)!important;
        align-content:center!important;
        padding:7px 38px 5px 0!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      .v1325-simple-copy>.v1325-row-rating{
        position:static!important;
        align-self:center!important;
        justify-self:start!important;
        height:30px!important;
        display:flex!important;
        align-items:center!important;
        line-height:1!important;
        margin:0!important;
        text-align:left!important;
        font-size:.82rem!important;
        letter-spacing:-.01em!important;
        white-space:nowrap!important;
      }
      .v1325-row-favorite{top:7px!important}
      .v1325-simple-title{
        align-self:center!important;
        justify-self:stretch!important;
        margin:0!important;
        text-align:left!important;
      }

      /* Rows without a rating should not reserve an empty star line. */
      .v1325-simple-copy:not(:has(>.v1325-row-rating)){
        grid-template-rows:minmax(0,1fr)!important;
        align-items:center!important;
      }

      @media(max-width:520px){
        .v1325-simple-log{
          grid-template-columns:54px 120px minmax(0,1fr)!important;
          gap:5px!important;min-height:96px!important;padding-left:8px!important;padding-right:8px!important;
        }
        .v1325-simple-date{width:50px!important;height:66px!important}
        .v1325-simple-date-month{font-size:.56rem!important}
        .v1325-simple-date-day{font-size:1.28rem!important}
        .v1325-simple-date-year{font-size:.52rem!important}
        .v1325-simple-items{width:120px!important;min-height:72px!important;gap:4px!important;overflow:hidden!important}
        .v1325-simple-item{width:58px!important;height:72px!important;flex-basis:58px!important}
        .v1325-simple-items .v1325-simple-item:nth-child(n+3){display:none!important}
        .v1325-simple-copy{grid-template-rows:28px minmax(0,1fr)!important;padding:7px 34px 5px 0!important}
        .v1325-simple-copy>.v1325-row-rating{height:28px!important;font-size:.77rem!important}
        .v1325-simple-copy:not(:has(>.v1325-row-rating)){grid-template-rows:minmax(0,1fr)!important}
      }
    `;
    document.head.appendChild(style);
  }

  function refreshRows(){
    document.querySelectorAll('.journal-row[data-journal-id].v1325-simple-log-row').forEach(row=>{
      const entry=entryById(row.dataset.journalId);
      const color=entry&&validColor(entry.dayColor)?entry.dayColor:NEUTRAL_ACCENT;
      row.style.setProperty('--journal-day-accent',color);
      row.classList.toggle('v1325-has-day-color',!!entry&&validColor(entry.dayColor));
      row.querySelectorAll('.v1325-row-color-dot').forEach(dot=>dot.remove());
      const summary=row.querySelector('.v1325-simple-log');
      const copy=summary?.querySelector('.v1325-simple-copy');
      const rating=summary?.querySelector('.v1325-row-rating');
      if(copy&&rating&&rating.parentNode!==copy)copy.insertBefore(rating,copy.firstChild);
      if(copy&&rating&&copy.firstElementChild!==rating)copy.insertBefore(rating,copy.firstElementChild);
    });
  }

  function wrapRenderJournal(){
    if(typeof renderJournal!=='function'||renderJournal.__rowPolish2Wrapped)return;
    const render0=renderJournal;
    renderJournal=function(){
      const out=render0.apply(this,arguments);
      requestAnimationFrame(refreshRows);
      setTimeout(refreshRows,25);
      return out;
    };
    renderJournal.__rowPolish2Wrapped=true;
  }

  installStyles();wrapRenderJournal();requestAnimationFrame(refreshRows);setTimeout(refreshRows,25);
  window.AudreyJournalRowPolish2={version:VERSION,refresh:refreshRows};
})();
