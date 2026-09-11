/* Audrey Closet v13.24 — Smart Scan Phase 7A5A Progress Overlay
 * Clear in-progress feedback during AI or Local Smart Scan with bounded UI recovery.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a5a-progress-overlay3-watchdog';
  const OVERLAY_WATCHDOG_MS=50000;
  let hideTimer=null,watchdogTimer=null;

  function installStyles(){
    if(document.getElementById('smartScanProgressStyles'))return;
    const style=document.createElement('style');style.id='smartScanProgressStyles';
    style.textContent=`
      #smartScanProgressOverlay{width:auto;max-width:none;border:0;padding:0;background:transparent;overflow:visible;color:inherit}
      #smartScanProgressOverlay::backdrop{background:rgba(28,28,24,.34);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
      .smart-scan-progress-card{width:min(360px,calc(100vw - 34px));display:grid;grid-template-columns:82px 1fr;gap:14px;align-items:center;padding:16px;border-radius:20px;background:#fffaf0;border:1px solid rgba(108,81,66,.16);box-shadow:0 16px 44px rgba(48,40,34,.22)}
      .smart-scan-progress-thumb{width:82px;height:82px;border-radius:16px;overflow:hidden;background:#eee6d8;border:1px solid rgba(108,81,66,.12);display:flex;align-items:center;justify-content:center}
      .smart-scan-progress-thumb img{width:100%;height:100%;object-fit:contain;background:#f7f3ea}
      .smart-scan-progress-copy{min-width:0;display:grid;gap:5px}
      .smart-scan-progress-kicker{font-size:10px;letter-spacing:.10em;text-transform:uppercase;font-weight:800;color:#7a7166}
      .smart-scan-progress-title{font-family:var(--serif);font-size:20px;line-height:1.15;color:var(--ink);font-weight:600}
      .smart-scan-progress-message{font-size:12px;line-height:1.4;color:#74695d}
      .smart-scan-progress-row{display:flex;align-items:center;gap:8px;margin-top:2px}
      .smart-scan-progress-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(102,113,90,.22);border-top-color:var(--olive);animation:smartScanSpin .8s linear infinite;flex:0 0 auto}
      .smart-scan-progress-engine{font-size:11px;font-weight:800;color:#5d6657}
      .smart-scan-progress-card[data-mode="fallback"]{border-color:rgba(178,138,61,.28)}
      .smart-scan-progress-card[data-mode="fallback"] .smart-scan-progress-engine{color:#8b6a2b}
      .smart-scan-progress-card[data-mode="error"]{border-color:rgba(160,78,72,.28)}
      .smart-scan-progress-card[data-mode="error"] .smart-scan-progress-engine{color:#8e4e49}
      @keyframes smartScanSpin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }

  function ensureOverlay(){
    installStyles();
    let overlay=document.getElementById('smartScanProgressOverlay');
    if(overlay)return overlay;
    overlay=document.createElement('dialog');overlay.id='smartScanProgressOverlay';overlay.setAttribute('aria-live','polite');overlay.setAttribute('aria-busy','true');overlay.setAttribute('aria-label','Smart Scan in progress');
    overlay.innerHTML=`<div class="smart-scan-progress-card" data-mode="local"><div class="smart-scan-progress-thumb"><img id="smartScanProgressImage" alt="Item being analyzed"></div><div class="smart-scan-progress-copy"><div class="smart-scan-progress-kicker">Smart Scan</div><div class="smart-scan-progress-title" id="smartScanProgressTitle">Analyzing item</div><div class="smart-scan-progress-message" id="smartScanProgressMessage">Preparing scan…</div><div class="smart-scan-progress-row"><span class="smart-scan-progress-spinner" aria-hidden="true"></span><span class="smart-scan-progress-engine" id="smartScanProgressEngine">Local Smart Scan</span></div></div></div>`;
    overlay.addEventListener('cancel',e=>e.preventDefault());
    document.body.appendChild(overlay);return overlay;
  }

  function setState({mode='local',title,message,engine,photo}={}){
    const overlay=ensureOverlay(),card=overlay.querySelector('.smart-scan-progress-card'),img=document.getElementById('smartScanProgressImage');
    card.dataset.mode=mode;
    if(photo&&img)img.src=photo;
    if(title)document.getElementById('smartScanProgressTitle').textContent=title;
    if(message)document.getElementById('smartScanProgressMessage').textContent=message;
    if(engine)document.getElementById('smartScanProgressEngine').textContent=engine;
  }
  function clearWatchdog(){clearTimeout(watchdogTimer);watchdogTimer=null}
  function armWatchdog(){clearWatchdog();watchdogTimer=setTimeout(()=>{console.warn('Smart Scan progress overlay watchdog released a stale modal.');closeOverlay()},OVERLAY_WATCHDOG_MS)}
  function openOverlay(){const overlay=ensureOverlay();if(!overlay.open){try{overlay.showModal()}catch{overlay.setAttribute('open','')}}armWatchdog()}
  function closeOverlay(){clearWatchdog();const overlay=ensureOverlay();if(overlay.open){try{overlay.close()}catch{overlay.removeAttribute('open')}}}
  function show(detail={}){clearTimeout(hideTimer);const ai=detail.engine==='ai';setState({mode:ai?'ai':'local',title:ai?'AI Smart Scan in progress':'Local Smart Scan in progress',message:detail.message||'Preparing this item…',engine:ai?'AI Smart Scan':'Local Smart Scan',photo:detail.photo});openOverlay()}
  function update(detail={}){
    const fallback=detail.stage==='fallback-start'||detail.fallback,error=detail.stage==='scan-error';
    setState({mode:error?'error':(fallback?'fallback':(detail.engine==='ai'?'ai':'local')),title:error?'Smart Scan could not finish':(fallback?'Switching to Local Smart Scan':(detail.engine==='ai'?'AI Smart Scan in progress':'Local Smart Scan in progress')),message:detail.message||'',engine:error?'Smart Scan':(fallback?'Local fallback':(detail.engine==='ai'?'AI Smart Scan':'Local Smart Scan'))});
  }
  function hide(delay=0){clearTimeout(hideTimer);if(delay<=0)return closeOverlay();hideTimer=setTimeout(closeOverlay,delay)}

  window.addEventListener('audrey:smartscan-progress',e=>{
    const d=e.detail||{};
    if(d.stage==='scan-start')return show(d);
    if(d.stage==='scan-complete'){update(d);return hide(0)}
    if(d.stage==='scan-error'){update(d);return hide(850)}
    update(d);
  });
  // iOS can restore a suspended page from its page cache. Never restore a stale modal lock.
  window.addEventListener('pageshow',()=>{const overlay=document.getElementById('smartScanProgressOverlay');if(overlay?.open)closeOverlay()});
  window.addEventListener('pagehide',clearWatchdog);

  const API={version:VERSION,watchdogMs:OVERLAY_WATCHDOG_MS,show,update,hide};
  window.AUDREY_SMART_SCAN_PROGRESS=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: top-layer progress dialog has bounded recovery.`);
})();
