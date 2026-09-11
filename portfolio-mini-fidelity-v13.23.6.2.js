/* Audrey Closet v13.23.6.2 — Scaled Full-Size Portfolio Board
 * Portfolio cards render each saved look at its original Board dimensions and
 * typography, then scale the completed Board plane down as one unit. This keeps
 * text size hierarchy and browser line wrapping identical to the saved Board.
 */
(function(){
  'use strict';

  const VERSION='13.23.6.2';
  let installed=false;
  let miniObserver=null;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function num(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;}
  function pxGeometry(piece){
    const p=normalizeBoardItem({...piece});
    return{p,x:num(p.x),y:num(p.y),w:Math.max(.01,num(p.w,1)),h:Math.max(.01,num(p.h,1)),z:num(p.z,1),rotation:num(p.rotation)};
  }
  function geometryStyle(g){return `left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;z-index:${g.z};transform:rotate(${g.rotation}deg)`;}

  function renderText(piece){
    const g=pxGeometry(piece),engine=window.AUDREY_BOARD_TEXT_LAYOUT_V13235;
    const markup=engine?.textMarkup?engine.textMarkup(g.p):boardItemContent(g.p);
    return `<div class="portfolio-mini-object-v132362 portfolio-mini-text-v132362" style="${geometryStyle(g)}">${markup}</div>`;
  }
  function renderPiece(piece){
    const g=pxGeometry(piece),obj=(g.p.source==='wishlist'?state.wishlist:state.items).find(x=>x.id===g.p.id);
    if(!obj?.photo)return'';
    return `<img class="portfolio-mini-object-v132362 portfolio-mini-piece-v132362" src="${esc(obj.photo)}" style="${geometryStyle(g)}" draggable="false">`;
  }
  function renderSticker(piece){
    const g=pxGeometry(piece),compat=window.AUDREY_STICKER_RENDER_COMPAT_V13231;
    const markup=compat?.stickerMarkup?compat.stickerMarkup(g.p,'portfolio-sticker-content-v13231'):boardItemContent(g.p);
    return `<div class="portfolio-mini-object-v132362 portfolio-mini-sticker-v132362" style="${geometryStyle(g)}">${markup}</div>`;
  }
  function renderBoardDecoration(piece){
    const g=pxGeometry(piece),markup=boardItemContent(g.p);
    return `<div class="portfolio-mini-object-v132362 portfolio-mini-decoration-v132362 kind-${esc(g.p.kind||'decoration')}" style="${geometryStyle(g)}">${markup}</div>`;
  }
  function renderFullSizePiece(piece,legacy,outfit){
    const p=normalizeBoardItem({...piece});
    if(p?.kind==='text')return renderText(p);
    if(p?.kind==='piece')return renderPiece(p);
    if(p?.kind==='sticker')return renderSticker(p);
    if(['shape','drawing','doodle'].includes(p?.kind))return renderBoardDecoration(p);
    return legacy(piece,outfit);
  }

  function sizeMiniPlane(mini,outfit){
    if(!mini||!outfit)return;
    const plane=mini.querySelector(':scope > .portfolio-mini-board-v132362');if(!plane)return;
    const sw=Math.max(1,num(outfit.boardWidth,390)),sh=Math.max(1,num(outfit.boardHeight,420)),cw=mini.clientWidth,ch=mini.clientHeight;
    if(!cw||!ch)return;
    const scale=Math.min(cw/sw,ch/sh),scaledW=sw*scale,scaledH=sh*scale,left=(cw-scaledW)/2,top=(ch-scaledH)/2;
    plane.dataset.miniScale=String(scale);
    Object.assign(plane.style,{width:sw+'px',height:sh+'px',left:left+'px',top:top+'px',transform:`scale(${scale})`});
  }
  function installMiniPlanes(){
    const root=document.getElementById('savedOutfits');if(!root)return;
    root.querySelectorAll('.portfolio-card[data-id]').forEach(card=>{
      const outfit=state.outfits.find(o=>String(o.id)===String(card.dataset.id)),mini=card.querySelector('.outfit-mini');if(!outfit||!mini)return;
      let plane=mini.querySelector(':scope > .portfolio-mini-board-v132362');
      if(!plane){
        plane=document.createElement('div');plane.className='portfolio-mini-board-v132362';
        while(mini.firstChild)plane.appendChild(mini.firstChild);
        mini.appendChild(plane);
      }
      plane.dataset.outfitId=outfit.id;
      sizeMiniPlane(mini,outfit);
      mini.classList.add('portfolio-mini-ready-v132362');
      miniObserver?.observe(mini);
    });
  }
  function wrapPortfolioRefresh(){
    if(window.__audreyPortfolioMiniRefreshWrappedV132362||typeof renderSavedOutfits!=='function')return;
    const previous=renderSavedOutfits;
    renderSavedOutfits=function(){const result=previous.apply(this,arguments);installMiniPlanes();return result;};
    window.__audreyPortfolioMiniRefreshWrappedV132362=true;
  }
  function installStyles(){
    if(document.getElementById('portfolioMiniFidelityV132362Styles'))return;
    const style=document.createElement('style');style.id='portfolioMiniFidelityV132362Styles';style.textContent=`
      .outfit-mini{position:relative!important;overflow:hidden!important}
      .portfolio-mini-board-v132362{position:absolute!important;transform-origin:top left!important;overflow:visible!important;-webkit-text-size-adjust:none!important;text-size-adjust:none!important}
      .portfolio-mini-board-v132362,.portfolio-mini-board-v132362 *{-webkit-text-size-adjust:none!important;text-size-adjust:none!important}
      .portfolio-mini-object-v132362{position:absolute!important;transform-origin:center center!important;box-sizing:border-box!important}
      .portfolio-mini-text-v132362{display:block!important;overflow:visible!important}
      .portfolio-mini-text-v132362>.board-text{width:100%!important;height:100%!important;box-sizing:border-box!important}
      .portfolio-mini-piece-v132362{object-fit:contain!important;max-width:none!important;max-height:none!important}
      .portfolio-mini-sticker-v132362,.portfolio-mini-decoration-v132362{display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important}
      .portfolio-mini-sticker-v132362>*{width:100%;height:100%}
    `;document.head.appendChild(style);
  }
  function install(){
    if(installed||typeof renderMiniPiece!=='function')return false;
    const legacy=renderMiniPiece;
    renderMiniPiece=function(piece,outfit){return renderFullSizePiece(piece,legacy,outfit);};
    installStyles();wrapPortfolioRefresh();
    if('ResizeObserver' in window)miniObserver=new ResizeObserver(entries=>entries.forEach(entry=>{const mini=entry.target,card=mini.closest('.portfolio-card[data-id]'),outfit=card&&state.outfits.find(o=>String(o.id)===String(card.dataset.id));if(outfit)sizeMiniPlane(mini,outfit)}));
    installed=true;
    window.AUDREY_PORTFOLIO_MINI_FIDELITY_V132362={version:VERSION,pxGeometry,geometryStyle,renderFullSizePiece,sizeMiniPlane,installMiniPlanes};
    try{if(typeof renderSavedOutfits==='function')renderSavedOutfits();else installMiniPlanes();}catch(e){console.warn('Portfolio scaled Board v13.23.6.2 refresh skipped',e)}
    return true;
  }
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if((window.AUDREY_BOARD_TEXT_LAYOUT_V13235&&window.AUDREY_STICKER_RENDER_COMPAT_V13231&&install())||tries>80)clearInterval(timer)},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
