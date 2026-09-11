/* Audrey Closet v13.23 Photo Studio Cutout Amount dev6a
 * Presentation-only: reuse the existing 0-100 Cutout Sensitivity proxy as a
 * compact one-row Cutout Amount slider above Advanced Cutout Method.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCutoutRemovalDev6aStyles';
let observer=null;

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#photoStudioDialog .studio-edge-control.cutout-sensitivity-clean.cutout-removal-dev6a{
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr) auto!important;
  grid-template-areas:'label slider value'!important;
  align-items:center!important;
  gap:8px!important;
  margin:6px 0 7px!important;
  padding:5px 9px!important;
  border:1px solid rgba(108,81,66,.14)!important;
  border-radius:11px!important;
  background:rgba(255,253,249,.96)!important;
}
#photoStudioDialog .cutout-removal-dev6a>.cutout-sensitivity-label{
  grid-area:label!important;
  white-space:nowrap!important;
  font:800 9.5px/1 system-ui!important;
  color:#675d51!important;
}
#photoStudioDialog .cutout-removal-dev6a>.cutout-sensitivity-value{
  grid-area:value!important;
  min-width:24px!important;
  text-align:right!important;
  justify-self:end!important;
  font:850 9.5px/1 system-ui!important;
  font-variant-numeric:tabular-nums!important;
  color:#7d3547!important;
}
#photoStudioDialog .cutout-removal-dev6a>.cutout-sensitivity-scale{
  grid-area:slider!important;
  display:block!important;
  width:100%!important;
  min-width:0!important;
  margin:0!important;
}
#photoStudioDialog .cutout-removal-dev6a>.cutout-sensitivity-scale>small{
  display:none!important;
}
#photoStudioDialog #studioEdgeUi100{
  -webkit-appearance:none!important;
  appearance:none!important;
  width:100%!important;
  min-width:0!important;
  height:28px!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  cursor:pointer!important;
}
#photoStudioDialog #studioEdgeUi100::-webkit-slider-runnable-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#photoStudioDialog #studioEdgeUi100::-webkit-slider-thumb{
  -webkit-appearance:none!important;
  appearance:none!important;
  width:18px!important;
  height:18px!important;
  border-radius:50%!important;
  margin-top:-7px!important;
  background:#f8f3e9!important;
  border:2px solid #76685a!important;
  box-shadow:0 1px 3px rgba(60,48,36,.18)!important;
}
#photoStudioDialog #studioEdgeUi100:focus-visible::-webkit-slider-thumb{
  outline:2px solid rgba(118,104,90,.28)!important;
  outline-offset:2px!important;
}
#photoStudioDialog #studioEdgeUi100::-moz-range-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#photoStudioDialog #studioEdgeUi100::-moz-range-thumb{
  width:18px!important;
  height:18px!important;
  border-radius:50%!important;
  background:#f8f3e9!important;
  border:2px solid #76685a!important;
  box-shadow:0 1px 3px rgba(60,48,36,.18)!important;
}
`;
  document.head.appendChild(style);
}

function layoutRemoval(){
  const proxy=document.getElementById('studioEdgeUi100');
  const methods=document.getElementById('studioCutoutMethods');
  if(!proxy||!methods)return false;
  const control=proxy.closest('label.studio-edge-control')||proxy.closest('.studio-edge-control');
  if(!control)return false;
  installStyles();
  control.classList.add('cutout-removal-dev6a');
  const label=control.querySelector('.cutout-sensitivity-label');
  if(label)label.textContent='Cutout Amount';
  const parent=methods.parentElement;
  if(parent&&control.parentElement===parent&&control.nextElementSibling!==methods){
    parent.insertBefore(control,methods);
  } else if(parent&&control.parentElement!==parent){
    parent.insertBefore(control,methods);
  }
  proxy.setAttribute('aria-label','Cutout Amount');
  return true;
}
function schedule(){requestAnimationFrame(layoutRemoval)}
function start(){
  layoutRemoval();
  const root=document.getElementById('studioPhoto')||document.body;
  observer=new MutationObserver(records=>{
    if(records.some(r=>Array.from(r.addedNodes||[]).some(n=>n.nodeType===1)))schedule();
  });
  observer.observe(root,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutWorkflow3B,#studioCutoutMethods'))requestAnimationFrame(layoutRemoval);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
