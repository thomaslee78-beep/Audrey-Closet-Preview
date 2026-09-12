/* Audrey Closet Photo Studio reopen snapshot hotfix
 * Isolated from v13.25 feature work so it can be promoted independently.
 *
 * Goals:
 * 1) Resolve the exact live Closet/Wishlist record before any reopen decision.
 * 2) Older edited items reopen from the exact flattened saved photo instead of
 *    rerunning background removal from originalPhoto.
 * 3) New Photo Studio applies persist the exact 720x720 base/cutout snapshot
 *    in photoStudioState.basePhoto so future reopens are reproducible.
 */
(function(){
  'use strict';
  if(typeof openPhotoStudio!=='function'||typeof applyPhotoStudio!=='function')return;

  const HOTFIX_VERSION=2;
  const originalOpenPhotoStudio=openPhotoStudio;
  const originalApplyPhotoStudio=applyPhotoStudio;

  function clone(value){return value?JSON.parse(JSON.stringify(value)):null;}
  function currentId(target){return String(document.querySelector(target==='wish'?'#wishId':'#itemId')?.value||'');}
  function liveRecord(target,id){
    const list=target==='wish'?state.wishlist:state.items;
    return id?list.find(x=>String(x.id)===String(id))||null:null;
  }
  function syncGlobalsFromLive(target){
    const id=currentId(target),live=liveRecord(target,id);
    if(!live)return {id,live:null};
    if(target==='wish'){
      wishWorkingPhoto=live.photo||'';
      wishOriginalPhoto=live.originalPhoto||live.photo||'';
      wishStudioState=clone(live.photoStudioState);
    }else{
      itemWorkingPhoto=live.photo||'';
      itemOriginalPhoto=live.originalPhoto||live.photo||'';
      itemCutoutApplied=live.photoStudioCutoutApplied ?? (!!live.photo&&!!live.originalPhoto&&live.photo!==live.originalPhoto);
      itemStudioState=clone(live.photoStudioState);
      if(typeof showPhoto==='function')showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);
    }
    return {id,live};
  }
  function targetState(target){
    if(target==='wish')return {working:wishWorkingPhoto,original:wishOriginalPhoto,saved:wishStudioState};
    return {working:itemWorkingPhoto,original:itemOriginalPhoto,saved:itemStudioState};
  }
  function validSavedState(saved,original,id){
    if(!saved||saved.sourceFingerprint!==photoFingerprint(original||''))return false;
    if(saved.baseItemId&&String(saved.baseItemId)!==String(id||''))return false;
    return true;
  }
  async function canvasFromExactSnapshot(src){
    const img=await imageFrom(src),c=newStudioCanvas(),ctx=c.getContext('2d');
    ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return c;
  }

  openPhotoStudio=async function(target='item'){
    const resolved=target==='wish'?'wish':'item';
    const {id}=syncGlobalsFromLive(resolved);
    const ctx=targetState(resolved);
    const saved=validSavedState(ctx.saved,ctx.original,id)?ctx.saved:null;

    if(saved?.basePhoto){
      const realApplyStudioMode=applyStudioMode;
      let usedSnapshot=false;
      applyStudioMode=async function(mode,{showBusy=true}={}){
        if(!usedSnapshot&&mode===saved.mode){
          usedSnapshot=true;studioMode=mode;studioLegacyMode=false;
          $$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
          try{
            studioBaseCanvas=await canvasFromExactSnapshot(saved.basePhoto);
            rebuildStudioWorkCanvas();
            if(showBusy)$('#studioStatus').textContent='Saved Photo Studio cutout restored.';
            return;
          }catch(err){console.warn('[Photo Studio hotfix] Exact base snapshot restore failed; regenerating.',err);}
        }
        return realApplyStudioMode(mode,{showBusy});
      };
      try{return await originalOpenPhotoStudio(resolved);}finally{applyStudioMode=realApplyStudioMode;}
    }

    if(saved&&ctx.working&&ctx.original&&ctx.working!==ctx.original){
      /* Bypass saved reconstruction for older edits. Core legacy mode uses the
       * exact flattened working photo, which is what the Closet card displays. */
      if(resolved==='wish')wishStudioState=null;else itemStudioState=null;
      try{
        const result=await originalOpenPhotoStudio(resolved);
        const status=$('#studioStatus');
        if(status)status.textContent='Existing saved edit loaded exactly. Choose Quick or Clean only if you want to rebuild the cutout.';
        return result;
      }finally{
        if(resolved==='wish')wishStudioState=clone(saved);else itemStudioState=clone(saved);
      }
    }

    return originalOpenPhotoStudio(resolved);
  };

  applyPhotoStudio=async function(){
    const target=studioTarget==='wish'?'wish':'item';
    const id=currentId(target);
    let basePhoto='';
    try{if(studioBaseCanvas&&!studioLegacyMode)basePhoto=studioBaseCanvas.toDataURL('image/png');}
    catch(err){console.warn('[Photo Studio hotfix] Could not capture exact base snapshot.',err);}

    const result=await originalApplyPhotoStudio();
    if(basePhoto&&!studioLegacyMode){
      const stateObj=target==='wish'?wishStudioState:itemStudioState;
      if(stateObj){
        stateObj.basePhoto=basePhoto;
        stateObj.baseSnapshotVersion=HOTFIX_VERSION;
        stateObj.baseItemId=id||'';
      }
    }
    return result;
  };

  window.AudreyPhotoStudioReopenHotfix={version:HOTFIX_VERSION};
})();
