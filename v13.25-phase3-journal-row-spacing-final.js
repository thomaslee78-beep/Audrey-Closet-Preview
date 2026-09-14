/* Audrey Closet v13.25 Phase 3 — Journal row final spacing
 * Layout39 micro-polish layered after the consolidated row renderer.
 * Keeps ratings anchored at the upper-left while seating the title lower in the
 * row, visually aligned toward the bottom of the clothing thumbnails.
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
        margin-bottom:6px!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating) .v1325-simple-title{
        margin-top:auto!important;
        margin-bottom:5px!important;
        transform:none!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:not(:has(.v1325-row-rating)) .v1325-simple-title{
        margin-top:auto!important;
        margin-bottom:auto!important;
        transform:none!important;
      }
      @media(max-width:520px){
        .journal-row.v1325-final-row .v1325-row-rating{
          margin-bottom:5px!important;
        }
        .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating) .v1325-simple-title{
          margin-top:auto!important;
          margin-bottom:4px!important;
          transform:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  window.AudreyJournalRowFinalSpacing={version:'1.1',refresh:install};
})();
