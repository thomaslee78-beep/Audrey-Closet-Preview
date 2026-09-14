/* Audrey Closet v13.25 Phase 3 — Wear Log detail layout pass 2
 * Presentation/interaction orchestration layered after the existing detail toolbar/palette.
 * v1.1 keeps one Day Color beside Era, normalizes Edit Journal labels, and lets
 * the selected rating star clear the rating while preserving normal save feedback.
 */
(function(){
  'use strict';

  const VERSION='1.1';
  const STYLE_ID='v1325WearLogLayout2Styles';
  let syncing=false;

  function currentEntry(){return state.journal.find(j=>String(j.id)===String(viewingJournalId||''))||null;}
  function ratingValue(entry){
    const n=Number(entry?.rating||0);if(n>=1&&n<=5)return n;
    return ({'Would change it':1,'Just okay':3,'Felt good':4,'Loved it':5})[entry?.feel]||0;
  }

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

      #journalDetailDialog .v1325-look-strip-wrap{margin:4px 0 10px!important;padding-top:0!important}
      #journalDetailDialog .v1325-look-strip-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 2px 7px!important}
      #journalDetailDialog .v1325-look-strip-head small{display:none!important}
      #journalDetailDialog .v1325-look-rating{display:flex;align-items:center;gap:4px;margin-left:auto}
      #journalDetailDialog .v1325-look-rating-label{font-size:.66rem;font-weight:700;color:var(--muted);white-space:nowrap}
      #journalDetailDialog .v1325-look-rating #journalDetailRatingStars{display:flex!important;align-items:center!important;gap:0!important}
      #journalDetailDialog .v1325-look-rating #journalDetailRatingStars .journal-rating-star{width:22px!important;min-width:22px!important;height:28px!important;padding:0!important;border:0!important;background:transparent!important;font-size:1.04rem!important;color:#9b7442!important}

      #journalDetailDialog .v1325-meta-rate{display:none!important}
      #journalDetailDialog .v1325-journal-meta-toolbar{margin:0 0 8px!important;padding:0!important;border:0!important;background:transparent!important;min-height:0!important}
      #journalDetailDialog .v1325-journal-meta-toolbar:empty{display:none!important}

      /* Remember this day + color + Chapter/Era share one compact heading row. */
      #journalDetailDialog .v1325-journal-context-title{display:flex!important;align-items:center!important;gap:7px!important;margin-bottom:10px!important}
      #journalDetailDialog .v1325-journal-context-title>strong{flex:0 0 auto}
      #journalDetailDialog .v1325-journal-context-title>small{display:none!important}
      #journalDetailDialog .v1325-journal-context-title .v1325-day-color-wrap{margin-left:auto!important;flex:0 0 auto!important}
      #journalDetailDialog .v1325-journal-context-title .v1325-journal-era-row{display:flex!important;align-items:center!important;gap:4px!important;margin-left:0!important;min-width:0!important}
      #journalDetailDialog .v1325-journal-context-title #v1325JournalEra{width:132px!important;max-width:132px!important;height:31px!important;padding:0 7px!important;border-radius:9px!important;font-size:.7rem!important}
      #journalDetailDialog .v1325-journal-context-title #v1325JournalNewEraBtn{width:31px!important;height:31px!important;min-width:31px!important;padding:0!important;border-radius:9px!important;font-size:0!important}
      #journalDetailDialog .v1325-journal-context-title #v1325JournalNewEraBtn:after{content:'+';font-size:1rem}

      /* Journal action row now contains only Edit + View. */
      #journalDetailDialog .v1325-journal-mode-row{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;flex-wrap:wrap!important;margin:0 0 9px!important}
      #journalDetailDialog .v1325-journal-mode-row .v1325-journal-edit-toggle{order:1}
      #journalDetailDialog .v1325-journal-mode-row #v1325JournalViewBtn{order:2}
      #journalDetailDialog .v1325-journal-edit-toggle{min-height:34px!important;padding:7px 10px!important}
      #journalDetailDialog #v1325JournalViewBtn{width:auto!important;height:auto!important;min-width:0!important;min-height:34px!important;margin:0!important;padding:7px 11px!important;border-radius:10px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;font-size:.72rem!important;font-weight:750!important;line-height:1!important}
      #journalDetailDialog #v1325JournalViewBtn:before,#journalDetailDialog .v1325-journal-view-launch:before{content:none!important}

      @media(max-width:520px){
        #journalDetailDialog .sheet-head{padding-right:86px}
        #journalDetailDialog .v1325-look-strip-head{gap:6px!important}
        #journalDetailDialog .v1325-look-rating-label{display:none}
        #journalDetailDialog .v1325-look-rating #journalDetailRatingStars .journal-rating-star{width:20px!important;min-width:20px!important;font-size:.98rem!important}
        #journalDetailDialog .v1325-journal-context-title{align-items:center!important;flex-wrap:wrap!important}
        #journalDetailDialog .v1325-journal-context-title>strong{margin-right:auto}
        #journalDetailDialog .v1325-journal-context-title .v1325-day-color-wrap{margin-left:0!important}
        #journalDetailDialog .v1325-journal-context-title .v1325-journal-era-row{margin-left:0!important;flex:0 1 auto!important}
        #journalDetailDialog .v1325-journal-context-title #v1325JournalEra{width:112px!important;max-width:112px!important}
        #journalDetailDialog .v1325-journal-mode-row{justify-content:flex-start!important;gap:6px!important}
        #journalDetailDialog .v1325-journal-edit-toggle,#journalDetailDialog #v1325JournalViewBtn{font-size:.68rem!important}
      }
    `;
    document.head.appendChild(style);
  }

  function findCloseButton(dialog){
    const candidates=[...dialog.querySelectorAll('button')];
    return candidates.find(btn=>{
      const text=(btn.textContent||'').trim(),aria=(btn.getAttribute('aria-label')||'').toLowerCase(),title=(btn.getAttribute('title')||'').toLowerCase();
      return text==='×'||text==='✕'||text==='✖'||aria==='close'||aria.includes('close')||title==='close'||title.includes('close');
    })||null;
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
    const stars=dialog.querySelectorAll('#journalDetailRatingStars .journal-rating-star');
    stars.forEach(btn=>{
      if(btn.dataset.v1325ClearBound==='1')return;
      btn.dataset.v1325ClearBound='1';
      const rating=Number(btn.dataset.rating||0);
      btn.onclick=async()=>{
        const entry=currentEntry();if(!entry||!rating)return;
        const current=ratingValue(entry);
        if(current===rating){
          entry.rating=0;entry.feel='';entry.updated=Date.now();
          await saveState();
          if(typeof refreshJournalDetailFeedback==='function')refreshJournalDetailFeedback(entry);
          if(typeof renderJournal==='function')renderJournal();
          if(typeof toast==='function')toast('Rating cleared');
        }else if(typeof saveJournalDetailRating==='function'){
          await saveJournalDetailRating(rating); // baseline already shows the brief saved confirmation
        }
      };
    });
  }

  function moveRatingToLook(dialog){
    const lookHead=dialog.querySelector('.v1325-look-strip-head'),stars=dialog.querySelector('#journalDetailRatingStars');if(!lookHead||!stars)return;
    lookHead.querySelector('small')?.remove();
    let slot=lookHead.querySelector('.v1325-look-rating');if(!slot){slot=document.createElement('div');slot.className='v1325-look-rating';slot.innerHTML='<span class="v1325-look-rating-label">Rate this look</span>';lookHead.appendChild(slot);}if(stars.parentNode!==slot)slot.appendChild(stars);
    bindRatingBehavior(dialog);
  }

  function moveContextControls(dialog){
    const title=dialog.querySelector('.v1325-journal-context-title');if(!title)return;
    const rows=[...dialog.querySelectorAll('.v1325-journal-era-row')];const era=rows.find(row=>!title.contains(row))||rows.find(row=>title.contains(row));
    const colors=[...dialog.querySelectorAll('.v1325-day-color-wrap')];let color=colors.shift();colors.forEach(node=>node.remove());
    if(color&&color.parentNode!==title){if(era)title.insertBefore(color,era);else title.appendChild(color);}
    if(era&&era.parentNode!==title)title.appendChild(era);
  }

  function normalizeEditLabel(dialog){
    const edit=dialog.querySelector('#v1325JournalEditToggle'),sheet=dialog.querySelector('.v1325-journal-sheet');if(!edit)return;
    edit.textContent=sheet?.classList.contains('editing')?'Done editing':'Edit Journal';
  }

  function moveActionControls(dialog){
    const mode=dialog.querySelector('.v1325-journal-mode-row');if(!mode)return;
    const edit=dialog.querySelector('#v1325JournalEditToggle');if(edit&&edit.parentNode!==mode)mode.appendChild(edit);
    normalizeEditLabel(dialog);
    const view=dialog.querySelector('#v1325JournalViewBtn');if(view){view.textContent='View Journal';view.setAttribute('aria-label','View Journal');view.title='View Journal';if(view.parentNode!==mode)mode.appendChild(view);}
  }

  function cleanOldToolbar(dialog){
    const toolbar=dialog.querySelector('.v1325-journal-meta-toolbar');if(!toolbar)return;
    toolbar.querySelector('.v1325-meta-rate')?.remove();toolbar.querySelector('.v1325-meta-era-slot')?.remove();toolbar.querySelector('.v1325-meta-journal-view')?.remove();toolbar.querySelector('.v1325-meta-favorite')?.remove();
    if(!toolbar.children.length)toolbar.remove();
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{
      installStyles();const dialog=document.querySelector('#journalDetailDialog');if(!dialog||!dialog.open)return;
      positionCornerControls(dialog);moveLookToTop(dialog);moveRatingToLook(dialog);moveContextControls(dialog);moveActionControls(dialog);cleanOldToolbar(dialog);
    }finally{syncing=false;}
  }

  function wrapOpenJournalDetail(){if(typeof openJournalDetail!=='function'||openJournalDetail.__wearLayout2Wrapped)return;const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(sync);setTimeout(sync,70);setTimeout(sync,180);return out;};openJournalDetail.__wearLayout2Wrapped=true;}

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle'))setTimeout(()=>{const dialog=document.querySelector('#journalDetailDialog');if(dialog){normalizeEditLabel(dialog);moveContextControls(dialog);}},0);
  });

  installStyles();wrapOpenJournalDetail();requestAnimationFrame(sync);setTimeout(sync,100);
  window.AudreyWearLogLayout2={version:VERSION,refresh:sync};
})();
