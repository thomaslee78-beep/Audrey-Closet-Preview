/* Audrey Closet v13.25 Phase 3 dev3 — crafted Journal View layout
 * Presentation-only layer for the read-only Journal View. Reuses the existing
 * record, rich journal HTML, photo carousel and item-detail behavior.
 */
(function(){
  'use strict';

  const VERSION='3.5';
  const STYLE_ID='v1325Phase3CraftedReaderStyles';

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #v1325JournalReaderDialog{position:relative}
      #v1325JournalReaderDialog .v1325-reader-scroll{background:#efe5d3;padding-bottom:78px}
      #v1325JournalReaderDialog .v1325-reader-page{position:relative;max-width:680px;margin:0 auto;min-height:100%;padding:58px 28px 42px;background:
        radial-gradient(circle at 12% 8%,rgba(255,255,255,.72),transparent 22%),
        linear-gradient(180deg,#fbf5e9 0%,#f8efdf 100%);box-shadow:inset 0 0 0 1px rgba(107,83,61,.10)}
      #v1325JournalReaderDialog .v1325-reader-page:before{content:'';position:absolute;inset:16px;border:1px solid rgba(111,85,62,.26);border-radius:12px;pointer-events:none;box-shadow:inset 0 0 0 4px rgba(255,255,255,.23)}
      #v1325JournalReaderDialog .v1325-reader-page:after{content:'✦';position:absolute;left:34px;bottom:25px;color:rgba(124,97,65,.25);font-size:1rem;pointer-events:none}
      #v1325JournalReaderDialog .v1325-reader-top{position:relative;display:block;margin:0 0 13px;padding:0 48px;text-align:center;z-index:2}
      #v1325JournalReaderDialog .v1325-reader-kicker{display:none}
      #v1325JournalReaderDialog .v1325-reader-date{position:relative;display:inline-block;max-width:100%;padding:11px 34px 12px;margin:0;background:#d9b87c;color:#554130;border:1px solid rgba(103,75,43,.22);font-family:var(--serif);font-size:1.62rem;line-height:1.08;box-shadow:0 4px 0 rgba(119,89,52,.10);border-radius:3px}
      #v1325JournalReaderDialog .v1325-reader-date:before,#v1325JournalReaderDialog .v1325-reader-date:after{content:'';position:absolute;top:8px;width:23px;height:37px;background:#c99e5c;z-index:-1}
      #v1325JournalReaderDialog .v1325-reader-date:before{left:-16px;clip-path:polygon(0 0,100% 0,100% 100%,0 78%,28% 50%,0 22%)}
      #v1325JournalReaderDialog .v1325-reader-date:after{right:-16px;clip-path:polygon(0 0,100% 22%,72% 50%,100% 78%,100% 100%,0 100%,0 0)}
      #v1325JournalReaderDialog .v1325-reader-close{position:absolute;right:0;top:-2px;z-index:4}
      #v1325JournalReaderDialog .v1325-reader-chips{position:relative;z-index:2;justify-content:center;margin:0 0 8px;padding:0 10px 5px}

      /* Outfit sits directly below context, like loose cutouts on the page. */
      #v1325JournalReaderDialog .v1325-crafted-lookbar{position:relative;z-index:2;display:grid;grid-template-columns:90px minmax(0,1fr);gap:10px;align-items:center;margin:2px 15px 19px;padding:4px 4px 7px}
      #v1325JournalReaderDialog .v1325-crafted-look-label{font-family:var(--serif);font-size:1.08rem;line-height:1.05;font-weight:650;color:#66503c;text-align:right;white-space:normal}
      #v1325JournalReaderDialog .v1325-crafted-look{min-width:0;margin:0;padding:0;transform:rotate(-.25deg)}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-section-title{display:none}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{justify-content:flex-start;gap:13px;overflow-x:auto;padding:4px 4px 7px}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;flex:0 0 105px!important;width:105px!important;min-height:126px;transform:none}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:100px!important;height:122px!important;object-fit:contain!important;background:transparent!important;border-radius:0!important;filter:drop-shadow(0 6px 6px rgba(69,52,39,.16))}

      #v1325JournalReaderDialog .v1325-crafted-body{position:relative;z-index:2;display:grid;grid-template-columns:154px minmax(0,1fr);column-gap:20px;align-items:start}
      #v1325JournalReaderDialog .v1325-crafted-photos{grid-column:1;grid-row:1;display:flex;flex-direction:column;gap:13px;padding-top:3px}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos{display:flex;flex-direction:column;gap:13px}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{width:142px;height:138px;aspect-ratio:auto;object-fit:cover;border-radius:3px;border:7px solid rgba(255,255,255,.92);box-shadow:0 5px 13px rgba(73,54,37,.16);transform:rotate(-1.2deg)}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img:nth-child(2){transform:rotate(1deg)}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img:nth-child(3){transform:rotate(-.4deg)}
      #v1325JournalReaderDialog .v1325-crafted-writing-top{grid-column:2;grid-row:1;min-width:0;padding:0 3px 6px}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-section-title{display:none}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing{padding:0;font-size:1rem;line-height:1.74;background:linear-gradient(transparent 31px,rgba(120,99,76,.08) 32px);background-size:100% 32px}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing>div,#v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing>p{margin-top:0}
      #v1325JournalReaderDialog .v1325-crafted-writing-bottom{grid-column:1 / -1;grid-row:2;margin-top:10px;padding:0 4px}
      #v1325JournalReaderDialog .v1325-crafted-writing-bottom .v1325-reader-writing{padding:2px 0 4px;font-size:1rem;line-height:1.74;background:linear-gradient(transparent 31px,rgba(120,99,76,.08) 32px);background-size:100% 32px}
      #v1325JournalReaderDialog .v1325-reader-section{margin:0}

      /* Persistent reader actions live outside the scrolling page. */
      #v1325JournalReaderDialog > .v1325-reader-actions{position:absolute;left:10px;right:10px;bottom:8px;z-index:45;margin:0;padding:9px 10px max(9px,env(safe-area-inset-bottom));border:1px solid rgba(102,80,59,.16);border-radius:16px;background:rgba(249,242,230,.95);box-shadow:0 8px 28px rgba(49,39,31,.18);backdrop-filter:blur(10px)}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-reader-page{padding:52px 18px 38px}
        #v1325JournalReaderDialog .v1325-reader-page:before{inset:10px}
        #v1325JournalReaderDialog .v1325-reader-top{padding:0 40px}
        #v1325JournalReaderDialog .v1325-reader-date{font-size:1.36rem;padding:10px 21px 11px}
        #v1325JournalReaderDialog .v1325-crafted-lookbar{grid-template-columns:76px minmax(0,1fr);gap:8px;margin:0 6px 16px}
        #v1325JournalReaderDialog .v1325-crafted-look-label{font-size:.96rem}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{gap:10px}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{flex-basis:92px!important;width:92px!important;min-height:112px}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:88px!important;height:108px!important}
        #v1325JournalReaderDialog .v1325-crafted-body{grid-template-columns:124px minmax(0,1fr);column-gap:12px}
        #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{width:116px;height:116px;border-width:5px}
        #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing,#v1325JournalReaderDialog .v1325-crafted-writing-bottom .v1325-reader-writing{font-size:.94rem;line-height:1.68}
      }
    `;document.head.appendChild(style);
  }

  function currentLookLabel(){
    const reader=document.querySelector('#v1325JournalReaderDialog');
    const id=reader?.dataset?.journalId;
    const entry=state.journal.find(j=>String(j.id)===String(id||''));
    if(window.AudreyJournalDev3FunctionalFixes?.lookLabel)return window.AudreyJournalDev3FunctionalFixes.lookLabel(entry);
    const today=typeof localTodayISO==='function'?localTodayISO():new Date().toISOString().slice(0,10),date=String(entry?.date||'');
    if(!date||date===today)return "Today's Look";if(date>today)return 'Planned Look';return 'What I Wore';
  }

  function splitWriting(original){
    const source=original?.querySelector('.v1325-reader-writing');
    if(!source)return {top:null,bottom:null};
    const children=[...source.childNodes];
    if(children.length<2)return {top:source.cloneNode(true),bottom:null};
    const top=source.cloneNode(false),bottom=source.cloneNode(false);
    let chars=0,putBottom=false;
    children.forEach(node=>{
      const text=(node.textContent||'').trim();
      if(!putBottom&&chars>=430)putBottom=true;
      (putBottom?bottom:top).appendChild(node.cloneNode(true));
      chars+=text.length;
      if(!putBottom&&chars>=560)putBottom=true;
    });
    return {top,bottom:bottom.childNodes.length?bottom:null};
  }

  function applyCraftedLayout(){
    const page=document.querySelector('#v1325JournalReaderPage');if(!page)return;
    /* openReader replaces page.innerHTML but keeps the page element itself. The old
       data flag therefore survived and caused later opens to skip reconstruction.
       Detect the actual crafted DOM instead of a persistent dataset flag. */
    if(page.querySelector('.v1325-crafted-body')&&page.querySelector('.v1325-crafted-lookbar'))return;

    const dialog=document.querySelector('#v1325JournalReaderDialog');
    const photoSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-photos'));
    const lookSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-look'));
    const journalSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-writing'));
    const actions=page.querySelector('.v1325-reader-actions');
    if(!journalSection||!lookSection)return;

    /* Compact outfit strip directly under context. */
    const lookbar=document.createElement('section');lookbar.className='v1325-crafted-lookbar';
    const label=document.createElement('div');label.className='v1325-crafted-look-label';label.textContent=currentLookLabel();
    lookSection.classList.add('v1325-crafted-look');lookbar.append(label,lookSection);
    const chips=page.querySelector('.v1325-reader-chips');
    if(chips)chips.after(lookbar);else page.querySelector('.v1325-reader-top')?.after(lookbar);

    const split=splitWriting(journalSection),body=document.createElement('div');body.className='v1325-crafted-body';
    if(photoSection){photoSection.querySelector('.v1325-reader-section-title')?.remove();photoSection.classList.add('v1325-crafted-photos');body.appendChild(photoSection);}

    const top=document.createElement('section');top.className='v1325-reader-section v1325-crafted-writing-top';
    if(split.top)top.appendChild(split.top);else top.innerHTML='<div class="v1325-reader-writing empty">No written memory yet.</div>';
    body.appendChild(top);

    if(split.bottom){const bottom=document.createElement('section');bottom.className='v1325-reader-section v1325-crafted-writing-bottom';bottom.appendChild(split.bottom);body.appendChild(bottom);}
    journalSection.remove();
    if(actions)page.insertBefore(body,actions);else page.appendChild(body);

    /* Move actions outside the scrollable page so they stay anchored to the bottom.
       Remove the previous reader footer first because the dialog itself is reused. */
    if(dialog&&actions){dialog.querySelector(':scope > .v1325-reader-actions')?.remove();actions.querySelector('#v1325ReaderEditBtn')&&(actions.querySelector('#v1325ReaderEditBtn').textContent='Edit Journal');dialog.appendChild(actions);}
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__craftedWrappedV35)return;
    const open0=api.openReader.bind(api);
    api.openReader=function(id){
      /* Remove footer from prior render before the base renderer creates the next one. */
      document.querySelector('#v1325JournalReaderDialog > .v1325-reader-actions')?.remove();
      const out=open0(id);requestAnimationFrame(applyCraftedLayout);setTimeout(applyCraftedLayout,0);return out;
    };
    api.__craftedWrappedV35=true;
  }

  installStyles();wrapReader();
  document.addEventListener('click',event=>{if(event.target.closest?.('#v1325JournalViewBtn')){requestAnimationFrame(applyCraftedLayout);setTimeout(applyCraftedLayout,0);}},true);
  window.AudreyJournalCraftedLayout={version:VERSION,refresh:applyCraftedLayout};
})();
