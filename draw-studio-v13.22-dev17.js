/* Audrey Closet v13.22 Draw Studio dev17
 * Release polish over dev10-dev16.
 * - Pencil and Pen get visibly different placed-stroke treatments.
 * - Undo moves beside the color picker and is larger/more prominent.
 * - Solid/Dotted move to the next row with icon + text labels.
 */
(function(){
  'use strict';
  const ROOT_ID='drawStudioDev10';
  let rendererWrapped=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}

  function drawingMarkup(b){
    const w=Math.max(1,Number(b.w)||1),h=Math.max(1,Number(b.h)||1);
    const color=esc(b.strokeColor||'#6b6b6b'),sw=Math.max(1,Number(b.strokeWidth)||2);
    const opacity=Math.max(0,Math.min(1,Number(b.opacity??1)));
    const pts=esc(b.points||'');
    const dotted=b.strokeStyle==='dotted';
    const dash=dotted?` stroke-dasharray="${Math.max(1,sw*.6)} ${Math.max(2,sw*2.2)}"`:'';
    const tool=String(b.tool||'pencil');

    if(tool==='pencil'){
      // Clean, dry graphite look: thin square-ish core plus two faint irregular
      // graphite passes. Ends stay comparatively crisp rather than rounded/inky.
      return `<svg class="drawing-svg-dev10 drawing-texture-pencil-dev17" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.7,sw*.72)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.82,opacity*.82)}" vector-effect="non-scaling-stroke"/>
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.55,sw*.38)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.24,opacity*.24)}" transform="translate(.55 -.35)" vector-effect="non-scaling-stroke"/>
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.5,sw*.3)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.18,opacity*.18)}" transform="translate(-.45 .45)" vector-effect="non-scaling-stroke"/>
      </svg>`;
    }

    if(tool==='pen'){
      // Smooth ink with slightly heavier rounded terminals to suggest ink pooling.
      const pairs=String(b.points||'').trim().split(/\s+/);
      const first=pairs[0]?.split(',').map(Number),last=pairs[pairs.length-1]?.split(',').map(Number);
      const terminals=(first?.length===2&&last?.length===2&&first.every(Number.isFinite)&&last.every(Number.isFinite))
        ? `<circle cx="${first[0]}" cy="${first[1]}" r="${Math.max(.9,sw*.56)}" fill="${color}" opacity="${Math.min(1,opacity*.94)}"/><circle cx="${last[0]}" cy="${last[1]}" r="${Math.max(.95,sw*.6)}" fill="${color}" opacity="${Math.min(1,opacity*.96)}"/>`
        : '';
      return `<svg class="drawing-svg-dev10 drawing-texture-pen-dev17" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash} opacity="${opacity}" vector-effect="non-scaling-stroke"/>${terminals}</svg>`;
    }
    return null;
  }

  function wrapRenderer(){
    if(rendererWrapped||typeof boardItemContent!=='function')return false;
    const previous=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='drawing'&&b.drawingType==='freeform'&&(b.tool==='pencil'||b.tool==='pen')){
        const markup=drawingMarkup(b);if(markup)return markup;
      }
      return previous.apply(this,arguments);
    };
    rendererWrapped=true;
    if(typeof drawBoard==='function')drawBoard();
    return true;
  }

  function polishControls(){
    const root=document.getElementById(ROOT_ID);if(!root)return false;
    const controls=root.querySelector('.draw-control-row');
    const secondary=root.querySelector('.draw-secondary-row');
    const color=root.querySelector('.draw-color-wrap');
    const segment=root.querySelector('.draw-segment');
    const undo=root.querySelector('.draw-undo-btn');
    if(!controls||!secondary||!color||!segment||!undo)return false;

    if(!root.dataset.dev17Layout){
      // Primary: Size | Color | Undo
      controls.appendChild(undo);
      // Secondary: labeled Solid/Dotted controls first, then status/hints.
      secondary.insertBefore(segment,secondary.firstChild);
      root.dataset.dev17Layout='1';
    }

    const solid=segment.querySelector('[data-line-style="solid"]');
    const dotted=segment.querySelector('[data-line-style="dotted"]');
    if(solid)solid.innerHTML='<span class="draw-style-icon" aria-hidden="true">━</span><span>Solid</span>';
    if(dotted)dotted.innerHTML='<span class="draw-style-icon" aria-hidden="true">┄</span><span>Dotted</span>';
    return true;
  }

  function installStyles(){
    if(document.getElementById('drawStudioDev17Styles'))return;
    const s=document.createElement('style');s.id='drawStudioDev17Styles';s.textContent=`
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row{grid-template-columns:minmax(116px,1fr) 42px minmax(82px,auto)!important}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row .draw-undo-btn{height:36px!important;min-width:82px!important;padding:0 10px!important;background:#fffaf0!important;border-color:rgba(102,113,90,.34)!important;color:#4f5949!important;font-size:9px!important;box-shadow:0 1px 3px rgba(63,73,55,.10)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row .draw-undo-btn:not(:disabled){background:#eef0e8!important;border-color:#66715a!important;box-shadow:0 2px 5px rgba(63,73,55,.14)}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;gap:7px!important;align-items:center!important}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row .draw-segment{justify-content:flex-start!important;gap:5px!important}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row .draw-seg-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:5px;height:34px!important;min-width:78px;padding:0 9px!important;font-size:9px!important}
      .screen[data-screen="outfits"] #${ROOT_ID} .draw-style-icon{font-size:15px;line-height:1;font-weight:800;letter-spacing:-1px}
      .screen[data-screen="outfits"] #${ROOT_ID}.eraser-selected .draw-secondary-row .draw-segment{opacity:.35;pointer-events:none}
      @media(max-width:430px){
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row{grid-template-columns:minmax(104px,1fr) 38px minmax(72px,auto)!important}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-control-row .draw-undo-btn{min-width:72px!important;padding:0 7px!important}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row{grid-template-columns:1fr!important}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row .draw-segment{order:0}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row .draw-status-wrap{order:1}
        .screen[data-screen="outfits"] #${ROOT_ID} .draw-secondary-row .draw-arrow-settings{order:2}
      }
    `;document.head.appendChild(s);
  }

  function reconcile(){installStyles();wrapRenderer();polishControls();}
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reconcile));setTimeout(reconcile,120);}
  function start(){reconcile();document.addEventListener('click',e=>{const t=e.target;if(t instanceof Element&&t.closest('.decorate-studio-tab[data-decorate-group="draw"],.board-workspace-tab[data-board-panel="decorate"],#decorateToggle'))schedule();},false);window.addEventListener('pageshow',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
