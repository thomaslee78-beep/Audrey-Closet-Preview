/* Audrey Closet v13.22 Models experiment — dev2 poseable mannequins */
(function(){
  'use strict';

  const MODEL_DEFS={
    man:{label:'Man',tag:'classic form',w:132,h:292,viewH:280},
    woman:{label:'Woman',tag:'classic form',w:132,h:292,viewH:280},
    child:{label:'Child',tag:'small form',w:116,h:238,viewH:240},
    cat:{label:'Cat Person',tag:'just for fun',w:134,h:292,viewH:280,fun:true},
    alien:{label:'Alien',tag:'off-world fit',w:134,h:302,viewH:290,fun:true}
  };
  const DEFAULT_POSE={lUpperArm:-14,lLowerArm:-4,rUpperArm:14,rLowerArm:4,lThigh:-4,lShin:0,rThigh:4,rShin:0};
  const LIMBS={
    adult:{shoulderY:67,shoulderLX:42,shoulderRX:78,upperArm:58,lowerArm:58,hipY:145,hipLX:52,hipRX:68,thigh:58,shin:58},
    child:{shoulderY:62,shoulderLX:43,shoulderRX:77,upperArm:45,lowerArm:43,hipY:128,hipLX:52,hipRX:68,thigh:43,shin:43},
    alien:{shoulderY:88,shoulderLX:43,shoulderRX:77,upperArm:62,lowerArm:62,hipY:166,hipLX:52,hipRX:68,thigh:52,shin:55}
  };

  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  function poseOf(b){const p=b?.pose||{};return Object.fromEntries(Object.keys(DEFAULT_POSE).map(k=>[k,num(p[k],DEFAULT_POSE[k])]))}
  function rad(deg){return deg*Math.PI/180}
  function endPoint(p,len,deg){return{x:p.x+Math.sin(rad(deg))*len,y:p.y+Math.cos(rad(deg))*len}}
  function angleFromDown(a,b){return Math.atan2(b.x-a.x,b.y-a.y)*180/Math.PI}
  function rigFor(type,pose){
    const d=MODEL_DEFS[type]||MODEL_DEFS.man,l=type==='child'?LIMBS.child:(type==='alien'?LIMBS.alien:LIMBS.adult),p={...DEFAULT_POSE,...pose};
    const shoulderL={x:l.shoulderLX,y:l.shoulderY},shoulderR={x:l.shoulderRX,y:l.shoulderY};
    const elbowL=endPoint(shoulderL,l.upperArm,p.lUpperArm),elbowR=endPoint(shoulderR,l.upperArm,p.rUpperArm);
    const wristL=endPoint(elbowL,l.lowerArm,p.lLowerArm),wristR=endPoint(elbowR,l.lowerArm,p.rLowerArm);
    const hipL={x:l.hipLX,y:l.hipY},hipR={x:l.hipRX,y:l.hipY};
    const kneeL=endPoint(hipL,l.thigh,p.lThigh),kneeR=endPoint(hipR,l.thigh,p.rThigh);
    const ankleL=endPoint(kneeL,l.shin,p.lShin),ankleR=endPoint(kneeR,l.shin,p.rShin);
    return{d,l,shoulderL,shoulderR,elbowL,elbowR,wristL,wristR,hipL,hipR,kneeL,kneeR,ankleL,ankleR};
  }
  function segment(a,b,fill,ink,width=9){return `<g stroke-linecap="round"><path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}" stroke="${ink}" stroke-width="${width+4}"/><path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}" stroke="${fill}" stroke-width="${width}"/></g>`}
  function modelSvg(type,pose={}){
    const def=MODEL_DEFS[type]||MODEL_DEFS.man,ink='#554b43',fill='#e7decc',soft='#fbf8ef',r=rigFor(type,pose);
    let head='';
    if(type==='cat')head=`<g stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"><path d="M43 17 L48 3 L57 15 Q60 14 63 15 L72 3 L77 18 Q83 26 79 38 Q73 49 60 49 Q47 49 41 38 Q37 27 43 17Z" fill="${fill}"/><path d="M51 29 l5 1 M69 30 l-5 0" fill="none"/></g>`;
    else if(type==='alien')head=`<g stroke="${ink}" stroke-width="2.4"><path d="M60 4 Q92 7 88 39 Q84 67 60 72 Q36 67 32 39 Q28 7 60 4Z" fill="${fill}"/><path d="M45 31 Q50 23 56 33 Q51 43 45 31 M75 31 Q70 23 64 33 Q69 43 75 31" fill="${ink}" stroke="none"/></g>`;
    else if(type==='child')head=`<circle cx="60" cy="27" r="19" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`;
    else head=`<ellipse cx="60" cy="27" rx="19" ry="22" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`;
    let torso='';
    if(type==='child')torso=`<path d="M43 51 Q60 45 77 51 L80 112 Q73 124 70 137 L68 151 L52 151 L49 137 Q47 124 40 112Z" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`;
    else if(type==='alien')torso=`<path d="M45 75 Q60 68 75 75 L79 138 Q72 153 69 166 L51 166 Q48 153 41 138Z" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`;
    else torso=`<path d="M${type==='woman'?43:40} 54 Q60 ${type==='woman'?45:46} ${type==='woman'?77:80} 54 L${type==='woman'?85:84} ${type==='woman'?113:121} Q76 136 69 151 L51 151 Q44 136 ${type==='woman'?35:36} ${type==='woman'?113:121}Z" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`;
    const limbs=[segment(r.shoulderL,r.elbowL,fill,ink),segment(r.elbowL,r.wristL,fill,ink,8),segment(r.shoulderR,r.elbowR,fill,ink),segment(r.elbowR,r.wristR,fill,ink,8),segment(r.hipL,r.kneeL,fill,ink,11),segment(r.kneeL,r.ankleL,fill,ink,10),segment(r.hipR,r.kneeR,fill,ink,11),segment(r.kneeR,r.ankleR,fill,ink,10)].join('');
    const joints=[r.shoulderL,r.shoulderR,r.elbowL,r.elbowR,r.hipL,r.hipR,r.kneeL,r.kneeR].map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.2" fill="${soft}" stroke="${ink}" stroke-width="1.6"/>`).join('');
    const tail=type==='cat'?`<path d="M76 120 Q108 131 96 175 Q91 191 103 202" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`:'';
    return `<svg viewBox="0 0 120 ${def.viewH}" class="model-svg" aria-hidden="true">${limbs}${torso}${head}${tail}${joints}</svg>`;
  }

  window.__audreyModelDefsV1322=MODEL_DEFS;
  window.__audreyModelSvgV1322=modelSvg;
  window.__audreyModelRigV1322=rigFor;

  const originalBoardItemContent=window.boardItemContent;
  window.boardItemContent=function(b){
    if(b&&b.kind==='model'){
      const def=MODEL_DEFS[b.value]||MODEL_DEFS.man;
      return `<div class="board-model" data-model="${b.value||'man'}" title="${def.label}">${modelSvg(b.value||'man',poseOf(b))}</div>`;
    }
    return originalBoardItemContent(b);
  };
  boardItemContent=window.boardItemContent;

  function bottomZ(){return Math.min(0,...boardItems.map(x=>Number(x.z)||0))-1}
  function addBoardModel(type){
    const def=MODEL_DEFS[type];if(!def)return;
    const board=document.querySelector('#outfitBoard'),bw=board?.clientWidth||390,bh=board?.clientHeight||420;
    const bi={uid:id(),kind:'model',value:type,pose:{...DEFAULT_POSE},x:Math.max(12,(bw-def.w)/2),y:Math.max(20,(bh-def.h)/2),w:def.w,h:def.h,rotation:0,z:bottomZ()};
    boardItems.push(bi);selectedBoardUid=bi.uid;drawBoard();toast(`${def.label} model added — drag the joint dots to pose it`);
  }
  window.__audreyAddBoardModelV1322=addBoardModel;

  function localFromEvent(e,el,model){
    const rect=el.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,a=-rad(num(model.rotation));
    let dx=e.clientX-cx,dy=e.clientY-cy;const rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);
    const def=MODEL_DEFS[model.value]||MODEL_DEFS.man;
    return{x:(rx+rect.width/2)*120/rect.width,y:(ry+rect.height/2)*def.viewH/rect.height};
  }
  function clampAngle(v){return Math.max(-145,Math.min(145,v))}
  const JOINT_MAP={
    elbowL:{anchor:'shoulderL',key:'lUpperArm'},wristL:{anchor:'elbowL',key:'lLowerArm'},
    elbowR:{anchor:'shoulderR',key:'rUpperArm'},wristR:{anchor:'elbowR',key:'rLowerArm'},
    kneeL:{anchor:'hipL',key:'lThigh'},ankleL:{anchor:'kneeL',key:'lShin'},
    kneeR:{anchor:'hipR',key:'rThigh'},ankleR:{anchor:'kneeR',key:'rShin'}
  };
  function poseHandleMarkup(model){
    const def=MODEL_DEFS[model.value]||MODEL_DEFS.man,r=rigFor(model.value,poseOf(model));
    return Object.keys(JOINT_MAP).map(name=>{const p=r[name],left=p.x/120*100,top=p.y/def.viewH*100;return `<button type="button" class="model-joint model-joint-${name}" data-joint="${name}" style="left:${left}%;top:${top}%" aria-label="Adjust ${name}"></button>`}).join('');
  }
  function attachPoseHandles(){
    document.querySelectorAll('#outfitBoard .model-joint').forEach(x=>x.remove());
    const model=boardItems.find(x=>x.uid===selectedBoardUid&&x.kind==='model');if(!model)return;
    const el=document.querySelector(`#outfitBoard .board-piece[data-uid="${CSS.escape(model.uid)}"]`);if(!el)return;
    el.insertAdjacentHTML('beforeend',poseHandleMarkup(model));
    el.querySelectorAll('.model-joint').forEach(h=>{
      h.addEventListener('pointerdown',e=>{
        e.preventDefault();e.stopPropagation();h.setPointerCapture(e.pointerId);h.classList.add('dragging');
        const joint=h.dataset.joint,map=JOINT_MAP[joint];
        const move=ev=>{if(ev.pointerId!==e.pointerId)return;ev.preventDefault();ev.stopPropagation();const r=rigFor(model.value,poseOf(model)),pt=localFromEvent(ev,el,model),anchor=r[map.anchor];model.pose=model.pose||{...DEFAULT_POSE};model.pose[map.key]=clampAngle(angleFromDown(anchor,pt));drawBoard()};
        const up=ev=>{if(ev.pointerId!==e.pointerId)return;h.removeEventListener('pointermove',move);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);drawBoard()};
        h.addEventListener('pointermove',move);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);
      });
    });
    const help=document.querySelector('#boardHelp');if(help)help.textContent='Pose model: drag the joint dots. Drag the model itself to move it; pinch to resize + rotate.';
  }

  const originalDrawBoard=window.drawBoard;
  window.drawBoard=function(){const out=originalDrawBoard();requestAnimationFrame(attachPoseHandles);return out};
  drawBoard=window.drawBoard;

  const originalNormalize=window.normalizeBoardItem;
  window.normalizeBoardItem=function(b){b=originalNormalize(b);if(b?.kind==='model'){b.pose={...DEFAULT_POSE,...(b.pose||{})}}return b};
  normalizeBoardItem=window.normalizeBoardItem;

  function installUI(){
    const picker=document.querySelector('.board-picker-card.board-picker-bottom');if(!picker||document.querySelector('#boardModelsPanel'))return;
    const panel=document.createElement('div');panel.id='boardModelsPanel';panel.className='board-models-panel';
    panel.innerHTML=`<div class="model-picker-head"><div><strong>Models</strong><span>Pose a form under your look</span></div><span class="model-beta">experiment</span></div><div class="model-tray">${Object.entries(MODEL_DEFS).map(([key,d])=>`<button type="button" class="model-pick${d.fun?' fun-model':''}" data-model="${key}"><span class="model-thumb">${modelSvg(key,DEFAULT_POSE)}</span><strong>${d.label}</strong><small>${d.tag}</small></button>`).join('')}</div><p class="model-note">Tap to add. Select the model, then drag its elbow, wrist, knee and ankle dots to pose it under the clothes.</p>`;
    picker.insertBefore(panel,picker.firstChild);panel.querySelectorAll('.model-pick').forEach(btn=>btn.onclick=()=>addBoardModel(btn.dataset.model));
  }
  function installStyles(){
    if(document.querySelector('#boardModelsStyles'))return;const s=document.createElement('style');s.id='boardModelsStyles';s.textContent=`
      .board-models-panel{margin:0 0 14px;padding:13px;border:1px solid rgba(108,81,66,.16);border-radius:18px;background:rgba(255,250,240,.72)}
      .model-picker-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}.model-picker-head>div{display:grid;gap:1px}.model-picker-head strong{font-family:var(--serif);font-size:19px;font-weight:600}.model-picker-head span{font-size:10px;color:#7d7468}.model-beta{padding:4px 8px;border-radius:999px;background:#e8dfca;color:var(--coffee)!important;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
      .model-tray{display:flex;gap:8px;overflow:auto;padding:1px 1px 6px;scrollbar-width:none}.model-pick{width:84px;min-width:84px;border:1px solid var(--line);background:#fffdf7;border-radius:14px;padding:7px 5px 6px;color:var(--ink);font:inherit}.model-pick:active{transform:scale(.98)}.model-pick.fun-model{border-style:dashed}.model-pick strong,.model-pick small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.model-pick strong{font-size:10px;margin-top:3px}.model-pick small{font-size:8px;color:#887b6d}.model-thumb{height:76px;display:flex;align-items:center;justify-content:center}.model-thumb svg{height:74px;width:auto;max-width:64px}
      .model-note{margin:4px 2px 0;font-size:9px;color:#887b6d;line-height:1.35}.board-model,.board-model svg{width:100%;height:100%;display:block}.board-piece.kind-model{filter:drop-shadow(0 4px 4px rgba(50,42,30,.10))}.board-piece.kind-model .board-object{width:100%;height:100%}.snapshot-piece.kind-model .board-model,.snapshot-piece.kind-model svg{width:100%;height:100%;display:block}
      .model-joint{position:absolute;z-index:8;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid #fffaf0;background:var(--turq);box-shadow:0 1px 5px rgba(50,42,30,.35);padding:0;touch-action:none;-webkit-tap-highlight-color:transparent}.model-joint::after{content:"";position:absolute;inset:4px;border-radius:50%;background:#fffaf0}.model-joint:active,.model-joint.dragging{transform:scale(1.18);background:var(--burgundy)}
      .board-piece.kind-model.selected .resize-handle,.board-piece.kind-model.selected .board-remove-handle{z-index:10}
    `;document.head.appendChild(s);
  }
  function init(){installStyles();installUI();requestAnimationFrame(attachPoseHandles)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
