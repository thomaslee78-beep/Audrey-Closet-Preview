/* Audrey Closet v13.23 Photo Studio rail blend dev5h
 * Presentation-only: match left rail background to the right workspace
 * without a divider so the workspace reads as one continuous surface.
 */
(function(){
'use strict';
const id='photoStudioRailBlendDev5hStyles';
if(document.getElementById(id))return;
const style=document.createElement('style');
style.id=id;
style.textContent=`
#photoStudioDialog .studio-workspace-dev5{
  background:#f6f0e5!important;
}
#photoStudioDialog .studio-rail-dev5{
  background:#f6f0e5!important;
  border-right:0!important;
  padding-right:0!important;
}
`;
document.head.appendChild(style);
})();
