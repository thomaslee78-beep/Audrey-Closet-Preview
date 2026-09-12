/* Audrey Closet v13.25 — Closet item/photo context integrity guard.
 * Prevents a stale photo working-copy from being edited or persisted against
 * a different Closet item id.
 */
(function(){
  'use strict';

  let workingItemId='';
  let studioItemId='';
  let lastTappedCardId='';

  function liveItem(id){
    if(!id)return null;
    return state.items.find(x=>String(x.id)===String(id))||null;
  }

  function cloneStudioState(value){
    return value?JSON.parse(JSON.stringify(value)):null;
  }

  function hydrateWorkingContext(item,{refreshPreview=true}={}){
    if(!item)return false;
    workingItemId=String(item.id||'');
    itemWorkingPhoto=item.photo||'';
    itemOriginalPhoto=item.originalPhoto||item.photo||'';
    itemCutoutApplied=item.photoStudioCutoutApplied ?? (!!item.photo&&!!item.originalPhoto&&item.photo!==item.originalPhoto);
    itemStudioState=cloneStudioState(item.photoStudioState);
    if(refreshPreview&&typeof showPhoto==='function'){
      showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);
      if(typeof updateOriginalPhotoButton==='function')updateOriginalPhotoButton();
      if(typeof updatePhotoToolAvailability==='function')updatePhotoToolAvailability();
      if(typeof updateReviewPhotoMenuState==='function')updateReviewPhotoMenuState();
    }
    return true;
  }

  function currentEditorId(){
    return String(document.querySelector('#itemId')?.value||'');
  }

  function ensureEditorMatches(id,{mode='review'}={}){
    const item=liveItem(id);
    if(!item)return false;
    if(currentEditorId()!==String(id)||workingItemId!==String(id)){
      loadItemIntoEditor(item,'',mode);
    }else{
      hydrateWorkingContext(item,{refreshPreview:true});
    }
    return true;
  }

  /* Track every editor load, including swipe navigation, and bind the working
   * photo copy to exactly the item being displayed. */
  const originalLoadItemIntoEditor=loadItemIntoEditor;
  loadItemIntoEditor=function(item=null,preferredCategory='',mode='review'){
    const result=originalLoadItemIntoEditor(item,preferredCategory,mode);
    workingItemId=item?.id?String(item.id):'';
    if(item)hydrateWorkingContext(item,{refreshPreview:true});
    return result;
  };

  /* Capture the exact Closet card that the user tapped. After the normal card
   * handler runs, verify the open dialog really represents that card. This is
   * deliberately inactive during Log Outfit multi-select mode. */
  document.addEventListener('click',event=>{
    const card=event.target.closest?.('#catalogGrid .item-card[data-id]');
    if(!card||document.body.classList.contains('v1325-closet-log-mode'))return;
    lastTappedCardId=String(card.dataset.id||'');
    const expected=lastTappedCardId;
    setTimeout(()=>{
      if(!expected||lastTappedCardId!==expected)return;
      const dialog=document.querySelector('#itemDialog');
      if(!dialog?.open)return;
      if(currentEditorId()!==expected||workingItemId!==expected){
        const item=liveItem(expected);
        if(item){
          loadItemIntoEditor(item,'','review');
          console.warn('[v13.25] Corrected Closet item context mismatch',{
            tapped:expected,editor:currentEditorId(),workingItemId
          });
        }
      }
    },0);
  },true);

  /* Photo Studio receives an explicit item identity. If the editor/photo
   * context is stale, rehydrate from the item currently displayed before the
   * Studio initializes its canvases. */
  const originalOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    if(target!=='wish'){
      const id=currentEditorId();
      const item=liveItem(id);
      if(!item)return toast('Could not find this Closet piece');
      if(workingItemId!==id)hydrateWorkingContext(item,{refreshPreview:true});
      studioItemId=id;
    }else{
      studioItemId='';
    }
    return originalOpenPhotoStudio(target);
  };

  /* Never apply a Studio result to a different item than the one that opened
   * the Studio. This protects the working copy before the user can save it. */
  const originalApplyPhotoStudio=applyPhotoStudio;
  applyPhotoStudio=async function(){
    if(studioTarget==='item'){
      const id=currentEditorId();
      if(!id||!studioItemId||id!==studioItemId){
        console.error('[v13.25] Blocked Photo Studio cross-item apply',{
          editor:id,studioItemId,workingItemId
        });
        toast('Photo Studio item changed — no photo was applied');
        return;
      }
      if(workingItemId!==id){
        console.error('[v13.25] Blocked Photo Studio stale working context',{
          editor:id,studioItemId,workingItemId
        });
        toast('Photo context mismatch — no photo was applied');
        return;
      }
    }
    return originalApplyPhotoStudio();
  };

  /* Final persistence barrier. A stale working photo must never overwrite a
   * different Closet item's thumbnail/data. On mismatch, reload the correct
   * item and stop the save rather than risking corruption. */
  const originalSaveItem=saveItem;
  saveItem=async function(){
    const id=currentEditorId();
    if(id&&workingItemId!==id){
      console.error('[v13.25] Blocked cross-item Closet save',{
        editor:id,workingItemId,studioItemId,lastTappedCardId
      });
      const item=liveItem(id);
      if(item)loadItemIntoEditor(item,'','edit');
      toast('Item/photo mismatch prevented — please try the edit again');
      return false;
    }
    return originalSaveItem();
  };

  /* Existing Review button uses the same strict sync before its click handler. */
  document.addEventListener('click',event=>{
    if(!event.target.closest?.('#reviewStudioBtn'))return;
    const id=currentEditorId();
    const item=liveItem(id);
    if(item&&workingItemId!==id)hydrateWorkingContext(item,{refreshPreview:true});
  },true);

  window.AudreyItemStudioContextFix={
    sync:()=>ensureEditorMatches(currentEditorId(),{mode:itemDialogMode==='edit'?'edit':'review'}),
    status:()=>({editorId:currentEditorId(),workingItemId,studioItemId,lastTappedCardId})
  };
})();
