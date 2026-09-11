/* Audrey Closet v13.22 Draw Studio dev12
 * Runs after dev10 + dev11.
 * Activates Line creation while preserving existing freeform/eraser engine.
 * Line is stored as a two-point drawing so save/load and partial eraser work.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioDev10';
  const LINE_OVERLAY='draw-line-overlay-dev12';
  let activeLine=null;
  let boundBoard=null;
  const lineUndo=[];

  function root(){return document.getElementById(ROOT_ID);}
  function selectedTool(){return root()?.querySelector('.draw-tool-btn.active[data-draw-tool]')?.dataset.drawTool||'';}
  function workspaceDecorateActive(){
    const tab=document.querySelector('.screen[data-screen="outfits"] .board-workspace-tab[data-board-panel="decorate"]');
    const panel=document.querySelector('.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }
  function drawTabActive(){
    const tab=document.querySelector('.decorate-studio-tab[data-decorate-group="draw"]');
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    return !!tab&&tab.classList.contains('active')&&!!panel&&panel.classList.contains('active');
  }
  function lineContext(){return workspaceDecorateActive()&&drawTabActive()&&selectedTool()==='line';}
  function currentThickness(){return Math.max(1,Number(root()?.querySelector('#drawThicknessDev10')?.value)||3);}
  function currentColor(){return root()?.querySelector('#drawColorDev10')?.value||'#30343b';}
  function currentLineStyle(){return root()?.querySelector('.draw-seg-btn.active[data-line-style]')?.dataset.lineStyle==='dotted'?'dotted':'solid';}
  function pointOnBoard(board,e){
    const r=board.getBoundingClientRect();
    const sx=r.width?board.clientWidth/r.width:1,sy=r.height?board.clientHeight/r.height:1;
    return{x:Math.max(0,Math.min(board.clientWidth,(e.clientX-r.left)*sx)),y:Math.max(0,Math.min(board.clientHeight,(e.clientY-r.top)*sy))};
  }
  function ensureStyles(){
    if(document.getElementById('drawLineDev12Styles'))return;
    const s=document.createElement('style');s.id='drawLineDev12Styles';s.textContent=`
      #outfitBoard.draw-line-dev12-active{touch-action:none!important;cursor:crosshair}
      #outfitBoard .${LINE_OVERLAY}{position:absolute;inset:0;width:100%;height:100%;z-index:2147483002;pointer-events:none;overflow:visible}
    `;document.head.appendChild(s);
  }
  function ensureOverlay(board,start){
    board.querySelector('.'+LINE_OVERLAY)?.remove();
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class',LINE_OVERLAY);svg.setAttribute('viewBox',`0 0 ${Math.max(1,board.clientWidth)} ${Math.max(1,board.clientHeight)}`);svg.setAttribute('preserveAspectRatio','none');
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',start.x);line.setAttribute('y1',start.y);line.setAttribute('x2',start.x);line.setAttribute('y2',start.y);line.setAttribute('stroke',currentColor());line.setAttribute('stroke-width',String(currentThickness()));line.setAttribute('stroke-linecap','round');
    if(currentLineStyle()==='dotted'){const w=currentThickness();line.setAttribute('stroke-dasharray',`${Math.max(1,w*.6)} ${Math.max(2,w*2.2)}`);}
    svg.appendChild(line);board.appendChild(svg);return{svg,line};
  }
  function updateContextClass(){
    const board=document.getElementById('outfitBoard');
    if(!board)return;
    board.classList.toggle('draw-line-dev12-active',lineContext());
    if(!lineContext()){board.querySelector('.'+LINE_OVERLAY)?.remove();activeLine=null;}
  }
  function begin(board,e){
    if(!lineContext()||e.button>0)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const start=pointOnBoard(board,e),overlay=ensureOverlay(board,start);
    activeLine={pointerId:e.pointerId,start,end:start,svg:overlay.svg,line:overlay.line,thickness:currentThickness(),color:currentColor(),lineStyle:currentLineStyle()};
    try{board.setPointerCapture(e.pointerId)}catch(_){}
  }
  function move(board,e){
    if(!activeLine||e.pointerId!==activeLine.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    activeLine.end=pointOnBoard(board,e);activeLine.line.setAttribute('x2',activeLine.end.x);activeLine.line.setAttribute('y2',activeLine.end.y);
  }
  function finish(board,e,cancelled){
    if(!activeLine||e.pointerId!==activeLine.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const a=activeLine;activeLine=null;try{board.releasePointerCapture(e.pointerId)}catch(_){}a.svg?.remove();if(cancelled)return;
    const dx=a.end.x-a.start.x,dy=a.end.y-a.start.y;if(dx*dx+dy*dy<9)return;
    if(typeof boardItems==='undefined'||typeof id!=='function'||typeof nextZ!=='function'||typeof drawBoard!=='function')return;
    const pad=Math.max(3,a.thickness*1.5),minX=Math.max(0,Math.min(a.start.x,a.end.x)-pad),minY=Math.max(0,Math.min(a.start.y,a.end.y)-pad),maxX=Math.min(board.clientWidth,Math.max(a.start.x,a.end.x)+pad),maxY=Math.min(board.clientHeight,Math.max(a.start.y,a.end.y)+pad),w=Math.max(2,maxX-minX),h=Math.max(2,maxY-minY),uid=id();
    const points=`${(a.start.x-minX).toFixed(1)},${(a.start.y-minY).toFixed(1)} ${(a.end.x-minX).toFixed(1)},${(a.end.y-minY).toFixed(1)}`;
    boardItems.push({uid,kind:'drawing',drawingType:'freeform',tool:'line',strokeColor:a.color,strokeWidth:a.thickness,strokeStyle:a.lineStyle,opacity:1,points,x:minX,y:minY,w,h,rotation:0,z:nextZ()});
    lineUndo.push(uid);if(lineUndo.length>50)lineUndo.shift();
    if(typeof selectedBoardUid!=='undefined')selectedBoardUid=null;drawBoard();syncLineUndo();
  }
  function syncLineUndo(){
    const btn=root()?.querySelector('.draw-undo-btn');if(!btn)return;
    if(lineContext()&&lineUndo.length)btn.disabled=false;
  }
  function undoLine(){
    if(typeof boardItems==='undefined'||typeof drawBoard!=='function')return false;
    while(lineUndo.length){const uid=lineUndo.pop(),i=boardItems.findIndex(x=>x?.uid===uid);if(i<0)continue;boardItems.splice(i,1);drawBoard();syncLineUndo();return true;}return false;
  }
  function bindBoard(){
    const board=document.getElementById('outfitBoard');if(!board||board===boundBoard)return;
    if(boundBoard){boundBoard.removeEventListener('pointerdown',onDown,true);boundBoard.removeEventListener('pointermove',onMove,true);boundBoard.removeEventListener('pointerup',onUp,true);boundBoard.removeEventListener('pointercancel',onCancel,true);}
    boundBoard=board;board.addEventListener('pointerdown',onDown,true);board.addEventListener('pointermove',onMove,true);board.addEventListener('pointerup',onUp,true);board.addEventListener('pointercancel',onCancel,true);updateContextClass();
  }
  function onDown(e){begin(boundBoard,e);}function onMove(e){move(boundBoard,e);}function onUp(e){finish(boundBoard,e,false);}function onCancel(e){finish(boundBoard,e,true);}
  function updateStatus(){
    const r=root();if(!r)return;const hint=r.querySelector('.draw-mode-hint'),status=r.querySelector('.draw-tool-status');
    if(selectedTool()==='line'){
      if(status)status.textContent=`Line · ${currentThickness()}px · ${currentLineStyle()}`;
      if(hint)hint.textContent=lineContext()?'Drag from start point to end point · release to place':'Line remembered for next Draw visit';
    }
    syncLineUndo();updateContextClass();
  }
  function start(){
    ensureStyles();bindBoard();
    document.addEventListener('click',e=>{
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('#drawStudioDev10 .draw-undo-btn')&&lineContext()&&lineUndo.length){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();undoLine();return;}
      setTimeout(()=>{bindBoard();updateStatus();},0);
      [80,220,500].forEach(ms=>setTimeout(()=>{bindBoard();updateStatus();},ms));
    },true);
    window.addEventListener('pageshow',()=>setTimeout(()=>{bindBoard();updateStatus();},0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{bindBoard();updateStatus();},0);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
