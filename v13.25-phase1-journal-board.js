/* Audrey Closet v13.25 Phase 1 — Journal -> Outfit Board bridge
 * Preview-first bridge for Journal detail -> Outfit Board.
 */
(function(){
  'use strict';

  const BUTTON_ID='journalOpenBoardBtn';
  const PIECE_SIZE={
    tops:{w:146,h:172},
    bottoms:{w:160,h:192},
    dresses:{w:170,h:220},
    outerwear:{w:154,h:186},
    shoes:{w:146,h:172},
    accessories:{w:146,h:172},
    misc:{w:146,h:172}
  };

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
    return {width:Math.max(320,Number(board?.clientWidth)||390),height:Math.max(360,Number(board?.clientHeight)||420)};
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
    tops:[{x:.50,y:.24},{x:.31,y:.26},{x:.69,y:.26},{x:.50,y:.35}],
    bottoms:[{x:.50,y:.64},{x:.31,y:.65},{x:.69,y:.65},{x:.50,y:.74}],
    dresses:[{x:.50,y:.50},{x:.30,y:.50},{x:.70,y:.50}],
    outerwear:[{x:.77,y:.40},{x:.23,y:.40},{x:.79,y:.61},{x:.21,y:.61}],
    shoes:[{x:.27,y:.82},{x:.73,y:.82},{x:.50,y:.84}],
    accessories:[{x:.20,y:.18},{x:.80,y:.18},{x:.18,y:.50},{x:.82,y:.50},{x:.22,y:.76},{x:.78,y:.76}],
    misc:[{x:.28,y:.69},{x:.72,y:.69},{x:.50,y:.77},{x:.50,y:.48}]
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
      const category=categoryKey(item),index=counters[category]||0;
      counters[category]=index+1;
      const zones=ZONES[category]||ZONES.misc,zone=zones[index%zones.length],cycle=Math.floor(index/zones.length);
      const target=PIECE_SIZE[category]||PIECE_SIZE.misc;
      const w=Math.min(target.w,Math.max(120,width-16));
      const h=Math.min(target.h,Math.max(140,height-16));
      const cycleShift=(cycle%3-1)*Math.min(20,width*.045);
      const x=Math.round(Math.max(4,Math.min(width-w-4,width*zone.x-w/2+cycleShift)));
      const y=Math.round(Math.max(4,Math.min(height-h-4,height*zone.y-h/2+cycle*10)));
      return {uid:id(),kind:'piece',source:'closet',id:item.id,x,y,w,h,rotation:deterministicRotation(category,index),z:(LAYER[category]||3)*10+order};
    });
  }

  function resetBoardSessionForJournal(){
    editingOutfitId=null;boardUndoStack=[];selectedBoardUid=null;doodleMode=false;
    document.querySelector('#drawModeBtn')?.classList.remove('active');
    document.querySelector('#outfitBoard')?.classList.remove('drawing');
    const name=document.querySelector('#outfitName');if(name)name.value='';
    const notes=document.querySelector('#outfitNotes');if(notes)notes.value='';
    if(typeof populatePortfolioFolderSelect==='function')populatePortfolioFolderSelect(state.settings?.portfolioFolders?.[0]||'Everyday');
    const save=document.querySelector('#saveOutfitBtn');if(save)save.textContent='Save outfit';
  }

  function loadJournalEntryToBoard(entryId){
    const entry=state.journal.find(row=>row.id===entryId),items=validJournalClosetItems(entry);
    if(!entry||!items.length){toast('No available closet pieces to add to the Outfit Board');return;}
    if(document.querySelector('#journalDetailDialog')?.open&&typeof closeJournalDetail==='function')closeJournalDetail();
    resetBoardSessionForJournal();showScreen('outfits');
    requestAnimationFrame(()=>{
      const size=boardSize();boardItems=layoutJournalItems(items,size.width,size.height);drawBoard();
      setTimeout(()=>document.querySelector('#outfitBoard')?.scrollIntoView({behavior:'smooth',block:'center'}),60);
      const missing=(entry.itemIds||[]).length-items.length;
      toast(missing>0?`Loaded ${items.length} pieces · ${missing} unavailable item${missing===1?'':'s'} skipped`:`Added ${items.length} journal piece${items.length===1?'':'s'} to the Outfit Board`);
    });
  }

  function requestJournalEntryOnBoard(){
    const entry=state.journal.find(row=>row.id===viewingJournalId),items=validJournalClosetItems(entry);
    if(!entry||!items.length){toast('No available closet pieces to add to the Outfit Board');return;}
    guardBoardSwitch(()=>loadJournalEntryToBoard(entry.id),'add this journal look to the Outfit Board');
  }

  function refreshButton(){
    const button=document.querySelector('#'+BUTTON_ID);if(!button)return;
    const entry=state.journal.find(row=>row.id===viewingJournalId),count=validJournalClosetItems(entry).length;
    button.disabled=!count;button.style.display=count?'':'none';button.textContent='Add to Outfit Board';
  }

  function installJournalBoardAction(){
    const actions=document.querySelector('#journalDetailDialog .journal-detail-actions');if(!actions)return;
    let button=document.querySelector('#'+BUTTON_ID);
    if(!button){
      button=document.createElement('button');button.type='button';button.id=BUTTON_ID;button.className='primary journal-open-board-btn';button.textContent='Add to Outfit Board';
      const edit=document.querySelector('#editJournalDetailBtn');actions.insertBefore(button,edit?.nextSibling||null);
    }
    button.classList.remove('soft-btn');
    button.classList.add('primary');
    if(button.dataset.v1325Bound!=='1'){button.addEventListener('click',requestJournalEntryOnBoard);button.dataset.v1325Bound='1';}
    if(!document.querySelector('#v1325Phase1JournalBoardStyles')){
      const style=document.createElement('style');style.id='v1325Phase1JournalBoardStyles';
      style.textContent=`
        #journalDetailDialog .journal-detail-actions{
          display:grid;
          grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);
          grid-template-areas:"edit board" "cancel delete";
          gap:10px 12px;
          align-items:center;
        }
        #journalDetailDialog .journal-open-board-btn{grid-area:board;white-space:nowrap;width:100%;min-width:0;padding-left:10px;padding-right:10px}
        #journalDetailDialog #editJournalDetailBtn{grid-area:edit;width:100%;min-width:0}
        #journalDetailDialog #cancelJournalDetailBtn{grid-area:cancel;width:100%;min-width:0}
        #journalDetailDialog #deleteJournalDetailBtn{grid-area:delete;width:100%;min-width:0;justify-self:stretch;text-align:center}
      `;
      document.head.appendChild(style);
    }
    refreshButton();
  }

  const originalOpenJournalDetail=openJournalDetail;
  openJournalDetail=function(jid){const result=originalOpenJournalDetail(jid);installJournalBoardAction();requestAnimationFrame(refreshButton);setTimeout(refreshButton,0);return result;};

  window.AudreyJournalBoard={openCurrent:requestJournalEntryOnBoard,refresh:refreshButton};
  installJournalBoardAction();
  window.addEventListener('pageshow',()=>{installJournalBoardAction();requestAnimationFrame(refreshButton)});
})();
