/* Audrey Closet v13.25 Phase 3 dev3 — functional fixes
 * Fixes Journal View routing, preserves rich journal formatting, adds a swipeable
 * day-photo viewer, routes worn-piece taps to item detail, confirms photo removal,
 * and keeps look labels appropriate to today's, planned, or past entries.
 */
(function(){
  'use strict';

  const VERSION='3.3';
  const STYLE_ID='v1325Phase3Dev3FunctionalFixStyles';
  const LIGHTBOX_ID='v1325JournalPhotoLightbox';
  let lightboxPhotos=[];
  let lightboxIndex=0;
  let lightboxTouchX=null;

  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
  function entryById(id){return state.journal.find(j=>String(j.id)===String(id||''))||null;}
  function currentEntry(){return entryById(viewingJournalId);}
  function plainTextFromHtml(html){const box=document.createElement('div');box.innerHTML=String(html||'');return (box.innerText||box.textContent||'').replace(/\n{3,}/g,'\n\n').trim();}
  function todayISO(){
    if(typeof localTodayISO==='function')return localTodayISO();
    const d=new Date(),pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  function lookLabel(entry){
    const date=String(entry?.date||''),today=todayISO();
    if(!date||date===today)return "Today's Look";
    if(date>today)return 'Planned Look';
    return 'What I Wore';
  }
  function liveItemsFor(entry){return (entry?.itemIds||[]).map(id=>state.items.find(item=>item.id===id)).filter(Boolean);}
  function syncDetailLookLabel(entry){
    const label=document.querySelector('#journalDetailDialog .v1325-look-strip-head strong');
    if(label&&entry)label.textContent=lookLabel(entry);
  }
  function syncReaderExperience(entry){
    const reader=document.querySelector('#v1325JournalReaderDialog');if(!reader||!entry)return;
    reader.dataset.journalId=String(entry.id||'');
    const lookSection=[...reader.querySelectorAll('.v1325-reader-section')].find(s=>s.querySelector('.v1325-reader-look'));
    const title=lookSection?.querySelector('.v1325-reader-section-title');if(title)title.textContent=lookLabel(entry);
    const items=liveItemsFor(entry);
    lookSection?.querySelectorAll('.v1325-reader-look-card').forEach((card,index)=>{
      const item=items[index];if(!item)return;
      card.dataset.itemId=item.id;
      card.setAttribute('role','button');card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',`View ${item.type||item.category||'clothing item'} details`);
    });
  }

  function safeColor(value){
    value=String(value||'').trim();
    if(!value||/url\s*\(|expression\s*\(|var\s*\(/i.test(value))return '';
    try{return window.CSS?.supports?.('color',value)?value:'';}catch{return /^#[0-9a-f]{3,8}$/i.test(value)?value:'';}
  }
  function safeFontFamily(value){
    const text=String(value||'').toLowerCase();
    if(/georgia|times new roman/.test(text))return 'Georgia, "Times New Roman", serif';
    if(/bradley hand|segoe print|comic sans/.test(text))return '"Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
    if(/menlo|monaco|sfmono|monospace/.test(text))return 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
    if(/-apple-system|blinkmacsystemfont|segoe ui|sans-serif/.test(text))return '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    return '';
  }
  function appendStyle(el,key,value){if(!value)return;const current=el.getAttribute('style')||'';el.setAttribute('style',`${current}${current&&!current.trim().endsWith(';')?';':''}${key}:${value};`);}
  function normalizeFontElements(root){
    root.querySelectorAll('font').forEach(font=>{
      const span=document.createElement('span');
      const face=safeFontFamily(font.getAttribute('face'));if(face)appendStyle(span,'font-family',face);
      const color=safeColor(font.getAttribute('color'));if(color)appendStyle(span,'color',color);
      while(font.firstChild)span.appendChild(font.firstChild);
      font.replaceWith(span);
    });
  }
  function safeJournalHtml(html){
    const template=document.createElement('template');template.innerHTML=String(html||'');normalizeFontElements(template.content);
    const allowed=new Set(['DIV','P','BR','SPAN','B','STRONG','I','EM','U']);
    const clean=node=>{[...node.childNodes].forEach(child=>{
      if(child.nodeType===Node.TEXT_NODE)return;
      if(child.nodeType!==Node.ELEMENT_NODE){child.remove();return;}
      if(!allowed.has(child.tagName)){const frag=document.createDocumentFragment();while(child.firstChild)frag.appendChild(child.firstChild);child.replaceWith(frag);clean(node);return;}
      const originalStyle=child.getAttribute('style')||'';[...child.attributes].forEach(attr=>child.removeAttribute(attr.name));const keep=[];
      originalStyle.split(';').forEach(rule=>{const colon=rule.indexOf(':');if(colon<0)return;const key=rule.slice(0,colon).trim().toLowerCase(),value=rule.slice(colon+1).trim();
        if(key==='color'){const color=safeColor(value);if(color)keep.push(`color:${color}`);}
        else if(key==='font-family'){const family=safeFontFamily(value);if(family)keep.push(`font-family:${family}`);}
        else if(key==='font-weight'&&/^(bold|[4-7]00)$/i.test(value))keep.push(`font-weight:${value}`);
        else if(key==='font-style'&&/^italic$/i.test(value))keep.push('font-style:italic');
        else if(key==='text-decoration'&&/underline/i.test(value))keep.push('text-decoration:underline');
      });
      if(keep.length)child.setAttribute('style',keep.join(';'));clean(child);
    });};
    clean(template.content);return template.innerHTML;
  }
  function restoreRichJournalMarkup(entry){if(!entry?.journalHtml)return;const editor=document.querySelector('#v1325JournalEditor');if(!editor)return;const html=safeJournalHtml(entry.journalHtml);if(editor.innerHTML!==html)editor.innerHTML=html;}

  async function saveRichJournal(){
    const entry=currentEntry(),editor=document.querySelector('#v1325JournalEditor');if(!entry||!editor)return false;
    const html=safeJournalHtml(editor.innerHTML),plain=plainTextFromHtml(html),tempRaw=document.querySelector('#v1325JournalTemperature')?.value?.trim()??'';
    entry.context={location:document.querySelector('#v1325JournalLocation')?.value?.trim()||'',weather:document.querySelector('#v1325JournalWeather')?.value||'',temperature:tempRaw===''?'':Number(tempRaw),temperatureUnit:document.querySelector('#v1325JournalTemperatureUnit')?.value==='C'?'C':'F',occasion:document.querySelector('#v1325JournalOccasion')?.value||''};
    entry.journalHtml=html;entry.notes=plain;entry.updated=Date.now();
    const eraSelect=document.querySelector('#v1325JournalEra');if(eraSelect&&window.AudreyEraFoundation?.assign)window.AudreyEraFoundation.assign(entry,eraSelect.value,'personal');
    const visiblePhotos=[...document.querySelectorAll('#v1325JournalPhotoGrid .v1325-journal-photo img')].map(img=>img.src).filter(Boolean).slice(0,3);entry.journalPhotos=visiblePhotos;
    const legacy=document.querySelector('#journalDetailNotesInput');if(legacy)legacy.value=plain;
    try{
      await saveState();if(typeof renderJournal==='function')renderJournal();
      const summary=document.querySelector('#journalDetailNotesSummary');if(summary)summary.textContent=(plain||visiblePhotos.length)?'Journal saved':'Write something…';
      const feedback=document.querySelector('#v1325JournalSaveFeedback');if(feedback){feedback.textContent=`✓ Saved ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;feedback.classList.remove('error');feedback.classList.add('show');}
      const button=document.querySelector('#v1325SaveJournalBtn');if(button){const prior=button.textContent;button.textContent='Saved ✓';button.classList.add('v1325-journal-save-success');setTimeout(()=>{button.textContent=prior;button.classList.remove('v1325-journal-save-success');},1200);}
      if(typeof toast==='function')toast('Journal saved');return true;
    }catch(err){console.error('[v13.25 journal fixes] rich journal save failed',err);const feedback=document.querySelector('#v1325JournalSaveFeedback');if(feedback){feedback.textContent='Could not save — please try again.';feedback.classList.add('error','show');}return false;}
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      /* Keep worn pieces visually consistent and let the photo carry the Journal page. */
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item{flex:0 0 88px;width:88px;padding:6px;align-items:center;justify-content:center}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>img,#journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>.wear-placeholder{width:76px!important;height:92px!important;object-fit:contain!important;border-radius:10px;background:#f1eadf}
      #journalDetailDialog #journalDetailItems.v1325-look-strip .journal-detail-item>div:last-child{display:none!important}
      .v1325-reader-look-card{flex:0 0 104px!important;width:104px;padding:7px!important;display:flex;align-items:center;justify-content:center;cursor:pointer}
      .v1325-reader-look-card img,.v1325-reader-look-ph{width:90px!important;height:108px!important;object-fit:contain!important;background:rgba(255,255,255,.42);border-radius:11px}
      .v1325-reader-look-card strong,.v1325-reader-look-card small{display:none!important}
      .v1325-reader-photos img{cursor:zoom-in}
      #${LIGHTBOX_ID}{position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;padding:18px 52px;background:rgba(29,24,20,.90);backdrop-filter:blur(4px);touch-action:pan-y}
      #${LIGHTBOX_ID}.open{display:flex}
      #${LIGHTBOX_ID} .v1325-lightbox-image{max-width:100%;max-height:86dvh;object-fit:contain;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.38);user-select:none;-webkit-user-drag:none}
      #${LIGHTBOX_ID} .v1325-lightbox-close{position:absolute;top:max(14px,env(safe-area-inset-top));right:14px;width:42px;height:42px;border:1px solid rgba(255,255,255,.34);border-radius:50%;background:rgba(25,22,19,.72);color:white;font-size:25px;line-height:1}
      #${LIGHTBOX_ID} .v1325-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:54px;border:0;border-radius:14px;background:rgba(25,22,19,.58);color:#fff;font-size:28px;line-height:1}
      #${LIGHTBOX_ID} .v1325-lightbox-prev{left:7px}#${LIGHTBOX_ID} .v1325-lightbox-next{right:7px}
      #${LIGHTBOX_ID} .v1325-lightbox-count{position:absolute;bottom:max(14px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);padding:5px 9px;border-radius:999px;background:rgba(25,22,19,.62);color:#fff;font-size:.75rem}
      #${LIGHTBOX_ID}.single .v1325-lightbox-nav,#${LIGHTBOX_ID}.single .v1325-lightbox-count{display:none}
    `;document.head.appendChild(style);
  }
  function ensureLightbox(){
    const dialog=document.querySelector('#v1325JournalReaderDialog');if(!dialog)return null;
    let box=dialog.querySelector('#'+LIGHTBOX_ID);if(box)return box;
    box=document.createElement('div');box.id=LIGHTBOX_ID;box.innerHTML='<button type="button" class="v1325-lightbox-close" aria-label="Close enlarged photo">×</button><button type="button" class="v1325-lightbox-nav v1325-lightbox-prev" aria-label="Previous photo">‹</button><img class="v1325-lightbox-image" alt="Enlarged journal photo"><button type="button" class="v1325-lightbox-nav v1325-lightbox-next" aria-label="Next photo">›</button><span class="v1325-lightbox-count" aria-live="polite"></span>';
    dialog.appendChild(box);
    const close=()=>box.classList.remove('open');box.querySelector('.v1325-lightbox-close').onclick=close;box.querySelector('.v1325-lightbox-prev').onclick=e=>{e.stopPropagation();showLightboxIndex(lightboxIndex-1);};box.querySelector('.v1325-lightbox-next').onclick=e=>{e.stopPropagation();showLightboxIndex(lightboxIndex+1);};
    box.addEventListener('click',e=>{if(e.target===box)close();});
    box.addEventListener('touchstart',e=>{lightboxTouchX=e.touches?.[0]?.clientX??null;},{passive:true});
    box.addEventListener('touchend',e=>{if(lightboxTouchX==null)return;const end=e.changedTouches?.[0]?.clientX??lightboxTouchX,delta=end-lightboxTouchX;lightboxTouchX=null;if(Math.abs(delta)<42)return;showLightboxIndex(lightboxIndex+(delta<0?1:-1));},{passive:true});
    return box;
  }
  function showLightboxIndex(index){
    const box=ensureLightbox();if(!box||!lightboxPhotos.length)return;
    lightboxIndex=(index+lightboxPhotos.length)%lightboxPhotos.length;
    const current=lightboxPhotos[lightboxIndex],img=box.querySelector('.v1325-lightbox-image');img.src=current.src;img.alt=current.alt||`Journal photo ${lightboxIndex+1}`;
    box.querySelector('.v1325-lightbox-count').textContent=`${lightboxIndex+1} / ${lightboxPhotos.length}`;box.classList.toggle('single',lightboxPhotos.length<2);box.classList.add('open');
  }
  function openPhotoGallery(clicked){
    const reader=document.querySelector('#v1325JournalReaderDialog');if(!reader)return;
    const images=[...reader.querySelectorAll('.v1325-reader-photos img')];lightboxPhotos=images.map(img=>({src:img.src,alt:img.alt}));lightboxIndex=Math.max(0,images.indexOf(clicked));showLightboxIndex(lightboxIndex);
  }
  function openReaderItem(card){
    const itemId=card?.dataset?.itemId,reader=document.querySelector('#v1325JournalReaderDialog'),journalId=reader?.dataset?.journalId;if(!itemId||!journalId)return;
    if(reader.open)reader.close();
    viewingJournalId=journalId;
    if(typeof openJournalItemPreview==='function')openJournalItemPreview(itemId);
  }

  document.addEventListener('click',event=>{
    const viewButton=event.target.closest?.('#v1325JournalViewBtn');if(viewButton){
      event.preventDefault();event.stopImmediatePropagation();const id=String(viewingJournalId||''),entry=entryById(id);
      if(id&&window.AudreyJournalExperienceDev3?.openReader){window.AudreyJournalExperienceDev3.openReader(id);requestAnimationFrame(()=>syncReaderExperience(entry));setTimeout(()=>syncReaderExperience(entry),0);}return;
    }
    const saveButton=event.target.closest?.('#v1325SaveJournalBtn');if(saveButton){event.preventDefault();event.stopImmediatePropagation();saveRichJournal();return;}
    const removeButton=event.target.closest?.('[data-journal-photo-remove]');if(removeButton){const ok=window.confirm('Remove this photo from the Journal?\n\nIt will be deleted from this Journal entry when you save.');if(!ok){event.preventDefault();event.stopImmediatePropagation();return;}setTimeout(()=>{const feedback=document.querySelector('#v1325JournalSaveFeedback');if(feedback){feedback.textContent='Photo removed — Save journal to delete it from the entry.';feedback.classList.add('show');}},0);return;}
    const readerPhoto=event.target.closest?.('#v1325JournalReaderDialog .v1325-reader-photos img');if(readerPhoto){event.preventDefault();event.stopImmediatePropagation();openPhotoGallery(readerPhoto);return;}
    const readerItem=event.target.closest?.('#v1325JournalReaderDialog .v1325-reader-look-card');if(readerItem){event.preventDefault();event.stopImmediatePropagation();openReaderItem(readerItem);return;}
  },true);
  document.addEventListener('keydown',event=>{
    const card=event.target.closest?.('#v1325JournalReaderDialog .v1325-reader-look-card');if(card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openReaderItem(card);}
    const box=document.querySelector('#'+LIGHTBOX_ID);if(!box?.classList.contains('open'))return;if(event.key==='ArrowLeft')showLightboxIndex(lightboxIndex-1);else if(event.key==='ArrowRight')showLightboxIndex(lightboxIndex+1);else if(event.key==='Escape'){event.preventDefault();box.classList.remove('open');}
  },true);

  const open0=openJournalDetail;
  openJournalDetail=function(){const out=open0.apply(this,arguments),entry=currentEntry();requestAnimationFrame(()=>{restoreRichJournalMarkup(entry);syncDetailLookLabel(entry);});setTimeout(()=>{restoreRichJournalMarkup(entry);syncDetailLookLabel(entry);},0);return out;};

  installStyles();
  window.AudreyJournalDev3FunctionalFixes={version:VERSION,saveRichJournal,restore:()=>restoreRichJournalMarkup(currentEntry()),lookLabel,showReader:syncReaderExperience};
})();
