/* Audrey Closet v13.22-dev26 — lifecycle-independent Text alignment icons */
(function(){
  'use strict';

  let shapeInfoCollapsedV132210=false;

  function looksLikeLegacyShapesIntro(node){
    if(!node)return false;
    if(node.querySelector?.('#shapeStudioV132201'))return false;
    const text=String(node.textContent||'').replace(/\s+/g,' ').trim();
    if(!text)return false;
    const heading=[...node.querySelectorAll?.('h1,h2,h3,h4,strong')||[]]
      .map(x=>String(x.textContent||'').trim().toLowerCase())
      .find(Boolean)||'';
    return heading==='shapes' ||
      (/^Shapes\b/.test(text) && /Captions\s*&\s*arrows/i.test(text) && /Thought bubbles/i.test(text));
  }

  function selectedShapeV132209(){
    const model=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));
    return model?.kind==='shape'?model:null;
  }

  function syncShapeStudioMessageV132209(info){
    if(!info)return;
    const title=info.querySelector('.shape-studio-info-copy strong');
    const copy=info.querySelector('.shape-studio-info-copy span');
    if(!title||!copy)return;

    if(selectedShapeV132209()){
      title.textContent='Shape Editing';
      copy.textContent='Select a shape on the Board to move, rotate or resize it. Side handles stretch width or height independently.';
    }else{
      title.textContent='Shape Studio';
      copy.textContent='Tap a shape to add it to the Board.';
    }
  }

  function syncInfoCollapsedV132210(info){
    if(!info)return;
    info.classList.toggle('collapsed',shapeInfoCollapsedV132210);
    info.setAttribute('aria-expanded',shapeInfoCollapsedV132210?'false':'true');
    const toggle=info.querySelector('.shape-studio-info-toggle');
    if(toggle){
      toggle.textContent=shapeInfoCollapsedV132210?'＋':'−';
      toggle.setAttribute('aria-hidden','true');
    }
  }

  function buildInfoButtonV132210(existing){
    const button=document.createElement('button');
    button.type='button';
    button.id='shapeStudioInfoV132207';
    button.className='shape-studio-info';
    button.setAttribute('aria-expanded','true');
    button.setAttribute('aria-label','Toggle Shape Studio information');
    button.innerHTML=`
      <span class="shape-studio-info-icon" aria-hidden="true">i</span>
      <span class="shape-studio-info-copy">
        <strong>Shape Studio</strong>
        <span>Tap a shape to add it to the Board.</span>
      </span>
      <span class="shape-studio-info-toggle" aria-hidden="true">−</span>`;
    button.addEventListener('click',()=>{
      shapeInfoCollapsedV132210=!shapeInfoCollapsedV132210;
      syncInfoCollapsedV132210(button);
    });
    if(existing)existing.replaceWith(button);
    return button;
  }

  function removeAllShapeInfoV132216(){
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="shapes"]');
    if(!panel)return;
    panel.querySelectorAll('#shapeStudioInfoV132207,.shape-studio-info,.decorate-studio-intro').forEach(node=>{
      if(node.closest?.('#shapeEditPanelV132203'))return;
      const text=String(node.textContent||'').replace(/\s+/g,' ').trim();
      if(node.matches('#shapeStudioInfoV132207,.shape-studio-info') || /^Shapes\b/i.test(text) || /Shape Studio/i.test(text)){
        node.remove();
      }
    });
  }

  function consolidateShapePickerV132217(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio)return;

    let strip=studio.querySelector('#shapePickerStripV132217');
    if(!strip){
      strip=document.createElement('div');
      strip.id='shapePickerStripV132217';
      strip.className='shape-picker-strip';
      strip.setAttribute('role','group');
      strip.setAttribute('aria-label','Shapes');
      const editPanel=studio.querySelector('#shapeEditPanelV132203');
      studio.insertBefore(strip,editPanel||studio.firstChild);
    }

    const basicRow=studio.querySelector('.shape-basic-row');
    const funRow=studio.querySelector('#shapeFunRowV132204,.shape-fun-row');
    [basicRow,funRow].forEach(row=>{
      if(!row||row===strip)return;
      [...row.querySelectorAll(':scope > .shape-picker-btn')].forEach(btn=>strip.appendChild(btn));
      row.remove();
    });

    studio.querySelectorAll('.shape-studio-section').forEach(section=>{
      if(!section.querySelector('.shape-picker-btn'))section.remove();
    });
  }

  function fixRectanglePreviewV132220(){
    const btn=document.querySelector('#shapePickerStripV132217>.shape-picker-btn[data-shape-type="rectangle"]');
    if(!btn)return;
    const svg=btn.querySelector('svg');
    if(!svg)return;
    const rect=svg.querySelector('rect');
    if(!rect)return;
    rect.setAttribute('x','5');
    rect.setAttribute('y','22');
    rect.setAttribute('width','90');
    rect.setAttribute('height','56');
  }

  function installShapeStudioLayoutV132207(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio)return;

    const content=studio.closest('.decorate-studio-content');
    const studioCard=studio.closest('.decorate-tool-card')||studio.parentElement;
    if(!content||!studioCard)return;

    [...content.children].forEach(child=>{
      if(child===studioCard||child.contains?.(studio))return;
      if(looksLikeLegacyShapesIntro(child))child.remove();
    });

    removeAllShapeInfoV132216();
    const oldHint=studio.querySelector('.shape-studio-hint');
    if(oldHint)oldHint.remove();

    studio.querySelector('.shape-studio-head')?.remove();
    studio.querySelectorAll('.shape-studio-label').forEach(label=>label.remove());
    consolidateShapePickerV132217();
    fixRectanglePreviewV132220();
  }

  function installStylesV132207(){
    let style=document.getElementById('shapeStudioStylesV132207');
    if(!style){
      style=document.createElement('style');
      style.id='shapeStudioStylesV132207';
      document.head.appendChild(style);
    }
    style.textContent=`
      /* Shared Decorate shell compaction: all four tabs intentionally use this. */
      .screen[data-screen="outfits"] .board-decorate-shell{gap:5px!important;padding:7px!important}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tabs{gap:4px!important;margin:0!important}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab{min-height:34px!important;padding:6px 5px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;font-size:10px!important;line-height:1!important}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab .tab-icon{font-size:14px!important;line-height:1!important;flex:0 0 auto}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panels{margin:0!important}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panel{gap:6px!important;margin:0!important}
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panel.active{display:grid}

      /* Shape-only refinements. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-studio-intro{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] #shapeStudioInfoV132207,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .shape-studio-info{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-studio-content{display:grid;gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-tool-card{margin-top:0!important}
      .screen[data-screen="outfits"] .shape-studio-info{appearance:none;-webkit-appearance:none;width:100%;display:grid;grid-template-columns:24px minmax(0,1fr) 22px;gap:8px;align-items:start;margin:0!important;padding:8px 10px 6px;border:1px solid rgba(102,113,90,.18);border-radius:11px;background:rgba(238,240,232,.72);color:#665c50;text-align:left;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] .shape-studio-info-icon{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#6d7863;color:#fff;font:800 12px/1 var(--sans)}
      .screen[data-screen="outfits"] .shape-studio-info-copy{display:grid;gap:2px;min-width:0}
      .screen[data-screen="outfits"] .shape-studio-info-copy strong{font-size:9px;line-height:1.15;font-weight:800;color:#52604c;letter-spacing:.02em}
      .screen[data-screen="outfits"] .shape-studio-info-copy span{font-size:9px;line-height:1.35;color:#74695d}
      .screen[data-screen="outfits"] .shape-studio-info-toggle{display:grid;place-items:center;width:22px;height:22px;color:#52604c;font:800 18px/1 var(--sans)}
      .screen[data-screen="outfits"] .shape-studio-info.collapsed{padding-top:5px;padding-bottom:5px}
      .screen[data-screen="outfits"] .shape-studio-info.collapsed .shape-studio-info-copy span{display:none}
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-head{display:none!important}
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-label{display:none!important}
      .screen[data-screen="outfits"] #shapeStudioV132201 .shape-studio-section{gap:4px!important;margin-top:0!important}
      .screen[data-screen="outfits"] #shapeStudioV132201{gap:5px!important;margin-top:2px!important}

      /* dev17: Basic + Fun shapes share one horizontally scrollable row. */
      .screen[data-screen="outfits"] #shapePickerStripV132217{display:flex;align-items:stretch;gap:5px;width:100%;max-width:100%;overflow-x:auto;overflow-y:hidden;padding:1px 1px 5px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x}
      .screen[data-screen="outfits"] #shapePickerStripV132217::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] #shapePickerStripV132217{flex-wrap:nowrap!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217>.shape-picker-btn{display:grid!important;flex:0 0 56px!important;width:56px!important;min-width:56px!important;max-width:56px!important;height:54px!important;padding:4px 2px 3px!important;grid-template-rows:30px auto!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217 .shape-picker-icon{max-width:30px;max-height:30px}
      .screen[data-screen="outfits"] #shapePickerStripV132217>.shape-picker-btn[data-shape-type="rectangle"] .shape-picker-icon{width:40px!important;height:22px!important;max-width:40px!important;max-height:22px!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217>.shape-picker-btn[data-shape-type="rectangle"] .shape-picker-icon svg{width:40px!important;height:22px!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217 .shape-picker-btn small{font-size:7px!important}

      /* dev26: render alignment glyphs directly on the existing button span so creation timing does not matter. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-btn>span{
        display:block!important;width:18px!important;height:14px!important;font-size:0!important;line-height:0!important;overflow:visible!important;transform:none!important;
        background-image:linear-gradient(currentColor,currentColor),linear-gradient(currentColor,currentColor),linear-gradient(currentColor,currentColor)!important;
        background-repeat:no-repeat!important;
        background-size:18px 2px,11px 2px,14px 2px!important
      }
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-left>span{background-position:left 1px,left 6px,left 11px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-center>span{background-position:center 1px,center 6px,center 11px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-right>span{background-position:right 1px,right 6px,right 11px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-btn>span>i{display:none!important}

      /* dev25: explicit three-line alignment glyphs. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-v132225{display:flex!important;flex-direction:column;justify-content:center;gap:2px;width:17px!important;height:15px!important;transform:none!important;overflow:visible!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-v132225 i{display:block;height:2px;border-radius:2px;background:currentColor;flex:0 0 auto}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-v132225 i:nth-child(1){width:17px}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-v132225 i:nth-child(2){width:11px}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-v132225 i:nth-child(3){width:14px}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-left{align-items:flex-start}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-center{align-items:center}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-icon-right{align-items:flex-end}

      /* dev23: remove selected-text informational row to keep Text Studio single-screen compact. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] #boardTextSelectionV132011,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-studio-selection{display:none!important;margin:0!important;padding:0!important;height:0!important;min-height:0!important;border:0!important;overflow:hidden!important}

      /* dev21: compact Text Studio vertically without changing handlers or structure. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-studio{gap:6px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-entry-action-row{gap:5px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-entry-action-row #boardTextInput{height:64px!important;min-height:64px!important;max-height:64px!important;padding:7px 9px!important;font-size:16px!important;line-height:1.18!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-action-stack{grid-template-rows:repeat(2,29px)!important;gap:4px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-entry-action-row .text-studio-action,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-action-stack .text-studio-action{height:29px!important;min-height:29px!important;font-size:10px!important;padding:0 6px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-clear-btn{height:29px!important;font-size:10px!important;padding:0 6px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row{gap:4px!important;grid-template-columns:auto minmax(0,1fr) auto 32px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-studio-label{font-size:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-select{height:32px!important;padding:0 7px!important;font-size:16px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-group{grid-template-columns:repeat(3,32px)!important;gap:3px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-btn{width:32px!important;height:32px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-btn span{font-size:14px!important;width:16px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] #boardTextColorInputV13213{width:32px!important;height:32px!important;min-width:32px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-format-row{gap:4px!important;flex-wrap:nowrap!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-format-btn{width:32px!important;height:30px!important;font-size:12px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-size-group{gap:3px!important;min-width:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-size-btn{height:30px!important;font-size:9px!important;border-radius:9px!important;padding:0 3px!important}

      /* dev14: compact Selected Shape styling controls into one row. */
      .screen[data-screen="outfits"] #shapeEditPanelV132203{gap:4px!important;padding:6px 8px!important}
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-edit-head{min-height:16px}
      .screen[data-screen="outfits"] #shapeEditPanelV132203 .shape-border-control{gap:5px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,.9fr) minmax(0,1.4fr);gap:5px!important;padding-top:0!important;align-items:stretch}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206.hidden{display:none!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-row{display:contents!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-control{min-width:0;min-height:30px!important;padding:3px 5px!important;gap:4px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-control span{font-size:8px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-color-control input[type="color"]{width:28px!important;height:22px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-row{display:grid!important;grid-template-columns:auto minmax(0,1fr);gap:4px!important;align-items:center;min-width:0}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-row>span{font-size:8px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-options{grid-template-columns:1fr 1fr!important;gap:3px!important;min-width:0}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-btn{min-width:0;min-height:30px!important;padding:3px 4px!important;gap:3px!important;font-size:8px!important}
      .screen[data-screen="outfits"] #shapeStyleControlsV132206 .shape-border-style-btn i{width:16px!important}

      @media(max-width:410px){
        .screen[data-screen="outfits"] .board-decorate-shell{padding:6px!important}
        .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tabs{gap:3px!important}
        .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab{min-height:32px!important;padding:5px 3px!important;gap:3px!important;font-size:9px!important}
        .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab .tab-icon{font-size:13px!important}
      }
    `;
  }

  function updateTextAlignIconsV132225(){
    const studio=document.getElementById('boardTextStudioV132011');
    if(!studio)return;
    studio.querySelectorAll('.text-align-btn').forEach(btn=>{
      const align=btn.dataset.textAlign;
      if(!['left','center','right'].includes(align))return;
      if(btn.dataset.alignIconV132225==='true')return;
      btn.dataset.alignIconV132225='true';
      btn.innerHTML='<span class="text-align-icon-v132225 text-align-icon-'+align+'" aria-hidden="true"><i></i><i></i><i></i></span>';
    });
  }

  function removeTextStudioInfoV132224(){
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="text"]');
    if(!panel)return;
    panel.querySelectorAll('#boardTextSelectionV132011,.text-studio-selection').forEach(node=>node.remove());
  }

  function restoreOutfitBoardViewportV132222(){
    const board=document.getElementById('outfitBoard');
    if(!board)return;
    requestAnimationFrame(()=>{
      setTimeout(()=>board.scrollIntoView({behavior:'smooth',block:'start',inline:'nearest'}),260);
    });
  }

  function installTextViewportRestoreV132222(){
    const ta=document.getElementById('boardTextInput');
    if(!ta||ta.dataset.viewportRestoreV132222==='true')return;
    ta.dataset.viewportRestoreV132222='true';
    ta.addEventListener('blur',()=>{
      setTimeout(()=>{
        const active=document.activeElement;
        const studio=document.getElementById('boardTextStudioV132011');
        if(studio&&active&&studio.contains(active))return;
        restoreOutfitBoardViewportV132222();
      },340);
    });
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#addBoardTextBtn'))restoreOutfitBoardViewportV132222();
    },true);
  }

  const previousDrawBoardV132209=drawBoard;
  drawBoard=function(){
    const result=previousDrawBoardV132209.apply(this,arguments);
    requestAnimationFrame(installShapeStudioLayoutV132207);
    return result;
  };

  document.addEventListener('pointerup',e=>{
    if(e.target.closest?.('#outfitBoard'))setTimeout(installShapeStudioLayoutV132207,0);
  },true);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('.decorate-studio-tab[data-decorate-group="shapes"]')||e.target.closest?.('#outfitBoard')){
      setTimeout(installShapeStudioLayoutV132207,0);
    }
  },true);

  const textPanelObserverV132224=new MutationObserver(()=>{removeTextStudioInfoV132224();updateTextAlignIconsV132225()});
  function observeTextPanelV132224(){
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="text"]');
    if(!panel)return;
    textPanelObserverV132224.disconnect();
    textPanelObserverV132224.observe(panel,{childList:true,subtree:true});
    removeTextStudioInfoV132224();
    updateTextAlignIconsV132225();
  }

  const shapePanelObserverV132216=new MutationObserver(()=>{
    removeAllShapeInfoV132216();
    consolidateShapePickerV132217();
    fixRectanglePreviewV132220();
  });
  const observeShapePanelV132216=()=>{
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="shapes"]');
    if(panel){
      shapePanelObserverV132216.disconnect();
      shapePanelObserverV132216.observe(panel,{childList:true,subtree:true});
      removeAllShapeInfoV132216();
    }
  };

  installStylesV132207();
  installShapeStudioLayoutV132207();
  removeTextStudioInfoV132224();
  updateTextAlignIconsV132225();
  installTextViewportRestoreV132222();
  observeTextPanelV132224();
  observeShapePanelV132216();
  setTimeout(observeShapePanelV132216,200);
  setTimeout(observeShapePanelV132216,700);
  setTimeout(observeTextPanelV132224,200);
  setTimeout(observeTextPanelV132224,700);
  setTimeout(installShapeStudioLayoutV132207,200);
  setTimeout(installShapeStudioLayoutV132207,700);
  setTimeout(removeTextStudioInfoV132224,0);
  setTimeout(removeTextStudioInfoV132224,200);
  setTimeout(removeTextStudioInfoV132224,700);
  setTimeout(updateTextAlignIconsV132225,0);
  setTimeout(updateTextAlignIconsV132225,200);
  setTimeout(updateTextAlignIconsV132225,700);
  setTimeout(installTextViewportRestoreV132222,200);
  setTimeout(installTextViewportRestoreV132222,700);

  window.__audreyShapeStudioV132207={sync:installShapeStudioLayoutV132207};
})();

/* Audrey Closet v13.22 Draw Studio dev1 — UI shell and tool-state only. */
(function(){
  'use strict';

  const DRAW_TOOLS=[
    {id:'line',label:'Line',icon:'line'},
    {id:'arrow',label:'Arrow',icon:'arrow'},
    {id:'pencil',label:'Pencil',icon:'pencil'},
    {id:'pen',label:'Pen',icon:'pen'},
    {id:'sharpie',label:'Sharpie',icon:'sharpie'},
    {id:'highlighter',label:'Highlight',icon:'highlighter'},
    {id:'eraser',label:'Eraser',icon:'eraser'}
  ];

  const state={
    tool:'pencil',
    thickness:3,
    color:'#4f514a',
    lineStyle:'solid',
    arrowEnds:'single'
  };

  const defaults={
    line:{thickness:3},
    arrow:{thickness:3},
    pencil:{thickness:2},
    pen:{thickness:4},
    sharpie:{thickness:9},
    highlighter:{thickness:16},
    eraser:{thickness:18}
  };

  function iconMarkup(type){
    if(type==='line')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M5 24L31 6"/></svg>';
    if(type==='arrow')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M5 24L29 7"/><path d="M21 7h8v8"/></svg>';
    if(type==='pencil')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M8 23L24 7l5 5-16 16-7 1z"/><path d="M22 9l5 5"/></svg>';
    if(type==='pen')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M10 24L23 5l7 7-19 13z"/><path d="M10 24l7-7"/><circle cx="19" cy="15" r="1.8"/></svg>';
    if(type==='sharpie')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M9 24L25 6l5 5-16 18z"/><path d="M8 25h8"/><path d="M23 8l5 5"/></svg>';
    if(type==='highlighter')return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M8 23L23 7l7 7-15 15H8z"/><path d="M7 26h14"/><path d="M21 9l7 7"/></svg>';
    return '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M8 19l10-12 11 9-10 12H9z"/><path d="M15 26h14"/></svg>';
  }

  function installStyles(){
    if(document.getElementById('drawStudioStylesV132D1'))return;
    const style=document.createElement('style');
    style.id='drawStudioStylesV132D1';
    style.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-intro{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-content{display:grid;gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-tool-card{margin-top:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
      .screen[data-screen="outfits"] #drawStudioV132D1{display:grid;gap:6px;margin-top:2px}
      .screen[data-screen="outfits"] #drawToolStripV132D1{display:flex;align-items:stretch;gap:5px;width:100%;max-width:100%;overflow-x:auto;overflow-y:hidden;padding:1px 1px 5px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x}
      .screen[data-screen="outfits"] #drawToolStripV132D1::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1{display:grid;flex:0 0 56px;width:56px;min-width:56px;max-width:56px;height:54px;padding:4px 2px 3px;grid-template-rows:30px auto;place-items:center;gap:1px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#665c50;-webkit-tap-highlight-color:transparent}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1:active{transform:scale(.96)}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1.active{border-color:#6d7863;background:#eef0e8;color:#52604c;box-shadow:inset 0 0 0 1px rgba(82,96,76,.18)}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1 small{font-size:7px;line-height:1.05;font-weight:700;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
      .screen[data-screen="outfits"] .draw-tool-icon-v132d1{display:grid;place-items:center;width:32px;height:30px}
      .screen[data-screen="outfits"] .draw-tool-icon-v132d1 svg{display:block;width:32px;height:28px;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1[data-draw-tool="sharpie"] svg{stroke-width:3.5}
      .screen[data-screen="outfits"] .draw-tool-btn-v132d1[data-draw-tool="highlighter"] svg{stroke-width:4.4;opacity:.62}
      .screen[data-screen="outfits"] .draw-options-v132d1{display:grid;gap:5px;padding:7px 8px;border:1px solid rgba(108,81,66,.15);border-radius:11px;background:rgba(255,250,240,.72)}
      .screen[data-screen="outfits"] .draw-option-row-v132d1{display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:7px;align-items:center;min-height:30px}
      .screen[data-screen="outfits"] .draw-option-label-v132d1{font-size:8px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#817568}
      .screen[data-screen="outfits"] #drawThicknessV132D1{width:100%;accent-color:#6d7863}
      .screen[data-screen="outfits"] #drawThicknessValueV132D1{min-width:32px;text-align:right;font-size:9px;font-weight:800;color:#665c50}
      .screen[data-screen="outfits"] .draw-color-wrap-v132d1{display:flex;align-items:center;gap:7px;min-width:0}
      .screen[data-screen="outfits"] #drawColorV132D1{width:34px;height:28px;padding:2px;border:1px solid rgba(108,81,66,.2);border-radius:8px;background:#fff;overflow:hidden}
      .screen[data-screen="outfits"] #drawColorValueV132D1{font-size:9px;color:#74695d;text-transform:uppercase}
      .screen[data-screen="outfits"] .draw-segment-v132d1{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(62px,1fr);gap:4px;justify-content:start}
      .screen[data-screen="outfits"] .draw-segment-btn-v132d1{min-height:30px;padding:4px 8px;border:1px solid rgba(108,81,66,.18);border-radius:9px;background:#fff;color:#665c50;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px}
      .screen[data-screen="outfits"] .draw-segment-btn-v132d1.active{border-color:#6d7863;background:#eef0e8;color:#52604c}
      .screen[data-screen="outfits"] .draw-line-sample-v132d1{display:block;width:22px;border-top:2px solid currentColor}
      .screen[data-screen="outfits"] .draw-line-sample-v132d1.dotted{border-top-style:dotted}
      .screen[data-screen="outfits"] #drawArrowOptionsV132D1.hidden{display:none!important}
      .screen[data-screen="outfits"] .draw-arrow-glyph-v132d1{font-size:15px;line-height:1}
      .screen[data-screen="outfits"] .draw-dev-note-v132d1{margin:0;padding:0 2px;font-size:8px;line-height:1.25;color:#8a7e70}
      @media(max-width:410px){
        .screen[data-screen="outfits"] .draw-tool-btn-v132d1{flex-basis:54px;width:54px;min-width:54px;max-width:54px}
        .screen[data-screen="outfits"] .draw-option-row-v132d1{grid-template-columns:48px minmax(0,1fr) auto;gap:5px}
      }
    `;
    document.head.appendChild(style);
  }

  function sync(){
    const studio=document.getElementById('drawStudioV132D1');
    if(!studio)return;
    studio.querySelectorAll('[data-draw-tool]').forEach(btn=>{
      const active=btn.dataset.drawTool===state.tool;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    studio.querySelectorAll('[data-draw-style]').forEach(btn=>{
      const active=btn.dataset.drawStyle===state.lineStyle;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    studio.querySelectorAll('[data-arrow-ends]').forEach(btn=>{
      const active=btn.dataset.arrowEnds===state.arrowEnds;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const range=document.getElementById('drawThicknessV132D1');
    if(range)range.value=String(state.thickness);
    const value=document.getElementById('drawThicknessValueV132D1');
    if(value)value.textContent=state.thickness+' px';
    const color=document.getElementById('drawColorV132D1');
    if(color)color.value=state.color;
    const colorValue=document.getElementById('drawColorValueV132D1');
    if(colorValue)colorValue.textContent=state.color;
    document.getElementById('drawArrowOptionsV132D1')?.classList.toggle('hidden',state.tool!=='arrow');
  }

  function install(){
    installStyles();
    const content=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-content');
    if(!content||document.getElementById('drawStudioV132D1'))return;

    const intro=content.parentElement?.querySelector(':scope > .decorate-studio-intro');
    if(intro)intro.style.display='none';

    let card=content.querySelector('.decorate-tool-card');
    if(!card){
      card=document.createElement('div');
      card.className='decorate-tool-card';
      content.appendChild(card);
    }
    card.innerHTML='';

    const studio=document.createElement('div');
    studio.id='drawStudioV132D1';
    studio.innerHTML=`
      <div id="drawToolStripV132D1" role="group" aria-label="Drawing tools"></div>
      <div class="draw-options-v132d1">
        <div class="draw-option-row-v132d1">
          <span class="draw-option-label-v132d1">Thickness</span>
          <input id="drawThicknessV132D1" type="range" min="1" max="24" step="1" value="3" aria-label="Drawing thickness">
          <span id="drawThicknessValueV132D1">3 px</span>
        </div>
        <div class="draw-option-row-v132d1">
          <span class="draw-option-label-v132d1">Color</span>
          <div class="draw-color-wrap-v132d1"><input id="drawColorV132D1" type="color" value="#4f514a" aria-label="Drawing color"><span id="drawColorValueV132D1">#4F514A</span></div>
          <span></span>
        </div>
        <div class="draw-option-row-v132d1">
          <span class="draw-option-label-v132d1">Line</span>
          <div class="draw-segment-v132d1" role="group" aria-label="Line style">
            <button type="button" class="draw-segment-btn-v132d1" data-draw-style="solid"><i class="draw-line-sample-v132d1"></i>Solid</button>
            <button type="button" class="draw-segment-btn-v132d1" data-draw-style="dotted"><i class="draw-line-sample-v132d1 dotted"></i>Dotted</button>
          </div>
          <span></span>
        </div>
        <div class="draw-option-row-v132d1 hidden" id="drawArrowOptionsV132D1">
          <span class="draw-option-label-v132d1">Arrow</span>
          <div class="draw-segment-v132d1" role="group" aria-label="Arrow ends">
            <button type="button" class="draw-segment-btn-v132d1" data-arrow-ends="single"><span class="draw-arrow-glyph-v132d1">→</span>Single</button>
            <button type="button" class="draw-segment-btn-v132d1" data-arrow-ends="double"><span class="draw-arrow-glyph-v132d1">↔</span>Double</button>
          </div>
          <span></span>
        </div>
      </div>
      <p class="draw-dev-note-v132d1">Draw Studio dev1: tool and style selection only; Board drawing behavior is unchanged in this build.</p>`;
    card.appendChild(studio);

    const strip=studio.querySelector('#drawToolStripV132D1');
    DRAW_TOOLS.forEach(tool=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='draw-tool-btn-v132d1';
      btn.dataset.drawTool=tool.id;
      btn.setAttribute('aria-label',tool.label+' tool');
      btn.title=tool.label;
      btn.innerHTML='<span class="draw-tool-icon-v132d1">'+iconMarkup(tool.icon)+'</span><small>'+tool.label+'</small>';
      btn.addEventListener('click',()=>{
        state.tool=tool.id;
        if(defaults[tool.id])state.thickness=defaults[tool.id].thickness;
        sync();
      });
      strip.appendChild(btn);
    });

    studio.querySelector('#drawThicknessV132D1').addEventListener('input',e=>{
      state.thickness=Math.max(1,Math.min(24,Number(e.target.value)||1));
      sync();
    });
    studio.querySelector('#drawColorV132D1').addEventListener('input',e=>{
      state.color=String(e.target.value||'#4f514a');
      sync();
    });
    studio.querySelectorAll('[data-draw-style]').forEach(btn=>btn.addEventListener('click',()=>{
      state.lineStyle=btn.dataset.drawStyle==='dotted'?'dotted':'solid';
      sync();
    }));
    studio.querySelectorAll('[data-arrow-ends]').forEach(btn=>btn.addEventListener('click',()=>{
      state.arrowEnds=btn.dataset.arrowEnds==='double'?'double':'single';
      sync();
    }));
    sync();
  }

  const observer=new MutationObserver(()=>install());
  function observe(){
    const shell=document.querySelector('.screen[data-screen="outfits"] .board-decorate-shell')||document.querySelector('.screen[data-screen="outfits"]');
    if(!shell)return;
    observer.disconnect();
    observer.observe(shell,{childList:true,subtree:true});
    install();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.decorate-studio-tab[data-decorate-group="draw"]'))setTimeout(install,0);
  },true);

  installStyles();
  install();
  observe();
  setTimeout(observe,200);
  setTimeout(observe,700);
  setTimeout(install,1200);

  window.__audreyDrawStudioV132D1={state,sync,install};
})();
