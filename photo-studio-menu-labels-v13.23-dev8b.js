/* Audrey Closet v13.23 Photo Studio menu labels/order dev8c
 * Presentation-only: rename Photo -> Reset and Background -> Canvas,
 * and order the existing rail controls as Cutout, Clean, Adjust, Canvas, Reset.
 * Underlying panel keys/handlers remain unchanged.
 */
(function(){
'use strict';
const ORDER=['cutout','clean','adjust','background','photo'];
function sync(){
  const rail=document.querySelector('.studio-rail-dev5');
  const photoNav=document.querySelector('.studio-rail-btn-dev5[data-studio-nav="photo"] span:last-child');
  const bgNav=document.querySelector('.studio-rail-btn-dev5[data-studio-nav="background"] span:last-child');
  const photoTitle=document.querySelector('#studioPanelPhotoDev5 .studio-panel-title-dev5 strong');
  const bgTitle=document.querySelector('#studioPanelBackgroundDev5 .studio-panel-title-dev5 strong');
  if(photoNav)photoNav.textContent='Reset';
  if(bgNav)bgNav.textContent='Canvas';
  if(photoTitle)photoTitle.textContent='Reset';
  if(bgTitle)bgTitle.textContent='Canvas';
  if(rail){
    ORDER.forEach(key=>{
      const button=rail.querySelector(`.studio-rail-btn-dev5[data-studio-nav="${key}"]`);
      if(button)rail.appendChild(button);
    });
  }
}
function start(){
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest?.('.studio-rail-btn-dev5'))requestAnimationFrame(sync);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
