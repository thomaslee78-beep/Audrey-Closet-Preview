/* Audrey Closet v13.25 — regression guard for Closet item -> Photo Studio context.
 * Review mode is read-only, so before its Photo Studio action opens we rehydrate
 * the working photo context from the exact item id currently displayed.
 */
(function(){
  'use strict';

  function syncCurrentReviewItemToStudio(){
    const id=document.querySelector('#itemId')?.value;
    if(!id)return;
    const live=state.items.find(x=>String(x.id)===String(id));
    if(!live)return;

    itemWorkingPhoto=live.photo||'';
    itemOriginalPhoto=live.originalPhoto||live.photo||'';
    itemCutoutApplied=live.photoStudioCutoutApplied ?? (!!live.photo&&!!live.originalPhoto&&live.photo!==live.originalPhoto);
    itemStudioState=live.photoStudioState?JSON.parse(JSON.stringify(live.photoStudioState)):null;
  }

  document.addEventListener('click',event=>{
    if(!event.target.closest?.('#reviewStudioBtn'))return;
    syncCurrentReviewItemToStudio();
  },true);

  window.AudreyItemStudioContextFix={sync:syncCurrentReviewItemToStudio};
})();
