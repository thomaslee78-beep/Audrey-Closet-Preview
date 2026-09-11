/* Audrey Closet v13.22 Board Focus Mode dev2
 * Refines dev1 focus layout:
 * - compose/name/save row fixed above the Board
 * - Board and workspace tabs remain fixed
 * - only the active workspace panel scrolls
 * - Add Items source/category rows scroll with its panel
 * - opaque tab/bar layers prevent content bleed-through
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev2Styles';
  const FOCUS_CLASS='board-focus-active-dev1';
  const TRAY_ID='boardFocusTrayDev1';
  const BUTTON_ID='boardFocusToggleDev1';

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function compose(){return screen()?.querySelector('.board-compose-bar')||null;}
  function shell(){return screen()?.querySelector('.board-shell')||null;}
  function tray(){return document.getElementById(TRAY_ID);}
  function workspace(){return document.getElementById('boardWorkspace');}
  function focused(){return !!screen()?.classList.contains(FOCUS_CLASS);}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Focus dev2 stack: compose -> board -> fixed tabs -> scrolling active panel. */
      .screen[data-screen="outfits"].${FOCUS_CLASS}{
        display:flex!important;
        flex-direction:column!important;
      }

      .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-compose-bar{
        order:0!important;
        flex:0 0 auto!important;
        width:100%!important;
        margin:0!important;
        padding:5px 6px!important;
        box-sizing:border-box!important;
        background:#f1e7d5!important;
        border-bottom:1px solid rgba(108,81,66,.12)!important;
        z-index:40!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-compose-bar .board-compose-name{
        min-height:38px!important;
        height:38px!important;
        padding:7px 10px!important;
        border-radius:10px!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-compose-bar .board-notes-btn{
        width:38px!important;height:38px!important;border-radius:10px!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-compose-bar .board-compose-save{
        min-height:38px!important;height:38px!important;padding:7px 11px!important;border-radius:10px!important;
      }

      .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-shell{order:1!important;flex:0 0 auto!important;z-index:30!important}

      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID}{
        order:2!important;
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        overflow:hidden!important;
        padding:0!important;
        background:#f1e7d5!important;
        border-top:1px solid rgba(108,81,66,.12)!important;
      }

      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID}>.board-workspace{
        display:flex!important;
        flex-direction:column!important;
        flex:1 1 auto!important;
        min-height:0!important;
        width:100%!important;
        margin:0!important;
        overflow:hidden!important;
        background:#f1e7d5!important;
      }

      /* Fixed, opaque workspace tab layer. */
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-tabs{
        position:relative!important;
        top:auto!important;
        flex:0 0 auto!important;
        z-index:60!important;
        margin:0!important;
        padding:5px 5px 0!important;
        background:#e6dcc9!important;
        isolation:isolate!important;
        overflow:hidden!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-tabs::before{
        content:"";
        position:absolute;
        inset:0;
        z-index:-1;
        background:#e6dcc9;
        pointer-events:none;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-tab{
        position:relative!important;
        z-index:2!important;
      }

      /* Only the selected panel is the scroll viewport. */
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel{
        display:none!important;
        flex:1 1 auto!important;
        min-height:0!important;
        margin:0!important;
        overflow:hidden!important;
        background:#f1e7d5!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel.active{
        display:block!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior:contain!important;
        padding:7px 5px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
        background:#f1e7d5!important;
      }

      /* Add Items: source toggle + categories intentionally live inside the scrolling panel. */
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel[data-board-panel="pick"] .board-picker-card,
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel[data-board-panel="pick"] .board-picker-bottom{
        overflow:visible!important;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel[data-board-panel="pick"] .picker-head,
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel[data-board-panel="pick"] .tabs-small,
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel[data-board-panel="pick"] .outfit-category-filter{
        position:relative!important;
        top:auto!important;
        z-index:auto!important;
      }

      /* Prevent any horizontally scrolling content from painting into tab gaps. */
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel.active::before{
        content:"";
        display:block;
        position:sticky;
        top:0;
        z-index:20;
        height:0;
        background:#f1e7d5;
        pointer-events:none;
      }
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .canvas-category-row,
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .piece-grid,
      .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .outfit-category-filter{
        position:relative!important;
        z-index:1!important;
      }

      @media(max-width:430px){
        .screen[data-screen="outfits"].${FOCUS_CLASS}>.board-compose-bar{padding:4px 5px!important}
        .screen[data-screen="outfits"].${FOCUS_CLASS}>#${TRAY_ID} .board-workspace-panel.active{padding-left:4px!important;padding-right:4px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function moveComposeAboveBoard(){
    if(!focused())return;
    const sc=screen(),c=compose(),sh=shell();
    if(!sc||!c||!sh)return;
    if(c.parentElement!==sc||c.nextElementSibling!==sh){
      sc.insertBefore(c,sh);
    }
  }

  function normalizeWorkspace(){
    if(!focused())return;
    const t=tray(),w=workspace();
    if(!t||!w)return;
    if(w.parentElement!==t)t.appendChild(w);
    const activePanel=w.querySelector('.board-workspace-panel.active');
    if(activePanel&&activePanel.scrollTop<0)activePanel.scrollTop=0;
  }

  function reconcile(){
    installStyles();
    if(!focused())return;
    moveComposeAboveBoard();
    normalizeWorkspace();
  }

  function schedule(){
    requestAnimationFrame(()=>requestAnimationFrame(reconcile));
    setTimeout(reconcile,60);
  }

  function start(){
    installStyles();
    [80,220,500,900].forEach(ms=>setTimeout(reconcile,ms));

    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('#'+BUTTON_ID+', .board-workspace-tab'))schedule();
    },false);

    window.addEventListener('pageshow',schedule);
    window.addEventListener('resize',()=>{if(focused())schedule();});
    window.visualViewport?.addEventListener('resize',()=>{if(focused())schedule();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
