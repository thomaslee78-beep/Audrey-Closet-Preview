/* Audrey Closet v13.23 — Cutout UI Cleanup 1.
 * Presentation-only layer over the completed Phase 3D cutout stack.
 * Reuses all existing control IDs and event handlers; no cutout math, persistence,
 * guide geometry, manual mask behavior, or saved-state schema changes.
 */
(function(){
'use strict';

const stateApi=()=>window.__audreyCutoutState;
const workflowApi=()=>window.__audreyCutoutWorkflow3B;
let methodCollapsed=true;
let guideSettingsCollapsed=true;
let observer=null;

function activeGuideLabel(){
  const state=stateApi()?.getState?.();
  const type=state?.guide?.type||'shirt';
  return window.__audreyGarmentGuides?.getTemplate?.(type)?.label||'Garment';
}

function styles(){
  if(document.getElementById('cutoutUiCleanup1Styles'))return;
  const s=document.createElement('style');s.id='cutoutUiCleanup1Styles';s.textContent=`
    /* Compact workflow header */
    #cutoutWorkflow3B.cutout-ui-clean{gap:6px;margin-bottom:7px;padding:8px 9px;border-radius:12px}
    #cutoutWorkflow3B .cutout-workflow-3b-head{min-height:22px}
    #cutoutWorkflow3B .cutout-workflow-3b-head strong{font-size:10.5px}
    #cutoutWorkflow3B .cutout-workflow-3b-head small{display:none!important}
    #cutoutWorkflow3B .cutout-workflow-main{display:grid;grid-template-columns:minmax(150px,.72fr) minmax(0,1.28fr);align-items:center;gap:8px}
    #cutoutWorkflow3B .cutout-workflow-switch{gap:5px}
    #cutoutWorkflow3B .cutout-workflow-btn{min-height:32px;border-radius:9px;font-size:9px;padding:4px 7px}
    #cutoutWorkflow3B .cutout-workflow-help{font-size:8.8px;line-height:1.25;margin:0}

    /* Compact advanced Cutout Method disclosure */
    #studioCutoutMethods.cutout-method-compact{display:grid;gap:0;margin-top:6px;padding:0;border:1px solid rgba(108,81,66,.13);border-radius:11px;background:rgba(248,241,227,.50);overflow:hidden}
    #studioCutoutMethods .studio-cutout-method-heading{padding:7px 9px;cursor:pointer;user-select:none}
    #studioCutoutMethods .studio-cutout-method-heading strong{font-size:9.8px}
    #studioCutoutMethods .studio-cutout-method-heading small{font-size:8.5px;color:#7d3547}
    #studioCutoutMethods .cutout-method-chevron{font-size:11px;color:#817568;margin-left:3px}
    #studioCutoutMethods .cutout-method-body{display:grid;gap:6px;padding:0 8px 8px}
    #studioCutoutMethods.is-collapsed .cutout-method-body{display:none}
    #studioCutoutMethods .studio-cutout-method-row{gap:5px;padding-bottom:1px}
    #studioCutoutMethods .studio-cutout-method-btn{min-height:30px;padding:5px 8px;border-radius:8px;font-size:8.8px}
    #studioCutoutMethods .studio-cutout-method-help{font-size:8.6px;line-height:1.25}

    /* Garment template strip */
    #garmentTemplatePicker3D{gap:5px;padding:7px 8px;border-radius:10px}
    #garmentTemplatePicker3D .garment-template-picker-head strong{font-size:9.6px}
    #garmentTemplatePicker3D .garment-template-picker-head small{display:none!important}
    #garmentTemplatePicker3D .garment-template-options{display:flex!important;grid-template-columns:none!important;gap:5px;overflow-x:auto;padding:1px 0 3px;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity}
    #garmentTemplatePicker3D .garment-template-options::-webkit-scrollbar{display:none}
    #garmentTemplatePicker3D .garment-template-btn{flex:0 0 66px;min-height:58px;padding:5px 4px;display:grid;grid-template-columns:1fr;grid-template-rows:29px auto;gap:3px;text-align:center;scroll-snap-align:start;border-radius:9px}
    #garmentTemplatePicker3D .garment-template-icon{width:29px;height:29px;margin:auto}
    #garmentTemplatePicker3D .garment-template-icon svg{width:29px;height:29px}
    #garmentTemplatePicker3D .garment-template-copy{display:block;min-width:0}
    #garmentTemplatePicker3D .garment-template-copy strong{display:block;font-size:8px;line-height:1.05;white-space:normal}
    #garmentTemplatePicker3D .garment-template-copy small{display:none!important}
    #garmentTemplatePicker3D .garment-template-note{display:none!important}

    /* Guide actions: common actions visible, secondary actions tucked away */
    #cutoutGuide3B.cutout-guide-compact{gap:6px;margin-bottom:7px;padding:8px;border-radius:11px}
    #cutoutGuide3B .cutout-guide-head strong{font-size:10px}
    #cutoutGuide3B .cutout-guide-status{font-size:8.3px}
    #cutoutGuide3B .cutout-guide-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
    #cutoutGuide3B .cutout-guide-btn,#cutoutGuide3B .cutout-guide-apply{min-height:31px;padding:5px;border-radius:8px;font-size:8.6px;line-height:1.05}
    #cutoutGuide3B .cutout-guide-note{font-size:8.5px;line-height:1.25}
    #cutoutGuide3B .cutout-guide-settings{display:grid;gap:0;border:1px solid rgba(108,81,66,.12);border-radius:9px;background:rgba(248,241,227,.42);overflow:hidden}
    #cutoutGuide3B .cutout-guide-settings-toggle{width:100%;min-height:29px;padding:5px 8px;border:0;background:transparent;color:#675d51;display:flex;align-items:center;justify-content:space-between;gap:8px;font:800 8.7px/1 system-ui;text-align:left}
    #cutoutGuide3B .cutout-guide-settings-body{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 6px 6px}
    #cutoutGuide3B .cutout-guide-settings.is-collapsed .cutout-guide-settings-body{display:none}

    @media(max-width:410px){
      #cutoutWorkflow3B .cutout-workflow-main{grid-template-columns:1fr;gap:5px}
      #cutoutWorkflow3B .cutout-workflow-help{padding:0 1px}
      #garmentTemplatePicker3D .garment-template-btn{flex-basis:62px}
    }
  `;document.head.appendChild(s);
}

function polishWorkflow(){
  const root=document.getElementById('cutoutWorkflow3B');if(!root)return false;
  root.classList.add('cutout-ui-clean');
  const head=root.querySelector('.cutout-workflow-3b-head strong');if(head)head.textContent='Cutout';
  const small=root.querySelector('.cutout-workflow-3b-head small');if(small)small.textContent='';
  const easy=root.querySelector('[data-workflow="easy"]');if(easy)easy.textContent='Automatic';
  const guided=root.querySelector('[data-workflow="guided"]');if(guided)guided.textContent='Custom';
  const sw=root.querySelector('.cutout-workflow-switch'),help=root.querySelector('.cutout-workflow-help');
  if(sw&&help&&!root.querySelector('.cutout-workflow-main')){
    const main=document.createElement('div');main.className='cutout-workflow-main';
    sw.parentNode.insertBefore(main,sw);main.append(sw,help);
  }
  if(help){
    const custom=stateApi()?.getState?.()?.workflow==='guided';
    help.textContent=custom?'Use a garment outline when Automatic needs extra control around the item.':'Best for most photos. Choose Original, Quick or Clean for the cutout you prefer.';
  }
  return true;
}

function selectedMethodLabel(root){
  const active=root?.querySelector('[data-cutout-method].active');return active?.textContent?.trim()||'Standard';
}
function syncMethodDisclosure(){
  const root=document.getElementById('studioCutoutMethods');if(!root)return;
  root.classList.toggle('is-collapsed',methodCollapsed);
  const toggle=root.querySelector('.studio-cutout-method-heading');
  toggle?.setAttribute('aria-expanded',methodCollapsed?'false':'true');
  const small=toggle?.querySelector('small');if(small)small.textContent=selectedMethodLabel(root);
  const chev=toggle?.querySelector('.cutout-method-chevron');if(chev)chev.textContent=methodCollapsed?'⌄':'⌃';
}
function polishMethods(){
  const root=document.getElementById('studioCutoutMethods');if(!root)return false;
  root.classList.add('cutout-method-compact');
  const heading=root.querySelector('.studio-cutout-method-heading'),row=root.querySelector('.studio-cutout-method-row'),help=root.querySelector('.studio-cutout-method-help');
  if(!heading||!row||!help)return false;
  const strong=heading.querySelector('strong');if(strong)strong.textContent='Cutout Method';
  let small=heading.querySelector('small');if(!small){small=document.createElement('small');heading.appendChild(small);}
  if(!heading.querySelector('.cutout-method-chevron')){const c=document.createElement('span');c.className='cutout-method-chevron';heading.appendChild(c);}
  if(!root.querySelector('.cutout-method-body')){
    const body=document.createElement('div');body.className='cutout-method-body';
    heading.insertAdjacentElement('afterend',body);body.append(row,help);
    heading.setAttribute('role','button');heading.setAttribute('tabindex','0');
    const toggle=()=>{methodCollapsed=!methodCollapsed;syncMethodDisclosure();};
    heading.addEventListener('click',toggle);
    heading.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    row.addEventListener('click',()=>queueMicrotask(syncMethodDisclosure));
  }
  syncMethodDisclosure();return true;
}

function syncGuideSettings(){
  const box=document.getElementById('cutoutGuideSettingsCleanup1');if(!box)return;
  box.classList.toggle('is-collapsed',guideSettingsCollapsed);
  const toggle=box.querySelector('.cutout-guide-settings-toggle');toggle?.setAttribute('aria-expanded',guideSettingsCollapsed?'false':'true');
  const chev=toggle?.querySelector('span:last-child');if(chev)chev.textContent=guideSettingsCollapsed?'⌄':'⌃';
}
function polishGuide(){
  const panel=document.getElementById('cutoutGuide3B');if(!panel)return false;
  panel.classList.add('cutout-guide-compact');
  const actions=panel.querySelector('.cutout-guide-actions'),apply=document.getElementById('cutoutGuideApply3B');
  if(actions&&apply&&apply.parentElement!==actions){
    const edit=document.getElementById('cutoutGuideEdit3B');
    if(edit?.nextSibling)actions.insertBefore(apply,edit.nextSibling);else actions.appendChild(apply);
  }
  const show=document.getElementById('cutoutGuideShow3B'),edit=document.getElementById('cutoutGuideEdit3B');
  if(show)show.textContent=workflowApi()?.visible?'Hide':'Show';
  if(edit)edit.textContent=workflowApi()?.editing?'Editing':'Edit';
  if(apply){const state=stateApi()?.getState?.(),g=state?.guide;apply.textContent=(g?.applied?'Reapply':'Apply');}
  let settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(!settings&&actions){
    settings=document.createElement('section');settings.id='cutoutGuideSettingsCleanup1';settings.className='cutout-guide-settings';
    settings.innerHTML='<button type="button" class="cutout-guide-settings-toggle" aria-expanded="false"><span>Guide Settings</span><span>⌄</span></button><div class="cutout-guide-settings-body"></div>';
    actions.insertAdjacentElement('afterend',settings);
    const body=settings.querySelector('.cutout-guide-settings-body');
    const lock=document.getElementById('cutoutGuideLock3B'),reset=document.getElementById('cutoutGuideReset3B');
    if(lock)body.appendChild(lock);if(reset)body.appendChild(reset);
    settings.querySelector('.cutout-guide-settings-toggle').onclick=()=>{guideSettingsCollapsed=!guideSettingsCollapsed;syncGuideSettings();};
  }
  const note=panel.querySelector('.cutout-guide-note');if(note)note.textContent='Position the outline around the garment, then Apply. Use Edit whenever the shape needs adjustment.';
  syncGuideSettings();return true;
}

function polishTemplates(){
  const picker=document.getElementById('garmentTemplatePicker3D');if(!picker)return false;
  const head=picker.querySelector('.garment-template-picker-head strong');if(head)head.textContent='Garment';
  const small=picker.querySelector('.garment-template-picker-head small');if(small)small.textContent='';
  return true;
}

function cleanStatusCopy(){
  const status=document.getElementById('studioStatus');if(!status)return;
  let text=status.textContent||'';
  if(/Phase 3[ABC-D]/i.test(text)){
    text=text.replace(/\s*Phase 3B stores the guide state; algorithm-independent protection is added in Phase 3C\.?/gi,'')
             .replace(/Phase 3C will connect this applied guide to every cutout algorithm\.?/gi,'Guide saved and ready to use with Quick or Clean.')
             .replace(/Phase 3C guide protection/gi,'Garment guide');
  }
  const label=activeGuideLabel();
  if(label!=='Shirt')text=text.replace(/Shirt Guide/g,label+' Guide');
  status.textContent=text;
}

function syncAll(){
  styles();polishWorkflow();polishMethods();polishTemplates();polishGuide();cleanStatusCopy();
}
function bindRefresh(){
  const root=document.getElementById('studioPhoto');
  if(observer||!root)return;
  observer=new MutationObserver(()=>queueMicrotask(syncAll));
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','aria-pressed']});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutWorkflow3B,#cutoutGuide3B,#garmentTemplatePicker3D,#studioCutoutMethods'))queueMicrotask(syncAll);
  },true);
}

const open0=openPhotoStudio;
openPhotoStudio=async function(){
  methodCollapsed=true;guideSettingsCollapsed=true;
  const out=await open0.apply(this,arguments);
  syncAll();bindRefresh();return out;
};

window.__audreyCutoutUiCleanup={phase:'cleanup1',sync:syncAll,get methodCollapsed(){return methodCollapsed;},get guideSettingsCollapsed(){return guideSettingsCollapsed;}};
})();
