/* Audrey Closet v13.25 Phase 3 — Journal title + simplified log
 * Backward-compatible presentation/data overlay. Adds an optional journalTitle
 * and journalTitleCustom flag, auto-suggests titles from saved/draft context,
 * and simplifies Journal browse rows to date + worn pieces + rating/favorite/title.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalTitleLogStyles';
  const TITLE_FIELD_ID='v1325JournalTitle';
  const drafts=new Map();
  let journalSaveIntent=false;

  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}
  function currentEntry(){return entryById(viewingJournalId||window.AudreyContextualJournal?.entry?.()?.id);}
  function eraFor(entry,overrideId=''){
    const eras=Array.isArray(state.eras)?state.eras:[];
    if(overrideId)return eras.find(e=>String(e.id)===String(overrideId))||null;
    const ids=Array.isArray(entry?.eraIds)?entry.eraIds:[];
    return eras.find(e=>ids.includes(e.id)&&(e.kind||'personal')==='personal')||null;
  }
  function contextOf(entry){
    const c=entry?.context&&typeof entry.context==='object'?entry.context:{};
    return {location:String(c.location||entry?.location||''),weather:String(c.weather||entry?.weather||''),temperature:c.temperature??entry?.temperature??'',temperatureUnit:String(c.temperatureUnit||entry?.temperatureUnit||'F'),occasion:String(c.occasion||entry?.occasion||'')};
  }
  function liveContext(entry){
    const saved=contextOf(entry),temp=document.querySelector('#v1325JournalTemperature')?.value;
    return {
      location:document.querySelector('#v1325JournalLocation')?.value?.trim()??saved.location,
      weather:document.querySelector('#v1325JournalWeather')?.value??saved.weather,
      temperature:temp!==undefined&&temp!==''?Number(temp):(temp===''?'':saved.temperature),
      temperatureUnit:document.querySelector('#v1325JournalTemperatureUnit')?.value||saved.temperatureUnit||'F',
      occasion:document.querySelector('#v1325JournalOccasion')?.value??saved.occasion
    };
  }
  function weatherPhrase(ctx){
    const weather=String(ctx?.weather||'');
    const labels={hot:'Hot day',cold:'Cold day',sunny:'Sunny day','partly-cloudy':'Partly cloudy day',cloudy:'Cloudy day',rainy:'Rainy day',windy:'Windy day',foggy:'Foggy day',snowy:'Snowy day'};
    if(labels[weather])return labels[weather];
    const n=Number(ctx?.temperature);
    if(Number.isFinite(n)){
      const f=(ctx?.temperatureUnit==='C')?(n*9/5+32):n;
      if(f>=85)return 'Hot day';
      if(f<=50)return 'Cold day';
    }
    return '';
  }
  function occasionPhrase(value){return ({school:'School day',everyday:'Everyday',weekend:'Weekend',sports:'Game day','party-event':'Party',travel:'Travel day','dinner-going-out':'Night out',other:'A day to remember'})[value]||'';}
  function generatedTitle(entry,{live=false}={}){
    const ctx=live?liveContext(entry):contextOf(entry);
    const eraId=live?document.querySelector('#v1325JournalEra')?.value||'':'';
    const era=eraFor(entry,eraId)?.name?.trim()||'';
    const weather=weatherPhrase(ctx),occasion=occasionPhrase(ctx.occasion),location=String(ctx.location||'').trim();

    if(era&&ctx.occasion==='party-event')return `${era} Party`;
    if(weather&&era)return `${weather} in ${era}`;
    if(era&&ctx.occasion==='school')return /school/i.test(era)?`${era} Day`:`${era} School Day`;
    if(era&&occasion&&occasion!=='Everyday')return `${era} ${occasion}`;
    if(weather&&location)return `${weather} in ${location}`;
    if(occasion&&location&&occasion!=='Everyday')return `${occasion} in ${location}`;
    if(era)return era;
    if(occasion)return occasion;
    if(weather)return weather;
    if(location)return `A day in ${location}`;
    return 'A day to remember';
  }
  function storedTitle(entry){return String(entry?.journalTitle||'').trim();}
  function draftFor(entry){
    if(!entry)return {value:'',custom:false};
    const id=String(entry.id||'');
    if(drafts.has(id))return drafts.get(id);
    const custom=entry.journalTitleCustom===true;
    const value=custom&&storedTitle(entry)?storedTitle(entry):(storedTitle(entry)||generatedTitle(entry,{live:true}));
    const draft={value,custom};drafts.set(id,draft);return draft;
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      .v1325-journal-title-field{margin:0 0 10px}
      .v1325-journal-title-field label{display:block;margin:0 0 5px;color:var(--muted);font-size:.7rem;font-weight:650;letter-spacing:.02em}
      .v1325-journal-title-input{width:100%;box-sizing:border-box;border:1px solid rgba(108,81,66,.18);border-radius:12px;background:#fffdf8;padding:10px 11px;color:var(--coffee);font:600 1rem/1.2 var(--serif);outline:none}
      .v1325-journal-title-input:focus{border-color:rgba(102,113,90,.48);box-shadow:0 0 0 3px rgba(102,113,90,.08)}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-title-field label{display:none}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-title-field{margin:1px 0 9px}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-title-input{pointer-events:none;border:0;background:transparent;padding:2px 1px;box-shadow:none;font-size:1.08rem}

      /* Simplified horizontal Journal rows. */
      .journal-row.v1325-simple-log-row{padding:0!important;overflow:hidden}
      .journal-row.v1325-simple-log-row>*:not(.v1325-simple-log){display:none!important}
      .v1325-simple-log{display:grid;grid-template-columns:58px minmax(92px,auto) minmax(0,1fr);gap:10px;align-items:center;width:100%;box-sizing:border-box;padding:9px 10px;text-align:left;cursor:pointer}
      .v1325-simple-date{width:54px;border:1px solid rgba(108,81,66,.15);border-radius:11px;overflow:hidden;background:rgba(255,253,248,.9);text-align:center;box-shadow:0 2px 8px rgba(61,48,39,.05)}
      .v1325-simple-date-month{display:block;padding:3px 2px 2px;background:rgba(102,113,90,.10);font-size:.58rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase;color:var(--olive-dark)}
      .v1325-simple-date-day{display:block;padding:2px 2px 0;font-family:var(--serif);font-size:1.3rem;line-height:1;font-weight:650;color:var(--coffee)}
      .v1325-simple-date-year{display:block;padding:1px 2px 4px;font-size:.55rem;color:var(--muted)}
      .v1325-simple-items{display:flex;align-items:center;gap:4px;min-width:0;overflow:hidden}
      .v1325-simple-item{width:38px;height:46px;flex:0 0 38px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(244,239,230,.7);overflow:hidden}
      .v1325-simple-item img{width:100%;height:100%;object-fit:contain;display:block}
      .v1325-simple-item-empty{font-size:.62rem;color:var(--muted)}
      .v1325-simple-copy{min-width:0;align-self:center}
      .v1325-simple-flags{display:flex;align-items:center;gap:7px;min-height:14px;margin-bottom:2px;font-size:.67rem;line-height:1;color:#9b7442}
      .v1325-simple-favorite{color:#a15352;font-weight:700}
      .v1325-simple-title{display:block;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--serif);font-size:.82rem;font-weight:650;color:var(--coffee)}
      .v1325-simple-title.empty{font-weight:500;color:var(--muted);font-style:italic}
      @media(max-width:520px){.v1325-simple-log{grid-template-columns:54px minmax(78px,104px) minmax(0,1fr);gap:7px;padding:8px}.v1325-simple-item{width:34px;height:42px;flex-basis:34px}.v1325-simple-date{width:50px}.v1325-simple-title{font-size:.77rem}}
    `;document.head.appendChild(style);
  }

  function injectTitleField(){
    const entry=currentEntry(),sheet=document.querySelector('#journalDetailDialog .v1325-journal-sheet');
    if(!entry||!sheet)return;
    let field=sheet.querySelector('.v1325-journal-title-field');
    const draft=draftFor(entry);
    if(!field){
      field=document.createElement('div');field.className='v1325-journal-title-field';
      field.innerHTML=`<label for="${TITLE_FIELD_ID}">Journal title</label><input id="${TITLE_FIELD_ID}" class="v1325-journal-title-input" type="text" maxlength="90" autocomplete="off" aria-label="Journal title">`;
      const write=sheet.querySelector('.v1325-journal-write'),toolbar=sheet.querySelector('.v1325-journal-toolbar');
      if(write&&toolbar)write.insertBefore(field,toolbar);else sheet.appendChild(field);
    }
    const input=field.querySelector('#'+TITLE_FIELD_ID);if(!input)return;
    input.value=draft.value||generatedTitle(entry,{live:true});
    if(input.dataset.bound!=='1'){
      input.dataset.bound='1';
      input.addEventListener('input',()=>{
        const automatic=generatedTitle(entry,{live:true}),value=input.value.trim();
        drafts.set(String(entry.id),{value:input.value,custom:!!value&&value!==automatic});
      });
    }
    const refreshAuto=()=>{
      const d=draftFor(entry);if(d.custom)return;
      const value=generatedTitle(entry,{live:true});d.value=value;input.value=value;drafts.set(String(entry.id),d);
    };
    ['v1325JournalLocation','v1325JournalWeather','v1325JournalOccasion','v1325JournalTemperature','v1325JournalTemperatureUnit','v1325JournalEra'].forEach(id=>{
      const el=document.getElementById(id);if(el&&el.dataset.titleAutoBound!=='1'){el.dataset.titleAutoBound='1';el.addEventListener('input',refreshAuto);el.addEventListener('change',refreshAuto);}
    });
  }

  function applyTitleDraftBeforeSave(){
    if(!journalSaveIntent)return;
    journalSaveIntent=false;
    const entry=currentEntry(),input=document.getElementById(TITLE_FIELD_ID);if(!entry||!input)return;
    const automatic=generatedTitle(entry,{live:true}),raw=input.value.trim();
    const draft=drafts.get(String(entry.id))||{value:input.value,custom:false};
    const custom=!!raw&&(draft.custom||raw!==automatic);
    entry.journalTitle=custom?raw:automatic;
    entry.journalTitleCustom=custom;
    drafts.set(String(entry.id),{value:entry.journalTitle,custom});
  }

  function formatCalendar(date){
    const d=new Date(`${date||''}T12:00:00`);if(Number.isNaN(d.getTime()))return {month:'',day:'—',year:''};
    return {month:d.toLocaleDateString('en-US',{month:'short'}),day:String(d.getDate()),year:String(d.getFullYear())};
  }
  function itemThumbs(entry){
    const items=(entry?.itemIds||[]).map(id=>state.items.find(item=>String(item.id)===String(id))).filter(Boolean).slice(0,4);
    if(!items.length)return '<span class="v1325-simple-item v1325-simple-item-empty">—</span>';
    return items.map(item=>`<span class="v1325-simple-item">${item.photo?`<img src="${esc(item.photo)}" alt="">`:'<span class="v1325-simple-item-empty">item</span>'}</span>`).join('');
  }
  function ratingValue(entry){const n=Number(entry?.rating||0);return Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;}
  function favoriteValue(entry){return entry?.favorite===true||entry?.isFavorite===true;}
  function simplifyRow(row,entry){
    if(!row||!entry)return;
    row.classList.add('v1325-simple-log-row');
    row.querySelector('.v1325-simple-log')?.remove();
    const date=formatCalendar(entry.date),rating=ratingValue(entry),favorite=favoriteValue(entry),title=storedTitle(entry);
    const summary=document.createElement('div');summary.className='v1325-simple-log';summary.setAttribute('role','button');summary.setAttribute('tabindex','0');summary.setAttribute('aria-label',`Open journal for ${entry.date||'this day'}`);
    summary.innerHTML=`<div class="v1325-simple-date"><span class="v1325-simple-date-month">${esc(date.month)}</span><span class="v1325-simple-date-day">${esc(date.day)}</span><span class="v1325-simple-date-year">${esc(date.year)}</span></div><div class="v1325-simple-items">${itemThumbs(entry)}</div><div class="v1325-simple-copy"><div class="v1325-simple-flags">${rating?`<span aria-label="${rating} star rating">${'★'.repeat(rating)}</span>`:''}${favorite?'<span class="v1325-simple-favorite">♥ Favorite</span>':''}</div><span class="v1325-simple-title${title?'':' empty'}">${title?esc(title):'Journal day'}</span></div>`;
    const open=event=>{event.preventDefault();event.stopPropagation();if(typeof openJournalDetail==='function')openJournalDetail(entry.id);};
    summary.addEventListener('click',open);summary.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){open(event);}});
    row.appendChild(summary);
  }
  function simplifyJournalRows(){
    document.querySelectorAll('.journal-row[data-journal-id]').forEach(row=>simplifyRow(row,entryById(row.dataset.journalId)));
  }

  function wrapRenderJournal(){
    if(typeof renderJournal!=='function'||renderJournal.__titleLogWrapped)return;
    const render0=renderJournal;
    renderJournal=function(){const out=render0.apply(this,arguments);requestAnimationFrame(simplifyJournalRows);setTimeout(simplifyJournalRows,0);return out;};
    renderJournal.__titleLogWrapped=true;
  }
  function wrapOpenJournalDetail(){
    if(typeof openJournalDetail!=='function'||openJournalDetail.__titleFieldWrapped)return;
    const open0=openJournalDetail;
    openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(injectTitleField);setTimeout(injectTitleField,0);return out;};
    openJournalDetail.__titleFieldWrapped=true;
  }
  function wrapSaveState(){
    if(typeof saveState!=='function'||saveState.__journalTitleWrapped)return;
    const save0=saveState;
    saveState=async function(){applyTitleDraftBeforeSave();return save0.apply(this,arguments);};
    saveState.__journalTitleWrapped=true;
  }

  /* Window capture runs before the existing document-capture Journal Save handler. */
  window.addEventListener('click',event=>{if(event.target?.closest?.('#v1325SaveJournalBtn'))journalSaveIntent=true;},true);
  window.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target?.closest?.('#v1325SaveJournalBtn'))journalSaveIntent=true;},true);

  installStyles();wrapSaveState();wrapRenderJournal();wrapOpenJournalDetail();
  requestAnimationFrame(()=>{injectTitleField();simplifyJournalRows();});
  setTimeout(()=>{injectTitleField();simplifyJournalRows();},0);
  window.AudreyJournalTitleLog={version:VERSION,generatedTitle,refresh:()=>{injectTitleField();simplifyJournalRows();}};
})();
