/* Audrey Closet v13.23 Photo Studio Clean status polish dev5e
 * Presentation-only: hide shared Photo Studio status strip while Clean is active.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCleanStatusDev5eStyles';
function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#photoStudioDialog.clean-panel-active-dev5e #studioStatus{
  display:none!important;
}
`;
  document.head.appendChild(style);
}
function sync(){
  const dialog=document.getElementById('photoStudioDialog');
  const clean=document.getElementById('studioPanelCleanDev5');
  if(!dialog||!clean)return false;
  dialog.classList.toggle('clean-panel-active-dev5e',clean.classList.contains('active'));
  return true;
}
function bind(){
  installStyles();
  if(!sync())return;
  document.querySelectorAll('.studio-rail-btn-dev5').forEach(btn=>{
    if(btn.dataset.cleanStatusDev5e)return;
    btn.dataset.cleanStatusDev5e='1';
    btn.addEventListener('click',()=>requestAnimationFrame(sync));
  });
}
function start(){
  bind();
  const observer=new MutationObserver(()=>{
    if(document.getElementById('studioWorkspaceDev5')){
      bind();
      sync();
    }
  });
  observer.observe(document.body,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
