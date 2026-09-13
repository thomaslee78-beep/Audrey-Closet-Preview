/* Audrey Closet v13.25 Phase 3 — Journal row polish pass 2
 * Presentation-only overlay for Wear Log rows. Keeps a visible neutral left accent
 * when no daily color is chosen, removes the redundant color dot, balances the
 * calendar against larger clothing thumbnails, and aligns ratings with the title.
 */
(function(){
  'use strict';

  const VERSION='1.1';
  const STYLE_ID='v1325JournalRowPolish2Styles';

  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Always finish the left edge, even before a Daily Color is selected. */
      .journal-row.v1325-simple-log-row{
        border-left-width:5px!important;
        border-left-style:solid!important;
        border-left-color:#a99d8b!important;
      }
      .journal-row.v1325-simple-log-row.v1325-has-day-color{
        border-left-color:var(--journal-day-color)!important;
      }
      .v1325-row-color-dot{display:none!important}

      /* Balance the date tile against larger clothing thumbnails. */
      .v1325-simple-log{
        grid-template-columns:61px minmax(184px,auto) minmax(0,1fr)!important;
        gap:10px!important;
        min-height:100px!important;
        align-items:center!important;
      }
      .v1325-simple-date{
        width:56px!important;
        height:72px!important;
        align-self:center!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
      }
      .v1325-simple-date-month{
        font-size:.59rem!important;
        padding:3px 2px 2px!important;
      }
      .v1325-simple-date-day{
        font-size:1.40rem!important;
        padding:2px 2px 0!important;
      }
      .v1325-simple-date-year{
        font-size:.55rem!important;
        padding:1px 2px 3px!important;
      }
      .v1325-simple-items{
        min-height:76px!important;
        gap:6px!important;
        align-items:center!important;
      }
      .v1325-simple-item{
        width:62px!important;
        height:76px!important;
        flex:0 0 62px!important;
        border-radius:10px!important;
      }
      .v1325-simple-item img{
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
      }

      /* Rating begins at the same left edge as the title; title stays vertically centered. */
      .v1325-simple-copy{
        position:relative!important;
        align-self:stretch!important;
        justify-content:center!important;
        padding:19px 38px 4px 0!important;
      }
      .v1325-simple-copy>.v1325-row-rating{
        position:absolute!important;
        left:0!important;
        right:auto!important;
        top:7px!important;
        line-height:1!important;
        margin:0!important;
        text-align:left!important;
      }
      .v1325-simple-title{
        align-self:stretch!important;
        margin:auto 0!important;
        text-align:left!important;
      }

      @media(max-width:520px){
        .v1325-simple-log{
          grid-template-columns:56px minmax(132px,174px) minmax(0,1fr)!important;
          gap:6px!important;
          min-height:96px!important;
        }
        .v1325-simple-date{
          width:52px!important;
          height:68px!important;
        }
        .v1325-simple-date-month{font-size:.57rem!important}
        .v1325-simple-date-day{font-size:1.32rem!important}
        .v1325-simple-date-year{font-size:.53rem!important}
        .v1325-simple-items{min-height:72px!important;gap:4px!important}
        .v1325-simple-item{
          width:58px!important;
          height:72px!important;
          flex-basis:58px!important;
        }
        .v1325-simple-items .v1325-simple-item:nth-child(n+4){display:none!important}
        .v1325-simple-copy{padding:18px 35px 4px 0!important}
        .v1325-simple-copy>.v1325-row-rating{top:6px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function refreshRows(){
    document.querySelectorAll('.journal-row[data-journal-id].v1325-simple-log-row').forEach(row=>{
      const entry=entryById(row.dataset.journalId);
      row.classList.toggle('v1325-has-day-color',!!entry&&validColor(entry.dayColor));
      row.querySelectorAll('.v1325-row-color-dot').forEach(dot=>dot.remove());
      const summary=row.querySelector('.v1325-simple-log');
      const copy=summary?.querySelector('.v1325-simple-copy');
      const rating=summary?.querySelector('.v1325-row-rating');
      if(copy&&rating&&rating.parentNode!==copy)copy.appendChild(rating);
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

  installStyles();
  wrapRenderJournal();
  requestAnimationFrame(refreshRows);
  setTimeout(refreshRows,25);

  window.AudreyJournalRowPolish2={version:VERSION,refresh:refreshRows};
})();
