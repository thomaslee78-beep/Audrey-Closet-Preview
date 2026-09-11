/* Audrey Closet v13.22 Models compatibility loader — dev2 */
(function(){
  'use strict';
  if(document.querySelector('script[data-audrey-models-dev2]'))return;
  const s=document.createElement('script');
  s.src='models-v13.22-dev2.js?v=13.22-models-dev2';
  s.dataset.audreyModelsDev2='1';
  s.onload=function(){
    const f=document.createElement('script');
    f.src='models-v13.22-dev2-touchfix.js?v=13.22-models-dev2';
    f.dataset.audreyModelsTouchfix='1';
    document.head.appendChild(f);
  };
  document.head.appendChild(s);
})();
