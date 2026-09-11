/* Audrey Closet v13.23 Photo Studio Guided Cutout layout dev6b
 * Presentation-only: reorganize existing Guided controls without changing
 * workflow state, guide geometry, apply/lock/reset handlers, or persistence.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioGuidedLayoutDev6bStyles';
const TOP_ID='cutoutGuideTopDev6b';
let observer=null;

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#cutoutGuide3B.guided-layout-dev6b{
  gap:6px!important;
}
#cutoutGuide3B .cutout-guide-top-dev6b{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:start!important;
  gap:10px!important;
}
#cutoutGuide3B .cutout-guide-copy-dev6b{
  min-width:0!important;
  display:grid!important;
  gap:4px!important;
}
#cutoutGuide3B .cutout-guide-copy-dev6b .cutout-guide-head{
  margin:0!important;
}
#cutoutGuide3B .cutout-guide-copy-dev6b .cutout-guide-note{
  margin:0!important;
  font:8.5px/1.3 system-ui!important;
  color:#817568!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b{
  display:grid!important;
  justify-items:stretch!important;
  gap:5px!important;
  min-width:92px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b .cutout-guide-status{
  justify-self:end!important;
  font-size:8.3px!important;
}
#cutoutGuide3B .cutout-guide-apply-wrap-dev6b #cutoutGuideApply3B{
  width:100%!important;
  min-height:32px!important;
  padding:5px 9px!important;
  border-radius:8px!important;
  font-size:8.7px!important;
}
#cutoutGuide3B .cutout-guide-actions{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:5px!important;
}
#cutoutGuide3B .cutout-guide-actions #cutoutGuideShow3B,
#cutoutGuide3B .cutout-guide-actions #cutoutGuideEdit3B,
#cutoutGuide3B .cutout-guide-actions #cutoutGuideLock3B{
  display:block!important;
}
#cutoutGuideSettingsCleanup1{
  order:99!important;
}
#cutoutGuideSettingsCleanup1 .cutout-guide-settings-body{
  display:none!important;
}
#cutoutGuideSettingsCleanup1:not(.is-collapsed) .cutout-guide-settings-body{
  display:grid!important;
  grid-template-columns:1fr!important;
}
#cutoutGuideSettingsCleanup1 #cutoutGuideReset3B{
  width:100%!important;
}
@media(max-width:390px){
  #cutoutGuide3B .cutout-guide-top-dev6b{grid-template-columns:minmax(0,1fr) 86px!important;gap:7px!important}
  #cutoutGuide3B .cutout-guide-apply-wrap-dev6b{min-width:86px!important}
}
`;
  document.head.appendChild(style);
}

function ensureSettings(reset){
  const panel=document.getElementById('cutoutGuide3B');
  if(!panel||!reset)return null;
  let settings=document.getElementById('cutoutGuideSettingsCleanup1');
  if(!settings){
    settings=document.createElement('section');
    settings.id='cutoutGuideSettingsCleanup1';
    settings.className='cutout-guide-settings is-collapsed';
    settings.innerHTML='<button type="button" class="cutout-guide-settings-toggle" aria-expanded="false"><span>Guide Settings</span><span>⌄</span></button><div class="cutout-guide-settings-body"></div>';
    panel.appendChild(settings);
    const toggle=settings.querySelector('.cutout-guide-settings-toggle');
    toggle.addEventListener('click',()=>{
      const collapsed=settings.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded',collapsed?'false':'true');
      const chev=toggle.querySelector('span:last-child');if(chev)chev.textContent=collapsed?'⌄':'⌃';
    });
  }
  const body=settings.querySelector('.cutout-guide-settings-body');
  if(body&&reset.parentElement!==body)body.appendChild(reset);
  return settings;
}

function installLayout(){
  const panel=document.getElementById('cutoutGuide3B');
  if(!panel)return false;
  installStyles();
  panel.classList.add('guided-layout-dev6b');

  const head=panel.querySelector('.cutout-guide-head');
  const status=panel.querySelector('.cutout-guide-status');
  const note=panel.querySelector('.cutout-guide-note');
  const apply=document.getElementById('cutoutGuideApply3B');
  const actions=panel.querySelector('.cutout-guide-actions');
  const show=document.getElementById('cutoutGuideShow3B');
  const edit=document.getElementById('cutoutGuideEdit3B');
  const lock=document.getElementById('cutoutGuideLock3B');
  const reset=document.getElementById('cutoutGuideReset3B');
  const picker=document.getElementById('garmentTemplatePicker3D');
  if(!head||!status||!note||!apply||!actions||!show||!edit||!lock||!reset)return false;

  let top=document.getElementById(TOP_ID);
  if(!top){
    top=document.createElement('div');top.id=TOP_ID;top.className='cutout-guide-top-dev6b';
    const copy=document.createElement('div');copy.className='cutout-guide-copy-dev6b';
    const applyWrap=document.createElement('div');applyWrap.className='cutout-guide-apply-wrap-dev6b';
    top.append(copy,applyWrap);
    panel.prepend(top);
  }
  const copy=top.querySelector('.cutout-guide-copy-dev6b');
  const applyWrap=top.querySelector('.cutout-guide-apply-wrap-dev6b');
  if(head.parentElement!==copy)copy.appendChild(head);
  if(note.parentElement!==copy)copy.appendChild(note);
  if(status.parentElement!==applyWrap)applyWrap.appendChild(status);
  if(apply.parentElement!==applyWrap)applyWrap.appendChild(apply);

  if(show.parentElement!==actions)actions.appendChild(show);
  if(edit.parentElement!==actions)actions.appendChild(edit);
  if(lock.parentElement!==actions)actions.appendChild(lock);
  [show,edit,lock].forEach(btn=>actions.appendChild(btn));

  const settings=ensureSettings(reset);
  if(settings&&picker){
    if(actions.previousElementSibling!==picker)picker.insertAdjacentElement('afterend',actions);
    if(settings.previousElementSibling!==actions)actions.insertAdjacentElement('afterend',settings);
  }
  return true;
}

function schedule(){requestAnimationFrame(installLayout)}
function start(){
  installLayout();
  const root=document.getElementById('studioPhoto')||document.body;
  observer=new MutationObserver(records=>{
    if(records.some(r=>Array.from(r.addedNodes||[]).some(n=>n.nodeType===1&&!n.closest?.('#'+TOP_ID))))schedule();
  });
  observer.observe(root,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutGuide3B,#garmentTemplatePicker3D'))requestAnimationFrame(installLayout);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
