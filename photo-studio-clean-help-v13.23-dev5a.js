/* Audrey Closet v13.23 Photo Studio Clean help polish dev5a
 * Presentation-only overlay for the dev5 Clean instruction surface.
 */
(function(){
'use strict';
const id='photoStudioCleanHelpDev5aStyles';
if(document.getElementById(id))return;
const style=document.createElement('style');
style.id=id;
style.textContent=`
#photoStudioDialog .clean-help-dev5{
  background:rgba(255,253,247,.88)!important;
  border-color:rgba(108,81,66,.20)!important;
  box-shadow:0 1px 3px rgba(65,52,37,.045)!important;
}
`;
document.head.appendChild(style);
})();
