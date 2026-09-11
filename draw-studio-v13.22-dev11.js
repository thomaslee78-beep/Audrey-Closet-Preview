/* Audrey Closet v13.22 Draw Studio dev11 guard
 * Runs after dev10. Keeps dev10 drawing + partial eraser unchanged.
 * Hard-gates drawing to Board workspace=Decorate + Decorate tab=Draw.
 * Suspends/resumes the selected dev10 tool through its own UI controls so
 * normal Board gestures remain available in Add Items / Tools / Canvas.
 * Adds bounded rebind retries for saved outfit/edit transitions.
 */
(function(){
  'use strict';

  const BOARD_ACTIVE_CLASS='draw-dev10-active';
  const ERASER_ACTIVE_CLASS='draw-dev10-eraser';
  const LIVE_TOOLS=['pencil','pen','sharpie','highlighter','eraser'];
  let suspendedTool='';
  let internalClick=false;

  function workspaceDecorateActive(){
    const tab=document.querySelector('.screen[data-screen="outfits"] .board-workspace-tab[data-board-panel="decorate"]');
    const panel=document.querySelector('.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }

  function drawSubtabActive(){
    const tab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }

  function root(){return document.getElementById('drawStudioDev10');}

  function selectedLiveTool(){
    const btn=root()?.querySelector('.draw-tool-btn.active[data-draw-tool]');
    const tool=btn?.dataset.drawTool||'';
    return LIVE_TOOLS.includes(tool)?tool:'';
  }

  function toolButton(tool){
    return root()?.querySelector(`.draw-tool-btn[data-draw-tool="${tool}"]`)||null;
  }

  function trueDrawContext(){
    return workspaceDecorateActive()&&drawSubtabActive()&&!!selectedLiveTool();
  }

  function stripBoardDrawClasses(){
    const board=document.getElementById('outfitBoard');
    if(!board)return;
    if(trueDrawContext())return;
    board.classList.remove(BOARD_ACTIVE_CLASS,ERASER_ACTIVE_CLASS);
    board.querySelector('.draw-live-overlay-dev10')?.remove();
  }

  function clickTool(btn){
    if(!btn)return;
    internalClick=true;
    try{btn.click();}finally{internalClick=false;}
  }

  function suspendForWorkspaceExit(){
    const active=selectedLiveTool();
    if(active){
      suspendedTool=active;
      clickTool(toolButton(active)); // dev10 deselects tool + turns private drawMode off
    }
    stripBoardDrawClasses();
  }

  function resumeForDrawReturn(){
    if(!workspaceDecorateActive()||!drawSubtabActive())return;
    if(selectedLiveTool())return;
    if(!suspendedTool)return;
    const btn=toolButton(suspendedTool);
    if(btn)clickTool(btn); // dev10 reselects and arms only in Draw
  }

  function requestDev10Reconcile(){
    window.dispatchEvent(new Event('pageshow'));
    window.setTimeout(()=>{
      if(workspaceDecorateActive()&&drawSubtabActive())resumeForDrawReturn();
      stripBoardDrawClasses();
    },0);
  }

  function rebindBurst(){
    [0,80,220,500].forEach(delay=>window.setTimeout(requestDev10Reconcile,delay));
  }

  function likelyBoardLifecycleTarget(target){
    return !!target.closest?.(
      '#savedOutfits .portfolio-card[data-id], .screen[data-screen="portfolio"] .portfolio-card[data-id], '+
      '#outfitViewDialog, #portfolioItemPreviewDialog, .board-workspace-tab, '+
      '.decorate-studio-tab, #decorateToggle'
    );
  }

  function start(){
    stripBoardDrawClasses();

    document.addEventListener('click',e=>{
      if(internalClick)return;
      const target=e.target;
      if(!(target instanceof Element))return;

      const drawTool=target.closest('#drawStudioDev10 .draw-tool-btn[data-draw-tool]');
      if(drawTool){
        const tool=drawTool.dataset.drawTool||'';
        if(LIVE_TOOLS.includes(tool))suspendedTool=tool;
      }

      const workspaceTab=target.closest('.board-workspace-tab[data-board-panel]');
      if(workspaceTab){
        if(workspaceTab.dataset.boardPanel!=='decorate'){
          suspendForWorkspaceExit();
        }else{
          window.setTimeout(()=>{
            if(drawSubtabActive())resumeForDrawReturn();
          },0);
        }
      }

      const decorateTab=target.closest('.decorate-studio-tab[data-decorate-group]');
      if(decorateTab?.dataset.decorateGroup==='draw'){
        window.setTimeout(resumeForDrawReturn,0);
      }

      window.setTimeout(stripBoardDrawClasses,0);
      if(likelyBoardLifecycleTarget(target))rebindBurst();
    },true);

    // Saved-board transitions can complete asynchronously after opening/editing.
    // Re-run dev10's own current-board binding a few times, then stop.
    document.addEventListener('click',e=>{
      const target=e.target;
      if(target instanceof Element&&likelyBoardLifecycleTarget(target))rebindBurst();
    },false);

    window.addEventListener('pageshow',()=>window.setTimeout(()=>{
      if(workspaceDecorateActive()&&drawSubtabActive())resumeForDrawReturn();
      stripBoardDrawClasses();
    },0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)rebindBurst();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
