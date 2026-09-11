/* Audrey Closet v13.22 Draw Studio dev13
 * Runs after dev10 + dev11 + dev12.
 * Activates Arrow creation with Single/Double end controls.
 * Adds arrow-specific rendering so arrowheads persist after redraw/save/load.
 */
(function(){
  'use strict';

  const ROOT_ID='drawStudioDev10';
  const OVERLAY_CLASS='draw-arrow-overlay-dev13';
  const STYLE_ID='drawArrowDev13Styles';
  let activeArrow=null;
  let boundBoard=null;
  const arrowUndo=[];
  let rendererInstalled=false;
  let arrowEnds='single';

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}
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
  function arrowContext(){return workspaceDecorateActive()&&drawTabActive()&&selectedTool()==='arrow';}
  function currentThickness(){return Math.max(1,Number(root()?.querySelector('#drawThicknessDev10')?.value)||3);}
  function currentColor(){return root()?.querySelector('#drawColorDev10')?.value||'#30343b';}
  function currentLineStyle(){return root()?.querySelector('.draw-seg-btn.active[data-line-style]')?.dataset.lineStyle==='dotted'?'dotted':'solid';}
  function pointOnBoard(board,e){
    const r=board.getBoundingClientRect();
    const sx=r.width?board.clientWidth/r.width:1,sy=r.height?board.clientHeight/r.height:1;
    return{x:Math.max(0,Math.min(board.clientWidth,(e.clientX-r.left)*sx)),y:Math.max(0,Math.min(board.clientHeight,(e.clientY-r.top)*sy))};
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #outfitBoard.draw-arrow-dev13-active{touch-action:none!important;cursor:crosshair}
      #outfitBoard .${OVERLAY_CLASS}{position:absolute;inset:0;width:100%;height:100%;z-index:2147483003;pointer-events:none;overflow:visible}
      .board-piece .drawing-arrow-svg-dev13{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-arrow-settings.dev13-arrow-settings{display:flex;gap:3px;align-items:center}
    `;document.head.appendChild(s);
  }

  function arrowHeadPoints(x1,y1,x2,y2,size){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
    const ux=dx/len,uy=dy/len,px=-uy,py=ux;
    const backX=x2-ux*size,backY=y2-uy*size,half=size*.48;
    return `${x2.toFixed(1)},${y2.toFixed(1)} ${(backX+px*half).toFixed(1)},${(backY+py*half).toFixed(1)} ${(backX-px*half).toFixed(1)},${(backY-py*half).toFixed(1)}`;
  }

  function parseTwoPoints(points){
    const pts=String(points||'').trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));
    return pts.length>=2?pts.slice(0,2):null;
  }

  function installRenderer(){
    if(rendererInstalled)return true;
    if(typeof boardItemContent!=='function')return false;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='drawing'&&b.tool==='arrow'){
        const pts=parseTwoPoints(b.points);
        if(pts){
          const [[x1,y1],[x2,y2]]=pts;
          const w=Math.max(1,Number(b.w)||1),h=Math.max(1,Number(b.h)||1);
          const color=esc(b.strokeColor||'#30343b');
          const width=Math.max(1,Number(b.strokeWidth)||3);
          const dash=b.strokeStyle==='dotted'?`${Math.max(1,width*.6)} ${Math.max(2,width*2.2)}`:'';
          const headSize=Math.max(9,width*3.2);
          const endHead=arrowHeadPoints(x1,y1,x2,y2,headSize);
          const startHead=b.arrowStart?arrowHeadPoints(x2,y2,x1,y1,headSize):'';
          return `<svg class="drawing-arrow-svg-dev13" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash?` stroke-dasharray="${dash}"`:''} vector-effect="non-scaling-stroke"/><polygon points="${endHead}" fill="${color}"/>${startHead?`<polygon points="${startHead}" fill="${color}"/>`:''}</svg>`;
        }
      }
      return original(b);
    };
    rendererInstalled=true;
    return true;
  }

  function ensureArrowControls(){
    const r=root();if(!r)return;
    let wrap=r.querySelector('.draw-arrow-settings');
    if(!wrap)return;
    wrap.classList.add('dev13-arrow-settings');
    wrap.innerHTML='<span class="draw-control-label">Arrow</span><button type="button" class="draw-seg-btn" data-arrow-ends="single">Single</button><button type="button" class="draw-seg-btn" data-arrow-ends="double">Double</button>';
    wrap.querySelectorAll('[data-arrow-ends]').forEach(btn=>btn.addEventListener('click',()=>{arrowEnds=btn.dataset.arrowEnds==='double'?'double':'single';syncArrowControls();}));
    syncArrowControls();
  }

  function syncArrowControls(){
    const r=root();if(!r)return;
    const wrap=r.querySelector('.draw-arrow-settings');
    if(wrap)wrap.classList.toggle('hidden',selectedTool()!=='arrow');
    r.querySelectorAll('[data-arrow-ends]').forEach(btn=>{const active=btn.dataset.arrowEnds===arrowEnds;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
  }

  function ensureOverlay(board,start){
    board.querySelector('.'+OVERLAY_CLASS)?.remove();
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class',OVERLAY_CLASS);svg.setAttribute('viewBox',`0 0 ${Math.max(1,board.clientWidth)} ${Math.max(1,board.clientHeight)}`);svg.setAttribute('preserveAspectRatio','none');
    const shaft=document.createElementNS('http://www.w3.org/2000/svg','line');
    shaft.setAttribute('x1',start.x);shaft.setAttribute('y1',start.y);shaft.setAttribute('x2',start.x);shaft.setAttribute('y2',start.y);shaft.setAttribute('stroke',currentColor());shaft.setAttribute('stroke-width',String(currentThickness()));shaft.setAttribute('stroke-linecap','round');
    if(currentLineStyle()==='dotted'){const w=currentThickness();shaft.setAttribute('stroke-dasharray',`${Math.max(1,w*.6)} ${Math.max(2,w*2.2)}`);}
    const endHead=document.createElementNS('http://www.w3.org/2000/svg','polygon');endHead.setAttribute('fill',currentColor());
    const startHead=document.createElementNS('http://www.w3.org/2000/svg','polygon');startHead.setAttribute('fill',currentColor());
    svg.appendChild(shaft);svg.appendChild(endHead);svg.appendChild(startHead);board.appendChild(svg);
    return{svg,shaft,endHead,startHead};
  }

  function updateOverlay(a){
    const size=Math.max(9,a.thickness*3.2);
    a.shaft.setAttribute('x2',a.end.x);a.shaft.setAttribute('y2',a.end.y);
    a.endHead.setAttribute('points',arrowHeadPoints(a.start.x,a.start.y,a.end.x,a.end.y,size));
    if(a.arrowEnds==='double')a.startHead.setAttribute('points',arrowHeadPoints(a.end.x,a.end.y,a.start.x,a.start.y,size));
    else a.startHead.removeAttribute('points');
  }

  function updateContextClass(){
    const board=document.getElementById('outfitBoard');if(!board)return;
    board.classList.toggle('draw-arrow-dev13-active',arrowContext());
    if(!arrowContext()){board.querySelector('.'+OVERLAY_CLASS)?.remove();activeArrow=null;}
    syncArrowControls();
  }

  function begin(board,e){
    if(!arrowContext()||e.button>0)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const start=pointOnBoard(board,e),o=ensureOverlay(board,start);
    activeArrow={pointerId:e.pointerId,start,end:start,...o,thickness:currentThickness(),color:currentColor(),lineStyle:currentLineStyle(),arrowEnds};
    updateOverlay(activeArrow);
    try{board.setPointerCapture(e.pointerId)}catch(_){}
  }
  function move(board,e){
    if(!activeArrow||e.pointerId!==activeArrow.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    activeArrow.end=pointOnBoard(board,e);updateOverlay(activeArrow);
  }
  function finish(board,e,cancelled){
    if(!activeArrow||e.pointerId!==activeArrow.pointerId)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    const a=activeArrow;activeArrow=null;try{board.releasePointerCapture(e.pointerId)}catch(_){}a.svg?.remove();if(cancelled)return;
    const dx=a.end.x-a.start.x,dy=a.end.y-a.start.y;if(dx*dx+dy*dy<25)return;
    if(typeof boardItems==='undefined'||typeof id!=='function'||typeof nextZ!=='function'||typeof drawBoard!=='function')return;
    const headPad=Math.max(12,a.thickness*4),minX=Math.max(0,Math.min(a.start.x,a.end.x)-headPad),minY=Math.max(0,Math.min(a.start.y,a.end.y)-headPad),maxX=Math.min(board.clientWidth,Math.max(a.start.x,a.end.x)+headPad),maxY=Math.min(board.clientHeight,Math.max(a.start.y,a.end.y)+headPad),w=Math.max(2,maxX-minX),h=Math.max(2,maxY-minY),uid=id();
    const points=`${(a.start.x-minX).toFixed(1)},${(a.start.y-minY).toFixed(1)} ${(a.end.x-minX).toFixed(1)},${(a.end.y-minY).toFixed(1)}`;
    boardItems.push({uid,kind:'drawing',drawingType:'arrow',tool:'arrow',strokeColor:a.color,strokeWidth:a.thickness,strokeStyle:a.lineStyle,opacity:1,points,arrowStart:a.arrowEnds==='double',arrowEnd:true,x:minX,y:minY,w,h,rotation:0,z:nextZ()});
    arrowUndo.push(uid);if(arrowUndo.length>50)arrowUndo.shift();
    if(typeof selectedBoardUid!=='undefined')selectedBoardUid=null;drawBoard();syncArrowUndo();
  }

  function syncArrowUndo(){const btn=root()?.querySelector('.draw-undo-btn');if(btn&&arrowContext()&&arrowUndo.length)btn.disabled=false;}
  function undoArrow(){
    if(typeof boardItems==='undefined'||typeof drawBoard!=='function')return false;
    while(arrowUndo.length){const uid=arrowUndo.pop(),i=boardItems.findIndex(x=>x?.uid===uid);if(i<0)continue;boardItems.splice(i,1);drawBoard();syncArrowUndo();return true;}return false;
  }

  function bindBoard(){
    const board=document.getElementById('outfitBoard');if(!board||board===boundBoard)return;
    if(boundBoard){boundBoard.removeEventListener('pointerdown',onDown,true);boundBoard.removeEventListener('pointermove',onMove,true);boundBoard.removeEventListener('pointerup',onUp,true);boundBoard.removeEventListener('pointercancel',onCancel,true);}
    boundBoard=board;board.addEventListener('pointerdown',onDown,true);board.addEventListener('pointermove',onMove,true);board.addEventListener('pointerup',onUp,true);board.addEventListener('pointercancel',onCancel,true);updateContextClass();
  }
  function onDown(e){begin(boundBoard,e);}function onMove(e){move(boundBoard,e);}function onUp(e){finish(boundBoard,e,false);}function onCancel(e){finish(boundBoard,e,true);}

  function updateStatus(){
    const r=root();if(!r)return;
    ensureArrowControls();
    if(selectedTool()==='arrow'){
      const status=r.querySelector('.draw-tool-status'),hint=r.querySelector('.draw-mode-hint');
      if(status)status.textContent=`Arrow · ${currentThickness()}px · ${currentLineStyle()} · ${arrowEnds}`;
      if(hint)hint.textContent=arrowContext()?'Drag from start point to end point · release to place':'Arrow remembered for next Draw visit';
    }
    syncArrowUndo();updateContextClass();
  }

  function start(){
    ensureStyles();installRenderer();bindBoard();ensureArrowControls();updateStatus();
    document.addEventListener('click',e=>{
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('#drawStudioDev10 .draw-undo-btn')&&arrowContext()&&arrowUndo.length){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();undoArrow();return;}
      setTimeout(()=>{installRenderer();bindBoard();updateStatus();},0);
      [80,220,500].forEach(ms=>setTimeout(()=>{installRenderer();bindBoard();updateStatus();},ms));
    },true);
    window.addEventListener('pageshow',()=>setTimeout(()=>{installRenderer();bindBoard();updateStatus();},0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{installRenderer();bindBoard();updateStatus();},0);});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
