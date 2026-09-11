/* Audrey Closet v13.24 — Smart Scan Phase 6.3A Calibration Lab
 * Preview/development calibration UI layered on frozen Local Smart Scan v1.
 * Does NOT change normal Smart Scan results, saved closet data, or Phase 4.2/5.3/6.2 defaults.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a-calibration1';
  const STORAGE_KEY='audreySmartScanCalibrationV1';
  const P42=window.AUDREY_SMART_SCAN_PHASE42;
  const P53=window.AUDREY_SMART_SCAN_PHASE53;
  const P61=window.AUDREY_SMART_SCAN_PHASE61;
  const P62=window.AUDREY_SMART_SCAN_PHASE62;
  if(!P42||!P53||!P61||!P62){console.warn('Smart Scan Calibration Lab skipped: Phase 4.2/5.3/6.1/6.2 dependencies unavailable.');return}

  const DEFAULTS={
    pattern:{graphicMinRegion:.065,graphicMaxCoverage:.42,smallLogoMaxRegion:.06,plaidMinAxis:.15,plaidMinCoverage:.42,stripeMinScore:.52},
    color:{whiteBrightShare:.48,blackNearShare:.72,dominantColorMaxForWhite:.34},
    category:{dressBottomRatio:1.24,dressFlareRatio:1.36,bottomSplitHigh:.36,topsPrior:.18}
  };
  let settings=loadSettings();
  let lastReport=null;

  function clone(x){return JSON.parse(JSON.stringify(x))}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function loadSettings(){try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return merge(DEFAULTS,parsed||{})}catch{return clone(DEFAULTS)}}
  function merge(base,extra){const out=clone(base);for(const g of Object.keys(out))if(extra[g])for(const k of Object.keys(out[g]))if(Number.isFinite(Number(extra[g][k])))out[g][k]=Number(extra[g][k]);return out}
  function saveSettings(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings))}catch{}}
  function resetSettings(){settings=clone(DEFAULTS);saveSettings();syncControls();renderReport(null)}
  function pct(v){return Math.round(v*1000)/10+'%'}
  function num(v,d=2){return Number(v||0).toFixed(d)}
  function escHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  const CONTROL_GROUPS=[
    {id:'pattern',title:'Pattern calibration',controls:[
      ['graphicMinRegion','Graphic minimum size',.03,.16,.005,v=>pct(v),'Smaller values allow smaller localized designs to qualify as Graphic.'],
      ['graphicMaxCoverage','Graphic spread limit',.20,.65,.01,v=>pct(v),'Maximum torso coverage before a design stops looking localized.'],
      ['smallLogoMaxRegion','Small-logo protection',.02,.12,.005,v=>pct(v),'Maximum localized region still protected as a mostly Solid garment.'],
      ['plaidMinAxis','Plaid two-axis sensitivity',.05,.30,.01,v=>num(v,2),'Minimum horizontal and vertical transition evidence.'],
      ['plaidMinCoverage','Plaid coverage requirement',.20,.70,.01,v=>pct(v),'How broadly non-dominant structure must cover the torso.'],
      ['stripeMinScore','Stripe repetition sensitivity',.30,.80,.01,v=>num(v,2),'Minimum repeated-stripe score. Lower is more permissive.']
    ]},
    {id:'color',title:'Color calibration',controls:[
      ['whiteBrightShare','White vs Gray sensitivity',.25,.75,.01,v=>pct(v),'Bright-neutral share needed to promote a garment to White.'],
      ['blackNearShare','Black vs Gray sensitivity',.45,.90,.01,v=>pct(v),'Near-black neutral share needed to classify true Black.'],
      ['dominantColorMaxForWhite','White chromatic tolerance',.15,.55,.01,v=>pct(v),'Maximum competing chromatic cluster share allowed by the White fallback.']
    ]},
    {id:'category',title:'Category calibration',controls:[
      ['dressBottomRatio','Dress lower-flare threshold',1.08,1.45,.01,v=>num(v,2),'How wide the lower garment must be relative to the middle.'],
      ['dressFlareRatio','Dress flare-vs-shoulder threshold',1.15,1.75,.01,v=>num(v,2),'Lower-to-upper flare required by the Dress safeguard.'],
      ['bottomSplitHigh','Bottoms leg-split sensitivity',.22,.50,.01,v=>pct(v),'Leg-split evidence required for a strong Bottoms score.'],
      ['topsPrior','Tops preference',.05,.35,.01,v=>num(v,2),'Starting Tops score for garment-like uncertain shapes.']
    ]}
  ];

  function normalizedSolid(diag){const shares=diag?.normalization?.after?.shares||{};const sorted=Object.values(shares).sort((a,b)=>b-a),top=sorted[0]||0,second=sorted[1]||0;if(top>=.86&&second<=.06)return{pattern:'Solid',confidence:.94,reason:'calibration-normalized-solid-strong'};if(top>=.76&&second<=.10)return{pattern:'Solid',confidence:.89,reason:'calibration-normalized-solid'};return null}
  function calibratedPattern(diag){
    if(!diag?.features)return{pattern:diag?.pattern||'',reason:'no-pattern-diagnostics'};
    const solid=normalizedSolid(diag);if(solid)return solid;
    const {graphic:g,plaid:p,floral:f,colorblock:cb,stripe}=diag.features,s=settings.pattern;
    if(g.dominantShare>=.74&&g.secondaryShare<=.065&&g.largestShare<=s.smallLogoMaxRegion)return{pattern:'Solid',confidence:.92,reason:'calibrated-small-logo-solid'};
    if(stripe?.best?.score>=s.stripeMinScore&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35)return{pattern:'Stripe',confidence:.88,reason:'calibrated-repeated-stripe'};
    if(p.axes.horizontal>=s.plaidMinAxis&&p.axes.vertical>=s.plaidMinAxis&&p.runs.rows>=.12&&p.runs.cols>=.12&&p.nonDominantCoverage>=s.plaidMinCoverage&&p.edgeReach>=.50&&g.localizedCoverage>=.38)return{pattern:'Plaid',confidence:.86,reason:'calibrated-torso-wide-plaid'};
    const coherent=g.secondaryShare>=.085&&g.secondaryShare<=.48&&g.largestShare>=s.graphicMinRegion&&g.localizedCoverage<=s.graphicMaxCoverage;
    const complex=g.internalVariation>=.35||g.partCount>=2||g.largestBoxShare>=.08;
    const torso=P53.torso||{x0:6,x1:25};
    const centerOrEdge=g.centerDistance<=.34||(g.largest&&((g.largest.minX<=torso.x0+3)||(g.largest.maxX>=torso.x1-3)));
    if(coherent&&complex&&centerOrEdge)return{pattern:'Graphic',confidence:.87,reason:'calibrated-localized-graphic'};
    if(g.secondaryShare>=.10&&g.secondaryShare<=.40&&g.largestShare>=Math.max(.09,s.graphicMinRegion)&&g.localizedCoverage<=Math.min(.34,s.graphicMaxCoverage))return{pattern:'Graphic',confidence:.79,reason:'calibrated-substantial-graphic'};
    if(cb.meaningfulParts>=2&&cb.meaningfulParts<=4&&g.internalVariation<.35&&g.localizedCoverage>=.28)return{pattern:'Colorblock',confidence:.72,reason:'calibrated-large-simple-regions'};
    if(f.meaningful>=3&&f.coverage>=.38&&f.smallComponents>=7)return{pattern:'Floral/Print',confidence:.84,reason:'calibrated-distributed-print'};
    return{pattern:'Other',confidence:.40,reason:'calibrated-pattern-fallback'};
  }

  function calibratedColor(diag){
    if(!diag)return{color:'',reason:'no-color-diagnostics'};
    const s=settings.color;let color=diag.winner?.label||diag.color||'Multicolor',reason='calibrated-cluster';
    const clusters=diag.clusters||[];const largestChromatic=clusters.filter(x=>x.family!=='neutral').reduce((m,x)=>Math.max(m,Number(x.share)||0),0);
    const w=diag.white||{};
    if((w.brightNeutralShare>=s.whiteBrightShare&&w.l90>=84)||(w.score>=.45&&largestChromatic<s.dominantColorMaxForWhite)){color='White';reason='calibrated-white-distribution'}
    const n=diag.neutral||{};
    if((color==='Black'||color==='Gray')&&n.totalNeutral){if(n.nearBlackShare>=s.blackNearShare&&n.charcoalShare<.20){color='Black';reason='calibrated-black-distribution'}else if(n.nearBlackShare<Math.min(.58,s.blackNearShare-.06)&&(n.charcoalShare+n.grayishShare)>.34){color='Gray';reason='calibrated-charcoal-distribution'}}
    return{color,reason};
  }

  function scoreCategoriesCalibrated(f){
    const s=settings.category,scores={Tops:s.topsPrior,Bottoms:.12,Dresses:.06,Outerwear:.02,Shoes:0,Accessories:0,Misc:.01};
    const {aspect,fill,shoulderRatio,bottomRatio,splitShare,components,pairScore}=f,garmentLike=P61.detectGarmentLike(f);
    if(components.length>=2&&pairScore>=.68){scores.Shoes+=.86;scores.Accessories+=.10}if(aspect<=.62&&fill<.60){scores.Shoes+=.38;scores.Accessories+=.20}
    const hi=s.bottomSplitHigh,mid=Math.max(.12,hi-.14),low=Math.max(.08,hi-.22);if(splitShare>=hi)scores.Bottoms+=.86;else if(splitShare>=mid)scores.Bottoms+=.52;else if(splitShare>=low)scores.Bottoms+=.16;
    if(aspect>=.78&&aspect<=1.82&&bottomRatio>=.80&&shoulderRatio<1.12)scores.Bottoms+=.16;
    if(aspect>=1.12&&splitShare<.14&&bottomRatio>=1.13)scores.Dresses+=.72;if(aspect>=1.35&&bottomRatio>=1.02&&splitShare<.12)scores.Dresses+=.20;
    scores.Tops+=P61.shirtLikeEvidence(f);if(garmentLike){scores.Tops+=.10;if(splitShare>=.16)scores.Bottoms+=.05}scores.Outerwear+=P61.outerwearEvidence(f);
    if(aspect<.56||aspect>2.10)scores.Accessories+=.40;if(fill<.22&&splitShare<.15)scores.Accessories+=.22;if(components.length>2)scores.Accessories+=.10;if(!garmentLike&&pairScore<.68)scores.Misc+=.12;
    return{scores,garmentLike};
  }
  function calibratedCategory(diag){
    const f=diag?.features;if(!f)return{category:diag?.category||'Misc',reason:'no-category-features'};
    const s=settings.category,{scores,garmentLike}=scoreCategoriesCalibrated({...f,components:new Array(f.components||1).fill({})});
    const flare=f.bottomRatio/Math.max(.01,f.shoulderRatio);
    if(f.splitShare<.12&&f.aspect>=1.08&&f.bottomRatio>=s.dressBottomRatio&&f.shoulderRatio<.96&&flare>=s.dressFlareRatio){scores.Dresses=Math.max(scores.Dresses,(scores.Tops||0)+.18);return{category:'Dresses',reason:'calibrated-strong-dress',scores}}
    let ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]),category=ranked[0][0],topScore=ranked[0][1];
    if(category==='Outerwear'&&scores.Tops>=scores.Outerwear-.14&&P61.shirtLikeEvidence(f)>=.46){category='Tops';topScore=scores.Tops}
    if(category==='Misc'&&garmentLike){category=f.splitShare>=.20?'Bottoms':'Tops';topScore=scores[category]}if(garmentLike&&!['Shoes','Accessories','Dresses'].includes(category)&&topScore<.42)category=f.splitShare>=.18?'Bottoms':'Tops';
    return{category,reason:'calibrated-category-score',scores};
  }

  function currentPhoto(){try{if(typeof itemWorkingPhoto!=='undefined'&&itemWorkingPhoto)return{photo:itemWorkingPhoto,target:'Closet item'}}catch{}try{if(typeof wishWorkingPhoto!=='undefined'&&wishWorkingPhoto)return{photo:wishWorkingPhoto,target:'Wishlist item'}}catch{}return null}
  async function testCurrentPhoto(){
    const source=currentPhoto();if(!source){renderMessage('Open a Closet or Wishlist item with a photo first, then return here and tap Test current photo.');return null}
    setBusy(true);
    try{
      const baseline=await P62.analyzeImage(source.photo);
      const d42=clone(P42.lastDiagnostics||{}),d53=clone(P53.lastDiagnostics||{}),d62=clone(P62.lastDiagnostics||{});
      const c=calibratedColor(d42),p=calibratedPattern(d53),k=calibratedCategory(d62);
      lastReport={version:VERSION,target:source.target,createdAt:new Date().toISOString(),baseline:{color:baseline.color||'',pattern:baseline.pattern||'',category:baseline.category||'',type:''},calibrated:{color:c.color,pattern:p.pattern,category:k.category,type:''},reasons:{color:c.reason,pattern:p.reason,category:k.reason},diagnostics:{color:d42,pattern:d53,category:d62},settings:clone(settings)};
      renderReport(lastReport);console.info('Audrey Smart Scan Calibration Lab report',lastReport);return lastReport;
    }catch(err){console.error(err);renderMessage('Calibration test failed: '+(err?.message||err));return null}finally{setBusy(false)}
  }

  function controlHtml(group,key,label,min,max,step,format,help){const value=settings[group][key];return `<label class="ssc-control"><span class="ssc-control-head"><strong>${escHtml(label)}</strong><output data-output="${group}.${key}">${escHtml(format(value))}</output></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-cal-group="${group}" data-cal-key="${key}"><small>${escHtml(help)}</small></label>`}
  function injectStyles(){if(document.getElementById('sscLabStyles'))return;const s=document.createElement('style');s.id='sscLabStyles';s.textContent=`.ssc-lab{margin-top:14px;border-top:1px solid rgba(80,80,70,.16);padding-top:12px}.ssc-lab summary{cursor:pointer;font-weight:700}.ssc-lab-intro{font-size:.86rem;line-height:1.45;margin:8px 0 12px}.ssc-group{border:1px solid rgba(90,90,80,.12);border-radius:12px;padding:10px;margin:10px 0}.ssc-group h4{margin:0 0 8px}.ssc-control{display:block;margin:10px 0 14px}.ssc-control-head{display:flex;justify-content:space-between;gap:10px;font-size:.86rem}.ssc-control input[type=range]{width:100%;margin:7px 0 3px}.ssc-control small{display:block;opacity:.72;line-height:1.3}.ssc-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.ssc-result{margin-top:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,.42)}.ssc-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ssc-result-card{padding:9px;border:1px solid rgba(90,90,80,.12);border-radius:10px}.ssc-result-card h5{margin:0 0 5px}.ssc-result-card p{margin:3px 0;font-size:.84rem}.ssc-change{font-weight:700}.ssc-metrics{margin-top:8px;font-size:.78rem;line-height:1.45;opacity:.82}.ssc-badge{display:inline-block;font-size:.7rem;padding:2px 6px;border-radius:999px;background:rgba(100,110,90,.12);margin-left:5px}.ssc-type-note{font-size:.8rem;opacity:.72;margin:8px 0 0}.ssc-running{opacity:.65;pointer-events:none}`;document.head.appendChild(s)}
  function injectUI(){
    if(document.getElementById('smartScanCalibrationLab'))return;const cards=[...document.querySelectorAll('.settings-card')],card=cards.find(c=>c.querySelector('h3')?.textContent.trim()==='Smart photo scan');if(!card)return;
    injectStyles();const details=document.createElement('details');details.id='smartScanCalibrationLab';details.className='ssc-lab';details.innerHTML=`<summary>Smart Scan Calibration <span class="ssc-badge">Preview Lab</span></summary><p class="ssc-lab-intro">Tune selected Local Smart Scan thresholds and compare them with the frozen Phase 4.2 + 5.3 + 6.2 baseline. These controls are for testing only; normal Smart Scan remains unchanged.</p>${CONTROL_GROUPS.map(g=>`<section class="ssc-group"><h4>${g.title}</h4>${g.controls.map(c=>controlHtml(g.id,...c)).join('')}</section>`).join('')}<section class="ssc-group"><h4>Type calibration</h4><p class="ssc-type-note">Local Smart Scan v1 does not classify Type yet. This section will become active with AI Smart Scan.</p></section><div class="ssc-actions"><button type="button" class="primary" id="sscTestPhotoBtn">Test current photo</button><button type="button" class="soft-btn" id="sscResetBtn">Reset defaults</button></div><div id="sscResult" class="ssc-result"><p class="muted">Open an item with a photo, adjust a slider, then test the current photo.</p></div>`;card.appendChild(details);
    details.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',()=>{const g=input.dataset.calGroup,k=input.dataset.calKey;settings[g][k]=Number(input.value);saveSettings();const spec=CONTROL_GROUPS.find(x=>x.id===g)?.controls.find(x=>x[0]===k),out=details.querySelector(`[data-output="${g}.${k}"]`);if(out&&spec)out.textContent=spec[5](settings[g][k])}));
    details.querySelector('#sscTestPhotoBtn').onclick=testCurrentPhoto;details.querySelector('#sscResetBtn').onclick=()=>{resetSettings();if(typeof toast==='function')toast('Smart Scan calibration reset to Local v1 defaults')};
  }
  function syncControls(){const root=document.getElementById('smartScanCalibrationLab');if(!root)return;root.querySelectorAll('input[data-cal-group]').forEach(input=>{const g=input.dataset.calGroup,k=input.dataset.calKey;input.value=settings[g][k];const spec=CONTROL_GROUPS.find(x=>x.id===g)?.controls.find(x=>x[0]===k),out=root.querySelector(`[data-output="${g}.${k}"]`);if(out&&spec)out.textContent=spec[5](settings[g][k])})}
  function setBusy(on){const root=document.getElementById('smartScanCalibrationLab');root?.classList.toggle('ssc-running',on);const b=document.getElementById('sscTestPhotoBtn');if(b)b.textContent=on?'Testing…':'Test current photo'}
  function renderMessage(message){const host=document.getElementById('sscResult');if(host)host.innerHTML=`<p>${escHtml(message)}</p>`}
  function renderReport(report){const host=document.getElementById('sscResult');if(!host)return;if(!report){host.innerHTML='<p class="muted">Calibration reset. Test a current photo when ready.</p>';return}const row=(label,b,c)=>`<p class="${b!==c?'ssc-change':''}">${label}: ${escHtml(b||'—')} → ${escHtml(c||'—')}</p>`;const pd=report.diagnostics.pattern?.features?.graphic||{},cd=report.diagnostics.category?.features||{},col=report.diagnostics.color||{};host.innerHTML=`<div class="ssc-result-grid"><div class="ssc-result-card"><h5>Baseline</h5><p>Color: ${escHtml(report.baseline.color||'—')}</p><p>Pattern: ${escHtml(report.baseline.pattern||'—')}</p><p>Category: ${escHtml(report.baseline.category||'—')}</p><p>Type: —</p></div><div class="ssc-result-card"><h5>Calibrated</h5><p>Color: ${escHtml(report.calibrated.color||'—')}</p><p>Pattern: ${escHtml(report.calibrated.pattern||'—')}</p><p>Category: ${escHtml(report.calibrated.category||'—')}</p><p>Type: —</p></div></div><div class="ssc-metrics">${row('Color',report.baseline.color,report.calibrated.color)}${row('Pattern',report.baseline.pattern,report.calibrated.pattern)}${row('Category',report.baseline.category,report.calibrated.category)}<br><strong>Graphic evidence:</strong> region ${pct(pd.largestShare||0)}, spread ${pct(pd.localizedCoverage||0)}, secondary ${pct(pd.secondaryShare||0)}.<br><strong>Category evidence:</strong> split ${pct(cd.splitShare||0)}, bottom ratio ${num(cd.bottomRatio||0)}, shoulder ratio ${num(cd.shoulderRatio||0)}.<br><strong>Color evidence:</strong> bright neutral ${pct(col.white?.brightNeutralShare||0)}, near-black ${pct(col.neutral?.nearBlackShare||0)}.</div>`}

  window.AUDREY_SMART_SCAN_CALIBRATION={version:VERSION,defaults:clone(DEFAULTS),getSettings:()=>clone(settings),setSettings:x=>{settings=merge(DEFAULTS,x||{});saveSettings();syncControls()},reset:resetSettings,testCurrentPhoto,getLastReport:()=>clone(lastReport),calibratedPattern,calibratedColor,calibratedCategory};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectUI,{once:true});else injectUI();
  console.info(`Audrey Smart Scan ${VERSION} loaded: calibration lab available in Smart photo scan settings; production scan behavior unchanged.`);
})();
