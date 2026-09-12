/* Audrey Closet Photo Studio reopen snapshot hotfix
 * Isolated from v13.25 feature work so it can be promoted independently.
 *
 * Goals:
 * 1) Older edited items reopen from the exact flattened saved photo instead of
 *    rerunning background removal from originalPhoto.
 * 2) New Photo Studio applies persist the exact 720x720 base/cutout snapshot
 *    in photoStudioState.basePhoto.
 * 3) Reopens with basePhoto restore that exact base before reapplying saved
 *    erase/restore masks and placement settings.
 */
(function(){
  'use strict';

  if(typeof openPhotoStudio!=='function'||typeof applyPhotoStudio!=='function')return;

  const HOTFIX_VERSION=1;
  const originalOpenPhotoStudio=openPhotoStudio;
  const originalApplyPhotoStudio=applyPhotoStudio;

  function clone(value){return value?JSON.parse(JSON.stringify(value)):null;}

  function validSavedState(saved,original){
    return !!(saved&&saved.sourceFingerprint===photoFingerprint(original||''));
  }

  async function canvasFromExactSnapshot(src){
    const img=await imageFrom(src);
    const c=newStudioCanvas();
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,c.width,c.height);
    ctx.drawImage(img,0,0,c.width,c.height);
    return c;
  }

  function currentTargetState(target){
    if(target==='wish')return {working:wishWorkingPhoto,original:wishOriginalPhoto,saved:wishStudioState};
    return {working:itemWorkingPhoto,original:itemOriginalPhoto,saved:itemStudioState};
  }

  /* Reopen policy:
   * - exact basePhoto available: let normal saved-state restore run, but replace
   *   the one regeneration call with that exact stored base.
   * - older saved state without basePhoto: intentionally open the already-saved
   *   flattened photo in legacy mode. This makes Studio match the Closet preview
   *   exactly and avoids silently regenerating a dirtier cutout.
   */
  openPhotoStudio=async function(target='item'){
    const resolvedTarget=target==='wish'?'wish':'item';
    const ctx=currentTargetState(resolvedTarget);
    const saved=validSavedState(ctx.saved,ctx.original)?ctx.saved:null;

    if(saved?.basePhoto){
      const realApplyStudioMode=applyStudioMode;
      let usedSnapshot=false;
      applyStudioMode=async function(mode,{showBusy=true}={}){
        if(!usedSnapshot&&mode===saved.mode){
          usedSnapshot=true;
          studioMode=mode;
          studioLegacyMode=false;
          $$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
          try{
            studioBaseCanvas=await canvasFromExactSnapshot(saved.basePhoto);
            rebuildStudioWorkCanvas();
            if(showBusy)$('#studioStatus').textContent='Saved Photo Studio cutout restored.';
            return;
          }catch(err){
            console.warn('[Photo Studio hotfix] Exact base snapshot restore failed; regenerating.',err);
          }
        }
        return realApplyStudioMode(mode,{showBusy});
      };
      try{
        return await originalOpenPhotoStudio(resolvedTarget);
      }finally{
        applyStudioMode=realApplyStudioMode;
      }
    }

    if(saved&&ctx.working&&ctx.original&&ctx.working!==ctx.original){
      /* Force the existing legacy/exact-photo branch in core openPhotoStudio.
       * Preserve the stored state in memory; it is only bypassed for this open.
       */
      if(resolvedTarget==='wish')wishStudioState=null;
      else itemStudioState=null;
      try{
        const result=await originalOpenPhotoStudio(resolvedTarget);
        const status=$('#studioStatus');
        if(status)status.textContent='Existing saved edit loaded exactly. Choose Quick or Clean only if you want to rebuild the cutout.';
        return result;
      }finally{
        if(resolvedTarget==='wish')wishStudioState=clone(saved);
        else itemStudioState=clone(saved);
      }
    }

    return originalOpenPhotoStudio(resolvedTarget);
  };

  /* Capture the exact generated base before core apply flattens the final image.
   * Core apply creates a fresh photoStudioState object, so append snapshot data
   * after it succeeds. saveItem/saveWish will then persist it normally.
   */
  applyPhotoStudio=async function(){
    const target=studioTarget==='wish'?'wish':'item';
    let basePhoto='';
    try{
      if(studioBaseCanvas&&!studioLegacyMode){
        basePhoto=studioBaseCanvas.toDataURL('image/png');
      }
    }catch(err){
      console.warn('[Photo Studio hotfix] Could not capture exact base snapshot.',err);
    }

    const result=await originalApplyPhotoStudio();
    if(basePhoto&&!studioLegacyMode){
      const stateObj=target==='wish'?wishStudioState:itemStudioState;
      if(stateObj){
        stateObj.basePhoto=basePhoto;
        stateObj.baseSnapshotVersion=HOTFIX_VERSION;
      }
    }
    return result;
  };

  window.AudreyPhotoStudioReopenHotfix={version:HOTFIX_VERSION};
})();
