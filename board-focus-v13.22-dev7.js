/* Audrey Closet v13.22 Board Focus Mode dev7
 * Clean consolidation layer intended to run with Focus dev1 + dev2 only.
 * Goals:
 * - immediate compose row placement on first focus entry
 * - one scroller per main workspace panel
 * - Decorate/Canvas nested rows stay in normal flow
 * - Canvas color picker sits beside Fun and auto-applies
 * - no synthetic pageshow events, no touchmove interception, no rebind bursts
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev7Styles';
  const FOCUS_CLASS='board-focus-active-dev1';
  const BUTTON_ID='boardFocusToggleDev1';

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}
  function shell(){return screen()?.querySelector('.board-shell')||null;}
  function compose(){return screen()?.querySelector('.board-compose-bar')||null;}
  function workspace(){return document.getElementById('boardWorkspace');}
  function canvasPanel(){return workspace()?.querySelector('.board-workspace-panel[data-board-panel="canvas"]')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Keep dev2's main panel as the only vertical scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel.active{
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:none!important;
        min-height:0!important;
        touch-action:pan-y!important;
      }

      /* Nested Decorate tabs are ordinary content inside the same scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .board-decorate-shell,
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panels,
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-panel.active{
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="decorate"] .decorate-studio-tabs{
        position:static!important;
        top:auto!important;
        bottom:auto!important;
        inset:auto!important;
        z-index:auto!important;
        margin:0 0 5px!important;
      }

      /* Canvas type row is ordinary content inside the same scroller. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="canvas"] .board-canvas-shell{
        min-height:auto!important;
        height:auto!important;
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS} #boardWorkspace>.board-workspace-panel[data-board-panel="canvas"] .canvas-category-row{
        position:static!important;
        top:auto!important;
        bottom:auto!important;
        inset:auto!important;
        z-index:auto!important;
        margin:0 0 6px!important;
      }

      /* Compact inline Canvas custom-color picker in both focus and normal modes. */
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev7{
        flex:0 0 34px!important;
        width:34px!important;
        min-width:34px!important;
        height:30px!important;
        min-height:30px!important;
        padding:2px!important;
        border:1px solid rgba(108,81,66,.18)!important;
        border-radius:9px!important;
        background:#f8f0df!important;
        box-sizing:border-box!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev7::-webkit-color-swatch-wrapper{padding:0!important}
      .screen[data-screen="outfits"] .canvas-category-row .canvas-inline-color-dev7::-webkit-color-swatch{border:0!important;border-radius:6px!important}
      .screen[data-screen="outfits"] .canvas-custom-color-label-dev7,
      .screen[data-screen="outfits"] .canvas-use-color-btn-dev7{display:none!important}

      /* Drawing gesture ownership must remain with the Board while armed. */
      .screen[data-screen="outfits"].${FOCUS_CLASS} #outfitBoard.draw-dev10-active{touch-action:none!important}
    `;
    document.head.appendChild(style);
  }

  function placeCompose(){
    if(!focused())return;
    const sc=screen(),c=compose(),sh=shell();
    if(sc&&c&&sh&&(c.parentElement!==sc||c.nextElementSibling!==sh))sc.insertBefore(c,sh);
  }

  function findUseColorButton(panel){
    if(!panel)return null;
    return [...panel.querySelectorAll('button')].find(btn=>/use\s*color/i.test(String(btn.textContent||'').trim()))||null;
  }

  function installCanvasColor(){
    const panel=canvasPanel();
    const categories=panel?.querySelector('.canvas-category-row');
    const input=panel?.querySelector('input[type="color"]');
    if(!panel||!categories||!input)return;

    const funBtn=[...categories.querySelectorAll('button')].find(btn=>/^fun$/i.test(String(btn.textContent||'').trim()))||categories.lastElementChild;
    if(funBtn&&input.parentElement!==categories)funBtn.insertAdjacentElement('afterend',input);
    else if(funBtn&&funBtn.nextElementSibling!==input)funBtn.insertAdjacentElement('afterend',input);

    input.classList.add('canvas-inline-color-dev7');
    input.setAttribute('aria-label','Custom canvas color');
    input.title='Custom canvas color';

    const useBtn=findUseColorButton(panel);
    if(useBtn){useBtn.classList.add('canvas-use-color-btn-dev7');useBtn.setAttribute('aria-hidden','true');}
    [...panel.querySelectorAll('label,.canvas-control-label,.canvas-label,span,strong,p')].forEach(el=>{
      if(/custom\s*color/i.test(String(el.textContent||'').replace(/\s+/g,' ').trim())){
        if(el!==input){el.classList.add('canvas-custom-color-label-dev7');el.setAttribute('aria-hidden','true');}
      }
    });

    if(!input.dataset.canvasAutoApplyDev7){
      input.dataset.canvasAutoApplyDev7='1';
      const apply=()=>{const btn=findUseColorButton(canvasPanel());if(btn)btn.click();};
      input.addEventListener('change',apply);
    }
  }

  function reconcile(){
    installStyles();
    placeCompose();
    installCanvasColor();
  }

  function schedule(){
    requestAnimationFrame(reconcile);
    setTimeout(reconcile,40);
  }

  function start(){
    installStyles();
    reconcile();
    [100,300,700].forEach(ms=>setTimeout(reconcile,ms));

    /* Capture the focus-button click before dev1 stops propagation; only reposition compose. */
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('#'+BUTTON_ID))setTimeout(schedule,0);
      else if(t.closest('.board-workspace-tab,.decorate-studio-tab,.canvas-category-chip'))schedule();
    },true);

    window.addEventListener('pageshow',()=>setTimeout(reconcile,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
