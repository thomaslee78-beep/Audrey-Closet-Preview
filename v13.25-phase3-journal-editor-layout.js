/* Audrey Closet v13.25 Phase 3 — Journal editor hierarchy
 * Layout20 presentation overlay.
 * Organizes editing into Journal Title -> About the Day -> Journal Entry -> Photos.
 * About the Day is a compact expandable panel; no Journal data model changes.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalEditorLayoutStyles';
  let syncing=false;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #journalDetailDialog .v1325-journal-editor-section-label{
        display:block;
        margin:0 0 6px;
        font-family:var(--serif);
        font-size:.78rem;
        font-weight:700;
        color:var(--coffee);
      }

      /* Journal Title becomes the first editable field below the section heading. */
      #journalDetailDialog .v1325-journal-context-head>.v1325-journal-title-field{
        margin:2px 0 10px!important;
      }
      #journalDetailDialog .v1325-journal-context-head>.v1325-journal-title-field label{
        margin:0 0 5px!important;
        font-family:var(--serif)!important;
        font-size:.78rem!important;
        font-weight:700!important;
        color:var(--coffee)!important;
        letter-spacing:0!important;
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-title-input{
        min-height:38px!important;
        padding:8px 10px!important;
        border-radius:10px!important;
        font-size:.96rem!important;
      }

      /* About the Day is supporting information, visually grouped and collapsible. */
      #journalDetailDialog .v1325-about-day-panel{
        margin:0 0 10px;
        border:1px solid rgba(102,113,90,.18);
        border-radius:13px;
        background:rgba(102,113,90,.065);
        overflow:visible;
      }
      #journalDetailDialog .v1325-about-day-toggle{
        width:100%;
        min-height:38px;
        display:flex;
        align-items:center;
        gap:8px;
        padding:7px 10px;
        border:0;
        border-radius:13px;
        background:transparent;
        color:var(--coffee);
        font:inherit;
        text-align:left;
      }
      #journalDetailDialog .v1325-about-day-title{
        flex:0 0 auto;
        font-family:var(--serif);
        font-size:.79rem;
        font-weight:700;
      }
      #journalDetailDialog .v1325-about-day-summary{
        flex:1 1 auto;
        min-width:0;
        color:var(--muted);
        font-size:.66rem;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #journalDetailDialog .v1325-about-day-chevron{
        flex:0 0 auto;
        font-size:.75rem;
        transition:transform .15s ease;
      }
      #journalDetailDialog .v1325-about-day-panel.open .v1325-about-day-chevron{transform:rotate(180deg)}
      #journalDetailDialog .v1325-about-day-body{
        padding:0 10px 10px;
      }
      #journalDetailDialog .v1325-about-day-body[hidden]{display:none!important}
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body .v1325-journal-context-chips{
        display:none!important;
      }
      #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid{
        margin:0!important;
      }
      #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid input,
      #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid select{
        min-height:36px!important;
        padding:7px 9px!important;
        border-radius:9px!important;
        font-size:.76rem!important;
      }

      /* Journal writing is the primary surface. */
      #journalDetailDialog .v1325-journal-write{
        padding-top:10px!important;
      }
      #journalDetailDialog .v1325-journal-entry-heading{
        margin:0 0 6px;
        font-family:var(--serif);
        font-size:.82rem;
        font-weight:700;
        color:var(--coffee);
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-toolbar{
        margin-bottom:7px!important;
        gap:5px!important;
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-toolbar select,
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-toolbar button,
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-color-wrap{
        height:31px!important;
        min-height:31px!important;
        border-radius:8px!important;
        font-size:.7rem!important;
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-editor{
        min-height:220px!important;
        border-radius:12px!important;
        padding:12px 13px 16px!important;
      }

      /* Photos remain supporting content below the writing area. */
      #journalDetailDialog .v1325-journal-photo-head strong{
        font-family:var(--serif)!important;
        font-size:.78rem!important;
        font-weight:700!important;
        color:var(--coffee)!important;
      }
      #journalDetailDialog .v1325-journal-photo-block{margin-top:11px!important}

      /* In read mode, don't introduce editor-only chrome. */
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-about-day-toggle{display:none!important}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-about-day-panel{border:0;background:transparent;margin:0;overflow:visible}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-about-day-body{display:block!important;padding:0}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-entry-heading{display:none!important}

      @media(max-width:520px){
        #journalDetailDialog .v1325-journal-context-head>.v1325-journal-title-field{margin-bottom:8px!important}
        #journalDetailDialog .v1325-about-day-panel{margin-bottom:9px}
        #journalDetailDialog .v1325-about-day-toggle{min-height:37px;padding:7px 9px}
        #journalDetailDialog .v1325-about-day-title{font-size:.76rem}
        #journalDetailDialog .v1325-about-day-summary{font-size:.62rem}
        #journalDetailDialog .v1325-about-day-body{padding:0 8px 9px}
        #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid{gap:6px!important}
        #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid input,
        #journalDetailDialog .v1325-about-day-body .v1325-journal-context-grid select{font-size:.72rem!important;padding:7px 8px!important}
        #journalDetailDialog .v1325-journal-entry-heading{font-size:.79rem}
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-editor{min-height:240px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function summaryText(){
    const occasion=document.querySelector('#v1325JournalOccasion');
    const location=document.querySelector('#v1325JournalLocation')?.value?.trim()||'';
    const weather=document.querySelector('#v1325JournalWeather');
    const temp=document.querySelector('#v1325JournalTemperature')?.value?.trim()||'';
    const unit=document.querySelector('#v1325JournalTemperatureUnit')?.value||'F';
    const bits=[];
    const occasionText=occasion?.selectedOptions?.[0]?.textContent?.trim()||'';
    const weatherText=weather?.selectedOptions?.[0]?.textContent?.trim()||'';
    if(occasion?.value&&occasionText)bits.push(occasionText);
    if(location)bits.push(location);
    if(weather?.value&&weatherText)bits.push(weatherText);
    if(temp!=='')bits.push(`${temp}°${unit}`);
    return bits.join(' · ')||'Event, place, weather & temperature';
  }

  function updateSummary(panel){
    const summary=panel?.querySelector('.v1325-about-day-summary');
    if(summary)summary.textContent=summaryText();
  }

  function ensureAboutDay(sheet){
    const head=sheet.querySelector('.v1325-journal-context-head');
    const grid=head?.querySelector('.v1325-journal-context-grid');
    if(!head||!grid)return;

    let panel=head.querySelector('.v1325-about-day-panel');
    if(!panel){
      panel=document.createElement('div');panel.className='v1325-about-day-panel';
      panel.innerHTML='<button type="button" class="v1325-about-day-toggle" aria-expanded="false"><span class="v1325-about-day-title">About the Day</span><span class="v1325-about-day-summary"></span><span class="v1325-about-day-chevron" aria-hidden="true">⌄</span></button><div class="v1325-about-day-body" hidden></div>';
      const titleField=head.querySelector('.v1325-journal-title-field');
      if(titleField)titleField.after(panel);else head.appendChild(panel);
    }

    const body=panel.querySelector('.v1325-about-day-body');
    const chips=head.querySelector('.v1325-journal-context-chips');
    if(chips&&chips.parentNode!==body)body.appendChild(chips);
    if(grid.parentNode!==body)body.appendChild(grid);

    const toggle=panel.querySelector('.v1325-about-day-toggle');
    if(toggle&&toggle.dataset.bound!=='1'){
      toggle.dataset.bound='1';
      toggle.addEventListener('click',()=>{
        const open=!panel.classList.contains('open');
        panel.classList.toggle('open',open);
        body.hidden=!open;
        toggle.setAttribute('aria-expanded',open?'true':'false');
        updateSummary(panel);
      });
    }

    ['v1325JournalOccasion','v1325JournalLocation','v1325JournalWeather','v1325JournalTemperature','v1325JournalTemperatureUnit'].forEach(id=>{
      const control=document.getElementById(id);
      if(control&&control.dataset.aboutDayBound!=='1'){
        control.dataset.aboutDayBound='1';
        control.addEventListener('input',()=>updateSummary(panel));
        control.addEventListener('change',()=>updateSummary(panel));
      }
    });
    updateSummary(panel);
  }

  function moveTitleToTop(sheet){
    const head=sheet.querySelector('.v1325-journal-context-head');
    const title=sheet.querySelector('.v1325-journal-title-field');
    const contextTitle=head?.querySelector('.v1325-journal-context-title');
    if(!head||!title)return;
    if(title.parentNode!==head){
      if(contextTitle)contextTitle.after(title);else head.prepend(title);
    }else if(contextTitle&&contextTitle.nextElementSibling!==title){
      contextTitle.after(title);
    }
  }

  function ensureJournalEntryHeading(sheet){
    const write=sheet.querySelector('.v1325-journal-write');
    const toolbar=write?.querySelector('.v1325-journal-toolbar');
    if(!write||!toolbar)return;
    let heading=write.querySelector('.v1325-journal-entry-heading');
    if(!heading){heading=document.createElement('div');heading.className='v1325-journal-entry-heading';heading.textContent='Journal Entry';toolbar.before(heading);}
  }

  function normalizePhotoHeading(sheet){
    const strong=sheet.querySelector('.v1325-journal-photo-head strong');
    if(strong)strong.textContent='Photos';
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const dialog=document.querySelector('#journalDetailDialog');
      const sheet=dialog?.querySelector('.v1325-journal-sheet');
      if(!dialog||!sheet)return;
      moveTitleToTop(sheet);
      ensureAboutDay(sheet);
      ensureJournalEntryHeading(sheet);
      normalizePhotoHeading(sheet);

      /* Entering edit mode starts compact: About the Day is collapsed unless the user opened it. */
      const panel=sheet.querySelector('.v1325-about-day-panel');
      const body=panel?.querySelector('.v1325-about-day-body');
      const toggle=panel?.querySelector('.v1325-about-day-toggle');
      if(sheet.classList.contains('editing')&&panel&&!panel.dataset.editSessionStarted){
        panel.dataset.editSessionStarted='1';panel.classList.remove('open');if(body)body.hidden=true;if(toggle)toggle.setAttribute('aria-expanded','false');
      }
      if(!sheet.classList.contains('editing')&&panel){delete panel.dataset.editSessionStarted;if(body)body.hidden=false;}
    }finally{syncing=false;}
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle,#v1325SaveJournalBtn')){
      requestAnimationFrame(sync);setTimeout(sync,40);setTimeout(sync,130);
    }
  },true);

  if(typeof openJournalDetail==='function'&&!openJournalDetail.__journalEditorLayoutWrapped){
    const open0=openJournalDetail;
    openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(sync);setTimeout(sync,80);setTimeout(sync,200);return out;};
    openJournalDetail.__journalEditorLayoutWrapped=true;
  }

  installStyles();requestAnimationFrame(sync);setTimeout(sync,120);
  window.AudreyJournalEditorLayout={version:VERSION,refresh:sync};
})();
