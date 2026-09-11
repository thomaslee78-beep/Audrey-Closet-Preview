/* Audrey Closet v13.23 Photo Studio Clean brush visibility dev5b
 * Presentation-only specificity correction for the dev5 0-100 brush control.
 */
(function(){
'use strict';
const id='photoStudioCleanBrushDev5bStyles';
if(document.getElementById(id))return;
const style=document.createElement('style');
style.id=id;
style.textContent=`
#photoStudioDialog .studio-brush-control-dev5.show{
  display:grid!important;
}
`;
document.head.appendChild(style);
})();
