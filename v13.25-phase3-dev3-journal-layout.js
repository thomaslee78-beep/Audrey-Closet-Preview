/* Audrey Closet v13.25 Phase 3 dev3 — crafted Journal View layout
 * Presentation-only layer for the read-only Journal View. Reuses the existing
 * record, rich journal HTML, photo carousel and item-detail behavior.
 */
(function(){
  'use strict';

  const VERSION='3.4';
  const STYLE_ID='v1325Phase3CraftedReaderStyles';

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #v1325JournalReaderDialog .v1325-reader-scroll{background:#efe5d3}
      #v1325JournalReaderDialog .v1325-reader-page{position:relative;max-width:680px;margin:0 auto;min-height:100%;padding:58px 28px 34px;background:
        radial-gradient(circle at 12% 8%,rgba(255,255,255,.72),transparent 22%),
        linear-gradient(180deg,#fbf5e9 0%,#f8efdf 100%);box-shadow:inset 0 0 0 1px rgba(107,83,61,.10)}
      #v1325JournalReaderDialog .v1325-reader-page:before{content:'';position:absolute;inset:16px;border:1px solid rgba(111,85,62,.26);border-radius:12px;pointer-events:none;box-shadow:inset 0 0 0 4px rgba(255,255,255,.23)}
      #v1325JournalReaderDialog .v1325-reader-page:after{content:'✦';position:absolute;left:34px;bottom:25px;color:rgba(124,97,65,.25);font-size:1rem;pointer-events:none}
      #v1325JournalReaderDialog .v1325-reader-top{position:relative;display:block;margin:0 0 15px;padding:0 48px;text-align:center;z-index:2}
      #v1325JournalReaderDialog .v1325-reader-kicker{display:none}
      #v1325JournalReaderDialog .v1325-reader-date{position:relative;display:inline-block;max-width:100%;padding:9px 28px 10px;margin:0;background:#d9b87c;color:#554130;border:1px solid rgba(103,75,43,.22);font-family:var(--serif);font-size:1.32rem;line-height:1.1;box-shadow:0 4px 0 rgba(119,89,52,.10);border-radius:3px}
      #v1325JournalReaderDialog .v1325-reader-date:before,#v1325JournalReaderDialog .v1325-reader-date:after{content:'';position:absolute;top:7px;width:20px;height:31px;background:#c99e5c;z-index:-1}
      #v1325JournalReaderDialog .v1325-reader-date:before{left:-14px;clip-path:polygon(0 0,100% 0,100% 100%,0 78%,28% 50%,0 22%)}
      #v1325JournalReaderDialog .v1325-reader-date:after{right:-14px;clip-path:polygon(0 0,100% 22%,72% 50%,100% 78%,100% 100%,0 100%,0 0)}
      #v1325JournalReaderDialog .v1325-reader-close{position:absolute;right:0;top:-3px;z-index:4}
      #v1325JournalReaderDialog .v1325-reader-chips{position:relative;z-index:2;justify-content:center;margin:0 0 18px;padding:0 10px 8px}

      #v1325JournalReaderDialog .v1325-crafted-body{position:relative;z-index:2;display:grid;grid-template-columns:128px minmax(0,1fr);column-gap:18px;align-items:start}
      #v1325JournalReaderDialog .v1325-crafted-photos{grid-column:1;grid-row:1;display:flex;flex-direction:column;gap:11px;padding-top:3px}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos{display:flex;flex-direction:column;gap:11px}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{width:116px;height:112px;aspect-ratio:auto;object-fit:cover;border-radius:3px;border:7px solid rgba(255,255,255,.92);box-shadow:0 5px 13px rgba(73,54,37,.16);transform:rotate(-1.2deg)}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img:nth-child(2){transform:rotate(1deg)}
      #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img:nth-child(3){transform:rotate(-.4deg)}
      #v1325JournalReaderDialog .v1325-crafted-writing-top{grid-column:2;grid-row:1;min-width:0;padding:0 3px 6px}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-section-title{display:none}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing{padding:0;font-size:1rem;line-height:1.74;background:linear-gradient(transparent 31px,rgba(120,99,76,.08) 32px);background-size:100% 32px}
      #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing>div,#v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing>p{margin-top:0}

      #v1325JournalReaderDialog .v1325-crafted-look{grid-column:1 / -1;grid-row:2;position:relative;margin:18px auto 10px;width:min(92%,520px);padding:8px 16px 9px;transform:rotate(-.6deg)}
      #v1325JournalReaderDialog .v1325-crafted-look:before{content:'';position:absolute;left:8%;right:8%;top:48%;height:1px;background:rgba(112,86,61,.12);z-index:-1}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-section-title{display:none}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{justify-content:center;gap:15px;overflow-x:auto;padding:5px 4px 8px}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;flex:0 0 86px!important;width:86px!important;min-height:100px;transform:none}
      #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:82px!important;height:98px!important;object-fit:contain!important;background:transparent!important;border-radius:0!important;filter:drop-shadow(0 5px 5px rgba(69,52,39,.14))}

      #v1325JournalReaderDialog .v1325-crafted-writing-bottom{grid-column:1 / -1;grid-row:3;margin-top:3px;padding:0 4px}
      #v1325JournalReaderDialog .v1325-crafted-writing-bottom .v1325-reader-writing{padding:2px 0 4px;font-size:1rem;line-height:1.74;background:linear-gradient(transparent 31px,rgba(120,99,76,.08) 32px);background-size:100% 32px}
      #v1325JournalReaderDialog .v1325-reader-actions{position:relative;z-index:2;margin-top:23px}
      #v1325JournalReaderDialog .v1325-reader-section{margin:0}

      @media(max-width:560px){
        #v1325JournalReaderDialog .v1325-reader-page{padding:54px 20px 28px}
        #v1325JournalReaderDialog .v1325-reader-page:before{inset:10px}
        #v1325JournalReaderDialog .v1325-reader-top{padding:0 40px}
        #v1325JournalReaderDialog .v1325-reader-date{font-size:1.13rem;padding:8px 18px 9px}
        #v1325JournalReaderDialog .v1325-crafted-body{grid-template-columns:104px minmax(0,1fr);column-gap:12px}
        #v1325JournalReaderDialog .v1325-crafted-photos .v1325-reader-photos img{width:96px;height:94px;border-width:5px}
        #v1325JournalReaderDialog .v1325-crafted-writing-top .v1325-reader-writing,#v1325JournalReaderDialog .v1325-crafted-writing-bottom .v1325-reader-writing{font-size:.94rem;line-height:1.68}
        #v1325JournalReaderDialog .v1325-crafted-look{width:100%;padding-left:2px;padding-right:2px}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look{justify-content:flex-start;gap:12px}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card{flex-basis:80px!important;width:80px!important}
        #v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-card img,#v1325JournalReaderDialog .v1325-crafted-look .v1325-reader-look-ph{width:76px!important;height:92px!important}
      }
    `;document.head.appendChild(style);
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
      if(!putBottom&&chars>=260)putBottom=true;
      (putBottom?bottom:top).appendChild(node.cloneNode(true));
      chars+=text.length;
      if(!putBottom&&chars>=360)putBottom=true;
    });
    return {top,bottom:bottom.childNodes.length?bottom:null};
  }

  function applyCraftedLayout(){
    const page=document.querySelector('#v1325JournalReaderPage');if(!page||page.dataset.craftedLayout==='1')return;
    const photoSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-photos'));
    const lookSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-look'));
    const journalSection=[...page.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-writing'));
    const actions=page.querySelector('.v1325-reader-actions');
    if(!journalSection||!lookSection)return;

    const split=splitWriting(journalSection),body=document.createElement('div');body.className='v1325-crafted-body';
    if(photoSection){photoSection.querySelector('.v1325-reader-section-title')?.remove();photoSection.classList.add('v1325-crafted-photos');body.appendChild(photoSection);}

    const top=document.createElement('section');top.className='v1325-reader-section v1325-crafted-writing-top';
    if(split.top)top.appendChild(split.top);else top.innerHTML='<div class="v1325-reader-writing empty">No written memory yet.</div>';
    body.appendChild(top);

    lookSection.classList.add('v1325-crafted-look');body.appendChild(lookSection);

    if(split.bottom){const bottom=document.createElement('section');bottom.className='v1325-reader-section v1325-crafted-writing-bottom';bottom.appendChild(split.bottom);body.appendChild(bottom);}

    journalSection.remove();
    if(actions)page.insertBefore(body,actions);else page.appendChild(body);
    page.dataset.craftedLayout='1';
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__craftedWrapped)return;
    const open0=api.openReader.bind(api);
    api.openReader=function(id){const out=open0(id);requestAnimationFrame(applyCraftedLayout);setTimeout(applyCraftedLayout,0);return out;};
    api.__craftedWrapped=true;
  }

  installStyles();wrapReader();
  document.addEventListener('click',event=>{if(event.target.closest?.('#v1325JournalViewBtn')){requestAnimationFrame(applyCraftedLayout);setTimeout(applyCraftedLayout,0);}},true);
  window.AudreyJournalCraftedLayout={version:VERSION,refresh:applyCraftedLayout};
})();
