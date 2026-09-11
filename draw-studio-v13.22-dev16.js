/* Audrey Closet v13.22 Draw Studio dev16
 * Presentation-only Decorate consistency pass over approved dev15 stack.
 * Text / Draw / Shapes share tighter spacing, green panel treatment,
 * aligned control sizing, and no redundant board gesture help copy.
 */
(function(){
  'use strict';

  const STYLE_ID='decorateStudioDev16ConsistencyStyles';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Remove redundant shared interaction help to reclaim vertical space. */
      .screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-shared-help{display:none!important;margin:0!important;padding:0!important;height:0!important;min-height:0!important;overflow:hidden!important}

      /* Text / Draw / Shapes use the same quiet green studio surface. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .decorate-tool-card,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-tool-card,
      .screen[data-screen="outfits"] #drawStudioDev10{
        background:rgba(238,240,232,.68)!important;
        border-color:rgba(102,113,90,.18)!important;
        border-radius:10px!important;
        box-shadow:none!important;
      }

      /* Keep all three studios visually compact. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"],
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"],
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"]{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .decorate-studio-content,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="draw"] .decorate-studio-content,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-studio-content{gap:0!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .decorate-tool-card,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-tool-card{padding:6px 7px!important;margin:0!important}

      /* Draw picker now matches the Shape picker footprint. */
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-strip{gap:5px!important;padding:1px 1px 5px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-btn{
        display:grid!important;
        flex:0 0 56px!important;
        width:56px!important;
        min-width:56px!important;
        max-width:56px!important;
        height:54px!important;
        padding:4px 2px 3px!important;
        grid-template-rows:30px auto!important;
        gap:1px!important;
        border-radius:9px!important;
        font-size:8px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-tool-btn .draw-tool-icon{
        width:30px!important;
        height:30px!important;
        font-size:19px!important;
      }

      /* Align compact option/control heights across the studios. */
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-thickness-value,
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap,
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-seg-btn,
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-undo-btn,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-format-btn,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-size-btn,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-align-btn{
        height:34px!important;
        min-height:34px!important;
        border-radius:9px!important;
      }
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-secondary-row{min-height:34px!important}
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-control-row{gap:5px!important}

      /* Color controls use the same compact square footprint. */
      .screen[data-screen="outfits"] #drawStudioDev10 .draw-color-wrap,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] #boardTextColorInputV13213,
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] input[type="color"]{
        width:38px!important;
        min-width:38px!important;
        height:34px!important;
        min-height:34px!important;
        border-radius:9px!important;
        box-sizing:border-box!important;
      }

      /* Text: compact vertical rhythm while retaining comfortable touch targets. */
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-studio{gap:5px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-entry-action-row{gap:5px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] #boardTextInput{
        min-height:58px!important;
        height:58px!important;
        max-height:58px!important;
        padding:7px 9px!important;
      }
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-select{height:34px!important;border-radius:9px!important}
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-studio-action{min-height:34px!important;height:34px!important;border-radius:9px!important}

      /* Shapes already sets the compact benchmark; just harmonize its container. */
      .screen[data-screen="outfits"] #shapeStudioV132201{margin-top:0!important;gap:4px!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217{padding-bottom:4px!important}
      .screen[data-screen="outfits"] #shapePickerStripV132217>.shape-picker-btn{border-radius:9px!important}

      @media(max-width:430px){
        .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .decorate-tool-card,
        .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="shapes"] .decorate-tool-card{padding:5px 6px!important}
        .screen[data-screen="outfits"] #drawStudioDev10{padding:5px 6px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function removeSharedHelp(){
    const shell=document.querySelector('.screen[data-screen="outfits"] .board-decorate-shell');
    if(!shell)return;
    shell.querySelectorAll('.decorate-studio-shared-help').forEach(node=>{
      node.setAttribute('aria-hidden','true');
    });
  }

  function apply(){
    installStyles();
    removeSharedHelp();
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(apply));}

  function start(){
    apply();
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.closest('.board-workspace-tab[data-board-panel="decorate"], .decorate-studio-tab, #decorateToggle'))schedule();
    },false);
    window.addEventListener('pageshow',schedule);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
