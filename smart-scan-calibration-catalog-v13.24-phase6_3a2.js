/* Audrey Closet v13.24 — Smart Scan Phase 6.3A2 Catalog Photo Picker
 * Makes Calibration Lab photo selection explicit by sourcing test images directly from Closet catalog items.
 * Preview/development only. Does not modify catalog items, saved photos, or normal Smart Scan behavior.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a2-catalog-picker1';
  const SELECTED_KEY='audreySmartScanCalibrationSelectedItemId';
  const P42=window.AUDREY_SMART_SCAN_PHASE42;
  const P53=window.AUDREY_SMART_SCAN_PHASE53;
  const P62=window.AUDREY_SMART_SCAN_PHASE62;
  const LAB=window.AUDREY_SMART_SCAN_CALIBRATION;
  if(!P42||!P53||!P62||!LAB){console.warn('Smart Scan Calibration catalog picker skipped: Calibration Lab dependencies unavailable.');return}

  let selectedId='';
  let lastCatalogReport=null;
  function clone(x){return JSON.parse(JSON.stringify(x))}
  function escHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(v){return Math.round((Number(v)||0)*1000)/10+'%'}
  function num(v,d=2){return Number(v||0).toFixed(d)}
  function catalogItems(){try{return Array.isArray(state?.items)?state.items.filter(i=>i&&i.photo):[]}catch{return []}}
  function itemLabel(item){
    const primary=String(item?.name||'').trim()||String(item?.type||'').trim()||String(item?.category||'').trim()||'Catalog item';
    const details=[item?.brand,item?.color,item?.pattern].map(x=>String(x||'').trim()).filter(Boolean);
    return details.length?primary+' · '+details.join(' · '):primary;
  }
  function selectedItem(){const items=catalogItems();return items.find(i=>String(i.id)===String(selectedId))||items[0]||null}
  function loadSelected(){try{selectedId=localStorage.getItem(SELECTED_KEY)||''}catch{}const item=selectedItem();if(item)selectedId=String(item.id||'')}
  function saveSelected(){try{localStorage.setItem(SELECTED_KEY,selectedId)}catch{}}

  function ensureStyles(){
    if(document.getElementById('sscCatalogPickerStyles'))return;
    const s=document.createElement('style');s.id='sscCatalogPickerStyles';s.textContent=`
      .ssc-photo-picker{border:1px solid rgba(90,90,80,.14);border-radius:12px;padding:10px;margin:10px 0 12px}
      .ssc-photo-picker h4{margin:0 0 8px}.ssc-photo-picker select{width:100%;min-height:42px;margin-bottom:9px}
      .ssc-photo-preview{display:grid;grid-template-columns:92px 1fr;gap:10px;align-items:center;padding:8px;border-radius:10px;background:rgba(255,255,255,.38)}
      .ssc-photo-preview img{width:92px;height:92px;object-fit:contain;border-radius:9px;background:rgba(255,255,255,.65);border:1px solid rgba(90,90,80,.12)}
      .ssc-photo-preview strong{display:block;margin-bottom:4px}.ssc-photo-preview p{margin:3px 0;font-size:.82rem;line-height:1.35}
      .ssc-photo-none{font-size:.84rem;opacity:.72}.ssc-photo-source-note{font-size:.78rem;opacity:.72;margin:8px 0 0}
    `;document.head.appendChild(s)
  }

  function pickerHtml(){
    const items=catalogItems(),item=selectedItem();
    if(!items.length)return `<section class="ssc-photo-picker"><h4>Calibration photo</h4><p class="ssc-photo-none">No Closet catalog items with photos are available yet.</p></section>`;
    const options=items.map(i=>`<option value="${escHtml(i.id)}" ${String(i.id)===String(item?.id)?'selected':''}>${escHtml(itemLabel(i))}</option>`).join('');
    return `<section class="ssc-photo-picker"><h4>Calibration photo</h4><select id="sscCatalogPhotoSelect" aria-label="Choose catalog photo">${options}</select><div id="sscCatalogPhotoPreview"></div><p class="ssc-photo-source-note">The image shown below is the exact catalog photo used when you tap Test selected catalog photo.</p></section>`;
  }

  function renderPreview(){
    const host=document.getElementById('sscCatalogPhotoPreview');if(!host)return;
    const item=selectedItem();if(!item){host.innerHTML='<p class="ssc-photo-none">Select a catalog item with a photo.</p>';return}
    host.innerHTML=`<div class="ssc-photo-preview"><img src="${escHtml(item.photo)}" alt="Selected calibration catalog item"><div><strong>${escHtml(String(item.name||'').trim()||String(item.type||'').trim()||'Catalog item')}</strong><p>${escHtml([item.category,item.type].filter(Boolean).join(' · ')||'Catalog item')}</p><p>${escHtml([item.brand,item.color,item.pattern].filter(Boolean).join(' · '))}</p></div></div>`;
  }

  function renderReport(report){
    const host=document.getElementById('sscResult');if(!host)return;
    const row=(label,b,c)=>`<p class="${b!==c?'ssc-change':''}">${label}: ${escHtml(b||'—')} → ${escHtml(c||'—')}</p>`;
    const pd=report.diagnostics.pattern?.features?.graphic||{},cd=report.diagnostics.category?.features||{},col=report.diagnostics.color||{};
    host.innerHTML=`<div class="ssc-result-grid"><div class="ssc-result-card"><h5>Catalog baseline</h5><p>Color: ${escHtml(report.baseline.color||'—')}</p><p>Pattern: ${escHtml(report.baseline.pattern||'—')}</p><p>Category: ${escHtml(report.baseline.category||'—')}</p><p>Type: ${escHtml(report.catalog.type||'—')}</p></div><div class="ssc-result-card"><h5>Calibrated</h5><p>Color: ${escHtml(report.calibrated.color||'—')}</p><p>Pattern: ${escHtml(report.calibrated.pattern||'—')}</p><p>Category: ${escHtml(report.calibrated.category||'—')}</p><p>Type: —</p></div></div><div class="ssc-metrics"><strong>Testing:</strong> ${escHtml(report.catalog.label)}<br>${row('Color',report.baseline.color,report.calibrated.color)}${row('Pattern',report.baseline.pattern,report.calibrated.pattern)}${row('Category',report.baseline.category,report.calibrated.category)}<br><strong>Graphic evidence:</strong> region ${pct(pd.largestShare)}, spread ${pct(pd.localizedCoverage)}, secondary ${pct(pd.secondaryShare)}.<br><strong>Category evidence:</strong> split ${pct(cd.splitShare)}, bottom ratio ${num(cd.bottomRatio)}, shoulder ratio ${num(cd.shoulderRatio)}.<br><strong>Color evidence:</strong> bright neutral ${pct(col.white?.brightNeutralShare)}, near-black ${pct(col.neutral?.nearBlackShare)}.</div>`;
  }

  async function testSelectedCatalogPhoto(){
    const item=selectedItem();
    if(!item?.photo){const host=document.getElementById('sscResult');if(host)host.innerHTML='<p>Select a Closet catalog item with a photo first.</p>';return null}
    const root=document.getElementById('smartScanCalibrationLab'),btn=document.getElementById('sscTestPhotoBtn');
    root?.classList.add('ssc-running');if(btn)btn.textContent='Testing selected photo…';
    try{
      const baseline=await P62.analyzeImage(item.photo);
      const d42=clone(P42.lastDiagnostics||{}),d53=clone(P53.lastDiagnostics||{}),d62=clone(P62.lastDiagnostics||{});
      const c=LAB.calibratedColor(d42),p=LAB.calibratedPattern(d53),k=LAB.calibratedCategory(d62);
      lastCatalogReport={version:VERSION,createdAt:new Date().toISOString(),catalog:{id:item.id,label:itemLabel(item),category:item.category||'',type:item.type||'',brand:item.brand||'',storedColor:item.color||'',storedPattern:item.pattern||''},baseline:{color:baseline.color||'',pattern:baseline.pattern||'',category:baseline.category||'',type:''},calibrated:{color:c.color||'',pattern:p.pattern||'',category:k.category||'',type:''},reasons:{color:c.reason,pattern:p.reason,category:k.reason},diagnostics:{color:d42,pattern:d53,category:d62},settings:LAB.getSettings()};
      renderReport(lastCatalogReport);console.info('Audrey Smart Scan Calibration catalog report',lastCatalogReport);return lastCatalogReport;
    }catch(err){console.error(err);const host=document.getElementById('sscResult');if(host)host.innerHTML=`<p>Calibration test failed: ${escHtml(err?.message||err)}</p>`;return null}
    finally{root?.classList.remove('ssc-running');if(btn)btn.textContent='Test selected catalog photo'}
  }

  function enhance(){
    const details=document.getElementById('smartScanCalibrationLab');if(!details||document.getElementById('sscCatalogPhotoSelect'))return;
    ensureStyles();loadSelected();
    const intro=details.querySelector('.ssc-lab-intro');if(intro)intro.insertAdjacentHTML('afterend',pickerHtml());
    const select=document.getElementById('sscCatalogPhotoSelect');
    if(select){select.value=selectedId||select.value;selectedId=select.value;saveSelected();select.addEventListener('change',()=>{selectedId=select.value;saveSelected();renderPreview();const host=document.getElementById('sscResult');if(host)host.innerHTML='<p class="muted">Catalog photo changed. Adjust calibration sliders, then test the selected photo.</p>'});renderPreview()}
    const btn=document.getElementById('sscTestPhotoBtn');if(btn){btn.textContent='Test selected catalog photo';btn.onclick=testSelectedCatalogPhoto}
    const result=document.getElementById('sscResult');if(result)result.innerHTML='<p class="muted">Choose a catalog photo above, adjust a slider, then test the selected photo.</p>';
  }

  window.AUDREY_SMART_SCAN_CALIBRATION_CATALOG={version:VERSION,testSelectedCatalogPhoto,getSelectedItem:()=>clone(selectedItem()),getLastReport:()=>clone(lastCatalogReport)};
  const tryEnhance=()=>{enhance();if(!document.getElementById('sscCatalogPhotoSelect'))setTimeout(enhance,150)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryEnhance,{once:true});else tryEnhance();
  console.info(`Audrey Smart Scan ${VERSION} loaded: Calibration Lab now uses explicit Closet catalog photo selection.`);
})();
