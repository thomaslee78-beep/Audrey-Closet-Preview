/* Audrey Closet v13.22-dev6 — Shape Studio visual style controls */
(function(){
  'use strict';

  const basicApi=window.__audreyShapeStudioV132201;
  if(!basicApi)return;

  let styleUndoStart=null;

  function selectedShape(){
    const model=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));
    return model?.kind==='shape'?model:null;
  }

  function cloneBoardForUndo(){
    return boardItems.map(item=>({
      ...item,
      shapeStyle:item?.shapeStyle?{...item.shapeStyle}:item?.shapeStyle
    }));
  }

  function beginStyleUndo(){
    if(styleUndoStart)return;
    styleUndoStart={items:cloneBoardForUndo(),selectedUid:selectedBoardUid};
  }

  function finishStyleUndo(label='shape style'){
    if(!styleUndoStart)return;
    const before=styleUndoStart;
    styleUndoStart=null;
    if(typeof window.pushBoardStateUndoV13205==='function'){
      window.pushBoardStateUndoV13205(before.items,before.selectedUid,label);
    }
  }

  function cssColorToHex(value,fallback='#4d8e8a'){
    const s=String(value||'').trim();
    let m=s.match(/^#([0-9a-f]{6})$/i);
    if(m)return '#'+m[1].toLowerCase();
    m=s.match(/^#([0-9a-f]{3})$/i);
    if(m)return '#'+m[1].split('').map(x=>x+x).join('').toLowerCase();
    m=s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if(m){
      const hex=[m[1],m[2],m[3]].map(v=>Math.max(0,Math.min(255,Math.round(Number(v)||0))).toString(16).padStart(2,'0')).join('');
      return '#'+hex;
    }
    return fallback;
  }

  function isFunShape(model){
    const api=window.__audreyShapeStudioV132204;
    return !!api?.funShapes?.some(x=>x.id===String(model?.shapeType||model?.value||''));
  }

  function shapeMarkupV132206(model){
    const renderer=isFunShape(model)&&typeof window.__audreyShapeStudioV132204?.funSvgMarkup==='function'
      ? window.__audreyShapeStudioV132204.funSvgMarkup
      : basicApi.shapeSvgMarkup;
    let svg=renderer(model);
    const dashed=String(model?.shapeStyle?.borderStyle||model?.shapeBorderStyle||'solid')==='dashed';
    if(dashed){
      svg=svg.replace(/vector-effect="non-scaling-stroke"/g,'stroke-dasharray="6 4" vector-effect="non-scaling-stroke"');
    }
    return svg;
  }

  function refreshShapeSvg(model){
    if(!model)return;
    const uid=String(model.uid).replace(/"/g,'\\"');
    const piece=document.querySelector(`#outfitBoard .board-piece[data-uid="${uid}"]`);
    if(piece){
      const current=piece.querySelector('.shape-studio-svg');
      if(current){
        const holder=document.createElement('div');
        holder.innerHTML=shapeMarkupV132206(model);
        const fresh=holder.firstElementChild;
        if(fresh)current.replaceWith(fresh);
      }
    }
  }

  // Preserve the new borderStyle field through the older Shape Studio normalizer.
  const previousNormalizeBoardItem=window.normalizeBoardItem;
  if(typeof previousNormalizeBoardItem==='function'){
    window.normalizeBoardItem=function(item){
      const borderStyle=item?.shapeStyle?.borderStyle||item?.shapeBorderStyle||'solid';
      const result=previousNormalizeBoardItem.apply(this,arguments);
      if(result?.kind==='shape'){
        result.shapeStyle={...(result.shapeStyle||{}),borderStyle:borderStyle==='dashed'?'dashed':'solid'};
      }
      return result;
    };
  }

  // Use the same style-aware renderer for Board shapes after all earlier shape modules have loaded.
  const previousBoardItemContent=window.boardItemContent;
  window.boardItemContent=function(piece){
    if(piece?.kind==='shape')return shapeMarkupV132206(piece);
    return previousBoardItemContent.apply(this,arguments);
  };

  function miniMarkup(piece,outfit,extraClass=''){
    const sw=Number(outfit?.boardWidth)||390,sh=Number(outfit?.boardHeight)||420;
    const left=Math.max(-10,Math.min(100,(Number(piece.x)||0)/sw*100));
    const top=Math.max(-10,Math.min(100,(Number(piece.y)||0)/sh*100));
    const width=Math.max(8,Math.min(70,(Number(piece.w)||90)/sw*100));
    const height=Math.max(8,Math.min(70,(Number(piece.h)||90)/sh*100));
    const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${Number(piece.z)||1};transform:rotate(${Number(piece.rotation)||0}deg)`;
    return `<span class="${extraClass} portfolio-shape shape-studio-mini" style="${style}">${shapeMarkupV132206(piece)}</span>`;
  }

  const previousRenderMiniPiece=window.renderMiniPiece;
  if(typeof previousRenderMiniPiece==='function'){
    window.renderMiniPiece=function(piece,outfit){
      if(piece?.kind==='shape')return miniMarkup(piece,outfit);
      return previousRenderMiniPiece.apply(this,arguments);
    };
  }

  const previousRenderSnapshotPiece=window.renderSnapshotPiece;
  if(typeof previousRenderSnapshotPiece==='function'){
    window.renderSnapshotPiece=function(piece,sourceW,sourceH){
      if(piece?.kind==='shape')return miniMarkup(piece,{boardWidth:sourceW,boardHeight:sourceH},'snapshot-piece');
      return previousRenderSnapshotPiece.apply(this,arguments);
    };
  }

  function ensureStyleControls(){
    const panel=document.getElementById('shapeEditPanelV132203');
    if(!panel||document.getElementById('shapeStyleControlsV132206'))return;
    const borderControl=panel.querySelector('.shape-border-control');
    if(!borderControl)return;

    const styles=document.createElement('div');
    styles.id='shapeStyleControlsV132206';
    styles.className='shape-style-controls';
    styles.innerHTML=`
      <div class="shape-color-row">
        <label class="shape-color-control"><span>Fill</span><input id="shapeFillColorV132206" type="color" value="#4d8e8a" aria-label="Shape fill color"></label>
        <label class="shape-color-control"><span>Border</span><input id="shapeBorderColorV132206" type="color" value="#4d8e8a" aria-label="Shape border color"></label>
      </div>
      <div class="shape-border-style-row">
        <span>Line</span>
        <div class="shape-border-style-options" role="group" aria-label="Shape border line style">
          <button type="button" class="shape-border-style-btn active" data-border-style="solid" aria-pressed="true"><i class="solid-line" aria-hidden="true"></i>Solid</button>
          <button type="button" class="shape-border-style-btn" data-border-style="dashed" aria-pressed="false"><i class="dashed-line" aria-hidden="true"></i>Dashed</button>
        </div>
      </div>`;
    borderControl.insertAdjacentElement('afterend',styles);

    const fill=document.getElementById('shapeFillColorV132206');
    const border=document.getElementById('shapeBorderColorV132206');
    [fill,border].forEach(input=>{
      input?.addEventListener('pointerdown',beginStyleUndo);
      input?.addEventListener('focus',beginStyleUndo);
      input?.addEventListener('change',()=>finishStyleUndo('shape color'));
      input?.addEventListener('blur',()=>finishStyleUndo('shape color'));
    });
    fill?.addEventListener('input',e=>applyColor('fill',e.target.value));
    border?.addEventListener('input',e=>applyColor('borderColor',e.target.value));

    styles.querySelectorAll('.shape-border-style-btn').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault();
      const model=selectedShape();
      if(!model||model.locked)return;
      const next=btn.dataset.borderStyle==='dashed'?'dashed':'solid';
      const current=String(model.shapeStyle?.borderStyle||'solid');
      if(current===next)return;
      const before=cloneBoardForUndo();
      model.shapeStyle={...(model.shapeStyle||{}),borderStyle:next};
      refreshShapeSvg(model);
      syncStyleControls();
      if(typeof window.pushBoardStateUndoV13205==='function')window.pushBoardStateUndoV13205(before,model.uid,'shape border style');
    }));
  }

  function applyColor(key,value){
    const model=selectedShape();
    if(!model||model.locked)return;
    model.shapeStyle={...(model.shapeStyle||{}),[key]:value};
    refreshShapeSvg(model);
  }

  function syncStyleControls(){
    ensureStyleControls();
    const model=selectedShape();
    const host=document.getElementById('shapeStyleControlsV132206');
    if(!host)return;
    host.classList.toggle('hidden',!model);
    if(!model)return;

    model.shapeStyle={...(model.shapeStyle||{}),borderStyle:String(model.shapeStyle?.borderStyle||'solid')==='dashed'?'dashed':'solid'};
    const locked=!!model.locked;
    const fill=document.getElementById('shapeFillColorV132206');
    const border=document.getElementById('shapeBorderColorV132206');
    if(fill){fill.value=cssColorToHex(model.shapeStyle.fill,'#4d8e8a');fill.disabled=locked;}
    if(border){border.value=cssColorToHex(model.shapeStyle.borderColor,'#4d8e8a');border.disabled=locked;}
    host.querySelectorAll('.shape-border-style-btn').forEach(btn=>{
      const active=btn.dataset.borderStyle===model.shapeStyle.borderStyle;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
      btn.disabled=locked;
    });
  }

  function installStyles(){
    if(document.getElementById('shapeStudioStylesV132206'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132206';
    style.textContent=`
      .screen[data-screen="outfits"] .shape-style-controls{display:grid;gap:7px;padding-top:2px}
      .screen[data-screen="outfits"] .shape-style-controls.hidden{display:none!important}
      .screen[data-screen="outfits"] .shape-color-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .screen[data-screen="outfits"] .shape-color-control{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px;margin:0;padding:5px 7px;border:1px solid rgba(108,81,66,.14);border-radius:9px;background:#fffaf0}
      .screen[data-screen="outfits"] .shape-color-control span{font-size:9px;font-weight:800;color:#665c50}
      .screen[data-screen="outfits"] .shape-color-control input[type="color"]{width:34px;height:26px;padding:1px;border:1px solid rgba(108,81,66,.20);border-radius:7px;background:#fff;overflow:hidden}
      .screen[data-screen="outfits"] .shape-border-style-row{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px}
      .screen[data-screen="outfits"] .shape-border-style-row>span{font-size:9px;font-weight:800;color:#665c50}
      .screen[data-screen="outfits"] .shape-border-style-options{display:grid;grid-template-columns:1fr 1fr;gap:5px}
      .screen[data-screen="outfits"] .shape-border-style-btn{min-height:32px;padding:4px 7px;border:1px solid rgba(108,81,66,.16);border-radius:9px;background:#fffaf0;color:#74695d;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px;font-weight:800;-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] .shape-border-style-btn i{display:block;width:24px;height:0;border-top:2px solid currentColor}
      .screen[data-screen="outfits"] .shape-border-style-btn i.dashed-line{border-top-style:dashed}
      .screen[data-screen="outfits"] .shape-border-style-btn.active{background:#eef0e8;border-color:rgba(102,113,90,.32);color:#4f5a49}
      .screen[data-screen="outfits"] .shape-border-style-btn:disabled,.screen[data-screen="outfits"] .shape-color-control input:disabled{opacity:.42}
      .screen[data-screen="outfits"] .shape-edit-panel.shape-selected-locked .shape-style-controls{opacity:.55}
    `;
    document.head.appendChild(style);
  }

  const previousDrawBoard=drawBoard;
  drawBoard=function(){
    const result=previousDrawBoard.apply(this,arguments);
    requestAnimationFrame(syncStyleControls);
    return result;
  };

  document.addEventListener('pointerup',e=>{
    if(e.target.closest?.('#outfitBoard')||e.target.closest?.('#shapePolishControlsV132205')||e.target.closest?.('.board-tool-action')){
      setTimeout(syncStyleControls,0);
    }
  },true);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#shapePolishControlsV132205')||e.target.closest?.('.board-tool-action')||e.target.closest?.('#boardEditbar button')){
      setTimeout(syncStyleControls,0);
    }
  },true);

  installStyles();
  ensureStyleControls();
  syncStyleControls();
  setTimeout(syncStyleControls,200);
  setTimeout(syncStyleControls,700);

  window.__audreyShapeStudioV132206={sync:syncStyleControls,shapeMarkup:shapeMarkupV132206};
})();
