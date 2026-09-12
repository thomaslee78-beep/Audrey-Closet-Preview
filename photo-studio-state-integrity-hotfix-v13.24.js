/* Audrey Closet Photo Studio state integrity hotfix
 * Isolated, backward-compatible guard for cross-item Photo Studio state.
 */
(function(){
  'use strict';
  if(typeof openPhotoStudio!=='function'||typeof applyPhotoStudio!=='function')return;

  const VERSION=2;
  let quarantinedSession=null;

  function clone(v){return v?JSON.parse(JSON.stringify(v)):null;}
  function itemId(){return String(document.querySelector('#itemId')?.value||'');}
  function wishId(){return String(document.querySelector('#wishId')?.value||'');}
  function targetId(target){return target==='wish'?wishId():itemId();}
  function listFor(target){return target==='wish'?(state.wishlist||[]):(state.items||[]);}
  function liveRecord(target,id){return listFor(target).find(x=>String(x.id)===String(id))||null;}
  function stateFor(record){return record?.photoStudioState||null;}
  function cutoutFor(saved){return saved?.cutout&&typeof saved.cutout==='object'?saved.cutout:null;}

  function sameLegacyBaseAcrossDifferentSources(target,record){
    const saved=stateFor(record),cutout=cutoutFor(saved),base=cutout?.baseResult;
    if(!base)return false;
    const source=saved?.sourceFingerprint||'';
    return listFor(target).some(other=>{
      if(String(other.id)===String(record.id))return false;
      const os=stateFor(other),oc=cutoutFor(os);
      return !!(oc?.baseResult&&oc.baseResult===base&&(os?.sourceFingerprint||'')!==source);
    });
  }

  function identityMismatch(record){
    const saved=stateFor(record),cutout=cutoutFor(saved);
    if(!saved)return false;
    const id=String(record.id||'');
    const source=saved.sourceFingerprint||'';
    if(saved.ownerItemId&&String(saved.ownerItemId)!==id)return true;
    if(cutout?.ownerItemId&&String(cutout.ownerItemId)!==id)return true;
    if(cutout?.ownerSourceFingerprint&&cutout.ownerSourceFingerprint!==source)return true;
    return false;
  }

  function shouldQuarantine(target,record){
    return !!record&&(identityMismatch(record)||sameLegacyBaseAcrossDifferentSources(target,record));
  }

  function hydrateExactCurrentPhoto(target,record){
    if(target==='wish'){
      wishWorkingPhoto=record.photo||'';
      wishOriginalPhoto=record.originalPhoto||record.photo||'';
      wishStudioState=null;
    }else{
      itemWorkingPhoto=record.photo||'';
      itemOriginalPhoto=record.originalPhoto||record.photo||'';
      itemCutoutApplied=record.photoStudioCutoutApplied ?? (!!record.photo&&!!record.originalPhoto&&record.photo!==record.originalPhoto);
      itemStudioState=null;
      if(typeof showPhoto==='function')showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);
    }
  }

  function stampCurrentState(target,id){
    const saved=target==='wish'?wishStudioState:itemStudioState;
    if(!saved)return;
    saved.ownerItemId=id;
    const source=saved.sourceFingerprint||'';
    const cutout=cutoutFor(saved);
    if(cutout){
      cutout.ownerItemId=id;
      cutout.ownerSourceFingerprint=source;
      cutout.integrityVersion=VERSION;
    }
    saved.integrityVersion=VERSION;
  }

  const innerOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    const resolved=target==='wish'?'wish':'item';
    const id=targetId(resolved),record=liveRecord(resolved,id);
    quarantinedSession=null;
    if(record&&shouldQuarantine(resolved,record)){
      quarantinedSession={target:resolved,id,reason:identityMismatch(record)?'identity-mismatch':'legacy-cross-link'};
      hydrateExactCurrentPhoto(resolved,record);
      console.warn('[Photo Studio integrity] Quarantined cross-item saved state',quarantinedSession);
    }
    const result=await innerOpenPhotoStudio(resolved);
    if(quarantinedSession&&quarantinedSession.target===resolved&&quarantinedSession.id===id){
      const status=document.querySelector('#studioStatus');
      if(status)status.textContent='A mismatched saved edit was isolated. This Studio session starts from the correct Closet photo; apply and save to replace the old edit safely.';
    }
    return result;
  };

  const innerApplyPhotoStudio=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const target=studioTarget==='wish'?'wish':'item';
    const id=targetId(target);
    const result=await innerApplyPhotoStudio();
    stampCurrentState(target,id);
    if(quarantinedSession&&quarantinedSession.target===target&&quarantinedSession.id===id)quarantinedSession=null;
    return result;
  };

  if(typeof saveItem==='function'){
    const innerSaveItem=saveItem;
    saveItem=async function(){
      const id=itemId();
      if(itemStudioState){
        const cutout=cutoutFor(itemStudioState);
        const bad=(itemStudioState.ownerItemId&&String(itemStudioState.ownerItemId)!==id)||
          (cutout?.ownerItemId&&String(cutout.ownerItemId)!==id)||
          (cutout?.ownerSourceFingerprint&&cutout.ownerSourceFingerprint!==(itemStudioState.sourceFingerprint||''));
        if(bad){
          console.error('[Photo Studio integrity] Removed mismatched state before Closet save',{id});
          itemStudioState=null;
          if(typeof toast==='function')toast('Mismatched Photo Studio state was removed; your current photo is safe.');
        }else stampCurrentState('item',id);
      }
      return innerSaveItem();
    };
  }

  window.AudreyPhotoStudioStateIntegrity={
    version:VERSION,
    shouldQuarantineRecord:function(target,record){return shouldQuarantine(target,record);},
    inspect:function(){
      const collisions=[];
      for(const record of (state.items||[]))if(sameLegacyBaseAcrossDifferentSources('item',record))collisions.push(String(record.id));
      return {collisionItemIds:collisions,quarantinedSession:clone(quarantinedSession)};
    }
  };
})();
