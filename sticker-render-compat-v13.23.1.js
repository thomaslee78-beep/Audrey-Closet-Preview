/* Audrey Closet v13.23.1 — Sticker render compatibility
 * Keeps Sticker Studio rendering consistent across Board, Portfolio thumbnails,
 * and full saved-look previews without changing saved data.
 */
(function(){
  'use strict';

  const STYLE_ID='stickerRenderCompatV13231Styles';
  let miniWrapped=false;
  let snapshotWrapped=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function registryPacks(){return Array.isArray(window.AUDREY_STICKER_PACKS_V1?.packs)?window.AUDREY_STICKER_PACKS_V1.packs:[];}
  function resolveSticker(piece){
    const packs=registryPacks();
    const packId=String(piece?.stickerPack||'');
    const stickerId=String(piece?.stickerId||'');
    if(stickerId){
      const exact=packs.find(p=>String(p.id)===packId)?.stickers?.find(s=>String(s.id)===stickerId);
      if(exact)return exact;
      for(const p of packs){const found=p?.stickers?.find(s=>String(s.id)===stickerId);if(found)return found;}
    }
    return null;
  }
  function stickerParts(piece){
    const def=resolveSticker(piece);
    return {
      src:piece?.stickerAssetSrc||(def?.type==='image'?def.src:'')||'',
      alt:piece?.stickerAssetAlt||def?.alt||def?.label||'Sticker',
      glyph:String(piece?.value||def?.glyph||'✨'),
      outline:!!piece?.stickerOutline
    };
  }
  function stickerMarkup(piece,extraClass=''){
    const s=stickerParts(piece);
    const cls='board-sticker-release sticker-compat-v13231'+(s.src?'':' sticker-glyph')+(s.outline?' sticker-outline':'')+(extraClass?' '+extraClass:'');
    if(s.src)return `<span class="${cls}"><img src="${esc(s.src)}" alt="${esc(s.alt)}" draggable="false" decoding="async"></span>`;
    return `<span class="${cls}">${esc(s.glyph)}</span>`;
  }

  function installStyles(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      .sticker-compat-v13231{width:100%!important;height:100%!important;display:grid!important;place-items:center!important;line-height:1!important;box-sizing:border-box!important;overflow:visible!important}
      .sticker-compat-v13231 img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;pointer-events:none!important;user-select:none!important;-webkit-user-drag:none!important}
      .sticker-compat-v13231.sticker-glyph{font-size:min(78cqw,78cqh)!important;text-align:center!important;white-space:nowrap!important}
      .sticker-compat-v13231.sticker-outline img{filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(1.5px 1.5px 0 #fff) drop-shadow(-1.5px -1.5px 0 #fff) drop-shadow(-1.5px 1.5px 0 #fff) drop-shadow(1.5px -1.5px 0 #fff)!important}
      .sticker-compat-v13231.sticker-glyph.sticker-outline{text-shadow:-2px 0 #fff,2px 0 #fff,0 -2px #fff,0 2px #fff,-1.5px -1.5px #fff,1.5px 1.5px #fff,-1.5px 1.5px #fff,1.5px -1.5px #fff!important}
      .portfolio-sticker-v13231,.snapshot-piece.kind-sticker{container-type:size!important;overflow:visible!important}
      .portfolio-sticker-v13231 .sticker-compat-v13231{position:absolute!important;inset:0!important}
      .snapshot-piece.kind-sticker>.sticker-compat-v13231{position:absolute!important;inset:0!important}
      @supports not (font-size:1cqw){
        .portfolio-sticker-v13231 .sticker-glyph{font-size:28px!important}
        .snapshot-piece.kind-sticker>.sticker-glyph{font-size:58px!important}
      }
    `;
  }

  function wrapMiniRenderer(){
    if(miniWrapped||typeof renderMiniPiece!=='function')return false;
    const original=renderMiniPiece;
    renderMiniPiece=function(piece,outfit){
      const p=normalizeBoardItem({...piece});
      if(p?.kind!=='sticker')return original.apply(this,arguments);
      const sw=Number(outfit?.boardWidth)||390,sh=Number(outfit?.boardHeight)||420;
      const left=Math.max(-10,Math.min(100,(Number(p.x)||0)/sw*100));
      const top=Math.max(-10,Math.min(100,(Number(p.y)||0)/sh*100));
      const width=Math.max(1,Math.min(100,(Number(p.w)||84)/sw*100));
      const height=Math.max(1,Math.min(100,(Number(p.h)||84)/sh*100));
      const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${Number(p.z)||1};transform:rotate(${Number(p.rotation)||0}deg)`;
      return `<span class="portfolio-deco portfolio-sticker-v13231" style="${style}">${stickerMarkup(p,'portfolio-sticker-content-v13231')}</span>`;
    };
    miniWrapped=true;
    return true;
  }

  function wrapSnapshotRenderer(){
    if(snapshotWrapped||typeof renderSnapshotPiece!=='function')return false;
    const original=renderSnapshotPiece;
    renderSnapshotPiece=function(board,piece,scaleX,scaleY,offsetX=0,offsetY=0){
      const p=normalizeBoardItem({...piece});
      if(p?.kind!=='sticker')return original.apply(this,arguments);
      const el=document.createElement('div');
      el.className='snapshot-piece kind-sticker sticker-snapshot-v13231';
      el.style.left=(offsetX+(Number(p.x)||0)*scaleX)+'px';
      el.style.top=(offsetY+(Number(p.y)||0)*scaleY)+'px';
      el.style.width=((Number(p.w)||84)*scaleX)+'px';
      el.style.height=((Number(p.h)||84)*scaleY)+'px';
      el.style.zIndex=Number(p.z)||1;
      el.style.transform=`rotate(${Number(p.rotation)||0}deg)`;
      el.innerHTML=stickerMarkup(p,'snapshot-sticker-content-v13231');
      el.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault();});
      board.appendChild(el);
      return el;
    };
    snapshotWrapped=true;
    return true;
  }

  function refreshPortfolio(){
    try{if(typeof renderSavedOutfits==='function')renderSavedOutfits();}catch(e){console.warn('Sticker Portfolio refresh skipped',e);}
  }

  function install(){
    installStyles();
    const a=wrapMiniRenderer(),b=wrapSnapshotRenderer();
    if(a||b)requestAnimationFrame(refreshPortfolio);
    window.AUDREY_STICKER_RENDER_COMPAT_V13231={resolveSticker,stickerParts,stickerMarkup};
    return miniWrapped&&snapshotWrapped;
  }

  function start(){
    if(install())return;
    let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>40)clearInterval(timer);},50);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
