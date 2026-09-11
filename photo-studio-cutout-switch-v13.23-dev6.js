/* Audrey Closet v13.23 Photo Studio Cutout switch dev6
 * Presentation-only: reuse the existing Automatic/Guided workflow buttons as
 * a compact two-state switch beside the Cutout Option label and explanation.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCutoutSwitchDev6Styles';
const ROW_ID='cutoutOptionRowDev6';
let observer=null;

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#cutoutWorkflow3B.cutout-switch-dev6{
  padding:8px 9px!important;
  gap:0!important;
}
#cutoutWorkflow3B .cutout-option-row-dev6{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:10px!important;
}
#cutoutWorkflow3B .cutout-option-copy-dev6{
  min-width:0!important;
  display:grid!important;
  gap:4px!important;
}
#cutoutWorkflow3B .cutout-option-copy-dev6 .cutout-workflow-3b-head{
  min-height:0!important;
  margin:0!important;
  display:block!important;
}
#cutoutWorkflow3B .cutout-option-copy-dev6 .cutout-workflow-3b-head strong{
  font:850 10.5px/1.1 system-ui!important;
  color:#5d5348!important;
}
#cutoutWorkflow3B .cutout-option-copy-dev6 .cutout-workflow-3b-head small{
  display:none!important;
}
#cutoutWorkflow3B .cutout-option-copy-dev6 .cutout-workflow-help{
  margin:0!important;
  font:8.8px/1.3 system-ui!important;
  color:#817568!important;
}
#cutoutWorkflow3B .cutout-workflow-main{
  display:contents!important;
}
#cutoutWorkflow3B .cutout-workflow-switch{
  width:136px!important;
  min-width:136px!important;
  display:grid!important;
  grid-template-columns:1fr 1fr!important;
  gap:2px!important;
  padding:3px!important;
  margin:0!important;
  border:1px solid rgba(108,81,66,.20)!important;
  border-radius:999px!important;
  background:rgba(224,217,205,.72)!important;
  box-shadow:inset 0 1px 2px rgba(65,52,37,.05)!important;
}
#cutoutWorkflow3B .cutout-workflow-btn{
  min-width:0!important;
  min-height:30px!important;
  padding:5px 7px!important;
  border:0!important;
  border-radius:999px!important;
  background:transparent!important;
  color:#74695d!important;
  box-shadow:none!important;
  font:850 8.8px/1 system-ui!important;
  transition:background .14s ease,color .14s ease,box-shadow .14s ease!important;
}
#cutoutWorkflow3B .cutout-workflow-btn.active{
  background:#fffaf0!important;
  color:#554b41!important;
  box-shadow:0 1px 3px rgba(65,52,37,.14)!important;
}
#cutoutWorkflow3B .cutout-workflow-btn:focus-visible{
  outline:2px solid rgba(125,53,71,.28)!important;
  outline-offset:1px!important;
}
@media(max-width:390px){
  #cutoutWorkflow3B .cutout-option-row-dev6{gap:7px!important}
  #cutoutWorkflow3B .cutout-workflow-switch{width:126px!important;min-width:126px!important}
  #cutoutWorkflow3B .cutout-workflow-btn{font-size:8.2px!important;padding-inline:5px!important}
}
`;
  document.head.appendChild(style);
}

function installLayout(){
  const root=document.getElementById('cutoutWorkflow3B');
  if(!root)return false;
  installStyles();
  root.classList.add('cutout-switch-dev6');

  const head=root.querySelector('.cutout-workflow-3b-head');
  const help=root.querySelector('.cutout-workflow-help');
  const sw=root.querySelector('.cutout-workflow-switch');
  if(!head||!help||!sw)return false;

  let row=document.getElementById(ROW_ID);
  if(!row){
    row=document.createElement('div');
    row.id=ROW_ID;
    row.className='cutout-option-row-dev6';
    const copy=document.createElement('div');
    copy.className='cutout-option-copy-dev6';
    row.append(copy,sw);
    root.prepend(row);
  }
  const copy=row.querySelector('.cutout-option-copy-dev6');
  if(copy){
    if(head.parentElement!==copy)copy.appendChild(head);
    if(help.parentElement!==copy)copy.appendChild(help);
  }
  if(sw.parentElement!==row)row.appendChild(sw);

  const automatic=sw.querySelector('[data-workflow="easy"]');
  const guided=sw.querySelector('[data-workflow="guided"]');
  if(automatic)automatic.textContent='Automatic';
  if(guided)guided.textContent='Guided';
  sw.setAttribute('aria-label','Cutout option');
  return true;
}

function schedule(){requestAnimationFrame(installLayout)}
function start(){
  installLayout();
  const photo=document.getElementById('studioPhoto')||document.body;
  if(observer)return;
  observer=new MutationObserver(records=>{
    if(records.some(r=>Array.from(r.addedNodes||[]).some(n=>n.nodeType===1&&!n.closest?.('#'+ROW_ID))))schedule();
  });
  observer.observe(photo,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutWorkflow3B'))requestAnimationFrame(installLayout);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
