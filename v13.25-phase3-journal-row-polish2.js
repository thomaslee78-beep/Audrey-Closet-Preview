/* Audrey Closet v13.25 Phase 3 — Journal row polish pass 2
 * Presentation-only overlay for Wear Log rows. Keeps a neutral left accent when
 * no daily color is chosen, removes the redundant color dot, slightly reduces
 * the calendar footprint, and enlarges clothing thumbnails.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalRowPolish2Styles';

  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .journal-row.v1325-simple-log-row{
        border-left-color:#c9bda9!important;
      }
      .journal-row.v1325-simple-log-row.v1325-has-day-color{
        border-left-color:var(--journal-day-color)!important;
      }
      .v1325-row-color-dot{display:none!important}

      .v1325-simple-log{
        grid-template-columns:66px minmax(174px,auto) minmax(0,1fr)!important;
        gap:11px!important;
        min-height:98px!important;
      }
      .v1325-simple-date{
        width:61px!important;
      }
      .v1325-simple-date-month{
        font-size:.63rem!important;
        padding:3px 2px 2px!important;
      }
      .v1325-simple-date-day{
        font-size:1.55rem!important;
        padding:2px 2px 0!important;
      }
      .v1325-simple-date-year{
        font-size:.58rem!important;
        padding:1px 2px 4px!important;
      }
      .v1325-simple-items{
        min-height:72px!important;
        gap:6px!important;
      }
      .v1325-simple-item{
        width:58px!important;
        height:72px!important;
        flex:0 0 58px!important;
        border-radius:10px!important;
      }
      .v1325-simple-item img{
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
      }

      @media(max-width:520px){
        .v1325-simple-log{
          grid-template-columns:61px minmax(122px,162px) minmax(0,1fr)!important;
          gap:7px!important;
          min-height:94px!important;
        }
        .v1325-simple-date{width:56px!important}
        .v1325-simple-date-day{font-size:1.44rem!important}
        .v1325-simple-items{min-height:68px!important;gap:4px!important}
        .v1325-simple-item{
          width:54px!important;
          height:68px!important;
          flex-basis:54px!important;
        }
        .v1325-simple-items .v1325-simple-item:nth-child(n+4){display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function refreshRows(){
    document.querySelectorAll('.journal-row[data-journal-id].v1325-simple-log-row').forEach(row=>{
      const entry=entryById(row.dataset.journalId);
      row.classList.toggle('v1325-has-day-color',!!entry&&validColor(entry.dayColor));
      row.querySelectorAll('.v1325-row-color-dot').forEach(dot=>dot.remove());
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
