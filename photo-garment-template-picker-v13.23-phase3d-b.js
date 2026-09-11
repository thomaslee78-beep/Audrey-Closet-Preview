/* Audrey Closet v13.23 Cutout Phase 3D-C — Guided garment template picker.
 * Final release picker exposes nine garment templates and derives compact inline
 * icons directly from each template's default polygon. Switching templates keeps
 * placement/protection but clears applied state so the new shape is reapplied.
 * Preserve the Cutout panel scroll position while trying different templates.
 */
(function(){
'use strict';

const ENABLED=['shirt','long-sleeve-shirt','tank','hoodie','pants','dress','shorts','skirt','coat'];
const stateApi=()=>window.__audreyCutoutState;
const guidesApi=()=>window.__audreyGarmentGuides;
const workflowApi=()=>window.__audreyCutoutWorkflow3B;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

function currentState(){return stateApi()?.getState?.()||null;}
function def(id){return guidesApi()?.getTemplate?.(id)||null;}
function templateIconSvg(template){
  const size=34,pad=3,inner=size-pad*2;
  const pts=(template?.defaultPoints||[]).map(([x,y])=>`${(pad+x*inner).toFixed(1)},${(pad+y*inner).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${size} ${size}" width="34" height="34" focusable="false" aria-hidden="true"><rect x="0.5" y="0.5" width="${size-1}" height="${size-1}" rx="8" fill="rgba(255,250,240,.92)" stroke="rgba(108,81,66,.16)"/><polygon points="${pts}" fill="rgba(109,120,99,.16)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
}
function style(){
  if(document.getElementById('garmentTemplatePicker3DStyles'))return;
  const s=document.createElement('style');s.id='garmentTemplatePicker3DStyles';s.textContent=`
  .garment-template-picker-3d{display:grid;gap:7px;padding:8px;border:1px solid rgba(108,81,66,.13);border-radius:12px;background:rgba(248,241,227,.62)}
  .garment-template-picker-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.garment-template-picker-head strong{font:850 10px/1 system-ui;color:#62584d}.garment-template-picker-head small{font:700 8.5px/1 system-ui;color:#8a7d70}
  .garment-template-options{display:grid;grid-template-columns:1fr 1fr;gap:7px}.garment-template-btn{min-height:50px;padding:7px 8px;display:grid;grid-template-columns:36px minmax(0,1fr);gap:7px;align-items:center;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#675d51;text-align:left}.garment-template-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}.garment-template-btn:active{transform:scale(.98)}
  .garment-template-icon{width:34px;height:34px;display:grid;place-items:center}.garment-template-icon svg{display:block;overflow:visible}.garment-template-copy{min-width:0;display:grid;gap:2px}.garment-template-copy strong{font:800 9.5px/1.1 system-ui}.garment-template-copy small{font:700 8px/1 system-ui;color:#8a7d70}.garment-template-btn.active .garment-template-copy small{color:rgba(255,255,255,.75)}.garment-template-btn.active .garment-template-icon svg rect{fill:rgba(255,255,255,.10);stroke:rgba(255,255,255,.30)}.garment-template-btn.active .garment-template-icon svg polygon{fill:rgba(255,255,255,.14)}
  .garment-template-note{margin:0;font:8.8px/1.3 system-ui;color:#817568}
  @media(max-width:390px){.garment-template-options{gap:6px}.garment-template-btn{grid-template-columns:32px minmax(0,1fr);padding:6px}.garment-template-icon,.garment-template-icon svg{width:30px;height:30px}}
  `;document.head.appendChild(s);
}

function install(){
  style();
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  let picker=document.getElementById('garmentTemplatePicker3D');
  if(!picker){
    picker=document.createElement('section');picker.id='garmentTemplatePicker3D';picker.className='garment-template-picker-3d';
    picker.innerHTML='<div class="garment-template-picker-head"><strong>Garment Template</strong><small>Phase 3D-C</small></div><div class="garment-template-options"></div><p class="garment-template-note">Choose the closest garment outline. Switching templates keeps the guide position, size and protection strength, then asks you to apply the new shape.</p>';
    const head=panel.querySelector('.cutout-guide-head');
    (head||panel.firstElementChild)?.insertAdjacentElement('afterend',picker);
  }
  const options=picker.querySelector('.garment-template-options');
  if(options&&options.dataset.phase!=='3D-C-final'){
    options.replaceChildren();
    ENABLED.forEach(id=>{
      const d=def(id);if(!d)return;
      const b=document.createElement('button');b.type='button';b.className='garment-template-btn';b.dataset.template=id;
      b.innerHTML=`<span class="garment-template-icon" aria-hidden="true">${templateIconSvg(d)}</span><span class="garment-template-copy"><strong>${d.label}</strong><small>${d.defaultPoints.length} pts</small></span>`;
      b.onclick=()=>selectTemplate(id);options.appendChild(b);
    });
    options.dataset.phase='3D-C-final';
  }
  sync();return true;
}

function restoreCutoutScroll(panel,top){
  if(!panel)return;
  const restore=()=>{if(panel.isConnected)panel.scrollTop=top;};
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore);});
}

function selectTemplate(id){
  if(!ENABLED.includes(id))return false;
  const api=stateApi(),gapi=guidesApi(),cur=currentState();if(!api||!gapi||!cur)return false;
  const cutoutPanel=document.getElementById('studioPanelCutoutDev5');
  const preservedScroll=cutoutPanel?.scrollTop||0;
  const previous=cur.guide;
  if(previous?.type===id){sync();restoreCutoutScroll(cutoutPanel,preservedScroll);return true;}
  const transform=previous?.transform?clone(previous.transform):null;
  const protection=Number.isFinite(Number(previous?.protection))?Number(previous.protection):70;
  const next=clone(cur);next.workflow='guided';next.guide=gapi.createGuide(id,{transform,protection});
  next.guide.applied=false;next.guide.dirty=false;next.guide.appliedShape=null;next.guide.baseResult='';
  api.persist?.(undefined,next);
  gapi.reconcilePointControls?.();workflowApi()?.sync?.();sync();
  const edit=document.getElementById('cutoutGuideEdit3B');
  if(!workflowApi()?.visible)document.getElementById('cutoutGuideShow3B')?.click();
  if(!workflowApi()?.editing)edit?.click();
  const status=document.getElementById('studioStatus'),label=def(id)?.label||'Garment';
  if(status)status.textContent=label+' template selected. Adjust the outline, then Apply '+label+' Guide.';
  restoreCutoutScroll(cutoutPanel,preservedScroll);
  return true;
}

function sync(){
  const picker=document.getElementById('garmentTemplatePicker3D'),s=currentState();if(!picker||!s)return;
  const guided=s.workflow==='guided';picker.hidden=!guided;picker.setAttribute('aria-hidden',guided?'false':'true');
  picker.querySelectorAll('[data-template]').forEach(b=>{const active=b.dataset.template===(s.guide?.type||'shirt');b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');});
}

const open0=openPhotoStudio;
openPhotoStudio=async function(){const out=await open0.apply(this,arguments);install();sync();return out;};

const wf=workflowApi();
if(wf?.sync){const sync0=wf.sync;wf.sync=function(){const out=sync0.apply(this,arguments);install();sync();return out;};}

window.__audreyGarmentTemplatePicker={phase:'3D-C2',enabledTemplates:[...ENABLED],install,selectTemplate,sync,templateIconSvg};
})();
