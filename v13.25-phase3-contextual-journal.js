/* Audrey Closet v13.25 Phase 3 — Contextual Journal foundation
 * Preview-first journal layer. Adds manual context, richer journal writing,
 * lightweight formatting, and up to three compressed day photos while keeping
 * the existing Journal record model backward compatible.
 */
(function(){
  'use strict';

  const STYLE_ID='v1325Phase3ContextualJournalStyles';
  const HOST_ID='v1325JournalComposer';
  const MAX_PHOTOS=3;
  const MAX_IMAGE_EDGE=1200;
  const JPEG_QUALITY=.82;
  let draftPhotos=[];
  let activeJournalId='';

  const WEATHER_OPTIONS=[
    ['','Weather'],['sunny','Sunny'],['partly-cloudy','Partly cloudy'],['cloudy','Cloudy'],
    ['rainy','Rainy'],['windy','Windy'],['foggy','Foggy'],['hot','Hot'],['cold','Cold'],['snowy','Snowy']
  ];
  const OCCASION_OPTIONS=[
    ['','Occasion'],['school','School'],['everyday','Everyday'],['weekend','Weekend'],['sports','Sports'],
    ['party-event','Party / Event'],['travel','Travel'],['dinner-going-out','Dinner / Going out'],['other','Other']
  ];
  const FONT_OPTIONS=[
    ['system','Clean'],['serif','Story'],['hand','Handwritten'],['mono','Typewriter']
  ];

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
  function escText(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function journalEntry(){return state.journal.find(x=>String(x.id)===String(viewingJournalId||activeJournalId))||null;}
  function weatherLabel(value){return WEATHER_OPTIONS.find(x=>x[0]===value)?.[1]||value||'';}
  function occasionLabel(value){return OCCASION_OPTIONS.find(x=>x[0]===value)?.[1]||value||'';}
  function weatherIcon(value){return ({sunny:'☀️','partly-cloudy':'🌤️',cloudy:'☁️',rainy:'🌧️',windy:'💨',foggy:'🌫️',hot:'☀️',cold:'❄️',snowy:'🌨️'})[value]||'☁️';}
  function seasonForDate(date){
    const month=Number(String(date||'').slice(5,7));
    if([12,1,2].includes(month))return ['Winter','❄️'];
    if([3,4,5].includes(month))return ['Spring','🌷'];
    if([6,7,8].includes(month))return ['Summer','☀️'];
    if([9,10,11].includes(month))return ['Fall','🍂'];
    return ['Season','🍃'];
  }
  function contextOf(entry){
    const old=entry?.context&&typeof entry.context==='object'?entry.context:{};
    return {
      location:String(old.location||entry?.location||''),
      weather:String(old.weather||entry?.weather||''),
      temperature:old.temperature??entry?.temperature??'',
      temperatureUnit:String(old.temperatureUnit||entry?.temperatureUnit||'F'),
      occasion:String(old.occasion||entry?.occasion||'')
    };
  }
  function plainTextFromHtml(html){
    const box=document.createElement('div');box.innerHTML=String(html||'');return (box.innerText||box.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
  }
  function safeJournalHtml(html){
    const source=document.createElement('template');source.innerHTML=String(html||'');
    const allowed=new Set(['DIV','P','BR','SPAN','B','STRONG','I','EM','U']);
    const cleanNode=node=>{
      [...node.childNodes].forEach(child=>{
        if(child.nodeType===Node.TEXT_NODE)return;
        if(child.nodeType!==Node.ELEMENT_NODE){child.remove();return;}
        if(!allowed.has(child.tagName)){
          const frag=document.createDocumentFragment();while(child.firstChild)frag.appendChild(child.firstChild);child.replaceWith(frag);cleanNode(node);return;
        }
        [...child.attributes].forEach(attr=>{if(attr.name!=='style')child.removeAttribute(attr.name);});
        const style=child.getAttribute('style')||'';
        const keep=[];
        style.split(';').forEach(rule=>{
          const [rawKey,...rest]=rule.split(':');const key=(rawKey||'').trim().toLowerCase();const value=rest.join(':').trim();
          if(!value)return;
          if(key==='color'&&/^#[0-9a-f]{3,8}$/i.test(value))keep.push(`color:${value}`);
          if(key==='font-family'&&/^[a-z0-9 ,'"-]+$/i.test(value))keep.push(`font-family:${value}`);
          if(key==='font-weight'&&/^(bold|[4-7]00)$/i.test(value))keep.push(`font-weight:${value}`);
          if(key==='font-style'&&/^italic$/i.test(value))keep.push('font-style:italic');
          if(key==='text-decoration'&&/^underline$/i.test(value))keep.push('text-decoration:underline');
        });
        if(keep.length)child.setAttribute('style',keep.join(';'));else child.removeAttribute('style');
        cleanNode(child);
      });
    };
    cleanNode(source.content);
    return source.innerHTML;
  }
  function richHtmlFor(entry){
    if(entry?.journalHtml)return safeJournalHtml(entry.journalHtml);
    if(entry?.notes)return escText(entry.notes).replace(/\n/g,'<br>');
    return '';
  }
  function photoArray(entry){return Array.isArray(entry?.journalPhotos)?clone(entry.journalPhotos).slice(0,MAX_PHOTOS):[];}

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #journalDetailDialog .journal-notes-panel{border:0;background:transparent;padding:0;margin-top:14px}
      #journalDetailDialog .journal-notes-toggle{border:1px solid rgba(108,81,66,.16);border-radius:18px;background:rgba(255,252,244,.88);padding:13px 14px;box-shadow:0 4px 16px rgba(76,61,49,.06)}
      #journalDetailDialog .journal-notes-toggle>span:first-child{font-family:var(--serif);font-size:1.08rem;font-weight:650}
      #journalDetailDialog .journal-notes-body{padding-top:10px}
      #journalDetailDialog #journalDetailNotesInput{display:none!important}
      .v1325-journal-sheet{border:1px solid rgba(108,81,66,.16);border-radius:22px;background:linear-gradient(180deg,rgba(255,253,248,.98),rgba(250,245,234,.96));box-shadow:0 9px 28px rgba(72,57,45,.08);overflow:hidden}
      .v1325-journal-context-head{padding:14px 14px 12px;border-bottom:1px solid rgba(108,81,66,.10)}
      .v1325-journal-context-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .v1325-journal-context-title strong{font-family:var(--serif);font-size:1rem;font-weight:650}.v1325-journal-context-title small{color:var(--muted);font-size:.72rem}
      .v1325-journal-context-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:11px}
      .v1325-journal-context-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(108,81,66,.14);background:rgba(255,255,255,.7);border-radius:999px;padding:6px 9px;font-size:.75rem;color:var(--coffee)}
      .v1325-journal-context-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:8px}
      .v1325-journal-context-grid input,.v1325-journal-context-grid select{width:100%;min-width:0;border:1px solid rgba(108,81,66,.18);border-radius:12px;background:#fffdf8;padding:10px 10px;font:inherit;color:var(--coffee)}
      .v1325-journal-temp-row{display:grid;grid-template-columns:minmax(0,1fr) 70px;gap:6px}
      .v1325-journal-write{padding:13px 14px 14px}
      .v1325-journal-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:9px}
      .v1325-journal-toolbar select,.v1325-journal-toolbar button,.v1325-journal-color-wrap{height:34px;border:1px solid rgba(108,81,66,.17);border-radius:10px;background:#fffdf8;color:var(--coffee);font:inherit;font-size:.75rem}
      .v1325-journal-toolbar select{padding:0 8px}.v1325-journal-toolbar button{min-width:34px;padding:0 9px;font-weight:700}
      .v1325-journal-color-wrap{display:flex;align-items:center;gap:6px;padding:0 7px}.v1325-journal-color-wrap input{width:24px;height:24px;padding:0;border:0;background:transparent}
      .v1325-journal-editor{min-height:150px;border:1px solid rgba(108,81,66,.14);border-radius:14px;padding:14px 14px 18px;color:var(--coffee);font-size:.96rem;line-height:1.65;outline:none;background-color:#fffdf8;background-image:linear-gradient(transparent 31px,rgba(118,104,87,.10) 32px);background-size:100% 32px;overflow-wrap:anywhere}
      .v1325-journal-editor:empty:before{content:attr(data-placeholder);color:rgba(108,81,66,.48);pointer-events:none}
      .v1325-journal-photo-block{margin-top:12px}.v1325-journal-photo-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.v1325-journal-photo-head strong{font-size:.84rem}.v1325-journal-photo-head small{color:var(--muted);font-size:.7rem}
      .v1325-journal-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
      .v1325-journal-photo{position:relative;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:#eee7dc}.v1325-journal-photo img{width:100%;height:100%;object-fit:cover;display:block}.v1325-journal-photo button{position:absolute;top:5px;right:5px;width:27px;height:27px;border:0;border-radius:50%;background:rgba(35,30,26,.72);color:#fff;font-size:17px;line-height:27px;padding:0}
      .v1325-journal-photo-add{display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;border:1px dashed rgba(108,81,66,.28);border-radius:12px;background:rgba(255,255,255,.54);font-size:.78rem;color:var(--coffee);text-align:center;padding:8px;cursor:pointer}
      .v1325-journal-photo-input{display:none}
      .v1325-journal-save-row{display:flex;align-items:center;gap:10px;margin-top:12px}.v1325-journal-save-row .journal-save-notes-btn{flex:0 0 auto;margin:0}.v1325-journal-save-feedback{font-size:.76rem;color:var(--olive-dark);min-height:1em;opacity:0;transform:translateY(2px);transition:.18s ease}.v1325-journal-save-feedback.show{opacity:1;transform:none}.v1325-journal-save-feedback.error{color:#8b3f37}
      .v1325-journal-save-success{box-shadow:0 0 0 3px rgba(102,113,90,.12)!important}
      @media(max-width:520px){.v1325-journal-context-grid{grid-template-columns:1fr}.v1325-journal-editor{min-height:170px}.v1325-journal-write{padding:12px}.v1325-journal-context-head{padding:12px}.v1325-journal-toolbar{gap:6px}.v1325-journal-toolbar select{max-width:115px}}
    `;document.head.appendChild(style);
  }

  function contextChips(entry){
    const ctx=contextOf(entry),season=seasonForDate(entry?.date),chips=[];
    chips.push(`<span class="v1325-journal-context-chip">${season[1]} ${escText(season[0])}</span>`);
    if(ctx.location)chips.push(`<span class="v1325-journal-context-chip">📍 ${escText(ctx.location)}</span>`);
    if(ctx.weather)chips.push(`<span class="v1325-journal-context-chip">${weatherIcon(ctx.weather)} ${escText(weatherLabel(ctx.weather))}</span>`);
    if(ctx.temperature!==''&&ctx.temperature!=null)chips.push(`<span class="v1325-journal-context-chip">🌡️ ${escText(ctx.temperature)}°${escText(ctx.temperatureUnit||'F')}</span>`);
    if(ctx.occasion)chips.push(`<span class="v1325-journal-context-chip">✦ ${escText(occasionLabel(ctx.occasion))}</span>`);
    return chips.join('');
  }
  function optionMarkup(options,current){return options.map(([value,label])=>`<option value="${escText(value)}"${String(current)===String(value)?' selected':''}>${escText(label)}</option>`).join('');}

  function composerMarkup(entry){
    const ctx=contextOf(entry),photos=photoArray(entry);
    draftPhotos=photos;activeJournalId=String(entry.id||'');
    return `<div class="v1325-journal-sheet" id="${HOST_ID}">
      <div class="v1325-journal-context-head">
        <div class="v1325-journal-context-title"><strong>Remember this day</strong><small>context is optional</small></div>
        <div class="v1325-journal-context-chips" id="v1325JournalContextChips">${contextChips(entry)}</div>
        <div class="v1325-journal-context-grid">
          <input id="v1325JournalLocation" type="text" maxlength="70" value="${escText(ctx.location)}" placeholder="📍 Location or place" autocomplete="off">
          <select id="v1325JournalWeather" aria-label="Weather">${optionMarkup(WEATHER_OPTIONS,ctx.weather)}</select>
          <select id="v1325JournalOccasion" aria-label="Occasion">${optionMarkup(OCCASION_OPTIONS,ctx.occasion)}</select>
          <div class="v1325-journal-temp-row"><input id="v1325JournalTemperature" type="number" inputmode="decimal" step="1" value="${escText(ctx.temperature)}" placeholder="🌡 Temperature"><select id="v1325JournalTemperatureUnit" aria-label="Temperature unit"><option value="F"${ctx.temperatureUnit!=='C'?' selected':''}>°F</option><option value="C"${ctx.temperatureUnit==='C'?' selected':''}>°C</option></select></div>
        </div>
      </div>
      <div class="v1325-journal-write">
        <div class="v1325-journal-toolbar" aria-label="Journal formatting">
          <select id="v1325JournalFont" aria-label="Journal font">${optionMarkup(FONT_OPTIONS,'system')}</select>
          <button type="button" data-journal-command="bold" aria-label="Bold"><b>B</b></button>
          <button type="button" data-journal-command="italic" aria-label="Italic"><i>I</i></button>
          <button type="button" data-journal-command="underline" aria-label="Underline"><u>U</u></button>
          <label class="v1325-journal-color-wrap" title="Text color"><span>Color</span><input id="v1325JournalColor" type="color" value="#59483d" aria-label="Text color"></label>
        </div>
        <div id="v1325JournalEditor" class="v1325-journal-editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="What made this outfit or day memorable?">${richHtmlFor(entry)}</div>
        <div class="v1325-journal-photo-block">
          <div class="v1325-journal-photo-head"><strong>Day photos</strong><small>up to ${MAX_PHOTOS}</small></div>
          <div class="v1325-journal-photo-grid" id="v1325JournalPhotoGrid"></div>
          <input id="v1325JournalPhotoInput" class="v1325-journal-photo-input" type="file" accept="image/*" multiple>
        </div>
        <div class="v1325-journal-save-row">
          <button type="button" class="soft-btn journal-save-notes-btn" id="v1325SaveJournalBtn">Save journal</button>
          <span class="v1325-journal-save-feedback" id="v1325JournalSaveFeedback" role="status" aria-live="polite"></span>
        </div>
      </div>
    </div>`;
  }

  function currentDraftContext(entry){
    const tempRaw=document.querySelector('#v1325JournalTemperature')?.value?.trim()??'';
    return {
      location:document.querySelector('#v1325JournalLocation')?.value?.trim()||'',
      weather:document.querySelector('#v1325JournalWeather')?.value||'',
      temperature:tempRaw===''?'':Number(tempRaw),
      temperatureUnit:document.querySelector('#v1325JournalTemperatureUnit')?.value==='C'?'C':'F',
      occasion:document.querySelector('#v1325JournalOccasion')?.value||''
    };
  }
  function refreshContextChips(){
    const entry=journalEntry(),host=document.querySelector('#v1325JournalContextChips');if(!entry||!host)return;
    const preview={...entry,context:currentDraftContext(entry)};host.innerHTML=contextChips(preview);
  }
  function renderDraftPhotos(){
    const host=document.querySelector('#v1325JournalPhotoGrid');if(!host)return;
    const blocks=draftPhotos.map((src,index)=>`<div class="v1325-journal-photo"><img src="${src}" alt="Journal photo ${index+1}"><button type="button" data-journal-photo-remove="${index}" aria-label="Remove photo">×</button></div>`);
    if(draftPhotos.length<MAX_PHOTOS)blocks.push('<label class="v1325-journal-photo-add" for="v1325JournalPhotoInput">＋ Add photo</label>');
    host.innerHTML=blocks.join('');
    host.querySelectorAll('[data-journal-photo-remove]').forEach(btn=>btn.addEventListener('click',()=>{draftPhotos.splice(Number(btn.dataset.journalPhotoRemove),1);renderDraftPhotos();showFeedback('Photo removed — save journal to keep the change.');}));
  }

  function compressImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read image'));
      reader.onload=()=>{
        const img=new Image();img.onerror=()=>reject(new Error('Could not load image'));
        img.onload=()=>{
          const scale=Math.min(1,MAX_IMAGE_EDGE/Math.max(img.naturalWidth||1,img.naturalHeight||1));
          const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
          const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
          try{resolve(canvas.toDataURL('image/jpeg',JPEG_QUALITY));}catch(err){reject(err);}
        };img.src=reader.result;
      };reader.readAsDataURL(file);
    });
  }
  async function addPhotos(files){
    const slots=MAX_PHOTOS-draftPhotos.length;if(slots<=0)return;
    const chosen=[...files].filter(f=>f.type?.startsWith('image/')).slice(0,slots);
    if(!chosen.length)return;
    showFeedback('Preparing photo…');
    try{for(const file of chosen)draftPhotos.push(await compressImage(file));renderDraftPhotos();showFeedback(`${chosen.length} photo${chosen.length===1?'':'s'} ready — save journal to keep ${chosen.length===1?'it':'them'}.`);}catch(err){console.error('[v13.25 journal] photo compression failed',err);showFeedback('Could not add that photo.','error');}
  }

  function editor(){return document.querySelector('#v1325JournalEditor');}
  function focusEditor(){const e=editor();if(e)e.focus();return e;}
  function fontFamily(value){return ({system:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',serif:'Georgia,"Times New Roman",serif',hand:'"Bradley Hand","Segoe Print","Comic Sans MS",cursive',mono:'ui-monospace,SFMono-Regular,Menlo,Monaco,monospace'})[value]||'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';}
  function applyCommand(command,value=null){
    const e=focusEditor();if(!e)return;
    try{document.execCommand(command,false,value);}catch(err){console.warn('[v13.25 journal] format command failed',command,err);}
  }
  function applyFont(value){
    const e=focusEditor();if(!e)return;
    try{document.execCommand('fontName',false,fontFamily(value));}catch(err){console.warn('[v13.25 journal] font command failed',err);}
  }
  function applyColor(value){if(value)applyCommand('foreColor',value);}

  function showFeedback(message,type='ok'){
    const el=document.querySelector('#v1325JournalSaveFeedback');if(!el)return;el.textContent=message||'';el.classList.toggle('error',type==='error');el.classList.toggle('show',!!message);
  }
  function savedFeedback(){
    const stamp=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});showFeedback(`✓ Saved ${stamp}`);
    const btn=document.querySelector('#v1325SaveJournalBtn');if(btn){btn.classList.add('v1325-journal-save-success');const old=btn.textContent;btn.textContent='Saved ✓';setTimeout(()=>{btn.textContent=old;btn.classList.remove('v1325-journal-save-success');},1200);}
  }

  async function saveContextualJournal(){
    const entry=journalEntry();if(!entry)return;
    const edit=editor(),html=safeJournalHtml(edit?.innerHTML||''),plain=plainTextFromHtml(html);
    entry.context=currentDraftContext(entry);
    entry.journalHtml=html;
    entry.notes=plain;
    entry.journalPhotos=clone(draftPhotos).slice(0,MAX_PHOTOS);
    entry.updated=Date.now();
    const legacy=document.querySelector('#journalDetailNotesInput');if(legacy)legacy.value=plain;
    try{
      await saveState();
      const summary=document.querySelector('#journalDetailNotesSummary');if(summary)summary.textContent=plain||entry.journalPhotos.length||Object.values(entry.context).some(v=>v!==''&&v!=null)?'Journal saved':'Write something…';
      refreshContextChips();
      if(typeof renderJournal==='function')renderJournal();
      savedFeedback();
      if(typeof toast==='function')toast('Journal saved');
    }catch(err){console.error('[v13.25 journal] save failed',err);showFeedback('Could not save — please try again.','error');}
  }

  function bindComposer(entry){
    renderDraftPhotos();
    ['v1325JournalLocation','v1325JournalWeather','v1325JournalOccasion','v1325JournalTemperature','v1325JournalTemperatureUnit'].forEach(id=>document.getElementById(id)?.addEventListener('input',refreshContextChips));
    document.querySelector('#v1325JournalPhotoInput')?.addEventListener('change',e=>{addPhotos(e.target.files||[]);e.target.value='';});
    document.querySelectorAll('[data-journal-command]').forEach(btn=>btn.addEventListener('click',()=>applyCommand(btn.dataset.journalCommand)));
    document.querySelector('#v1325JournalFont')?.addEventListener('change',e=>applyFont(e.target.value));
    document.querySelector('#v1325JournalColor')?.addEventListener('input',e=>applyColor(e.target.value));
    document.querySelector('#v1325SaveJournalBtn')?.addEventListener('click',saveContextualJournal);
    const legacySave=document.querySelector('#saveJournalDetailNotesBtn');if(legacySave)legacySave.style.display='none';
  }

  function installComposer(){
    installStyles();
    const body=document.querySelector('#journalDetailNotesBody'),toggle=document.querySelector('#journalDetailNotesToggle');
    const entry=journalEntry();if(!body||!toggle||!entry)return;
    const title=toggle.querySelector('span:first-child');if(title)title.textContent='Journal';
    const summary=document.querySelector('#journalDetailNotesSummary');if(summary)summary.textContent=(entry.notes||entry.journalHtml||photoArray(entry).length||Object.values(contextOf(entry)).some(v=>v!==''&&v!=null&&v!=='F'))?'Journal saved':'Write something…';
    body.querySelector('#'+HOST_ID)?.remove();
    body.insertAdjacentHTML('afterbegin',composerMarkup(entry));
    bindComposer(entry);
  }

  const originalOpenJournalDetail=openJournalDetail;
  openJournalDetail=function(jid){
    const result=originalOpenJournalDetail.apply(this,arguments);
    activeJournalId=String(jid||'');
    installComposer();
    return result;
  };

  /* Preserve compatibility with the existing Save notes hook in case another
   * part of the app invokes it directly while Phase 3 is active. */
  if(typeof saveJournalDetailNotes==='function'){
    saveJournalDetailNotes=async function(){return saveContextualJournal();};
  }

  installStyles();
  window.AudreyContextualJournal={
    version:1,
    refresh:installComposer,
    save:saveContextualJournal,
    entry:()=>journalEntry()
  };
})();
