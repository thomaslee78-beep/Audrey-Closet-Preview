/* Audrey Closet v13.25 Phase 3 — Wear Log detail layout pass 2
 * v1.2 separates day classifiers from journal editing, places Edit inside the
 * journal heading, and promotes View Journal as the primary feature action.
 */
(function(){
  'use strict';

  const VERSION='1.2';
  const STYLE_ID='v1325WearLogLayout2Styles';
  let syncing=false;

  function currentEntry(){return state.journal.find(j=>String(j.id)===String(viewingJournalId||''))||null;}
  function ratingValue(entry){const n=Number(entry?.rating||0);if(n>=1&&n<=5)return n;return ({'Would change it':1,'Just okay':3,'Felt good':4,'Loved it':5})[entry?.feel]||0;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #journalDetailDialog .journal-detail-scroll{position:relative}
      #journalDetailDialog .sheet-head{position:relative;padding-right:92px}
      #journalDetailDialog .v1325-wear-close-corner{position:absolute!important;right:2px!important;top:0!important;z-index:30!important}
      #journalDetailDialog .v1325-wear-close-corner button{width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;border-radius:50%!important}
      #journalDetailDialog .v1325-detail-favorite-corner{position:absolute!important;right:44px!important;top:0!important;z-index:29!important}

      #journalDetailDialog .v1325-look-strip-wrap{margin:4px 0 8px!important;padding-top:0!important}
      #journalDetailDialog .v1325-look-strip-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 2px 7px!important}
      #journalDetailDialog .v1325-look-strip-head small{display:none!important}
      #journalDetailDialog .v1325-look-rating{display:flex;align-items:center;gap:4px;margin-left:auto}
      #journalDetailDialog .v1325-look-rating-label{font-size:.66rem;font-weight:700;color:var(--muted);white-space:nowrap}
      #journalDetailDialog .v1325-look-rating #journalDetailRatingStars{display:flex!important;align-items:center!important;gap:0!important}
      #journalDetailDialog .v1325-look-rating #journalDetailRatingStars .journal-rating-star{width:22px!important;min-width:22px!important;height:28px!important;padding:0!important;border:0!important;background:transparent!important;font-size:1.04rem!important;color:#9b7442!important}

      #journalDetailDialog .v1325-meta-rate,#journalDetailDialog .v1325-journal-meta-toolbar{display:none!important}

      /* Day identity: quiet classifier strip under What I Wore. */
      #journalDetailDialog .v1325-day-classifiers{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 14px;padding:6px 8px;border-radius:12px;background:rgba(112,91,69,.055)}
      #journalDetailDialog .v1325-day-classifier-label{font-size:.61rem;font-weight:750;color:var(--muted);letter-spacing:.02em;text-transform:uppercase}
      #journalDetailDialog .v1325-day-classifiers .v1325-journal-era-row{display:flex!important;align-items:center!important;gap:4px!important;margin:0!important;min-width:0!important}
      #journalDetailDialog .v1325-day-classifiers #v1325JournalEra{width:138px!important;max-width:138px!important;height:31px!important;padding:0 8px!important;border-radius:999px!important;font-size:.7rem!important;background:#fffdf8!important}
      #journalDetailDialog .v1325-day-classifiers #v1325JournalNewEraBtn{width:30px!important;height:30px!important;min-width:30px!important;padding:0!important;border-radius:50%!important;font-size:0!important}
      #journalDetailDialog .v1325-day-classifiers #v1325JournalNewEraBtn:after{content:'+';font-size:1rem}
      #journalDetailDialog .v1325-day-classifiers .v1325-day-color-wrap{margin:0!important;flex:0 0 auto!important}
      #journalDetailDialog .v1325-day-classifiers .v1325-day-color-btn{width:32px!important;height:30px!important;min-width:32px!important;border-radius:9px!important;padding:0!important}

      /* Journal heading owns the edit action. */
      #journalDetailDialog .v1325-journal-context-title{display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:9px!important}
      #journalDetailDialog .v1325-journal-context-title>strong{flex:1 1 auto}
      #journalDetailDialog .v1325-journal-context-title>small{display:none!important}
      #journalDetailDialog .v1325-journal-context-title .v1325-journal-edit-toggle{margin-left:auto!important;min-height:31px!important;padding:5px 9px!important;border-radius:9px!important;font-size:.68rem!important}

      /* View Journal is a separate feature call-to-action, not another utility control. */
      #journalDetailDialog .v1325-journal-feature-row{display:flex;justify-content:flex-end;margin:2px 0 10px}
      #journalDetailDialog #v1325JournalViewBtn{width:auto!important;min-width:0!important;min-height:38px!important;margin:0!important;padding:8px 13px!important;border-radius:11px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;background:#6f5d48!important;color:#fff!important;border:1px solid #6f5d48!important;box-shadow:0 4px 12px rgba(68,53,40,.14)!important;font-size:.75rem!important;font-weight:800!important;line-height:1!important}
      #journalDetailDialog #v1325JournalViewBtn:before{content:'📖'!important;font-size:.95rem!important;line-height:1!important}
      #journalDetailDialog .v1325-journal-view-launch:before{content:'📖'!important}
      #journalDetailDialog .v1325-journal-mode-row{display:none!important}

      @media(max-width:520px){
        #journalDetailDialog .sheet-head{padding-right:86px}
        #journalDetailDialog .v1325-look-strip-head{gap:6px!important}
        #journalDetailDialog .v1325-look-rating-label{display:none}
        #journalDetailDialog .v1325-look-rating #journalDetailRatingStars .journal-rating-star{width:20px!important;min-width:20px!important;font-size:.98rem!important}
        #journalDetailDialog .v1325-day-classifiers{gap:5px;padding:6px 7px;margin-bottom:12px}
        #journalDetailDialog .v1325-day-classifier-label{font-size:.56rem}
        #journalDetailDialog .v1325-day-classifiers #v1325JournalEra{width:122px!important;max-width:122px!important}
        #journalDetailDialog .v1325-journal-context-title .v1325-journal-edit-toggle{font-size:.65rem!important}
        #journalDetailDialog .v1325-journal-feature-row{justify-content:stretch}
        #journalDetailDialog #v1325JournalViewBtn{width:100%!important;min-height:40px!important;font-size:.73rem!important}
      }
    `;
    document.head.appendChild(style);
  }

  function findCloseButton(dialog){
    const candidates=[...dialog.querySelectorAll('button')];
    return candidates.find(btn=>{const text=(btn.textContent||'').trim(),aria=(btn.getAttribute('aria-label')||'').toLowerCase(),title=(btn.getAttribute('title')||'').toLowerCase();return text==='×'||text==='✕'||text==='✖'||aria==='close'||aria.includes('close')||title==='close'||title.includes('close');})||null;
  }

  function positionCornerControls(dialog){
    const head=dialog.querySelector('.sheet-head');if(!head)return;
    const favorite=dialog.querySelector('#journalDetailFavoriteBtn');let favSlot=head.querySelector('.v1325-detail-favorite-corner');
    if(favorite){if(!favSlot){favSlot=document.createElement('div');favSlot.className='v1325-detail-favorite-corner';head.appendChild(favSlot);}if(favorite.parentNode!==favSlot)favSlot.appendChild(favorite);}
    const close=findCloseButton(dialog);if(!close||favSlot?.contains(close))return;
    let closeSlot=head.querySelector('.v1325-wear-close-corner');if(!closeSlot){closeSlot=document.createElement('div');closeSlot.className='v1325-wear-close-corner';head.appendChild(closeSlot);}if(close.parentNode!==closeSlot)closeSlot.appendChild(close);
  }

  function moveLookToTop(dialog){const head=dialog.querySelector('.sheet-head'),look=dialog.querySelector('.v1325-look-strip-wrap');if(head&&look&&head.nextElementSibling!==look)head.after(look);}

  function bindRatingBehavior(dialog){
    dialog.querySelectorAll('#journalDetailRatingStars .journal-rating-star').forEach(btn=>{
      if(btn.dataset.v1325ClearBound==='1')return;btn.dataset.v1325ClearBound='1';const rating=Number(btn.dataset.rating||0);
      btn.onclick=async()=>{const entry=currentEntry();if(!entry||!rating)return;const current=ratingValue(entry);if(current===rating){entry.rating=0;entry.feel='';entry.updated=Date.now();await saveState();if(typeof refreshJournalDetailFeedback==='function')refreshJournalDetailFeedback(entry);if(typeof renderJournal==='function')renderJournal();if(typeof toast==='function')toast('Rating cleared');}else if(typeof saveJournalDetailRating==='function'){await saveJournalDetailRating(rating);}};
    });
  }

  function moveRatingToLook(dialog){
    const lookHead=dialog.querySelector('.v1325-look-strip-head'),stars=dialog.querySelector('#journalDetailRatingStars');if(!lookHead||!stars)return;
    lookHead.querySelector('small')?.remove();let slot=lookHead.querySelector('.v1325-look-rating');if(!slot){slot=document.createElement('div');slot.className='v1325-look-rating';slot.innerHTML='<span class="v1325-look-rating-label">Rate this look</span>';lookHead.appendChild(slot);}if(stars.parentNode!==slot)slot.appendChild(stars);bindRatingBehavior(dialog);
  }

  function buildDayClassifiers(dialog){
    const look=dialog.querySelector('.v1325-look-strip-wrap');if(!look)return;
    let strip=dialog.querySelector('.v1325-day-classifiers');if(!strip){strip=document.createElement('div');strip.className='v1325-day-classifiers';look.after(strip);}
    if(!strip.querySelector('.v1325-day-classifier-label')){const label=document.createElement('span');label.className='v1325-day-classifier-label';label.textContent='Chapter';strip.appendChild(label);}
    const eras=[...dialog.querySelectorAll('.v1325-journal-era-row')];const era=eras.find(row=>!strip.contains(row))||eras.find(row=>strip.contains(row));
    const colors=[...dialog.querySelectorAll('.v1325-day-color-wrap')];let color=colors.shift();colors.forEach(node=>node.remove());
    if(era&&era.parentNode!==strip)strip.appendChild(era);
    if(color&&color.parentNode!==strip)strip.appendChild(color);
  }

  function normalizeEditLabel(dialog){const edit=dialog.querySelector('#v1325JournalEditToggle'),sheet=dialog.querySelector('.v1325-journal-sheet');if(!edit)return;edit.textContent=sheet?.classList.contains('editing')?'Done':'Edit Journal';}

  function placeJournalActions(dialog){
    const title=dialog.querySelector('.v1325-journal-context-title');if(!title)return;
    const edit=dialog.querySelector('#v1325JournalEditToggle');if(edit&&edit.parentNode!==title)title.appendChild(edit);normalizeEditLabel(dialog);
    let feature=dialog.querySelector('.v1325-journal-feature-row');if(!feature){feature=document.createElement('div');feature.className='v1325-journal-feature-row';title.after(feature);}
    const view=dialog.querySelector('#v1325JournalViewBtn');if(view){view.textContent='View Journal';view.setAttribute('aria-label','View Journal');view.title='Open Journal View';view.classList.add('v1325-journal-view-launch');if(view.parentNode!==feature)feature.appendChild(view);}
  }

  function cleanOldToolbar(dialog){
    dialog.querySelectorAll('.v1325-journal-meta-toolbar').forEach(toolbar=>toolbar.remove());
    const mode=dialog.querySelector('.v1325-journal-mode-row');if(mode&&!mode.children.length)mode.remove();
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{installStyles();const dialog=document.querySelector('#journalDetailDialog');if(!dialog||!dialog.open)return;positionCornerControls(dialog);moveLookToTop(dialog);moveRatingToLook(dialog);buildDayClassifiers(dialog);placeJournalActions(dialog);cleanOldToolbar(dialog);}finally{syncing=false;}
  }

  function wrapOpenJournalDetail(){if(typeof openJournalDetail!=='function'||openJournalDetail.__wearLayout2Wrapped)return;const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(sync);setTimeout(sync,70);setTimeout(sync,180);return out;};openJournalDetail.__wearLayout2Wrapped=true;}

  document.addEventListener('click',event=>{if(event.target.closest?.('#v1325JournalEditToggle'))setTimeout(()=>{const dialog=document.querySelector('#journalDetailDialog');if(dialog)normalizeEditLabel(dialog);},0);});

  installStyles();wrapOpenJournalDetail();requestAnimationFrame(sync);setTimeout(sync,100);
  window.AudreyWearLogLayout2={version:VERSION,refresh:sync};
})();
