/* Audrey Closet v13.24 — Smart Scan Phase 7A2 AI Vision Transport
 * First real AI-assisted Smart Scan call using OpenAI Responses API + image input + Structured Outputs.
 * AI-first when explicitly enabled/configured; frozen Local Smart Scan v1.1 is the automatic fallback.
 * Preserves the existing review/apply UX and saved data model.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a2-ai-vision3-offline-fallback';
  const CORE=window.AUDREY_SMART_SCAN;
  const AI=window.smartScanAI;
  const LOCAL=window.smartScanLocal;
  if(!CORE?.normalizeResult||!CORE?.toPendingFlat||!AI?.buildOpenAIRequest||!LOCAL?.analyze){
    console.warn('Smart Scan Phase 7A2 skipped: Phase 6.3 / 7A1 dependencies unavailable.');
    return;
  }

  const API_URL='https://api.openai.com/v1/responses';
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  function progress(stage,detail={}){window.dispatchEvent(new CustomEvent('audrey:smartscan-progress',{detail:{stage,...detail}}))}

  function extractResponseText(body){
    if(typeof body?.output_text==='string'&&body.output_text.trim())return body.output_text.trim();
    for(const output of body?.output||[]){
      for(const content of output?.content||[]){
        if((content?.type==='output_text'||content?.type==='text')&&typeof content.text==='string'&&content.text.trim())return content.text.trim();
        if(content?.type==='refusal'&&content.refusal)throw new Error('AI declined to analyze this image.');
      }
    }
    return'';
  }

  function ensureUsable(result){
    const missing=[];
    if(!result?.category?.value)missing.push('category');
    if(!result?.color?.value)missing.push('color');
    if(!result?.pattern?.value)missing.push('pattern');
    if(missing.length){const err=new Error('AI result was missing valid '+missing.join(', ')+'.');err.code='AI_INVALID_RESULT';throw err}
    return result;
  }

  async function analyzeAI(photo,taxonomy=CORE.taxonomy){
    void taxonomy;
    const cfg=AI.getConfig();
    if(!cfg.enabled){const err=new Error('AI Smart Scan is disabled.');err.code='AI_DISABLED';throw err}
    if(cfg.provider!=='openai'){const err=new Error('Unsupported AI provider.');err.code='AI_PROVIDER_UNSUPPORTED';throw err}
    if(!cfg.apiKey){const err=new Error('AI Smart Scan API key is not configured.');err.code='AI_NOT_CONFIGURED';throw err}
    if(!photo){const err=new Error('No photo supplied to AI Smart Scan.');err.code='AI_NO_PHOTO';throw err}

    progress('ai-request',{engine:'ai',message:'Sending this item to AI…'});
    const request=AI.buildOpenAIRequest(photo);request.max_output_tokens=500;
    const started=performance.now();
    const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+cfg.apiKey},body:JSON.stringify(request)});
    let body={};try{body=await response.json()}catch{}
    if(!response.ok){const message=body?.error?.message||('OpenAI returned HTTP '+response.status);const err=new Error(message);err.status=response.status;err.code=body?.error?.code||'AI_HTTP_ERROR';throw err}

    progress('ai-validating',{engine:'ai',message:'Validating detected clothing details…'});
    const text=extractResponseText(body);
    if(!text){const err=new Error('OpenAI returned no structured Smart Scan result.');err.code='AI_EMPTY_RESPONSE';throw err}
    let raw;try{raw=JSON.parse(text)}catch{const err=new Error('OpenAI returned an unreadable Smart Scan result.');err.code='AI_PARSE_ERROR';throw err}
    const normalized=ensureUsable(AI.normalizeAIOutput(raw,{provider:'openai',model:cfg.model}));
    normalized.diagnostics={...(normalized.diagnostics||{}),transportVersion:VERSION,responseId:body?.id||'',requestMs:Math.round(performance.now()-started),usage:clone(body?.usage||{}),rawValidated:true};
    CORE.lastResult=normalized;CORE.lastDiagnostics=normalized.diagnostics;API.lastResult=normalized;API.lastError=null;
    return normalized;
  }

  function markFallback(localResult,error,cfg){
    const result=CORE.normalizeResult({...localResult,engine:'local',fallbackUsed:true,provider:cfg?.provider||'openai',model:cfg?.model||'',diagnostics:{...(localResult?.diagnostics||{}),fallback:{from:'ai',provider:cfg?.provider||'openai',model:cfg?.model||'',reason:error?.code||error?.message||'AI failure'},transportVersion:VERSION}});
    CORE.lastResult=result;CORE.lastDiagnostics=result.diagnostics;API.lastResult=result;API.lastError=error||null;return result;
  }

  async function analyzeWithFallback(photo,{includeOCR=true}={}){
    const cfg=AI.getConfig();
    if(!cfg.enabled){progress('local-start',{engine:'local',message:'Analyzing this item locally…'});return LOCAL.analyze(photo,{includeOCR})}
    if(navigator.onLine===false){
      const err=new Error('Device is offline.');err.code='AI_OFFLINE';
      progress('fallback-start',{engine:'local',fallback:true,message:'No internet connection. Using Local Smart Scan…'});
      return markFallback(await LOCAL.analyze(photo,{includeOCR}),err,cfg);
    }
    if(!AI.isConfigured()){
      const err=new Error('AI enabled but not fully configured.');err.code='AI_NOT_CONFIGURED';
      progress('fallback-start',{engine:'local',fallback:true,message:'AI is not fully configured. Continuing with Local Smart Scan…'});
      return markFallback(await LOCAL.analyze(photo,{includeOCR}),err,cfg);
    }
    try{return await analyzeAI(photo,CORE.taxonomy)}catch(err){
      console.warn('AI Smart Scan failed; using Local Smart Scan v1.1 fallback.',err);
      progress('fallback-start',{engine:'local',fallback:true,message:'AI was unavailable. Continuing with Local Smart Scan…'});
      return markFallback(await LOCAL.analyze(photo,{includeOCR}),err,cfg);
    }
  }

  const previousFieldLabel=window.smartScanFieldLabel;
  window.smartScanFieldLabel=function(key){if(key==='type')return'Type';return typeof previousFieldLabel==='function'?previousFieldLabel(key):key};

  const previousApply=window.applyPendingSmartScan;
  window.applyPendingSmartScan=function(){
    if(!pendingSmartScanResult)return closeSmartScanReview();
    const chosen=new Set($$('#smartScanReviewFields input[data-scan-field]:checked').map(x=>x.dataset.scanField));
    const wish=smartScanTarget==='wish';
    const selectedType=chosen.has('type')?String(pendingSmartScanResult.type||''):'';
    const selectedCategory=chosen.has('category')?String(pendingSmartScanResult.category||''):'';
    if(typeof previousApply==='function')previousApply();
    if(!selectedType)return;
    const category=selectedCategory||$(wish?'#wishCategory':'#itemCategory')?.value||'';
    const allowed=CORE.taxonomy?.types?.[category]||[];
    if(!allowed.includes(selectedType))return;
    const sel=$(wish?'#wishType':'#itemType');if(!sel)return;sel.value=selectedType;sel.dispatchEvent(new Event('change',{bubbles:true}));if(!wish)updateItemReviewSummary();
  };

  window.smartScan=async function(target='item'){
    smartScanTarget=target==='wish'?'wish':'item';
    const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    if(!photo)return toast('Take or choose a photo first');
    const cfg=AI.getConfig(),offline=navigator.onLine===false,aiAttempt=Boolean(cfg.enabled&&AI.isConfigured()&&!offline);
    progress('scan-start',{engine:aiAttempt?'ai':'local',target:smartScanTarget,photo,message:offline&&cfg.enabled?'No internet connection. Preparing Local Smart Scan…':(aiAttempt?'Preparing this item for AI Smart Scan…':'Preparing this item for Local Smart Scan…')});
    const busyText=aiAttempt?'AI is analyzing category, type, color and pattern…':'Scanning category, color, pattern and visible text…';
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent=busyText}else setPhotoBusy(true,busyText);
    try{
      const result=await analyzeWithFallback(photo,{includeOCR:true});
      pendingSmartScanResult=CORE.toPendingFlat(result);if(!pendingSmartScanResult.type)delete pendingSmartScanResult.type;
      progress('scan-complete',{engine:result.engine,fallbackUsed:result.fallbackUsed,message:result.engine==='ai'?'AI Smart Scan complete.':'Smart Scan complete.'});
      openSmartScanReview(pendingSmartScanResult);
      const status=result.engine==='ai'?'AI Smart Scan complete. Review detected details before applying.':(result.fallbackUsed?'AI was unavailable, so Local Smart Scan was used. Review detected details before applying.':'Smart Scan complete. Review detected details before applying.');
      $(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent=status;
    }catch(err){
      progress('scan-error',{engine:aiAttempt?'ai':'local',message:'Smart Scan could not analyze this photo.'});
      console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.';
    }finally{
      if(smartScanTarget==='wish')['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false});else setPhotoBusy(false);
    }
  };

  function refreshConfigStatus(){const status=document.getElementById('smartScanAIStatus');if(!status)return;const c=AI.getConfig();status.textContent=c.enabled?(AI.isConfigured()?'AI Smart Scan is enabled. Scans will try AI first and automatically fall back to Local if needed.':'AI is enabled but not fully configured; scans will use Local fallback.'):'AI Smart Scan is off. Local Smart Scan v1.1 is active.'}
  setTimeout(refreshConfigStatus,0);
  document.addEventListener('change',e=>{if(e.target?.id&&['smartScanAIEnabled','smartScanAIProvider','smartScanAIModel','smartScanAIApiKey'].includes(e.target.id))setTimeout(refreshConfigStatus,0)});

  AI.analyze=analyzeAI;
  const API={version:VERSION,analyze:analyzeAI,analyzeWithFallback,extractResponseText,ensureUsable,lastResult:null,lastError:null};
  window.AUDREY_SMART_SCAN_AI_TRANSPORT=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: AI-first vision with offline-aware Local fallback enabled.`);
})();
