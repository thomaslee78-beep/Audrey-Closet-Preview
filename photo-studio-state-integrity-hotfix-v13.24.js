/* Audrey Closet Photo Studio state integrity hotfix
 * Late-installed after the v13.24 release bootstrap so it remains the final
 * outermost Photo Studio guard. This is required because the production cutout
 * modules asynchronously wrap openPhotoStudio after window.load.
 */
(function(){
  'use strict';
  const VERSION=3;
  let installed=false;
  let quarantinedSession=null;

  const clone=v=>v?JSON.parse(JSON.stringify(v)):null;
  const itemId=()=>String(document.querySelector('#itemId')?.value||'');
  const wishId=()=>String(document.querySelector('#wishId')?.value||'');
  const targetId=t=>t==='wish'?wishId():itemId();
  const listFor=t=>t==='wish'?(state.wishlist||[]):(state.items||[]);
  const liveRecord=(t,id)=>listFor(t).find(x=>String(x.id)===String(id))||null;
  const stateFor=r=>r?.photoStudioState||null;
  const cutoutFor=s=>s?.cutout&&typeof s.cutout==='object'?s.cutout:null;

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
    const id=String(record.id||''),source=saved.sourceFingerprint||'';
    if(saved.ownerItemId&&String(saved.ownerItemId)!==id)return true;
    if(cutout?.ownerItemId&&String(cutout.ownerItemId)!==id)return true;
    if(cutout?.ownerSourceFingerprint&&cutout.ownerSourceFingerprint!==source)return true;
    return false;
  }

  function shouldQuarantine(target,record){
    return !!record&&(identityMismatch(record)||sameLegacyBaseAcrossDifferentSources(target,record));
  }

  function clearCanonicalCutout(target){
    try{window.__audreyCutoutState?.resetTarget?.(target);}catch(err){console.warn('[Photo Studio integrity] canonical reset failed',err);}
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
    clearCanonicalCutout(target);
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

  function install(){
    if(installed)return;
    if(typeof openPhotoStudio!=='function'||typeof applyPhotoStudio!=='function')return;
    installed=true;

    const open0=openPhotoStudio;
    openPhotoStudio=async function(target='item'){
      const resolved=target==='wish'?'wish':'item';
      const id=targetId(resolved),record=liveRecord(resolved,id);
      quarantinedSession=null;
      if(record&&shouldQuarantine(resolved,record)){
        quarantinedSession={target:resolved,id,reason:identityMismatch(record)?'identity-mismatch':'legacy-cross-link'};
        hydrateExactCurrentPhoto(resolved,record);
        console.warn('[Photo Studio integrity] Late quarantine active',quarantinedSession);
      }
      const out=await open0.apply(this,arguments);
      if(quarantinedSession&&quarantinedSession.target===resolved&&quarantinedSession.id===id){
        const status=document.querySelector('#studioStatus');
        if(status)status.textContent='A cross-linked saved edit was isolated. Photo Studio is using this Closet piece only.';
      }
      return out;
    };

    const apply0=applyPhotoStudio;
    applyPhotoStudio=async function(){
      const target=studioTarget==='wish'?'wish':'item',id=targetId(target);
      const out=await apply0.apply(this,arguments);
      stampCurrentState(target,id);
      if(quarantinedSession?.target===target&&quarantinedSession?.id===id)quarantinedSession=null;
      return out;
    };

    if(typeof saveItem==='function'){
      const save0=saveItem;
      saveItem=async function(){
        const id=itemId();
        if(itemStudioState){
          const c=cutoutFor(itemStudioState);
          const bad=(itemStudioState.ownerItemId&&String(itemStudioState.ownerItemId)!==id)||
            (c?.ownerItemId&&String(c.ownerItemId)!==id)||
            (c?.ownerSourceFingerprint&&c.ownerSourceFingerprint!==(itemStudioState.sourceFingerprint||''));
          if(bad){
            console.error('[Photo Studio integrity] Removed mismatched state before Closet save',{id});
            itemStudioState=null;clearCanonicalCutout('item');
            if(typeof toast==='function')toast('Mismatched Photo Studio state was removed; your current photo is safe.');
          }else stampCurrentState('item',id);
        }
        return save0.apply(this,arguments);
      };
    }

    window.AudreyPhotoStudioStateIntegrity={
      version:VERSION,
      installedAfterRelease:true,
      shouldQuarantineRecord:(target,record)=>shouldQuarantine(target,record),
      inspect:function(){
        const collisions=[];
        for(const record of (state.items||[]))if(sameLegacyBaseAcrossDifferentSources('item',record))collisions.push(String(record.id));
        return {collisionItemIds:collisions,quarantinedSession:clone(quarantinedSession),installed};
      }
    };
    console.info('[Photo Studio integrity] v3 installed after release bootstrap');
  }

  async function installAfterRelease(){
    try{
      const release=window.AUDREY_RELEASE_V1324;
      if(release?.readyPromise)await release.readyPromise;
      else{
        await new Promise(r=>setTimeout(r,0));
        if(window.AUDREY_RELEASE_V1324?.readyPromise)await window.AUDREY_RELEASE_V1324.readyPromise;
      }
    }catch(err){console.error('[Photo Studio integrity] release wait failed',err);}
    install();
  }

  if(document.readyState==='complete')installAfterRelease();
  else window.addEventListener('load',installAfterRelease,{once:true});
})();
