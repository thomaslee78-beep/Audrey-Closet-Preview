/* Audrey Closet v13.22 Board Focus Mode dev1
 * Full-board editing mode for iPhone/web.
 * Keeps the complete outfit board visible, removes rounded board chrome,
 * and puts existing compose/workspace controls in an independently scrollable tray.
 */
(function(){
  'use strict';

  const STYLE_ID='boardFocusDev1Styles';
  const BUTTON_ID='boardFocusToggleDev1';
  const TRAY_ID='boardFocusTrayDev1';
  let active=false;
  let composePlaceholder=null;
  let workspacePlaceholder=null;

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function board(){return document.getElementById('outfitBoard');}
  function compose(){return screen()?.querySelector('.board-compose-bar')||null;}
  function workspace(){return document.getElementById('boardWorkspace');}
  function shell(){return screen()?.querySelector('.board-shell')||null;}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .screen[data-screen="outfits"] #outfitBoard{position:relative}
      #${BUTTON_ID}{position:absolute;top:8px;right:8px;z-index:2147483100;display:grid;place-items:center;width:38px;height:38px;padding:0;border:1px solid rgba(255,255,255,.70);border-radius:11px;background:rgba(54,60,49,.72);color:#fff;box-shadow:0 2px 8px rgba(35,38,31,.18);font:800 19px/1 system-ui,-apple-system,sans-serif;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);-webkit-tap-highlight-color:transparent}
      #${BUTTON_ID}:active{transform:scale(.96)}
      #${BUTTON_ID}:focus-visible{outline:3px solid rgba(255,255,255,.72);outline-offset:2px}

      body.board-focus-mode-dev1{overflow:hidden!important;overscroll-behavior:none!important}
      body.board-focus-mode-dev1>.topbar{visibility:hidden!important;pointer-events:none!important}

      .screen[data-screen="outfits"].board-focus-active-dev1{
        --focus-board-width:100vw;
        position:fixed!important;
        inset:0!important;
        z-index:2147482000!important;
        display:flex!important;
        flex-direction:column!important;
        width:100vw!important;
        max-width:none!important;
        height:100dvh!important;
        min-height:0!important;
        margin:0!important;
        padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)!important;
        overflow:hidden!important;
        background:#f1e7d5!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-page-head,
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-controls-top{display:none!important}
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-shell{
        order:1!important;
        flex:0 0 auto!important;
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
        gap:0!important;
        border:0!important;
        border-radius:0!important;
        background:#f1e7d5!important;
        box-shadow:none!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-shell>div:first-child{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:0!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 #outfitBoard{
        width:var(--focus-board-width)!important;
        max-width:none!important;
        height:auto!important;
        aspect-ratio:var(--board-format-ratio,4/5)!important;
        margin:0 auto!important;
        border-radius:0!important;
        border-left:0!important;
        border-right:0!important;
        box-shadow:none!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 #${BUTTON_ID}{
        top:calc(8px + env(safe-area-inset-top)*0)!important;
        right:8px!important;
        border-radius:9px!important;
        background:rgba(54,60,49,.78)!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1 #boardEditbar{
        width:100%!important;
        max-width:none!important;
        margin:0!important;
        padding:3px 4px!important;
        border-radius:0!important;
        background:#e7ddca!important;
        box-sizing:border-box!important;
      }

      #${TRAY_ID}{display:none}
      .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID}{
        order:2!important;
        display:block!important;
        flex:1 1 auto!important;
        min-height:145px!important;
        width:100%!important;
        max-width:none!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior:contain!important;
        background:#f1e7d5!important;
        border-top:1px solid rgba(108,81,66,.14)!important;
        padding:6px 7px calc(10px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID} .board-compose-bar{
        margin:0 0 6px!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID} .board-workspace{
        margin:0!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID} .board-workspace-tabs{
        position:sticky!important;
        top:-6px!important;
        z-index:25!important;
      }
      .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID} .board-workspace-panel.active{
        padding-bottom:8px!important;
      }

      /* Everything not part of the focused canvas/tray stays out of the fixed workspace. */
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-picker-card,
      .screen[data-screen="outfits"].board-focus-active-dev1>.board-save-panel{display:none!important}

      @media(max-width:430px){
        #${BUTTON_ID}{width:36px;height:36px;font-size:18px;top:7px;right:7px}
        .screen[data-screen="outfits"].board-focus-active-dev1>#${TRAY_ID}{padding-left:5px!important;padding-right:5px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureButton(){
    const b=board();
    if(!b)return null;
    let btn=document.getElementById(BUTTON_ID);
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id=BUTTON_ID;
      btn.setAttribute('aria-label','Enter Board Focus Mode');
      btn.setAttribute('aria-pressed','false');
      btn.title='Board Focus Mode';
      btn.textContent='⛶';
      btn.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation)e.stopImmediatePropagation();
        active?exitFocus():enterFocus();
      },true);
      b.appendChild(btn);
    }
    return btn;
  }

  function ensureTray(){
    const sc=screen();if(!sc)return null;
    let tray=document.getElementById(TRAY_ID);
    if(!tray){
      tray=document.createElement('section');
      tray.id=TRAY_ID;
      tray.className='board-focus-tray-dev1';
      tray.setAttribute('aria-label','Board editing controls');
      sc.appendChild(tray);
    }
    return tray;
  }

  function moveControlsIntoTray(){
    const tray=ensureTray(),c=compose(),w=workspace();
    if(!tray||!c||!w)return false;
    if(!composePlaceholder){composePlaceholder=document.createComment('board-focus-compose-home');c.parentNode.insertBefore(composePlaceholder,c);}
    if(!workspacePlaceholder){workspacePlaceholder=document.createComment('board-focus-workspace-home');w.parentNode.insertBefore(workspacePlaceholder,w);}
    tray.appendChild(c);
    tray.appendChild(w);
    return true;
  }

  function restoreControls(){
    const c=compose(),w=workspace();
    if(c&&composePlaceholder?.parentNode)composePlaceholder.parentNode.insertBefore(c,composePlaceholder.nextSibling);
    if(w&&workspacePlaceholder?.parentNode)workspacePlaceholder.parentNode.insertBefore(w,workspacePlaceholder.nextSibling);
  }

  function usableViewport(){
    const vv=window.visualViewport;
    return {width:Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||700))};
  }

  function sizeBoard(){
    if(!active)return;
    const sc=screen(),b=board();if(!sc||!b)return;
    const vp=usableViewport();
    const ratioText=getComputedStyle(sc).getPropertyValue('--board-format-ratio').trim()||'4/5';
    const parts=ratioText.split('/').map(Number),ratio=(parts.length===2&&parts[0]>0&&parts[1]>0)?parts[0]/parts[1]:.8;
    const editH=Math.max(32,document.getElementById('boardEditbar')?.getBoundingClientRect().height||38);
    const preferredMax=Math.max(220,vp.height*.70-editH);
    const fullWidthBoardH=vp.width/ratio;
    const focusWidth=fullWidthBoardH<=preferredMax?vp.width:Math.max(220,Math.min(vp.width,preferredMax*ratio));
    sc.style.setProperty('--focus-board-width',Math.round(focusWidth)+'px');
    sc.classList.toggle('board-focus-edge-to-edge-dev1',Math.abs(focusWidth-vp.width)<3);
  }

  function syncButton(){
    const btn=ensureButton();if(!btn)return;
    btn.textContent=active?'⛶':'⛶';
    btn.setAttribute('aria-pressed',active?'true':'false');
    btn.setAttribute('aria-label',active?'Exit Board Focus Mode':'Enter Board Focus Mode');
    btn.title=active?'Exit Board Focus Mode':'Board Focus Mode';
  }

  function enterFocus(){
    if(active)return;
    if(!moveControlsIntoTray()){
      [60,150,320,600].forEach(ms=>setTimeout(()=>{if(!active&&moveControlsIntoTray())enterFocus();},ms));
      return;
    }
    const sc=screen();if(!sc)return;
    active=true;
    document.body.classList.add('board-focus-mode-dev1');
    sc.classList.add('board-focus-active-dev1');
    syncButton();
    requestAnimationFrame(()=>{sizeBoard();document.getElementById(TRAY_ID)?.scrollTo({top:0,behavior:'auto'});});
    setTimeout(sizeBoard,80);
  }

  function exitFocus(){
    if(!active)return;
    const sc=screen();
    active=false;
    sc?.classList.remove('board-focus-active-dev1','board-focus-edge-to-edge-dev1');
    sc?.style.removeProperty('--focus-board-width');
    document.body.classList.remove('board-focus-mode-dev1');
    restoreControls();
    syncButton();
    requestAnimationFrame(()=>{if(typeof drawBoard==='function')drawBoard();});
  }

  function install(){
    installStyles();
    ensureTray();
    ensureButton();
  }

  function start(){
    install();
    [80,220,500,900].forEach(ms=>setTimeout(install,ms));
    window.addEventListener('resize',()=>{if(active)requestAnimationFrame(sizeBoard);});
    window.visualViewport?.addEventListener('resize',()=>{if(active)requestAnimationFrame(sizeBoard);});
    window.addEventListener('pageshow',()=>setTimeout(install,0));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{install();if(active)sizeBoard();},0);});
    document.addEventListener('click',e=>{
      if(!active)return;
      const t=e.target;if(!(t instanceof Element))return;
      if(t.closest('nav,[data-nav],.bottom-nav,.app-nav')&&!t.closest('#'+TRAY_ID))exitFocus();
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
