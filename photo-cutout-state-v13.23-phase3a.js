/* Audrey Closet v13.23 Cutout Phase 3A — canonical Cutout state.
 * Foundation only: one versioned state model, generic garment-guide schema,
 * legacy normalization, and restore-only reopen. UI redesign comes in Phase 3B.
 */
(function(){
  'use strict';

  const STATE_VERSION=1;
  const GUIDE_SCHEMA_VERSION=1;
  const METHODS=new Set(['standard','center','edge','grow']);
  const ALGORITHMS=new Set(['original','quick','clean']);
  const WORKFLOWS=new Set(['easy','guided']);
  const LEGACY12_TO_10=[0,1,2,3,4,6,7,8,9,11];
  const SHIRT_DEFAULT_POINTS=[[.30,.05],[.42,0],[.58,0],[.70,.05],[.96,.22],[.73,.32],[.73,1],[.27,1],[.27,.32],[.04,.22]];
  const guideTypes=new Map();
  let opening=false;
  let active={item:null,wish:null};

  const target=()=>typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';
  const rawState=t=>t==='wish'?wishStudioState:itemStudioState;
  const setRawState=(t,v)=>{if(t==='wish')wishStudioState=v;else itemStudioState=v;};
  const sourcePhoto=t=>t==='wish'?(wishOriginalPhoto||wishWorkingPhoto||''):(itemOriginalPhoto||itemWorkingPhoto||'');
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dataImage=v=>typeof v==='string'&&v.startsWith('data:image/')?v:'';

  function registerGuideType(def){
    if(!def||typeof def.id!=='string'||!def.id)return false;
    const normalized={id:def.id,label:def.label||def.id,geometryVersion:finite(def.geometryVersion,1),defaultPoints:Array.isArray(def.defaultPoints)?clone(def.defaultPoints):[],pointLabels:Array.isArray(def.pointLabels)?[...def.pointLabels]:[]};
    guideTypes.set(normalized.id,normalized);return true;
  }
  registerGuideType({id:'shirt',label:'Shirt',geometryVersion:2,defaultPoints:SHIRT_DEFAULT_POINTS,pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right sleeve tip','Right underarm','Right hem','Left hem','Left underarm','Left sleeve tip']});

  function normalizePoint(p,fallback=[.5,.5]){if(!Array.isArray(p)||p.length<2)return [...fallback];return [clamp(finite(p[0],fallback[0]),-3,4),clamp(finite(p[1],fallback[1]),-3,4)];}
  function normalizeGuidePoints(type,points){
    const def=guideTypes.get(type);
    if(type==='shirt'&&Array.isArray(points)&&points.length===12)return LEGACY12_TO_10.map((oldIndex,i)=>normalizePoint(points[oldIndex],SHIRT_DEFAULT_POINTS[i]));
    if(Array.isArray(points)&&points.length)return points.map((p,i)=>normalizePoint(p,def?.defaultPoints?.[i]||[.5,.5]));
    return clone(def?.defaultPoints||[]);
  }
  function normalizeShape(type,input){
    if(!input||typeof input!=='object')return null;
    return {points:normalizeGuidePoints(type,input.points),transform:{x:finite(input.transform?.x??input.x,360),y:finite(input.transform?.y??input.y,360),width:clamp(finite(input.transform?.width??input.w,330),80,1200),height:clamp(finite(input.transform?.height??input.h,430),80,1200),rotation:finite(input.transform?.rotation??input.rotation,0)},protection:clamp(finite(input.protection,70),0,100)};
  }
  function normalizeGuide(input){
    if(!input||typeof input!=='object')return null;
    const type=typeof input.type==='string'&&input.type?input.type:'shirt',def=guideTypes.get(type),accepted=dataImage(input.baseResult||input.committedBase||input.acceptedBase),applied=!!(input.applied||input.committedBase||input.acceptedBase),currentShape=normalizeShape(type,input),appliedShape=normalizeShape(type,input.appliedShape)||(applied?clone(currentShape):null);
    return {schemaVersion:GUIDE_SCHEMA_VERSION,type,geometryVersion:finite(input.geometryVersion,def?.geometryVersion||1),applied,dirty:!!input.dirty,points:currentShape.points,transform:currentShape.transform,protection:currentShape.protection,appliedShape,baseResult:accepted};
  }

  function emptyCutout(){return {version:STATE_VERSION,workflow:'easy',algorithm:'original',method:'standard',baseResult:'',eraseMask:'',restoreMask:'',guide:null};}
  function normalizeCutout(raw){
    const existing=raw?.cutout&&typeof raw.cutout==='object'?raw.cutout:null;
    if(existing){const guide=normalizeGuide(existing.guide);return {version:STATE_VERSION,workflow:WORKFLOWS.has(existing.workflow)?existing.workflow:(guide?'guided':'easy'),algorithm:ALGORITHMS.has(existing.algorithm)?existing.algorithm:'original',method:METHODS.has(existing.method)?existing.method:'standard',baseResult:dataImage(existing.baseResult),eraseMask:dataImage(existing.eraseMask||raw?.eraseMask),restoreMask:dataImage(existing.restoreMask||raw?.restoreMask),guide};}
    const legacyGuide=normalizeGuide(raw?.garmentGuide),algorithm=ALGORITHMS.has(raw?.mode)?raw.mode:'original',method=METHODS.has(raw?.cutoutMethod)?raw.cutoutMethod:'standard',baseResult=dataImage(legacyGuide?.baseResult||raw?.cutoutBaseResult);
    return {version:STATE_VERSION,workflow:legacyGuide?'guided':'easy',algorithm,method,baseResult,eraseMask:dataImage(raw?.eraseMask),restoreMask:dataImage(raw?.restoreMask),guide:legacyGuide};
  }

  function seedState(t,raw){
    if(raw&&typeof raw==='object')return raw;
    const src=sourcePhoto(t);
    return {version:3,sourceFingerprint:src&&typeof photoFingerprint==='function'?photoFingerprint(src):'',mode:'original',edge:typeof studioEdge==='number'?studioEdge:45,eraseMask:'',restoreMask:'',scale:typeof studioObjectScale==='number'?studioObjectScale:1,x:typeof studioObjectX==='number'?studioObjectX:0,y:typeof studioObjectY==='number'?studioObjectY:0,rotation:typeof studioObjectRotation==='number'?studioObjectRotation:0,exposure:typeof studioExposure==='number'?studioExposure:0,contrast:typeof studioContrast==='number'?studioContrast:0,highlights:typeof studioHighlights==='number'?studioHighlights:0,bg:typeof studioBg==='string'?studioBg:'transparent',customBg:typeof studioCustomBg==='string'?studioCustomBg:'#ffffff'};
  }
  function compatibleState(raw,cutout,{forceOriginal=false,targetType=target()}={}){
    const base=seedState(targetType,raw);
    return {...base,mode:forceOriginal?'original':cutout.algorithm,cutoutMethod:cutout.method,eraseMask:cutout.eraseMask||base.eraseMask||'',restoreMask:cutout.restoreMask||base.restoreMask||'',cutout:clone(cutout)};
  }
  function captureBase(){if(!studioBaseCanvas)return '';try{return studioBaseCanvas.toDataURL('image/png');}catch{return '';}}
  function captureRuntime(t=target()){
    const raw=rawState(t),previous=active[t]||normalizeCutout(raw),algorithm=ALGORITHMS.has(studioMode)?studioMode:previous.algorithm,method=METHODS.has(window.__audreyCutoutMethodPreview?.getMethod?.())?window.__audreyCutoutMethodPreview.getMethod():previous.method;
    const next={...previous,version:STATE_VERSION,algorithm,method,baseResult:algorithm==='original'?'':captureBase(),eraseMask:typeof maskDataURL==='function'?dataImage(maskDataURL(studioManualEraseMask)):previous.eraseMask,restoreMask:typeof maskDataURL==='function'?dataImage(maskDataURL(studioManualRestoreMask)):previous.restoreMask};active[t]=next;return next;
  }
  function persist(t=target(),cutout=active[t]||normalizeCutout(rawState(t))){
    const nt=t==='wish'?'wish':'item',next=compatibleState(rawState(nt),cutout,{targetType:nt});setRawState(nt,next);active[nt]=clone(cutout);return next;
  }
  function resetTarget(t=target()){
    const nt=t==='wish'?'wish':'item',next=emptyCutout();active[nt]=clone(next);
    const raw=rawState(nt);if(raw&&typeof raw==='object')setRawState(nt,compatibleState(raw,next,{targetType:nt}));return clone(next);
  }

  async function canvasFromData(src){const img=await imageFrom(src),c=newStudioCanvas(),ctx=c.getContext('2d');ctx.clearRect(0,0,720,720);ctx.drawImage(img,0,0,720,720);return c;}
  async function restoreCanonicalManualMasks(cutout){
    try{
      studioManualEraseMask=cutout.eraseMask?await canvasFromData(cutout.eraseMask):newStudioCanvas();
      studioManualRestoreMask=cutout.restoreMask?await canvasFromData(cutout.restoreMask):newStudioCanvas();
      return true;
    }catch(err){
      console.error('Phase 3A canonical manual-mask restore failed',err);
      studioManualEraseMask=newStudioCanvas();studioManualRestoreMask=newStudioCanvas();
      return false;
    }
  }
  async function restoreCanonicalBase(cutout){if(cutout.algorithm==='original'||!cutout.baseResult)return false;try{studioBaseCanvas=await canvasFromData(cutout.baseResult);studioCutoutPhoto=cutout.baseResult;return true}catch(err){console.error('Phase 3A canonical cutout restore failed',err);return false;}}
  function syncModeUi(cutout){studioMode=cutout.algorithm;document.querySelectorAll('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===cutout.algorithm));}

  const open0=openPhotoStudio;
  openPhotoStudio=async function(t='item'){
    const nt=t==='wish'?'wish':'item',before=rawState(nt),canonical=normalizeCutout(before);active[nt]=clone(canonical);
    const temporary=before?compatibleState(before,canonical,{forceOriginal:true,targetType:nt}):before;if(temporary)setRawState(nt,temporary);opening=true;
    try{
      const out=await open0.apply(this,arguments);if(before)setRawState(nt,compatibleState(before,canonical,{targetType:nt}));syncModeUi(canonical);
      const restored=await restoreCanonicalBase(canonical);
      if(!restored&&canonical.algorithm!=='original'){
        const fallback={...canonical,algorithm:'original',baseResult:''};active[nt]=fallback;syncModeUi(fallback);persist(nt,fallback);const status=document.getElementById('studioStatus');if(status)status.textContent='Legacy cutout opened safely from Original. Reapply Quick or Clean once to create the new exact saved base.';
      }else{
        await restoreCanonicalManualMasks(canonical);
        if(typeof rebuildStudioWorkCanvas==='function')rebuildStudioWorkCanvas();
        persist(nt,canonical);const status=document.getElementById('studioStatus');if(status&&canonical.algorithm!=='original')status.textContent='Saved cutout and manual cleanup restored exactly. No background-removal algorithm was rerun.';
      }
      if(typeof renderStudio==='function')await renderStudio();return out;
    }finally{opening=false;}
  };

  const mode0=applyStudioMode;
  applyStudioMode=async function(mode,options){const out=await mode0.apply(this,arguments);if(opening)return out;const t=target(),next=captureRuntime(t);if(mode==='original'){next.algorithm='original';next.baseResult='';}persist(t,next);return out;};
  const applyPhoto0=applyPhotoStudio;
  applyPhotoStudio=async function(){
    const t=target(),committed=captureRuntime(t);
    // "Use this photo" is a draft-session commit boundary. The core Photo Studio
    // writes its legacy v3 state while producing the flattened preview image, so
    // keep one canonical snapshot from immediately before that write and restamp
    // it afterward. The core state remains the source for transform/adjustment/bg
    // fields; the canonical snapshot remains the source for Guided/cutout/masks.
    persist(t,committed);
    const out=await applyPhoto0.apply(this,arguments);
    persist(t,committed);
    return out;
  };
  // bindPhotoStudio() ran before this dynamically loaded module and assigned the
  // original core function object directly to #studioApply.onclick. Rebind through
  // a late-bound callback so taps reach the canonical wrapper above (and any future
  // wrappers layered after it) instead of bypassing Phase 3A persistence.
  const studioApplyButton=document.getElementById('studioApply');
  if(studioApplyButton)studioApplyButton.onclick=()=>applyPhotoStudio();

  const saveItem0=saveItem;saveItem=async function(){captureRuntime('item');persist('item');return saveItem0.apply(this,arguments);};
  const saveWish0=saveWish;saveWish=async function(){captureRuntime('wish');persist('wish');return saveWish0.apply(this,arguments);};

  if(typeof restoreCapturedOriginal==='function'){
    const restoreOriginal0=restoreCapturedOriginal;
    restoreCapturedOriginal=function(){const out=restoreOriginal0.apply(this,arguments);resetTarget('item');return out;};
  }

  window.__audreyCutoutState={phase:'3A-fix5',version:STATE_VERSION,registerGuideType,getGuideTypes:()=>[...guideTypes.values()].map(clone),normalizeGuide,normalizeCutout,getState:(t=target())=>clone(active[t]||normalizeCutout(rawState(t))),persist,resetTarget,emptyCutout};
})();
