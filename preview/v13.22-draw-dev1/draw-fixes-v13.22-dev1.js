/* Audrey Closet v13.22 Draw Studio dev1 regression fixes */
(function(){
  'use strict';

  function openPreferencesV132D1(){
    try{ if(typeof renderPortfolioFolderEditor==='function')renderPortfolioFolderEditor(); }catch{}
    try{ if(typeof renderJournalOrderEditor==='function')renderJournalOrderEditor(); }catch{}
    try{
      if(typeof showScreen==='function'){
        showScreen('more');
        return;
      }
    }catch{}
    document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
    const more=document.querySelector('.screen[data-screen="more"]');
    if(more){
      more.classList.add('active');
      window.scrollTo({top:0,left:0,behavior:'auto'});
    }
  }

  function installSettingsFixV132D1(){
    const btn=document.getElementById('settingsBtn');
    if(!btn||btn.dataset.drawSettingsFixV132D1==='true')return;
    btn.dataset.drawSettingsFixV132D1='true';
    btn.onclick=openPreferencesV132D1;
  }

  function installTextCompactStyleV132D1(){
    if(document.getElementById('drawTextCompactFixV132D1'))return;
    const style=document.createElement('style');
    style.id='drawTextCompactFixV132D1';
    style.textContent=`
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row{
        display:grid!important;
        grid-template-columns:auto minmax(0,1fr) auto 96px 32px!important;
        gap:4px!important;
        align-items:center!important;
        width:100%!important;
        max-width:100%!important;
      }
      .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row>#boardTextColorInputV13213{
        grid-column:5!important;
        grid-row:1!important;
        width:32px!important;
        height:32px!important;
        min-width:32px!important;
        margin:0!important;
      }
      @media(max-width:410px){
        .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row{
          grid-template-columns:auto minmax(0,1fr) auto 90px 30px!important;
          gap:3px!important;
        }
        .screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"] .text-font-align-row>#boardTextColorInputV13213{
          width:30px!important;height:30px!important;min-width:30px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function compactTextFontColorV132D1(){
    const studio=document.getElementById('boardTextStudioV132011');
    if(!studio)return;
    const row=studio.querySelector('.text-font-align-row');
    const color=document.getElementById('boardTextColorInputV13213');
    if(!row||!color)return;
    if(color.parentElement!==row)row.appendChild(color);
  }

  const observer=new MutationObserver(()=>{
    installSettingsFixV132D1();
    compactTextFontColorV132D1();
  });

  function installV132D1Fixes(){
    installTextCompactStyleV132D1();
    installSettingsFixV132D1();
    compactTextFontColorV132D1();
    const root=document.getElementById('app')||document.body;
    observer.disconnect();
    observer.observe(root,{childList:true,subtree:true});
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.decorate-studio-tab[data-decorate-group="text"]'))setTimeout(compactTextFontColorV132D1,0);
  },true);

  installV132D1Fixes();
  setTimeout(installV132D1Fixes,200);
  setTimeout(installV132D1Fixes,700);
  window.__audreyDrawDev1Fixes={openPreferences:openPreferencesV132D1,compactText:compactTextFontColorV132D1};
})();
