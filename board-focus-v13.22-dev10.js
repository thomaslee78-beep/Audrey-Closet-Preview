/* Audrey Closet v13.22 Board Focus Mode dev10
 * Consolidated Focus polish (replaces dev9 behavior in Preview):
 * - no automatic Text reveal on Decorate/Text clicks
 * - entering Decorate or switching Decorate sub-tools starts at top
 * - only focusing actual Text input may reposition for keyboard
 * - preserve accepted Draw inset-swatch color picker
 * - preserve accepted Canvas spacing
 * - keep thin 2px divider below main workspace tabs
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev10Styles';
  let revealTimer=0;

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains('board-focus-active-dev1');}
  function decoratePanel(){return document.querySelector('.board-workspace-panel[data-board-panel="decorate"]');}
  function textPanel(){return document.querySelector('.decorate-studio-panel[data-decorate-group="text"]');}
  function textActive(){return focused()&&decoratePanel()?.classList.contains('active')&&textPanel()?.classList.contains('active');}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .screen[data-screen="outfits"]{
        --decorate-color-control-w:38px;
        --decorate-color-control-h:34px;
        --decorate-color-control-radius:9px;
        --decorate-color-swatch-inset:4px;
        --decorate-color-control-bg:rgba(255,255,255,.70);
        --decorate-color-control-border:rgba(102,113,90,.22);
      }

      /* Accepted Draw color-picker appearance from dev9. */
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap{
        position:relative!important;
        width:var(--decorate-color-control-w)!important;
        min-width:var(--decorate-color-control-w)!important;
        height:var(--decorate-color-control-h)!important;
        min-height:var(--decorate-color-control-h)!important;
        border:1px solid var(--decorate-color-control-border)!important;
        border-radius:var(--decorate-color-control-radius)!important;
        background:var(--decorate-color-control-bg)!important;
        box-shadow:none!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap::after{
        content:"";
        position:absolute;
        inset:var(--decorate-color-swatch-inset)!important;
        border-radius:6px!important;
        background:var(--draw-color,#6b6b6b)!important;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.10)!important;
        pointer-events:none!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap input[type="color"]{
        position:absolute!important;
        inset:0!important;
        z-index:2!important;
        width:100%!important;
        height:100%!important;
        opacity:0!important;
        cursor:pointer!important;
      }

      /* Accepted Canvas spacing from dev9. */
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        margin-bottom:2px!important;
        padding-bottom:1px!important;
      }
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        row-gap:4px!important;
        gap:4px!important;
      }
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="canvas"] .canvas-category-row + *{
        margin-top:0!important;
      }

      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-tabs{
        position:relative!important;
        z-index:70!important;
        margin-bottom:0!important;
        padding-bottom:2px!important;
        background:#e6dcc9!important;
        box-shadow:0 2px 0 #e6dcc9, 0 3px 5px rgba(82,62,51,.06)!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-panel.active{
        scroll-padding-top:4px!important;
        scroll-padding-bottom:18px!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 .decorate-studio-panel[data-decorate-group="text"].active{
        padding-bottom:16px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function actualTextInputFocused(){
    const el=document.activeElement;
    if(!el||!(el instanceof Element))return false;
    return el.id==='boardTextInput'||!!el.closest('.decorate-studio-panel[data-decorate-group="text"] textarea, .decorate-studio-panel[data-decorate-group="text"] input[type="text"]');
  }

  function revealTextEditor(){
    clearTimeout(revealTimer);
    revealTimer=setTimeout(()=>{
      if(!textActive()||!actualTextInputFocused())return;
      const panel=decoratePanel();
      const input=document.getElementById('boardTextInput');
      if(!panel||!input)return;

      const pr=panel.getBoundingClientRect();
      const ir=input.getBoundingClientRect();
      const vv=window.visualViewport;
      const visibleBottom=vv?Math.min(window.innerHeight,vv.offsetTop+vv.height):window.innerHeight;
      const safeTop=pr.top+8;
      const safeBottom=Math.min(pr.bottom,visibleBottom)-12;

      let delta=0;
      if(ir.bottom>safeBottom)delta=ir.bottom-safeBottom;
      else if(ir.top<safeTop)delta=ir.top-safeTop;
      if(Math.abs(delta)>1)panel.scrollTop+=delta;
    },90);
  }

  function resetDecorateTopAfterClick(e){
    if(!focused()||actualTextInputFocused())return;
    const t=e.target;
    if(!(t instanceof Element))return;
    const nav=t.closest('.board-workspace-tab[data-board-panel="decorate"], .decorate-studio-tab[data-decorate-group]');
    if(!nav)return;

    /* Run once after all synchronous tab handlers, before the next paint. */
    queueMicrotask(()=>{
      if(!focused()||actualTextInputFocused())return;
      const panel=decoratePanel();
      if(panel)panel.scrollTop=0;
    });
  }

  function start(){
    installStyles();

    document.addEventListener('click',resetDecorateTopAfterClick,true);

    document.addEventListener('focusin',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.id==='boardTextInput'||t.matches('.decorate-studio-panel[data-decorate-group="text"] textarea, .decorate-studio-panel[data-decorate-group="text"] input[type="text"]')){
        revealTextEditor();
        setTimeout(revealTextEditor,220);
      }
    },true);

    window.visualViewport?.addEventListener('resize',()=>{if(textActive()&&actualTextInputFocused())revealTextEditor();});
    window.visualViewport?.addEventListener('scroll',()=>{if(textActive()&&actualTextInputFocused())revealTextEditor();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
