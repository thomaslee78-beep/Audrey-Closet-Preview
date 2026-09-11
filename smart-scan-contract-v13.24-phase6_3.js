/* Audrey Closet v13.24 — Smart Scan Phase 6.3 Contract & Confidence Plumbing
 * Freezes Local Smart Scan v1.1 behind a common SmartScanResult contract.
 * Adds per-field internal confidence and consolidated diagnostics without changing recognition heuristics.
 * Preserves the existing review/apply UX by adapting structured results back to the existing flat pending object.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3-contract1';
  const LOCAL_VERSION='Local Smart Scan v1.1';
  const P42=window.AUDREY_SMART_SCAN_PHASE42;
  const P54=window.AUDREY_SMART_SCAN_PHASE54;
  const P62=window.AUDREY_SMART_SCAN_PHASE62;
  if(!P42||!P54||!P62?.analyzeImage){console.warn('Smart Scan Phase 6.3 skipped: Local Smart Scan v1.1 dependencies unavailable.');return}

  // Capture once so future AI plumbing cannot accidentally replace the frozen local fallback analyzer.
  const LOCAL_ANALYZE_IMAGE=P62.analyzeImage;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));

  function globalArray(name,fallback){try{const v=window.eval(`typeof ${name}!=='undefined'?${name}:null`);return Array.isArray(v)?clone(v):fallback}catch{return fallback}}
  function globalObject(name,fallback){try{const v=window.eval(`typeof ${name}!=='undefined'?${name}:null`);return v&&typeof v==='object'?clone(v):fallback}catch{return fallback}}
  const TAXONOMY={
    colors:globalArray('COLORS',['Black','White','Cream','Gray','Brown','Coffee','Tan','Beige','Burgundy','Red','Orange','Yellow','Mustard','Olive','Green','Mint','Turquoise','Blue','Navy','Purple','Pink','Multicolor']),
    patterns:globalArray('PATTERNS',['Solid','Stripe','Plaid','Floral/Print','Graphic','Colorblock','Other']),
    categories:globalArray('CATEGORIES',['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc']),
    types:globalObject('TYPES',{})
  };

  function field(value,confidence){return{value:value||'',confidence:clamp(Number(confidence)||0,0,1)}}
  function colorConfidence(diag){
    if(!diag)return 0;
    const winner=diag.winner||{},share=Number(winner.share)||0,clusters=Array.isArray(diag.clusters)?diag.clusters:[];
    const sorted=clusters.map(x=>Number(x.share)||0).sort((a,b)=>b-a),margin=Math.max(0,(sorted[0]||share)-(sorted[1]||0));
    // Diagnostic confidence only; never changes the selected color.
    let c=.30+share*.45+margin*.45;
    if(String(diag.reason||'').includes('white'))c=Math.max(c,.68);
    if(!winner.label&&diag.color)c=Math.max(c,.45);
    return clamp(c,.15,.95);
  }
  function patternConfidence(diag){return clamp(Number(diag?.confidence)||0,0,1)}
  function categoryConfidence(diag,visual){return clamp(Number(diag?.confidence)||Number(visual?.categoryConfidence)||0,0,1)}

  function validateValue(group,value){if(!value)return'';return TAXONOMY[group]?.includes(value)?value:''}
  function validateType(category,value){if(!category||!value)return'';const allowed=TAXONOMY.types?.[category];return Array.isArray(allowed)&&allowed.includes(value)?value:''}

  function normalizeResult(input={}){
    const category=validateValue('categories',input.category?.value??input.category);
    return{
      engine:input.engine==='ai'?'ai':'local',
      fallbackUsed:Boolean(input.fallbackUsed),
      provider:input.provider||'',
      model:input.model||'',
      color:field(validateValue('colors',input.color?.value??input.color),input.color?.confidence),
      pattern:field(validateValue('patterns',input.pattern?.value??input.pattern),input.pattern?.confidence),
      category:field(category,input.category?.confidence),
      type:field(validateType(category,input.type?.value??input.type),input.type?.confidence),
      brand:{value:input.brand?.value??input.brand??'',confidence:input.brand?.confidence??null},
      size:{value:input.size?.value??input.size??'',confidence:input.size?.confidence??null},
      diagnostics:clone(input.diagnostics||{})
    };
  }

  function toPendingFlat(result){
    return{
      category:result.category.value,
      color:result.color.value,
      pattern:result.pattern.value,
      type:result.type.value,
      brand:result.brand.value||'',
      size:result.size.value||''
    };
  }

  async function analyzeLocal(photo,{includeOCR=true}={}){
    const visual=await LOCAL_ANALYZE_IMAGE(photo);
    const colorDiag=clone(P42.lastDiagnostics||{}),patternDiag=clone(P54.lastDiagnostics||{}),categoryDiag=clone(P62.lastDiagnostics||{});
    let brand='',size='';
    if(includeOCR){
      let ocr='';try{ocr=await tryOCR(photo)}catch{}
      const flat=String(ocr||'').replace(/\n/g,' ');
      const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];
      brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(flat))||'';
      const sm=flat.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);size=sm?sm[1].toUpperCase():'';
    }
    const result=normalizeResult({
      engine:'local',fallbackUsed:false,provider:'',model:'',
      color:{value:visual.color||'',confidence:colorConfidence(colorDiag)},
      pattern:{value:visual.pattern||'',confidence:patternConfidence(patternDiag)},
      category:{value:visual.category||'',confidence:categoryConfidence(categoryDiag,visual)},
      type:{value:'',confidence:0},brand:{value:brand,confidence:null},size:{value:size,confidence:null},
      diagnostics:{
        contractVersion:VERSION,
        localVersion:LOCAL_VERSION,
        engine:'local',fallbackUsed:false,
        local:{colorEngine:'phase4.2',patternEngine:'phase5.4-final',categoryEngine:'phase6.2'},
        confidence:{color:colorConfidence(colorDiag),pattern:patternConfidence(patternDiag),category:categoryConfidence(categoryDiag,visual),type:0},
        color:colorDiag,pattern:patternDiag,category:categoryDiag
      }
    });
    API.lastResult=result;API.lastDiagnostics=result.diagnostics;return result;
  }

  // Preserve current user-facing Smart Scan behavior while making the structured contract canonical internally.
  window.smartScan=async function(target='item'){
    smartScanTarget=target==='wish'?'wish':'item';
    const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    if(!photo)return toast('Take or choose a photo first');
    if(smartScanTarget==='wish'){
      ['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});
      $('#wishScanStatus').textContent='Scanning category, color, pattern and visible text…';
    }else setPhotoBusy(true,'Scanning category, color, pattern and visible text…');
    try{
      const result=await analyzeLocal(photo,{includeOCR:true});
      pendingSmartScanResult=toPendingFlat(result);
      // Local Type is intentionally blank; keep it out of the current review dialog until AI can supply it.
      if(!pendingSmartScanResult.type)delete pendingSmartScanResult.type;
      openSmartScanReview(pendingSmartScanResult);
      $(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan complete. Review detected details before applying.';
    }catch(err){
      console.error(err);toast('Smart Scan could not analyze this photo');
      $(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.';
    }finally{
      if(smartScanTarget==='wish') ['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false});
      else setPhotoBusy(false);
    }
  };

  const API={version:VERSION,localVersion:LOCAL_VERSION,taxonomy:TAXONOMY,analyzeLocal,normalizeResult,validateValue,validateType,toPendingFlat,lastResult:null,lastDiagnostics:null};
  window.AUDREY_SMART_SCAN=API;
  window.smartScanLocal={version:LOCAL_VERSION,analyze:analyzeLocal};
  console.info(`Audrey Smart Scan ${VERSION} loaded: Local Smart Scan v1.1 frozen behind SmartScanResult contract.`);
})();
