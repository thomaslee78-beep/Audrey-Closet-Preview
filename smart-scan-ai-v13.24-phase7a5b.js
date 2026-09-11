/* Audrey Closet v13.24 — Smart Scan Phase 7A5B Lightweight Polish
 * Preview UX polish only: subtle scan sheen + result-source badge.
 * No artificial completion delay, no recognition changes, no network calls.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a5b-light-polish1';
  let lastSource={engine:'local',fallbackUsed:false};

  function installStyles(){
    if(document.getElementById('smartScanPolishStyles'))return;
    const style=document.createElement('style');
    style.id='smartScanPolishStyles';
    style.textContent=`
      .smart-scan-progress-thumb{position:relative;isolation:isolate}
      .smart-scan-progress-thumb::after{content:"";position:absolute;left:-12%;right:-12%;top:-32%;height:34%;pointer-events:none;background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,.34),rgba(255,255,255,0));transform:translateY(-120%);animation:audreySmartScanSheen 1.8s ease-in-out infinite;z-index:2}
      @keyframes audreySmartScanSheen{0%{transform:translateY(-120%);opacity:.15}18%{opacity:.7}72%{opacity:.48}100%{transform:translateY(430%);opacity:.08}}
      @media (prefers-reduced-motion:reduce){.smart-scan-progress-thumb::after{animation:none;opacity:0}}
      .smart-scan-result-source{display:inline-flex;align-items:center;gap:5px;width:max-content;max-width:100%;margin:0 0 10px;padding:5px 9px;border-radius:999px;background:rgba(103,115,91,.09);border:1px solid rgba(103,115,91,.16);font-size:11px;font-weight:750;line-height:1.2;color:#5d6657}
      .smart-scan-result-source[data-source="fallback"]{background:rgba(178,138,61,.08);border-color:rgba(178,138,61,.20);color:#806329}
      .smart-scan-result-source-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.68;flex:0 0 auto}
    `;
    document.head.appendChild(style);
  }

  function sourceLabel(source=lastSource){
    if(source.fallbackUsed)return 'AI → Local Smart Scan';
    if(source.engine==='ai')return 'AI Smart Scan';
    return 'Local Smart Scan';
  }

  function decorateReview(){
    installStyles();
    const fields=document.getElementById('smartScanReviewFields');
    if(!fields||!fields.parentElement)return false;
    let badge=document.getElementById('smartScanResultSource');
    if(!badge){
      badge=document.createElement('div');
      badge.id='smartScanResultSource';
      badge.className='smart-scan-result-source';
      badge.innerHTML='<span class="smart-scan-result-source-dot" aria-hidden="true"></span><span id="smartScanResultSourceText"></span>';
      fields.parentElement.insertBefore(badge,fields);
    }
    badge.dataset.source=lastSource.fallbackUsed?'fallback':lastSource.engine;
    const text=badge.querySelector('#smartScanResultSourceText');
    if(text)text.textContent=sourceLabel(lastSource);
    return true;
  }

  function scheduleReviewDecoration(){
    if(decorateReview())return;
    requestAnimationFrame(()=>{if(decorateReview())return;setTimeout(decorateReview,40)});
  }

  window.addEventListener('audrey:smartscan-progress',e=>{
    const d=e.detail||{};
    if(d.stage==='scan-complete'){
      lastSource={engine:d.engine==='ai'?'ai':'local',fallbackUsed:Boolean(d.fallbackUsed)};
      scheduleReviewDecoration();
    }
  });

  installStyles();
  const API={version:VERSION,sourceLabel,decorateReview,getLastSource:()=>({...lastSource})};
  window.AUDREY_SMART_SCAN_POLISH=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: subtle scan sheen and result-source badge enabled.`);
})();
