/* Audrey Closet v13.24.1 — legacy release compatibility bridge
 * Delivers the previously service-worker-injected release payload as ordinary app code.
 * Hotfix: enforce one Tier selector and synchronize saved Tier ribbons on first load.
 */
(function(){
  'use strict';
  const VERSION='13.24.1-tier-idempotency2-ribbon-init';
  const MARKER='v13.21 baseline — dev12 feature set, fresh delivery';
  const TIERS=['S','A','B','C','D'];
  if(window.AUDREY_RELEASE_COMPAT?.readyPromise)return;

  const normalizeTier=value=>{const tier=String(value||'').trim().toUpperCase();return TIERS.includes(tier)?tier:''};

  function tierRibbonsEnabled(){
    try{return state?.settings?.showTierRibbons!==false}catch{return true}
  }

  function syncCatalogTierRibbons(){
    const items=(()=>{try{return Array.isArray(state?.items)?state.items:[]}catch{return []}})();
    const byId=new Map(items.map(item=>[String(item.id),item]));
    document.querySelectorAll('#catalogGrid .item-card[data-id]').forEach(card=>{
      const thumb=card.querySelector('.thumb');if(!thumb)return;
      thumb.querySelectorAll('.tier-ribbon').forEach(ribbon=>ribbon.remove());
      const item=byId.get(String(card.dataset.id||''));
      const tier=normalizeTier(item?.tier);
      if(!tier||!tierRibbonsEnabled())return;
      const ribbon=document.createElement('span');
      ribbon.className='tier-ribbon tier-'+tier.toLowerCase();
      ribbon.setAttribute('aria-label',tier+'-Tier');
      ribbon.textContent=tier+'-Tier';
      thumb.prepend(ribbon);
    });
  }

  function dedupeTierSelector(){
    const host=document.querySelector('#itemReviewDetails');
    if(!host)return 0;
    const sections=[...host.querySelectorAll(':scope > .closet-tier-section')];
    sections.slice(1).forEach(section=>section.remove());
    return sections.length;
  }

  function installTierGuards(){
    if(window.__audreyTierIdempotencyGuardInstalled)return;
    window.__audreyTierIdempotencyGuardInstalled=true;

    // Always dedupe after the complete item-review wrapper chain renders.
    if(typeof window.renderItemReviewDetails==='function'){
      const renderDetails=window.renderItemReviewDetails;
      window.renderItemReviewDetails=function(){
        const result=renderDetails.apply(this,arguments);
        dedupeTierSelector();
        return result;
      };
    }

    // The base app may finish its first catalog render before this compatibility
    // module loads. Wrap future renders and also run one explicit initial sync.
    if(typeof window.renderCatalog==='function'){
      const renderCatalog=window.renderCatalog;
      window.renderCatalog=function(){
        const result=renderCatalog.apply(this,arguments);
        queueMicrotask(syncCatalogTierRibbons);
        return result;
      };
    }

    // Defense in depth for delayed Tier-card mutations from older cached runtimes.
    const host=document.querySelector('#itemReviewDetails');
    if(host&&typeof MutationObserver!=='undefined'){
      let queued=false;
      const observer=new MutationObserver(()=>{
        if(queued)return;
        queued=true;
        queueMicrotask(()=>{queued=false;dedupeTierSelector()});
      });
      observer.observe(host,{childList:true});
      window.__audreyTierIdempotencyObserver=observer;
    }

    dedupeTierSelector();
    syncCatalogTierRibbons();
    queueMicrotask(syncCatalogTierRibbons);
    setTimeout(syncCatalogTierRibbons,150);
  }

  const API={version:VERSION,ready:false,source:'legacy-release-payload-source-v13.24.js',error:null,readyPromise:null,dedupeTierSelector,syncCatalogTierRibbons,installTierGuards};
  API.readyPromise=(async()=>{
    const response=await fetch('./legacy-release-payload-source-v13.24.js?v=13.24-phase7a8c-source1',{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load legacy release payload source (HTTP '+response.status+').');
    const source=await response.text();
    const prefix='const TIER_PATCH=String.raw`';
    const start=source.indexOf(prefix);
    const withStart=source.indexOf('function withTierPatch(resp){',Math.max(0,start));
    if(start<0||withStart<0)throw new Error('Legacy release payload boundaries were not found.');
    const close=source.lastIndexOf('`;',withStart);
    if(close<start)throw new Error('Legacy release payload terminator was not found.');
    const payload=source.slice(start+prefix.length,close);
    const markerCount=payload.split(MARKER).length-1;
    if(markerCount!==1)throw new Error('Legacy release payload marker count was '+markerCount+'; expected exactly one.');
    (0,eval)(payload+'\n//# sourceURL=audrey-legacy-release-compat-v13.24.js');
    installTierGuards();
    API.ready=true;
    document.documentElement.dataset.audreyLegacyCompat='ready';
    document.documentElement.dataset.audreyTierIdempotent='true';
    document.documentElement.dataset.audreyTierRibbonInit='true';
    console.info(`Audrey Closet ${VERSION} loaded: Tier selector dedupe and initial ribbon sync active.`);
    return API;
  })().catch(err=>{
    API.error=String(err?.message||err);
    document.documentElement.dataset.audreyLegacyCompat='error';
    console.error('Audrey v13.24.1 legacy compatibility payload failed',err);
    throw err;
  });
  window.AUDREY_RELEASE_COMPAT=API;
})();
