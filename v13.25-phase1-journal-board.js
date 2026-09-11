/* Audrey Closet v13.25 Phase 1 — Journal -> Outfit Board bridge
 * Preview-first bridge for Journal detail -> Outfit Board.
 */
(function(){
  'use strict';

  const BUTTON_ID='journalOpenBoardBtn';

  function validJournalClosetItems(entry){
    if(!entry||!Array.isArray(entry.itemIds))return [];
    const seen=new Set();
    return entry.itemIds.map(itemId=>{
      if(!itemId||seen.has(itemId))return null;
      seen.add(itemId);
      return state.items.find(item=>item.id===itemId)||null;
    }).filter(Boolean);
  }

  function boardSize(){
    const board=document.querySelector('#outfitBoard');
    return {
      width:Math.max(320,Number(board?.clientWidth)||390),
      height:Math.max(360,Number(board?.clientHeight)||420)
    };
  }

  function categoryKey(item){
    const raw=String(item?.category||'').trim().toLowerCase();
    if(raw==='tops')return 'tops';
    if(raw==='bottoms')return 'bottoms';
    if(raw==='dresses')return 'dresses';
    if(raw==='outerwear')return 'outerwear';
    if(raw==='shoes')return 'shoes';
    if(raw==='accessories')return 'accessories';
    return 'misc';
  }

  const ZONES={
    tops:[{x:.50,y:.24},{x:.34,y:.25},{x:.66,y:.25},{x:.50,y:.34}],
    bottoms:[{x:.50,y:.62},{x:.36,y:.63},{x:.64,y:.63},{x:.50,y:.72}],
    dresses:[{x:.50,y:.48},{x:.34,y:.49},{x:.66,y:.49}],
    outerwear:[{x:.78,y:.42},{x:.22,y:.42},{x:.82,y:.58},{x:.18,y:.58}],
    shoes:[{x:.27,y:.86},{x:.73,y:.86},{x:.50,y:.88}],
    accessories:[{x:.14,y:.18},{x:.86,y:.18},{x:.12,y:.52},{x:.88,y:.52},{x:.18,y:.76},{x:.82,y:.76}],
    misc:[{x:.25,y:.70},{x:.75,y:.70},{x:.50,y:.78},{x:.50,y:.48}]
  };

  const SIZE={
    tops:{w:.34,h:.31},bottoms:{w:.32,h:.35},dresses:{w:.39,h:.54},
    outerwear:{w:.34,h:.38},shoes:{w:.25,h:.18},accessories:{w:.20,h:.20},misc:{w:.28,h:.26}
  };
  const LAYER={bottoms:2,tops:3,dresses:3,outerwear:4,shoes:5,accessories:6,misc:4};

  function deterministicRotation(category,index){
    if(category==='accessories')return [0,-6,6,-4,4,0][index%6];
    if(category==='outerwear')return [0,3,-3,0][index%4];
    if(category==='shoes')return [0,-3,3][index%3];
    return 0;
  }

  function layoutJournalItems(items,width,height){
    const counters={};
    return items.map((item,order)=>{
      const category=categoryKey(item);
      const index=counters[category]||0;
      counters[category]=index+1;
      const zones=ZONES[category]||ZONES.misc;
      const zone=zones[index%zones.length];
      const cycle=Math.floor(index/zones.length);
      const size=SIZE[category]||SIZE.misc;
      const w=Math.round(Math.max(76,Math.min(width*.48,width*size.w*(cycle?.9:1))));
      const h=Math.round(Math.max(70,Math.min(height*.58,height*size.h*(cycle?.9:1))));
      const cycleShift=(cycle%3-1)*Math.min(24,width*.05);
      const x=Math.round(Math.max(4,Math.min(width-w-4,width*zone.x-w/2+cycleShift)));
      const y=Math.round(Math.max(4,Math.min(height-h-4,height*zone.y-h/2+cycle*10)));
      return {uid:id(),kind:'piece',source:'closet',id:item.id,x,y,w,h,rotation:deterministicRotation(category,index),z:(LAYER[category]||3)*10+order};
    });
  }

  function resetBoardSessionForJournal(){
    editingOutfitId=null;
    boardUndoStack=[];
    selectedBoardUid=null;
    doodleMode=false;
    document.querySelector('#drawModeBtn')?.classList.remove('active');
    document.querySelector('#outfitBoard')?.classList.remove('drawing');
    const name=document.querySelector('#outfitName');if(name)name.value='';
    const notes=document.querySelector('#outfitNotes');if(notes)notes.value='';
    if(typeof populatePortfolioFolderSelect==='function')populatePortfolioFolderSelect(state.settings?.portfolioFolders?.[0]||'Everyday');
    const save=document.querySelector('#saveOutfitBtn');if(save)save.textContent='Save outfit';
  }

  function loadJournalEntryToBoard(entryId){
    const entry=state.journal.find(row=>row.id===entryId);
    const items=validJournalClosetItems(entry);
    if(!entry||!items.length){toast('No available closet pieces to open on the Board');return;}
    if(document.querySelector('#journalDetailDialog')?.open&&typeof closeJournalDetail==='function')closeJournalDetail();
    resetBoardSessionForJournal();
    showScreen('outfits');
    requestAnimationFrame(()=>{
      const size=boardSize();
      boardItems=layoutJournalItems(items,size.width,size.height);
      drawBoard();
      setTimeout(()=>document.querySelector('#outfitBoard')?.scrollIntoView({behavior:'smooth',block:'center'}),60);
      const missing=(entry.itemIds||[]).length-items.length;
      toast(missing>0?`Loaded ${items.length} pieces · ${missing} unavailable item${missing===1?'':'s'} skipped`:`Loaded ${items.length} journal piece${items.length===1?'':'s'} onto the Board`);
    });
  }

  function requestJournalEntryOnBoard(){
    const entry=state.journal.find(row=>row.id===viewingJournalId);
    const items=validJournalClosetItems(entry);
    if(!entry||!items.length){toast('No available closet pieces to open on the Board');return;}
    guardBoardSwitch(()=>loadJournalEntryToBoard(entry.id),'open this journal look');
  }

  function refreshButton(){
    const button=document.querySelector('#'+BUTTON_ID);
    if(!button)return;
    const entry=state.journal.find(row=>row.id===viewingJournalId);
    const count=validJournalClosetItems(entry).length;
    button.disabled=!count;
    button.style.display=count?'':'none';
    button.textContent=count===1?'Open 1 piece on Board':`Open ${count} pieces on Board`;
  }

  function installJournalBoardAction(){
    const actions=document.querySelector('#journalDetailDialog .journal-detail-actions');
    if(!actions)return;
    let button=document.querySelector('#'+BUTTON_ID);
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.id=BUTTON_ID;
      button.className='soft-btn journal-open-board-btn';
      button.textContent='Open on Board';
      const edit=document.querySelector('#editJournalDetailBtn');
      actions.insertBefore(button,edit||null);
    }
    if(button.dataset.v1325Bound!=='1'){
      button.addEventListener('click',requestJournalEntryOnBoard);
      button.dataset.v1325Bound='1';
    }
    if(!document.querySelector('#v1325Phase1JournalBoardStyles')){
      const style=document.createElement('style');
      style.id='v1325Phase1JournalBoardStyles';
      style.textContent=`#journalDetailDialog .journal-detail-actions{flex-wrap:wrap}#journalDetailDialog .journal-open-board-btn{white-space:nowrap}@media(max-width:430px){#journalDetailDialog .journal-open-board-btn{order:-1;flex:1 0 100%}}`;
      document.head.appendChild(style);
    }
    refreshButton();
  }

  const originalOpenJournalDetail=openJournalDetail;
  openJournalDetail=function(jid){
    const result=originalOpenJournalDetail(jid);
    installJournalBoardAction();
    requestAnimationFrame(refreshButton);
    setTimeout(refreshButton,0);
    return result;
  };

  window.AudreyJournalBoard={openCurrent:requestJournalEntryOnBoard,refresh:refreshButton};
  installJournalBoardAction();
  window.addEventListener('pageshow',()=>{installJournalBoardAction();requestAnimationFrame(refreshButton)});
})();
