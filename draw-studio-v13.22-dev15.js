/* Audrey Closet v13.22 Draw Studio dev15
 * Presentation-only compaction pass over the approved dev14 Draw stack.
 * Removes legacy/placeholder Draw panels and development headings.
 */
(function(){
  'use strict';

  const STYLE_ID='drawStudioDev15CompactStyles';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Remove the original Decorate placeholder content for Draw. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] > .decorate-studio-intro{display:none!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-tool-card[data-decorate-card="draw"]{display:none!important}

      /* Remove Draw development/title chrome and let the tools lead. */
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-clean-head{display:none!important}

      /* Collapse shell spacing left behind by the removed panels. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-content{gap:0!important}

      /* Compact the active Draw palette without changing control behavior. */
      .screen[data-screen="outfits"] #drawStudioDev10{
        gap:4px!important;
        margin:0!important;
        padding:5px 7px!important;
        border-radius:10px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-strip{
        gap:4px!important;
        padding:0 0 2px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-btn{
        grid-template-rows:21px auto!important;
        gap:1px!important;
        flex-basis:54px!important;
        min-width:54px!important;
        height:43px!important;
        padding:3px 2px!important;
        border-radius:8px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-btn .draw-tool-icon{
        width:21px!important;
        height:21px!important;
        font-size:15px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row{
        gap:4px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-thickness{
        gap:4px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-thickness-value{
        height:28px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap{
        height:29px!important;
        border-radius:8px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-seg-btn,
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-undo-btn{
        height:29px!important;
        border-radius:8px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row{
        min-height:29px!important;
        gap:4px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-status-wrap{
        gap:1px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-mode-hint{
        font-size:7.5px!important;
      }

      @media(max-width:430px){
        .screen[data-screen="outfits"] #drawStudioDev10{padding:5px 6px!important}
        .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-btn{flex-basis:51px!important;min-width:51px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function compactDrawPanel(){
    installStyles();
    const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="draw"]');
    if(!panel)return;

    /* Hide explicitly as well as via CSS so layout remains compact even if
       another feature temporarily injects inline display values. */
    const intro=panel.querySelector(':scope > .decorate-studio-intro');
    if(intro)intro.setAttribute('aria-hidden','true');

    const legacyCard=panel.querySelector('.decorate-tool-card[data-decorate-card="draw"]');
    if(legacyCard)legacyCard.setAttribute('aria-hidden','true');

    const head=panel.querySelector('#drawStudioDev10 .draw-clean-head');
    if(head)head.setAttribute('aria-hidden','true');
  }

  function scheduleCompact(){
    requestAnimationFrame(()=>requestAnimationFrame(compactDrawPanel));
  }

  function start(){
    compactDrawPanel();
    document.addEventListener('click',e=>{
      const target=e.target;
      if(!(target instanceof Element))return;
      if(target.closest('.board-workspace-tab[data-board-panel="decorate"], .decorate-studio-tab[data-decorate-group="draw"], #decorateToggle'))scheduleCompact();
    },false);
    window.addEventListener('pageshow',scheduleCompact);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleCompact();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
