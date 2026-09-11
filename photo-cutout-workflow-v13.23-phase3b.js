/* Audrey Closet v13.23 Cutout Phase 3B — Easy / Guided workflow UI.
 * UI + generic guide editing only. Canonical persistence stays owned by Phase 3A.
 * Shirt is the default registered guide. Image-processing integration is Phase 3C.
 */
(function(){
'use strict';

const stateApi=()=>window.__audreyCutoutState;
const canvas=()=>document.getElementById('studioCanvas');
const wrap=()=>canvas()?.closest('.studio-canvas-wrap')||null;
const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const DEF_TRANSFORM={x:360,y:360,width:330,height:430,rotation:0};
let visible=false;
let editing=false;
let locked=false;
let drag=null;
let initializedFor=null;
let workflowUi=null;

function guideDef(type='shirt'){return stateApi()?.getGuideTypes?.().find(x=>x.id===type)||null;}
function newGuide(type='shirt'){
  const external=window.__audreyGarmentGuides?.createGuide?.(type);if(external)return external;
  const def=guideDef(type)||guideDef('shirt');
  return {
    schemaVersion:1,type:def?.id||'shirt',geometryVersion:def?.geometryVersion||2,
    applied:false,dirty:false,
    points:clone(def?.defaultPoints||[]),
    transform:{...DEF_TRANSFORM},protection:70,baseResult:'',appliedShape:null
  };
}
function currentState(){return stateApi()?.getState?.(target())||null;}
function persistState(next){stateApi()?.persist?.(target(),next);return next;}
function updateState(mutator){const cur=currentState();if(!cur)return null;const next=clone(cur);mutator(next);return persistState(next);}
function ensureGuide(state){
  if(state.guide&&guideDef(state.guide.type))return state.guide;
  state.guide=newGuide('shirt');return state.guide;
}

function styles(){
  if(document.getElementById('cutoutPhase3BStyles'))return;
  const s=document.createElement('style');s.id='cutoutPhase3BStyles';s.textContent=`
  .cutout-workflow-3b{display:grid;gap:8px;margin:0 0 10px;padding:10px;border:1px solid rgba(108,81,66,.14);border-radius:14px;background:rgba(255,250,240,.76)}
  .cutout-workflow-3b-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.cutout-workflow-3b-head strong{font:850 11px/1.1 system-ui;color:#5d5348}.cutout-workflow-3b-head small{font:750 9px/1 system-ui;color:#8a7d70}
  .cutout-workflow-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cutout-workflow-btn{min-height:39px;border:1px solid rgba(108,81,66,.18);border-radius:11px;background:#f8f1e3;color:#675d51;font:850 10px/1 system-ui}.cutout-workflow-btn.active{background:#6d7863;border-color:#6d7863;color:white}.cutout-workflow-help{margin:0;font:9.5px/1.35 system-ui;color:#817568}
  .cutout-guide-3b{display:grid;gap:8px;margin:0 0 10px;padding:10px;border:1px solid rgba(125,53,71,.14);border-radius:13px;background:rgba(255,255,255,.55)}.cutout-guide-3b.hidden{display:none!important}.cutout-guide-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.cutout-guide-head strong{font:850 11px/1 system-ui;color:#5d5348}.cutout-guide-status{font:800 9px/1 system-ui;color:#7d3547}.cutout-guide-status.applied{color:#52604d}
  .cutout-guide-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.cutout-guide-btn{min-height:36px;padding:6px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 9px/1.15 system-ui}.cutout-guide-btn.active{background:#6d7863;border-color:#6d7863;color:white}.cutout-guide-apply{min-height:41px;border:0;border-radius:11px;background:#7d3547;color:white;font:850 10px/1 system-ui}.cutout-guide-apply.dirty{box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}.cutout-guide-note{margin:0;font:9px/1.35 system-ui;color:#817568}
  .cutout-shirt-overlay{position:absolute;z-index:16;box-sizing:border-box;transform-origin:50% 50%;overflow:visible!important;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none}.cutout-shirt-overlay.hidden{display:none!important}.cutout-shirt-overlay.editing{pointer-events:auto}.cutout-shirt-outline{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.cutout-shirt-outline polygon{fill:rgba(125,53,71,.055);stroke:#7d3547;stroke-width:2;stroke-dasharray:8 6;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 1px white) drop-shadow(0 1px 1px rgba(0,0,0,.7))}.cutout-shirt-overlay.dirty .cutout-shirt-outline polygon{fill:rgba(125,53,71,.10)}
  .cutout-shirt-label{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);font:900 10px/1 system-ui;letter-spacing:.07em;color:#7d3547;text-shadow:-1px -1px white,1px -1px white,-1px 1px white,1px 1px white;pointer-events:none;white-space:nowrap}.cutout-shirt-overlay.locked .cutout-shirt-label::after{content:'  🔒';font-size:9px}
  .cutout-shirt-point{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border:0;background:transparent;padding:0;touch-action:none;display:none}.cutout-shirt-point::after{content:'';position:absolute;left:9px;top:9px;width:14px;height:14px;border-radius:50%;background:white;border:3px solid #7d3547;box-shadow:0 0 0 1px white,0 1px 5px rgba(0,0,0,.45)}.cutout-shirt-point[data-i="5"]::after,.cutout-shirt-point[data-i="8"]::after{background:#fff7d6}.cutout-shirt-overlay.editing .cutout-shirt-point{display:block}
  .cutout-shirt-resize,.cutout-shirt-rotate{position:absolute;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#7d3547;box-shadow:0 2px 8px rgba(0,0,0,.35);touch-action:none;display:none}.cutout-shirt-overlay.editing .cutout-shirt-resize,.cutout-shirt-overlay.editing .cutout-shirt-rotate{display:block}.cutout-shirt-resize{right:-18px;bottom:-18px}.cutout-shirt-resize::before{content:'↘';position:absolute;inset:0;display:grid;place-items:center;color:white;font:900 15px/1 system-ui}.cutout-shirt-rotate{left:50%;top:-50px;margin-left:-18px}.cutout-shirt-rotate::before{content:'↻';position:absolute;inset:0;display:grid;place-items:center;color:white;font:900 18px/1 system-ui}.cutout-shirt-rotate::after{content:'';position:absolute;left:15px;top:33px;width:2px;height:18px;background:white}
  @media(max-width:410px){.cutout-guide-actions{grid-template-columns:1fr 1fr}}
  `;document.head.appendChild(s);
}

function modeHost(){const modes=[...document.querySelectorAll('.studio-mode')];return modes[0]?.parentElement||null;}
function installUi(){
  styles();
  const host=modeHost();if(!host)return;
  if(!document.getElementById('cutoutWorkflow3B')){
    const root=document.createElement('section');root.id='cutoutWorkflow3B';root.className='cutout-workflow-3b';
    root.innerHTML=`<div class="cutout-workflow-3b-head"><strong>Cutout workflow</strong><small>Phase 3B</small></div><div class="cutout-workflow-switch" role="group" aria-label="Cutout workflow"><button type="button" class="cutout-workflow-btn" data-workflow="easy">Easy</button><button type="button" class="cutout-workflow-btn" data-workflow="guided">Guided</button></div><p class="cutout-workflow-help"></p>`;
    host.insertAdjacentElement('beforebegin',root);
    root.querySelectorAll('[data-workflow]').forEach(btn=>btn.onclick=()=>selectWorkflow(btn.dataset.workflow));
  }
  if(!document.getElementById('cutoutGuide3B')){
    const panel=document.createElement('section');panel.id='cutoutGuide3B';panel.className='cutout-guide-3b hidden';panel.hidden=true;
    panel.innerHTML=`<div class="cutout-guide-head"><strong>Garment Guide</strong><span class="cutout-guide-status">Not applied</span></div><div class="cutout-guide-actions"><button type="button" id="cutoutGuideShow3B" class="cutout-guide-btn">Show Guide</button><button type="button" id="cutoutGuideEdit3B" class="cutout-guide-btn">Edit Guide</button><button type="button" id="cutoutGuideLock3B" class="cutout-guide-btn">Lock</button><button type="button" id="cutoutGuideReset3B" class="cutout-guide-btn">Reset Guide</button></div><button type="button" id="cutoutGuideApply3B" class="cutout-guide-apply">Apply Garment Guide</button><p class="cutout-guide-note">Adjust the garment outline, then apply it. Phase 3B stores the guide state; algorithm-independent protection is added in Phase 3C.</p>`;
    const wf=document.getElementById('cutoutWorkflow3B');wf.insertAdjacentElement('afterend',panel);
    document.getElementById('cutoutGuideShow3B').onclick=()=>{visible=!visible;if(!visible)editing=false;sync();};
    document.getElementById('cutoutGuideEdit3B').onclick=()=>{visible=true;editing=!editing;sync();};
    document.getElementById('cutoutGuideLock3B').onclick=()=>{locked=!locked;sync();};
    document.getElementById('cutoutGuideReset3B').onclick=resetGuide;
    document.getElementById('cutoutGuideApply3B').onclick=applyGuideState;
  }
  installOverlay();sync();
}

function selectWorkflow(workflow){
  if(workflow!=='easy'&&workflow!=='guided')return;
  const was=currentState();
  const firstGuided=workflow==='guided'&&(!was?.guide||was.workflow!=='guided');
  workflowUi=workflow;
  updateState(s=>{s.workflow=workflow;if(workflow==='guided')ensureGuide(s);});
  if(workflow==='guided'){
    if(firstGuided){visible=true;editing=true;locked=false;}
    else {visible=false;editing=false;}
  }else{visible=false;editing=false;}
  syncPanel(workflow);syncOverlay();
}

function resetGuide(){
  workflowUi='guided';
  const type=currentState()?.guide?.type||'shirt',label=guideDef(type)?.label||'Garment';
  updateState(s=>{s.workflow='guided';s.guide=newGuide(type);});
  visible=true;editing=true;locked=false;sync();
  const st=document.getElementById('studioStatus');if(st)st.textContent=label+' Guide reset to its centered starting shape.';
}
function applyGuideState(){
  updateState(s=>{const g=ensureGuide(s);g.applied=true;g.dirty=false;});
  editing=false;sync();
  const type=currentState()?.guide?.type||'shirt',label=guideDef(type)?.label||'Garment';
  const st=document.getElementById('studioStatus');if(st)st.textContent=label+' Guide geometry saved. Phase 3C will connect this applied guide to every cutout algorithm.';
}
function markDirty(){updateState(s=>{const g=ensureGuide(s);g.dirty=true;});}

function installOverlay(){
  const w=wrap();if(!w||document.getElementById('cutoutShirtOverlay3B'))return;
  const o=document.createElement('div');o.id='cutoutShirtOverlay3B';o.className='cutout-shirt-overlay hidden';
  o.innerHTML='<svg class="cutout-shirt-outline" aria-hidden="true"><polygon></polygon></svg><div class="cutout-shirt-label">GARMENT GUIDE</div><div class="cutout-shirt-rotate" aria-label="Rotate garment guide"></div><div class="cutout-shirt-resize" aria-label="Resize garment guide"></div>';
  const labels=guideDef('shirt')?.pointLabels||[];
  for(let i=0;i<10;i++){const b=document.createElement('button');b.type='button';b.className='cutout-shirt-point';b.dataset.i=i;b.setAttribute('aria-label',labels[i]||('Point '+(i+1)));o.appendChild(b);}
  w.appendChild(o);
  const rotate=o.querySelector('.cutout-shirt-rotate'),resize=o.querySelector('.cutout-shirt-resize');
  o.addEventListener('pointerdown',e=>{
    const s=currentState(),g=s?.guide;if((workflowUi||s?.workflow)!=='guided'||!g||!visible||!editing)return;
    e.preventDefault();e.stopPropagation();
    const r=canvas().getBoundingClientRect(),x=(e.clientX-r.left)*720/Math.max(1,r.width),y=(e.clientY-r.top)*720/Math.max(1,r.height),pb=e.target.closest('.cutout-shirt-point'),tr=g.transform;
    if(pb){const i=Number(pb.dataset.i);drag={kind:'point',id:e.pointerId,sx:x,sy:y,i,p:[...g.points[i]],tr:{...tr}};}
    else if(e.target===rotate)drag={kind:'rotate',id:e.pointerId,a:Math.atan2(y-tr.y,x-tr.x),rotation:tr.rotation};
    else if(e.target===resize)drag={kind:'resize',id:e.pointerId,sx:x,sy:y,tr:{...tr}};
    else if(!locked)drag={kind:'move',id:e.pointerId,sx:x,sy:y,tr:{...tr}};
    if(drag)o.setPointerCapture?.(e.pointerId);
  });
  o.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();
    const r=canvas().getBoundingClientRect(),x=(e.clientX-r.left)*720/Math.max(1,r.width),y=(e.clientY-r.top)*720/Math.max(1,r.height);
    updateState(s=>{
      const g=ensureGuide(s),tr=g.transform;
      if(drag.kind==='rotate')tr.rotation=drag.rotation+(Math.atan2(y-tr.y,x-tr.x)-drag.a)*180/Math.PI;
      else {
        const dx=x-drag.sx,dy=y-drag.sy,rr=-(drag.tr.rotation||0)*Math.PI/180,cr=Math.cos(rr),sr=Math.sin(rr),lx=dx*cr-dy*sr,ly=dx*sr+dy*cr;
        if(drag.kind==='move'){tr.x=clamp(drag.tr.x+dx,-tr.width/2+34,720+tr.width/2-34);tr.y=clamp(drag.tr.y+dy,-tr.height/2+34,720+tr.height/2-34);}
        else if(drag.kind==='resize'){tr.width=clamp(drag.tr.width+lx*2,120,1200);tr.height=clamp(drag.tr.height+ly*2,150,1200);}
        else if(drag.kind==='point'&&g.points[drag.i]){g.points[drag.i]=[clamp(drag.p[0]+lx/Math.max(1,drag.tr.width),-3,4),clamp(drag.p[1]+ly/Math.max(1,drag.tr.height),-3,4)];}
      }
      g.dirty=true;
    });
    syncOverlay();syncPanel();
  });
  const end=e=>{if(drag&&drag.id===e.pointerId){drag=null;e.preventDefault();e.stopPropagation();markDirty();sync();}};
  o.addEventListener('pointerup',end);o.addEventListener('pointercancel',end);
}

function syncPanel(workflowOverride){
  const s=currentState();if(!s)return;
  const workflow=workflowOverride||workflowUi||s.workflow;
  document.querySelectorAll('#cutoutWorkflow3B [data-workflow]').forEach(b=>b.classList.toggle('active',b.dataset.workflow===workflow));
  const help=document.querySelector('#cutoutWorkflow3B .cutout-workflow-help');if(help)help.textContent=workflow==='guided'?'Guided adds a reusable garment outline while keeping the same Original, Quick and Clean choices.':'Recommended for most photos. Choose Original, Quick or Clean without a garment guide.';
  const panel=document.getElementById('cutoutGuide3B');
  if(panel){const hide=workflow!=='guided';panel.classList.toggle('hidden',hide);panel.hidden=hide;panel.setAttribute('aria-hidden',hide?'true':'false');}
  if(workflow!=='guided')return;
  const g=s.guide||newGuide('shirt'),def=guideDef(g.type)||{label:'Garment'},label=def.label||'Garment';
  const heading=document.querySelector('#cutoutGuide3B .cutout-guide-head strong');if(heading)heading.textContent=label+' Guide';
  const show=document.getElementById('cutoutGuideShow3B');if(show){show.textContent=visible?'Hide Guide':'Show Guide';show.classList.toggle('active',visible);}
  const edit=document.getElementById('cutoutGuideEdit3B');if(edit){edit.textContent=editing?'Editing Guide':'Edit Guide';edit.classList.toggle('active',editing);}
  const lock=document.getElementById('cutoutGuideLock3B');if(lock){lock.textContent=locked?'Locked':'Lock';lock.classList.toggle('active',locked);}
  const status=document.querySelector('#cutoutGuide3B .cutout-guide-status');if(status){status.classList.toggle('applied',g.applied&&!g.dirty);status.textContent=g.dirty?(g.applied?'Changed · reapply':'Changed · apply'):g.applied?'✓ Applied':'Not applied';}
  const apply=document.getElementById('cutoutGuideApply3B');if(apply){apply.textContent=(g.applied?'Reapply ':'Apply ')+label+' Guide';apply.classList.toggle('dirty',!!g.dirty);}
}
function syncOverlay(){
  const s=currentState(),o=document.getElementById('cutoutShirtOverlay3B'),c=canvas();if(!o||!c)return;
  const workflow=workflowUi||s?.workflow,g=s?.guide;
  const show=workflow==='guided'&&!!g&&visible;
  o.classList.toggle('hidden',!show);o.classList.toggle('editing',show&&editing);o.classList.toggle('locked',locked);o.classList.toggle('dirty',!!g?.dirty);
  if(!show)return;
  const tr=g.transform,r=c.getBoundingClientRect(),sx=r.width/720,sy=r.height/720,z=typeof studioViewZoom==='number'?studioViewZoom:1;
  const x=(360+(tr.x-360)*z+(typeof studioViewX==='number'?studioViewX:0))*sx,y=(360+(tr.y-360)*z+(typeof studioViewY==='number'?studioViewY:0))*sy,w=Math.max(1,tr.width*z*sx),h=Math.max(1,tr.height*z*sy);
  o.style.left=x+'px';o.style.top=y+'px';o.style.width=w+'px';o.style.height=h+'px';o.style.transform='translate(-50%,-50%) rotate('+tr.rotation+'deg)';
  const svg=o.querySelector('.cutout-shirt-outline');svg?.setAttribute('viewBox','0 0 '+w+' '+h);
  const poly=o.querySelector('.cutout-shirt-outline polygon');if(poly)poly.setAttribute('points',g.points.map(p=>(p[0]*w).toFixed(2)+','+(p[1]*h).toFixed(2)).join(' '));
  o.querySelectorAll('.cutout-shirt-point').forEach(b=>{const p=g.points[Number(b.dataset.i)]||[.5,.5];b.style.left=(p[0]*100)+'%';b.style.top=(p[1]*100)+'%';});
}
function sync(){syncPanel();syncOverlay();}

const open0=openPhotoStudio;
openPhotoStudio=async function(t='item'){
  const out=await open0.apply(this,arguments);
  installUi();
  const key=(t==='wish'?'wish':'item'),s=currentState();
  initializedFor=key;
  workflowUi=s?.workflow||'easy';
  // Existing Guided items reopen with a clean garment view; geometry remains stored.
  visible=false;editing=false;locked=false;
  if(s?.workflow==='guided'&&!s.guide){updateState(x=>{x.guide=newGuide('shirt');});}
  sync();return out;
};

if(typeof renderStudio==='function'){
  const render0=renderStudio;renderStudio=async function(){const out=await render0.apply(this,arguments);syncOverlay();return out;};
}

window.__audreyCutoutWorkflow3B={phase:'3B-generic1',get visible(){return visible;},get editing(){return editing;},selectWorkflow,resetGuide,applyGuideState,sync};
})();