/* Audrey Closet v13.22-dev3a — Shape Studio border thickness editor */
(function(){
  'use strict';

  const api=window.__audreyShapeStudioV132201;
  if(!api)return;

  let borderUndoStart=null;

  function selectedShape(){
    const model=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));
    return model?.kind==='shape'?api.normalizeShapePiece(model):null;
  }

  function shapeLabel(type){
    const def=(api.basicShapes||[]).find(x=>x.id===type);
    const fun=(window.__audreyShapeStudioV132204?.funShapes||[]).find(x=>x.id===type);
    return def?.label||fun?.label||String(type||'Shape');
  }

  function ensureEditor(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio||document.getElementById('shapeEditPanelV132203'))return;

    const hint=studio.querySelector('.shape-studio-hint');
    const panel=document.createElement('div');
    panel.id='shapeEditPanelV132203';
    panel.className='shape-edit-panel hidden';
    panel.innerHTML=`
      <div class="shape-edit-head">
        <span>Selected Shape</span>
        <strong id="shapeEditNameV132203">Shape</strong>
      </div>
      <label class="shape-border-control" for="shapeBorderWidthV132203">
        <span>Border</span>
        <input id="shapeBorderWidthV132203" type="range" min="1" max="12" step="1" value="4" aria-label="Shape border thickness">
        <output id="shapeBorderValueV132203">4 px</output>
      </label>`;
    studio.insertBefore(panel,hint||null);

    const slider=document.getElementById('shapeBorderWidthV132203');
    slider.addEventListener('pointerdown',beginUndo);
    slider.addEventListener('focus',beginUndo);
    slider.addEventListener('input',applyBorderWidth);
    slider.addEventListener('change',finishUndo);
    slider.addEventListener('blur',finishUndo);
    syncEditor();
  }

  function deepBoardSnapshot(){
    return boardItems.map(item=>({
      ...item,
      shapeStyle:item?.shapeStyle?{...item.shapeStyle}:item?.shapeStyle
    }));
  }

  function beginUndo(){
    if(borderUndoStart)return;
    borderUndoStart={items:deepBoardSnapshot(),selectedUid:selectedBoardUid};
  }

  function finishUndo(){
    if(!borderUndoStart)return;
    const before=borderUndoStart;
    borderUndoStart=null;
    if(typeof window.pushBoardStateUndoV13205==='function'){
      window.pushBoardStateUndoV13205(before.items,before.selectedUid,'shape border');
    }
  }

  function refreshSelectedShapeSvg(model){
    const piece=document.querySelector(`#outfitBoard .board-piece[data-uid="${CSS.escape(String(model.uid))}"]`);
    if(!piece)return;
    const svg=piece.querySelector('.shape-studio-svg');
    if(!svg)return;

    // Use the final style-aware renderer when it is available. The older basic/fun
    // renderers do not apply shapeStyle.borderStyle, which made a dashed shape
    // appear solid as soon as the border-width slider redrew it.
    const styleAwareRenderer=window.__audreyShapeStudioV132206?.shapeMarkup;
    const fallbackRenderer=window.__audreyShapeStudioV132204?.funSvgMarkup&&window.__audreyShapeStudioV132204.funShapes?.some(x=>x.id===model.shapeType)
      ? window.__audreyShapeStudioV132204.funSvgMarkup
      : api.shapeSvgMarkup;
    const renderer=typeof styleAwareRenderer==='function'?styleAwareRenderer:fallbackRenderer;

    const replacement=document.createElement('div');
    replacement.innerHTML=renderer(model);
    const fresh=replacement.firstElementChild;
    if(fresh)svg.replaceWith(fresh);
  }

  function applyBorderWidth(e){
    const model=selectedShape();
    if(!model)return;
    const value=Math.max(1,Math.min(12,Number(e.target.value)||1));
    model.shapeStyle={...model.shapeStyle,borderWidth:value};
    const out=document.getElementById('shapeBorderValueV132203');
    if(out)out.textContent=value+' px';
    refreshSelectedShapeSvg(model);
  }

  function syncEditor(){
    const panel=document.getElementById('shapeEditPanelV132203');
    const slider=document.getElementById('shapeBorderWidthV132203');
    const output=document.getElementById('shapeBorderValueV132203');
    const name=document.getElementById('shapeEditNameV132203');
    if(!panel||!slider||!output||!name)return;

    const model=selectedShape();
    panel.classList.toggle('hidden',!model);
    if(!model)return;

    const width=Math.max(1,Math.min(12,Number(model.shapeStyle?.borderWidth)||1));
    if(Number(model.shapeStyle?.borderWidth)<1)model.shapeStyle={...model.shapeStyle,borderWidth:1};
    if(document.activeElement!==slider)slider.value=String(width);
    output.textContent=width+' px';
    name.textContent=shapeLabel(model.shapeType);
  }

  function installStyles(){
    if(document.getElementById('shapeStudioStylesV132203'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132203';
    style.textContent=`
      .screen[data-screen="outfits"] .shape-edit-panel{display:grid;gap:6px;padding:8px 9px;border:1px solid rgba(108,81,66,.14);border-radius:11px;background:rgba(243,238,225,.62)}
      .screen[data-screen="outfits"] .shape-edit-panel.hidden{display:none!important}
      .screen[data-screen="outfits"] .shape-edit-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .screen[data-screen="outfits"] .shape-edit-head span{font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#817568}
      .screen[data-screen="outfits"] .shape-edit-head strong{font-size:10px;color:#665c50}
      .screen[data-screen="outfits"] .shape-border-control{display:grid;grid-template-columns:auto minmax(0,1fr) 36px;align-items:center;gap:7px;margin:0}
      .screen[data-screen="outfits"] .shape-border-control>span{font-size:10px;font-weight:700;color:#665c50}
      .screen[data-screen="outfits"] .shape-border-control input[type="range"]{width:100%;height:22px;margin:0;accent-color:var(--turq)}
      .screen[data-screen="outfits"] .shape-border-control output{font-size:9px;font-weight:700;text-align:right;color:#817568;white-space:nowrap}`;
    document.head.appendChild(style);
  }

  const previousDrawBoard=drawBoard;
  drawBoard=function(){
    const result=previousDrawBoard.apply(this,arguments);
    requestAnimationFrame(()=>{ensureEditor();syncEditor();});
    return result;
  };

  document.addEventListener('pointerup',e=>{
    if(e.target.closest?.('#outfitBoard .board-piece')||e.target.closest?.('#outfitBoard')){
      setTimeout(syncEditor,0);
    }
  },true);

  installStyles();
  ensureEditor();
  setTimeout(()=>{ensureEditor();syncEditor();},200);
  setTimeout(()=>{ensureEditor();syncEditor();},700);

  window.__audreyShapeStudioV132203={syncEditor};
})();
