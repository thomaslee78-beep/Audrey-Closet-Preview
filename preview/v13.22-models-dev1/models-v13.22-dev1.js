/* Audrey Closet v13.22 Models experiment — dev1 */
(function(){
  'use strict';

  const MODEL_DEFS={
    man:{label:'Man',tag:'classic form',w:126,h:286},
    woman:{label:'Woman',tag:'classic form',w:126,h:286},
    child:{label:'Child',tag:'small form',w:112,h:232},
    cat:{label:'Cat Person',tag:'just for fun',w:128,h:286},
    alien:{label:'Alien',tag:'off-world fit',w:128,h:298}
  };

  function modelSvg(type){
    const ink='#554b43',fill='#e7decc',soft='#fbf8ef';
    const common=`stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if(type==='woman')return `<svg viewBox="0 0 120 280" class="model-svg" aria-hidden="true"><g ${common}><ellipse cx="60" cy="27" rx="19" ry="22" fill="${fill}"/><path d="M43 54 Q60 45 77 54 L85 113 Q75 132 73 151 L80 259 Q72 270 64 259 L59 164 L55 259 Q47 270 39 259 L47 151 Q45 132 35 113Z" fill="${fill}"/><path d="M39 67 L19 142 M81 67 L101 142" fill="none"/><circle cx="19" cy="145" r="4" fill="${soft}"/><circle cx="101" cy="145" r="4" fill="${soft}"/></g></svg>`;
    if(type==='child')return `<svg viewBox="0 0 120 240" class="model-svg" aria-hidden="true"><g ${common}><circle cx="60" cy="27" r="19" fill="${fill}"/><path d="M43 51 Q60 45 77 51 L80 112 Q72 126 70 141 L75 218 Q68 226 61 218 L59 148 L56 218 Q49 226 42 218 L48 141 Q47 126 40 112Z" fill="${fill}"/><path d="M42 63 L23 130 M78 63 L97 130" fill="none"/></g></svg>`;
    if(type==='cat')return `<svg viewBox="0 0 120 280" class="model-svg" aria-hidden="true"><g ${common}><path d="M43 17 L48 3 L57 15 Q60 14 63 15 L72 3 L77 18 Q83 26 79 38 Q73 49 60 49 Q47 49 41 38 Q37 27 43 17Z" fill="${fill}"/><path d="M43 54 Q60 46 77 54 L82 120 Q74 134 71 151 L78 259 Q70 269 63 259 L59 164 L55 259 Q47 269 39 259 L47 151 Q44 134 38 120Z" fill="${fill}"/><path d="M40 67 L18 143 M80 67 L102 143" fill="none"/><path d="M77 119 Q108 131 96 175 Q91 191 103 202" fill="none"/><path d="M51 29 l5 1 M69 30 l-5 0" fill="none"/></g></svg>`;
    if(type==='alien')return `<svg viewBox="0 0 120 290" class="model-svg" aria-hidden="true"><g ${common}><path d="M60 4 Q92 7 88 39 Q84 67 60 72 Q36 67 32 39 Q28 7 60 4Z" fill="${fill}"/><path d="M45 31 Q50 23 56 33 Q51 43 45 31 M75 31 Q70 23 64 33 Q69 43 75 31" fill="${ink}" stroke="none"/><path d="M45 75 Q60 68 75 75 L79 138 Q71 151 69 166 L75 269 Q68 279 61 269 L59 178 L56 269 Q49 279 42 269 L49 166 Q46 151 41 138Z" fill="${fill}"/><path d="M42 86 L16 166 M78 86 L104 166" fill="none"/></g></svg>`;
    return `<svg viewBox="0 0 120 280" class="model-svg" aria-hidden="true"><g ${common}><ellipse cx="60" cy="27" rx="19" ry="22" fill="${fill}"/><path d="M40 54 Q60 46 80 54 L84 121 Q75 135 72 151 L79 259 Q71 270 64 259 L60 164 L56 259 Q48 270 40 259 L48 151 Q45 135 36 121Z" fill="${fill}"/><path d="M39 66 L17 145 M81 66 L103 145" fill="none"/><circle cx="17" cy="148" r="4" fill="${soft}"/><circle cx="103" cy="148" r="4" fill="${soft}"/></g></svg>`;
  }

  window.__audreyModelDefsV1322=MODEL_DEFS;
  window.__audreyModelSvgV1322=modelSvg;

  const originalBoardItemContent=window.boardItemContent;
  window.boardItemContent=function(b){
    if(b&&b.kind==='model'){
      const def=MODEL_DEFS[b.value]||MODEL_DEFS.man;
      return `<div class="board-model" data-model="${b.value||'man'}" title="${def.label}">${modelSvg(b.value||'man')}</div>`;
    }
    return originalBoardItemContent(b);
  };
  boardItemContent=window.boardItemContent;

  function bottomZ(){return Math.min(0,...boardItems.map(x=>Number(x.z)||0))-1}
  function addBoardModel(type){
    const def=MODEL_DEFS[type];if(!def)return;
    const board=document.querySelector('#outfitBoard');
    const bw=board?.clientWidth||390,bh=board?.clientHeight||420;
    const bi={uid:id(),kind:'model',value:type,x:Math.max(12,(bw-def.w)/2),y:Math.max(20,(bh-def.h)/2),w:def.w,h:def.h,rotation:0,z:bottomZ()};
    boardItems.push(bi);selectedBoardUid=bi.uid;drawBoard();
    toast(`${def.label} model added behind the look`);
  }
  window.__audreyAddBoardModelV1322=addBoardModel;

  function installUI(){
    const picker=document.querySelector('.board-picker-card.board-picker-bottom');if(!picker||document.querySelector('#boardModelsPanel'))return;
    const panel=document.createElement('div');panel.id='boardModelsPanel';panel.className='board-models-panel';
    panel.innerHTML=`<div class="model-picker-head"><div><strong>Models</strong><span>Try the look on a form</span></div><span class="model-beta">experiment</span></div><div class="model-tray">${Object.entries(MODEL_DEFS).map(([key,d])=>`<button type="button" class="model-pick" data-model="${key}"><span class="model-thumb">${modelSvg(key)}</span><strong>${d.label}</strong><small>${d.tag}</small></button>`).join('')}</div><p class="model-note">Tap a model to place it behind your clothes. Move, resize, rotate and layer it like anything else on the board.</p>`;
    picker.insertBefore(panel,picker.firstChild);
    panel.querySelectorAll('.model-pick').forEach(btn=>btn.onclick=()=>addBoardModel(btn.dataset.model));
  }

  function installStyles(){
    if(document.querySelector('#boardModelsStyles'))return;
    const s=document.createElement('style');s.id='boardModelsStyles';s.textContent=`
      .board-models-panel{margin:0 0 14px;padding:13px;border:1px solid rgba(108,81,66,.16);border-radius:18px;background:rgba(255,250,240,.72)}
      .model-picker-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}.model-picker-head>div{display:grid;gap:1px}.model-picker-head strong{font-family:var(--serif);font-size:19px;font-weight:600}.model-picker-head span{font-size:10px;color:#7d7468}.model-beta{padding:4px 8px;border-radius:999px;background:#e8dfca;color:var(--coffee)!important;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
      .model-tray{display:flex;gap:8px;overflow:auto;padding:1px 1px 6px;scrollbar-width:none}.model-pick{width:84px;min-width:84px;border:1px solid var(--line);background:#fffdf7;border-radius:14px;padding:7px 5px 6px;color:var(--ink);font:inherit}.model-pick:active{transform:scale(.98)}.model-pick strong,.model-pick small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.model-pick strong{font-size:10px;margin-top:3px}.model-pick small{font-size:8px;color:#887b6d}.model-thumb{height:76px;display:flex;align-items:center;justify-content:center}.model-thumb svg{height:74px;width:auto;max-width:64px;filter:none}
      .model-note{margin:4px 2px 0;font-size:9px;color:#887b6d;line-height:1.35}.board-model,.board-model svg{width:100%;height:100%;display:block}.board-piece.kind-model{filter:drop-shadow(0 4px 4px rgba(50,42,30,.10))}.board-piece.kind-model .board-object{width:100%;height:100%}.snapshot-piece.kind-model .board-model,.snapshot-piece.kind-model svg{width:100%;height:100%;display:block}
    `;document.head.appendChild(s);
  }

  function init(){installStyles();installUI()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
