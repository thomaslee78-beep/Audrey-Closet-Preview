/* Audrey Closet v13.22 Decorate Rail prototype 6
 * Minor rail typography/layout polish over prototype 5:
 * - restores stacked icon-over-label layout
 * - centers icon and label
 * - slightly increases label font size
 * - adds a little vertical room while keeping compact rectangular tabs
 * - preserves warm surfaces, spacing, and Board Focus scroll behavior
 */
(function(){
  'use strict';

  const STYLE_ID='decorateRailProto6Styles';
  const LAYOUT_CLASS='decorate-rail-layout-proto1';
  const RAIL_CLASS='decorate-rail-proto1';
  const STAGE_CLASS='decorate-stage-proto1';
  const ICONS={text:'T',draw:'✎',shapes:'○',stickers:'✦'};
  const LABELS={text:'Text',draw:'Draw',shapes:'Shapes',stickers:'Stickers'};

  function screen(){return document.querySelector('.screen[data-screen="outfits"]');}
  function decorateWorkspace(){return screen()?.querySelector('.board-workspace-panel[data-board-panel="decorate"]')||null;}
  function decorateShell(){return decorateWorkspace()?.querySelector('.board-decorate-shell')||decorateWorkspace();}
  function decorateTabs(){return Array.from(decorateWorkspace()?.querySelectorAll('.decorate-studio-tab[data-decorate-group]')||[]);}
  function decoratePanels(){return Array.from(decorateWorkspace()?.querySelectorAll('.decorate-studio-panel[data-decorate-group]')||[]);}

  function installStyles(){
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
    style.textContent=`
      .screen[data-screen="outfits"]{
        --decorate-folder-bg:#f6f0e5;
        --decorate-folder-bg-soft:#faf6ed;
        --decorate-folder-border:rgba(82,72,62,.18);
        --decorate-selected-border:rgba(20,20,20,.30);
      }

      .screen[data-screen="outfits"] #boardWorkspace>.board-workspace-tabs{margin-bottom:0!important;padding-bottom:0!important}
      .screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="decorate"]{padding-top:1px!important;margin-top:0!important}
      .screen[data-screen="outfits"] .board-decorate-shell{margin-top:0!important;padding-top:0!important}
      .screen[data-screen="outfits"] .${LAYOUT_CLASS}{display:grid!important;grid-template-columns:58px minmax(0,1fr)!important;gap:3px!important;align-items:start!important;width:100%!important;min-width:0!important;margin:0!important;padding:0!important;box-sizing:border-box!important;background:transparent!important}

      .screen[data-screen="outfits"] .${RAIL_CLASS}{position:sticky!important;top:0!important;z-index:52!important;display:flex!important;flex-direction:column!important;gap:2px!important;width:58px!important;min-width:58px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;box-sizing:border-box!important;align-self:start!important;overscroll-behavior:none!important;scrollbar-width:thin!important}
      .screen[data-screen="outfits"] .${RAIL_CLASS}::-webkit-scrollbar{width:3px!important}

      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{
        appearance:none!important;-webkit-appearance:none!important;
        display:grid!important;place-items:center!important;
        grid-template-columns:1fr!important;grid-template-rows:21px auto!important;
        gap:2px!important;width:58px!important;min-width:58px!important;
        height:43px!important;min-height:43px!important;margin:0!important;
        padding:3px 3px 4px!important;border:1px solid rgba(82,72,62,.18)!important;
        border-radius:0!important;background:rgba(224,217,205,.84)!important;color:#625f58!important;
        font:800 9px/1.05 var(--sans,system-ui,sans-serif)!important;text-align:center!important;
        white-space:normal!important;box-shadow:none!important;-webkit-tap-highlight-color:transparent!important;
        box-sizing:border-box!important;
      }
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab.active{position:relative!important;z-index:2!important;background:var(--decorate-folder-bg)!important;color:#4f4b45!important;border-color:var(--decorate-selected-border)!important;box-shadow:none!important}
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-icon-proto1{display:grid!important;place-items:center!important;width:21px!important;height:21px!important;font:800 16px/1 var(--sans,system-ui,sans-serif)!important;margin:0 auto!important}
      .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-rail-label-proto1{display:block!important;width:100%!important;max-width:54px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;text-align:center!important;margin:0 auto!important}

      .screen[data-screen="outfits"] .${STAGE_CLASS}{position:relative!important;display:block!important;min-width:0!important;width:100%!important;margin:0!important;padding:0!important;box-sizing:border-box!important;background:var(--decorate-folder-bg)!important;border:0!important;border-radius:0!important}
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel{min-width:0!important;width:100%!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:var(--decorate-folder-bg)!important;box-sizing:border-box!important}
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active,.screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active>.decorate-studio-content{background:var(--decorate-folder-bg)!important}
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active>.decorate-studio-content{margin:0!important;padding-left:0!important;border-radius:0!important}

      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active .decorate-tool-card,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active #drawStudioDev10,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active #shapeStudioV132201,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active #stickerStudioV1322Release{margin-left:0!important;margin-right:0!important;border-radius:0!important;background:var(--decorate-folder-bg)!important;border-color:var(--decorate-folder-border)!important;box-shadow:none!important}
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active .text-studio,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active .decorate-studio-content,
      .screen[data-screen="outfits"] .${STAGE_CLASS}>.decorate-studio-panel.active .decorate-draw-current{background:var(--decorate-folder-bg)!important}
      .screen[data-screen="outfits"] #stickerStudioV1322Release .sticker-browser{background:linear-gradient(180deg,rgba(255,253,248,.97),rgba(248,242,232,.94))!important}

      .screen[data-screen="outfits"].board-focus-active-dev1 #boardWorkspace>.board-workspace-tabs{margin-bottom:0!important;padding-bottom:0!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 #boardFocusTrayDev1{overscroll-behavior:none!important;-webkit-overflow-scrolling:auto!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 .board-workspace-panel[data-board-panel="decorate"].active{padding-top:1px!important;scroll-padding-top:1px!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:none!important;-webkit-overflow-scrolling:auto!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 .${LAYOUT_CLASS}{min-height:100%!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 .${RAIL_CLASS}{top:0!important;overflow-y:auto!important;overflow-x:hidden!important;max-height:var(--decorate-rail-visible-h,180px)!important;-webkit-overflow-scrolling:auto!important;overscroll-behavior:none!important;touch-action:pan-y!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 .${STAGE_CLASS}{min-height:100%!important;background:var(--decorate-folder-bg)!important;overscroll-behavior:none!important}
      .screen[data-screen="outfits"].board-focus-active-dev1 .${STAGE_CLASS}>.decorate-studio-panel.active{position:relative!important;top:0!important}

      @media(max-width:370px){
        .screen[data-screen="outfits"] .${LAYOUT_CLASS}{grid-template-columns:54px minmax(0,1fr)!important;gap:2px!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS}{width:54px!important;min-width:54px!important}
        .screen[data-screen="outfits"] .${RAIL_CLASS} .decorate-studio-tab{width:54px!important;min-width:54px!important;height:41px!important;min-height:41px!important;font-size:8.5px!important}
      }
    `;
  }

  function decorateButton(btn){
    const group=btn.dataset.decorateGroup||'';
    const label=LABELS[group]||btn.textContent.trim()||group;
    const icon=ICONS[group]||'•';
    btn.dataset.decorateRailProto1='1';
    btn.setAttribute('aria-label',label);
    btn.innerHTML=`<span class="decorate-rail-icon-proto1" aria-hidden="true">${icon}</span><span class="decorate-rail-label-proto1">${label}</span>`;
  }

  function syncRailHeight(){
    const sc=screen();const workspace=decorateWorkspace();const rail=workspace?.querySelector('.'+RAIL_CLASS);
    if(!workspace||!rail)return;
    if(!sc?.classList.contains('board-focus-active-dev1')){rail.style.removeProperty('--decorate-rail-visible-h');return;}
    const visible=Math.max(112,Math.floor(workspace.clientHeight-2));rail.style.setProperty('--decorate-rail-visible-h',visible+'px');
  }

  function installLayout(){
    installStyles();
    const workspace=decorateWorkspace(),shell=decorateShell(),tabs=decorateTabs(),panels=decoratePanels();
    if(!workspace||!shell||tabs.length<4||panels.length<4)return false;
    let layout=shell.querySelector(':scope > .'+LAYOUT_CLASS);
    if(!layout){
      layout=document.createElement('div');layout.className=LAYOUT_CLASS;
      const rail=document.createElement('nav');rail.className=RAIL_CLASS;rail.setAttribute('aria-label','Decorate tools');
      const stage=document.createElement('div');stage.className=STAGE_CLASS;layout.append(rail,stage);
      const firstRelevant=[...tabs,...panels].find(node=>node.parentNode===shell);if(firstRelevant)shell.insertBefore(layout,firstRelevant);else shell.appendChild(layout);
    }
    const rail=layout.querySelector('.'+RAIL_CLASS),stage=layout.querySelector('.'+STAGE_CLASS);if(!rail||!stage)return false;
    tabs.forEach(btn=>{decorateButton(btn);if(btn.parentNode!==rail)rail.appendChild(btn);});
    panels.forEach(panel=>{if(panel.parentNode!==stage)stage.appendChild(panel);});
    workspace.classList.add('decorate-rail-enabled-proto1');syncRailHeight();return true;
  }

  function lockTopOnTabChange(){const sc=screen(),panel=decorateWorkspace();if(!sc?.classList.contains('board-focus-active-dev1')||!panel)return;queueMicrotask(()=>{panel.scrollTop=0;syncRailHeight();});}
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(()=>{installLayout();syncRailHeight();}));}

  function start(){
    installLayout();[80,220,500,900].forEach(ms=>setTimeout(()=>{installLayout();syncRailHeight();},ms));
    document.addEventListener('click',e=>{const t=e.target;if(!(t instanceof Element))return;if(t.closest('.decorate-studio-tab[data-decorate-group]'))lockTopOnTabChange();if(t.closest('.board-workspace-tab[data-board-panel="decorate"],#decorateToggle,.decorate-studio-tab[data-decorate-group],#boardFocusToggleDev1'))schedule();},false);
    window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.addEventListener('pageshow',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
