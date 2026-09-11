/* Audrey Closet v13.23.3 — Share modal background lock */
(function(){
  'use strict';
  const CLASS='share-modal-locked-v13233';
  let lockedY=0;

  function shareDialogs(){return ['shareChoiceDialog','sharePreviewDialog'].map(id=>document.getElementById(id)).filter(Boolean);}
  function anyShareOpen(){return shareDialogs().some(d=>d.open);}
  function lock(){
    if(document.body.classList.contains(CLASS))return;
    lockedY=window.scrollY||0;
    document.body.classList.add(CLASS);
    document.body.style.position='fixed';
    document.body.style.top=`-${lockedY}px`;
    document.body.style.left='0';
    document.body.style.right='0';
    document.body.style.width='100%';
    document.documentElement.style.overscrollBehavior='none';
  }
  function unlock(){
    if(!document.body.classList.contains(CLASS))return;
    document.body.classList.remove(CLASS);
    document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';
    document.documentElement.style.overscrollBehavior='';
    window.scrollTo(0,lockedY||0);
  }
  function sync(){anyShareOpen()?lock():unlock();}
  function bind(){
    shareDialogs().forEach(d=>{
      if(d.dataset.shareLockBound==='1')return;
      d.dataset.shareLockBound='1';
      d.addEventListener('close',()=>requestAnimationFrame(sync));
      d.addEventListener('cancel',()=>requestAnimationFrame(sync));
      const oldShow=d.showModal?.bind(d);
      if(oldShow&&!d.__audreyShareShowWrapped){d.__audreyShareShowWrapped=true;d.showModal=function(){const r=oldShow();requestAnimationFrame(sync);return r;};}
    });
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['open']});
  window.addEventListener('pageshow',sync);
  window.AUDREY_SHARE_MODAL_LOCK_V13233={sync,lock,unlock};
})();
