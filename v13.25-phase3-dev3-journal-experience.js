/* Audrey Closet v13.25 Phase 3 dev3 — Journal browsing + reader experience
 * Preview-first visual pass: compact outfit strip, context-forward browsing,
 * auto-open Journal, and a read-only diary-style Journal View.
 */
(function(){
  'use strict';

  const VERSION=3;
  const STYLE_ID='v1325Phase3Dev3JournalStyles';
  const READER_ID='v1325JournalReaderDialog';
  let editRequestedForId='';

  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function stripHtml(html){const box=document.createElement('div');box.innerHTML=String(html||'');return (box.innerText||box.textContent||'').replace(/\s+/g,' ').trim();}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id))||null;}
  function currentEntry(){return entryById(viewingJournalId);}
  function itemLabel(item){
    if(!item)return 'Closet item';
    let type='';try{type=typeof displayItemType==='function'?displayItemType(item):item.type;}catch{type=item.type;}
    return type||item.category||'Closet item';
  }
  function eraFor(entry){
    const ids=Array.isArray(entry?.eraIds)?entry.eraIds:[];
    const eras=Array.isArray(state.eras)?state.eras:[];
    return eras.find(e=>ids.includes(e.id)&&(e.kind||'personal')==='personal')||null;
  }
  function contextOf(entry){
    const c=entry?.context&&typeof entry.context==='object'?entry.context:{};
    return {location:c.location||entry?.location||'',weather:c.weather||entry?.weather||'',temperature:c.temperature??entry?.temperature??'',temperatureUnit:c.temperatureUnit||entry?.temperatureUnit||'F',occasion:c.occasion||entry?.occasion||''};
  }
  function weatherIcon(value){return ({sunny:'☀️','partly-cloudy':'🌤️',cloudy:'☁️',rainy:'🌧️',windy:'💨',foggy:'🌫️',hot:'☀️',cold:'❄️',snowy:'🌨️'})[value]||'☁️';}
  function weatherLabel(value){return ({sunny:'Sunny','partly-cloudy':'Partly cloudy',cloudy:'Cloudy',rainy:'Rainy',windy:'Windy',foggy:'Foggy',hot:'Hot',cold:'Cold',snowy:'Snowy'})[value]||value||'';}
  function occasionLabel(value){return ({school:'School',everyday:'Everyday',weekend:'Weekend',sports:'Sports','party-event':'Party / Event',travel:'Travel','dinner-going-out':'Dinner / Going out',other:'Other'})[value]||value||'';}
  function contextBits(entry,{includeEra=true}={}){
    const bits=[],ctx=contextOf(entry),era=eraFor(entry);
    if(includeEra&&era)bits.push({text:`🕰️ ${era.name}`,era:true});
    if(ctx.weather)bits.push({text:`${weatherIcon(ctx.weather)} ${weatherLabel(ctx.weather)}`});
    if(ctx.temperature!==''&&ctx.temperature!=null)bits.push({text:`🌡️ ${ctx.temperature}°${ctx.temperatureUnit||'F'}`});
    if(ctx.location)bits.push({text:`📍 ${ctx.location}`});
    if(ctx.occasion)bits.push({text:`✦ ${occasionLabel(ctx.occasion)}`});
    return bits;
  }
  function formatDate(entry){
    try{return new Date(`${entry.date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}catch{return entry.date||'Journal day';}
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      /* Browsing cards */
      .journal-row .v1325-browse-context{display:flex;gap:5px;overflow:hidden;margin-top:5px;max-width:100%}
      .journal-row .v1325-browse-chip{flex:0 0 auto;max-width:128px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(108,81,66,.12);border-radius:999px;background:rgba(255,252,244,.78);padding:3px 7px;font-size:.64rem;color:var(--coffee)}
      .journal-row .v1325-browse-chip.era{background:rgba(244,235,205,.88);border-color:rgba(132,105,56,.20)}
      .journal-row .v1325-browse-excerpt{display:block;margin-top:4px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);font-size:.69rem}
      .journal-row .v1325-browse-photo{width:42px;height:42px;object-fit:cover;border-radius:10px;flex:0 0 42px;box-shadow:0 2px 8px rgba(61,48,39,.12)}

      /* Journal detail hierarchy */
      #journalDetailDialog .v1325-journal-view-launch{width:100%;margin:6px 0 12px;display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;border-radius:14px}
      #journalDetailDialog .v1325-look-strip-wrap{margin:2px 0 12px}
      #journalDetailDialog .v1325-look-strip-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 2px 7px}
      #journalDetailDialog .v1325-look-strip-head strong{font-family:var(--serif);font-size:.98rem;font-weight:650}
      #journalDetailDialog .v1325-look-strip-head small{font-size:.7rem;color:var(--muted)}
      #journalDetailDialog #journalDetailItems.v1325-look-strip{display:flex;gap:9px;overflow-x:auto;padding:2px 2px 8px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      #journalDetailDialog #journalDetailItems.v1325-look-strip::-webkit-scrollbar{display:none}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item{flex:0 0 86px;display:flex;flex-direction:column;align-items:stretch;gap:5px;padding:6px;border:1px solid rgba(108,81,66,.13);border-radius:14px;background:rgba(255,252,244,.82);text-align:left;scroll-snap-align:start;box-shadow:0 3px 11px rgba(64,51,41,.05)}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>img,#journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>.wear-placeholder{width:100%;height:76px;object-fit:cover;border-radius:10px;background:#efe8dc}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>div:last-child{min-width:0}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item strong{display:block;font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item small{display:block;font-size:.62rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);margin-top:1px}
      #journalDetailDialog .journal-notes-toggle{display:none!important}
      #journalDetailDialog .journal-notes-body{display:block!important;padding-top:0!important}
      #journalDetailDialog .v1325-journal-mode-row{display:flex;justify-content:flex-end;margin:0 0 8px}
      #journalDetailDialog .v1325-journal-edit-toggle{border:1px solid rgba(108,81,66,.16);border-radius:999px;background:rgba(255,252,244,.86);color:var(--coffee);padding:7px 10px;font:inherit;font-size:.72rem;font-weight:650}
      #journalDetailDialog .v1325-journal-context-grid,#journalDetailDialog .v1325-journal-toolbar,#journalDetailDialog .v1325-journal-save-row{transition:.18s ease}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-grid,#journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-toolbar,#journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-save-row{display:none!important}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-editor{border-color:transparent;background:transparent;padding:6px 1px 8px;min-height:0;outline:0}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-editor:empty:before{content:'No journal entry yet.'}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-photo-add,#journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-photo button{display:none!important}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-title small{display:none}

      /* Read-only diary */
      #${READER_ID}{width:min(720px,calc(100vw - 18px));max-width:720px;height:min(92dvh,900px);max-height:92dvh;border:0;border-radius:24px;padding:0;background:#f8f1e4;color:#51453c;box-shadow:0 24px 80px rgba(34,28,23,.34)}
      #${READER_ID}::backdrop{background:rgba(35,30,26,.48);backdrop-filter:blur(3px)}
      .v1325-reader-scroll{height:100%;overflow:auto;-webkit-overflow-scrolling:touch;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.7),transparent 26%),linear-gradient(180deg,#fbf6ec,#f4ead9)}
      .v1325-reader-page{position:relative;min-height:100%;padding:22px 20px 32px;background-image:linear-gradient(rgba(116,94,74,.045) 1px,transparent 1px);background-size:100% 28px}
      .v1325-reader-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
      .v1325-reader-kicker{font-family:var(--script);font-size:1.18rem;color:var(--olive-dark);margin-bottom:3px}.v1325-reader-date{font-family:var(--serif);font-size:1.65rem;line-height:1.08;font-weight:500;margin:0}
      .v1325-reader-close{width:38px;height:38px;border:1px solid rgba(88,70,57,.16);border-radius:50%;background:rgba(255,255,255,.58);font-size:22px;color:var(--coffee)}
      .v1325-reader-chips{display:flex;gap:6px;overflow-x:auto;padding:0 0 9px;margin-bottom:10px;scrollbar-width:none}.v1325-reader-chips::-webkit-scrollbar{display:none}
      .v1325-reader-chip{flex:0 0 auto;border:1px solid rgba(108,81,66,.13);border-radius:999px;background:rgba(255,255,255,.54);padding:6px 9px;font-size:.72rem;white-space:nowrap}.v1325-reader-chip.era{background:rgba(244,235,205,.86)}
      .v1325-reader-section{margin:17px 0 0}.v1325-reader-section-title{font-family:var(--serif);font-size:1.02rem;font-weight:650;margin:0 0 8px}
      .v1325-reader-look{display:flex;gap:8px;overflow-x:auto;padding:2px 1px 8px;scrollbar-width:none}.v1325-reader-look::-webkit-scrollbar{display:none}
      .v1325-reader-look-card{flex:0 0 102px;background:rgba(255,255,255,.48);border:1px solid rgba(108,81,66,.12);border-radius:14px;padding:6px}.v1325-reader-look-card img,.v1325-reader-look-ph{width:100%;height:94px;object-fit:cover;border-radius:10px;background:#e9dfcf}.v1325-reader-look-card strong{display:block;margin-top:5px;font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v1325-reader-look-card small{display:block;font-size:.62rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .v1325-reader-photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v1325-reader-photos img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:14px;box-shadow:0 3px 12px rgba(66,51,39,.10)}
      .v1325-reader-writing{font-size:1rem;line-height:1.72;padding:10px 2px 4px;overflow-wrap:anywhere}.v1325-reader-writing.empty{color:var(--muted);font-style:italic}
      .v1325-reader-actions{display:flex;gap:9px;margin-top:22px;padding-top:15px;border-top:1px solid rgba(108,81,66,.12)}.v1325-reader-actions button{flex:1;min-height:42px}
      @media(max-width:520px){#${READER_ID}{width:calc(100vw - 10px);height:calc(100dvh - 12px);max-height:calc(100dvh - 12px);border-radius:20px}.v1325-reader-page{padding:18px 15px 28px}.v1325-reader-date{font-size:1.45rem}.v1325-reader-look-card{flex-basis:94px}.v1325-reader-look-card img,.v1325-reader-look-ph{height:86px}}
    `;document.head.appendChild(style);
  }

  function enhanceBrowseRow(row,entry){
    if(!row||!entry)return;
    row.querySelector('.v1325-browse-context')?.remove();
    row.querySelector('.v1325-browse-excerpt')?.remove();
    row.querySelector('.v1325-browse-photo')?.remove();
    const copy=row.querySelector('.journal-row-copy');
    if(copy){
      const bits=contextBits(entry).slice(0,3);
      if(bits.length){const strip=document.createElement('div');strip.className='v1325-browse-context';strip.innerHTML=bits.map(bit=>`<span class="v1325-browse-chip${bit.era?' era':''}">${esc(bit.text)}</span>`).join('');copy.appendChild(strip);}
      const excerpt=stripHtml(entry.journalHtml||entry.notes||'');
      if(excerpt){const small=document.createElement('span');small.className='v1325-browse-excerpt';small.textContent=excerpt;copy.appendChild(small);}
    }
    const photo=Array.isArray(entry.journalPhotos)?entry.journalPhotos[0]:'';
    const main=row.querySelector('.journal-row-main');
    if(photo&&main){const img=document.createElement('img');img.className='v1325-browse-photo';img.src=photo;img.alt='Journal day photo';main.appendChild(img);}
  }
  function enhanceJournalBrowse(){
    document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>enhanceBrowseRow(row,entryById(row.dataset.journalId)));
  }

  function setDetailEditMode(editing){
    const sheet=document.querySelector('#journalDetailDialog .v1325-journal-sheet');if(!sheet)return;
    sheet.classList.toggle('editing',!!editing);
    const editor=sheet.querySelector('#v1325JournalEditor');if(editor)editor.setAttribute('contenteditable',editing?'true':'false');
    const toggle=document.querySelector('#v1325JournalEditToggle');if(toggle)toggle.textContent=editing?'Done editing':'Edit context & journal';
  }
  function compactDetail(entry){
    const dialog=document.querySelector('#journalDetailDialog'),items=document.querySelector('#journalDetailItems'),panel=document.querySelector('#journalDetailNotesPanel');
    if(!dialog||!items||!panel||!entry)return;
    let wrap=dialog.querySelector('.v1325-look-strip-wrap');
    if(!wrap){wrap=document.createElement('section');wrap.className='v1325-look-strip-wrap';wrap.innerHTML='<div class="v1325-look-strip-head"><strong>Today’s look</strong><small>tap a piece for details</small></div>';panel.parentNode.insertBefore(wrap,panel);wrap.appendChild(items);}
    items.classList.add('v1325-look-strip');
    let launch=dialog.querySelector('#v1325JournalViewBtn');
    if(!launch){launch=document.createElement('button');launch.type='button';launch.id='v1325JournalViewBtn';launch.className='soft-btn v1325-journal-view-launch';launch.innerHTML='<span aria-hidden="true">📖</span> Journal View';wrap.parentNode.insertBefore(launch,wrap);launch.onclick=()=>openReader(entry.id);}
    if(typeof setJournalDetailNotesExpanded==='function')setJournalDetailNotesExpanded(true);
    panel.querySelector('.v1325-journal-mode-row')?.remove();
    const mode=document.createElement('div');mode.className='v1325-journal-mode-row';mode.innerHTML='<button type="button" class="v1325-journal-edit-toggle" id="v1325JournalEditToggle">Edit context & journal</button>';
    const body=panel.querySelector('#journalDetailNotesBody');if(body)body.insertBefore(mode,body.firstChild);
    mode.querySelector('button').onclick=()=>setDetailEditMode(!panel.querySelector('.v1325-journal-sheet')?.classList.contains('editing'));
    const shouldEdit=editRequestedForId===String(entry.id);editRequestedForId='';setDetailEditMode(shouldEdit);
  }

  function ensureReader(){
    let dialog=document.getElementById(READER_ID);if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.id=READER_ID;dialog.innerHTML='<div class="v1325-reader-scroll"><article class="v1325-reader-page" id="v1325JournalReaderPage"></article></div>';
    document.body.appendChild(dialog);
    dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});
    return dialog;
  }
  function readerHtml(entry){
    const items=(entry.itemIds||[]).map(id=>state.items.find(item=>item.id===id)).filter(Boolean);
    const photos=Array.isArray(entry.journalPhotos)?entry.journalPhotos.filter(Boolean):[];
    const bits=contextBits(entry);
    const writing=entry.journalHtml||esc(entry.notes||'').replace(/\n/g,'<br>');
    const era=eraFor(entry);
    return `<div class="v1325-reader-top"><div><div class="v1325-reader-kicker">${era?esc(era.name):'the story of what you wore'}</div><h2 class="v1325-reader-date">${esc(formatDate(entry))}</h2></div><button type="button" class="v1325-reader-close" id="v1325ReaderCloseBtn" aria-label="Close">×</button></div>
      ${bits.length?`<div class="v1325-reader-chips">${bits.map(bit=>`<span class="v1325-reader-chip${bit.era?' era':''}">${esc(bit.text)}</span>`).join('')}</div>`:''}
      <section class="v1325-reader-section"><h3 class="v1325-reader-section-title">Today’s look</h3><div class="v1325-reader-look">${items.length?items.map(item=>`<div class="v1325-reader-look-card">${item.photo?`<img src="${item.photo}" alt="${esc(itemLabel(item))}">`:'<div class="v1325-reader-look-ph"></div>'}<strong>${esc(itemLabel(item))}</strong><small>${esc([item.color,item.brand].filter(Boolean).join(' · ')||item.category||'')}</small></div>`).join(''):'<div class="v1325-reader-writing empty">No closet pieces are linked to this day.</div>'}</div></section>
      ${photos.length?`<section class="v1325-reader-section"><h3 class="v1325-reader-section-title">Moments from the day</h3><div class="v1325-reader-photos">${photos.map((src,i)=>`<img src="${src}" alt="Day photo ${i+1}">`).join('')}</div></section>`:''}
      <section class="v1325-reader-section"><h3 class="v1325-reader-section-title">Journal</h3><div class="v1325-reader-writing${writing?'':' empty'}">${writing||'No written memory yet.'}</div></section>
      <div class="v1325-reader-actions"><button type="button" class="soft-btn" id="v1325ReaderBackBtn">Back</button><button type="button" class="primary" id="v1325ReaderEditBtn">Edit context & journal</button></div>`;
  }
  function openReader(id){
    const entry=entryById(id);if(!entry)return;
    const detail=document.querySelector('#journalDetailDialog');if(detail?.open&&typeof closeJournalDetail==='function')closeJournalDetail();
    const dialog=ensureReader(),page=dialog.querySelector('#v1325JournalReaderPage');page.innerHTML=readerHtml(entry);
    page.querySelector('#v1325ReaderCloseBtn').onclick=()=>dialog.close();
    page.querySelector('#v1325ReaderBackBtn').onclick=()=>{dialog.close();setTimeout(()=>openJournalDetail(entry.id),0);};
    page.querySelector('#v1325ReaderEditBtn').onclick=()=>{dialog.close();editRequestedForId=String(entry.id);setTimeout(()=>openJournalDetail(entry.id),0);};
    dialog.showModal();
  }

  installStyles();

  const open0=openJournalDetail;
  openJournalDetail=function(jid){
    const out=open0.apply(this,arguments);
    requestAnimationFrame(()=>compactDetail(entryById(jid)));
    setTimeout(()=>compactDetail(entryById(jid)),0);
    return out;
  };

  const render0=renderJournal;
  renderJournal=function(){const out=render0.apply(this,arguments);requestAnimationFrame(enhanceJournalBrowse);return out;};

  enhanceJournalBrowse();
  window.AudreyJournalExperienceDev3={version:VERSION,refreshBrowse:enhanceJournalBrowse,openReader,editEntry:id=>{editRequestedForId=String(id);openJournalDetail(id);}};
})();
