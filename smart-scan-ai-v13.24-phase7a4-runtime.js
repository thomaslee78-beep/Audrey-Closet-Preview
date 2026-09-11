/* Audrey Closet v13.24 — Smart Scan Phase 7A4C Service-First Runtime
 * Audrey Cloud owns production model/detail/cost controls.
 * Closet shows service status only; service failures/offline fall back to frozen Local v1.1.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a4c-service-runtime3-hang-safe';
  const LOCAL_TIMEOUT_MS=15000;
  const SCAN_TIMEOUT_MS=45000;
  const CORE=window.AUDREY_SMART_SCAN;
  const LOCAL=window.smartScanLocal;
  const SERVICE=window.AUDREY_SMART_SCAN_SERVICE;
  const DEV=window.AUDREY_SMART_SCAN_AI_TRANSPORT;
  if(!CORE?.toPendingFlat||!LOCAL?.analyze||!SERVICE){console.warn('Smart Scan Phase 7A4C runtime skipped: dependencies unavailable.');return}

  function progress(stage,detail={}){window.dispatchEvent(new CustomEvent('audrey:smartscan-progress',{detail:{stage,...detail}}))}
  function serviceConfigured(){const c=SERVICE.getConfig();return Boolean(c.enabled&&c.endpoint)}
  function timeoutError(code,message){const err=new Error(message);err.code=code;return err}
  function withTimeout(promise,ms,code,message){
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(timeoutError(code,message)),ms)})
    ]).finally(()=>clearTimeout(timer));
  }
  async function analyzeLocalBounded(photo,{includeOCR=true}={}){
    return withTimeout(LOCAL.analyze(photo,{includeOCR}),LOCAL_TIMEOUT_MS,'LOCAL_TIMEOUT','Local Smart Scan timed out.');
  }
  function markServiceFallback(localResult,error){
    const result=CORE.normalizeResult({...localResult,engine:'local',fallbackUsed:true,provider:'openai',model:'',diagnostics:{...(localResult?.diagnostics||{}),fallback:{from:'audrey-smartscan-service',reason:error?.code||error?.message||'service failure'},transportVersion:VERSION}});
    CORE.lastResult=result;CORE.lastDiagnostics=result.diagnostics;API.lastResult=result;API.lastError=error||null;return result;
  }
  async function analyzeProduction(photo,{includeOCR=true,target='item'}={}){
    if(navigator.onLine===false){const err=Object.assign(new Error('Device is offline.'),{code:'SERVICE_OFFLINE'});progress('fallback-start',{engine:'local',fallback:true,message:'No internet connection. Using Local Smart Scan…'});return markServiceFallback(await analyzeLocalBounded(photo,{includeOCR}),err)}
    try{
      progress('ai-request',{engine:'ai',message:'Sending this item to Smart Scan…'});
      const result=await SERVICE.analyze(photo,{target});
      CORE.lastResult=result;CORE.lastDiagnostics=result.diagnostics;API.lastResult=result;API.lastError=null;
      progress('ai-validating',{engine:'ai',message:'Validating detected clothing details…'});return result;
    }catch(err){
      console.warn('Audrey Smart Scan service failed; using Local Smart Scan v1.1 fallback.',err);
      const limited=err?.code==='RATE_LIMITED';const disabled=err?.code==='SERVICE_DISABLED';const timedOut=err?.code==='SERVICE_TIMEOUT';
      progress('fallback-start',{engine:'local',fallback:true,message:limited?'Smart Scan limit reached. Using Local Smart Scan…':disabled?'AI Smart Scan is temporarily disabled. Using Local Smart Scan…':timedOut?'AI Smart Scan timed out. Continuing with Local Smart Scan…':'AI was unavailable. Continuing with Local Smart Scan…'});
      return markServiceFallback(await analyzeLocalBounded(photo,{includeOCR}),err);
    }
  }

  const previousSmartScan=window.smartScan;
  window.smartScan=async function(target='item'){
    if(!serviceConfigured())return typeof previousSmartScan==='function'?previousSmartScan(target):undefined;
    smartScanTarget=target==='wish'?'wish':'item';
    const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    if(!photo)return toast('Take or choose a photo first');
    progress('scan-start',{engine:navigator.onLine===false?'local':'ai',target:smartScanTarget,photo,message:navigator.onLine===false?'No internet connection. Preparing Local Smart Scan…':'Preparing this item for AI Smart Scan…'});
    const busyText=navigator.onLine===false?'Scanning locally…':'AI is analyzing category, type, color and pattern…';
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent=busyText}else setPhotoBusy(true,busyText);
    try{
      const result=await withTimeout(analyzeProduction(photo,{includeOCR:true,target:smartScanTarget}),SCAN_TIMEOUT_MS,'SCAN_TIMEOUT','Smart Scan took too long and was stopped.');
      pendingSmartScanResult=CORE.toPendingFlat(result);if(!pendingSmartScanResult.type)delete pendingSmartScanResult.type;
      progress('scan-complete',{engine:result.engine,fallbackUsed:result.fallbackUsed,message:result.engine==='ai'?'AI Smart Scan complete.':'Smart Scan complete.'});
      openSmartScanReview(pendingSmartScanResult);
      const status=result.engine==='ai'?'AI Smart Scan complete. Review detected details before applying.':(result.fallbackUsed?'Audrey Cloud was unavailable or limited, so Local Smart Scan was used. Review detected details before applying.':'Smart Scan complete. Review detected details before applying.');
      $(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent=status;
    }catch(err){
      progress('scan-error',{engine:'ai',message:err?.code==='LOCAL_TIMEOUT'?'Local Smart Scan took too long. Please try again.':err?.code==='SCAN_TIMEOUT'?'Smart Scan took too long. Please try again.':'Smart Scan could not analyze this photo.'});
      console.error(err);toast(err?.code==='LOCAL_TIMEOUT'||err?.code==='SCAN_TIMEOUT'?'Smart Scan took too long. Please try again.':'Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan stopped. You can try again.';
    }finally{
      try{window.AUDREY_SMART_SCAN_PROGRESS?.hide?.(0)}catch{}
      if(smartScanTarget==='wish')['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false});else setPhotoBusy(false)
    }
  };

  async function applyServiceUI(){
    if(!serviceConfigured())return;
    const card=document.getElementById('smartScanAISettingsCard');if(!card)return;
    card.querySelectorAll('label.field').forEach(row=>row.hidden=true);
    const test=document.getElementById('smartScanAITestBtn')?.parentElement;if(test)test.hidden=true;
    const intro=card.querySelector('p');if(intro)intro.textContent='AI Smart Scan is managed securely by Audrey Cloud.';
    let status=document.getElementById('smartScanAIStatus');
    if(status)status.textContent='Checking Audrey Cloud configuration…';
    try{
      const cfg=await SERVICE.serverConfig();
      if(status)status.textContent=cfg.enabled?'Audrey Cloud Smart Scan is available. Model, image-detail and usage controls are managed centrally.':'Audrey Cloud AI Smart Scan is temporarily disabled; Local Smart Scan remains available.';
      card.dataset.serviceManaged='true';card.dataset.serviceEnabled=String(Boolean(cfg.enabled));
    }catch(err){if(status)status.textContent='Audrey Cloud controls are unavailable right now. Smart Scan will use its normal fallback behavior.';console.warn('Could not read Audrey Cloud Smart Scan config.',err)}
  }
  function scheduleServiceUI(){setTimeout(applyServiceUI,0);setTimeout(applyServiceUI,350)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleServiceUI,{once:true});else scheduleServiceUI();

  const API={version:VERSION,isServiceMode:serviceConfigured,analyzeProduction,analyzeLocalBounded,localTimeoutMs:LOCAL_TIMEOUT_MS,scanTimeoutMs:SCAN_TIMEOUT_MS,refreshServiceUI:applyServiceUI,devTransport:DEV||null,lastResult:null,lastError:null};
  window.AUDREY_SMART_SCAN_PRODUCTION_RUNTIME=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: Audrey Cloud controls production policy with bounded service/local scan recovery.`);
})();
