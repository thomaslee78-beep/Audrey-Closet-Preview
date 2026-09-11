/* Audrey Closet v13.23 Photo Studio Clean brush slider dev5d
 * Presentation-only custom range styling for Restore/Erase brush control.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioCleanBrushSliderDev5dStyles';
if(document.getElementById(STYLE_ID))return;
const style=document.createElement('style');
style.id=STYLE_ID;
style.textContent=`
#photoStudioDialog #studioBrushUi100Dev5{
  -webkit-appearance:none!important;
  appearance:none!important;
  width:100%!important;
  height:28px!important;
  background:transparent!important;
  cursor:pointer!important;
  padding:0!important;
}
#photoStudioDialog #studioBrushUi100Dev5::-webkit-slider-runnable-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#photoStudioDialog #studioBrushUi100Dev5::-webkit-slider-thumb{
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
#photoStudioDialog #studioBrushUi100Dev5:focus-visible::-webkit-slider-thumb{
  outline:2px solid rgba(118,104,90,.28)!important;
  outline-offset:2px!important;
}
#photoStudioDialog #studioBrushUi100Dev5::-moz-range-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#photoStudioDialog #studioBrushUi100Dev5::-moz-range-thumb{
  width:18px!important;
  height:18px!important;
  border-radius:50%!important;
  background:#f8f3e9!important;
  border:2px solid #76685a!important;
  box-shadow:0 1px 3px rgba(60,48,36,.18)!important;
}
`;
document.head.appendChild(style);
})();
