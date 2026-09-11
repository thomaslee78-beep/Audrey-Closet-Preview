/* Audrey Closet v13.24 — Smart Scan Phase 7A4C Service Adapter
 * Browser-side client for Audrey Cloud Smart Scan.
 * Production model/detail policy is server-authoritative.
 * No provider API key is stored or sent by the browser in service mode.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a4c-service-adapter3-timeout';
  const APP_ID='audrey-closet';
  const FEATURE='smartscan';
  const REQUEST_TIMEOUT_MS=25000;
  const CORE=window.AUDREY_SMART_SCAN;
  const TELEMETRY=window.AUDREY_SMART_SCAN_TELEMETRY;
  if(!CORE?.normalizeResult||!CORE?.taxonomy){console.warn('Smart Scan service adapter skipped: Phase 6.3 contract unavailable.');return}

  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  function id(prefix='req'){try{if(crypto?.randomUUID)return `${prefix}_${crypto.randomUUID()}`}catch{}return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`}
  function deploymentConfig(){const c=window.AUDREY_SMART_SCAN_SERVICE_CONFIG||{};return{endpoint:String(c.endpoint||'').replace(/\/$/,''),enabled:Boolean(c.enabled),channel:String(c.channel||'unknown'),build:String(c.build||'')}}
  function identity(){const t=TELEMETRY?.identity?.()||{};return{appId:t.appId||APP_ID,feature:t.feature||FEATURE,installId:t.installId||'',sessionId:t.sessionId||'',userId:t.userId||null}}
  function isAvailable(){const c=deploymentConfig();return Boolean(c.enabled&&c.endpoint&&navigator.onLine!==false)}
  function buildEnvelope(photo,{target='item'}={}){
    if(!photo)throw Object.assign(new Error('No photo supplied to Smart Scan service.'),{code:'SERVICE_NO_PHOTO'});
    const c=deploymentConfig();
    return{schemaVersion:2,requestId:id('smartscan'),...identity(),target,image:photo,taxonomyVersion:1,client:{smartScanContract:CORE.version||'',serviceAdapter:VERSION,channel:c.channel,build:c.build}};
  }
  function normalizeServiceResult(body){
    const raw=body?.result||{};
    const result=CORE.normalizeResult({engine:'ai',fallbackUsed:false,provider:String(body?.provider||'openai'),model:String(body?.model||''),category:raw.category,type:raw.type,color:raw.color,pattern:raw.pattern,brand:raw.brand,size:raw.size,diagnostics:{contractVersion:CORE.version,serviceVersion:String(body?.serviceVersion||''),serviceRequestId:String(body?.requestId||''),providerRequestId:String(body?.providerRequestId||''),requestMs:Number(body?.requestMs||0)||0,usage:clone(body?.usage||{}),quota:clone(body?.quota||{}),serverDetail:String(body?.detail||''),transport:'audrey-smartscan-service'}});
    if(!result.category.value||!result.color.value||!result.pattern.value){const err=new Error('Smart Scan service returned an incomplete result.');err.code='SERVICE_INVALID_RESULT';throw err}
    return result;
  }
  async function request(path,options={}){
    const c=deploymentConfig();if(!c.endpoint)throw new Error('Smart Scan service endpoint is not configured.');
    const headers={'X-Audrey-App':APP_ID,'X-Audrey-Feature':FEATURE,'X-Audrey-Channel':c.channel,'X-Audrey-Build':c.build,...(options.headers||{})};
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    let r;
    try{
      r=await fetch(c.endpoint+path,{...options,headers,signal:controller.signal});
    }catch(err){
      if(err?.name==='AbortError'){const timeoutErr=new Error('Smart Scan service request timed out.');timeoutErr.code='SERVICE_TIMEOUT';timeoutErr.status=0;throw timeoutErr}
      throw err;
    }finally{clearTimeout(timeout)}
    let b={};try{b=await r.json()}catch{}
    if(!r.ok){const err=new Error(b?.error?.message||b?.message||('Smart Scan service returned HTTP '+r.status));err.status=r.status;err.code=b?.error?.code||'SERVICE_HTTP_ERROR';err.retryAfter=b?.retryAfter||null;throw err}return b;
  }
  async function analyze(photo,opts={}){
    const c=deploymentConfig();
    if(!c.enabled||!c.endpoint){const err=new Error('Smart Scan service is not configured for this deployment.');err.code='SERVICE_NOT_CONFIGURED';throw err}
    if(navigator.onLine===false){const err=new Error('Device is offline.');err.code='SERVICE_OFFLINE';throw err}
    const envelope=buildEnvelope(photo,opts),started=performance.now();
    const body=await request('/v1/smartscan/analyze',{method:'POST',headers:{'Content-Type':'application/json','X-Audrey-Request':envelope.requestId},body:JSON.stringify(envelope)});
    const result=normalizeServiceResult(body);result.diagnostics={...(result.diagnostics||{}),clientRequestMs:Math.round(performance.now()-started)};
    API.lastResult=result;API.lastResponse=clone(body);API.lastError=null;return result;
  }
  async function health(){return request('/health')}
  async function serverConfig(){const b=await request('/v1/smartscan/config');API.lastServerConfig=clone(b.config||{});return clone(b.config||{})}

  const API={version:VERSION,appId:APP_ID,feature:FEATURE,requestTimeoutMs:REQUEST_TIMEOUT_MS,getConfig:deploymentConfig,identity,isAvailable,buildEnvelope,normalizeServiceResult,analyze,health,serverConfig,lastServerConfig:null,lastResult:null,lastResponse:null,lastError:null};
  window.AUDREY_SMART_SCAN_SERVICE=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: Audrey Cloud service controls are server-authoritative with bounded requests.`);
})();
