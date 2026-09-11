/* Audrey Closet v13.22 Models dev2 — live joint-drag redraw fix */
(function(){
  'use strict';
  const baseDraw=window.drawBoard;
  if(typeof baseDraw!=='function'||window.__audreyModelsTouchFixV1322)return;
  window.__audreyModelsTouchFixV1322=true;

  function selectedModel(){return (window.boardItems||[]).find(x=>x.uid===window.selectedBoardUid&&x.kind==='model')}
  function refreshLivePose(){
    const model=selectedModel();if(!model)return false;
    const el=document.querySelector(`#outfitBoard .board-piece[data-uid="${CSS.escape(model.uid)}"]`);if(!el)return false;
    const svg=window.__audreyModelSvgV1322?.(model.value||'man',model.pose||{});if(!svg)return false;
    const host=el.querySelector('.board-model');if(host)host.innerHTML=svg;
    const def=window.__audreyModelDefsV1322?.[model.value]||window.__audreyModelDefsV1322?.man;
    const rig=window.__audreyModelRigV1322?.(model.value||'man',model.pose||{});if(!def||!rig)return true;
    ['elbowL','wristL','elbowR','wristR','kneeL','ankleL','kneeR','ankleR'].forEach(name=>{
      const h=el.querySelector(`.model-joint-${name}`),p=rig[name];if(!h||!p)return;
      h.style.left=(p.x/120*100)+'%';h.style.top=(p.y/def.viewH*100)+'%';
    });
    return true;
  }

  window.drawBoard=function(){
    if(document.querySelector('#outfitBoard .model-joint.dragging')&&refreshLivePose())return;
    return baseDraw.apply(this,arguments);
  };
  drawBoard=window.drawBoard;

  function finish(){document.querySelectorAll('#outfitBoard .model-joint.dragging').forEach(h=>h.classList.remove('dragging'))}
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',finish,true);
})();
