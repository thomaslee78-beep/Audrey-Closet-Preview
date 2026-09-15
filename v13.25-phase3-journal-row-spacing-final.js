/* Audrey Closet v13.25 Phase 3 — Journal row final spacing
 * Layout40 micro-polish layered after the consolidated row renderer.
 * Keeps ratings anchored at the upper-left while centering the title in the
 * remaining row area, with enough clearance to stay below the favorite heart.
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
        margin-bottom:5px!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating){
        display:grid!important;
        grid-template-rows:18px 1fr!important;
        align-content:stretch!important;
        padding-top:3px!important;
        padding-bottom:6px!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating) .v1325-row-rating{
        grid-row:1!important;
        align-self:start!important;
        justify-self:start!important;
        margin:0!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating) .v1325-simple-title{
        grid-row:2!important;
        align-self:center!important;
        justify-self:stretch!important;
        margin:7px 0 0!important;
        padding-right:2px!important;
        transform:none!important;
      }
      .journal-row.v1325-final-row .v1325-simple-copy:not(:has(.v1325-row-rating)) .v1325-simple-title{
        margin-top:auto!important;
        margin-bottom:auto!important;
        transform:none!important;
      }
      @media(max-width:520px){
        .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating){
          grid-template-rows:17px 1fr!important;
          padding-top:2px!important;
          padding-bottom:5px!important;
        }
        .journal-row.v1325-final-row .v1325-simple-copy:has(.v1325-row-rating) .v1325-simple-title{
          margin-top:6px!important;
          align-self:center!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  install();
  window.AudreyJournalRowFinalSpacing={version:'1.2',refresh:install};
})();
