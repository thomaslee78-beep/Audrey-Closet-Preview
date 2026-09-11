/* Audrey Closet v13.23 Cutout Phase 3C — generic guided processing pipeline.
 * Algorithms/methods create candidate bases; registered guide processors protect
 * garment geometry afterward; manual Restore/Erase remain downstream in the
 * existing work-canvas rebuild. No reopen recomputation is introduced here.
 *
 * Phase 3C refinement: an explicitly applied guide is an authoritative keep
 * region. Protection now defines retained source opacity inside the guide rather
 * than merely relaxing the older color/continuity rescue score.
 */
(function(){
'use strict';

const processors=new Map();
let processing=false;
let lastStats=null;
const stateApi=()=>window.__audreyCutoutState;
const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function sourcePhoto(){return target()==='wish'?(wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||''):(itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'');}
function currentState(){return stateApi()?.getState?.(target())||null;}
function persistState(next){stateApi()?.persist?.(target(),next);return next;}
function captureBase(){if(!studioBaseCanvas)return '';try{return studioBaseCanvas.toDataURL('image/png');}catch{return '';}}
function registerGuideProcessor(type,fn){if(typeof type!=='string'||!type||typeof fn!=='function')return false;processors.set(type,fn);return true;}
function snapshotShape(guide){return{points:clone(guide.points||[]),transform:clone(guide.transform||{}),protection:clamp(Number(guide.protection)||70,0,100)};}
function effectiveGuide(guide,{forceCurrent=false}={}){
  if(forceCurrent||!guide.appliedShape)return{...clone(guide),...snapshotShape(guide)};
  return{...clone(guide),points:clone(guide.appliedShape.points||guide.points||[]),transform:clone(guide.appliedShape.transform||guide.transform||{}),protection:clamp(Number(guide.appliedShape.protection??guide.protection)||70,0,100)};
}

function imagePointToWorld(x,y){const scale=typeof studioObjectScale==='number'?studioObjectScale:1,rotation=(typeof studioObjectRotation==='number'?studioObjectRotation:0)*Math.PI/180,dx=(x-360)*scale,dy=(y-360)*scale,cr=Math.cos(rotation),sr=Math.sin(rotation);return{x:360+(typeof studioObjectX==='number'?studioObjectX:0)+dx*cr-dy*sr,y:360+(typeof studioObjectY==='number'?studioObjectY:0)+dx*sr+dy*cr};}
function guideLocalPoint(world,guide){const tr=guide.transform||{},width=Math.max(1,Number(tr.width)||330),height=Math.max(1,Number(tr.height)||430),rotation=-(Number(tr.rotation)||0)*Math.PI/180,dx=world.x-(Number(tr.x)||360),dy=world.y-(Number(tr.y)||360),cr=Math.cos(rotation),sr=Math.sin(rotation);return{x:(dx*cr-dy*sr)/width+.5,y:(dx*sr+dy*cr)/height+.5};}
function insidePolygon(local,points){if(local.x<0||local.x>1||local.y<0||local.y>1)return false;let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if(((a[1]>local.y)!==(b[1]>local.y))&&(local.x<(b[0]-a[0])*(local.y-a[1])/((b[1]-a[1])||1e-6)+a[0]))hit=!hit;}return hit;}

async function protectPolygonGuide({guide,mode}){
  if(!studioBaseCanvas||!guide||!Array.isArray(guide.points)||guide.points.length<3)return{changed:false,rescued:0,retained:0,insideCount:0};
  const src=sourcePhoto();if(!src)return{changed:false,rescued:0,retained:0,insideCount:0};
  const original=await sourceToStudioCanvas(src),w=studioBaseCanvas.width,h=studioBaseCanvas.height;if(!w||!h)return{changed:false,rescued:0,retained:0,insideCount:0};
  const source=document.createElement('canvas');source.width=w;source.height=h;const sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(original,0,0,w,h);
  const cutCtx=studioBaseCanvas.getContext('2d',{willReadFrequently:true}),srcImage=sourceCtx.getImageData(0,0,w,h),cutImage=cutCtx.getImageData(0,0,w,h),s=srcImage.data,c=cutImage.data,pr=clamp(Number(guide.protection)||70,0,100)/100;

  // Applied guide geometry is an explicit keep region. Protection controls the
  // minimum source opacity retained there. At the default 70 this keeps about
  // 92% of source opacity; 100 means the original source pixel is authoritative.
  const authority=.72+.28*pr;
  let retained=0,insideCount=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const world=imagePointToWorld(x,y),local=guideLocalPoint(world,guide);if(!insidePolygon(local,guide.points))continue;
    insideCount++;
    const i=(y*w+x)*4,sourceAlpha=s[i+3];if(sourceAlpha<=0)continue;
    const retainedAlpha=Math.round(sourceAlpha*authority);
    if(c[i+3]>=retainedAlpha)continue;
    c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=retainedAlpha;retained++;
  }
  if(retained)cutCtx.putImageData(cutImage,0,0);
  return{changed:retained>0,rescued:retained,retained,insideCount,protection:Math.round(pr*100),authority:Math.round(authority*1000)/1000,mode};
}
registerGuideProcessor('shirt',protectPolygonGuide);

async function applyGuideProtection(state,{forceCurrent=false}={}){
  if(!state||state.workflow!=='guided'||!state.guide||studioMode==='original')return{applied:false,reason:'inactive'};
  const guide=state.guide;if(!guide.applied&&!forceCurrent)return{applied:false,reason:'not-applied'};
  const processor=processors.get(guide.type);if(!processor)return{applied:false,reason:'unsupported-guide'};
  const effective=effectiveGuide(guide,{forceCurrent}),stats=await processor({guide:effective,mode:studioMode,method:state.method});
  if(typeof rebuildStudioWorkCanvas==='function')rebuildStudioWorkCanvas();
  const next=clone(state);next.algorithm=studioMode;next.baseResult=captureBase();next.guide.applied=true;next.guide.baseResult=next.baseResult;
  if(forceCurrent){next.guide.appliedShape=snapshotShape(next.guide);next.guide.dirty=false;}
  persistState(next);lastStats={...stats,type:guide.type,mode:studioMode,method:next.method};return{applied:true,stats,lastState:next};
}

async function applyCurrentGuide(){
  const state=currentState();if(!state||state.workflow!=='guided'||!state.guide)return false;
  const prepared=clone(state);prepared.guide.applied=true;prepared.guide.appliedShape=snapshotShape(prepared.guide);prepared.guide.dirty=false;persistState(prepared);
  if(studioMode==='original'){
    const status=document.getElementById('studioStatus');if(status)status.textContent='Shirt Guide applied. Choose Quick or Clean to use it.';
    window.__audreyCutoutWorkflow3B?.sync?.();return true;
  }
  await applyStudioMode(studioMode,{showBusy:true,phase3cGuideApply:true});window.__audreyCutoutWorkflow3B?.sync?.();return true;
}
function bindGuideApply(){const btn=document.getElementById('cutoutGuideApply3B');if(!btn||btn.dataset.phase3cBound)return;btn.dataset.phase3cBound='1';btn.onclick=()=>applyCurrentGuide();}

const open0=openPhotoStudio;
openPhotoStudio=async function(){const out=await open0.apply(this,arguments);bindGuideApply();return out;};

const mode0=applyStudioMode;
applyStudioMode=async function(mode,options){
  const out=await mode0.apply(this,arguments);if(processing||mode==='original')return out;
  const state=currentState();if(!state||state.workflow!=='guided'||!state.guide?.applied)return out;
  processing=true;
  try{
    const result=await applyGuideProtection(state,{forceCurrent:!!options?.phase3cGuideApply});
    if(result.applied){const status=document.getElementById('studioStatus');if(status){const methodLabels={standard:'Standard',center:'Center Focus',edge:'Edge Guide',grow:'Subject Grow'},modeLabel=mode==='clean'?'Clean':'Quick';status.textContent=modeLabel+' + '+(methodLabels[result.lastState?.method]||'Standard')+' + Shirt Guide applied with strong protection.';}window.__audreyCutoutWorkflow3B?.sync?.();}
  }catch(err){console.error('Phase 3C guide protection failed',err);const status=document.getElementById('studioStatus');if(status)status.textContent='Cutout finished, but the garment guide could not be applied. Your original is still safe.';}
  finally{processing=false;}
  return out;
};

window.__audreyCutoutPipeline={phase:'3C-refine1',registerGuideProcessor,applyGuideProtection,applyCurrentGuide,getProcessorTypes:()=>[...processors.keys()],get lastStats(){return lastStats?clone(lastStats):null;}};
})();
