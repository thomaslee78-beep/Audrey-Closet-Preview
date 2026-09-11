/* Audrey Closet v13.23 Photo Studio compact status polish dev5f
 * Presentation-only: hide shared Photo Studio status strip globally.
 * The underlying #studioStatus node remains in the DOM for compatibility.
 */
(function(){
'use strict';
const id='photoStudioStatusHideDev5fStyles';
if(document.getElementById(id))return;
const style=document.createElement('style');
style.id=id;
style.textContent=`
#photoStudioDialog #studioStatus{
  display:none!important;
}
`;
document.head.appendChild(style);
})();
