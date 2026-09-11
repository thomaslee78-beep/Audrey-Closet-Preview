/* Audrey Closet v13.23 Photo Studio Cutout surface polish dev6f
 * Presentation-only: unify Automatic Cutout cards with soft white surfaces,
 * rename Removal to Cutout Amount, and give Garment Shape a subtle blush tone.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCutoutSurfaceDev6fStyles';
function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#cutoutWorkflow3B{
  background:rgba(255,253,249,.96)!important;
  border-color:rgba(108,81,66,.14)!important;
}
#photoStudioDialog .studio-edge-control.cutout-sensitivity-clean{
  background:rgba(255,253,249,.96)!important;
  border:1px solid rgba(108,81,66,.14)!important;
  border-radius:10px!important;
  padding:6px 8px!important;
}
#studioCutoutMethods.cutout-method-compact{
  background:rgba(255,253,249,.96)!important;
  border-color:rgba(108,81,66,.14)!important;
}
#garmentTemplatePicker3D{
  background:#f3ebe7!important;
  border-color:rgba(125,53,71,.13)!important;
}
`;
document.head.appendChild(s);
}
function sync(){
  styles();
  const label=document.querySelector('.studio-edge-control.cutout-sensitivity-clean>.cutout-sensitivity-label');
  if(label&&label.textContent!=='Cutout Amount')label.textContent='Cutout Amount';
}
function start(){
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#cutoutWorkflow3B,#studioCutoutMethods,#garmentTemplatePicker3D'))requestAnimationFrame(sync);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
