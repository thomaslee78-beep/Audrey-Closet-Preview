/* Audrey Closet v13.24 — Smart Scan Phase 6.1
 * Category scoring refinement on top of Phase 6.
 * Broadens Tops for long-sleeve shirts/blouses/sweaters/cardigans,
 * tightens Outerwear, and biases garment-like uncertain items toward Tops/Bottoms over Misc.
 * Existing Phase 4.2 color, Phase 5.1 pattern, OCR brand and size behavior are preserved.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase6.1-category2';
  const PHASE6=window.AUDREY_SMART_SCAN_PHASE6;
  const VISUAL_ANALYZE=PHASE6?.visualAnalyzeImage||null;
  const SIZE=160;
  const CATEGORIES=['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc'];

  if(!PHASE6?.buildForegroundMask||!PHASE6?.silhouetteFeatures||!VISUAL_ANALYZE){
    console.warn('Audrey Smart Scan Phase 6.1 skipped: Phase 6 dependencies unavailable.');
    return;
  }

  function imageFromLocal(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  function detectGarmentLike(f){
    if(!f)return false;
    const {aspect,fill,splitShare,pairScore,components,shoulderRatio,bottomRatio}=f;
    if(pairScore>=.68)return false;
    if(aspect<.52||aspect>2.25||fill<.18)return false;
    const mainComponents=components?.length||0;
    const upperBodyLike=splitShare<.22&&shoulderRatio>=.86&&bottomRatio<1.38;
    const lowerBodyLike=splitShare>=.18&&aspect>=.72&&aspect<=1.90;
    return mainComponents>=1&&(upperBodyLike||lowerBodyLike||(fill>=.28&&aspect>=.65&&aspect<=1.98));
  }

  function shirtLikeEvidence(f){
    const {aspect,fill,splitShare,shoulderRatio,bottomRatio,topRatio,components}=f;
    let score=0;
    if(splitShare<.14)score+=.22;
    if(splitShare<.08)score+=.08;
    // Broad range deliberately includes long-sleeve shirts, blouses, cardigans and sweaters.
    if(aspect>=.72&&aspect<=2.00)score+=.17;
    if(aspect>=.88&&aspect<=1.76)score+=.11;
    if(shoulderRatio>=.90)score+=.12;
    if(shoulderRatio>=1.00)score+=.10;
    if(bottomRatio>=.72&&bottomRatio<=1.28)score+=.17;
    if(bottomRatio>=.82&&bottomRatio<=1.15)score+=.08;
    if(topRatio>=.62&&topRatio<=1.32)score+=.05;
    if(fill>=.24&&fill<=.80)score+=.07;
    if((components?.length||0)===1)score+=.05;
    return score;
  }

  function outerwearEvidence(f){
    const {aspect,fill,splitShare,shoulderRatio,bottomRatio}=f;
    let score=0;
    // Outerwear must earn its label with a longer, straighter, denser body profile.
    if(aspect>=1.12&&aspect<=1.92)score+=.10;
    if(aspect>=1.32&&aspect<=1.92)score+=.09;
    if(shoulderRatio>=1.02)score+=.07;
    if(bottomRatio>=.88&&bottomRatio<=1.17)score+=.10;
    if(fill>=.44)score+=.10;
    if(fill>=.54)score+=.06;
    if(splitShare<.08)score+=.06;
    if(aspect<1.08)score-=.12;
    if(fill<.38)score-=.08;
    if(bottomRatio>1.22||bottomRatio<.76)score-=.08;
    return Math.max(0,score);
  }

  function scoreCategoriesRefined(f){
    const scores={Tops:.18,Bottoms:.12,Dresses:.06,Outerwear:.02,Shoes:0,Accessories:0,Misc:.01};
    const {aspect,fill,shoulderRatio,bottomRatio,splitShare,components,pairScore}=f;
    const garmentLike=detectGarmentLike(f);

    if(components.length>=2&&pairScore>=.68){scores.Shoes+=.86;scores.Accessories+=.10}
    if(aspect<=.62&&fill<.60){scores.Shoes+=.38;scores.Accessories+=.20}

    if(splitShare>=.36)scores.Bottoms+=.86;
    else if(splitShare>=.22)scores.Bottoms+=.52;
    else if(splitShare>=.14)scores.Bottoms+=.16;
    if(aspect>=.78&&aspect<=1.82&&bottomRatio>=.80&&shoulderRatio<1.12)scores.Bottoms+=.16;

    if(aspect>=1.12&&splitShare<.14&&bottomRatio>=1.13)scores.Dresses+=.72;
    if(aspect>=1.35&&bottomRatio>=1.02&&splitShare<.12)scores.Dresses+=.20;

    scores.Tops+=shirtLikeEvidence(f);
    if(garmentLike){scores.Tops+=.10;if(splitShare>=.16)scores.Bottoms+=.05}

    scores.Outerwear+=outerwearEvidence(f);

    if(aspect<.56||aspect>2.10)scores.Accessories+=.40;
    if(fill<.22&&splitShare<.15)scores.Accessories+=.22;
    if(components.length>2)scores.Accessories+=.10;
    if(!garmentLike&&pairScore<.68)scores.Misc+=.12;
    return scores;
  }

  function classifyCategoryRefined(features){
    if(!features)return{category:'Misc',confidence:.18,reason:'no-silhouette'};
    const scores=scoreCategoriesRefined(features),ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    let [category,topScore]=ranked[0];const secondScore=ranked[1]?.[1]||0,garmentLike=detectGarmentLike(features);

    // Long-sleeve shirt/cardigan/sweater correction: Outerwear must beat Tops clearly.
    if(category==='Outerwear'&&scores.Tops>=scores.Outerwear-.14&&shirtLikeEvidence(features)>=.46){category='Tops';topScore=scores.Tops}

    // Misc is a true fallback. Garment-like upper bodies bias to Tops; leg-split garments bias Bottoms.
    if(category==='Misc'&&garmentLike){category=features.splitShare>=.20?'Bottoms':'Tops';topScore=scores[category]}
    if(garmentLike&&!['Shoes','Accessories','Dresses'].includes(category)&&topScore<.42){category=features.splitShare>=.18?'Bottoms':'Tops';topScore=scores[category]}
    if(topScore<.28&&!garmentLike){category='Misc';topScore=scores.Misc}

    const nextBest=Object.entries(scores).filter(([name])=>name!==category).sort((a,b)=>b[1]-a[1])[0]?.[1]||0;
    const confidence=clamp(.36+topScore*.42+Math.max(0,topScore-nextBest)*.24,.20,.92);
    return{category,confidence,reason:'phase6.1-refined-silhouette',scores};
  }

  async function analyzeCategoryRefined(dataURL){
    const img=await imageFromLocal(dataURL),c=document.createElement('canvas');c.width=c.height=SIZE;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,SIZE,SIZE);ctx.drawImage(img,0,0,SIZE,SIZE);
    const im=ctx.getImageData(0,0,SIZE,SIZE),maskInfo=PHASE6.buildForegroundMask(im.data,SIZE,SIZE),features=PHASE6.silhouetteFeatures(maskInfo,SIZE,SIZE),decision=classifyCategoryRefined(features);
    window.AUDREY_SMART_SCAN_PHASE61.lastDiagnostics={version:VERSION,category:decision.category,confidence:decision.confidence,reason:decision.reason,scores:decision.scores||{},garmentLike:detectGarmentLike(features),features:features?{aspect:features.aspect,fill:features.fill,shoulderRatio:features.shoulderRatio,bottomRatio:features.bottomRatio,topRatio:features.topRatio,splitShare:features.splitShare,pairScore:features.pairScore,components:features.components.length,alphaAware:features.alphaAware}:null};
    return decision;
  }

  async function analyzeImagePhase61(dataURL){
    const visual=await VISUAL_ANALYZE(dataURL);let categoryResult={category:'',confidence:0};
    try{categoryResult=await analyzeCategoryRefined(dataURL)}catch(err){console.warn('Smart Scan Phase 6.1 category analysis skipped',err)}
    return{...visual,category:categoryResult.category||'',categoryConfidence:categoryResult.confidence||0};
  }

  // Phase 6's smartScan closes over its original analyzer, so replace the scan entry point
  // explicitly to ensure the Phase 6.1 category suggestion reaches the review dialog.
  window.smartScan=async function(target='item'){
    smartScanTarget=target==='wish'?'wish':'item';const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;if(!photo)return toast('Take or choose a photo first');
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent='Scanning category, color, pattern and visible text…'}else setPhotoBusy(true,'Scanning category, color, pattern and visible text…');
    try{
      const visual=await analyzeImagePhase61(photo);let ocr='';try{ocr=await tryOCR(photo)}catch{}const flat=ocr.replace(/\n/g,' ');
      const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];
      const brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(flat))||'';const sm=flat.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);
      pendingSmartScanResult={category:CATEGORIES.includes(visual.category)?visual.category:'',color:visual.color||'',pattern:visual.pattern||'',brand,size:sm?sm[1].toUpperCase():''};
      openSmartScanReview(pendingSmartScanResult);$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan complete. Review detected details before applying.';
    }catch(err){console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.'}
    finally{if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false})}else setPhotoBusy(false)}
  };

  window.AUDREY_SMART_SCAN_PHASE61={version:VERSION,categories:CATEGORIES,detectGarmentLike,shirtLikeEvidence,outerwearEvidence,scoreCategoriesRefined,classifyCategoryRefined,analyzeCategory:analyzeCategoryRefined,visualAnalyzeImage:VISUAL_ANALYZE,analyzeImage:analyzeImagePhase61,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase61;
  console.info(`Audrey Smart Scan ${VERSION} installed: Tops broadened, Outerwear tightened, garment-like items biased away from Misc.`);
})();
