/* Audrey Closet v13.25 Phase 3 — Journal row final spacing
 * Layout38 micro-polish layered after the consolidated row renderer.
 * Keeps ratings anchored at the upper-left while giving the title a little
 * more breathing room below so it does not visually run under the favorite.
 */
(function(){
  'use strict';
  const STYLE_ID='v1325JournalRowFinalSpacingStyles';
  function install(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .journal-row.v1325-final-row .v1325-row-rating{
        margin-bottom:8px!important;
      }
      .journal-row.v1325-final-row .v1325-simple-title{
        transform:translateY(1px)!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:not(:has(.v1325-row-rating)) .v1325-simple-title{
        transform:none!important;
      }
      @media(max-width:520px){
        .journal-row.v1325-final-row .v1325-row-rating{
          margin-bottom:7px!important;
        }
        .journal-row.v1325-final-row .v1325-simple-title{
          transform:translateY(1px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  window.AudreyJournalRowFinalSpacing={version:'1.0',refresh:install};
})();
