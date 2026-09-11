/* Audrey Closet v13.23.6.3 — accepted Photo Studio bug fixes */
(function(){
  'use strict';

  /* Allow manual Erase/Restore while Original is selected. Original still starts
   * from the pristine captured source; only the user's manual masks are layered
   * on top, so automatic Quick/Clean alpha never becomes part of Original.
   */
  rebuildStudioWorkCanvas=function(){
    if(!studioBaseCanvas)return;
    studioWorkCanvas=newStudioCanvas();
    const ctx=studioWorkCanvas.getContext('2d');
    ctx.drawImage(studioBaseCanvas,0,0);

    if(studioManualRestoreMask){
      const patch=newStudioCanvas(),pc=patch.getContext('2d');
      pc.drawImage(studioOriginalCanvas||studioBaseCanvas,0,0);
      pc.globalCompositeOperation='destination-in';
      pc.drawImage(studioManualRestoreMask,0,0);
      ctx.drawImage(patch,0,0);
    }
    if(studioManualEraseMask){
      ctx.save();
      ctx.globalCompositeOperation='destination-out';
      ctx.drawImage(studioManualEraseMask,0,0);
      ctx.restore();
    }
    applyStudioAdjustmentsAndRender();
  };

  /* Keep tone/detail adjustments scoped to the current source photo. Reopen the
   * same source with its saved values; new/replacement photos start neutral.
   */
  const originalOpenPhotoStudioV132363=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const nextTarget=target==='wish'?'wish':'item';
    const original=nextTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto;
    const savedState=nextTarget==='wish'?wishStudioState:itemStudioState;
    const saved=savedState&&savedState.sourceFingerprint===photoFingerprint(original||'')?savedState:null;

    studioExposure=saved&&Number.isFinite(Number(saved.exposure))?Number(saved.exposure):0;
    studioContrast=saved&&Number.isFinite(Number(saved.contrast))?Number(saved.contrast):0;
    studioHighlights=saved&&Number.isFinite(Number(saved.highlights))?Number(saved.highlights):0;

    const result=await originalOpenPhotoStudioV132363.apply(this,arguments);
    syncStudioAdjustmentControls();
    return result;
  };

  window.__audreyPhotoStudioBugfixV132363=true;
})();
