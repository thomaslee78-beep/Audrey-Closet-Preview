/* Audrey Closet v13.22-dev5 — Shape Studio lock/layer polish */
(function(){
  'use strict';

  const shapeApi=window.__audreyShapeStudioV132201;
  if(!shapeApi)return;

  function selectedShape(){
    const model=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));
    return model?.kind==='shape'?model:null;
  }

  function clickBoardTool(proxyFor,fallbackId){
    const proxy=document.querySelector(`.board-tool-action[data-proxy-for="${proxyFor}"]`);
    const target=proxy||document.getElementById(fallbackId||proxyFor);
    if(!target||target.disabled)return false;
    target.click();
    setTimeout(syncShapePolishV132205,0);
    return true;
  }

  function ensureShapePolishControlsV132205(){
    const panel=document.getElementById('shapeEditPanelV132203');
    if(!panel||document.getElementById('shapePolishControlsV132205'))return;

    const actions=document.createElement('div');
    actions.id='shapePolishControlsV132205';
    actions.className='shape-polish-controls';
    actions.innerHTML=`
      <div class="shape-polish-state-row">
        <span class="shape-polish-status" id="shapeLockStatusV132205">Unlocked</span>
        <small id="shapePolishHintV132205">Position, layer and style this shape.</small>
      </div>
      <div class="shape-polish-actions" role="group" aria-label="Selected shape actions">
        <button type="button" id="shapeLockBtnV132205" class="shape-polish-btn shape-lock-btn"><span aria-hidden="true">🔒</span><strong>Lock</strong></button>
        <button type="button" id="shapeBackBtnV132205" class="shape-polish-btn"><span aria-hidden="true">⇩</span><strong>Back</strong></button>
        <button type="button" id="shapeFrontBtnV132205" class="shape-polish-btn"><span aria-hidden="true">⇧</span><strong>Front</strong></button>
      </div>`;
    panel.appendChild(actions);

    document.getElementById('shapeLockBtnV132205')?.addEventListener('click',e=>{
      e.preventDefault();
      clickBoardTool('boardLockToggleBtn','boardLockToggleBtn');
    });
    document.getElementById('shapeBackBtnV132205')?.addEventListener('click',e=>{
      e.preventDefault();
      clickBoardTool('sendBackBtn','sendBackBtn');
    });
    document.getElementById('shapeFrontBtnV132205')?.addEventListener('click',e=>{
      e.preventDefault();
      clickBoardTool('bringFrontBtn','bringFrontBtn');
    });
  }

  function syncShapePolishV132205(){
    ensureShapePolishControlsV132205();
    if(typeof window.__audreyShapeStudioV132203?.syncEditor==='function'){
      window.__audreyShapeStudioV132203.syncEditor();
    }

    const panel=document.getElementById('shapeEditPanelV132203');
    const model=selectedShape();
    if(!panel)return;

    const locked=!!model?.locked;
    panel.classList.toggle('shape-selected-locked',!!model&&locked);

    const slider=document.getElementById('shapeBorderWidthV132203');
    if(slider){
      slider.disabled=!model||locked;
      slider.setAttribute('aria-disabled',slider.disabled?'true':'false');
    }

    const status=document.getElementById('shapeLockStatusV132205');
    if(status)status.textContent=locked?'Locked':'Unlocked';

    const hint=document.getElementById('shapePolishHintV132205');
    if(hint)hint.textContent=locked?'Unlock to resize, layer or change the border.':'Position, layer and style this shape.';

    const lockBtn=document.getElementById('shapeLockBtnV132205');
    if(lockBtn){
      lockBtn.disabled=!model;
      lockBtn.classList.toggle('active',locked);
      const icon=lockBtn.querySelector('span');
      const label=lockBtn.querySelector('strong');
      if(icon)icon.textContent=locked?'🔓':'🔒';
      if(label)label.textContent=locked?'Unlock':'Lock';
      lockBtn.setAttribute('aria-pressed',locked?'true':'false');
    }

    const back=document.getElementById('shapeBackBtnV132205');
    const front=document.getElementById('shapeFrontBtnV132205');
    if(back)back.disabled=!model||locked;
    if(front)front.disabled=!model||locked;

    const board=document.getElementById('outfitBoard');
    board?.querySelectorAll('.board-piece.kind-shape').forEach(el=>{
      const item=boardItems.find(x=>String(x.uid)===String(el.dataset.uid));
      el.classList.toggle('shape-studio-locked',!!item?.locked);
      if(item?.locked)el.querySelectorAll('.shape-stretch-handle').forEach(h=>{h.style.display='none'});
      else el.querySelectorAll('.shape-stretch-handle').forEach(h=>{h.style.removeProperty('display')});
    });
  }

  function installStylesV132205(){
    if(document.getElementById('shapeStudioStylesV132205'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132205';
    style.textContent=`
      .screen[data-screen="outfits"] .shape-polish-controls{display:grid;gap:6px;padding-top:2px;border-top:1px solid rgba(108,81,66,.10)}
      .screen[data-screen="outfits"] .shape-polish-state-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .screen[data-screen="outfits"] .shape-polish-status{display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border-radius:999px;background:#eef0e8;color:#52604c;font-size:8px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
      .screen[data-screen="outfits"] .shape-polish-state-row small{font-size:8px;line-height:1.2;color:#817568;text-align:right}
      .screen[data-screen="outfits"] .shape-polish-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
      .screen[data-screen="outfits"] .shape-polish-btn{min-width:0;min-height:34px;padding:4px 5px;border:1px solid rgba(108,81,66,.17);border-radius:9px;background:#fffaf0;color:#665c50;display:flex;align-items:center;justify-content:center;gap:4px;-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] .shape-polish-btn span{font-size:12px;line-height:1}
      .screen[data-screen="outfits"] .shape-polish-btn strong{font-size:9px;line-height:1;font-weight:800}
      .screen[data-screen="outfits"] .shape-polish-btn:active:not(:disabled){transform:scale(.97)}
      .screen[data-screen="outfits"] .shape-polish-btn:disabled{opacity:.38}
      .screen[data-screen="outfits"] .shape-polish-btn.active{background:#eef0e8;border-color:rgba(102,113,90,.30);color:#4f5a49}
      .screen[data-screen="outfits"] .shape-edit-panel.shape-selected-locked{background:rgba(238,240,232,.76);border-color:rgba(102,113,90,.26)}
      .screen[data-screen="outfits"] .shape-edit-panel.shape-selected-locked .shape-border-control{opacity:.52}
      .screen[data-screen="outfits"] #outfitBoard .board-piece.kind-shape.shape-studio-locked .shape-stretch-handle{display:none!important}
      .screen[data-screen="outfits"] #outfitBoard .board-piece.kind-shape.shape-studio-locked.selected{outline-color:rgba(102,113,90,.64)}
    `;
    document.head.appendChild(style);
  }

  const previousDrawBoardV132205=drawBoard;
  drawBoard=function(){
    const result=previousDrawBoardV132205.apply(this,arguments);
    requestAnimationFrame(syncShapePolishV132205);
    return result;
  };

  document.addEventListener('pointerup',e=>{
    if(e.target.closest?.('#outfitBoard')||e.target.closest?.('.board-tool-action')||e.target.closest?.('#boardEditbar')){
      setTimeout(syncShapePolishV132205,0);
    }
  },true);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.board-tool-action')||e.target.closest?.('#boardEditbar button')||e.target.closest?.('#shapePolishControlsV132205')){
      setTimeout(syncShapePolishV132205,0);
    }
  },true);

  installStylesV132205();
  ensureShapePolishControlsV132205();
  syncShapePolishV132205();
  setTimeout(syncShapePolishV132205,200);
  setTimeout(syncShapePolishV132205,700);

  window.__audreyShapeStudioV132205={sync:syncShapePolishV132205};
})();
