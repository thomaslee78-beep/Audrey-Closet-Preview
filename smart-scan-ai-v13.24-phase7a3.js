/* Audrey Closet v13.24 — Smart Scan Phase 7A3 Telemetry & Accuracy Tracking
 * Local-only telemetry for Smart Scan usage, model/token accounting, fallback rates,
 * and review acceptance/modification. Designed so the same event schema can later be sent to a backend.
 * No photos, API keys, or OCR text are stored in telemetry.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a3-telemetry2-editable-review';
  const SCHEMA_VERSION=1;
  const APP_ID='audrey-closet';
  const FEATURE='smartscan';
  const STORE_KEY='audreySmartScanTelemetryV1';
  const INSTALL_KEY='audreyAppInstallIdV1';
  const SESSION_KEY='audreySmartScanSessionIdV1';
  const MAX_EVENTS=1000;
  const CORE=window.AUDREY_SMART_SCAN;
  if(!CORE){console.warn('Smart Scan Phase 7A3 skipped: Phase 6.3 contract unavailable.');return}

  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const now=()=>new Date().toISOString();
  function id(prefix='id'){try{if(crypto?.randomUUID)return `${prefix}_${crypto.randomUUID()}`}catch{}return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`}
  function getOrCreate(storage,key,prefix){let v='';try{v=storage.getItem(key)||''}catch{}if(!v){v=id(prefix);try{storage.setItem(key,v)}catch{}}return v}
  const installId=getOrCreate(localStorage,INSTALL_KEY,'install');
  const sessionId=getOrCreate(sessionStorage,SESSION_KEY,'session');

  function emptyStore(){return{schemaVersion:SCHEMA_VERSION,appId:APP_ID,feature:FEATURE,installId,events:[]}}
  function loadStore(){let data=null;try{data=JSON.parse(localStorage.getItem(STORE_KEY)||'null')}catch{}if(!data||!Array.isArray(data.events))data=emptyStore();data.schemaVersion=SCHEMA_VERSION;data.appId=APP_ID;data.feature=FEATURE;data.installId=installId;return data}
  function saveStore(data){data.events=(data.events||[]).slice(-MAX_EVENTS);try{localStorage.setItem(STORE_KEY,JSON.stringify(data))}catch(err){console.warn('Smart Scan telemetry could not be saved locally',err)}}
  function identity(){return{appId:APP_ID,feature:FEATURE,installId,sessionId,userId:null}}
  function append(event){const store=loadStore();const row={schemaVersion:SCHEMA_VERSION,eventId:id('evt'),timestamp:now(),...identity(),...clone(event)};store.events.push(row);saveStore(store);renderDiagnostics();return row}

  function usageFrom(result){const u=result?.diagnostics?.usage||{};return{inputTokens:Number(u.input_tokens??u.inputTokens??0)||0,outputTokens:Number(u.output_tokens??u.outputTokens??0)||0,totalTokens:Number(u.total_tokens??u.totalTokens??0)||0}}
  function resultSnapshot(result){const primary=String(result?.color?.value||''),futureColors=Array.isArray(result?.colors)?result.colors.map(x=>typeof x==='string'?x:(x?.value||'')).filter(Boolean):[],colors=[...new Set(futureColors.length?futureColors:(primary?[primary]:[]))];return{category:String(result?.category?.value||''),type:String(result?.type?.value||''),primaryColor:primary,colors,colorSchemaVersion:1,pattern:String(result?.pattern?.value||''),brand:String(result?.brand?.value||''),size:String(result?.size?.value||'')}}
  function flatSnapshot(flat){const primary=String(flat?.color||''),colors=Array.isArray(flat?.colors)?flat.colors.map(String).filter(Boolean):(primary?[primary]:[]);return{category:String(flat?.category||''),type:String(flat?.type||''),primaryColor:primary,colors:[...new Set(colors)],colorSchemaVersion:1,pattern:String(flat?.pattern||''),brand:String(flat?.brand||''),size:String(flat?.size||'')}}

  let activeScan=null,lastCompleted=null,reviewContext=null;
  function setReviewContext(ctx){reviewContext=ctx?clone(ctx):null}
  function consumeReviewContext(){const c=reviewContext;reviewContext=null;return c}

  window.addEventListener('audrey:smartscan-progress',e=>{
    const d=e.detail||{};
    if(d.stage==='scan-start'){activeScan={scanId:id('scan'),startedAt:performance.now(),startedAtIso:now(),target:d.target||'item',initialEngine:d.engine||'local',online:navigator.onLine!==false};return}
    if(d.stage==='scan-complete'){
      const result=CORE.lastResult||window.AUDREY_SMART_SCAN_AI_TRANSPORT?.lastResult||null;
      const scan=activeScan||{scanId:id('scan'),startedAt:performance.now(),startedAtIso:now(),target:'item',initialEngine:d.engine||'local',online:navigator.onLine!==false};
      const durationMs=Math.max(0,Math.round(performance.now()-scan.startedAt)),usage=usageFrom(result);
      const event=append({type:'smartscan.completed',scanId:scan.scanId,target:scan.target,startedAt:scan.startedAtIso,durationMs,engine:result?.engine||d.engine||'local',fallbackUsed:Boolean(result?.fallbackUsed||d.fallbackUsed),provider:String(result?.provider||''),model:String(result?.model||''),onlineAtStart:Boolean(scan.online),requestId:String(result?.diagnostics?.responseId||''),usage,result:resultSnapshot(result),transportVersion:String(result?.diagnostics?.transportVersion||''),contractVersion:String(result?.diagnostics?.contractVersion||CORE.version||'')});
      lastCompleted={scanId:scan.scanId,event,result:clone(result)};activeScan=null;return;
    }
    if(d.stage==='scan-error'){
      const scan=activeScan||{scanId:id('scan'),startedAt:performance.now(),startedAtIso:now(),target:'item',online:navigator.onLine!==false};
      append({type:'smartscan.failed',scanId:scan.scanId,target:scan.target,startedAt:scan.startedAtIso,durationMs:Math.max(0,Math.round(performance.now()-scan.startedAt)),onlineAtStart:Boolean(scan.online),engine:d.engine||'',reason:String(d.message||'scan-error')});activeScan=null;
    }
  });

  const previousApply=window.applyPendingSmartScan;
  if(typeof previousApply==='function'){
    window.applyPendingSmartScan=function(){
      const scanId=lastCompleted?.scanId||id('scan');
      const ctx=consumeReviewContext();
      const proposal=ctx?.proposal?flatSnapshot(ctx.proposal):flatSnapshot(pendingSmartScanResult||{});
      const appliedValues=ctx?.appliedValues?flatSnapshot(ctx.appliedValues):flatSnapshot(pendingSmartScanResult||{});
      const selected=Array.isArray(ctx?.selectedFields)?ctx.selectedFields:[...document.querySelectorAll('#smartScanReviewFields input[data-scan-field]:checked')].map(x=>x.dataset.scanField).filter(Boolean);
      const known=['category','type','color','pattern','brand','size'];
      const decisions=ctx?.decisions||Object.fromEntries(known.map(k=>[k,selected.includes(k)?'accepted':'not_applied']));
      try{return previousApply.apply(this,arguments)}finally{
        append({type:'smartscan.review_applied',scanId,target:typeof smartScanTarget==='string'?smartScanTarget:'item',proposal,appliedValues,selectedFields:selected,decisions});
      }
    };
  }

  function summarize(events=loadStore().events){
    const completed=events.filter(e=>e.type==='smartscan.completed'),applied=events.filter(e=>e.type==='smartscan.review_applied'),byModel={};
    for(const e of completed){const key=e.model||e.engine||'unknown',row=byModel[key]||(byModel[key]={calls:0,aiCalls:0,localCalls:0,fallbacks:0,inputTokens:0,outputTokens:0,totalTokens:0,totalDurationMs:0});row.calls++;if(e.engine==='ai')row.aiCalls++;else row.localCalls++;if(e.fallbackUsed)row.fallbacks++;row.inputTokens+=Number(e.usage?.inputTokens||0);row.outputTokens+=Number(e.usage?.outputTokens||0);row.totalTokens+=Number(e.usage?.totalTokens||0);row.totalDurationMs+=Number(e.durationMs||0)}
    Object.values(byModel).forEach(r=>{r.avgDurationMs=r.calls?Math.round(r.totalDurationMs/r.calls):0});
    const fields=['category','type','color','pattern','brand','size'],acceptance={};
    for(const f of fields){let accepted=0,modified=0,notApplied=0;for(const e of applied){if(e.decisions?.[f]==='accepted')accepted++;else if(e.decisions?.[f]==='modified')modified++;else if(e.decisions?.[f]==='not_applied')notApplied++}const total=accepted+modified+notApplied;acceptance[f]={accepted,modified,notApplied,total,acceptRate:total?accepted/total:null,applyRate:total?(accepted+modified)/total:null,modifyRate:total?modified/total:null}}
    return{schemaVersion:SCHEMA_VERSION,appId:APP_ID,feature:FEATURE,installId,totalScans:completed.length,aiScans:completed.filter(e=>e.engine==='ai').length,localScans:completed.filter(e=>e.engine==='local').length,fallbacks:completed.filter(e=>e.fallbackUsed).length,failed:events.filter(e=>e.type==='smartscan.failed').length,reviewsApplied:applied.length,byModel,acceptance};
  }

  function diagnosticsHost(){return document.getElementById('smartScanAISettingsCard')||document.querySelector('.screen[data-screen="more"] .settings-group-body')||document.querySelector('.screen[data-screen="more"]')}
  function installDiagnostics(){
    const host=diagnosticsHost();if(!host||document.getElementById('smartScanTelemetryPanel'))return false;
    const panel=document.createElement('div');panel.id='smartScanTelemetryPanel';panel.style.cssText='margin-top:12px;padding-top:12px;border-top:1px solid rgba(100,90,80,.12)';
    panel.innerHTML='<strong style="display:block;margin-bottom:6px">Smart Scan diagnostics</strong><div id="smartScanTelemetrySummary" style="font-size:12px;line-height:1.5"></div><button type="button" class="secondary" id="smartScanCopyDiagnosticsBtn" style="margin-top:8px">Copy diagnostics JSON</button><div style="font-size:11px;opacity:.68;margin-top:6px">Stored only on this device. No photos, API keys, or OCR text are recorded.</div>';
    host.appendChild(panel);
    panel.querySelector('#smartScanCopyDiagnosticsBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify({summary:summarize(),events:loadStore().events},null,2));const b=panel.querySelector('#smartScanCopyDiagnosticsBtn'),old=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=old,900)}catch{}});
    renderDiagnostics();return true;
  }
  function renderDiagnostics(){const box=document.getElementById('smartScanTelemetrySummary');if(!box)return;const s=summarize(),models=Object.entries(s.byModel).map(([m,r])=>`${m}: ${r.calls} call${r.calls===1?'':'s'} · ${r.totalTokens.toLocaleString()} tokens`).join('<br>');box.innerHTML=`${s.totalScans} scans · ${s.aiScans} AI · ${s.localScans} Local · ${s.fallbacks} fallback${s.fallbacks===1?'':'s'}${models?'<br>'+models:''}`}
  function ensureUI(){if(!installDiagnostics())setTimeout(installDiagnostics,350)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI,{once:true});else ensureUI();

  const API={version:VERSION,schemaVersion:SCHEMA_VERSION,appId:APP_ID,feature:FEATURE,installId,sessionId,identity,getEvents:()=>clone(loadStore().events),getSummary:()=>clone(summarize()),exportData:()=>clone({summary:summarize(),events:loadStore().events}),append,setReviewContext};
  window.AUDREY_SMART_SCAN_TELEMETRY=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: local usage and editable-review telemetry enabled for ${APP_ID}/${FEATURE}.`);
})();
