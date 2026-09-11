/* Audrey Closet v13.24 — Preview-only Tier regression repair
 * Keeps the legacy Tier selector/ribbon feature stable while Smart Scan Preview evolves.
 * Not loaded by production bootstrap.
 */
(function(){
  'use strict';
  const VERSION='13.24-tier-preview-regression-fix1';
  const TIERS=['S','A','B','C','D'];
  const normalize=v=>{const t=String(v||'').trim().toUpperCase();return TIERS.includes(t)?t:''};

  function tierRibbonsEnabled(){
    try{return state?.settings?.showTierRibbons!==false}catch{return true}
  }

  function syncCatalogTierRibbons(){
    const items=(()=>{try{return Array.isArray(state?.items)?state.items:[]}catch{return []}})();
    const byId=new Map(items.map(i=>[String(i.id),i]));
    document.querySelectorAll('#catalogGrid .item-card[data-id]').forEach(card=>{
      const thumb=card.querySelector('.thumb');if(!thumb)return;
      thumb.querySelectorAll('.tier-ribbon').forEach(x=>x.remove());
      const item=byId.get(String(card.dataset.id||''));
      const tier=normalize(item?.tier);
      if(!tier||!tierRibbonsEnabled())return;
      const ribbon=document.createElement('span');
      ribbon.className='tier-ribbon tier-'+tier.toLowerCase();
      ribbon.setAttribute('aria-label',tier+'-Tier');
      ribbon.textContent=tier+'-Tier';
      thumb.prepend(ribbon);
    });
  }

  function dedupeTierSelector(){
    const host=document.querySelector('#itemReviewDetails');if(!host)return;
    const sections=[...host.querySelectorAll(':scope > .closet-tier-section')];
    sections.slice(1).forEach(x=>x.remove());
  }

  if(typeof window.renderCatalog==='function'){
    const originalRenderCatalog=window.renderCatalog;
    window.renderCatalog=function(){
      const result=originalRenderCatalog.apply(this,arguments);
      queueMicrotask(syncCatalogTierRibbons);
      return result;
    };
  }

  if(typeof window.renderItemReviewDetails==='function'){
    const originalRenderItemReviewDetails=window.renderItemReviewDetails;
    window.renderItemReviewDetails=function(){
      const result=originalRenderItemReviewDetails.apply(this,arguments);
      dedupeTierSelector();
      return result;
    };
  }

  document.addEventListener('change',e=>{
    if(e.target?.id!=='showTierRibbonsSetting')return;
    setTimeout(()=>{
      syncCatalogTierRibbons();
      try{
        const dialog=document.querySelector('#itemDialog');
        if(dialog?.open&&typeof window.renderItemReviewDetails==='function'){
          const id=document.querySelector('#itemId')?.value||'';
          const item=state?.items?.find?.(x=>String(x.id)===String(id))||null;
          window.renderItemReviewDetails(item);
        }
      }catch{}
    },0);
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{dedupeTierSelector();syncCatalogTierRibbons()},{once:true});
  else {dedupeTierSelector();syncCatalogTierRibbons()}

  window.AUDREY_TIER_PREVIEW_FIX={version:VERSION,syncCatalogTierRibbons,dedupeTierSelector};
  console.info(`Audrey Closet ${VERSION} loaded: Tier selector/ribbon Preview repair active.`);
})();
