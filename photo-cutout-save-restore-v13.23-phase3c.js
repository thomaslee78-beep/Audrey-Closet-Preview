/* Audrey Closet v13.23 Cutout Phase 3C — item save/reopen bridge.
 * Guarantees the canonical Phase 3A cutout object is stamped onto the persisted
 * Closet/Wishlist record after the core save completes. This prevents a saved
 * Guided item from reopening as a fresh Easy workflow with reset guide geometry.
 */
(function(){
'use strict';

const stateApi=()=>window.__audreyCutoutState;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

function compatibleStudioState(base,cutout){
  const raw=(base&&typeof base==='object')?clone(base):{};
  return {
    ...raw,
    mode:cutout?.algorithm||raw.mode||'original',
    cutoutMethod:cutout?.method||raw.cutoutMethod||'standard',
    eraseMask:cutout?.eraseMask||raw.eraseMask||'',
    restoreMask:cutout?.restoreMask||raw.restoreMask||'',
    cutout:clone(cutout)
  };
}

async function restampSavedItem(target,id){
  const api=stateApi();if(!api||!id)return false;
  const cutout=api.getState?.(target);if(!cutout)return false;
  if(target==='wish'){
    const saved=(state.wishlist||[]).find(x=>x.id===id);if(!saved)return false;
    saved.photoStudioState=compatibleStudioState(saved.photoStudioState||wishStudioState,cutout);
    wishStudioState=clone(saved.photoStudioState);
  }else{
    const saved=(state.items||[]).find(x=>x.id===id);if(!saved)return false;
    saved.photoStudioState=compatibleStudioState(saved.photoStudioState||itemStudioState,cutout);
    itemStudioState=clone(saved.photoStudioState);
  }
  if(typeof saveState==='function')await saveState();
  return true;
}

const saveItem0=saveItem;
saveItem=async function(){
  const idBefore=document.getElementById('itemId')?.value||'';
  const cutoutBefore=stateApi()?.getState?.('item')||null;
  const out=await saveItem0.apply(this,arguments);
  const id=idBefore||document.getElementById('itemId')?.value||'';
  // The core save may rebuild itemStudioState; restore the canonical snapshot
  // captured at the save boundary before stamping the persisted item.
  if(cutoutBefore)stateApi()?.persist?.('item',cutoutBefore);
  await restampSavedItem('item',id);
  return out;
};

const saveWish0=saveWish;
saveWish=async function(){
  const idBefore=document.getElementById('wishId')?.value||'';
  const cutoutBefore=stateApi()?.getState?.('wish')||null;
  const out=await saveWish0.apply(this,arguments);
  const id=idBefore||document.getElementById('wishId')?.value||'';
  if(cutoutBefore)stateApi()?.persist?.('wish',cutoutBefore);
  await restampSavedItem('wish',id);
  return out;
};

window.__audreyCutoutSaveRestore={phase:'3C-reopen1',restampSavedItem};
})();
