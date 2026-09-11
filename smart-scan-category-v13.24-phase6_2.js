/* Audrey Closet v13.24 — Smart Scan Phase 6.2
 * Narrow category regression fix on top of Phase 6.1.
 * Restores strong dress silhouettes that Phase 6.1's Tops prior could overtake.
 * Long-sleeve Tops improvements remain intact.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase6.2-dress1';
  const PHASE6=window.AUDREY_SMART_SCAN_PHASE6;
  const PHASE61=window.AUDREY_SMART_SCAN_PHASE61;
  const VISUAL_ANALYZE=PHASE61?.visualAnalyzeImage||PHASE6?.visualAnalyzeImage||null;
  const SIZE=160;
  const CATEGORIES=['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc'];

  if(!PHASE6?.buildForegroundMask||!PHASE6?.silhouetteFeatures||!PHASE61?.scoreCategoriesRefined||!VISUAL_ANALYZE){
    console.warn('Audrey Smart Scan Phase 6.2 skipped: Phase 6/6.1 dependencies unavailable.');
    return;
  }

  function imageFromLocal(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  function dressShapeEvidence(f){
    if(!f)return{strong:false,score:0,flareVsShoulder:0};
    const flareVsShoulder=f.bottomRatio/Math.max(.01,f.shoulderRatio);
    let score=0;
    if(f.splitShare<.12)score+=.22;
    if(f.aspect>=1.08&&f.aspect<=2.05)score+=.16;
    if(f.bottomRatio>=1.16)score+=.18;
    if(f.bottomRatio>=1.26)score+=.18;
    if(f.shoulderRatio<.96)score+=.12;
    if(f.shoulderRatio<.86)score+=.10;
    if(flareVsShoulder>=1.38)score+=.16;
    if(flareVsShoulder>=1.55)score+=.10;
    const strong=f.splitShare<.12&&f.aspect>=1.08&&f.bottomRatio>=1.24&&f.shoulderRatio<.96&&flareVsShoulder>=1.36;
    return{strong,score,flareVsShoulder};
  }

  function classifyCategoryPhase62(features){
    if(!features)return{category:'Misc',confidence:.18,reason:'no-silhouette',scores:{}};
    const base=PHASE61.classifyCategoryRefined(features),scores={...(base.scores||PHASE61.scoreCategoriesRefined(features))},dress=dressShapeEvidence(features);

    // Strong dress geometry takes precedence over the generic Tops prior introduced in Phase 6.1.
    if(dress.strong){
      scores.Dresses=Math.max(scores.Dresses||0,(scores.Tops||0)+.18);
      return{category:'Dresses',confidence:clamp(.68+dress.score*.18,.68,.94),reason:'phase6.2-strong-dress-flare',scores,dress};
    }

    // Borderline safeguard: only flip Tops when the original Dress score was already competitive
    // and the silhouette has clear lower flare with a narrower upper body.
    if(base.category==='Tops'&&features.splitShare<.12&&features.bottomRatio>=1.18&&features.shoulderRatio<.92&&dress.flareVsShoulder>=1.32){
      const dressScore=scores.Dresses||0,topScore=scores.Tops||0;
      if(dressScore>=topScore-.22){
        scores.Dresses=Math.max(dressScore,topScore+.06);
        return{category:'Dresses',confidence:clamp(.60+dress.score*.15,.60,.88),reason:'phase6.2-dress-over-top',scores,dress};
      }
    }

    return{...base,reason:base.reason||'phase6.1-refined-silhouette',dress};
  }

  async function analyzeCategoryPhase62(dataURL){
    const img=await imageFromLocal(dataURL),c=document.createElement('canvas');c.width=c.height=SIZE;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,SIZE,SIZE);ctx.drawImage(img,0,0,SIZE,SIZE);
    const im=ctx.getImageData(0,0,SIZE,SIZE),maskInfo=PHASE6.buildForegroundMask(im.data,SIZE,SIZE),features=PHASE6.silhouetteFeatures(maskInfo,SIZE,SIZE),decision=classifyCategoryPhase62(features);
    window.AUDREY_SMART_SCAN_PHASE62.lastDiagnostics={version:VERSION,category:decision.category,confidence:decision.confidence,reason:decision.reason,scores:decision.scores||{},dress:decision.dress||null,features:features?{aspect:features.aspect,fill:features.fill,shoulderRatio:features.shoulderRatio,bottomRatio:features.bottomRatio,topRatio:features.topRatio,splitShare:features.splitShare,pairScore:features.pairScore,components:features.components.length,alphaAware:features.alphaAware}:null};
    return decision;
  }

  async function analyzeImagePhase62(dataURL){
    const visual=await VISUAL_ANALYZE(dataURL);let categoryResult={category:'',confidence:0};
    try{categoryResult=await analyzeCategoryPhase62(dataURL)}catch(err){console.warn('Smart Scan Phase 6.2 category analysis skipped',err)}
    return{...visual,category:categoryResult.category||'',categoryConfidence:categoryResult.confidence||0};
  }

  window.smartScan=async function(target='item'){
    smartScanTarget=target==='wish'?'wish':'item';const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;if(!photo)return toast('Take or choose a photo first');
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent='Scanning category, color, pattern and visible text…'}else setPhotoBusy(true,'Scanning category, color, pattern and visible text…');
    try{
      const visual=await analyzeImagePhase62(photo);let ocr='';try{ocr=await tryOCR(photo)}catch{}const flat=ocr.replace(/\n/g,' ');
      const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];
      const brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(flat))||'';const sm=flat.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);
      pendingSmartScanResult={category:CATEGORIES.includes(visual.category)?visual.category:'',color:visual.color||'',pattern:visual.pattern||'',brand,size:sm?sm[1].toUpperCase():''};
      openSmartScanReview(pendingSmartScanResult);$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan complete. Review detected details before applying.';
    }catch(err){console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.'}
    finally{if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false})}else setPhotoBusy(false)}
  };

  window.AUDREY_SMART_SCAN_PHASE62={version:VERSION,categories:CATEGORIES,dressShapeEvidence,classifyCategoryPhase62,analyzeCategory:analyzeCategoryPhase62,visualAnalyzeImage:VISUAL_ANALYZE,analyzeImage:analyzeImagePhase62,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase62;
  console.info(`Audrey Smart Scan ${VERSION} installed: strong dress flare protected from Tops fallback.`);
})();
