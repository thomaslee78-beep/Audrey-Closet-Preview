const CACHE='audrey-closet-v13.21-dev12';
const ASSETS=['./','./index.html','./styles.css','./app.js','./share-render-v13.21-dev12.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

/*
 * v13.21 baseline — dev12 functionality, fresh cache.
 *
 * The current app is a single large classic app.js file. For this dev branch we
 * append the isolated tier feature when app.js is served so the stable v13.15
 * source remains untouched while the interaction is tested. If the feature is
 * promoted, it can be folded into app.js/styles.css in the next stable release.
 */
const TIER_PATCH=String.raw`
;/* v13.21 baseline — dev12 feature set, fresh delivery */
(function(){
  const CLOSET_TIERS=['S','A','B','C','D'];
  function normalizeClosetTier(value){
    const tier=String(value||'').trim().toUpperCase();
    return CLOSET_TIERS.includes(tier)?tier:'';
  }
  const TIER_REACTIONS={
    S:['Amazing find!','Can’t live without it','Closet MVP','Instant favorite','This one stays','Worth the hype','Main character piece','Always a yes','Perfect find','Top shelf','Never letting go','The one','Closet legend','No notes','Absolute keeper'],
    A:['Really good one','Easy favorite','Strong pick','Glad we found this','Almost perfect','Gets a lot right','Reliable win','Definitely keeping','Great choice','A regular in rotation','So close to S','Worth reaching for','Easy yes','Solid favorite','Good closet energy'],
    B:['Solid choice','Gets the job done','Good in rotation','Nice to have','Dependable','Works well','Still earning its spot','Pretty good','Useful piece','A steady pick','Nothing wrong here','Good supporting cast','Makes sense','Worth keeping around','Comfortable middle'],
    C:['It has its moments','Maybe with the right outfit','Still figuring this one out','Could grow on you','Needs a little help','Occasional pick','Not bad','Depends on the day','There’s potential','Maybe later','Keep experimenting','Needs the right mood','On the fence','Could work','Give it another shot'],
    D:['Meh','Try again','Not feeling it','Probably not the one','Closet benchwarmer','Maybe it’s time','Hard pass today','Not earning its space','Needs a comeback','Could be better','One more chance?','Not quite working','Low rotation','Maybe let this one go','Thanks for playing']
  };
  const tierReactionByItem=new Map();
  const lastTierReaction={S:'',A:'',B:'',C:'',D:''};
  function pickTierReaction(tier){
    const pool=TIER_REACTIONS[tier]||[];
    if(!pool.length)return'';
    const candidates=pool.length>1?pool.filter(x=>x!==lastTierReaction[tier]):pool;
    const message=candidates[Math.floor(Math.random()*candidates.length)]||pool[0]||'';
    lastTierReaction[tier]=message;
    return message;
  }
  function tierReactionFor(item,tier,{force=false}={}){
    const itemId=item&&item.id?item.id:$('#itemId')?.value||'';
    if(!itemId||!tier)return'';
    const key=itemId+'|'+tier;
    if(force||!tierReactionByItem.has(key))tierReactionByItem.set(key,pickTierReaction(tier));
    return tierReactionByItem.get(key)||'';
  }
  function tierRibbonsEnabled(){
    ensureSettings();
    return state.settings.showTierRibbons!==false;
  }
  async function setTierRibbonsEnabled(enabled){
    ensureSettings();
    const previous=state.settings.showTierRibbons!==false;
    state.settings.showTierRibbons=!!enabled;
    renderCatalog();
    const ok=await saveState();
    if(!ok){
      state.settings.showTierRibbons=previous;
      const input=$('#showTierRibbonsSetting');
      if(input)input.checked=previous;
      renderCatalog();
    }
  }
  const CLOSET_VIEWS=['classic','modern','free-flow'];
  function normalizeClosetView(value){
    const view=String(value||'classic').trim().toLowerCase();
    return CLOSET_VIEWS.includes(view)?view:'classic';
  }
  function currentClosetView(){
    ensureSettings();
    return normalizeClosetView(state.settings.closetView);
  }
  let freeFlowScatterNonce=0;
  function freeFlowHash(text){
    let h=2166136261;
    const s=String(text||'');
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
    return h>>>0;
  }
  function freeFlowRand(id,salt){
    const h=freeFlowHash(String(id)+'|'+String(freeFlowScatterNonce)+'|'+String(salt));
    return (h%10000)/9999;
  }
  function applyFreeFlowScatter(){
    if(currentClosetView()!=='free-flow')return;
    $$('#catalogGrid .item-card[data-id]').forEach(function(card,index){
      const id=card.dataset.id||String(index);
      const xBase=-8+freeFlowRand(id,'x')*16;
      const yBase=-9+freeFlowRand(id,'y')*18;
      const edgeBias=(index%4===0?-3:(index%4===1?2.5:(index%4===2?-1.5:3)));
      const rowBreath=(Math.floor(index/2)%3===0?-2:(Math.floor(index/2)%3===1?1.5:3));
      const x=Math.round(xBase+edgeBias);
      const y=Math.round(yBase+rowBreath);
      const scale=(1.02+freeFlowRand(id,'s')*.08).toFixed(3);
      const rotate=(-.55+freeFlowRand(id,'r')*1.10).toFixed(2);
      const thumb=card.querySelector('.thumb');
      if(!thumb)return;
      thumb.style.setProperty('--ff-x',x+'px');
      thumb.style.setProperty('--ff-y',y+'px');
      thumb.style.setProperty('--ff-scale',scale);
      thumb.style.setProperty('--ff-r',rotate+'deg');
    });
  }
  function reshuffleFreeFlowScatter(){
    freeFlowScatterNonce++;
    applyFreeFlowScatter();
  }
  function applyClosetView(){
    const screen=document.querySelector('.screen[data-screen="catalog"]');
    if(!screen)return;
    const view=currentClosetView();
    screen.dataset.closetView=view;
    document.body.classList.toggle('closet-view-modern',view==='modern');
    document.body.classList.toggle('closet-view-free-flow',view==='free-flow');
    document.body.classList.toggle('closet-view-classic',view==='classic');
    $$('.closet-view-option').forEach(function(btn){
      const active=btn.dataset.closetView===view;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }
  async function setClosetView(view){
    view=normalizeClosetView(view);
    ensureSettings();
    const previous=currentClosetView();
    state.settings.closetView=view;
    applyClosetView();
    renderCatalog();
    const ok=await saveState();
    if(!ok){
      state.settings.closetView=previous;
      applyClosetView();
      renderCatalog();
    }
  }
  function installClosetTierStyles(){
    if(document.getElementById('closetTierStyles'))return;
    const style=document.createElement('style');
    style.id='closetTierStyles';
    style.textContent=[
      '#itemDialog .closet-tier-section{display:grid;gap:8px;padding:10px 11px;border:1px solid rgba(108,81,66,.14);border-radius:15px;background:rgba(243,238,225,.56)}',
      '#itemDialog .closet-tier-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}',
      '#itemDialog .closet-tier-heading>div{display:grid;gap:1px}',
      '#itemDialog .closet-tier-kicker{font-size:9px;line-height:1;letter-spacing:.11em;text-transform:uppercase;color:#8a7c6e;font-weight:800}',
      '#itemDialog .closet-tier-heading strong{font-family:var(--serif);font-size:17px;line-height:1.15;font-weight:600;color:var(--ink)}',
      '#itemDialog .closet-tier-heading small{max-width:145px;text-align:right;font-size:9px;line-height:1.2;color:#897d6e}',
      '#itemDialog .closet-tier-options{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}',
      '#itemDialog .closet-tier-btn{min-width:0;height:36px;padding:0;border:1px solid rgba(108,81,66,.24);border-radius:10px;background:#fffaf0;color:#74695d;font:800 14px/1 var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,background .12s ease,border-color .12s ease,color .12s ease,box-shadow .12s ease}',
      '#itemDialog .closet-tier-btn:active{transform:scale(.96)}',
      '#itemDialog .closet-tier-btn.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.13),0 2px 5px rgba(63,73,55,.14)}',
      '#itemDialog .closet-tier-btn:focus-visible{outline:3px solid rgba(77,142,138,.3);outline-offset:2px}',
      '#itemDialog .closet-tier-btn:disabled{opacity:.58}',
      '#catalogGrid .thumb{position:relative;overflow:hidden}',
      '#catalogGrid .tier-ribbon{--tier-a:#65745d;--tier-b:#53624c;--tier-tail:#465440;--tier-text:#fff;position:absolute;left:0;top:10px;z-index:3;display:inline-flex;align-items:center;height:22px;padding:0 12px;background:linear-gradient(135deg,var(--tier-a),var(--tier-b) 60%,var(--tier-tail));color:var(--tier-text);font:800 10px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;border-radius:0 10px 10px 0;box-shadow:0 2px 8px rgba(52,63,48,.18)}',
      '#catalogGrid .tier-ribbon::after{content:"";position:absolute;right:-7px;top:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:7px solid var(--tier-tail)}',
      '#catalogGrid .tier-ribbon.tier-s{--tier-a:#b8944e;--tier-b:#b38a3d;--tier-tail:#8b6a2b;--tier-text:#fff8ea;box-shadow:0 2px 8px rgba(88,65,22,.22)}',
      '#catalogGrid .tier-ribbon.tier-a{--tier-a:#66785f;--tier-b:#596b53;--tier-tail:#465840;--tier-text:#fff}',
      '#catalogGrid .tier-ribbon.tier-b{--tier-a:#7d8d76;--tier-b:#718269;--tier-tail:#5f7058;--tier-text:#fff}',
      '#catalogGrid .tier-ribbon.tier-c{--tier-a:#99a591;--tier-b:#8e9b87;--tier-tail:#7c8975;--tier-text:#253026}',
      '#catalogGrid .tier-ribbon.tier-d{--tier-a:#b9c2b4;--tier-b:#adb8a8;--tier-tail:#98a493;--tier-text:#253026}',
      '#tierFilterWrap{display:grid;gap:6px;grid-column:1/-1;padding:2px 0}',
      '#tierFilterWrap .tier-filter-label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#817568}',
      '#tierFilterOptions{display:flex;flex-wrap:wrap;gap:6px}',
      '#tierFilterOptions .tier-filter-chip{min-width:38px;height:32px;padding:0 10px;border:1px solid rgba(108,81,66,.2);border-radius:10px;background:#fffaf0;color:#74695d;font:800 11px/1 var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '#tierFilterOptions .tier-filter-chip.active{background:var(--olive);border-color:var(--olive-dark);color:#fff;box-shadow:0 2px 5px rgba(63,73,55,.12)}',
      '#tierFilterOptions .tier-filter-chip[data-tier-filter="unrated"]{min-width:72px}',
      '#tierRibbonSettingsCard{margin-top:12px}',
      '#tierRibbonSettingsCard .tier-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0}',
      '#tierRibbonSettingsCard .tier-setting-copy{display:grid;gap:3px;min-width:0}',
      '#tierRibbonSettingsCard .tier-setting-copy strong{font-size:14px;color:var(--ink)}',
      '#tierRibbonSettingsCard .tier-setting-copy small{font-size:11px;line-height:1.35;color:#817568}',
      '#tierRibbonSettingsCard .tier-setting-toggle{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;font-size:12px;font-weight:700;color:#74695d}',
      '#tierRibbonSettingsCard .tier-setting-toggle input{width:20px;height:20px;accent-color:var(--olive)}',
      '.settings-groups{display:grid;gap:10px}',
      '.settings-group{border:1px solid rgba(108,81,66,.16);border-radius:16px;background:#e1e5da;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,.45) inset}',
      '.settings-group>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:0 15px;cursor:pointer;font-weight:800;color:var(--ink);background:#e1e5da;-webkit-tap-highlight-color:transparent;transition:background .14s ease}',
      '.settings-group>summary::-webkit-details-marker{display:none}',
      '.settings-group>summary:active{background:#d4dacd}',
      '.settings-group>summary::after{content:"＋";font-size:18px;line-height:1;color:#6f7868;font-weight:600}',
      '.settings-group[open]>summary{background:#e1e5da;border-bottom:1px solid rgba(108,81,66,.10)}',
      '.settings-group[open]>summary::after{content:"−"}',
      '.settings-group>summary small{display:block;font-size:10px;line-height:1.25;font-weight:600;color:#716b61;margin-top:3px}',
      '.settings-group-body{display:grid;gap:10px;padding:10px;background:rgba(255,250,240,.76)}',
      '.settings-group-body>.settings-card{margin:0}',
      '.settings-group-empty{padding:14px;border:1px dashed rgba(108,81,66,.16);border-radius:12px;background:rgba(255,255,255,.48);font-size:12px;line-height:1.45;color:#817568}',
      '.settings-about-card{display:grid;gap:6px}',
      '.settings-about-version{font-weight:800;color:var(--ink)}',
      '.planned-section-toggle{border-color:var(--line)!important;background:#efe6d5!important}',
      '.planned-section-toggle small{color:#7b7065!important}',
      '.planned-toggle-icon{color:var(--burgundy)!important}',
      '.today-journal-section{background:#f2eadb!important;border-radius:16px!important;padding:0 10px 10px!important;overflow:hidden}',
      '.today-section-toggle{border:0!important;background:#f2eadb!important;border-radius:0!important;padding:11px 2px 9px!important}',
      '.today-section-toggle strong{font-family:var(--serif)!important;font-size:19px!important;font-weight:600!important;color:var(--ink)!important}',
      '.today-section-toggle small{font-size:10px!important;color:#7b7065!important}',
      '.today-toggle-icon{color:var(--burgundy)!important}',
      '.today-journal-content{margin-top:0!important}',
      '#closetViewSettingsCard{display:grid;gap:10px}',
      '.closet-view-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
      '.closet-view-option{min-width:0;min-height:76px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;padding:10px;border:1px solid var(--line);border-radius:13px;background:#fffdf7;color:var(--ink);font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.closet-view-option strong{font-family:var(--serif);font-size:15px;font-weight:600}',
      '.closet-view-option small{font-size:9px;line-height:1.3;color:#817568}',
      '.closet-view-option.active{background:#e1e5da;border-color:var(--olive);box-shadow:inset 0 0 0 1px rgba(102,113,90,.18)}',
      '.closet-view-option:disabled{opacity:.48;cursor:default}',
      '.closet-view-note{margin:0!important;font-size:10px!important;color:#817568!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .hero-card{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;border-radius:0;box-shadow:none;padding-left:20px;padding-right:20px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;background:#fff}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card{border-radius:0;border:1px solid rgba(255,255,255,.96);box-shadow:none;background:#fffaf0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .thumb{aspect-ratio:1/1.08;border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .card-body{padding:8px 9px 9px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .card-body{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card h4{font-size:15px;margin-bottom:2px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card p{font-size:10px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-section-title{margin-top:16px}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-strip{width:calc(100% + 28px);margin-left:-14px;margin-right:-14px;padding-left:0;padding-right:0;gap:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip{min-width:110px;border-radius:0;border-left:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-right:1px solid var(--line);background:var(--paper)}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip:first-child{border-left:1px solid var(--line)}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .category-chip.active{border-color:var(--turq);background:var(--turq);color:#fff}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .toolbar .searchbox{border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] #filterBtn{border-radius:0}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .item-card .count-badge{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .hero-card .primary{border-radius:0!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid{background:transparent!important}',
      '.screen[data-screen="catalog"][data-closet-view="modern"] .closet-grid:has(.item-card:last-child:nth-child(odd))::after{content:"";display:block;aspect-ratio:1/1.08;background:linear-gradient(140deg,#e7dfcd,#f8f3e8);border:1px solid rgba(255,255,255,.96);box-sizing:border-box}',
      'body.closet-view-modern .closet-drop-outline{border-radius:0!important}',
      'body.closet-view-modern .closet-drag-ghost{border-radius:0!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .closet-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1px;background:transparent!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card{position:relative;overflow:visible;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;min-height:186px;display:flex;align-items:center;justify-content:center}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .card-body{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .count-badge{display:none!important}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card .thumb{width:107%;aspect-ratio:1/1.08;background:transparent!important;border:0!important;overflow:visible!important;display:flex;align-items:center;justify-content:center;transform-origin:center center;transform:translate(var(--ff-x,0px),var(--ff-y,0px)) rotate(var(--ff-r,0deg)) scale(var(--ff-scale,1.04))}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .item-card img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 7px 8px rgba(68,55,37,.10));transition:transform .14s ease}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .tier-ribbon{top:12px;left:5px;transform:scale(.86);transform-origin:left top}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .archived-badge{transform:scale(.88);transform-origin:right top}',
      '.screen[data-screen="catalog"][data-closet-view="free-flow"] .closet-section-title{margin-bottom:3px}',
      'body.closet-view-free-flow .closet-drag-ghost{border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}',
      'body.closet-view-free-flow .closet-drag-ghost .card-body,body.closet-view-free-flow .closet-drag-ghost .count-badge{display:none!important}',
      'body.closet-view-free-flow .closet-drop-outline{border-radius:0!important;background:rgba(125,53,71,.035)!important}',
      '.screen[data-screen="outfits"] .board-picker-card{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding-left:0!important;padding-right:0!important}',
      '.screen[data-screen="outfits"] .piece-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:0 2px!important;padding:2px 0 8px!important;overflow:visible!important;max-height:none!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece{position:relative;width:auto!important;min-width:0!important;border:0!important;background:transparent!important;padding:0!important;overflow:visible!important;min-height:118px;display:flex;align-items:center;justify-content:center}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece .mini-photo{width:108%!important;height:auto!important;aspect-ratio:1/1.04!important;border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;box-shadow:none!important;overflow:visible!important;display:flex;align-items:center;justify-content:center;transform-origin:center center}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece .mini-photo img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;filter:drop-shadow(0 6px 7px rgba(68,55,37,.10))}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece small,.screen[data-screen="outfits"] .piece-grid .tray-piece em{display:none!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+1) .mini-photo{transform:translate(-5px,5px) rotate(-.35deg) scale(1.03)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+2) .mini-photo{transform:translate(4px,-3px) rotate(.25deg) scale(1.07)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+3) .mini-photo{transform:translate(1px,3px) rotate(.15deg) scale(1.04)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+4) .mini-photo{transform:translate(-3px,-4px) rotate(-.30deg) scale(1.08)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+5) .mini-photo{transform:translate(5px,2px) rotate(.20deg) scale(1.02)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+6) .mini-photo{transform:translate(-2px,6px) rotate(-.20deg) scale(1.06)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+7) .mini-photo{transform:translate(3px,-5px) rotate(.32deg) scale(1.05)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+8) .mini-photo{transform:translate(-4px,1px) rotate(-.18deg) scale(1.03)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+9) .mini-photo{transform:translate(2px,5px) rotate(.28deg) scale(1.07)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n) .mini-photo{transform:translate(-1px,-2px) rotate(-.22deg) scale(1.04)}',
      '.screen[data-screen="outfits"] .picker-head{margin-left:2px;margin-right:2px}',
      '.screen[data-screen="outfits"] .picker-head span{display:none!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .piece-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:0!important}.screen[data-screen="outfits"] .piece-grid .tray-piece{min-height:108px}}',
      '.screen[data-screen="outfits"]{--board-format-ratio:4/5}',
      '.screen[data-screen="outfits"] .board-page-head{margin-bottom:8px}',
      '.screen[data-screen="outfits"] .board-compose-bar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;margin:0 0 10px}',
      '.screen[data-screen="outfits"] .board-compose-name{min-width:0;font:inherit;color:var(--ink);border:1px solid var(--line);background:#fffdf7;border-radius:13px;padding:11px 12px;width:100%;outline:none}',
      '.screen[data-screen="outfits"] .board-compose-name:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .board-notes-btn{width:42px;height:42px;padding:0;border:1px solid rgba(108,81,66,.16);border-radius:13px;background:#eee4d0;color:var(--coffee);font-size:19px;font-weight:800}',
      '.screen[data-screen="outfits"] .board-compose-save{min-height:42px;padding:10px 13px;white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-notes-drawer{display:none;margin:-3px 0 10px;padding:9px;border:1px solid var(--line);border-radius:13px;background:#f3ead8}',
      '.screen[data-screen="outfits"] .board-notes-drawer.open{display:block}',
      '.screen[data-screen="outfits"] .board-notes-drawer textarea{min-height:78px;margin:0!important}',
      '.screen[data-screen="outfits"] .board-shell.board-first{display:block!important;margin:0}',
      '.screen[data-screen="outfits"] .board-first>div:first-child{width:100%}',
      '.screen[data-screen="outfits"] #outfitBoard{width:min(100%,620px);height:auto!important;aspect-ratio:var(--board-format-ratio);margin:0 auto;border-radius:18px}',
      '.screen[data-screen="outfits"] .board-save-panel{display:none!important}',
      '.screen[data-screen="outfits"] #boardEditbar{margin:0;padding:0;overflow-x:auto}',
      '.screen[data-screen="outfits"] .board-workspace{margin-top:10px}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{position:sticky;top:66px;z-index:16;display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#f8f2e4;box-shadow:0 4px 12px rgba(65,52,37,.08)}',
      '.screen[data-screen="outfits"] .board-workspace-tab{min-width:0;border:0;border-right:1px solid var(--line);background:#f8f2e4;color:#786c5e;padding:11px 6px;font:750 11px/1.1 var(--sans)}',
      '.screen[data-screen="outfits"] .board-workspace-tab:last-child{border-right:0}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .board-workspace-panel{display:none;padding-top:9px}',
      '.screen[data-screen="outfits"] .board-workspace-panel.active{display:block}',
      '.screen[data-screen="outfits"] .board-workspace-panel .board-picker-card{margin:0!important}',
      '.screen[data-screen="outfits"] .board-tools-shell{display:grid;gap:9px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,250,240,.78)}',
      '.screen[data-screen="outfits"] .board-tools-actions{display:flex;gap:7px;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .board-tools-actions .soft-btn{flex:1 1 120px}',
      '.screen[data-screen="outfits"] .board-decorate-shell{padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,250,240,.78)}',
      '.screen[data-screen="outfits"] .board-decorate-shell{display:grid;gap:10px}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab{min-width:0;border:1px solid rgba(108,81,66,.16);border-radius:12px;background:#f8f1e3;color:#6e6357;padding:10px 6px;display:grid;gap:4px;justify-items:center;font:800 11px/1.05 var(--sans)}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab .tab-icon{font-size:16px;line-height:1}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab.active{background:#6d7863;border-color:#6d7863;color:#fff}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panel{display:none;gap:10px}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panel.active{display:grid}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-intro{display:grid;gap:7px;padding:10px 11px;border:1px solid rgba(108,81,66,.12);border-radius:14px;background:#fffaf0}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-intro strong{font-family:var(--serif);font-size:18px;color:#5e5449}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-intro p{margin:0;color:#75695d;font-size:12px;line-height:1.35}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-future-chips{display:flex;gap:6px;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-future-chips span{display:inline-flex;align-items:center;justify-content:center;padding:6px 9px;border-radius:999px;background:#f1eadc;border:1px solid rgba(108,81,66,.10);color:#6f6458;font:750 10px/1.1 var(--sans)}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-content{display:grid;gap:9px}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card{padding:10px;border:1px solid rgba(108,81,66,.12);border-radius:14px;background:rgba(255,250,240,.86)}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card>*:first-child{margin-top:0!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card>*:last-child{margin-bottom:0!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card h4{margin:0 0 6px;font-size:12px;color:#5f554a}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-empty-note{display:none!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-shared-help{margin:0!important;padding:8px 4px 1px;color:#7b7064;text-align:center}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-draw-current{margin:0}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-draw-current #drawModeBtn{min-width:120px;font-size:12px}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .tool-row{margin:0}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .sticker-row{margin:0}',
      '.screen[data-screen="outfits"] .board-decorate-shell{min-width:0;max-width:100%;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panels{min-width:0;max-width:100%;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-panel{min-width:0;max-width:100%;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-content{min-width:0;max-width:100%;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card{min-width:0;max-width:100%;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .sticker-row{width:100%;max-width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .sticker-row::-webkit-scrollbar{display:none}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .sticker-row button{flex:0 0 auto}',
      '.screen[data-screen="outfits"] .text-studio{display:grid;gap:9px;min-width:0}',
      '.screen[data-screen="outfits"] .text-studio textarea{width:100%;min-height:68px;max-height:132px;resize:vertical;border:1px solid var(--line);border-radius:12px;background:#fffdf7;color:var(--ink);padding:10px 11px;font:16px/1.35 var(--sans);outline:none;box-sizing:border-box}',
      '.screen[data-screen="outfits"] .text-studio textarea:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .text-studio-label{font:800 10px/1 var(--sans);letter-spacing:.03em;color:#756a5c}',
      '.screen[data-screen="outfits"] .text-font-select{width:100%;min-width:0;height:40px;border:1px solid var(--line);border-radius:11px;background:#fffdf7;color:var(--ink);padding:0 9px;font:14px var(--sans)}',
      '.screen[data-screen="outfits"] .text-font-align-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto 36px;gap:6px;align-items:center;min-width:0}',
      '.screen[data-screen="outfits"] .text-font-inline-label{margin:0;white-space:nowrap;align-self:center}',
      '.screen[data-screen="outfits"] .text-font-align-row .text-font-select{width:100%;min-width:0}',
      '.screen[data-screen="outfits"] .text-align-group{display:grid;grid-template-columns:repeat(3,36px);gap:4px}',
      '.screen[data-screen="outfits"] .text-align-btn{width:36px;height:40px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#665c50;padding:0;display:grid;place-items:center}',
      '.screen[data-screen="outfits"] .text-align-btn span{display:block;width:18px;font:800 16px/1 monospace;overflow:hidden;transform:scaleX(.85)}',
      '.screen[data-screen="outfits"] .text-align-left span{text-align:left;transform-origin:left center}',
      '.screen[data-screen="outfits"] .text-align-center span{text-align:center}',
      '.screen[data-screen="outfits"] .text-align-right span{text-align:right;transform-origin:right center}',
      '.screen[data-screen="outfits"] .text-align-btn.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .text-format-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .text-format-btn{width:38px;height:36px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#5f554a;font:800 14px var(--serif)}',
      '.screen[data-screen="outfits"] .text-format-btn[data-format="italic"]{font-style:italic}',
      '.screen[data-screen="outfits"] .text-format-btn[data-format="underline"]{text-decoration:underline}',
      '.screen[data-screen="outfits"] .text-format-btn.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .text-size-group{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;flex:1;min-width:180px}',
      '.screen[data-screen="outfits"] .text-size-btn{height:36px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675c50;font:800 11px var(--sans)}',
      '.screen[data-screen="outfits"] .text-size-btn.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .text-studio-action{width:100%;min-height:42px;border:0;border-radius:12px;background:var(--burgundy);color:#fff;font:800 12px var(--sans)}',
      '.screen[data-screen="outfits"] .text-studio-selection{display:none;padding:7px 9px;border-radius:10px;background:#eef0e8;color:#53604d;font:700 10px/1.25 var(--sans)}',
      '.screen[data-screen="outfits"] .text-studio.is-editing .text-studio-selection{display:block}',
      '.screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"]>.decorate-studio-intro{display:none!important}',
      '.screen[data-screen="outfits"] .decorate-studio-panel[data-decorate-group="text"]{gap:0!important}',
      '.screen[data-screen="outfits"] .text-entry-action-row{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:7px;align-items:stretch;min-width:0}',
      '.screen[data-screen="outfits"] .text-entry-action-row textarea{min-width:0;margin:0!important}',
      '.screen[data-screen="outfits"] .text-entry-action-row .text-studio-action{width:92px;min-width:92px;height:36px;min-height:36px;padding:0 7px;line-height:1.1}',
      '.screen[data-screen="outfits"] .text-action-stack{display:grid;grid-template-rows:repeat(2,36px);gap:5px;min-width:92px;align-content:start}',
      '.screen[data-screen="outfits"] .text-entry-action-row{align-items:stretch}',
      '.screen[data-screen="outfits"] .text-entry-action-row #boardTextInput{height:77px;min-height:77px;max-height:77px;resize:none;box-sizing:border-box}',
      '.screen[data-screen="outfits"] .text-clear-btn{width:92px;height:36px;border:1px solid rgba(108,81,66,.20);border-radius:10px;background:#f8f1e3;color:#665c50;font:700 12px var(--sans);padding:0 8px}',
      '.screen[data-screen="outfits"] .text-clear-btn:active{transform:translateY(1px)}',
      '.screen[data-screen="outfits"] .text-action-stack .text-studio-action{width:92px;min-width:92px;height:36px;min-height:36px}',
      '.screen[data-screen="outfits"] .text-color-btn{display:none!important}',
      '.screen[data-screen="outfits"] #boardTextColorInputV13213{display:block;width:36px;height:40px;min-width:36px;border:1px solid rgba(108,81,66,.22);border-radius:10px;background:#fffaf0;padding:2px;box-sizing:border-box;cursor:pointer}',
      '.screen[data-screen="outfits"] .board-text[data-text-v132012="true"]{white-space:pre-wrap!important;overflow-wrap:anywhere!important;line-height:1.08!important;text-align:center!important;padding:5px!important;box-sizing:border-box!important}',
      '@media(max-width:360px){.screen[data-screen="outfits"] .text-entry-action-row{grid-template-columns:minmax(0,1fr) 78px}.screen[data-screen="outfits"] .text-entry-action-row .text-studio-action{width:78px;min-width:78px;font-size:11px}}',
      '.screen[data-screen="outfits"] .board-text{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;padding:5px;box-sizing:border-box;line-height:1.08;overflow:hidden}',
      '.snapshot-piece .board-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.08;text-align:center;padding:2px;box-sizing:border-box;overflow:hidden}',
      '.screen[data-screen="outfits"] .board-decorate-shell .decorate-tool-card .shape-row{margin:0}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tabs{gap:5px}.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-tab{padding:8px 4px;font-size:10px}.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-intro strong{font-size:17px}.screen[data-screen="outfits"] .board-decorate-shell .decorate-studio-intro p{font-size:11px}}',
      '.screen[data-screen="outfits"] .board-decorate-shell #decorateToggle{display:none!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell #creativeTools{display:none!important}',
      '.screen[data-screen="outfits"] .board-decorate-shell #creativeTools.hidden{display:none!important}',
      '.screen[data-screen="outfits"] .board-controls-top{display:none!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-compose-bar{grid-template-columns:minmax(0,1fr) 40px auto;gap:6px}.screen[data-screen="outfits"] .board-compose-save{padding-left:10px;padding-right:10px;font-size:12px}.screen[data-screen="outfits"] #outfitBoard{border-radius:15px}.screen[data-screen="outfits"] .board-workspace-tabs{top:62px}.screen[data-screen="outfits"] .board-workspace-tab{font-size:10px;padding:10px 4px}}',
      '.screen[data-screen="outfits"] .board-notes-drawer{width:100%}',
      '.screen[data-screen="outfits"] .board-notes-drawer textarea{width:100%!important;display:block;box-sizing:border-box;font-size:16px!important;line-height:1.35}',
      '.screen[data-screen="outfits"] #boardTextInput{font-size:16px!important}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:5px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small{margin:0!important;flex:0 0 auto;display:flex;gap:5px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small button{padding:6px 9px;font-size:10px;border-radius:12px}',
      '.screen[data-screen="outfits"] .board-tools-main .board-editbar{display:flex;gap:5px;flex-wrap:wrap;overflow:visible}',
      '.screen[data-screen="outfits"] .board-tools-main .board-editbar button{flex:1 1 92px}',
      '.screen[data-screen="outfits"] .board-tools-main #clearBoardBtn{display:inline-flex;align-items:center;justify-content:center}',
      '.screen[data-screen="outfits"] .board-page-head .board-head-actions{display:flex;gap:7px;align-items:center}',
      '.screen[data-screen="outfits"] .board-page-head .board-head-actions #shareOutfitBtn{white-space:nowrap}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-notes-drawer textarea,.screen[data-screen="outfits"] #boardTextInput,.screen[data-screen="outfits"] .board-compose-name{font-size:16px!important}.screen[data-screen="outfits"] .board-picker-bottom .picker-head{gap:6px}.screen[data-screen="outfits"] .board-picker-bottom .picker-head strong{font-size:17px}.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small button{padding:6px 7px;font-size:9px}.screen[data-screen="outfits"] .board-page-head .board-head-actions{gap:5px}}',
      '.screen[data-screen="outfits"] .board-picker-filters{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px;align-items:center;margin:5px 0 6px}',
      '.screen[data-screen="outfits"] .board-picker-search{min-width:0;height:38px;border:1px solid var(--line);border-radius:12px;background:#fffdf7;padding:0 10px;font:16px/1 var(--sans);color:var(--ink);outline:none}',
      '.screen[data-screen="outfits"] .board-picker-search:focus{border-color:var(--turq);box-shadow:0 0 0 3px rgba(77,142,138,.12)}',
      '.screen[data-screen="outfits"] .board-picker-filter-btn{height:38px;padding:0 10px;border:1px solid var(--line);border-radius:12px;background:#fffaf0;color:#74695d;font:750 10px/1 var(--sans);white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-picker-filter-btn.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .board-picker-filter-panel{display:none;grid-column:1/-1;padding:8px;border:1px solid var(--line);border-radius:12px;background:#f5eedf}',
      '.screen[data-screen="outfits"] .board-picker-filter-panel.open{display:grid;gap:7px}',
      '.screen[data-screen="outfits"] .board-picker-filter-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
      '.screen[data-screen="outfits"] .board-picker-filter-row>span{min-width:42px;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#817568}',
      '.screen[data-screen="outfits"] .board-picker-chip{min-height:30px;padding:0 9px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;color:#74695d;font:750 10px/1 var(--sans)}',
      '.screen[data-screen="outfits"] .board-picker-chip.active{background:var(--olive);border-color:var(--olive);color:#fff}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece.board-picker-added .mini-photo{animation:boardPickerAdded .52s ease-out}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-added{animation:boardPieceArrive .42s ease-out}',
      '@keyframes boardPickerAdded{0%{filter:none}35%{filter:drop-shadow(0 0 8px rgba(77,142,138,.55));transform:scale(1.07)}100%{filter:none}}',
      '@keyframes boardPieceArrive{0%{opacity:.35}45%{opacity:1;filter:drop-shadow(0 0 10px rgba(77,142,138,.42))}100%{filter:none}}',
      '.screen[data-screen="outfits"] #clearBoardBtn{border-color:rgba(125,53,71,.22)!important;color:var(--burgundy)!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-picker-filters{grid-template-columns:minmax(0,1fr) auto auto;gap:5px}.screen[data-screen="outfits"] .board-picker-filter-btn{padding:0 8px;font-size:9px}}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head>strong{display:none!important}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head{justify-content:flex-end;margin-bottom:2px}',
      '.screen[data-screen="outfits"] .board-picker-bottom .picker-head .tabs-small{margin-left:auto!important}',
      '.screen[data-screen="outfits"] .outfit-category-filter{margin-top:2px!important;margin-bottom:4px!important}',
      '.screen[data-screen="outfits"] .board-picker-filters{margin-top:2px!important;margin-bottom:4px!important}',
      '.screen[data-screen="outfits"] .piece-grid{padding-top:0!important}',
      '.screen[data-screen="outfits"] .board-picker-reset-btn{height:38px;padding:0 10px;border:1px solid rgba(108,81,66,.16);border-radius:12px;background:#eee5d3;color:#74695d;font:750 10px/1 var(--sans);white-space:nowrap}',
      '.screen[data-screen="outfits"] .board-picker-reset-btn:active{transform:scale(.97)}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-picker-filters{grid-template-columns:minmax(0,1fr) auto auto auto!important}.screen[data-screen="outfits"] .board-picker-reset-btn{padding:0 7px;font-size:9px}}',
      '.screen[data-screen="outfits"] .board-workspace{margin-top:4px}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{position:sticky;top:66px;z-index:16;display:flex;align-items:flex-end;gap:3px;border:0!important;border-radius:0!important;overflow:visible;background:transparent!important;box-shadow:none!important;padding:0 2px}',
      '.screen[data-screen="outfits"] .board-workspace-tab{position:relative;min-width:0;flex:1 1 0;border:0!important;border-radius:13px 13px 0 0!important;background:#e9e0cf;color:#75695c;padding:10px 7px 9px;font:750 11px/1.1 var(--sans);box-shadow:none!important;margin:0}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#f5eedf!important;color:var(--ink)!important;z-index:2;padding-bottom:11px}',
      '.screen[data-screen="outfits"] .board-workspace-panel{display:none;padding:0 0 4px;margin-top:0;border:0!important;border-radius:0 0 14px 14px;background:#f5eedf}',
      '.screen[data-screen="outfits"] .board-workspace-panel.active{display:block;padding-top:7px}',
      '.screen[data-screen="outfits"] .board-workspace-panel .board-picker-card{background:transparent!important;border:0!important;box-shadow:none!important;padding-top:0!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell{border:0!important;border-radius:0 0 14px 14px!important;background:#f5eedf!important;box-shadow:none!important;padding-top:8px}',
      '.screen[data-screen="outfits"] .board-picker-bottom{background:#f5eedf!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="pick"]{padding-left:2px;padding-right:2px}',
      '.screen[data-screen="outfits"] .board-workspace-tab:not(.active):active{background:#dfd4c1}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{top:62px;gap:2px}.screen[data-screen="outfits"] .board-workspace-tab{font-size:10px;padding:9px 5px 8px;border-radius:11px 11px 0 0!important}.screen[data-screen="outfits"] .board-workspace-tab.active{padding-bottom:10px}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:#d8cdb9!important;padding:5px 5px 0;border-radius:14px 14px 0 0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{display:flex;align-items:center;justify-content:flex-start;text-align:left;font-family:var(--serif)!important;font-size:15px!important;font-weight:600!important;letter-spacing:0!important;color:#51483f!important;background:#cbbda6!important;padding:11px 10px 10px!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#eee4d2!important;color:#302a25!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{background:#eee4d2!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell,.screen[data-screen="outfits"] .board-picker-bottom{background:#eee4d2!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:not(.active):active{background:#c2b298!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tab{font-size:14px!important;padding:10px 8px 9px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:#e6dcc9!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{justify-content:center!important;text-align:center!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab.active{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-tools-shell,.screen[data-screen="outfits"] .board-decorate-shell,.screen[data-screen="outfits"] .board-picker-bottom{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .outfit-category-filter{background:#f1e7d5!important;border:0!important;box-shadow:none!important;padding-top:2px!important;padding-bottom:3px!important}',
      '.screen[data-screen="outfits"] .board-picker-filters{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel[data-board-panel="pick"]{background:#f1e7d5!important}',
      '.screen[data-screen="outfits"] .piece-grid{padding-top:12px!important;overflow:visible!important}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece{transform:translateY(2px)}',
      '.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+2) .mini-photo,.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+4) .mini-photo,.screen[data-screen="outfits"] .piece-grid .tray-piece:nth-child(10n+7) .mini-photo{margin-top:4px}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .piece-grid{padding-top:10px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{background:transparent!important;padding:5px 0 0!important;gap:8px!important;border-radius:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{margin:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:first-child{margin-left:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab:last-child{margin-right:0!important}',
      '.screen[data-screen="outfits"] .board-workspace-panel{margin-left:0!important;margin-right:0!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{gap:6px!important}}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{gap:5px!important}',
      '.screen[data-screen="outfits"] .board-workspace-tab{border-radius:0!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-workspace-tabs{gap:4px!important}.screen[data-screen="outfits"] .board-workspace-tab{border-radius:0!important}}',
      '.screen[data-screen="outfits"] .board-tools-shell{display:grid;gap:10px;padding:10px 8px 12px!important}',
      '.screen[data-screen="outfits"] .board-tools-group{display:grid;gap:7px}',
      '.screen[data-screen="outfits"] .board-tools-group-title{font-family:var(--serif);font-size:14px;font-weight:600;color:#5d5247;margin:0 2px}',
      '.screen[data-screen="outfits"] .board-tools-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}',
      '.screen[data-screen="outfits"] .board-tools-grid.board-tools-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
      '.screen[data-screen="outfits"] .board-tool-action{min-width:0;min-height:58px;display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(108,81,66,.17);border-radius:12px;background:#fffaf0;color:var(--ink);font:inherit;text-align:left;box-shadow:0 2px 5px rgba(63,52,40,.05);-webkit-tap-highlight-color:transparent}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-icon{flex:0 0 28px;width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:#e5dccb;color:#675b50;font-size:16px;font-weight:800}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy{min-width:0;display:grid;gap:1px}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{font-size:12px;line-height:1.1;font-weight:800}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy small{font-size:9px;line-height:1.2;color:#877b6e}',
      '.screen[data-screen="outfits"] .board-tool-action:active:not(:disabled){transform:scale(.98)}',
      '.screen[data-screen="outfits"] .board-tool-action:disabled{opacity:.42;filter:saturate(.5);box-shadow:none}',
      '.screen[data-screen="outfits"] .board-tool-action.danger{color:var(--burgundy);border-color:rgba(125,53,71,.2)}',
      '.screen[data-screen="outfits"] .board-tool-action.danger .board-tool-icon{background:#efe1df;color:var(--burgundy)}',
      '.screen[data-screen="outfits"] .board-tool-action.clear-board{background:#f5ebe6}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.selected{outline:2px solid rgba(77,142,138,.78)!important;outline-offset:3px;filter:drop-shadow(0 4px 8px rgba(77,142,138,.13))}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.selected .resize-handle,.screen[data-screen="outfits"] #outfitBoard .board-piece.selected .board-remove-handle{opacity:1!important}',
      '.screen[data-screen="outfits"] .board-tools-empty{padding:9px 10px;border:1px dashed rgba(108,81,66,.18);border-radius:11px;background:rgba(255,255,255,.42);font-size:10px;line-height:1.35;color:#817568}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-tool-action{min-height:56px;padding:7px 8px}.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{font-size:11px}.screen[data-screen="outfits"] .board-tool-action .board-tool-copy small{font-size:8px}}',
      '.screen[data-screen="outfits"] .board-tools-shell{gap:8px!important;padding:8px 5px 10px!important}',
      '.screen[data-screen="outfits"] .board-tools-main>#boardEditbar{display:none!important}',
      '.screen[data-screen="outfits"] .board-tools-empty{display:none!important}',
      '.screen[data-screen="outfits"] .board-tools-group-title{display:none!important}',
      '.screen[data-screen="outfits"] .board-tools-group{display:contents!important}',
      '.screen[data-screen="outfits"] .board-tools-main{display:grid;gap:8px}',
      '.screen[data-screen="outfits"] .board-tools-main .board-tools-grid{display:grid!important;gap:6px!important}',
      '.screen[data-screen="outfits"] .board-tools-row-primary{grid-template-columns:repeat(5,minmax(0,1fr))!important}',
      '.screen[data-screen="outfits"] .board-tools-row-secondary{grid-template-columns:repeat(4,minmax(0,1fr))!important}',
      '.screen[data-screen="outfits"] .board-tool-action{min-height:78px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:7px 4px!important;border:1px solid rgba(108,81,66,.2)!important;border-radius:15px!important;background:#fffaf0!important;color:#4f473f!important;font:inherit!important;text-align:center!important;box-shadow:none!important}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-icon{width:auto!important;height:auto!important;min-width:0!important;flex:0 0 auto!important;border-radius:0!important;background:transparent!important;color:#675f56!important;font-size:23px!important;font-weight:500!important;line-height:1!important}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy{display:block!important;min-width:0!important}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{display:block!important;font-family:var(--sans)!important;font-size:11px!important;line-height:1.05!important;font-weight:800!important;color:inherit!important;white-space:normal!important}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy small{display:none!important}',
      '.screen[data-screen="outfits"] .board-tool-action:disabled{opacity:.36!important;filter:none!important}',
      '.screen[data-screen="outfits"] .board-tool-action.danger{background:#fffaf0!important;color:var(--burgundy)!important;border-color:rgba(125,53,71,.2)!important}',
      '.screen[data-screen="outfits"] .board-tool-action.danger .board-tool-icon{color:var(--burgundy)!important}',
      '.screen[data-screen="outfits"] .board-tool-action.clear-board{background:#fffaf0!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-tool-action{min-height:72px!important;padding:6px 2px!important;border-radius:14px!important}.screen[data-screen="outfits"] .board-tool-action .board-tool-icon{font-size:21px!important}.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{font-size:9.5px!important}}',
      '[data-board-legacy-tools="true"],#boardLegacyToolHost{display:none!important;visibility:hidden!important;width:0!important;height:0!important;overflow:hidden!important;position:absolute!important;pointer-events:none!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece .board-lock-handle{position:absolute;left:5px;top:5px;z-index:8;width:29px;height:29px;display:grid;place-items:center;padding:0;border:1px solid rgba(108,81,66,.22);border-radius:10px;background:rgba(255,250,240,.92);color:#645b51;font-size:14px;line-height:1;box-shadow:0 2px 6px rgba(55,43,31,.12);-webkit-tap-highlight-color:transparent}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece .board-lock-handle:active{transform:scale(.94)}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked .board-lock-handle{background:#6d7863;color:#fff;border-color:#5c6854;box-shadow:0 2px 7px rgba(63,73,55,.18)}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked{cursor:default}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked .resize-handle,.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked .board-remove-handle{display:none!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked::after{content:"";position:absolute;inset:0;border:1px dashed rgba(102,113,90,.34);border-radius:inherit;pointer-events:none}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece .board-lock-handle{display:none!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.selected .board-lock-handle{display:grid!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked.selected .board-lock-handle{display:grid!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked{pointer-events:auto!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.board-piece-locked .board-object{pointer-events:none!important}',
      '.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{font-size:14px!important;line-height:1!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .board-tool-action .board-tool-copy strong{font-size:13px!important}}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece .board-lock-handle{display:none!important}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece .board-lock-indicator{display:none;position:absolute;left:6px;top:6px;z-index:8;width:27px;height:27px;place-items:center;border:1px solid rgba(102,113,90,.32);border-radius:9px;background:rgba(109,120,99,.94);color:#fff;font-size:13px;line-height:1;box-shadow:0 2px 6px rgba(55,43,31,.12);pointer-events:none}',
      '.screen[data-screen="outfits"] #outfitBoard .board-piece.selected.board-piece-locked .board-lock-indicator{display:grid}',
      '.screen[data-screen="outfits"] .board-tool-action.lock-toggle .board-tool-icon{font-size:20px!important}',
      '.screen[data-screen="outfits"] .board-tool-action.lock-toggle.locked{background:#eef0e8!important;border-color:rgba(102,113,90,.30)!important;color:#4f5a49!important}',
      '.screen[data-screen="portfolio"] .outfit-mini{height:auto!important;aspect-ratio:var(--portfolio-board-ratio,4/5);position:relative;overflow:hidden}',
      '.screen[data-screen="portfolio"] .outfit-mini .snapshot-piece{position:absolute;transform-origin:center center;display:flex;align-items:center;justify-content:center;pointer-events:none}',
      '.screen[data-screen="portfolio"] .outfit-mini .snapshot-piece img{position:static!important;width:100%!important;height:100%!important;object-fit:contain!important}',
      '.screen[data-screen="portfolio"] .outfit-mini .snapshot-piece .board-text{font-size:12px!important}',
      '.screen[data-screen="portfolio"] .outfit-mini .snapshot-piece .board-sticker{font-size:22px!important}',
      '.screen[data-screen="portfolio"] .outfit-mini .snapshot-piece .doodle-svg polyline{stroke-width:2!important}',
      '.screen[data-screen="outfits"] .board-workspace-tabs{grid-template-columns:repeat(4,minmax(0,1fr))!important}',
      '.screen[data-screen="outfits"] .board-canvas-shell{padding:9px 7px 12px;display:grid;gap:9px}',
      '.screen[data-screen="outfits"] .canvas-category-row{display:flex;gap:5px;overflow-x:auto;padding:0 0 2px;scrollbar-width:none}',
      '.screen[data-screen="outfits"] .canvas-category-row::-webkit-scrollbar{display:none}',
      '.screen[data-screen="outfits"] .canvas-category-chip{flex:0 0 auto;border:1px solid rgba(108,81,66,.16);border-radius:999px;background:#f8f0df;color:#62584d;padding:6px 10px;font-size:11px;font-weight:700}',
      '.screen[data-screen="outfits"] .canvas-category-chip.active{background:#6d7863;color:#fff;border-color:#6d7863}',
      '.screen[data-screen="outfits"] .canvas-custom-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:2px 1px}',
      '.screen[data-screen="outfits"] .canvas-custom-row span{font-family:var(--serif);font-size:13px;color:#665b50}',
      '.screen[data-screen="outfits"] .canvas-color-wrap{display:flex;align-items:center;gap:7px}',
      '.screen[data-screen="outfits"] .canvas-color-input{width:38px;height:30px;border:0;background:transparent;padding:0}',
      '.screen[data-screen="outfits"] .canvas-color-btn{border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#fffaf0;padding:6px 9px;font-size:10px;font-weight:800;color:#5f554a}',
      '.screen[data-screen="outfits"] .canvas-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}',
      '.screen[data-screen="outfits"] .canvas-choice{position:relative;min-width:0;border:1px solid rgba(108,81,66,.15);border-radius:12px;background:#fffaf0;padding:4px 4px 6px;display:grid;gap:4px;text-align:center;color:#5d544a}',
      '.screen[data-screen="outfits"] .canvas-choice.active{border-color:#6d7863;box-shadow:0 0 0 2px rgba(109,120,99,.17)}',
      '.screen[data-screen="outfits"] .canvas-choice.active::after{content:"✓";position:absolute;right:5px;top:5px;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#6d7863;color:#fff;font-size:10px;font-weight:900}',
      '.screen[data-screen="outfits"] .canvas-swatch{display:block;width:100%;aspect-ratio:1/1;border-radius:9px;border:1px solid rgba(108,81,66,.10);overflow:hidden}',
      '.screen[data-screen="outfits"] .canvas-choice strong{font-size:9.5px;line-height:1.1;font-weight:800;white-space:normal}',
      '.screen[data-screen="outfits"] #outfitBoard[data-canvas-dark="true"] .board-tip{color:rgba(255,255,255,.78)}',
      '.screen[data-screen="outfits"] #outfitBoard:before{display:none!important}',
      '.screen[data-screen="outfits"] #outfitBoard[data-canvas-background="default"]{box-shadow:inset 0 0 45px rgba(108,81,66,.08)!important}',
      '.screen[data-screen="outfits"] #outfitBoard:not([data-canvas-background="default"]){box-shadow:inset 0 0 24px rgba(108,81,66,.035)!important}',
      'body:not(.portfolio-modal-open) .bottom-nav{position:fixed!important;top:auto!important;bottom:0!important}',
      'body.nav-repairing .bottom-nav{visibility:hidden!important}',
      '@media(max-width:410px){.screen[data-screen="outfits"] .canvas-grid{gap:5px}.screen[data-screen="outfits"] .canvas-choice{padding:3px 3px 5px}.screen[data-screen="outfits"] .canvas-choice strong{font-size:8.8px}.screen[data-screen="outfits"] .board-workspace-tab{font-size:14px!important}}',
      '@media(max-width:380px){.closet-view-options{grid-template-columns:1fr}.closet-view-option{min-height:60px}}',
      '@media(max-width:410px){#itemDialog .closet-tier-section{padding:8px 9px;gap:7px}#itemDialog .closet-tier-btn{height:34px}#itemDialog .closet-tier-heading small{max-width:125px}}'
    ].join('');
    document.head.appendChild(style);
  }
  function closetTierSection(item){
    const selected=normalizeClosetTier(item&&item.tier);
    const section=document.createElement('section');
    section.className='closet-tier-section';
    section.setAttribute('aria-label','Piece tier');
    const heading=document.createElement('div');
    heading.className='closet-tier-heading';
    const titleWrap=document.createElement('div');
    const kicker=document.createElement('span');
    kicker.className='closet-tier-kicker';
    kicker.textContent='Your tier';
    const title=document.createElement('strong');
    title.textContent=selected?selected+'-Tier':'Not rated';
    titleWrap.append(kicker,title);
    const hint=document.createElement('small');
    hint.textContent=selected?tierReactionFor(item,selected):'How essential is this piece?';
    heading.append(titleWrap,hint);
    const options=document.createElement('div');
    options.className='closet-tier-options';
    options.setAttribute('role','group');
    options.setAttribute('aria-label','Rate this piece from S to D');
    CLOSET_TIERS.forEach(function(tier){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='closet-tier-btn'+(tier===selected?' active':'');
      btn.dataset.closetTier=tier;
      btn.setAttribute('aria-pressed',tier===selected?'true':'false');
      btn.setAttribute('aria-label',tier+'-Tier');
      btn.textContent=tier;
      btn.addEventListener('click',function(){setClosetTier($('#itemId').value,tier)});
      options.appendChild(btn);
    });
    section.append(heading,options);
    return section;
  }
  async function setClosetTier(itemId,tier){
    const item=state.items.find(function(x){return x.id===itemId});
    if(!item)return;
    const previous=normalizeClosetTier(item.tier);
    const requested=normalizeClosetTier(tier);
    const next=previous===requested?'':requested;
    item.tier=next;
    if(next)tierReactionFor(item,next,{force:true});
    renderItemReviewDetails(item);
    $$('.closet-tier-btn','#itemReviewDetails').forEach(function(btn){btn.disabled=true});
    const ok=await saveState();
    if(!ok){
      item.tier=previous;
      renderItemReviewDetails(item);
      return;
    }
    const live=state.items.find(function(x){return x.id===itemId});
    if(live&&itemDialogMode==='review'&&$('#itemId').value===itemId)renderItemReviewDetails(live);
    renderCatalog();
  }

  const originalFinishCatalogDrag=finishCatalogDrag;
  finishCatalogDrag=async function(){
    const freeFlowBefore=currentClosetView()==='free-flow';
    const beforeOrder=freeFlowBefore?state.items.map(function(i){return i.id}).join('|'):'';
    const result=await originalFinishCatalogDrag.apply(this,arguments);
    if(freeFlowBefore){
      const afterOrder=state.items.map(function(i){return i.id}).join('|');
      if(beforeOrder!==afterOrder){
        reshuffleFreeFlowScatter();
      }
    }
    return result;
  };

  installClosetTierStyles();

  const selectedTierFilters=new Set();
  function syncTierFilterChips(){
    $$('#tierFilterOptions .tier-filter-chip').forEach(function(btn){
      const active=selectedTierFilters.has(btn.dataset.tierFilter||'');
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }
  function installClosetTierFilter(){
    const panel=$('#filterPanel');
    if(!panel||$('#tierFilterWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='tierFilterWrap';
    wrap.innerHTML='<span class="tier-filter-label">Tier</span><div id="tierFilterOptions" role="group" aria-label="Filter closet by tier"></div>';
    const options=wrap.querySelector('#tierFilterOptions');
    CLOSET_TIERS.forEach(function(tier){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='tier-filter-chip';
      btn.dataset.tierFilter=tier;
      btn.setAttribute('aria-pressed','false');
      btn.textContent=tier;
      options.appendChild(btn);
    });
    const unrated=document.createElement('button');
    unrated.type='button';
    unrated.className='tier-filter-chip';
    unrated.dataset.tierFilter='unrated';
    unrated.setAttribute('aria-pressed','false');
    unrated.textContent='Not rated';
    options.appendChild(unrated);
    const archivedToggle=$('#includeArchivedCloset')?.closest('label');
    const clear=$('#clearFilters');
    if(archivedToggle)panel.insertBefore(wrap,archivedToggle);
    else if(clear)panel.insertBefore(wrap,clear);
    else panel.appendChild(wrap);
    options.querySelectorAll('.tier-filter-chip').forEach(function(btn){
      btn.addEventListener('click',function(){
        const value=btn.dataset.tierFilter||'';
        if(selectedTierFilters.has(value))selectedTierFilters.delete(value);
        else selectedTierFilters.add(value);
        syncTierFilterChips();
        renderCatalog();
      });
    });
    clear?.addEventListener('click',function(){
      selectedTierFilters.clear();
      syncTierFilterChips();
      requestAnimationFrame(renderCatalog);
    });
  }

  function installTierRibbonSetting(){
    const screen=document.querySelector('.screen[data-screen="more"]');
    if(!screen||$('#tierRibbonSettingsCard'))return;
    const card=document.createElement('div');
    card.id='tierRibbonSettingsCard';
    card.className='settings-card';
    card.innerHTML='<h3>Catalog / Closet</h3>'+ '<p>Choose how tier ratings appear in your Closet. Ratings and Tier filters stay available even when ribbons are hidden.</p>'+ '<div class="tier-setting-row"><div class="tier-setting-copy"><strong>Show Tier ribbons</strong><small>Display S / A / B / C / D ribbons on rated Closet cards.</small></div><label class="tier-setting-toggle"><input type="checkbox" id="showTierRibbonsSetting"> <span>On</span></label></div>';
    const firstCard=screen.querySelector('.settings-card');
    if(firstCard)screen.insertBefore(card,firstCard);else screen.appendChild(card);
    const input=card.querySelector('#showTierRibbonsSetting');
    input.checked=tierRibbonsEnabled();
    input.addEventListener('change',function(){setTierRibbonsEnabled(input.checked)});
  }

  function installClosetViewSetting(){
    const catalogBody=document.querySelector('.settings-group[data-settings-group="catalog"] .settings-group-body');
    if(!catalogBody||$('#closetViewSettingsCard'))return;
    const card=document.createElement('div');
    card.id='closetViewSettingsCard';
    card.className='settings-card';
    card.innerHTML='<h3>Closet view</h3>'+
      '<p>Choose how the Closet catalog is presented. This changes layout only; your items, filters, tiers and manual order stay the same.</p>'+
      '<div class="closet-view-options" role="group" aria-label="Closet view mode">'+
        '<button type="button" class="closet-view-option" data-closet-view="classic" aria-pressed="false"><strong>Classic</strong><small>Current card-based catalog</small></button>'+
        '<button type="button" class="closet-view-option" data-closet-view="modern" aria-pressed="false"><strong>Modern</strong><small>Full-bleed grid with touching cards</small></button>'+
        '<button type="button" class="closet-view-option" data-closet-view="free-flow" aria-pressed="false"><strong>Free-Flow</strong><small>Photo-only experimental closet</small></button>'+
      '</div>'+
      '<p class="closet-view-note">Free-Flow is experimental. App Style / themes remain a separate future setting from Closet View.</p>';
    catalogBody.prepend(card);
    card.querySelectorAll('.closet-view-option:not(:disabled)').forEach(function(btn){
      btn.addEventListener('click',function(){setClosetView(btn.dataset.closetView)});
    });
    applyClosetView();
  }

  function installSettingsGroups(){
    const screen=document.querySelector('.screen[data-screen="more"]');
    if(!screen||screen.querySelector('.settings-groups'))return;

    const pageHead=screen.querySelector('.page-head');
    const allCards=[...screen.querySelectorAll(':scope > .settings-card')];

    const appIdentity=screen.querySelector('.app-identity-card');
    const portfolio=screen.querySelector('.portfolio-settings-card');
    const journal=screen.querySelector('.journal-order-settings-card');
    const tier=screen.querySelector('#tierRibbonSettingsCard');

    const dataCard=allCards.find(card=>card.querySelector('h3')?.textContent.trim()==='Data');
    const smartScan=allCards.find(card=>card.querySelector('h3')?.textContent.trim()==='Smart photo scan');
    const resetCard=allCards.find(card=>card.classList.contains('danger-zone')||card.querySelector('h3')?.textContent.trim()==='Reset');

    const groups=document.createElement('div');
    groups.className='settings-groups';

    function makeGroup(id,label,subtitle,{open=false}={}){
      const details=document.createElement('details');
      details.className='settings-group';
      details.dataset.settingsGroup=id;
      if(open)details.open=true;
      const summary=document.createElement('summary');
      const copy=document.createElement('span');
      copy.innerHTML='<span>'+label+'</span>'+(subtitle?'<small>'+subtitle+'</small>':'');
      summary.appendChild(copy);
      const body=document.createElement('div');
      body.className='settings-group-body';
      details.append(summary,body);
      groups.appendChild(details);
      return body;
    }

    const general=makeGroup('general','General','App identity, data and reset',{open:true});
    const catalog=makeGroup('catalog','Catalog / Closet','Closet display and photo preferences');
    const board=makeGroup('board','Board','Outfit Board preferences');
    const portfolioGroup=makeGroup('portfolio','Portfolio','Saved-look organization');
    const journalGroup=makeGroup('journal','Journal','Wear-log layout and preferences');
    const wishlist=makeGroup('wishlist','Wishlist','Shopping and wishlist preferences');
    const about=makeGroup('about','About','Version, credits and future extras');

    [appIdentity,dataCard,resetCard].filter(Boolean).forEach(card=>general.appendChild(card));
    [tier,smartScan].filter(Boolean).forEach(card=>catalog.appendChild(card));
    if(portfolio)portfolioGroup.appendChild(portfolio);
    if(journal)journalGroup.appendChild(journal);

    board.innerHTML='<div class="settings-group-empty">Board preferences will live here as customization options are added.</div>';
    wishlist.innerHTML='<div class="settings-group-empty">Wishlist preferences will live here as shopping and capture options expand.</div>';
    about.innerHTML='<div class="settings-card settings-about-card"><h3>About Audrey’s Closet</h3><p class="settings-about-version">Version v13.21</p><p>A personal closet journal built around cataloging, outfits, memories and everyday wardrobe decisions.</p><p>Credits and a few hidden extras can grow here in future releases.</p></div>';

    if(pageHead?.nextSibling)screen.insertBefore(groups,pageHead.nextSibling);
    else screen.appendChild(groups);
  }

  const originalItemCard=itemCard;
  itemCard=function(i){
    const html=originalItemCard(i);
    const tier=normalizeClosetTier(i&&i.tier);
    if(!tier||!tierRibbonsEnabled())return html;
    const tierClass='tier-'+tier.toLowerCase();
    return html.replace('<div class="thumb">','<div class="thumb"><span class="tier-ribbon '+tierClass+'" aria-label="'+tier+'-Tier">'+tier+'-Tier</span>');
  };

  renderCatalog=function(){
    ensureSettings();
    applyClosetView();
    const q=$('#catalogSearch').value.toLowerCase().trim(),
      fc=$('#filterCategory').value,
      fs=$('#filterSeason').value,
      fcol=$('#filterColor').value,
      tierFilters=selectedTierFilters;
    const activeCategory=selectedCategory||fc||'';
    let items=state.items.filter(function(i){
      const tier=normalizeClosetTier(i.tier);
      const tierMatch=!tierFilters.size||tierFilters.has(tier)||(tierFilters.has('unrated')&&!tier);
      return (includeArchivedCloset||!isArchived(i))&&
        (!selectedCategory||i.category===selectedCategory)&&
        (!fc||i.category===fc)&&
        (!fs||i.season===fs)&&
        (!fcol||i.color===fcol)&&
        tierMatch&&
        (!q||[i.type,i.brand,i.color,i.pattern,i.notes,i.category].join(' ').toLowerCase().includes(q));
    });
    if(activeCategory){
      const order=state.settings.closetOrder[activeCategory]||[];
      items=[...items].sort(function(a,b){
        const ai=order.indexOf(a.id),bi=order.indexOf(b.id);
        return (ai<0?999999:ai)-(bi<0?999999:bi);
      });
    }
    catalogReviewIds=items.map(function(i){return i.id});
    const eligibleCount=state.items.filter(function(i){return includeArchivedCloset||!isArchived(i)}).length;
    $('#catalogCount').textContent=items.length+' '+(items.length===1?'piece':'pieces');
    $('#catalogGrid').innerHTML=items.map(function(i){return itemCard(i)}).join('');
    $('#catalogEmpty').classList.toggle('hidden',eligibleCount>0||q||selectedCategory||fc||fs||fcol||tierFilters.size);
    $$('.item-card').forEach(function(c){
      c.onclick=function(){
        if(Date.now()<suppressCatalogClickUntil)return;
        openItem(state.items.find(function(i){return i.id===c.dataset.id}));
      };
    });
    bindCatalogReorder(activeCategory);
    applyFreeFlowScatter();
  };


  const BOARD_FORMATS={
    'portrait-4x5':{label:'Portrait 4:5',ratio:'4 / 5'},
    'portrait-3x4':{label:'Portrait 3:4',ratio:'3 / 4'},
    'square':{label:'Square',ratio:'1 / 1'},
    'landscape-4x3':{label:'Landscape 4:3',ratio:'4 / 3'}
  };
  function currentBoardFormat(){
    ensureSettings();
    const value=state.settings.boardFormat||'portrait-4x5';
    return BOARD_FORMATS[value]?value:'portrait-4x5';
  }
  function applyBoardFormat(){
    const screen=document.querySelector('.screen[data-screen="outfits"]');
    if(!screen)return;
    const format=currentBoardFormat(),def=BOARD_FORMATS[format];
    screen.dataset.boardFormat=format;
    screen.style.setProperty('--board-format-ratio',def.ratio);
  }
  function setBoardWorkspacePanel(name){
    const root=$('#boardWorkspace');
    if(!root)return;
    const beforeY=window.scrollY||0;
    const rootTopBefore=root.getBoundingClientRect().top;
    root.querySelectorAll('.board-workspace-tab').forEach(function(btn){
      const active=btn.dataset.boardPanel===name;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    });
    root.querySelectorAll('.board-workspace-panel').forEach(function(panel){
      panel.classList.toggle('active',panel.dataset.boardPanel===name);
    });
    requestAnimationFrame(function(){
      const rootTopAfter=root.getBoundingClientRect().top;
      const delta=rootTopAfter-rootTopBefore;
      if(Math.abs(delta)>.5)window.scrollTo(0,beforeY+delta);
    });
  }
  function installBoardWorkspaceV3(){
    const screen=document.querySelector('.screen[data-screen="outfits"]');
    const shell=screen?.querySelector('.board-shell.board-first');
    const picker=screen?.querySelector('.board-picker-card.board-picker-bottom');
    const board=$('#outfitBoard'),name=$('#outfitName'),notes=$('#outfitNotes'),save=$('#saveOutfitBtn');
    const editbar=$('#boardEditbar'),decorateToggle=$('#decorateToggle'),creative=$('#creativeTools');
    if(!screen||!shell||!picker||!board||!name||!notes||!save||$('#boardWorkspace'))return;

    applyBoardFormat();

    const compose=document.createElement('div');
    compose.className='board-compose-bar';
    shell.parentNode.insertBefore(compose,shell);
    name.classList.add('board-compose-name');
    name.placeholder='Name this board';
    compose.appendChild(name);

    const notesBtn=document.createElement('button');
    notesBtn.type='button';
    notesBtn.id='boardNotesBtn';
    notesBtn.className='board-notes-btn';
    notesBtn.setAttribute('aria-label','Board notes');
    notesBtn.setAttribute('aria-expanded','false');
    notesBtn.textContent='▤';
    compose.appendChild(notesBtn);

    save.classList.add('board-compose-save');
    save.textContent=editingOutfitId?'Update':'Save';
    compose.appendChild(save);

    const notesDrawer=document.createElement('div');
    notesDrawer.id='boardNotesDrawer';
    notesDrawer.className='board-notes-drawer';
    notesDrawer.appendChild(notes);
    compose.insertAdjacentElement('afterend',notesDrawer);
    notesBtn.onclick=function(){
      const open=!notesDrawer.classList.contains('open');
      notesDrawer.classList.toggle('open',open);
      notesBtn.setAttribute('aria-expanded',open?'true':'false');
      if(open)notes.focus();
    };

    const workspace=document.createElement('section');
    workspace.id='boardWorkspace';
    workspace.className='board-workspace';
    workspace.innerHTML=
      '<div class="board-workspace-tabs" role="tablist" aria-label="Board workspace">'+
        '<button type="button" class="board-workspace-tab active" data-board-panel="pick" role="tab" aria-selected="true">Add Items</button>'+
        '<button type="button" class="board-workspace-tab" data-board-panel="tools" role="tab" aria-selected="false">Tools</button>'+
        '<button type="button" class="board-workspace-tab" data-board-panel="decorate" role="tab" aria-selected="false">Decorate</button>'+
        '<button type="button" class="board-workspace-tab" data-board-panel="canvas" role="tab" aria-selected="false">Canvas</button>'+
      '</div>'+
      '<div class="board-workspace-panel active" data-board-panel="pick"></div>'+
      '<div class="board-workspace-panel" data-board-panel="tools"><div class="board-tools-shell"><div class="board-tools-main"></div></div></div>'+
      '<div class="board-workspace-panel" data-board-panel="decorate"><div class="board-decorate-shell"></div></div>'+
      '<div class="board-workspace-panel" data-board-panel="canvas"><div class="board-canvas-shell"></div></div>';
    shell.insertAdjacentElement('afterend',workspace);

    const pickPanel=workspace.querySelector('[data-board-panel="pick"].board-workspace-panel');
    pickPanel.appendChild(picker);

    const pickerHead=picker.querySelector('.picker-head');
    const sourceTabs=picker.querySelector('.tabs-small');
    if(pickerHead&&sourceTabs)pickerHead.appendChild(sourceTabs);

    const toolsMain=workspace.querySelector('.board-tools-main');
    const clear=$('#clearBoardBtn');
    if(toolsMain&&editbar){
      let legacyHost=$('#boardLegacyToolHost');
      if(!legacyHost){
        legacyHost=document.createElement('div');
        legacyHost.id='boardLegacyToolHost';
        legacyHost.dataset.boardLegacyTools='true';
        legacyHost.hidden=true;
        document.body.appendChild(legacyHost);
      }
      editbar.dataset.boardLegacyTools='true';
      editbar.hidden=true;
      legacyHost.appendChild(editbar);
      if(clear)clear.hidden=true;

      const selectionHint=document.createElement('div');
      selectionHint.id='boardToolsSelectionHint';
      selectionHint.className='board-tools-empty';
      selectionHint.textContent='Select an item on the board to use editing tools.';
      toolsMain.appendChild(selectionHint);

      const rows=[
        {cls:'board-tools-grid board-tools-row-primary',items:[
          ['sendBackBtn','⇩','Back'],
          ['bringFrontBtn','⇧','Front'],
          ['rotateLeftBtn','↶','Left'],
          ['rotateRightBtn','↷','Right'],
          ['duplicateBoardBtn','⧉','Copy']
        ]},
        {cls:'board-tools-grid board-tools-row-secondary',items:[
          ['deleteBoardBtn','×','Delete'],
          ['undoBoardBtn','↶','Undo'],
          ['boardLockToggleBtn','🔒','Lock'],
          ['clearBoardBtn','⌫','Clear']
        ]}
      ];
      rows.forEach(function(row){
        const wrap=document.createElement('section');
        wrap.className='board-tools-group';
        const grid=document.createElement('div');
        grid.className=row.cls;
        row.items.forEach(function(item){
          const original=item[0]==='boardLockToggleBtn'?null:$('#'+item[0]);
          if(item[0]!=='boardLockToggleBtn'&&!original)return;
          const btn=document.createElement('button');
          btn.type='button';
          btn.className='board-tool-action'+(item[0]==='deleteBoardBtn'?' danger':'')+(item[0]==='clearBoardBtn'?' danger clear-board':'')+(item[0]==='boardLockToggleBtn'?' lock-toggle':'');
          btn.dataset.proxyFor=item[0];
          btn.innerHTML='<span class="board-tool-icon" aria-hidden="true">'+item[1]+'</span><span class="board-tool-copy"><strong>'+item[2]+'</strong></span>';
          btn.onclick=function(e){
            e.preventDefault();
            if(item[0]==='boardLockToggleBtn'){
              toggleSelectedBoardLockV3195();
              return;
            }
            original.click();
          };
          grid.appendChild(btn);
        });
        wrap.appendChild(grid);
        toolsMain.appendChild(wrap);
      });
    }

    const head=screen.querySelector('.board-page-head');
    const newBtn=$('#newBoardBtn');
    const share=$('#shareOutfitBtn');
    if(head&&newBtn){
      let headActions=head.querySelector('.board-head-actions');
      if(!headActions){
        headActions=document.createElement('div');
        headActions.className='board-head-actions';
        head.appendChild(headActions);
      }
      headActions.appendChild(newBtn);
      if(share)headActions.insertBefore(share,newBtn);
    }

    const decorateShell=workspace.querySelector('.board-decorate-shell');
    if(decorateToggle)decorateShell.appendChild(decorateToggle);
    if(creative){
      creative.classList.remove('hidden');
      decorateShell.appendChild(creative);
    }

    workspace.querySelectorAll('.board-workspace-tab').forEach(function(btn){
      btn.onclick=function(){setBoardWorkspacePanel(btn.dataset.boardPanel)};
    });
    setBoardWorkspacePanel('pick');
  }


  const BOARD_CANVAS_BACKGROUNDS_V1320=[
    {id:'default',name:'Default',category:'All',color:'#efe9d9',image:'linear-gradient(135deg,transparent 70%,rgba(125,53,71,.08) 70% 73%,transparent 73%),linear-gradient(45deg,transparent 85%,rgba(77,142,138,.10) 85%),linear-gradient(rgba(108,81,66,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(108,81,66,.055) 1px,transparent 1px)',size:'100% 100%,100% 100%,24px 24px,24px 24px',dark:false},
    {id:'none',name:'Original',category:'All',color:'#fffdf8',image:'none',size:'auto',dark:false},
    {id:'blush',name:'Blush',category:'Color',color:'#f2dfdf',image:'none',size:'auto',dark:false},
    {id:'sage',name:'Sage',category:'Color',color:'#dbe2d2',image:'none',size:'auto',dark:false},
    {id:'powder-blue',name:'Powder Blue',category:'Color',color:'#dce8ef',image:'none',size:'auto',dark:false},
    {id:'charcoal',name:'Charcoal',category:'Color',color:'#454646',image:'none',size:'auto',dark:true},

    {id:'sketchbook',name:'Sketchbook',category:'Paper',color:'#f7f1e5',image:'repeating-linear-gradient(0deg,rgba(93,82,67,.07) 0,rgba(93,82,67,.07) 1px,transparent 1px,transparent 5px)',size:'auto',dark:false},
    {id:'kraft',name:'Kraft',category:'Paper',color:'#c6a47a',image:'radial-gradient(circle at 18% 22%,rgba(83,60,38,.12) 0 1px,transparent 1.5px),radial-gradient(circle at 72% 66%,rgba(255,255,255,.12) 0 1px,transparent 1.4px)',size:'18px 18px,23px 23px',dark:false},
    {id:'graph',name:'Graph Paper',category:'Paper',color:'#f8f4e9',image:'linear-gradient(rgba(82,119,132,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(82,119,132,.13) 1px,transparent 1px)',size:'18px 18px',dark:false},

    {id:'linen',name:'Linen',category:'Fabric',color:'#e9dfcd',image:'repeating-linear-gradient(0deg,rgba(103,87,67,.07) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 1px,transparent 1px 5px)',size:'auto',dark:false},
    {id:'denim',name:'Denim',category:'Fabric',color:'#667b91',image:'repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4px),repeating-linear-gradient(-45deg,rgba(22,39,58,.09) 0 1px,transparent 1px 5px)',size:'auto',dark:true},
    {id:'leather',name:'Leather',category:'Fabric',color:'#765444',image:'radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.06),transparent 35%),radial-gradient(ellipse at 80% 70%,rgba(34,19,13,.12),transparent 42%)',size:'100% 100%',dark:true},

    {id:'gingham',name:'Gingham',category:'Pattern',color:'#f6eee0',image:'linear-gradient(90deg,rgba(125,70,83,.14) 50%,transparent 50%),linear-gradient(rgba(125,70,83,.14) 50%,transparent 50%)',size:'22px 22px',dark:false},
    {id:'plaid',name:'Plaid',category:'Pattern',color:'#d8c8a7',image:'repeating-linear-gradient(0deg,transparent 0 13px,rgba(91,70,53,.15) 13px 17px,transparent 17px 27px,rgba(125,53,71,.11) 27px 31px),repeating-linear-gradient(90deg,transparent 0 15px,rgba(91,70,53,.15) 15px 19px,transparent 19px 30px,rgba(125,53,71,.11) 30px 34px)',size:'auto',dark:false},
    {id:'checker',name:'Checker',category:'Pattern',color:'#efe7d8',image:'conic-gradient(from 90deg,rgba(74,67,60,.20) 25%,transparent 0 50%,rgba(74,67,60,.20) 0 75%,transparent 0)',size:'28px 28px',dark:false},

    {id:'tic-tac-toe',name:'Tic-Tac-Toe',category:'Fun',color:'#f4eddc',image:'linear-gradient(90deg,transparent 32%,rgba(109,120,99,.15) 32% 34%,transparent 34% 65%,rgba(109,120,99,.15) 65% 67%,transparent 67%),linear-gradient(0deg,transparent 32%,rgba(109,120,99,.15) 32% 34%,transparent 34% 65%,rgba(109,120,99,.15) 65% 67%,transparent 67%)',size:'76px 76px',dark:false},
    {id:'postcard',name:'Postcard',category:'Fun',color:'#f6efdf',image:'repeating-linear-gradient(135deg,rgba(125,53,71,.12) 0 5px,transparent 5px 10px,rgba(83,111,146,.12) 10px 15px,transparent 15px 20px)',size:'100% 12px',position:'0 0',dark:false}
  ];
  let boardCanvasBackgroundV1320={id:'default',color:''};
  let boardCanvasCategoryV1320='All';

  function normalizedBoardCanvasV1320(value){
    if(typeof value==='string')return {id:value||'default',color:''};
    if(value&&typeof value==='object')return {id:value.id||'default',color:value.color||''};
    return {id:'default',color:''};
  }
  function boardCanvasDefV1320(value=boardCanvasBackgroundV1320){
    const v=normalizedBoardCanvasV1320(value);
    if(v.id==='custom')return {id:'custom',name:'Custom',category:'Color',color:v.color||'#e9dfcd',image:'none',size:'auto',dark:false};
    return BOARD_CANVAS_BACKGROUNDS_V1320.find(function(x){return x.id===v.id})||BOARD_CANVAS_BACKGROUNDS_V1320[0];
  }
  function applyBoardCanvasV1320(value=boardCanvasBackgroundV1320){
    boardCanvasBackgroundV1320=normalizedBoardCanvasV1320(value);
    const board=$('#outfitBoard');if(!board)return;
    const def=boardCanvasDefV1320();
    board.style.backgroundColor=def.color||'#fbf6ec';
    board.style.backgroundImage=def.image||'none';
    board.style.backgroundSize=def.size||'auto';
    board.style.backgroundPosition=def.position||'0 0';
    board.style.backgroundRepeat=def.id==='postcard'?'repeat-x':'repeat';
    board.dataset.canvasBackground=def.id;
    board.dataset.canvasDark=def.dark?'true':'false';
    renderBoardCanvasChoicesV1320();
  }
  function setBoardCanvasV1320(id,color=''){
    boardCanvasBackgroundV1320={id:id||'default',color:color||''};
    applyBoardCanvasV1320();
  }
  function canvasPreviewStyleV1320(def){
    return 'background-color:'+def.color+';background-image:'+def.image+';background-size:'+(def.size||'auto')+';background-position:'+(def.position||'0 0')+';';
  }
  function renderBoardCanvasChoicesV1320(){
    const grid=$('#boardCanvasGrid');if(!grid)return;
    const visible=BOARD_CANVAS_BACKGROUNDS_V1320.filter(function(def){
      return boardCanvasCategoryV1320==='All'||def.category===boardCanvasCategoryV1320||def.id==='none';
    });
    const current=normalizedBoardCanvasV1320(boardCanvasBackgroundV1320);
    grid.innerHTML=visible.map(function(def){
      const active=current.id===def.id;
      return '<button type="button" class="canvas-choice '+(active?'active':'')+'" data-canvas-id="'+def.id+'">'+
        '<span class="canvas-swatch" style="'+canvasPreviewStyleV1320(def)+'"></span>'+
        '<strong>'+def.name+'</strong></button>';
    }).join('');
    grid.querySelectorAll('.canvas-choice').forEach(function(btn){
      btn.onclick=function(){setBoardCanvasV1320(btn.dataset.canvasId);};
    });
    const picker=$('#boardCanvasCustomColor');
    if(picker&&current.id==='custom'&&current.color)picker.value=current.color;
  }
  function installBoardCanvasV1320(){
    const workspace=$('#boardWorkspace');
    const shell=workspace?.querySelector('.board-canvas-shell');
    if(!workspace||!shell||shell.dataset.installed==='true')return;
    shell.dataset.installed='true';
    shell.innerHTML=
      '<div class="canvas-category-row" id="boardCanvasCategories"></div>'+
      '<div class="canvas-custom-row"><span>Custom color</span><div class="canvas-color-wrap"><input id="boardCanvasCustomColor" class="canvas-color-input" type="color" value="#e9dfcd" aria-label="Choose canvas color"><button type="button" class="canvas-color-btn" id="boardCanvasUseColor">Use color</button></div></div>'+
      '<div class="canvas-grid" id="boardCanvasGrid"></div>';
    const cats=['All','Color','Paper','Fabric','Pattern','Fun'];
    const row=$('#boardCanvasCategories');
    row.innerHTML=cats.map(function(cat){return '<button type="button" class="canvas-category-chip '+(cat==='All'?'active':'')+'" data-canvas-category="'+cat+'">'+cat+'</button>';}).join('');
    row.querySelectorAll('.canvas-category-chip').forEach(function(btn){
      btn.onclick=function(){
        boardCanvasCategoryV1320=btn.dataset.canvasCategory;
        row.querySelectorAll('.canvas-category-chip').forEach(function(x){x.classList.toggle('active',x===btn)});
        renderBoardCanvasChoicesV1320();
      };
    });
    $('#boardCanvasUseColor').onclick=function(){
      setBoardCanvasV1320('custom',$('#boardCanvasCustomColor').value||'#e9dfcd');
    };
    $('#boardCanvasCustomColor').oninput=function(){
      setBoardCanvasV1320('custom',this.value||'#e9dfcd');
    };
    renderBoardCanvasChoicesV1320();
    applyBoardCanvasV1320();
  }


  function boardCanvasElementStyleV13202(el,value){
    if(!el)return;
    const safeValue=(value===undefined||value===null)?{id:'default',color:''}:value;
    const def=boardCanvasDefV1320(safeValue);
    el.style.backgroundColor=def.color||'#fbf6ec';
    el.style.backgroundImage=def.image||'none';
    el.style.backgroundSize=def.size||'auto';
    el.style.backgroundPosition=def.position||'0 0';
    el.style.backgroundRepeat=def.id==='postcard'?'repeat-x':'repeat';
    el.dataset.canvasBackground=def.id;
    el.dataset.canvasDark=def.dark?'true':'false';
  }

  function paintBoardCanvasToContextV13202(ctx,x,y,w,h,value){
    const safeValue=(value===undefined||value===null)?{id:'default',color:''}:value;
    const def=boardCanvasDefV1320(safeValue);
    const id=def.id;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.clip();

    ctx.fillStyle=def.color||'#fbf6ec';
    ctx.fillRect(x,y,w,h);

    if(id==='default'){
      ctx.strokeStyle='rgba(108,81,66,.075)';
      ctx.lineWidth=1;
      const grid=Math.max(18,w/38);
      for(let xx=x;xx<=x+w;xx+=grid){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke()}
      for(let yy=y;yy<=y+h;yy+=grid){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke()}

      ctx.save();
      ctx.globalAlpha=.55;
      ctx.strokeStyle='rgba(125,53,71,.22)';
      ctx.lineWidth=Math.max(2,w/260);
      ctx.beginPath();
      ctx.moveTo(x+w*.70,y+h*.12);
      ctx.lineTo(x+w*.93,y+h*.35);
      ctx.stroke();

      ctx.strokeStyle='rgba(77,142,138,.22)';
      ctx.beginPath();
      ctx.moveTo(x+w*.78,y+h*.76);
      ctx.lineTo(x+w*.96,y+h*.94);
      ctx.stroke();
      ctx.restore();
    }else if(id==='sketchbook'){
      ctx.strokeStyle='rgba(93,82,67,.10)';
      ctx.lineWidth=1;
      const step=Math.max(8,w/90);
      for(let yy=y;yy<=y+h;yy+=step){
        ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();
      }
    }else if(id==='kraft'){
      ctx.fillStyle='rgba(83,60,38,.11)';
      const step=Math.max(14,w/52);
      for(let yy=y+step*.5,row=0;yy<y+h;yy+=step,row++){
        for(let xx=x+step*.5;xx<x+w;xx+=step){
          const jitter=((row+Math.round(xx/step))%3)*.8;
          ctx.beginPath();ctx.arc(xx+jitter,yy,1.05,0,Math.PI*2);ctx.fill();
        }
      }
    }else if(id==='graph'){
      ctx.strokeStyle='rgba(82,119,132,.16)';
      ctx.lineWidth=1;
      const step=Math.max(16,w/52);
      for(let xx=x;xx<=x+w;xx+=step){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke()}
      for(let yy=y;yy<=y+h;yy+=step){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke()}
    }else if(id==='linen'){
      ctx.lineWidth=1;
      const step=Math.max(5,w/150);
      ctx.strokeStyle='rgba(103,87,67,.08)';
      for(let yy=y;yy<=y+h;yy+=step){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke()}
      ctx.strokeStyle='rgba(255,255,255,.20)';
      for(let xx=x;xx<=x+w;xx+=step*1.2){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke()}
    }else if(id==='denim'){
      ctx.lineWidth=1;
      const step=Math.max(6,w/135);
      ctx.strokeStyle='rgba(255,255,255,.08)';
      for(let n=-h;n<w+h;n+=step){ctx.beginPath();ctx.moveTo(x+n,y);ctx.lineTo(x+n+h,y+h);ctx.stroke()}
      ctx.strokeStyle='rgba(22,39,58,.11)';
      for(let n=0;n<w+h;n+=step*1.25){ctx.beginPath();ctx.moveTo(x+n,y);ctx.lineTo(x+n-h,y+h);ctx.stroke()}
    }else if(id==='leather'){
      const g=ctx.createRadialGradient(x+w*.25,y+h*.2,0,x+w*.25,y+h*.2,Math.max(w,h)*.65);
      g.addColorStop(0,'rgba(255,255,255,.08)');
      g.addColorStop(1,'rgba(30,17,12,.10)');
      ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
    }else if(id==='gingham'){
      const s=Math.max(26,w/34);
      ctx.fillStyle='rgba(125,70,83,.13)';
      for(let xx=x;xx<x+w;xx+=s*2)ctx.fillRect(xx,y,s,w*0+h);
      for(let yy=y;yy<y+h;yy+=s*2)ctx.fillRect(x,yy,w,s);
    }else if(id==='plaid'){
      const s=Math.max(34,w/27);
      ctx.fillStyle='rgba(91,70,53,.14)';
      for(let xx=x+s*.7;xx<x+w;xx+=s)ctx.fillRect(xx,y,s*.14,h);
      for(let yy=y+s*.6;yy<y+h;yy+=s)ctx.fillRect(x,yy,w,s*.14);
      ctx.fillStyle='rgba(125,53,71,.11)';
      for(let xx=x+s*.2;xx<x+w;xx+=s*2)ctx.fillRect(xx,y,s*.10,h);
      for(let yy=y+s*.15;yy<y+h;yy+=s*2)ctx.fillRect(x,yy,w,s*.10);
    }else if(id==='checker'){
      const s=Math.max(22,w/34);
      ctx.fillStyle='rgba(74,67,60,.19)';
      let row=0;
      for(let yy=y;yy<y+h;yy+=s,row++){
        for(let xx=x+(row%2?s:0);xx<x+w;xx+=s*2)ctx.fillRect(xx,yy,s,s);
      }
    }else if(id==='tic-tac-toe'){
      const s=Math.max(76,w/12);
      ctx.strokeStyle='rgba(109,120,99,.17)';
      ctx.lineWidth=Math.max(1.5,w/500);
      for(let ox=x;ox<x+w;ox+=s){
        for(let oy=y;oy<y+h;oy+=s){
          ctx.beginPath();ctx.moveTo(ox+s/3,oy);ctx.lineTo(ox+s/3,oy+s);ctx.stroke();
          ctx.beginPath();ctx.moveTo(ox+2*s/3,oy);ctx.lineTo(ox+2*s/3,oy+s);ctx.stroke();
          ctx.beginPath();ctx.moveTo(ox,oy+s/3);ctx.lineTo(ox+s,oy+s/3);ctx.stroke();
          ctx.beginPath();ctx.moveTo(ox,oy+2*s/3);ctx.lineTo(ox+s,oy+2*s/3);ctx.stroke();
        }
      }
    }else if(id==='postcard'){
      const stripe=Math.max(8,w/100);
      const band=Math.max(18,h*.035);
      for(let xx=x-band;xx<x+w+band;xx+=stripe*2){
        ctx.save();
        ctx.translate(xx,y+band/2);
        ctx.rotate(-Math.PI/4);
        ctx.fillStyle='rgba(125,53,71,.13)';
        ctx.fillRect(0,-band,stripe,band*2);
        ctx.restore();
      }
      for(let xx=x-band+stripe;xx<x+w+band;xx+=stripe*2){
        ctx.save();
        ctx.translate(xx,y+band/2);
        ctx.rotate(-Math.PI/4);
        ctx.fillStyle='rgba(83,111,146,.13)';
        ctx.fillRect(0,-band,stripe,band*2);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  window.__audreyRepairBottomNavV13205=repairBottomNavigationV13205;
  window.__audreyPaintBoardCanvasV1320=paintBoardCanvasToContextV13202;
  window.__audreyGetCurrentCanvasV1320=function(){return {...boardCanvasBackgroundV1320};};

  function refreshPortfolioCanvasBackgroundsV13202(){
    document.querySelectorAll('#savedOutfits .portfolio-card[data-id]').forEach(function(card){
      const outfit=state.outfits.find(function(o){return String(o.id)===String(card.dataset.id)});
      const mini=card.querySelector('.outfit-mini');
      if(!outfit||!mini)return;

      const sourceW=Number(outfit.boardWidth)||390;
      const sourceH=Number(outfit.boardHeight)||420;
      mini.style.setProperty('--portfolio-board-ratio',sourceW+' / '+sourceH);
      mini.style.aspectRatio=sourceW+' / '+sourceH;
      boardCanvasElementStyleV13202(mini,outfit.canvasBackground);

      // Rebuild the small card as a true scaled copy of the saved Board.
      mini.innerHTML='';
      requestAnimationFrame(function(){
        const live=card.querySelector('.outfit-mini');
        if(!live)return;
        const bw=live.clientWidth||sourceW;
        const bh=live.clientHeight||sourceH;
        const scale=Math.min(bw/sourceW,bh/sourceH);
        const offsetX=(bw-sourceW*scale)/2;
        const offsetY=(bh-sourceH*scale)/2;
        (outfit.pieces||[])
          .slice()
          .sort(function(a,b){return (a.z||0)-(b.z||0)})
          .forEach(function(piece){
            renderSnapshotPiece(live,piece,scale,scale,offsetX,offsetY);
          });
      });
    });
  }


  // v13.20-dev5 — recover iOS/PWA viewport state after Share / modal transitions.
  function portfolioDialogActuallyOpenV13205(){
    return !!(
      $('#outfitViewDialog')?.open ||
      $('#portfolioItemPreviewDialog')?.open
    );
  }

  function repairBottomNavigationV13205(){
    // A stale portfolio scroll-lock can leave fixed descendants positioned relative
    // to the frozen body after returning from the native iOS share sheet.
    if(document.body.classList.contains('portfolio-modal-open')&&!portfolioDialogActuallyOpenV13205()){
      const y=Number(portfolioModalScrollY)||0;
      document.body.classList.remove('portfolio-modal-open');
      document.body.style.top='';
      document.body.style.left='';
      document.body.style.right='';
      document.body.style.width='';
      requestAnimationFrame(function(){window.scrollTo(0,y)});
    }

    const nav=document.querySelector('.bottom-nav');
    if(!nav)return;

    // Force Safari to rebuild the fixed layer without changing the responsive
    // positioning rules already defined in styles.css.
    document.body.classList.add('nav-repairing');
    void nav.offsetHeight;
    requestAnimationFrame(function(){
      document.body.classList.remove('nav-repairing');
      void nav.offsetHeight;
    });
  }

  window.addEventListener('pageshow',function(){setTimeout(repairBottomNavigationV13205,0)});
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){
      setTimeout(repairBottomNavigationV13205,40);
      setTimeout(repairBottomNavigationV13205,260);
    }
  });
  window.visualViewport?.addEventListener('resize',function(){
    if(document.visibilityState==='visible')setTimeout(repairBottomNavigationV13205,40);
  });

  // -------- Full Board Undo history --------
  let boardGestureUndoStartV13205=null;

  function cloneBoardStateV13205(){
    return boardItems.map(function(item){return {...item}});
  }

  function boardStateKeyV13205(items){
    return JSON.stringify((items||[]).map(function(x){
      return {
        uid:x.uid,kind:x.kind,source:x.source,id:x.id,value:x.value,shape:x.shape,
        points:x.points,x:x.x,y:x.y,w:x.w,h:x.h,rotation:x.rotation,z:x.z,locked:!!x.locked
      };
    }));
  }

  function pushBoardStateUndoV13205(items,selectedUid,label='Board change'){
    if(!items)return;
    boardUndoStack.push({
      type:'state',
      items:items.map(function(x){return {...x}}),
      selectedUid:selectedUid||null,
      label
    });
    if(boardUndoStack.length>20)boardUndoStack.shift();
    updateUndoButton();
    syncBoardToolProxyStates?.();
  }

  function undoBoardActionV13205(){
    const last=boardUndoStack.pop();
    if(!last)return toast('Nothing to undo');

    if(last.type==='state'){
      const currentSelected=selectedBoardUid;
      boardItems=(last.items||[]).map(function(x){return {...x}});
      const selectedExists=boardItems.some(function(x){return String(x.uid)===String(currentSelected)});
      const priorExists=boardItems.some(function(x){return String(x.uid)===String(last.selectedUid)});
      selectedBoardUid=selectedExists?currentSelected:(priorExists?last.selectedUid:null);
      drawBoard();
      updateUndoButton();
      toast('Undid '+String(last.label||'last change').toLowerCase());
      return;
    }

    // Preserve compatibility with the original delete-only history entries.
    if(last.item){
      const idx=Math.max(0,Math.min(boardItems.length,Number(last.index)||0));
      boardItems.splice(idx,0,{...last.item});
      selectedBoardUid=last.item.uid;
      drawBoard();
      updateUndoButton();
      toast('Item restored');
      return;
    }

    updateUndoButton();
    toast('Nothing to undo');
  }

  function installBoardGestureUndoV13205(){
    const board=$('#outfitBoard');
    if(!board||board.dataset.fullUndoV13205==='true')return;
    board.dataset.fullUndoV13205='true';

    board.addEventListener('pointerdown',function(e){
      const piece=e.target.closest&&e.target.closest('.board-piece[data-uid]');
      if(!piece||e.target.closest('.board-remove-handle'))return;
      const model=boardItems.find(function(x){return String(x.uid)===String(piece.dataset.uid)});
      if(!model||model.locked)return;
      if(boardGestureUndoStartV13205)return;
      boardGestureUndoStartV13205={
        pointerId:e.pointerId,
        items:cloneBoardStateV13205(),
        selectedUid:selectedBoardUid,
        key:boardStateKeyV13205(boardItems)
      };
    },true);

    function finishGesture(){
      const start=boardGestureUndoStartV13205;
      if(!start)return;
      boardGestureUndoStartV13205=null;
      const after=boardStateKeyV13205(boardItems);
      if(after!==start.key){
        pushBoardStateUndoV13205(start.items,start.selectedUid,'move / resize');
      }
    }

    board.addEventListener('pointerup',function(){setTimeout(finishGesture,0)},true);
    board.addEventListener('pointercancel',function(){setTimeout(finishGesture,0)},true);
  }

  function installBoardToolUndoV13205(){
    const tracked={
      sendBackBtn:'layer change',
      bringFrontBtn:'layer change',
      rotateLeftBtn:'rotation',
      rotateRightBtn:'rotation',
      duplicateBoardBtn:'copy'
    };

    Object.keys(tracked).forEach(function(id){
      const btn=$('#'+id);
      if(!btn||btn.dataset.fullUndoV13205==='true')return;
      btn.dataset.fullUndoV13205='true';
      btn.addEventListener('click',function(){
        if(btn.disabled||!selectedBoardUid)return;
        const before=cloneBoardStateV13205();
        const selectedBefore=selectedBoardUid;
        const key=boardStateKeyV13205(before);
        setTimeout(function(){
          if(boardStateKeyV13205(boardItems)!==key){
            pushBoardStateUndoV13205(before,selectedBefore,tracked[id]);
          }
        },0);
      },true);
    });

    const undo=$('#undoBoardBtn');
    if(undo){
      // Convenience binding only; v13.20-dev6 capture authority remains definitive
      // even if base bindBoard later replaces this onclick.
      undo.onclick=function(e){
        e?.preventDefault?.();
        undoBoardActionV13205();
      };
    }
  }


  // v13.20-dev6 — one authoritative Board history/delete path.
  // The base app binds undoBoardDelete() during normal initialization after this
  // patch first runs, so capture-phase interception is required to prevent the
  // legacy delete-only Undo handler from taking control again.
  function installBoardHistoryAuthorityV13206(){
    if(document.documentElement.dataset.boardHistoryAuthorityV13206==='true')return;
    document.documentElement.dataset.boardHistoryAuthorityV13206='true';

    // Undo: intercept BOTH the visible proxy and the hidden legacy button.
    document.addEventListener('click',function(e){
      const proxy=e.target.closest&&e.target.closest('.board-tool-action[data-proxy-for="undoBoardBtn"]');
      const original=e.target.closest&&e.target.closest('#undoBoardBtn');
      if(!proxy&&!original)return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      undoBoardActionV13205();
    },true);

    // Per-item X: remove exactly one Board object and store a full-state Undo entry.
    // Intercept pointerdown because the original Board implementation also removes
    // on pointerdown.
    document.addEventListener('pointerdown',function(e){
      const remove=e.target.closest&&e.target.closest('#outfitBoard .board-remove-handle');
      if(!remove)return;

      const piece=remove.closest('.board-piece[data-uid]');
      if(!piece)return;
      const uid=piece.dataset.uid;
      const idx=boardItems.findIndex(function(x){return String(x.uid)===String(uid)});
      if(idx<0)return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const before=cloneBoardStateV13205();
      const selectedBefore=selectedBoardUid;
      const removed=boardItems[idx];

      boardItems.splice(idx,1);
      if(String(selectedBoardUid)===String(uid))selectedBoardUid=null;

      pushBoardStateUndoV13205(before,selectedBefore,'delete');
      drawBoard();
      updateUndoButton();
      syncBoardToolProxyStates?.();
      toast('Item removed');
    },true);

    // Prevent the click synthesized after the pointerdown delete from landing on
    // newly exposed Board controls underneath the removed DOM node.
    document.addEventListener('click',function(e){
      const remove=e.target.closest&&e.target.closest('#outfitBoard .board-remove-handle');
      if(!remove)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    },true);
  }

  installBoardHistoryAuthorityV13206();
  // Re-run after the app's deferred initialization/bindBoard pass. The capture
  // listener itself is persistent; this also refreshes button state.
  setTimeout(function(){
    installBoardHistoryAuthorityV13206();
    updateUndoButton();
    syncBoardToolProxyStates?.();
  },250);

  function refitSavedBoardToCurrent(outfit){
    if(!outfit)return;
    setTimeout(function(){
      const board=$('#outfitBoard');
      if(!board||!boardItems.length)return;
      const oldW=Number(outfit.boardWidth)||board.clientWidth;
      const oldH=Number(outfit.boardHeight)||board.clientHeight;
      const newW=board.clientWidth,newH=board.clientHeight;
      if(!oldW||!oldH||!newW||!newH)return;
      const sx=newW/oldW,sy=newH/oldH;
      if(Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
      boardItems=boardItems.map(function(piece){
        const p=normalizeBoardItem({...piece});
        return {...p,x:p.x*sx,y:p.y*sy,w:p.w*sx,h:p.h*sy};
      });
      drawBoard();
    },120);
  }


  function syncBoardToolProxyStates(){
    const selected=!!selectedBoardUid;
    const selectedModel=selected?boardItems.find(function(x){return String(x.uid)===String(selectedBoardUid)}):null;
    const locked=!!selectedModel?.locked;
    const hint=$('#boardToolsSelectionHint');
    if(hint)hint.style.display=selected?'none':'block';
    $$('.board-tool-action[data-proxy-for]').forEach(function(proxy){
      const id=proxy.dataset.proxyFor;
      if(id==='boardLockToggleBtn'){
        proxy.disabled=!selectedModel;
        return;
      }
      const original=$('#'+id);
      if(!original)return;
      proxy.disabled=!!original.disabled;
      if(id==='clearBoardBtn')proxy.disabled=!boardItems.length;
      if(id==='undoBoardBtn')proxy.disabled=!boardUndoStack.length;
      if(locked&&['sendBackBtn','bringFrontBtn','rotateLeftBtn','rotateRightBtn','duplicateBoardBtn','deleteBoardBtn'].includes(id)){
        proxy.disabled=true;
      }
    });
    syncBoardLockToolV3195();
  }

  const originalUpdateBoardEditControlsV319=updateBoardEditControls;
  updateBoardEditControls=function(hasSelection){
    const result=originalUpdateBoardEditControlsV319.apply(this,arguments);
    syncBoardToolProxyStates();
    return result;
  };

  const originalUpdateUndoButtonV319=updateUndoButton;
  updateUndoButton=function(){
    const result=originalUpdateUndoButtonV319.apply(this,arguments);
    syncBoardToolProxyStates();
    return result;
  };

  const originalDrawBoardV319=drawBoard;
  drawBoard=function(){
    const previous=selectedBoardUid;
    const result=originalDrawBoardV319.apply(this,arguments);
    syncBoardToolProxyStates();
    if(previous){
      const el=document.querySelector('#outfitBoard .board-piece[data-uid="'+CSS.escape(String(previous))+'"]');
      if(el)el.classList.add('selected');
    }
    return result;
  };

  function installBoardToolFeedbackV319(){
    const feedbackMap={
      sendBackBtn:'Sent behind',
      bringFrontBtn:'Brought to front',
      rotateLeftBtn:'Rotated left',
      rotateRightBtn:'Rotated right',
      duplicateBoardBtn:'Duplicated',
      deleteBoardBtn:'Removed from board',
      undoBoardBtn:'Item restored'
    };
    Object.keys(feedbackMap).forEach(function(id){
      const original=$('#'+id);
      if(!original||original.dataset.feedbackV319==='true')return;
      original.dataset.feedbackV319='true';
      original.addEventListener('click',function(){
        setTimeout(function(){
          if(id==='deleteBoardBtn'&&!selectedBoardUid){
            toast(feedbackMap[id]);
          }else if(id!=='deleteBoardBtn'){
            toast(feedbackMap[id]);
          }
        },0);
      });
    });
  }

  setTimeout(function(){
    syncBoardToolProxyStates();
    installBoardToolFeedbackV319();
  },0);

  function boardModelByUidV3193(uid){
    return boardItems.find(function(item){return String(item.uid)===String(uid)})||null;
  }

  function decorateBoardLocksV3193(){
    const board=$('#outfitBoard');
    if(!board)return;
    board.querySelectorAll('.board-piece[data-uid]').forEach(function(el){
      const model=boardModelByUidV3193(el.dataset.uid);
      if(!model)return;
      const locked=!!model.locked;
      el.classList.toggle('board-piece-locked',locked);
      el.setAttribute('data-locked',locked?'true':'false');
      let indicator=el.querySelector('.board-lock-indicator');
      if(!indicator){
        indicator=document.createElement('span');
        indicator.className='board-lock-indicator';
        indicator.setAttribute('aria-hidden','true');
        indicator.textContent='🔒';
        el.appendChild(indicator);
      }
    });
  }

  function toggleBoardLockV3193(uid){
    const model=boardModelByUidV3193(uid);
    if(!model)return;
    model.locked=!model.locked;
    selectedBoardUid=model.uid;
    toast(model.locked?'Item locked':'Item unlocked');
    drawBoard();
  }

  function toggleSelectedBoardLockV3195(){
    const model=selectedBoardUid?boardModelByUidV3193(selectedBoardUid):null;
    if(!model){
      toast('Select an item first');
      return;
    }
    toggleBoardLockV3193(model.uid);
  }

  function syncBoardLockToolV3195(){
    const proxy=$('.board-tool-action[data-proxy-for="boardLockToggleBtn"]');
    if(!proxy)return;
    const model=selectedBoardUid?boardModelByUidV3193(selectedBoardUid):null;
    const locked=!!model?.locked;
    proxy.disabled=!model;
    proxy.classList.toggle('locked',locked);
    const icon=proxy.querySelector('.board-tool-icon');
    const label=proxy.querySelector('.board-tool-copy strong');
    if(icon)icon.textContent=locked?'🔓':'🔒';
    if(label)label.textContent=locked?'Unlock':'Lock';
  }

  function installBoardLockGuardV3193(){
    const board=$('#outfitBoard');
    if(!board||board.dataset.lockGuardV3193==='true')return;
    board.dataset.lockGuardV3193='true';

    board.addEventListener('pointerdown',function(e){
      const piece=e.target.closest&&e.target.closest('.board-piece[data-uid]');
      if(!piece)return;
      const model=boardModelByUidV3193(piece.dataset.uid);
      if(!model||!model.locked)return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      selectedBoardUid=model.uid;
      drawSelectionOnly(model.uid);
      decorateBoardLocksV3193();
      syncBoardToolProxyStates();
      syncBoardLockToolV3195();
    },true);
  }

  const originalDrawBoardV3193=drawBoard;
  drawBoard=function(){
    const result=originalDrawBoardV3193.apply(this,arguments);
    decorateBoardLocksV3193();
    syncBoardLockToolV3195();
    return result;
  };

  setTimeout(function(){
    const legacy=$('#boardEditbar');
    let legacyHost=$('#boardLegacyToolHost');
    if(legacy){
      if(!legacyHost){
        legacyHost=document.createElement('div');
        legacyHost.id='boardLegacyToolHost';
        legacyHost.dataset.boardLegacyTools='true';
        legacyHost.hidden=true;
        document.body.appendChild(legacyHost);
      }
      legacy.dataset.boardLegacyTools='true';
      legacy.hidden=true;
      legacyHost.appendChild(legacy);
    }
    installBoardLockGuardV3193();
    decorateBoardLocksV3193();
  },0);

  const originalLoadOutfitForEditingV318=loadOutfitForEditing;
  loadOutfitForEditing=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitForEditingV318.apply(this,arguments);
    refitSavedBoardToCurrent(outfit);
    return result;
  };
  const originalLoadOutfitAsDuplicateV318=loadOutfitAsDuplicate;
  loadOutfitAsDuplicate=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitAsDuplicateV318.apply(this,arguments);
    refitSavedBoardToCurrent(outfit);
    return result;
  };

  const originalLoadOutfitForEditingV1320=loadOutfitForEditing;
  loadOutfitForEditing=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitForEditingV1320.apply(this,arguments);
    boardCanvasBackgroundV1320=normalizedBoardCanvasV1320(outfit?.canvasBackground);
    applyBoardCanvasV1320();
    return result;
  };

  const originalLoadOutfitAsDuplicateV1320=loadOutfitAsDuplicate;
  loadOutfitAsDuplicate=function(oid){
    const outfit=state.outfits.find(function(x){return x.id===oid});
    const result=originalLoadOutfitAsDuplicateV1320.apply(this,arguments);
    boardCanvasBackgroundV1320=normalizedBoardCanvasV1320(outfit?.canvasBackground);
    applyBoardCanvasV1320();
    return result;
  };

  const originalSaveCurrentBoardForSwitchV13202=saveCurrentBoardForSwitch;
  saveCurrentBoardForSwitch=async function(){
    const result=await originalSaveCurrentBoardForSwitchV13202.apply(this,arguments);
    if(result===false)return result;
    if(editingOutfitId){
      const outfit=state.outfits.find(function(x){return x.id===editingOutfitId});
      if(outfit){
        outfit.canvasBackground={...boardCanvasBackgroundV1320};
        await saveState();
        renderSavedOutfits();
      }
    }
    return result;
  };

  const originalStartNewOutfitV1320=startNewOutfit;
  startNewOutfit=function(){
    const result=originalStartNewOutfitV1320.apply(this,arguments);
    boardCanvasBackgroundV1320={id:'default',color:''};
    applyBoardCanvasV1320();
    return result;
  };

  const originalClearBoardV1320=clearBoard;
  clearBoard=function(){
    const result=originalClearBoardV1320.apply(this,arguments);
    boardCanvasBackgroundV1320={id:'default',color:''};
    applyBoardCanvasV1320();
    return result;
  };

  const originalSaveOutfitV1320=saveOutfit;
  saveOutfit=async function(){
    const result=await originalSaveOutfitV1320.apply(this,arguments);
    if(editingOutfitId){
      const outfit=state.outfits.find(function(x){return x.id===editingOutfitId});
      if(outfit){
        outfit.canvasBackground={...boardCanvasBackgroundV1320};
        await saveState();
        renderSavedOutfits();
      }
    }
    return result;
  };
  if($('#confirmSaveOutfitBtn'))$('#confirmSaveOutfitBtn').onclick=saveOutfit;

  installBoardWorkspaceV3();
  installBoardCanvasV1320();
  installBoardGestureUndoV13205();
  installBoardToolUndoV13205();
  repairBottomNavigationV13205();

  const originalRenderSavedOutfitsV13202=renderSavedOutfits;
  renderSavedOutfits=function(){
    const result=originalRenderSavedOutfitsV13202.apply(this,arguments);
    refreshPortfolioCanvasBackgroundsV13202();
    return result;
  };

  const originalViewOutfitV13202=viewOutfit;
  viewOutfit=function(oid){
    const outfit=state.outfits.find(function(o){return o.id===oid});
    const result=originalViewOutfitV13202.apply(this,arguments);
    const board=$('#viewOutfitBoard');
    if(board)boardCanvasElementStyleV13202(board,outfit?.canvasBackground);
    requestAnimationFrame(function(){
      const live=$('#viewOutfitBoard');
      if(live)boardCanvasElementStyleV13202(live,outfit?.canvasBackground);
    });
    return result;
  };

  setTimeout(installBoardConfirmationsV6,0);

  let boardPickerSearch='';
  let boardPickerColor='';
  let boardPickerTier='';

  function boardPickerObjectForButton(btn){
    const source=btn?.dataset?.source||traySource;
    const arr=source==='closet'?state.items:state.wishlist;
    return arr.find(function(x){return x.id===btn.dataset.id})||null;
  }

  function boardPickerMatches(obj){
    if(!obj)return false;
    const q=String(boardPickerSearch||'').trim().toLowerCase();
    if(q){
      const hay=[
        obj.type,obj.name,obj.category,obj.brand,obj.color,obj.pattern,obj.notes
      ].filter(Boolean).join(' ').toLowerCase();
      if(!hay.includes(q))return false;
    }
    if(boardPickerColor&&String(obj.color||'').toLowerCase()!==boardPickerColor.toLowerCase())return false;
    if(boardPickerTier){
      const tier=normalizeClosetTier(obj.tier);
      if(boardPickerTier==='unrated'){
        if(tier)return false;
      }else if(tier!==boardPickerTier)return false;
    }
    return true;
  }

  function applyBoardPickerFilters(){
    const tray=$('#pieceTray');
    if(!tray)return;
    let visible=0;
    tray.querySelectorAll('.tray-piece').forEach(function(btn){
      const show=boardPickerMatches(boardPickerObjectForButton(btn));
      btn.style.display=show?'':'none';
      if(show)visible++;
    });
    let empty=tray.querySelector('.board-picker-filter-empty');
    if(!visible&&tray.querySelector('.tray-piece')){
      if(!empty){
        empty=document.createElement('p');
        empty.className='tray-empty board-picker-filter-empty';
        empty.textContent='No pieces match these filters.';
        tray.appendChild(empty);
      }
    }else if(empty)empty.remove();
  }

  function refreshBoardPickerFilterUi(){
    const colorBtn=$('#boardPickerColorBtn');
    const tierBtn=$('#boardPickerTierBtn');
    if(colorBtn){
      colorBtn.textContent=boardPickerColor||'Color';
      colorBtn.classList.toggle('active',!!boardPickerColor);
    }
    if(tierBtn){
      tierBtn.textContent=boardPickerTier?(boardPickerTier==='unrated'?'Unrated':boardPickerTier+'-Tier'):'Tier';
      tierBtn.classList.toggle('active',!!boardPickerTier);
    }
    $$('#boardPickerColorPanel .board-picker-chip').forEach(function(btn){
      btn.classList.toggle('active',(btn.dataset.color||'')===boardPickerColor);
    });
    $$('#boardPickerTierPanel .board-picker-chip').forEach(function(btn){
      btn.classList.toggle('active',(btn.dataset.tier||'')===boardPickerTier);
    });
  }

  function installBoardPickerFiltersV5(){
    const picker=document.querySelector('.screen[data-screen="outfits"] .board-picker-bottom');
    const category=$('#outfitCategoryFilter');
    if(!picker||!category||$('#boardPickerFilters'))return;

    const filters=document.createElement('div');
    filters.id='boardPickerFilters';
    filters.className='board-picker-filters';
    filters.innerHTML=
      '<input id="boardPickerSearch" class="board-picker-search" type="search" inputmode="search" autocomplete="off" placeholder="Search pieces…">'+
      '<button type="button" id="boardPickerColorBtn" class="board-picker-filter-btn">Color</button>'+
      '<button type="button" id="boardPickerTierBtn" class="board-picker-filter-btn">Tier</button>'+
      '<button type="button" id="boardPickerResetBtn" class="board-picker-reset-btn">Reset</button>'+
      '<div id="boardPickerColorPanel" class="board-picker-filter-panel">'+
        '<div class="board-picker-filter-row"><span>Color</span>'+
          '<button type="button" class="board-picker-chip" data-color="">All</button>'+
          COLORS.map(function(c){return '<button type="button" class="board-picker-chip" data-color="'+esc(c)+'">'+esc(c)+'</button>'}).join('')+
        '</div>'+
      '</div>'+
      '<div id="boardPickerTierPanel" class="board-picker-filter-panel">'+
        '<div class="board-picker-filter-row"><span>Tier</span>'+
          '<button type="button" class="board-picker-chip" data-tier="">All</button>'+
          CLOSET_TIERS.map(function(t){return '<button type="button" class="board-picker-chip" data-tier="'+t+'">'+t+'</button>'}).join('')+
          '<button type="button" class="board-picker-chip" data-tier="unrated">Unrated</button>'+
        '</div>'+
      '</div>';
    category.insertAdjacentElement('afterend',filters);

    const search=$('#boardPickerSearch');
    search.value=boardPickerSearch;
    search.oninput=function(){
      boardPickerSearch=search.value||'';
      applyBoardPickerFilters();
    };

    $('#boardPickerColorBtn').onclick=function(){
      $('#boardPickerColorPanel').classList.toggle('open');
      $('#boardPickerTierPanel').classList.remove('open');
    };
    $('#boardPickerTierBtn').onclick=function(){
      $('#boardPickerTierPanel').classList.toggle('open');
      $('#boardPickerColorPanel').classList.remove('open');
    };
    $('#boardPickerResetBtn').onclick=function(){
      boardPickerSearch='';
      boardPickerColor='';
      boardPickerTier='';
      traySource='closet';
      trayCategory='Recent';
      const search=$('#boardPickerSearch');
      if(search)search.value='';
      $$('.screen[data-screen="outfits"] .tabs-small button').forEach(function(btn){
        btn.classList.toggle('active',btn.dataset.source==='closet');
      });
      $('#boardPickerColorPanel')?.classList.remove('open');
      $('#boardPickerTierPanel')?.classList.remove('open');
      refreshBoardPickerFilterUi();
      renderPieceTray();
      toast('Picker filters reset');
    };
    $$('#boardPickerColorPanel .board-picker-chip').forEach(function(btn){
      btn.onclick=function(){
        boardPickerColor=btn.dataset.color||'';
        $('#boardPickerColorPanel').classList.remove('open');
        refreshBoardPickerFilterUi();
        applyBoardPickerFilters();
      };
    });
    $$('#boardPickerTierPanel .board-picker-chip').forEach(function(btn){
      btn.onclick=function(){
        boardPickerTier=btn.dataset.tier||'';
        $('#boardPickerTierPanel').classList.remove('open');
        refreshBoardPickerFilterUi();
        applyBoardPickerFilters();
      };
    });
    refreshBoardPickerFilterUi();
    applyBoardPickerFilters();
  }

  const originalRenderPieceTrayV5=renderPieceTray;
  renderPieceTray=function(){
    const result=originalRenderPieceTrayV5.apply(this,arguments);
    installBoardPickerFiltersV5();
    applyBoardPickerFilters();
    return result;
  };

  const originalAddBoardPieceV5=addBoardPiece;
  addBoardPiece=function(pid,source){
    const beforeUid=selectedBoardUid;
    const result=originalAddBoardPieceV5.apply(this,arguments);
    applyBoardPickerFilters();
    const trayBtn=document.querySelector('#pieceTray .tray-piece[data-id="'+CSS.escape(String(pid))+'"][data-source="'+CSS.escape(String(source))+'"]');
    if(trayBtn){
      trayBtn.classList.add('board-picker-added');
      setTimeout(function(){trayBtn.classList.remove('board-picker-added')},560);
    }
    if(selectedBoardUid&&selectedBoardUid!==beforeUid){
      const piece=document.querySelector('#outfitBoard .board-piece[data-uid="'+CSS.escape(String(selectedBoardUid))+'"]');
      if(piece){
        piece.classList.add('board-piece-added');
        setTimeout(function(){piece.classList.remove('board-piece-added')},480);
      }
      toast('Added to board');
    }
    return result;
  };

  function confirmClearBoardV6(){
    if(!boardItems.length){
      toast('Board is already clear');
      return false;
    }
    return window.confirm('Clear this board?\n\nThis will remove all items and decorations from the current board. This action cannot be undone.');
  }

  function installBoardConfirmationsV6(){
    const clear=$('#clearBoardBtn');
    if(clear){
      clear.onclick=function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(!confirmClearBoardV6())return;
        clearBoard();
        toast('Board cleared');
      };
    }

    const newBtn=$('#newBoardBtn');
    if(newBtn){
      newBtn.onclick=function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(boardHasDraft()){
          const ok=window.confirm('Start a new board?\n\nYour current unsaved board will be cleared. Save it first if you want to keep this look.');
          if(!ok){
            toast('Kept current board');
            return;
          }
        }
        startNewOutfit();
      };
    }
  }

  installBoardPickerFiltersV5();
  installBoardConfirmationsV6();

  function installBoardCaptureGuardV7(){
    if(document.documentElement.dataset.boardGuardV7==='true')return;
    document.documentElement.dataset.boardGuardV7='true';
    document.addEventListener('click',function(e){
      const clear=e.target.closest&&e.target.closest('#clearBoardBtn');
      if(clear){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if(!boardItems.length){
          toast('Board is already clear');
          return;
        }
        const ok=window.confirm('Clear this board?\n\nThis will remove all items and decorations from the current board. This action cannot be undone.');
        if(!ok){
          toast('Clear canceled');
          return;
        }
        clearBoard();
        toast('Board cleared');
        return;
      }

      const newBtn=e.target.closest&&e.target.closest('#newBoardBtn');
      if(newBtn){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if(boardHasDraft()){
          const ok=window.confirm('Start a new board?\n\nYour current unsaved board will be cleared. Save it first if you want to keep this look.');
          if(!ok){
            toast('Kept current board');
            return;
          }
        }
        startNewOutfit();
      }
    },true);
  }


  // v13.20-dev8 — Decorate Studio reorganization
  const DECORATE_GROUPS_V13208=[
    {
      key:'text',
      label:'Text',
      icon:'T',
      intro:'Add words, titles, captions, labels and mood-board notes.',
      chips:['More fonts','Adjust text size','Tap text to edit']
    },
    {
      key:'draw',
      label:'Draw',
      icon:'✎',
      intro:'Sketch, circle, underline or doodle directly onto the board.',
      chips:['Pencil / Pen','Marker / Highlighter','Sharper doodle tools']
    },
    {
      key:'shapes',
      label:'Shapes',
      icon:'▣',
      intro:'Use helpful visual callouts and framed elements to guide the look.',
      chips:['Captions & arrows','Thought bubbles','Fills / patterns']
    },
    {
      key:'stickers',
      label:'Stickers',
      icon:'★',
      intro:'Add fun accents, emojis and themed decorative elements.',
      chips:['Sticker themes','Cute / animal packs','Sparkles / stamps']
    }
  ];
  let decorateStudioGroupV13208='text';

  function decorateGroupByKeyV13208(key){
    return DECORATE_GROUPS_V13208.find(function(g){return g.key===key})||DECORATE_GROUPS_V13208[0];
  }

  function decorateSignatureV13208(node){
    return [
      node.id||'',
      node.className||'',
      node.getAttribute?.('aria-label')||'',
      node.getAttribute?.('title')||'',
      node.textContent||''
    ].join(' ').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function decorateNodeGroupV13208(node){
    if(!node)return 'text';
    if(node.querySelector && node.querySelector('#boardTextInput'))return 'text';

    const sig=decorateSignatureV13208(node);

    if(/text|font|typing|caption|title|label/.test(sig))return 'text';
    if(/draw|doodle|pen|marker|brush|highlight|highlighter|stroke|sketch/.test(sig))return 'draw';
    if(/shape|bubble|arrow|frame|banner|callout|caption box|thought/.test(sig))return 'shapes';
    if(/sticker|emoji|stamp|sparkle|smile|heart|star|animal|cute/.test(sig))return 'stickers';

    // Stable fallback order so all controls still remain accessible.
    return 'text';
  }

  function decoratePanelTemplateV13208(group){
    const panel=document.createElement('section');
    panel.className='decorate-studio-panel';
    panel.dataset.decorateGroup=group.key;
    panel.innerHTML=
      '<div class="decorate-studio-intro">'+
        '<strong>'+group.label+'</strong>'+
        '<p>'+group.intro+'</p>'+
        '<div class="decorate-future-chips">'+
          group.chips.map(function(chip){return '<span>'+chip+'</span>'}).join('')+
        '</div>'+
      '</div>'+
      '<div class="decorate-studio-content"></div>';
    return panel;
  }

  function setDecorateStudioGroupV13208(key){
    decorateStudioGroupV13208=key;
    const shell=document.querySelector('.screen[data-screen="outfits"] .board-decorate-shell');
    if(!shell)return;
    shell.querySelectorAll('.decorate-studio-tab').forEach(function(btn){
      const active=btn.dataset.decorateGroup===key;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    });
    shell.querySelectorAll('.decorate-studio-panel').forEach(function(panel){
      panel.classList.toggle('active',panel.dataset.decorateGroup===key);
    });
  }

  function installDecorateStudioV13208(){
    const shell=document.querySelector('.screen[data-screen="outfits"] .board-decorate-shell');
    const creative=$('#creativeTools');
    if(!shell||!creative)return;

    if(shell.dataset.decorateStudioV13208==='true'){
      setDecorateStudioGroupV13208(decorateStudioGroupV13208);
      return;
    }
    shell.dataset.decorateStudioV13208='true';

    const toggle=$('#decorateToggle');
    if(toggle)toggle.style.display='none';

    // Capture the ORIGINAL controls before moving anything.
    const textRow=creative.querySelector('.tool-row');
    const stickerRow=creative.querySelector('.sticker-row');
    const shapeRow=creative.querySelector('.shape-row');
    const drawBtn=creative.querySelector('#drawModeBtn');
    const help=creative.querySelector('#boardHelp');

    // New studio tabs.
    const tabs=document.createElement('div');
    tabs.className='decorate-studio-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Decorate groups');

    const panelsWrap=document.createElement('div');
    panelsWrap.className='decorate-studio-panels';

    const panelMap={};
    DECORATE_GROUPS_V13208.forEach(function(group){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='decorate-studio-tab';
      btn.dataset.decorateGroup=group.key;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected','false');
      btn.innerHTML=
        '<span class="tab-icon" aria-hidden="true">'+group.icon+'</span>'+
        '<span>'+group.label+'</span>';
      btn.onclick=function(){setDecorateStudioGroupV13208(group.key)};
      tabs.appendChild(btn);

      const panel=decoratePanelTemplateV13208(group);
      panelsWrap.appendChild(panel);
      panelMap[group.key]=panel.querySelector('.decorate-studio-content');
    });

    shell.insertBefore(tabs,creative);
    shell.insertBefore(panelsWrap,creative);

    function moveIntoCard(node,group,label){
      if(!node||!panelMap[group])return;
      const card=document.createElement('div');
      card.className='decorate-tool-card';
      card.dataset.decorateCard=group;
      if(label){
        const heading=document.createElement('h4');
        heading.textContent=label;
        card.appendChild(heading);
      }
      card.appendChild(node);
      panelMap[group].appendChild(card);
    }

    // EXPLICIT mapping of the current Decorate tools.
    //
    // TEXT = input + Add text button.
    moveIntoCard(textRow,'text','Add text');

    // STICKERS = all existing sticker buttons.
    moveIntoCard(stickerRow,'stickers','Stickers');

    // DRAW = move the Doodle button OUT of the mixed shape row.
    if(drawBtn){
      const drawWrap=document.createElement('div');
      drawWrap.className='shape-row decorate-draw-current';
      drawWrap.appendChild(drawBtn);
      moveIntoCard(drawWrap,'draw','Draw');
    }

    // SHAPES = remaining Circle / Line / Tape controls.
    if(shapeRow){
      moveIntoCard(shapeRow,'shapes','Shapes');
    }

    // Shared contextual help belongs below all four creative groups.
    if(help){
      help.classList.add('decorate-studio-shared-help');
      shell.appendChild(help);
    }

    // Hide the now-empty legacy container without removing it from the DOM.
    // Existing handlers remain attached to the controls that were moved.
    creative.innerHTML='';
    creative.hidden=true;
    creative.style.display='none';

    DECORATE_GROUPS_V13208.forEach(function(group){
      const content=panelMap[group.key];
      if(content && !content.children.length){
        const note=document.createElement('div');
        note.className='decorate-empty-note';
        note.textContent='This section is ready for the next '+group.label+
          ' iteration. Its expanded tools will be added here.';
        content.appendChild(note);
      }
    });

    setDecorateStudioGroupV13208('text');
  }

  // Install only AFTER DECORATE_GROUPS_V13208 and all Decorate Studio functions
  // have initialized. dev8 called this too early and could leave the old UI visible.
  installDecorateStudioV13208();

  installBoardCaptureGuardV7();


  // v13.20-dev12 — Text Studio compact layout + render fix
  const BOARD_TEXT_FONTS_V132011={
    script:{label:'Signature Script',css:'"Snell Roundhand","Segoe Script","Bradley Hand",cursive'},
    editorial:{label:'Editorial Serif',css:'"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'},
    classic:{label:'Classic Serif',css:'Georgia,"Times New Roman",serif'},
    modern:{label:'Modern Sans',css:'"Avenir Next","Helvetica Neue",Arial,sans-serif'},
    clean:{label:'Clean System',css:'-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif'},
    thin:{label:'Modern Thin',css:'"Avenir Next Ultra Light","Avenir Next","Helvetica Neue",Arial,sans-serif',weight:300},
    rounded:{label:'Soft Rounded',css:'"Avenir Next Rounded","Trebuchet MS",Arial,sans-serif'},
    handwritten:{label:'Pencil / Handwritten',css:'"Bradley Hand","Noteworthy","Marker Felt",cursive'},
    typewriter:{label:'Typewriter',css:'Menlo,"Courier New",monospace'},
    fun:{label:'Fun / Chalk',css:'"Chalkboard SE","Comic Sans MS","Marker Felt",cursive'}
  };
  const BOARD_TEXT_SIZES_V132011={small:{label:'S',px:20},medium:{label:'M',px:28},large:{label:'L',px:38},xlarge:{label:'XL',px:50}};
  let textDraftStyleV132011={font:'script',size:'medium',bold:false,italic:false,underline:false,color:'#7d3547',align:'center'};
  let textEditClearStateV13217={uid:null,original:'',cleared:false};
  function normalizeTextStyleV132011(style){const s=style&&typeof style==='object'?style:{},color=/^#[0-9a-f]{6}$/i.test(String(s.color||''))?String(s.color).toLowerCase():'#7d3547',align=['left','center','right'].includes(s.align)?s.align:'center';return{font:BOARD_TEXT_FONTS_V132011[s.font]?s.font:'script',size:BOARD_TEXT_SIZES_V132011[s.size]?s.size:'medium',bold:!!s.bold,italic:!!s.italic,underline:!!s.underline,color,align}}
  function normalizeTextPieceV132011(piece){if(!piece||piece.kind!=='text')return piece;piece.textStyle=normalizeTextStyleV132011(piece.textStyle);piece.value=String(piece.value||'');return piece}
  const originalNormalizeBoardItemV132011=normalizeBoardItem;
  normalizeBoardItem=function(b){return normalizeTextPieceV132011(originalNormalizeBoardItemV132011.apply(this,arguments))};
  function textStyleCSSV132011(style,scale=1){const s=normalizeTextStyleV132011(style),f=BOARD_TEXT_FONTS_V132011[s.font],sz=BOARD_TEXT_SIZES_V132011[s.size];return{fontFamily:f.css,fontSize:(sz.px*scale)+'px',fontWeight:String(s.bold?700:(f.weight||400)),fontStyle:s.italic?'italic':'normal',textDecoration:s.underline?'underline':'none',color:s.color,textAlign:s.align,justifyContent:s.align==='left'?'flex-start':(s.align==='right'?'flex-end':'center')}}
  const originalBoardItemContentV132011=boardItemContent;
  boardItemContent=function(b){if(b?.kind==='text'){normalizeTextPieceV132011(b);const c=textStyleCSSV132011(b.textStyle);return '<div class=\"board-text\" style=\"font-family:'+c.fontFamily+';font-size:'+c.fontSize+';font-weight:'+c.fontWeight+';font-style:'+c.fontStyle+';text-decoration:'+c.textDecoration+';color:'+c.color+';text-align:'+c.textAlign+';justify-content:'+c.justifyContent+'\">'+esc(b.value||'')+'</div>'}return originalBoardItemContentV132011.apply(this,arguments)};
  const originalRenderSnapshotPieceV132011=renderSnapshotPiece;
  renderSnapshotPiece=function(board,p,scaleX,scaleY,offsetX=0,offsetY=0){const before=board?.children?.length||0,result=originalRenderSnapshotPieceV132011.apply(this,arguments);if(p?.kind==='text'&&board){const el=board.children[before]||board.lastElementChild,t=el?.querySelector?.('.board-text');if(t){const c=textStyleCSSV132011(p.textStyle,Math.min(scaleX||1,scaleY||1));Object.assign(t.style,{fontFamily:c.fontFamily,fontSize:c.fontSize,fontWeight:c.fontWeight,fontStyle:c.fontStyle,textDecoration:c.textDecoration,color:c.color,textAlign:c.textAlign,justifyContent:c.justifyContent})}}return result};
  function selectedTextPieceV132011(){const x=boardItems.find(x=>String(x.uid)===String(selectedBoardUid));return x?.kind==='text'?normalizeTextPieceV132011(x):null}
  function pushTextUndoV132011(label){if(typeof cloneBoardStateV13205==='function'&&typeof pushBoardStateUndoV13205==='function')pushBoardStateUndoV13205(cloneBoardStateV13205(),selectedBoardUid,label)}
  function syncTextStudioV132011(){const studio=$('#boardTextStudioV132011');if(!studio)return;const selected=selectedTextPieceV132011(),ta=$('#boardTextInput'),add=$('#addBoardTextBtn'),clearBtn=$('#boardTextClearBtnV13217');studio.classList.toggle('is-editing',!!selected);if(selected){if(String(textEditClearStateV13217.uid)!==String(selected.uid)){textEditClearStateV13217={uid:selected.uid,original:selected.value||'',cleared:false}}if(document.activeElement!==ta)ta.value=textEditClearStateV13217.cleared?'':(selected.value||'');textDraftStyleV132011={...selected.textStyle};add.textContent='Update text';if(clearBtn)clearBtn.textContent=textEditClearStateV13217.cleared?'Undo':'Clear'}else{textEditClearStateV13217={uid:null,original:'',cleared:false};add.textContent='Add text';if(clearBtn)clearBtn.textContent='Clear'}const style=selected?selected.textStyle:textDraftStyleV132011;const font=$('#boardTextFontV132011');if(font)font.value=style.font;const colorBtn=$('#boardTextColorBtnV13213'),colorInput=$('#boardTextColorInputV13213');if(colorBtn)colorBtn.style.background=style.color||'#7d3547';if(colorInput&&document.activeElement!==colorInput)colorInput.value=style.color||'#7d3547';studio.querySelectorAll('.text-format-btn').forEach(b=>{b.classList.toggle('active',!!style[b.dataset.format]);b.setAttribute('aria-pressed',style[b.dataset.format]?'true':'false')});studio.querySelectorAll('.text-size-btn').forEach(b=>{const a=b.dataset.textSize===style.size;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a?'true':'false')});studio.querySelectorAll('.text-align-btn').forEach(b=>{const a=b.dataset.textAlign===style.align;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a?'true':'false')})}
  function applyTextStyleChangeV132011(next,label){const selected=selectedTextPieceV132011();if(selected){pushTextUndoV132011(label);selected.textStyle={...selected.textStyle,...next};drawBoard()}else{textDraftStyleV132011={...textDraftStyleV132011,...next};syncTextStudioV132011()}}
  function addOrUpdateBoardTextV132011(){const ta=$('#boardTextInput'),value=String(ta?.value||'').trim();if(!value)return toast('Type something first');const selected=selectedTextPieceV132011();if(selected){pushTextUndoV132011('text edit');selected.value=value;textEditClearStateV13217={uid:selected.uid,original:value,cleared:false};drawBoard();toast('Text updated');return}const before=typeof cloneBoardStateV13205==='function'?cloneBoardStateV13205():null;const item={uid:id(),kind:'text',value,textStyle:{...textDraftStyleV132011},x:55+Math.random()*55,y:65+Math.random()*65,w:220,h:(value.length>85||value.includes('\n'))?128:88,rotation:0,z:nextZ()};boardItems.push(item);selectedBoardUid=item.uid;if(before&&typeof pushBoardStateUndoV13205==='function')pushBoardStateUndoV13205(before,null,'add text');drawBoard();toast('Text added')}
  function installTextStudioV132011(){const panel=document.querySelector('.decorate-studio-panel[data-decorate-group="text"] .decorate-studio-content'),card=panel?.querySelector('.decorate-tool-card');if(!panel||!card||$('#boardTextStudioV132011'))return;const old=card.querySelector('#boardTextInput'),add=card.querySelector('#addBoardTextBtn');if(!old||!add)return;const ta=document.createElement('textarea');ta.id='boardTextInput';ta.maxLength=280;ta.rows=2;ta.placeholder='Add a title, caption or note…';ta.value=old.value||'';old.replaceWith(ta);const studio=document.createElement('div');studio.id='boardTextStudioV132011';studio.className='text-studio';studio.innerHTML='<div id="boardTextSelectionV132011" class="text-studio-selection">Editing selected text — changes apply to this object.</div>';studio.appendChild(ta);const label=document.createElement('span');label.className='text-studio-label';label.textContent='Font';studio.appendChild(label);const sel=document.createElement('select');sel.id='boardTextFontV132011';sel.className='text-font-select';Object.entries(BOARD_TEXT_FONTS_V132011).forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v.label;sel.appendChild(o)});const fontAlignRow=document.createElement('div');fontAlignRow.className='text-font-align-row';studio.appendChild(fontAlignRow);const fontLabel=[...studio.children].find(el=>String(el.textContent||'').trim()==='Font');if(fontLabel){fontLabel.classList.add('text-font-inline-label');fontAlignRow.appendChild(fontLabel)}fontAlignRow.appendChild(sel);const alignGroup=document.createElement('div');alignGroup.className='text-align-group';[['left','☰'],['center','☰'],['right','☰']].forEach(([k,l])=>{const b=document.createElement('button');b.type='button';b.className='text-align-btn text-align-'+k;b.dataset.textAlign=k;b.setAttribute('aria-label','Align text '+k);b.setAttribute('aria-pressed','false');b.innerHTML='<span aria-hidden="true">'+l+'</span>';alignGroup.appendChild(b)});fontAlignRow.appendChild(alignGroup);const row=document.createElement('div');row.className='text-format-row';[['bold','B'],['italic','I'],['underline','U']].forEach(([k,l])=>{const b=document.createElement('button');b.type='button';b.className='text-format-btn';b.dataset.format=k;b.textContent=l;row.appendChild(b)});const sizes=document.createElement('div');sizes.className='text-size-group';Object.entries(BOARD_TEXT_SIZES_V132011).forEach(([k,v])=>{const b=document.createElement('button');b.type='button';b.className='text-size-btn';b.dataset.textSize=k;b.textContent=v.label;sizes.appendChild(b)});row.appendChild(sizes);studio.appendChild(row);add.className='text-studio-action';studio.appendChild(add);card.innerHTML='';card.appendChild(studio);sel.onchange=()=>applyTextStyleChangeV132011({font:sel.value},'font change');studio.querySelectorAll('.text-format-btn').forEach(b=>b.onclick=e=>{e.preventDefault();const s=selectedTextPieceV132011()?.textStyle||textDraftStyleV132011;applyTextStyleChangeV132011({[b.dataset.format]:!s[b.dataset.format]},'text format')});studio.querySelectorAll('.text-size-btn').forEach(b=>b.onclick=e=>{e.preventDefault();applyTextStyleChangeV132011({size:b.dataset.textSize},'text size')});studio.querySelectorAll('.text-align-btn').forEach(b=>b.onclick=e=>{e.preventDefault();applyTextStyleChangeV132011({align:b.dataset.textAlign},'text alignment')});document.addEventListener('click',e=>{const clear=e.target.closest?.('#boardTextClearBtnV13217');if(!clear)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const ta=$('#boardTextInput'),selected=selectedTextPieceV132011();if(!ta)return;if(selected){if(String(textEditClearStateV13217.uid)!==String(selected.uid)){textEditClearStateV13217={uid:selected.uid,original:selected.value||'',cleared:false}}if(textEditClearStateV13217.cleared){ta.value=textEditClearStateV13217.original||'';textEditClearStateV13217.cleared=false;clear.textContent='Clear'}else{textEditClearStateV13217.original=selected.value||'';ta.value='';textEditClearStateV13217.cleared=true;clear.textContent='Undo'}}else{ta.value='';textEditClearStateV13217={uid:null,original:'',cleared:false};clear.textContent='Clear'}requestAnimationFrame(()=>{ta.focus();ta.setSelectionRange?.(ta.value.length,ta.value.length)})},true);
  document.addEventListener('click',e=>{const t=e.target.closest?.('#addBoardTextBtn');if(!t)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();addOrUpdateBoardTextV132011()},true);ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();addOrUpdateBoardTextV132011()}});syncTextStudioV132011()}
  const originalDrawBoardV132011=drawBoard;drawBoard=function(){const r=originalDrawBoardV132011.apply(this,arguments);setTimeout(syncTextStudioV132011,0);return r};
  document.addEventListener('pointerup',e=>{if(e.target.closest?.('#outfitBoard .board-piece'))setTimeout(syncTextStudioV132011,0)},true);
  function migrateLegacyTextPiecesV132011(){let changed=false;(state.outfits||[]).forEach(o=>(o.pieces||[]).forEach(p=>{if(p.kind==='text'){const before=JSON.stringify(p.textStyle||null);p.textStyle=normalizeTextStyleV132011(p.textStyle);if(before!==JSON.stringify(p.textStyle))changed=true}}));if(changed)saveState().catch(()=>{})}
  setTimeout(migrateLegacyTextPiecesV132011,900);setTimeout(migrateLegacyTextPiecesV132011,1900);
  function canvasFontV132011(style,px){const s=normalizeTextStyleV132011(style),f=BOARD_TEXT_FONTS_V132011[s.font];return (s.italic?'italic ':'')+(s.bold?700:(f.weight||400))+' '+Math.max(7,px)+'px '+f.css}
  function wrapStyledCanvasTextV132011(ctx,text,maxWidth,maxLines=12){const lines=[];for(const para of String(text||'').split(/\n/)){if(!para){lines.push('');continue}let line='';for(const word of para.split(/\s+/)){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines)return lines}else line=test}if(line)lines.push(line);if(lines.length>=maxLines)return lines}return lines}
  function drawBoardTextToContextV132011(ctx,b,w,h,scale){const s=normalizeTextStyleV132011(b.textStyle),size=BOARD_TEXT_SIZES_V132011[s.size].px*Math.max(.15,scale||1),lh=size*1.12,pad=w*.03,x=s.align==='left'?pad:(s.align==='right'?w-pad:w/2);ctx.fillStyle=s.color||'#7d3547';ctx.textAlign=s.align;ctx.textBaseline='middle';ctx.font=canvasFontV132011(s,size);const lines=wrapStyledCanvasTextV132011(ctx,b.value||'',w*.94,12),visible=lines.slice(0,Math.max(1,Math.floor(h*.94/lh))),start=h/2-(visible.length-1)*lh/2;visible.forEach((line,i)=>{const y=start+i*lh;ctx.fillText(line,x,y,w*.94);if(s.underline&&line){const ww=Math.min(w*.94,ctx.measureText(line).width);let x1=x-ww/2,x2=x+ww/2;if(s.align==='left'){x1=x;x2=x+ww}else if(s.align==='right'){x1=x-ww;x2=x}ctx.save();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(1,size*.055);ctx.beginPath();ctx.moveTo(x1,y+size*.48);ctx.lineTo(x2,y+size*.48);ctx.stroke();ctx.restore()}})}
  window.__audreyDrawBoardTextV132011=drawBoardTextToContextV132011;
  installTextStudioV132011();

  // v13.20-dev12 — compact Text editor + authoritative typography renderer.
  function compactTextStudioV132012(){
    const studio=$('#boardTextStudioV132011'),textarea=$('#boardTextInput'),add=$('#addBoardTextBtn');
    if(!studio||!textarea||!add)return;
    let row=studio.querySelector('.text-entry-action-row');
    if(!row){
      row=document.createElement('div');
      row.className='text-entry-action-row';
      studio.insertBefore(row,textarea);
      row.appendChild(textarea);
      const stack=document.createElement('div');
      stack.className='text-action-stack';
      row.appendChild(stack);
      stack.appendChild(add);
      let clearBtn=$('#boardTextClearBtnV13217');
      if(!clearBtn){clearBtn=document.createElement('button');clearBtn.type='button';clearBtn.id='boardTextClearBtnV13217';clearBtn.className='text-clear-btn';clearBtn.textContent='Clear';stack.appendChild(clearBtn);clearBtn.onclick=function(e){e.preventDefault();const selected=selectedTextPieceV132011();if(selected){if(String(textEditClearStateV13217.uid)!==String(selected.uid)){textEditClearStateV13217={uid:selected.uid,original:selected.value||'',cleared:false}}if(textEditClearStateV13217.cleared){ta.value=textEditClearStateV13217.original||'';textEditClearStateV13217.cleared=false;clearBtn.textContent='Clear'}else{textEditClearStateV13217.original=selected.value||'';ta.value='';textEditClearStateV13217.cleared=true;clearBtn.textContent='Undo'}ta.focus()}else{ta.value='';clearBtn.textContent='Clear';ta.focus()}}}
      let colorInput=$('#boardTextColorInputV13213');
      if(!colorInput){colorInput=document.createElement('input');colorInput.type='color';colorInput.id='boardTextColorInputV13213';colorInput.className='text-color-input';colorInput.setAttribute('aria-label','Choose text color');colorInput.title='Text color';colorInput.value='#7d3547';stack.appendChild(colorInput);colorInput.oninput=function(){applyTextStyleChangeV132011({color:colorInput.value},'text color')}}
    }
    add.textContent=selectedTextPieceV132011?.()?'Update':'Add Text';
  }

  function applyTextStyleToElementV132012(el,piece,scale=1){
    if(!el||!piece)return;
    normalizeTextPieceV132011(piece);
    const css=textStyleCSSV132011(piece.textStyle,scale);
    el.dataset.textV132012='true';
    el.style.setProperty('font-family',css.fontFamily,'important');
    el.style.setProperty('font-size',css.fontSize,'important');
    el.style.setProperty('font-weight',css.fontWeight,'important');
    el.style.setProperty('font-style',css.fontStyle,'important');
    el.style.setProperty('text-decoration',css.textDecoration,'important');
    el.style.setProperty('color',css.color,'important');
    el.style.setProperty('text-align',css.textAlign,'important');
    el.style.setProperty('justify-content',css.justifyContent,'important');
    el.style.setProperty('white-space','pre-wrap','important');
    el.style.setProperty('overflow-wrap','anywhere','important');
    el.style.setProperty('line-height','1.08','important');
  }

  function refreshLiveBoardTextStylesV132012(){
    const board=$('#outfitBoard');if(!board)return;
    board.querySelectorAll('.board-piece[data-uid]').forEach(function(pieceEl){
      const model=boardItems.find(function(x){return String(x.uid)===String(pieceEl.dataset.uid)});
      if(!model||model.kind!=='text')return;
      applyTextStyleToElementV132012(pieceEl.querySelector('.board-text'),model,1);
    });
  }

  const drawBoardV132012=drawBoard;
  drawBoard=function(){
    const result=drawBoardV132012.apply(this,arguments);
    refreshLiveBoardTextStylesV132012();
    compactTextStudioV132012();
  function compactTextColorIntoFontRowV132110(){const studio=$('#boardTextStudioV132011'),fontRow=studio?.querySelector('.text-font-align-row'),color=$('#boardTextColorInputV13213');if(!studio||!fontRow||!color)return;if(color.parentElement!==fontRow)fontRow.appendChild(color)}
  compactTextColorIntoFontRowV132110();

    setTimeout(function(){refreshLiveBoardTextStylesV132012();compactTextStudioV132012()},0);
    return result;
  };

  const renderSnapshotPieceV132012=renderSnapshotPiece;
  renderSnapshotPiece=function(board,p,scaleX,scaleY,offsetX=0,offsetY=0){
    const before=board?.children?.length||0;
    const result=renderSnapshotPieceV132012.apply(this,arguments);
    if(p?.kind==='text'&&board){
      const el=board.children[before]||board.lastElementChild;
      applyTextStyleToElementV132012(el?.querySelector?.('.board-text'),normalizeTextPieceV132011({...p}),Math.min(scaleX||1,scaleY||1));
    }
    return result;
  };

  const syncTextStudioV132012=syncTextStudioV132011;
  syncTextStudioV132011=function(){
    const result=syncTextStudioV132012.apply(this,arguments);
    compactTextStudioV132012();
    refreshLiveBoardTextStylesV132012();
    return result;
  };

  compactTextStudioV132012();
  refreshLiveBoardTextStylesV132012();

  // v13.20-dev7 — Photo Studio Original must be a pristine source view.
  //
  // Prior behavior:
  // applyStudioMode('original') restored studioBaseCanvas from the captured source,
  // then rebuildStudioWorkCanvas() reapplied manual erase/restore masks. This meant
  // "Original" could still have missing garment pixels after a Quick/Clean workflow.
  //
  // New behavior:
  // - Original always rebuilds directly from the correct captured source.
  // - Original bypasses cutout/manual alpha masks while it is selected.
  // - Quick/Clean continue to use the saved non-destructive masks.
  // - Switching back to Quick/Clean preserves the user's retouch masks.
  // - Closet and Wishlist Studio targets both use their own correct original source.

  ensureStudioOriginalCanvas=async function(){
    const original=studioTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto;
    const fallback=studioTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    const src=original||studioSourcePhoto||fallback;
    if(!src)return null;

    // Rebuild when needed from the target's true source rather than relying on
    // a canvas that may have originated from another Studio target/session.
    if(!studioOriginalCanvas){
      studioOriginalCanvas=await sourceToStudioCanvas(src);
    }
    return studioOriginalCanvas;
  };

  const originalRebuildStudioWorkCanvasV13207=rebuildStudioWorkCanvas;
  rebuildStudioWorkCanvas=function(){
    if(studioMode!=='original'){
      return originalRebuildStudioWorkCanvasV13207.apply(this,arguments);
    }

    if(!studioBaseCanvas)return;
    studioWorkCanvas=newStudioCanvas();
    studioWorkCanvas.getContext('2d').drawImage(studioBaseCanvas,0,0);

    // Do not apply erase/restore masks to Original. Tone adjustments remain
    // non-destructive and can still be previewed independently.
    applyStudioAdjustmentsAndRender();
  };

  applyStudioMode=async function(mode,{showBusy=true}={}){
    const original=studioTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto;
    const working=studioTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;
    const src=original||studioSourcePhoto||working;
    if(!src)return;

    studioMode=mode;
    studioLegacyMode=false;
    $$('.studio-mode').forEach(function(b){
      b.classList.toggle('active',b.dataset.mode===mode);
    });

    try{
      if(mode==='original'){
        if(showBusy){
          $('#studioStatus').textContent='Original captured photo selected.';
        }

        // Always regenerate a pristine base from the true captured source.
        // This avoids any possibility that a prior Quick/Clean canvas or alpha
        // mask remains baked into the Original preview.
        studioOriginalCanvas=await sourceToStudioCanvas(src);
        studioBaseCanvas=newStudioCanvas();
        studioBaseCanvas.getContext('2d').drawImage(studioOriginalCanvas,0,0);
        rebuildStudioWorkCanvas();
        return;
      }

      if(showBusy){
        $('#studioStatus').textContent=
          mode==='clean'?t('studio.cleanBuilding'):t('studio.quickBuilding');
      }

      studioCutoutPhoto=
        mode==='clean'
          ?await removeAdvancedBackground(src,studioEdge)
          :await removeSimpleBackground(src,studioEdge);

      studioBaseCanvas=await sourceToStudioCanvas(studioCutoutPhoto);
      rebuildStudioWorkCanvas();
      $('#studioStatus').textContent=t('studio.cutoutReady');
    }catch(e){
      console.error(e);
      $('#studioStatus').textContent=t('studio.cutoutFailed');
      toast('Could not remove background');
    }
  };

  installClosetTierFilter();
  installTierRibbonSetting();
  installSettingsGroups();
  installClosetViewSetting();
  applyClosetView();
  applyBoardFormat();

  const originalRenderItemReviewDetails=renderItemReviewDetails;
  renderItemReviewDetails=function(item){
    originalRenderItemReviewDetails(item);
    const box=$('#itemReviewDetails');
    if(!box)return;
    const live=item||state.items.find(function(x){return x.id===$('#itemId').value})||null;
    box.prepend(closetTierSection(live));
  };

  const originalSaveItem=saveItem;
  saveItem=async function(){
    const itemId=$('#itemId').value;
    const existing=itemId?state.items.find(function(x){return x.id===itemId}):null;
    const preservedTier=normalizeClosetTier(existing&&existing.tier);
    await originalSaveItem();
    if(!itemId||!preservedTier)return;
    const live=state.items.find(function(x){return x.id===itemId});
    if(live&&normalizeClosetTier(live.tier)!==preservedTier){
      live.tier=preservedTier;
      await saveState();
    }
  };
})();
`;

function withTierPatch(resp){
  return resp.text().then(text=>{
    // v13.20-dev2: make the share renderer consume the same saved Canvas background
    // rather than hard-coding the legacy cream/grid board.
    const shareOld=`ctx.fillStyle='#f7f0df';ctx.fillRect(0,0,W,H);ctx.fillStyle='#efe9d9';roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.fill();
  ctx.save();roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.clip();ctx.strokeStyle='rgba(108,81,66,.10)';ctx.lineWidth=2;const grid=24*scale;for(let x=pad;x<=pad+drawW;x+=grid){ctx.beginPath();ctx.moveTo(x,boardTop);ctx.lineTo(x,boardTop+drawH);ctx.stroke()}for(let y=boardTop;y<=boardTop+drawH;y+=grid){ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(pad+drawW,y);ctx.stroke()}`;
    const shareNew=`ctx.fillStyle='#f7f0df';ctx.fillRect(0,0,W,H);roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.save();ctx.clip();window.__audreyPaintBoardCanvasV1320(ctx,pad,boardTop,drawW,drawH,outfit?.canvasBackground||(!outfit?(window.__audreyGetCurrentCanvasV1320?.()||{id:'default'}):{id:'default'}));ctx.restore();
  ctx.save();roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.clip();`;
    if(text.includes(shareOld))text=text.replace(shareOld,shareNew);

    const textShareOld="else if(b.kind==='text'){ctx.fillStyle='#7d3547';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(18,28*scale)}px \"Brush Script MT\",\"Segoe Script\",cursive`;wrapCanvasText(ctx,b.value||'',w/2,h/2,w*.95,Math.max(22,29.4*scale))}";
    const textShareNew="else if(b.kind==='text'){window.__audreyDrawBoardTextV132011(ctx,b,w,h,scale)}";
    if(text.includes(textShareOld))text=text.replace(textShareOld,textShareNew);

    // Repair fixed bottom navigation whenever Share UI closes or the native share
    // sheet returns control to the PWA.
    text=text.replace(
      `function closeSharePreview(){const returnId=shareReturnOutfitId;`,
      `function closeSharePreview(){window.__audreyRepairBottomNavV13205?.();setTimeout(()=>window.__audreyRepairBottomNavV13205?.(),120);const returnId=shareReturnOutfitId;`
    );
    text=text.replace(
      `async function sharePreparedOutfit(){`,
      `async function sharePreparedOutfit(){setTimeout(()=>window.__audreyRepairBottomNavV13205?.(),80);`
    );
    text=text.replace(
      `function openPreparedShareImage(){`,
      `function openPreparedShareImage(){setTimeout(()=>window.__audreyRepairBottomNavV13205?.(),80);`
    );

    const headers=new Headers(resp.headers);
    headers.delete('content-length');
    return new Response(text+'\n'+TIER_PATCH,{status:resp.status,statusText:resp.statusText,headers});
  });
}

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ASSETS.filter(asset=>asset!=='./app.js'));
    const appResp=await fetch('./app.js',{cache:'no-store'});
    await cache.put('./app.js',await withTierPatch(appResp));
  })());
});

self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin&&url.pathname.endsWith('/app.js')){
    e.respondWith(fetch(e.request).then(async resp=>{
      const patched=await withTierPatch(resp);
      const copy=patched.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return patched;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./app.js'))));
    return;
  }
  if(url.origin===location.origin&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css'))){
    e.respondWith(fetch(e.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
