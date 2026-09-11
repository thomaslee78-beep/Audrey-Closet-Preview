/* Audrey Closet v13.23 Cutout Phase 3D-C — garment guide registry + dynamic points.
 * Final release template set: Shirt, Long-Sleeve, Tank, Hoodie, Pants, Dress,
 * Shorts, Skirt and Coat/Jacket. Cutout/protection math remains unchanged.
 */
(function(){
'use strict';

const stateApi=()=>window.__audreyCutoutState;
const workflowApi=()=>window.__audreyCutoutWorkflow3B;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const DEF_TRANSFORM={x:360,y:360,width:330,height:430,rotation:0};

const TEMPLATES=[
  {
    id:'shirt',label:'Shirt',geometryVersion:2,
    defaultPoints:[[.30,.05],[.42,0],[.58,0],[.70,.05],[.96,.22],[.73,.32],[.73,1],[.27,1],[.27,.32],[.04,.22]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right sleeve tip','Right underarm','Right hem','Left hem','Left underarm','Left sleeve tip'],
    defaultTransform:{...DEF_TRANSFORM}
  },
  {
    id:'long-sleeve-shirt',label:'Long-Sleeve Shirt',geometryVersion:2,
    defaultPoints:[[.30,.05],[.42,0],[.58,0],[.70,.05],[.98,.19],[.94,.86],[.79,.85],[.73,.34],[.69,1],[.31,1],[.27,.34],[.21,.85],[.06,.86],[.02,.19]],
    pointLabels:['Left shoulder','Left neck','Right neck','Right shoulder','Right outer sleeve','Right outer cuff','Right inner cuff','Right underarm','Right hem','Left hem','Left underarm','Left inner cuff','Left outer cuff','Left outer sleeve'],
    defaultTransform:{x:360,y:360,width:360,height:470,rotation:0}
  },
  {
    id:'tank',label:'Tank',geometryVersion:4,
    defaultPoints:[[.28,.02],[.40,.05],[.44,.18],[.56,.18],[.60,.05],[.72,.02],[.69,.30],[.76,1],[.24,1],[.31,.30]],
    pointLabels:['Left strap outer top','Left strap inner','Left neckline curve','Right neckline curve','Right strap inner','Right strap outer top','Right armhole','Right hem','Left hem','Left armhole'],
    defaultTransform:{x:360,y:360,width:300,height:430,rotation:0}
  },
  {
    id:'hoodie',label:'Hoodie',geometryVersion:2,
    defaultPoints:[[.50,0],[.69,.12],[.76,.28],[.88,.33],[.98,.82],[.87,.91],[.77,.72],[.71,1],[.29,1],[.23,.72],[.13,.91],[.02,.82],[.12,.33],[.24,.28],[.31,.12]],
    pointLabels:['Hood apex','Right hood upper','Right neckline','Right shoulder','Right outer cuff','Right inner cuff','Right underarm','Right hem','Left hem','Left underarm','Left inner cuff','Left outer cuff','Left shoulder','Left neckline','Left hood upper'],
    defaultTransform:{x:360,y:360,width:370,height:480,rotation:0}
  },
  {
    id:'pants',label:'Pants',geometryVersion:2,
    defaultPoints:[[.74,0],[.82,.18],[.84,1],[.58,1],[.50,.42],[.42,1],[.16,1],[.18,.18],[.26,0]],
    pointLabels:['Right waist','Right outer leg upper','Right outer hem','Right inner hem','Crotch','Left inner hem','Left outer hem','Left outer leg upper','Left waist'],
    defaultTransform:{x:360,y:365,width:310,height:520,rotation:0}
  },
  {
    id:'shorts',label:'Shorts',geometryVersion:2,
    defaultPoints:[[.74,0],[.92,.72],[.58,.82],[.50,.48],[.42,.82],[.08,.72],[.26,0]],
    pointLabels:['Right waist','Right outer hem','Right inner hem','Crotch','Left inner hem','Left outer hem','Left waist'],
    defaultTransform:{x:360,y:350,width:350,height:320,rotation:0}
  },
  {
    id:'skirt',label:'Skirt',geometryVersion:2,
    defaultPoints:[[.66,0],[.78,.18],[.88,1],[.12,1],[.22,.18],[.34,0]],
    pointLabels:['Right waist','Right upper flare','Right hem','Left hem','Left upper flare','Left waist'],
    defaultTransform:{x:360,y:355,width:340,height:430,rotation:0}
  },
  {
    id:'dress',label:'Dress',geometryVersion:2,
    defaultPoints:[[.58,0],[.82,.06],[.88,.22],[.70,.31],[.66,.48],[.78,.76],[.86,1],[.14,1],[.22,.76],[.34,.48],[.30,.31],[.12,.22],[.18,.06],[.42,0]],
    pointLabels:['Right neckline','Right sleeve tip','Right sleeve under','Right upper bodice','Right waist','Right skirt side','Right hem','Left hem','Left skirt side','Left waist','Left upper bodice','Left sleeve under','Left sleeve tip','Left neckline'],
    defaultTransform:{x:360,y:365,width:390,height:560,rotation:0}
  },
  {
    id:'coat',label:'Coat / Jacket',geometryVersion:2,
    defaultPoints:[[.42,0],[.28,.08],[.05,.70],[.18,.70],[.20,1],[.80,1],[.82,.70],[.95,.70],[.72,.08],[.58,0]],
    pointLabels:['Left collar top','Left shoulder','Left outer cuff','Left underarm','Left hem','Right hem','Right underarm','Right outer cuff','Right shoulder','Right collar top'],
    defaultTransform:{x:360,y:365,width:390,height:560,rotation:0}
  }
];

const byId=new Map(TEMPLATES.map(t=>[t.id,t]));

function registerTemplates(){
  const api=stateApi();if(!api?.registerGuideType)return false;
  TEMPLATES.forEach(t=>api.registerGuideType({
    id:t.id,label:t.label,geometryVersion:t.geometryVersion,
    defaultPoints:t.defaultPoints,pointLabels:t.pointLabels
  }));
  return true;
}

function getTemplate(id){return clone(byId.get(id)||byId.get('shirt'));}
function createGuide(id='shirt',{transform=null,protection=70}={}){
  const def=byId.get(id)||byId.get('shirt');
  return {
    schemaVersion:1,type:def.id,geometryVersion:def.geometryVersion,
    applied:false,dirty:false,points:clone(def.defaultPoints),
    transform:clone(transform||def.defaultTransform||DEF_TRANSFORM),
    protection,baseResult:'',appliedShape:null
  };
}

function migrateLegacyGeometry(){
  const api=stateApi(),current=api?.getState?.(),guide=current?.guide;
  if(!api||!current||!guide)return false;
  const def=byId.get(guide.type);if(!def)return false;
  const pointCount=Array.isArray(guide.points)?guide.points.length:0;
  const version=Number.isFinite(Number(guide.geometryVersion))?Number(guide.geometryVersion):1;
  if(version>=def.geometryVersion&&pointCount===def.defaultPoints.length)return false;
  const next=clone(current);
  next.workflow='guided';
  next.guide={
    ...next.guide,
    geometryVersion:def.geometryVersion,
    points:clone(def.defaultPoints),
    applied:false,
    dirty:false,
    appliedShape:null,
    baseResult:''
  };
  api.persist?.(undefined,next);
  return true;
}

function migrateLegacyLongSleeve(){return migrateLegacyGeometry();}
function pointHost(){return document.getElementById('cutoutShirtOverlay3B');}
function activeGuide(){return stateApi()?.getState?.()?.guide||null;}
function reconcilePointControls(){
  const overlay=pointHost(),guide=activeGuide();if(!overlay||!guide)return false;
  const def=byId.get(guide.type)||stateApi()?.getGuideTypes?.().find(x=>x.id===guide.type)||null;
  const count=Array.isArray(guide.points)?guide.points.length:0;
  const labels=def?.pointLabels||[];
  const existing=[...overlay.querySelectorAll('.cutout-shirt-point')];
  const wrong=existing.length!==count||overlay.dataset.guideType!==guide.type;
  if(wrong){
    existing.forEach(b=>b.remove());
    for(let i=0;i<count;i++){
      const b=document.createElement('button');b.type='button';b.className='cutout-shirt-point';
      b.dataset.i=String(i);b.setAttribute('aria-label',labels[i]||('Point '+(i+1)));overlay.appendChild(b);
    }
  }else{
    existing.forEach((b,i)=>b.setAttribute('aria-label',labels[i]||('Point '+(i+1))));
  }
  overlay.dataset.guideType=guide.type;
  const label=overlay.querySelector('.cutout-shirt-label');if(label)label.textContent=(def?.label||guide.type||'Garment').toUpperCase()+' GUIDE';
  return true;
}

registerTemplates();

const open0=openPhotoStudio;
openPhotoStudio=async function(){
  const out=await open0.apply(this,arguments);
  registerTemplates();
  migrateLegacyGeometry();
  reconcilePointControls();
  workflowApi()?.sync?.();
  return out;
};

const workflow=workflowApi();
if(workflow?.sync){
  const sync0=workflow.sync;
  workflow.sync=function(){const out=sync0.apply(this,arguments);reconcilePointControls();return out;};
}

window.__audreyGarmentGuides={
  phase:'3D-C4',
  getTemplates:()=>TEMPLATES.map(clone),
  getTemplate,
  createGuide,
  registerTemplates,
  migrateLegacyGeometry,
  migrateLegacyLongSleeve,
  reconcilePointControls
};
})();
