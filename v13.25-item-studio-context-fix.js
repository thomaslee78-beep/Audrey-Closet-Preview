/* Audrey Closet v13.25 — Closet item/photo context integrity guard.
 * Prevents a stale photo working-copy from being edited or persisted against
 * a different saved Closet item, while preserving the unsaved new-item flow.
 */
(function(){
  'use strict';

  const NEW_ITEM_SESSION='__audrey_new_item__';
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

  function isUnsavedNewItem(){
    return !currentEditorId()&&itemDialogMode==='create';
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

  /* Track every editor load, including swipe navigation. A null item is the
   * legitimate create flow and therefore resets saved-item identity only; the
   * normal app remains responsible for the new working photo captured/uploaded
   * after the form opens. */
  const originalLoadItemIntoEditor=loadItemIntoEditor;
  loadItemIntoEditor=function(item=null,preferredCategory='',mode='review'){
    const result=originalLoadItemIntoEditor(item,preferredCategory,mode);
    workingItemId=item?.id?String(item.id):'';
    studioItemId='';
    if(item)hydrateWorkingContext(item,{refreshPreview:true});
    return result;
  };

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

  /* Existing saved pieces receive strict identity binding. A brand-new item has
   * no persisted id by design; give that draft a temporary Studio-session id so
   * camera/library photo -> Photo Studio continues to work before Save Piece. */
  const originalOpenPhotoStudio=openPhotoStudio;
  openPhotoStudio=async function(target='item'){
    if(target!=='wish'){
      const id=currentEditorId();
      if(!id&&isUnsavedNewItem()){
        if(!itemWorkingPhoto)return originalOpenPhotoStudio(target);
        workingItemId='';
        studioItemId=NEW_ITEM_SESSION;
        return originalOpenPhotoStudio(target);
      }
      const item=liveItem(id);
      if(!item)return toast('Could not find this Closet piece');
      if(workingItemId!==id)hydrateWorkingContext(item,{refreshPreview:true});
      studioItemId=id;
    }else{
      studioItemId='';
    }
    return originalOpenPhotoStudio(target);
  };

  /* Saved items must keep an exact id match. Unsaved create sessions are safe
   * to apply while #itemId is still blank because there is no persisted record
   * that could be overwritten; Save Piece will create the record afterward. */
  const originalApplyPhotoStudio=applyPhotoStudio;
  applyPhotoStudio=async function(){
    if(studioTarget==='item'){
      const id=currentEditorId();
      const unsavedSession=studioItemId===NEW_ITEM_SESSION&&!id&&itemDialogMode==='create';
      if(!unsavedSession){
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
    }
    return originalApplyPhotoStudio();
  };

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

  document.addEventListener('click',event=>{
    if(!event.target.closest?.('#reviewStudioBtn'))return;
    const id=currentEditorId();
    const item=liveItem(id);
    if(item&&workingItemId!==id)hydrateWorkingContext(item,{refreshPreview:true});
  },true);

  window.AudreyItemStudioContextFix={
    sync:()=>ensureEditorMatches(currentEditorId(),{mode:itemDialogMode==='edit'?'edit':'review'}),
    status:()=>({editorId:currentEditorId(),workingItemId,studioItemId,lastTappedCardId,isUnsavedNewItem:isUnsavedNewItem()})
  };
})();
