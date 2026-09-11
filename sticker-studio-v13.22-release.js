/* Audrey Closet v13.22 Sticker Studio — consolidated release runtime
 * One registry, one browser renderer, one pack switch path, one Board renderer.
 */
(function(){
  'use strict';

  const ROOT_ID='stickerStudioV1322Release';
  const STYLE_ID='stickerStudioV1322ReleaseStyles';
  const REGISTRY_VERSION=3;
  const SMALL_BOARD_SIZE=84;
  const MEDIUM_BOARD_SIZE=118;
  const ANIMAL_BOARD_SIZE=132;

  const PACKS=[
    {id:'standard',label:'Standard',icon:'✦',description:'Everyday symbols and little accents.',stickers:[
      {id:'heart',label:'Heart',glyph:'♥',sizeClass:'small',type:'image',src:'assets/stickers/standard/heart-pop.svg',alt:'Pink heart sticker'},
      {id:'diamond',label:'Diamond',glyph:'◆',sizeClass:'small',type:'image',src:'assets/stickers/standard/diamond-blue.svg',alt:'Blue diamond sticker'},
      {id:'star',label:'Star',glyph:'★',sizeClass:'small',type:'image',src:'assets/stickers/standard/star-burst.svg',alt:'Golden star sticker'},
      {id:'happy',label:'Happy face',glyph:'☺',sizeClass:'small',type:'image',src:'assets/stickers/standard/happy-day.svg',alt:'Happy face sticker'},
      {id:'sparkle',label:'Sparkle',glyph:'✨',sizeClass:'small',type:'image',src:'assets/stickers/standard/sparkle-burst.svg',alt:'Sparkle burst sticker'},
      {id:'lightning',label:'Lightning',glyph:'⚡',sizeClass:'small',type:'image',src:'assets/stickers/standard/lightning-triple.svg',alt:'Lightning sticker'},
      {id:'flower',label:'Flower',glyph:'🌼',sizeClass:'small',type:'image',src:'assets/stickers/standard/flower-detailed.svg',alt:'Flower sticker'},
      {id:'rainbow',label:'Rainbow',glyph:'🌈',sizeClass:'small',type:'image',src:'assets/stickers/standard/rainbow-soft.svg',alt:'Rainbow sticker'},
      {id:'cloud',label:'Cloud',glyph:'☁️',sizeClass:'small',type:'image',src:'assets/stickers/standard/cloud-puffy.svg',alt:'Cloud sticker'},
      {id:'sun',label:'Sun',glyph:'☀️',sizeClass:'small',type:'image',src:'assets/stickers/standard/sun-happy.svg',alt:'Sun sticker'},
      {id:'moon',label:'Moon',glyph:'🌙',sizeClass:'small',type:'image',src:'assets/stickers/standard/moon-crescent.svg',alt:'Moon sticker'},
      {id:'butterfly',label:'Butterfly',glyph:'🦋',sizeClass:'small',type:'image',src:'assets/stickers/standard/butterfly-cartoon.svg',alt:'Butterfly sticker'}
    ]},
    {id:'music',label:'Music',icon:'♫',description:'Notes, instruments and studio energy.',stickers:[
      {id:'treble-clef',label:'Treble clef',glyph:'𝄞',sizeClass:'small'},
      {id:'bass-clef',label:'Bass clef',glyph:'𝄢',sizeClass:'small'},
      {id:'guitar',label:'Guitar',glyph:'🎸',sizeClass:'small'},
      {id:'piano',label:'Piano',glyph:'🎹',sizeClass:'small'},
      {id:'drums',label:'Drums',glyph:'🥁',sizeClass:'small'},
      {id:'microphone',label:'Microphone',glyph:'🎤',sizeClass:'small'},
      {id:'notes',label:'Eighth Note',glyph:'🎵',sizeClass:'small'},
      {id:'double-notes',label:'Music Notes',glyph:'🎶',sizeClass:'small'},
      {id:'headphones',label:'Headphones',glyph:'🎧',sizeClass:'small',type:'image',src:'assets/stickers/music/headphones.svg',alt:'Headphones sticker'},
      {id:'record',label:'Record',glyph:'💿',sizeClass:'small',type:'image',src:'assets/stickers/music/record.svg',alt:'Vinyl record sticker'},
      {id:'amp',label:'Guitar amp',glyph:'▣',sizeClass:'medium',type:'image',src:'assets/stickers/music/amp-stack.svg',alt:'Rock guitar amp stack sticker'},
      {id:'sheet',label:'Sheet music',glyph:'▤',sizeClass:'medium',type:'image',src:'assets/stickers/music/sheet-music.svg',alt:'Sheet music sticker'}
    ]},
    {id:'cute-animals',label:'Cute Animals',icon:'🐾',description:'Friendly little creatures for playful looks.',stickers:[
      {id:'dog',label:'Dog',glyph:'🐶',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'cat',label:'Cat',glyph:'🐱',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'lion',label:'Lion',glyph:'🦁',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'tiger',label:'Tiger',glyph:'🐯',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},
      {id:'fish',label:'Fish',glyph:'🐠',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'frog',label:'Frog',glyph:'🐸',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'mouse',label:'Mouse',glyph:'🐭',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'bunny',label:'Bunny',glyph:'🐰',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},
      {id:'bear',label:'Bear',glyph:'🐻',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'panda',label:'Panda',glyph:'🐼',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'fox',label:'Fox',glyph:'🦊',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE},{id:'penguin',label:'Penguin',glyph:'🐧',sizeClass:'medium',boardSize:ANIMAL_BOARD_SIZE}
    ]},
    {id:'fashion',label:'Fashion',icon:'✂',description:'Closet, sewing and accessory details.',stickers:[
      {id:'button',label:'Button',glyph:'◉',sizeClass:'small',type:'image',src:'assets/stickers/fashion/button-sewing.svg',alt:'Four-hole sewing button sticker'},
      {id:'pin',label:'Pin',glyph:'📌',sizeClass:'small'},
      {id:'swatch',label:'Fabric swatch',glyph:'▧',sizeClass:'small',type:'image',src:'assets/stickers/fashion/fabric-swatch-floral.svg',alt:'Floral fabric swatch sticker'},
      {id:'watch',label:'Watch',glyph:'⌚',sizeClass:'small'},
      {id:'necklace',label:'Necklace',glyph:'💎',sizeClass:'small',type:'image',src:'assets/stickers/fashion/necklace-pendant.svg',alt:'Gold pendant necklace sticker'},
      {id:'sunglasses',label:'Sunglasses',glyph:'🕶️',sizeClass:'small'},{id:'bag',label:'Handbag',glyph:'👜',sizeClass:'small'},{id:'thread',label:'Thread',glyph:'🧵',sizeClass:'small'},
      {id:'needle',label:'Needle',glyph:'🪡',sizeClass:'small'},{id:'bow',label:'Bow',glyph:'🎀',sizeClass:'small'},{id:'shoe',label:'Shoe',glyph:'👠',sizeClass:'small'},
      {id:'hanger',label:'Hanger',glyph:'♧',sizeClass:'small',type:'image',src:'assets/stickers/fashion/hanger-wood.svg',alt:'Wood coat hanger sticker'}
    ]}
  ];

  window.AUDREY_STICKER_PACKS_V1={version:REGISTRY_VERSION,packs:PACKS};

  let activePackId='standard';
  let outlineEnabled=false;
  let rendererWrapped=false;
  let renderToken=0;
  const preloaded=new Map();

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function packById(id){return PACKS.find(p=>p.id===id)||PACKS[0];}
  function stickerByIdentity(packId,stickerId){return packById(packId)?.stickers?.find(s=>s.id===stickerId)||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"]>.decorate-studio-content{margin-top:0!important;padding-top:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="stickers"] .decorate-tool-card:not(#${ROOT_ID}){display:none!important}
      .screen[data-screen="outfits"] #${ROOT_ID}{display:grid;gap:8px;margin:0 0 6px;padding:7px 8px 10px;border:1px solid rgba(126,105,82,.20);border-radius:10px;background:linear-gradient(145deg,rgba(250,246,237,.98),rgba(242,235,223,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 2px 6px rgba(82,62,51,.055)}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-strip{display:flex;gap:6px;overflow-x:auto;padding:1px 1px 3px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-strip::-webkit-scrollbar{display:none}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn{flex:0 0 auto;min-height:36px;padding:5px 9px;border:1px solid rgba(108,81,66,.16);border-radius:10px;background:rgba(255,250,240,.84);color:var(--ink);display:flex;align-items:center;gap:6px;font:700 10px/1.1 var(--sans);-webkit-tap-highlight-color:transparent}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn .pack-icon{font-size:15px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-btn.active{background:var(--olive);border-color:var(--olive-dark);color:#fff}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-outline-row{display:flex;align-items:center;justify-content:flex-end;gap:6px;min-height:28px;padding:0 2px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-outline-label{font:800 9px/1 var(--sans);color:var(--ink)}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-outline-segment{display:inline-flex;padding:1px;border:1px solid rgba(126,105,82,.16);border-radius:8px;background:rgba(255,255,255,.58)}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-outline-btn{min-width:42px;height:23px;padding:0 7px;border:0;border-radius:7px;background:transparent;color:#74695d;font:800 8px/1 var(--sans)}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-outline-btn.active{background:var(--olive);color:#fff}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:1px 3px 0}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy{display:grid;gap:1px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy strong{font-family:var(--serif);font-size:15px;line-height:1.1;color:var(--ink)}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-copy small{font-size:9px;color:#817568}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-pack-count{font-size:9px;font-weight:800;color:#7c746b}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-browser{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-flow:dense;grid-auto-rows:68px;gap:7px;align-items:stretch;padding:8px;border:1px solid rgba(126,105,82,.16);border-radius:14px;background:linear-gradient(180deg,rgba(255,253,248,.95),rgba(248,242,232,.92));transition:none}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-browser.pack-loading{visibility:hidden}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile{position:relative;min-height:0;height:auto;padding:5px 3px 4px;border:1px solid rgba(126,105,82,.13);border-radius:13px;background:rgba(255,255,255,.48);display:grid;place-items:center;grid-template-rows:1fr auto;gap:3px;color:var(--ink);box-shadow:none;-webkit-tap-highlight-color:transparent}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="medium"]{grid-column:span 2;grid-row:span 2;min-height:143px;padding:9px 7px 7px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-preview{display:grid;place-items:center;width:42px;height:38px;font-size:26px;line-height:1}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="medium"] .sticker-preview{width:86px;height:92px;font-size:54px}.screen[data-screen="outfits"] #${ROOT_ID}[data-rendered-pack="cute-animals"] .sticker-tile[data-size-class="medium"] .sticker-preview{width:98px;height:104px;font-size:66px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-preview img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#756c62;font-weight:700}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="medium"] small{font-size:9px}
      .screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile.added::after{content:'✓';position:absolute;right:5px;top:5px;width:17px;height:17px;border-radius:999px;background:var(--olive);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:900}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-footnote{padding:0 2px;font-size:8px;line-height:1.3;color:#91877a;opacity:.72}
      #outfitBoard .board-sticker-release{width:100%;height:100%;display:grid;place-items:center;line-height:1;box-sizing:border-box}.screen[data-screen="outfits"] #outfitBoard .board-sticker-release img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none}.screen[data-screen="outfits"] #outfitBoard .board-sticker-release.sticker-outline img{filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(1.5px 1.5px 0 #fff) drop-shadow(-1.5px -1.5px 0 #fff) drop-shadow(-1.5px 1.5px 0 #fff) drop-shadow(1.5px -1.5px 0 #fff)}.screen[data-screen="outfits"] #outfitBoard .board-sticker-release.sticker-glyph.sticker-outline{text-shadow:-2px 0 #fff,2px 0 #fff,0 -2px #fff,0 2px #fff,-1.5px -1.5px #fff,1.5px 1.5px #fff}
      @media(max-width:370px){.screen[data-screen="outfits"] #${ROOT_ID} .sticker-browser{grid-auto-rows:62px;gap:6px}.screen[data-screen="outfits"] #${ROOT_ID} .sticker-tile[data-size-class="medium"]{min-height:130px}}
    `;document.head.appendChild(s);
  }

  function preload(src){
    if(!src)return Promise.resolve();
    if(preloaded.has(src))return preloaded.get(src);
    const p=new Promise(resolve=>{const img=new Image();img.onload=()=>{img.decode?.().catch(()=>{}).finally(resolve)||resolve();};img.onerror=resolve;img.src=src;if(img.complete)resolve();});
    preloaded.set(src,p);return p;
  }
  function preloadPack(pack){return Promise.all((pack.stickers||[]).filter(s=>s.type==='image'&&s.src).map(s=>preload(s.src)));}

  function removeLegacyPlaceholder(){
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="stickers"]');
    const content=panel?.querySelector(':scope > .decorate-studio-content');if(!panel||!content)return;
    let n=content.previousElementSibling;while(n){const prev=n.previousElementSibling;n.style.display='none';n.setAttribute('aria-hidden','true');n=prev;}
  }

  function previewMarkup(s){return s.type==='image'&&s.src?`<img src="${esc(s.src)}" alt="" aria-hidden="true" decoding="async" draggable="false">`:esc(s.glyph||'✨');}

  async function renderPack(id,{force=false}={}){
    const root=document.getElementById(ROOT_ID);if(!root)return;
    const pack=packById(id);if(!force&&activePackId===pack.id&&root.dataset.renderedPack===pack.id)return;
    activePackId=pack.id;const token=++renderToken;
    root.querySelectorAll('.sticker-pack-btn').forEach(btn=>{const a=btn.dataset.pack===pack.id;btn.classList.toggle('active',a);btn.setAttribute('aria-pressed',a?'true':'false');});
    const head=root.querySelector('.sticker-pack-head'),browser=root.querySelector('.sticker-browser');
    if(head)head.innerHTML=`<div class="sticker-pack-copy"><strong>${esc(pack.label)} Pack</strong><small>${esc(pack.description)}</small></div><span class="sticker-pack-count">${pack.stickers.length} stickers</span>`;
    if(!browser)return;
    browser.classList.add('pack-loading');
    await preloadPack(pack);if(token!==renderToken)return;
    browser.innerHTML=pack.stickers.map(s=>`<button type="button" class="sticker-tile" data-sticker-id="${esc(s.id)}" data-size-class="${esc(s.sizeClass||'small')}" aria-label="Add ${esc(s.label)}"><span class="sticker-preview" aria-hidden="true">${previewMarkup(s)}</span><small>${esc(s.label)}</small></button>`).join('');
    root.dataset.renderedPack=pack.id;
    requestAnimationFrame(()=>browser.classList.remove('pack-loading'));
  }

  function selectedBoardSticker(){try{return Array.isArray(boardItems)?boardItems.find(x=>x.uid===selectedBoardUid):null}catch(_){return null}}

  function addSticker(sticker,tile){
    if(typeof addCreativeItem!=='function')return;
    addCreativeItem('sticker',sticker.glyph||'✨');
    const item=selectedBoardSticker();
    if(item){
      item.stickerVersion=REGISTRY_VERSION;item.stickerPack=activePackId;item.stickerId=sticker.id;item.stickerSizeClass=sticker.sizeClass||'small';item.stickerOutline=outlineEnabled;
      if(sticker.type==='image'&&sticker.src){item.stickerType='image';item.stickerAssetSrc=sticker.src;item.stickerAssetAlt=sticker.alt||sticker.label||'Sticker';}
      else{delete item.stickerType;delete item.stickerAssetSrc;delete item.stickerAssetAlt;}
      const target=Number(sticker.boardSize)||(sticker.sizeClass==='medium'?MEDIUM_BOARD_SIZE:SMALL_BOARD_SIZE);item.w=target;item.h=target;if(typeof drawBoard==='function')drawBoard();
    }
    tile?.classList.add('added');setTimeout(()=>tile?.classList.remove('added'),450);if(typeof toast==='function')toast(`${sticker.label} added`);
  }

  function resolveStickerForBoard(b){
    if(!b||b.kind!=='sticker')return null;
    if(b.stickerPack&&b.stickerId)return stickerByIdentity(b.stickerPack,b.stickerId);
    return null;
  }

  function wrapBoardRenderer(){
    if(rendererWrapped||typeof boardItemContent!=='function')return;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='sticker'){
        const def=resolveStickerForBoard(b);const src=b.stickerAssetSrc||(def?.type==='image'?def.src:'');const alt=b.stickerAssetAlt||def?.alt||def?.label||'Sticker';const outline=b.stickerOutline?' sticker-outline':'';
        if(src)return `<div class="board-sticker-release${outline}"><img src="${esc(src)}" alt="${esc(alt)}" draggable="false" decoding="async"></div>`;
        const glyph=esc(b.value||def?.glyph||'✨');return `<div class="board-sticker-release sticker-glyph${outline}">${glyph}</div>`;
      }
      return original(b);
    };
    rendererWrapped=true;if(typeof drawBoard==='function')drawBoard();
  }

  function sizeGlyphBoardStickers(){
    document.querySelectorAll('#outfitBoard .board-sticker-release.sticker-glyph').forEach(el=>{const box=el.parentElement;if(!box)return;const w=box.clientWidth||90,h=box.clientHeight||90;el.style.fontSize=Math.max(18,Math.min(w,h)*.72)+'px';});
  }

  function build(){
    installStyles();removeLegacyPlaceholder();wrapBoardRenderer();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="stickers"]');const content=panel?.querySelector('.decorate-studio-content')||panel;if(!content)return false;
    let root=document.getElementById(ROOT_ID);if(root)return true;
    root=document.createElement('section');root.id=ROOT_ID;root.className='decorate-tool-card';root.innerHTML=`
      <div class="sticker-pack-strip" role="group" aria-label="Sticker packs">${PACKS.map(p=>`<button type="button" class="sticker-pack-btn${p.id==='standard'?' active':''}" data-pack="${esc(p.id)}" aria-pressed="${p.id==='standard'?'true':'false'}"><span class="pack-icon" aria-hidden="true">${esc(p.icon)}</span><span>${esc(p.label)}</span></button>`).join('')}</div>
      <div class="sticker-outline-row"><span class="sticker-outline-label">Sticker outline</span><div class="sticker-outline-segment" role="group" aria-label="Sticker outline"><button type="button" class="sticker-outline-btn active" data-outline="off" aria-pressed="true">Off</button><button type="button" class="sticker-outline-btn" data-outline="white" aria-pressed="false">White</button></div></div>
      <div class="sticker-pack-head"></div><div class="sticker-browser pack-loading" aria-live="polite"></div><div class="sticker-footnote">Choose a sticker and place it on your Board.</div>`;
    content.appendChild(root);
    root.addEventListener('click',e=>{
      const target=e.target;if(!(target instanceof Element))return;
      const packBtn=target.closest('.sticker-pack-btn[data-pack]');if(packBtn){const next=packBtn.dataset.pack||'standard';if(next!==activePackId||root.dataset.renderedPack!==next)renderPack(next);return;}
      const outlineBtn=target.closest('.sticker-outline-btn[data-outline]');if(outlineBtn){outlineEnabled=outlineBtn.dataset.outline==='white';root.querySelectorAll('.sticker-outline-btn').forEach(btn=>{const a=(btn.dataset.outline==='white')===outlineEnabled;btn.classList.toggle('active',a);btn.setAttribute('aria-pressed',a?'true':'false');});return;}
      const tile=target.closest('.sticker-tile[data-sticker-id]');if(tile){const s=packById(activePackId).stickers.find(x=>x.id===tile.dataset.stickerId);if(s)addSticker(s,tile);}
    });
    renderPack('standard',{force:true});return true;
  }

  function start(){
    installStyles();preloadPack(packById('standard'));build();
    const board=document.getElementById('outfitBoard');if(board&&typeof MutationObserver!=='undefined'){new MutationObserver(()=>requestAnimationFrame(sizeGlyphBoardStickers)).observe(board,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});}
    document.addEventListener('click',e=>{const t=e.target;if(!(t instanceof Element))return;if(t.closest('.decorate-studio-tab[data-decorate-group="stickers"],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle'))requestAnimationFrame(()=>{build();sizeGlyphBoardStickers();});},false);
    window.addEventListener('pageshow',()=>{build();sizeGlyphBoardStickers();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
