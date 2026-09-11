/* Audrey Closet v13.23 Photo Studio Clean brush layout dev5c
 * Presentation-only: place the Restore/Erase brush control above help and
 * render it as one compact row: Brush | 0-100 slider | value.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCleanBrushDev5cStyles';
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#photoStudioDialog .studio-brush-control-dev5{
  grid-template-columns:auto minmax(0,1fr) auto!important;
  grid-template-areas:'label range value'!important;
  align-items:center!important;
  gap:8px!important;
  min-height:38px!important;
  margin:0 0 7px!important;
  padding:5px 9px!important;
  font-size:10px!important;
}
#photoStudioDialog .studio-brush-control-dev5>span:first-child{
  grid-area:label!important;
  white-space:nowrap!important;
}
#photoStudioDialog .studio-brush-control-dev5 input[type=range]{
  grid-area:range!important;
  width:100%!important;
  min-width:0!important;
  margin:0!important;
  height:28px!important;
}
#photoStudioDialog .studio-brush-value-dev5{
  grid-area:value!important;
  min-width:24px!important;
  text-align:right!important;
  justify-self:end!important;
  font-variant-numeric:tabular-nums!important;
}
`;
  document.head.appendChild(style);
}
function placeBrushAboveHelp(){
  const clean=document.getElementById('studioPanelCleanDev5');
  const brush=document.getElementById('studioBrushControlUi100Dev5');
  const help=document.getElementById('studioCleanHelpDev5');
  if(!clean||!brush||!help)return false;
  if(brush.parentElement!==clean)clean.appendChild(brush);
  if(brush.nextElementSibling!==help)clean.insertBefore(brush,help);
  return true;
}
function start(){
  installStyles();
  if(placeBrushAboveHelp())return;
  const observer=new MutationObserver(()=>{
    if(placeBrushAboveHelp())observer.disconnect();
  });
  observer.observe(document.body,{subtree:true,childList:true});
  requestAnimationFrame(placeBrushAboveHelp);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
