/* Audrey Closet v13.23 — Cutout UI Cleanup iteration 4.
 * Copy/layout refinement only. Keeps the underlying 25–80 processing sensitivity
 * range intact while presenting it to users as a clearer 0–100 UI scale.
 */
(function(){
'use strict';

let observer=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const toUi=internal=>Math.round((clamp(Number(internal)||45,25,80)-25)*100/55);
const toInternal=ui=>Math.round(25+clamp(Number(ui)||0,0,100)*55/100);

function styles(){
  if(document.getElementById('cutoutUiCleanupIter2Styles'))return;
  const s=document.createElement('style');s.id='cutoutUiCleanupIter2Styles';s.textContent=`
    #cutoutWorkflow3B.cutout-ui-clean{gap:5px!important}
    #cutoutWorkflow3B .cutout-workflow-3b-head{min-height:18px!important;margin:0!important}
    #cutoutWorkflow3B .cutout-workflow-main{grid-template-columns:1fr!important;gap:4px!important}
    #cutoutWorkflow3B .cutout-workflow-help{order:0;margin:0!important}
    #cutoutWorkflow3B .cutout-workflow-switch{order:1;margin:0!important}

    #cutoutGuide3B .cutout-guide-note{order:1;margin:0 0 1px!important}
    #garmentTemplatePicker3D{order:2}
    #cutoutGuide3B .cutout-guide-actions{order:3}
    #cutoutGuideSettingsCleanup1{order:4}

    .studio-edge-control.cutout-sensitivity-clean{display:grid!important;grid-template-columns:1fr auto;gap:5px 8px;align-items:center}
    .studio-edge-control.cutout-sensitivity-clean>.cutout-sensitivity-label{font:800 9.5px/1 system-ui;color:#675d51}
    .studio-edge-control.cutout-sensitivity-clean>.cutout-sensitivity-value{min-width:24px;text-align:right;font:850 9.5px/1 system-ui;color:#7d3547}
    .cutout-sensitivity-scale{grid-column:1/-1;display:grid;grid-template-columns:18px minmax(0,1fr) 24px;gap:6px;align-items:center;width:100%}
    .cutout-sensitivity-scale>small{font:750 8px/1 system-ui;color:#8a7d70;text-align:center}
    .cutout-sensitivity-scale input[type="range"]{width:100%;min-width:0;margin:0;padding:0}
    #studioEdge.cutout-sensitivity-internal{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;clip-path:inset(50%)!important}
  `;document.head.appendChild(s);
}

function polishCopyAndLayout(){
  const workflow=document.getElementById('cutoutWorkflow3B');
  const heading=workflow?.querySelector('.cutout-workflow-3b-head strong');if(heading)heading.textContent='Cutout Option';
  const guided=workflow?.querySelector('[data-workflow="guided"]');if(guided)guided.textContent='Guided';
  const main=workflow?.querySelector('.cutout-workflow-main');
  const sw=workflow?.querySelector('.cutout-workflow-switch');
  const help=workflow?.querySelector('.cutout-workflow-help');
  if(help){
    const isGuided=window.__audreyCutoutState?.getState?.()?.workflow==='guided';
    help.textContent=isGuided
      ?'Guided adds an editable garment outline which can be applied to protect the region, before applying a cutout method.'
      :'Automatic is recommended for most photos. Choose Original, Quick, or Clean to apply a cutout to the photo.';
    if(main&&sw&&help.parentElement===main&&main.firstElementChild!==help)main.insertBefore(help,sw);
  }

  const methods=document.getElementById('studioCutoutMethods');
  const methodHeading=methods?.querySelector('.studio-cutout-method-heading strong');if(methodHeading)methodHeading.textContent='Advanced Cutout Method';

  const guide=document.getElementById('cutoutGuide3B');
  const guideHead=guide?.querySelector('.cutout-guide-head');
  const note=guide?.querySelector('.cutout-guide-note');
  const picker=document.getElementById('garmentTemplatePicker3D');
  if(note){
    note.textContent='Choose a Garment Shape, position it around the garment, edit the outline, then click the Apply Guide button to protect the region before applying a cutout method such as Quick or Clean.';
    if(guideHead&&note.previousElementSibling!==guideHead)guideHead.insertAdjacentElement('afterend',note);
  }
  const pickerHeading=picker?.querySelector('.garment-template-picker-head strong');if(pickerHeading)pickerHeading.textContent='Garment Shape';

  /* Guide Settings disclosure state/behavior is owned by the later Photo Studio layout layer.
     Do not force it open or remove its click handler here. */
  const settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(settings){
    const toggle=settings.querySelector('.cutout-guide-settings-toggle');
    const first=toggle?.querySelector('span:first-child');if(first)first.textContent='Guide Settings';
  }
}

function syncSensitivityFromInternal(){
  const internal=document.getElementById('studioEdge');
  const proxy=document.getElementById('studioEdgeUi100');
  const value=document.getElementById('studioEdgeUiValue');
  if(!internal||!proxy||!value)return;
  const ui=toUi(internal.value);proxy.value=String(ui);value.textContent=String(ui);
}

function polishSensitivity(){
  const internal=document.getElementById('studioEdge');if(!internal)return false;
  const label=internal.closest('label.studio-edge-control')||internal.parentElement;if(!label)return false;
  styles();label.classList.add('cutout-sensitivity-clean');
  internal.classList.add('cutout-sensitivity-internal');

  let title=label.querySelector('.cutout-sensitivity-label');
  const oldSpan=label.querySelector('span[data-i18n="studio.sensitivity"],span');
  if(!title){
    title=document.createElement('span');title.className='cutout-sensitivity-label';
    if(oldSpan&&oldSpan!==title)oldSpan.replaceWith(title);else label.insertBefore(title,label.firstChild);
  }
  title.removeAttribute('data-i18n');title.textContent='Cutout Sensitivity';

  let value=label.querySelector('#studioEdgeUiValue');
  if(!value){value=document.createElement('span');value.id='studioEdgeUiValue';value.className='cutout-sensitivity-value';label.insertBefore(value,internal);}

  let scale=label.querySelector('.cutout-sensitivity-scale');
  if(!scale){
    scale=document.createElement('div');scale.className='cutout-sensitivity-scale';
    scale.innerHTML='<small>0</small><input id="studioEdgeUi100" type="range" min="0" max="100" step="1" aria-label="Cutout Sensitivity"><small>100</small>';
    label.appendChild(scale);
    const proxy=scale.querySelector('#studioEdgeUi100');
    proxy.addEventListener('input',()=>{
      internal.value=String(toInternal(proxy.value));
      value.textContent=proxy.value;
      internal.dispatchEvent(new Event('input',{bubbles:true}));
    });
    proxy.addEventListener('change',()=>{
      internal.value=String(toInternal(proxy.value));
      value.textContent=proxy.value;
      internal.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }
  syncSensitivityFromInternal();return true;
}

function sync(){styles();polishCopyAndLayout();polishSensitivity();}
function bind(){
  const root=document.getElementById('studioPhoto');if(observer||!root)return;
  observer=new MutationObserver(()=>queueMicrotask(sync));
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','aria-pressed']});
  document.addEventListener('click',e=>{if(e.target.closest?.('#cutoutWorkflow3B,#cutoutGuide3B,#garmentTemplatePicker3D,#studioCutoutMethods'))queueMicrotask(sync);},true);
}

const open0=openPhotoStudio;
openPhotoStudio=async function(){const out=await open0.apply(this,arguments);sync();bind();return out;};

window.__audreyCutoutUiCleanupIter2={phase:'cleanup4',sync,toUi,toInternal};
})();
