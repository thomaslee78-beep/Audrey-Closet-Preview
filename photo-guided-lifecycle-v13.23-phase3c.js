/* Audrey Closet v13.23 Cutout Phase 3C — Guided interaction lifecycle.
 * Keeps guide UI attached across Photo Studio sessions, makes guide editing own
 * pointer input, and keeps current/applied guide geometry attached to the garment
 * when Photo Studio Adjust changes position, scale or rotation.
 */
(function(){
'use strict';
let boundCanvas=null;
let boundGuidedButton=null;
let boundEditButton=null;
let boundShowButton=null;
let boundApplyButton=null;
let lastObjectTransform=null;
let opening=false;

const api=()=>window.__audreyCutoutWorkflow3B;
const stateApi=()=>window.__audreyCutoutState;
const state=()=>stateApi()?.getState?.();
const canvas=()=>document.getElementById('studioCanvas');
const wrap=()=>canvas()?.closest('.studio-canvas-wrap')||null;
const overlay=()=>document.getElementById('cutoutShirtOverlay3B');
const isGuided=()=>state()?.workflow==='guided';
const isEditing=()=>isGuided()&&!!api()?.editing;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function objectTransform(){return{
  scale:typeof studioObjectScale==='number'?studioObjectScale:1,
  x:typeof studioObjectX==='number'?studioObjectX:0,
  y:typeof studioObjectY==='number'?studioObjectY:0,
  rotation:typeof studioObjectRotation==='number'?studioObjectRotation:0
};}
function transformChanged(a,b){return !!a&&!!b&&(
  Math.abs(a.scale-b.scale)>.0001||Math.abs(a.x-b.x)>.0001||
  Math.abs(a.y-b.y)>.0001||Math.abs(a.rotation-b.rotation)>.0001
);}
function followGuideTransform(tr,from,to){
  if(!tr||!transformChanged(from,to))return tr;
  const oldScale=Math.max(.0001,Number(from.scale)||1),newScale=Math.max(.0001,Number(to.scale)||1);
  const oldRot=(Number(from.rotation)||0)*Math.PI/180,newRot=(Number(to.rotation)||0)*Math.PI/180;
  const oldCenterX=360+(Number(from.x)||0),oldCenterY=360+(Number(from.y)||0);
  const dx=(Number(tr.x)||360)-oldCenterX,dy=(Number(tr.y)||360)-oldCenterY;
  const co=Math.cos(-oldRot),so=Math.sin(-oldRot),localX=(dx*co-dy*so)/oldScale,localY=(dx*so+dy*co)/oldScale;
  const cn=Math.cos(newRot),sn=Math.sin(newRot),newCenterX=360+(Number(to.x)||0),newCenterY=360+(Number(to.y)||0),ratio=newScale/oldScale;
  return {
    ...tr,
    x:newCenterX+(localX*newScale)*cn-(localY*newScale)*sn,
    y:newCenterY+(localX*newScale)*sn+(localY*newScale)*cn,
    width:clamp((Number(tr.width)||330)*ratio,80,1200),
    height:clamp((Number(tr.height)||430)*ratio,80,1200),
    rotation:(Number(tr.rotation)||0)+(Number(to.rotation)||0)-(Number(from.rotation)||0)
  };
}
function followGuideWithAdjust(from,to){
  if(!transformChanged(from,to))return false;
  const cur=state();if(cur?.workflow!=='guided'||!cur.guide)return false;
  const next=clone(cur);
  next.guide.transform=followGuideTransform(next.guide.transform,from,to);
  if(next.guide.appliedShape?.transform){
    // Applied protection follows the same Adjust transform immediately so the
    // saved keep region stays registered with the garment without reapplying.
    next.guide.appliedShape.transform=followGuideTransform(next.guide.appliedShape.transform,from,to);
  }
  stateApi()?.persist?.(undefined,next);
  api()?.sync?.();
  return true;
}

function neutralizeStudioNavigation(){
  if(typeof studioMoveMode!=='undefined')studioMoveMode=false;
  if(typeof studioBrushMode!=='undefined')studioBrushMode=null;
  if(typeof studioDrawing!=='undefined')studioDrawing=false;
  if(typeof studioGesture!=='undefined')studioGesture=null;
  if(typeof studioPointers!=='undefined'&&studioPointers?.clear)studioPointers.clear();
  if(typeof studioViewZoom!=='undefined')studioViewZoom=1;
  if(typeof studioViewX!=='undefined')studioViewX=0;
  if(typeof studioViewY!=='undefined')studioViewY=0;
  document.querySelectorAll('.brush-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('studioMoveToggle')?.classList.remove('active');
  if(typeof updateStudioToolUI==='function')updateStudioToolUI();
  if(typeof updateStudioZoomLabel==='function')updateStudioZoomLabel();
  if(typeof renderStudio==='function')renderStudio();
}

function ensureOverlayAttached(){
  const o=overlay(),w=wrap();
  if(o&&w&&o.parentElement!==w)w.appendChild(o);
}

function ensureGuidedVisible({editing=true}={}){
  if(!isGuided())return;
  ensureOverlayAttached();
  const wf=api();
  if(!wf?.visible)document.getElementById('cutoutGuideShow3B')?.click();
  if(editing&&!wf?.editing)document.getElementById('cutoutGuideEdit3B')?.click();
  if(editing)neutralizeStudioNavigation();
  wf?.sync?.();
}

function blockCanvas(e){
  if(!isEditing())return;
  e.preventDefault();
  e.stopImmediatePropagation();
}
function bindCanvasGuard(){
  const c=canvas();if(!c||c===boundCanvas)return;
  boundCanvas=c;
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(type=>c.addEventListener(type,blockCanvas,true));
  c.addEventListener('wheel',blockCanvas,{capture:true,passive:false});
  c.addEventListener('gesturestart',blockCanvas,true);
  c.addEventListener('gesturechange',blockCanvas,true);
  c.addEventListener('gestureend',blockCanvas,true);
}

function bindControls(){
  const guided=document.querySelector('#cutoutWorkflow3B [data-workflow="guided"]');
  if(guided&&guided!==boundGuidedButton){
    boundGuidedButton=guided;
    guided.addEventListener('click',()=>queueMicrotask(()=>ensureGuidedVisible({editing:true})));
  }
  const edit=document.getElementById('cutoutGuideEdit3B');
  if(edit&&edit!==boundEditButton){
    boundEditButton=edit;
    edit.addEventListener('click',()=>queueMicrotask(()=>{if(api()?.editing)neutralizeStudioNavigation();}));
  }
  const show=document.getElementById('cutoutGuideShow3B');
  if(show&&show!==boundShowButton){
    boundShowButton=show;
    show.addEventListener('click',()=>queueMicrotask(()=>{ensureOverlayAttached();api()?.sync?.();}));
  }
  const apply=document.getElementById('cutoutGuideApply3B');
  if(apply&&apply!==boundApplyButton){
    boundApplyButton=apply;
    apply.addEventListener('click',()=>queueMicrotask(async()=>{
      try{await window.__audreyCutoutPipeline?.applyCurrentGuide?.();}catch(err){console.error('Guided apply lifecycle failed',err);}
    }));
  }
}

function refresh(){ensureOverlayAttached();bindCanvasGuard();bindControls();api()?.sync?.();}

const open0=openPhotoStudio;
openPhotoStudio=async function(){
  opening=true;
  try{
    const out=await open0.apply(this,arguments);
    refresh();
    lastObjectTransform=objectTransform();
    return out;
  }finally{opening=false;lastObjectTransform=objectTransform();}
};

if(typeof renderStudio==='function'){
  const render0=renderStudio;
  renderStudio=async function(){
    const now=objectTransform();
    if(!opening&&lastObjectTransform&&transformChanged(lastObjectTransform,now))followGuideWithAdjust(lastObjectTransform,now);
    lastObjectTransform=now;
    const out=await render0.apply(this,arguments);
    ensureOverlayAttached();
    api()?.sync?.();
    return out;
  };
}

window.__audreyGuidedLifecycle={phase:'3C-refine2',refresh,ensureGuidedVisible,followGuideWithAdjust,get canvasLocked(){return isEditing();}};
})();
