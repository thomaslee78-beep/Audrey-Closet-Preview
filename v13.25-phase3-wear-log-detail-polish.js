/* Audrey Closet v13.25 Phase 3 — Wear Log detail polish
 * Presentation + lightweight dayColor interaction overlay.
 * Repositions favorite and Journal View, restores a visible Rating label,
 * and replaces the native color circle with a compact curated palette.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325WearLogDetailPolishStyles';
  let syncing=false;

  const PALETTE={
    Neutrals:['#F7F3EB','#D8C9B5','#B9AA98','#7B6F63','#3E3935'],
    Pastels:['#F5C6D6','#F7D9A6','#D8E7B8','#B9DDEB','#CEC4F2'],
    Primary:['#E84A5F','#F4B400','#2F6BFF','#2E9E5B','#7A3FF2'],
    Neon:['#FF4FD8','#C7FF00','#00F5FF','#FF6B00','#9B5CFF']
  };

  function currentEntry(){return state.journal.find(j=>String(j.id)===String(viewingJournalId||''))||null;}
  function validColor(value){return /^#[0-9a-f]{6}$/i.test(String(value||''))?String(value):'';}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #journalDetailDialog .journal-detail-scroll{position:relative}
      #journalDetailDialog .sheet-head{position:relative;padding-right:48px}

      /* Favorite returns to the familiar upper-right card/dialog position. */
      #journalDetailDialog .v1325-detail-favorite-corner{position:absolute;right:4px;top:2px;z-index:12}
      #journalDetailDialog .v1325-detail-favorite-corner #journalDetailFavoriteBtn{
        width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;
        border:1px solid rgba(108,81,66,.18)!important;border-radius:50%!important;
        background:rgba(255,253,248,.96)!important;color:#a15352!important;
        box-shadow:0 3px 10px rgba(61,48,39,.08);font-size:0!important;line-height:34px!important
      }
      #journalDetailDialog .v1325-detail-favorite-corner #journalDetailFavoriteBtn:before{content:'♡';font-size:1.15rem}
      #journalDetailDialog .v1325-detail-favorite-corner #journalDetailFavoriteBtn.active:before{content:'♥'}
      #journalDetailDialog .v1325-meta-favorite{display:none!important}

      /* Top row now only carries Rating + Day Color + Era. */
      #journalDetailDialog .v1325-journal-meta-toolbar{overflow:visible!important;flex-wrap:wrap;gap:8px!important}
      #journalDetailDialog .v1325-meta-rate{display:flex!important;align-items:center;gap:6px!important}
      #journalDetailDialog .v1325-meta-rate .v1325-meta-label{display:inline!important;font-size:.68rem!important;font-weight:750!important;color:var(--coffee)!important}
      #journalDetailDialog .v1325-meta-journal-view{display:none!important}

      /* Day Color becomes a labeled button rather than a circle. */
      #journalDetailDialog .v1325-day-color-wrap{position:relative;flex:0 0 auto}
      #journalDetailDialog .v1325-day-color-btn{height:32px;display:flex;align-items:center;gap:7px;padding:0 9px;border:1px solid rgba(108,81,66,.18);border-radius:9px;background:#fffdf8;color:var(--coffee);font:inherit;font-size:.7rem;font-weight:700;white-space:nowrap}
      #journalDetailDialog .v1325-day-color-chip{width:18px;height:18px;border-radius:5px;background:var(--day-color,#eee6d8);box-shadow:inset 0 0 0 1px rgba(65,52,44,.12)}
      #journalDetailDialog .v1325-day-color-btn.empty .v1325-day-color-chip{background:linear-gradient(135deg,#f4eee5 0 48%,#d4c8b8 48% 52%,#f4eee5 52%)}
      #journalDetailDialog .v1325-color-popover{position:absolute;left:0;top:38px;z-index:80;width:min(285px,calc(100vw - 48px));padding:10px;border:1px solid rgba(108,81,66,.18);border-radius:14px;background:#fffaf1;box-shadow:0 14px 34px rgba(50,39,31,.20)}
      #journalDetailDialog .v1325-color-popover[hidden]{display:none!important}
      #journalDetailDialog .v1325-color-row{display:grid;grid-template-columns:56px repeat(5,1fr);gap:6px;align-items:center;margin:5px 0}
      #journalDetailDialog .v1325-color-row-label{font-size:.61rem;font-weight:750;color:var(--muted)}
      #journalDetailDialog .v1325-color-swatch{width:30px;height:28px;padding:0;border:2px solid transparent;border-radius:8px;background:var(--swatch);box-shadow:inset 0 0 0 1px rgba(50,40,34,.10)}
      #journalDetailDialog .v1325-color-swatch.selected{border-color:#6d5947;box-shadow:0 0 0 2px rgba(109,89,71,.10),inset 0 0 0 1px rgba(50,40,34,.10)}
      #journalDetailDialog .v1325-color-custom-row{display:flex;align-items:center;gap:8px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(108,81,66,.12)}
      #journalDetailDialog .v1325-color-reset{min-height:30px;padding:0 9px;border-radius:8px;border:1px solid rgba(108,81,66,.16);background:#fff;color:var(--coffee);font:inherit;font-size:.66rem;font-weight:700}
      #journalDetailDialog .v1325-color-custom-label{display:flex;align-items:center;gap:6px;margin-left:auto;font-size:.66rem;font-weight:700;color:var(--coffee)}
      #journalDetailDialog .v1325-color-custom-label input{width:34px;height:30px;padding:0;border:0;background:transparent}

      /* Journal View becomes an intentional companion action to Edit Journal. */
      #journalDetailDialog .v1325-journal-mode-row{display:flex!important;justify-content:flex-end!important;align-items:center!important;gap:8px!important;flex-wrap:wrap}
      #journalDetailDialog .v1325-journal-view-launch{width:auto!important;margin:0!important;min-height:34px!important;padding:7px 11px!important;border-radius:10px!important;display:inline-flex!important;align-items:center!important;gap:6px!important;background:#6f5d48!important;color:#fff!important;border:1px solid #6f5d48!important;box-shadow:0 3px 10px rgba(68,53,40,.13);font-size:.72rem!important;font-weight:750!important}
      #journalDetailDialog .v1325-journal-view-launch:before{content:'🔖';font-size:.92rem;line-height:1}
      #journalDetailDialog .v1325-journal-edit-toggle{min-height:34px!important;padding:7px 10px!important}

      @media(max-width:520px){
        #journalDetailDialog .v1325-journal-meta-toolbar{gap:6px!important;padding:6px!important}
        #journalDetailDialog .v1325-meta-rate .v1325-meta-label{display:inline!important;font-size:.64rem!important}
        #journalDetailDialog .v1325-day-color-btn{padding:0 7px;font-size:.66rem}
        #journalDetailDialog .v1325-color-popover{left:-72px;width:min(278px,calc(100vw - 34px))}
        #journalDetailDialog .v1325-color-row{grid-template-columns:50px repeat(5,1fr);gap:5px}
        #journalDetailDialog .v1325-color-swatch{width:28px;height:27px}
      }
    `;document.head.appendChild(style);
  }

  async function saveDayColor(color){
    const entry=currentEntry();if(!entry)return;
    const before=entry.dayColor;
    if(color)entry.dayColor=color;else delete entry.dayColor;
    entry.updated=Date.now();
    try{
      await saveState();
      if(typeof renderJournal==='function')renderJournal();
      window.AudreyJournalRowPolish2?.refresh?.();
      if(typeof toast==='function')toast(color?'Daily color saved':'Daily color removed');
    }catch(err){
      if(before)entry.dayColor=before;else delete entry.dayColor;
      console.error('[v13.25 wear log detail polish] color save failed',err);
      if(typeof toast==='function')toast('Could not update daily color');
    }
    syncDetail();
  }

  function buildPalette(wrap,entry){
    let pop=wrap.querySelector('.v1325-color-popover');
    if(pop)return pop;
    pop=document.createElement('div');pop.className='v1325-color-popover';pop.hidden=true;
    Object.entries(PALETTE).forEach(([label,colors])=>{
      const row=document.createElement('div');row.className='v1325-color-row';
      row.innerHTML=`<span class="v1325-color-row-label">${label}</span>`;
      colors.forEach(color=>{
        const btn=document.createElement('button');btn.type='button';btn.className='v1325-color-swatch';btn.style.setProperty('--swatch',color);btn.dataset.color=color;btn.setAttribute('aria-label',`${label} color ${color}`);
        btn.onclick=async event=>{event.preventDefault();event.stopPropagation();await saveDayColor(color);pop.hidden=true;};row.appendChild(btn);
      });
      pop.appendChild(row);
    });
    const custom=document.createElement('div');custom.className='v1325-color-custom-row';
    custom.innerHTML='<button type="button" class="v1325-color-reset">Remove color</button><label class="v1325-color-custom-label">Custom <input type="color" value="#7B6F63" aria-label="Choose custom daily color"></label>';
    custom.querySelector('.v1325-color-reset').onclick=async event=>{event.preventDefault();event.stopPropagation();await saveDayColor('');pop.hidden=true;};
    custom.querySelector('input').onchange=async event=>{await saveDayColor(event.target.value);pop.hidden=true;};
    pop.appendChild(custom);wrap.appendChild(pop);return pop;
  }

  function syncColorControl(toolbar,entry){
    toolbar.querySelector('.v1325-meta-color')?.remove();
    let wrap=toolbar.querySelector('.v1325-day-color-wrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.className='v1325-day-color-wrap';
      wrap.innerHTML='<button type="button" class="v1325-day-color-btn"><span class="v1325-day-color-chip"></span><span>Day color</span></button>';
      const eraSlot=toolbar.querySelector('.v1325-meta-era-slot');
      if(eraSlot)toolbar.insertBefore(wrap,eraSlot);else toolbar.appendChild(wrap);
      const button=wrap.querySelector('.v1325-day-color-btn');
      button.onclick=event=>{event.preventDefault();event.stopPropagation();const pop=buildPalette(wrap,currentEntry());pop.hidden=!pop.hidden;};
    }
    const color=validColor(entry?.dayColor),button=wrap.querySelector('.v1325-day-color-btn');
    button.style.setProperty('--day-color',color||'#eee6d8');button.classList.toggle('empty',!color);
    wrap.querySelectorAll('.v1325-color-swatch').forEach(btn=>btn.classList.toggle('selected',!!color&&btn.dataset.color.toLowerCase()===color.toLowerCase()));
  }

  function moveFavorite(dialog){
    const head=dialog.querySelector('.sheet-head'),favorite=dialog.querySelector('#journalDetailFavoriteBtn');if(!head||!favorite)return;
    let slot=head.querySelector('.v1325-detail-favorite-corner');if(!slot){slot=document.createElement('div');slot.className='v1325-detail-favorite-corner';head.appendChild(slot);}
    if(favorite.parentNode!==slot)slot.appendChild(favorite);
    dialog.querySelector('.v1325-meta-favorite')?.remove();
  }

  function syncRating(toolbar){
    const rate=toolbar.querySelector('.v1325-meta-rate');if(!rate)return;
    let label=rate.querySelector('.v1325-meta-label');if(!label){label=document.createElement('span');label.className='v1325-meta-label';rate.prepend(label);}label.textContent='Rating';
  }

  function moveJournalView(dialog){
    const view=dialog.querySelector('#v1325JournalViewBtn');if(!view)return;
    const modeRow=dialog.querySelector('.v1325-journal-mode-row');if(!modeRow)return;
    view.classList.add('v1325-journal-view-launch');view.textContent='Journal View';view.title='Open Journal View';
    if(view.parentNode!==modeRow)modeRow.prepend(view);
    dialog.querySelector('.v1325-meta-journal-view')?.remove();
  }

  function syncDetail(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const dialog=document.querySelector('#journalDetailDialog'),entry=currentEntry();if(!dialog||!entry)return;
      const toolbar=dialog.querySelector('.v1325-journal-meta-toolbar');if(!toolbar)return;
      moveFavorite(dialog);syncRating(toolbar);syncColorControl(toolbar,entry);moveJournalView(dialog);
    }finally{syncing=false;}
  }

  function wrapOpenJournalDetail(){
    if(typeof openJournalDetail!=='function'||openJournalDetail.__wearDetailPolishWrapped)return;
    const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(syncDetail);setTimeout(syncDetail,60);setTimeout(syncDetail,160);return out;};openJournalDetail.__wearDetailPolishWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(!event.target.closest?.('.v1325-day-color-wrap'))document.querySelectorAll('.v1325-color-popover').forEach(p=>p.hidden=true);
  },true);

  installStyles();wrapOpenJournalDetail();requestAnimationFrame(syncDetail);setTimeout(syncDetail,80);
  window.AudreyWearLogDetailPolish={version:VERSION,refresh:syncDetail};
})();
