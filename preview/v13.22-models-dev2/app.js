const CATALOG_TAXONOMY_VERSION=2;
const WISHLIST_MODEL_VERSION=5;
const CATEGORY_DEFS=[
  {id:'tops',label:'Tops'},
  {id:'bottoms',label:'Bottoms'},
  {id:'dresses',label:'Dresses'},
  {id:'outerwear',label:'Outerwear'},
  {id:'shoes',label:'Shoes'},
  {id:'accessories',label:'Accessories'},
  {id:'misc',label:'Misc'}
];
const CATEGORIES=CATEGORY_DEFS.map(x=>x.label);
const CATEGORY_ID_BY_LABEL=Object.fromEntries(CATEGORY_DEFS.map(x=>[x.label,x.id]));
const CATEGORY_LABEL_BY_ID=Object.fromEntries(CATEGORY_DEFS.map(x=>[x.id,x.label]));
const ACQUIRED=['Bought new','Gifted','Hand-me-down','Secondhand','DIY','Other'];
const PATTERNS=['Solid','Stripe','Plaid','Floral/Print','Graphic','Colorblock','Other'];
const SEASONS=['All-season','Winter','Spring','Summer','Fall'];
const COLORS=['Black','White','Cream','Gray','Brown','Coffee','Tan','Beige','Burgundy','Red','Orange','Yellow','Mustard','Olive','Green','Mint','Turquoise','Blue','Navy','Purple','Pink','Multicolor'];
const TYPES={
  Tops:['T-shirt','Long-sleeve T-shirt','Tank top','Blouse','Button-down shirt','Polo','Sweater','Sweatshirt','Hoodie','Cardigan','Crop top','Camisole','Other'],
  Bottoms:['Jeans','Pants / Trousers','Leggings','Shorts','Skirt','Joggers / Sweatpants','Other'],
  Dresses:['Mini Dress','Midi Dress','Maxi Dress','Shirt Dress','Sweater Dress','Slip Dress','Wrap Dress','Casual Dress','Formal / Event Dress','Other'],
  Outerwear:['Jacket','Coat','Blazer','Vest','Rain jacket','Puffer','Fleece','Other'],
  Shoes:['Sneakers','Athletic shoes','Boots','Sandals','Flats','Heels','Loafers','Slippers','Other'],
  Accessories:['Hat','Belt','Bag / Purse','Backpack','Scarf','Jewelry','Sunglasses','Hair accessory','Gloves','Other'],
  Misc:['Jumpsuit / Romper','Swimsuit','Socks','Tights','Underwear','Pajamas / Sleepwear','Costume','Uniform','Other']
};
const CLOTHING_SIZES=['Not set','XXS','XS','S','M','L','XL','XXL','Girls 8','Girls 10','Girls 12','Girls 14','Girls 16','00','0','2','4','6','8','10','12','14','16','18','Men XS','Men S','Men M','Men L','Men XL','Men XXL','One Size','Other'];
// Optional, context-sensitive garment attributes. Stored values are deliberately
// separate from their UI labels so the wording can evolve without data migration.
const FIT_OPTIONS={
  Tops:['Regular','Petite','Tall'],
  Bottoms:['Regular','Petite','Short','Tall','Long'],
  Dresses:['Regular','Petite','Tall'],
  Outerwear:['Regular','Petite','Tall']
};
const STYLE_OPTIONS={
  'Bottoms|Jeans':['Skinny','Slim','Straight','Relaxed','Boyfriend','Mom','Baggy','Barrel','Wide Leg','Bootcut','Flare','Other'],
  'Bottoms|Pants / Trousers':['Slim','Straight','Relaxed','Tapered','Wide Leg','Barrel','Bootcut','Flare','Cargo','Pleated','Other'],
  'Bottoms|Shorts':['Denim','Tailored','Athletic','Bike','Cargo','Bermuda','Relaxed','Other'],
  'Bottoms|Skirt':['A-Line','Pencil','Pleated','Wrap','Tiered','Other'],
  'Bottoms|Joggers / Sweatpants':['Slim','Relaxed','Wide Leg','Cargo','Other']
};
const BOTTOM_SIZES=['Not set','XXS','XS','S','M','L','XL','XXL','Girls 8','Girls 10','Girls 12','Girls 14','Girls 16','00','0','2','4','6','8','10','12','14','16','18',...Array.from({length:17},(_,i)=>`Men W${28+i}`),'Men W46','Men W48','Other'];
const SHOE_SIZES=['Not set',...Array.from({length:25},(_,i)=>String(1+i*.5)),'Other'];
const ACCESSORY_SIZES=['Not set','One Size','XS','S','M','L','XL','Other'];
const STORE_KEY='audreyClosetV1';
const DB_NAME='AudreyClosetDB';
const DB_VERSION=1;
const DB_STORE='app';
const DEFAULT_APP_NAME="Audrey's Clothing App";
const DEFAULT_PORTFOLIO_FOLDERS=['Everyday','School','Weekend','Dressy','Sport','Seasonal','Ideas'];
const SYSTEM_PORTFOLIO_TABS=['All','Favorites'];
const UI_STRINGS={
  en:{
    'studio.title':'Clean up the garment',
    'studio.noTool':'No tool selected. The garment is locked; drag with one finger to pan and pinch with two fingers to zoom.',
    'studio.cutout':'Cutout',
    'studio.cutoutHelp':'Quick background removal',
    'studio.more':'More options',
    'studio.cutoutReady':'Cutout ready in the same position and size. Select Erase or Restore only when you want to retouch it.',
        'studio.quickBuilding':'Building a quick starting cutout…',
    'studio.cleanBuilding':'Building a cleaner starting cutout…',
    'studio.cutoutFailed':'Cutout failed — captured original is still safe.',
        'studio.adjust':'Adjust',
    'studio.undo':'Undo',
    'studio.redo':'Redo',
    'studio.restore':'Restore',
    'studio.erase':'Erase',
    'studio.original':'Original',
    'studio.quick':'Quick',
    'studio.clean':'Clean',
    'studio.sensitivity':'Sensitivity',
    'studio.adjustments':'Adjustments',
    'studio.adjustmentsHelp':'Tone and detail',
    'studio.exposure':'Exposure',
    'studio.contrast':'Contrast',
    'studio.highlights':'Highlights',
    'studio.resetAdjustments':'Reset adjustments',
    'studio.center':'Center',
    'studio.fit':'Fit',
    'studio.resetAll':'Reset all photo edits',
    'studio.resetConfirm':'Reset to the captured original and remove cutout, manual masking, photo adjustments, position, size and rotation edits?',
    'studio.resetDone':'Photo edits reset. The captured original is ready.',
    'studio.background':'Background',
    'studio.transparent':'Transparent',
    'studio.cream':'Cream',
    'studio.paper':'Paper',
    'studio.color':'Color',
    'studio.cancel':'Cancel',
    'studio.usePhoto':'Use this photo'
  }
};
const APP_LOCALE='en';
function t(key,fallback=''){return UI_STRINGS[APP_LOCALE]?.[key]||UI_STRINGS.en?.[key]||fallback||key}
function applyLocalizedStrings(root=document){root.querySelectorAll('[data-i18n]').forEach(el=>{const value=t(el.dataset.i18n,el.textContent);if(value)el.textContent=value})}

const STUDIO_BACKGROUND_PALETTES=[
  {id:'neutrals',label:'Neutrals',colors:[['#ffffff','White'],['#f7f3ea','Warm white'],['#eee6d8','Cream'],['#dfd3c2','Oat'],['#cbbba6','Beige'],['#a99e90','Stone'],['#89857f','Gray'],['#676662','Slate'],['#454543','Charcoal'],['#242423','Black']]},
  {id:'pastels',label:'Pastels',colors:[['#fff0f1','Blush'],['#f9ddd8','Peach'],['#f8e9bf','Butter'],['#e7edc7','Pale lime'],['#d6edda','Mint'],['#d8efea','Aqua'],['#dcebf7','Sky'],['#dfe3f5','Periwinkle'],['#e9ddf3','Lavender'],['#f2dcea','Rose']]},
  {id:'colors',label:'Colors',colors:[['#f2c84b','Yellow'],['#e89345','Orange'],['#c75b4d','Red'],['#ad4f68','Berry'],['#8e5b99','Purple'],['#536fa8','Blue'],['#3f8e91','Teal'],['#56845b','Green'],['#7b7b4d','Olive'],['#755745','Brown']]},
  {id:'brights',label:'Brights',colors:[['#f5f45b','Neon yellow'],['#bdf04a','Neon lime'],['#4ef08b','Neon green'],['#43e5d5','Neon aqua'],['#45c8ff','Electric blue'],['#6578ff','Electric indigo'],['#a85cff','Electric violet'],['#f05ce0','Hot magenta'],['#ff5d8f','Hot pink'],['#ff7354','Bright coral']]}
];
function renderStudioBackgroundPalette(){const host=$('#studioBgPalette');if(!host)return;host.innerHTML=STUDIO_BACKGROUND_PALETTES.map(group=>`<div class="studio-palette-row" data-palette="${group.id}"><span class="studio-palette-label">${esc(group.label)}</span><div class="studio-palette-swatches">${group.colors.map(([color,name])=>`<button type="button" class="studio-bg-swatch" data-color="${color}" style="--swatch:${color}" aria-label="${esc(name)}"></button>`).join('')}</div></div>`).join('');bindStudioPaletteSwatches()}
function bindStudioPaletteSwatches(){$$('.studio-bg-swatch').forEach(b=>b.onclick=()=>{studioCustomBg=b.dataset.color||'#ffffff';studioBg='custom';$$('.studio-bg').forEach(x=>x.classList.toggle('active',x.id==='studioCustomBgBtn'));$$('.studio-bg-swatch').forEach(x=>x.classList.toggle('active',x===b));$('#studioBgPalette')?.classList.remove('hidden');renderStudio()})}

let state=emptyState();
let selectedCategory='';
let includeArchivedCloset=localStorage.getItem('audreyIncludeArchivedCloset')==='true';
let catalogReviewIds=[];
let itemReviewIds=[];
let itemSwipeStart=null;
let itemPhotoPickerActive=false;
let itemDialogScrollY=0;
let itemDialogMode='create';
let itemFitDrafts={};
let itemStyleDrafts={};
let itemAttributeContextKey='';
let pendingSmartScanResult=null;
let itemWorkingPhoto='';
let itemOriginalPhoto='';
let itemCutoutApplied=false;
let itemStudioState=null;
let studioSourcePhoto='';
let studioCutoutPhoto='';
let studioMode='original';
let studioOriginalCanvas=null;
let studioManualEraseMask=null;
let studioManualRestoreMask=null;
let studioLegacyMode=false;
let studioBg='transparent';
let studioCustomBg='#ffffff';
let studioEdge=45;
let studioBrushMode=null;
let studioDrawing=false;
let studioBaseCanvas=null;
let studioWorkCanvas=null;
let studioUndoStack=[];
let studioRedoStack=[];
let studioPendingTransformHistory=null;
let studioLastPoint=null;
let studioMoveMode=false;
let studioObjectScale=1;
let studioObjectX=0;
let studioObjectY=0;
let studioObjectRotation=0;
let studioViewZoom=1;
let studioViewX=0;
let studioViewY=0;
let studioExposure=0;
let studioContrast=0;
let studioHighlights=0;
let studioAdjustedCanvas=null;
let studioPendingAdjustmentHistory=null;
let studioPointers=new Map();
let studioGesture=null;
let wishWorkingPhoto='';
let wishOriginalPhoto='';
let wishStudioState=null;
let wishCaptureAssetsDraft=[];
let wishScanDataDraft={};
let wishInputSourceDraft='manual';
let quickCaptureDraft={item:'',label:'',price:'',itemName:'',labelText:'',priceText:'',barcode:'',ocrAvailable:true,suggestions:{}};
let quickCapturePickerActive=false;
let quickCapturePickerStartedAt=0;
let quickCaptureSessionActive=false;
let wishDialogScrollY=0;
let wishDialogMode='create';
let wishFitDrafts={};
let wishStyleDrafts={};
let wishAttributeContextKey='';
let wishlistView='all';
let wishlistReorderMode=false;
let wishlistDrag={timer:null,pointerId:null,startY:0,active:false,card:null,id:null,ghost:null,placeholder:null,target:null,targetAfter:false,originalOrder:[]};
let suppressWishlistClickUntil=0;
let studioTarget='item';
let smartScanTarget='item';

let boardItems=[];
let pendingBoardSwitchAction=null;
let boardUndoStack=[];
const BOARD_MOVE_SENSITIVITY=.72;
const BOARD_PINCH_SCALE_SENSITIVITY=.58;
const BOARD_PINCH_ROTATION_SENSITIVITY=.58;
const BOARD_PINCH_MOVE_SENSITIVITY=.58;
let traySource='closet';
let trayCategory='Recent';
let portfolioFilter='All';
let portfolioSearchQuery='';
let portfolioDiscoveryItemIds=new Set();
let portfolioItemPickerOpen=false;
let viewingOutfitId=null;
let editingOutfitId=null;
let selectedBoardUid=null;
let doodleMode=false;
let activeDoodle=null;
let pendingShareBlob=null;
let pendingShareUrl='';
let pendingShareFileName='outfit.jpg';
let pendingShareOutfitId=null;
let shareReturnOutfitId=null;
let portfolioPreviewReturnOutfitId=null;
let portfolioPreviewItemId=null;
let portfolioPreviewItemSource='closet';
let portfolioModalScrollY=0;
let closetDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,category:'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,scrollRaf:null,longPressed:false};
let suppressCatalogClickUntil=0;
let portfolioDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,folder:'',active:false,moved:false,ghost:null,dropOutline:null,targetId:null,targetAfter:false,originalId:null,raf:null,scrollRaf:null,aggregate:false,aggregateLongPress:false};
let portfolioTabDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,tab:null,active:false,ghost:null,target:null,originalName:'',raf:null};
let suppressPortfolioTabClickUntil=0;
let suppressPortfolioClickUntil=0;
let wearCategoryFilter='All';
let editingWearId=null;
let viewingJournalId=null;
let journalDetailScrollY=0;
let wearDialogScrollY=0;
let journalStatScrollY=0;
let journalRangeFilter='all';
let journalRangeStart='';
let journalRangeEnd='';
let journalRangeDraftStart='';
let journalRangeDraftEnd='';
let journalCalendarMonth='';
let todayJournalExpanded=localStorage.getItem('audreyTodayJournalExpanded')!=='false';
let plannedJournalExpanded=localStorage.getItem('audreyPlannedJournalExpanded')==='true';
let wearLogExpanded=localStorage.getItem('audreyWearLogExpanded')!=='false';
let wearInsightsExpanded=localStorage.getItem('audreyWearInsightsExpanded')!=='false';
const JOURNAL_SECTION_ORDER=['today','planned','wearLog','insights'];
const JOURNAL_SECTION_LABELS={today:'Today\'s Look',planned:'Planned looks',wearLog:'Wear Log',insights:'Wear Insights'};
let wearDraftIds=new Set();
let wearOriginalDate='';
let wearDateLocked=false;
let wearMoveOverrideTarget=false;
let wearMoveSourceId=null;
let wearDateConflictPending=null;
let wearSessionMode='add';
let journalItemPreviewId=null;
let journalItemPreviewSnapshot=null;
let journalItemReturnId=null;
let journalItemPreviewScrollY=0;

function emptyState(){return {items:[],outfits:[],journal:[],wishlist:[],shoppingSessions:[],settings:{appName:DEFAULT_APP_NAME,portfolioFolders:[...DEFAULT_PORTFOLIO_FOLDERS],portfolioTabOrder:[...SYSTEM_PORTFOLIO_TABS,...DEFAULT_PORTFOLIO_FOLDERS],boardRecent:{closet:[],wishlist:[]},catalogTaxonomyVersion:CATALOG_TAXONOMY_VERSION,wishlistModelVersion:WISHLIST_MODEL_VERSION}}}
function categoryIdFor(value=''){
  const raw=String(value||'').trim();
  if(CATEGORY_LABEL_BY_ID[raw])return raw;
  return CATEGORY_ID_BY_LABEL[raw]||'';
}
function categoryLabelFor(value=''){
  const raw=String(value||'').trim();
  return CATEGORY_LABEL_BY_ID[raw]||raw;
}
const CATEGORY_SINGULAR={Tops:'Top',Bottoms:'Bottom',Dresses:'Dress',Outerwear:'Outerwear',Shoes:'Shoe',Accessories:'Accessory',Misc:'Misc item'};
function displayItemType(itemOrCategory,typeValue=''){
  const item=(itemOrCategory&&typeof itemOrCategory==='object')?itemOrCategory:null;
  const category=item?String(item.category||''):String(itemOrCategory||'');
  const type=item?String(item.type||''):String(typeValue||'');
  if(type.trim().toLowerCase()==='other')return `Other ${CATEGORY_SINGULAR[category]||category||'Item'}`;
  return type||category||'Clothing item';
}
function migrateCatalogTaxonomy(){
  state.settings=state.settings||{};
  let changed=false;
  const fromVersion=Number(state.settings.catalogTaxonomyVersion||1);
  state.items=Array.isArray(state.items)?state.items:[];
  state.items.forEach(item=>{
    // v2 promotes the legacy Misc > Dress classification into its own top-level category.
    if(item.category==='Misc'&&String(item.type||'').trim().toLowerCase()==='dress'){
      item.category='Dresses';
      item.categoryId='dresses';
      item.type='Other';
      changed=true;
    }
    const label=categoryLabelFor(item.categoryId||item.category);
    const categoryId=categoryIdFor(label);
    if(categoryId){
      if(item.category!==label){item.category=label;changed=true}
      if(item.categoryId!==categoryId){item.categoryId=categoryId;changed=true}
    }
  });
  if(fromVersion<CATALOG_TAXONOMY_VERSION){state.settings.catalogTaxonomyVersion=CATALOG_TAXONOMY_VERSION;changed=true}
  return changed;
}


function normalizeShoppingSession(session={}){
  const createdAt=Number(session.createdAt||session.created)||Date.now();
  return {
    ...session,
    id:String(session.id||id()),
    name:String(session.name||'').trim()||'Shopping session',
    date:String(session.date||localTodayISO()),
    store:String(session.store||''),
    location:String(session.location||''),
    tripId:String(session.tripId||''),
    status:session.status==='closed'?'closed':'active',
    createdAt,
    updatedAt:Number(session.updatedAt||createdAt)
  };
}
function shoppingSessionById(sessionId=''){return (state.shoppingSessions||[]).find(s=>s.id===sessionId)||null}
function shoppingSessionLabel(session){if(!session)return '';const parts=[session.name,session.store].filter(Boolean);return parts.join(' · ')}
function migrateShoppingSessions(){
  state.shoppingSessions=Array.isArray(state.shoppingSessions)?state.shoppingSessions:[];
  let changed=false;
  state.shoppingSessions=state.shoppingSessions.map(session=>{const next=normalizeShoppingSession(session);if(JSON.stringify(next)!==JSON.stringify(session))changed=true;return next});
  const valid=new Set(state.shoppingSessions.map(s=>s.id));
  (state.wishlist||[]).forEach(w=>{if(w.shoppingSessionId&&!valid.has(w.shoppingSessionId)){w.shoppingSessionId='';changed=true}});
  return changed;
}

// Wishlist items share the garment foundation with Closet pieces while retaining
// shopping-specific fields. Legacy UI aliases (price/link/created) are preserved
// during this transition so the current Wishlist experience remains unchanged.
function normalizeWishlistItem(w={}){
  const category=categoryLabelFor(w.categoryId||w.category||'Tops')||'Tops';
  const categoryId=categoryIdFor(category);
  const createdAt=Number(w.createdAt||w.created)||Date.now();
  const wishlistPrice=w.wishlistPrice!==undefined?w.wishlistPrice:(w.price||'');
  const productUrl=w.productUrl!==undefined?w.productUrl:(w.link||'');
  return {
    ...w,
    id:w.id||id(),
    lifecycle:'wishlist',
    wishlistStatus:['active','dismissed','purchased'].includes(w.wishlistStatus)?w.wishlistStatus:'active',
    dismissedAt:Number(w.dismissedAt||0)||null,
    purchasedAt:String(w.purchasedAt||''),
    purchasePrice:w.purchasePrice!==undefined?w.purchasePrice:'',
    purchaseCurrency:w.purchaseCurrency||w.currency||'USD',
    wishlistPreviousOrderIndex:(w.wishlistPreviousOrderIndex===null||w.wishlistPreviousOrderIndex===undefined||w.wishlistPreviousOrderIndex==='')?null:(Number.isInteger(Number(w.wishlistPreviousOrderIndex))?Number(w.wishlistPreviousOrderIndex):null),
    name:String(w.name||''),
    category,
    categoryId,
    type:String(w.type||''),
    brand:String(w.brand||''),
    size:String(w.size||''),
    sizeRaw:String(w.sizeRaw||''),
    sizeVariant:String(w.sizeVariant||''),
    style:String(w.style||''),
    color:String(w.color||''),
    pattern:String(w.pattern||''),
    season:String(w.season||''),
    notes:String(w.notes||''),
    photo:w.photo||'',
    wishlistPrice,
    currency:w.currency||'USD',
    store:String(w.store||''),
    productUrl,
    wishlistDesire:(()=>{const d=Number(w.wishlistDesire);return d>=1?Math.min(4,Math.round(d)):null})(),
    inputSource:w.inputSource||'manual',
    captureAssets:Array.isArray(w.captureAssets)?w.captureAssets.map(a=>({role:String(a?.role||''),image:a?.image||'',imageRef:String(a?.imageRef||''),createdAt:Number(a?.createdAt||createdAt)})).filter(a=>a.role&&(a.image||a.imageRef)):[],
    scanData:(w.scanData&&typeof w.scanData==='object')?w.scanData:{},
    sourceMetadata:(w.sourceMetadata&&typeof w.sourceMetadata==='object')?w.sourceMetadata:{},
    barcode:String(w.barcode||''),
    sku:String(w.sku||''),
    retailerProductId:String(w.retailerProductId||''),
    referencePhoto:w.referencePhoto||'',
    shoppingSessionId:String(w.shoppingSessionId||''),
    createdAt,
    updatedAt:Number(w.updatedAt||createdAt),
    wishlistModelVersion:WISHLIST_MODEL_VERSION,
    // Transitional aliases used by the current Wishlist UI and older backups.
    price:wishlistPrice,
    link:productUrl,
    created:createdAt
  };
}
function migrateWishlistModel(){
  state.settings=state.settings||{};
  state.wishlist=Array.isArray(state.wishlist)?state.wishlist:[];
  let changed=migrateShoppingSessions();
  state.wishlist=state.wishlist.map(w=>{
    const next=normalizeWishlistItem(w);
    if(JSON.stringify(next)!==JSON.stringify(w))changed=true;
    return next;
  });
  if(Number(state.settings.wishlistModelVersion||0)<WISHLIST_MODEL_VERSION){
    state.settings.wishlistModelVersion=WISHLIST_MODEL_VERSION;
    changed=true;
  }
  return changed;
}
function ensureSettings(){
  state.settings=state.settings||{};
  if(!state.settings.appName)state.settings.appName=DEFAULT_APP_NAME;
  if(!Array.isArray(state.settings.portfolioFolders)||!state.settings.portfolioFolders.length)state.settings.portfolioFolders=[...DEFAULT_PORTFOLIO_FOLDERS];
  state.settings.portfolioFolders=[...new Set(state.settings.portfolioFolders.map(x=>String(x||'').trim()).filter(Boolean))].slice(0,12);
  if(!state.settings.portfolioFolders.length)state.settings.portfolioFolders=['Everyday'];
  const validPortfolioTabs=[...SYSTEM_PORTFOLIO_TABS,...state.settings.portfolioFolders];
  const savedTabOrder=Array.isArray(state.settings.portfolioTabOrder)?state.settings.portfolioTabOrder:[];
  state.settings.portfolioTabOrder=[...savedTabOrder.filter(x=>validPortfolioTabs.includes(x)),...validPortfolioTabs.filter(x=>!savedTabOrder.includes(x))];
  state.settings.boardRecent=state.settings.boardRecent||{closet:[],wishlist:[]};
  state.settings.boardRecent.closet=Array.isArray(state.settings.boardRecent.closet)?state.settings.boardRecent.closet:[];
  state.settings.boardRecent.wishlist=Array.isArray(state.settings.boardRecent.wishlist)?state.settings.boardRecent.wishlist:[];
  state.settings.closetOrder=state.settings.closetOrder&&typeof state.settings.closetOrder==='object'?state.settings.closetOrder:{};
  state.settings.portfolioOrder=state.settings.portfolioOrder&&typeof state.settings.portfolioOrder==='object'?state.settings.portfolioOrder:{};
  const savedJournalOrder=Array.isArray(state.settings.journalSectionOrder)?state.settings.journalSectionOrder:[];
  state.settings.journalSectionOrder=[...savedJournalOrder.filter(x=>JOURNAL_SECTION_ORDER.includes(x)),...JOURNAL_SECTION_ORDER.filter(x=>!savedJournalOrder.includes(x))];
  const wishlistIds=(state.wishlist||[]).map(w=>w.id).filter(Boolean);
  const savedWishlistOrder=Array.isArray(state.settings.wishlistOrder)?state.settings.wishlistOrder:[];
  const validWishlistIds=new Set(wishlistIds),seenWishlistOrder=new Set();
  state.settings.wishlistOrder=[...savedWishlistOrder.filter(id=>validWishlistIds.has(id)&&!seenWishlistOrder.has(id)&&(seenWishlistOrder.add(id),true)),...wishlistIds.filter(id=>!seenWishlistOrder.has(id)&&(seenWishlistOrder.add(id),true))];
  state.settings.brandSuggestions=Array.isArray(state.settings.brandSuggestions)?state.settings.brandSuggestions:[];
  const brandMap=new Map();
  const rememberSeed=(name,count=1,lastUsed=0)=>{name=String(name||'').trim();if(!name)return;const key=name.toLocaleLowerCase();const prev=brandMap.get(key);if(!prev)brandMap.set(key,{name,count:Math.max(1,Number(count)||1),lastUsed:Number(lastUsed)||0});else{prev.count=Math.max(prev.count,Number(count)||1);prev.lastUsed=Math.max(prev.lastUsed,Number(lastUsed)||0)}};
  state.settings.brandSuggestions.forEach(b=>typeof b==='string'?rememberSeed(b):rememberSeed(b?.name,b?.count,b?.lastUsed));
  (state.items||[]).forEach(i=>rememberSeed(i.brand,1,i.created||0));
  (state.wishlist||[]).forEach(w=>rememberSeed(w.brand,1,w.updatedAt||w.createdAt||w.created||0));
  state.settings.brandSuggestions=[...brandMap.values()].sort((a,b)=>(b.lastUsed-a.lastUsed)||(b.count-a.count)||a.name.localeCompare(b.name)).slice(0,150);
  state.settings.storeSuggestions=Array.isArray(state.settings.storeSuggestions)?state.settings.storeSuggestions:[];
  const storeMap=new Map();
  const rememberStoreSeed=(name,count=1,lastUsed=0)=>{name=String(name||'').trim();if(!name)return;const key=name.toLocaleLowerCase();const prev=storeMap.get(key);if(!prev)storeMap.set(key,{name,count:Math.max(1,Number(count)||1),lastUsed:Number(lastUsed)||0});else{prev.count=Math.max(prev.count,Number(count)||1);prev.lastUsed=Math.max(prev.lastUsed,Number(lastUsed)||0)}};
  state.settings.storeSuggestions.forEach(x=>typeof x==='string'?rememberStoreSeed(x):rememberStoreSeed(x?.name,x?.count,x?.lastUsed));
  (state.wishlist||[]).forEach(w=>rememberStoreSeed(w.store,1,w.updatedAt||w.createdAt||w.created||0));
  (state.shoppingSessions||[]).forEach(session=>rememberStoreSeed(session.store,1,session.updatedAt||session.createdAt||0));
  state.settings.storeSuggestions=[...storeMap.values()].sort((a,b)=>(b.lastUsed-a.lastUsed)||(b.count-a.count)||a.name.localeCompare(b.name)).slice(0,150);
  const validShoppingSessionIds=new Set((state.shoppingSessions||[]).map(s=>s.id));
  if(!validShoppingSessionIds.has(state.settings.activeShoppingSessionId))state.settings.activeShoppingSessionId='';
  const outfitIds=new Set((state.outfits||[]).map(o=>o.id).filter(Boolean));
  (state.outfits||[]).forEach(o=>{if(!o.id)o.id=id()});
  state.settings.portfolioFolders.forEach(folder=>{
    const ids=(state.outfits||[]).filter(o=>(o.folder||'Everyday')===folder).map(o=>o.id);
    const saved=Array.isArray(state.settings.portfolioOrder[folder])?state.settings.portfolioOrder[folder]:[];
    state.settings.portfolioOrder[folder]=[...saved.filter(x=>ids.includes(x)),...ids.filter(x=>!saved.includes(x))];
  });
  Object.keys(state.settings.portfolioOrder).forEach(folder=>{if(!state.settings.portfolioFolders.includes(folder))delete state.settings.portfolioOrder[folder]});
  CATEGORIES.forEach(cat=>{
    const ids=state.items.filter(i=>i.category===cat).map(i=>i.id);
    const saved=Array.isArray(state.settings.closetOrder[cat])?state.settings.closetOrder[cat]:[];
    state.settings.closetOrder[cat]=[...saved.filter(x=>ids.includes(x)),...ids.filter(x=>!saved.includes(x))];
  });
}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function loadState(){
  try{
    const db=await openDB();
    const saved=await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
    if(saved)return {...emptyState(),...saved};
    const legacy=localStorage.getItem(STORE_KEY);
    if(legacy){const migrated={...emptyState(),...JSON.parse(legacy)};await persistState(migrated);localStorage.removeItem(STORE_KEY);return migrated}
  }catch(e){console.warn('IndexedDB load failed',e);try{return {...emptyState(),...JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}}catch{}}
  return emptyState();
}
async function persistState(value=state){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function saveState(){
  try{await persistState(state);renderAll();return true}
  catch(e){console.error('Save failed',e);toast('Could not save. Try closing other tabs or export a backup.');return false}
}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
let toastTimer=null;function toast(msg,duration=1800){const t=$('#toast');if(!t)return;clearTimeout(toastTimer);t.textContent=msg;t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),duration)}
function $(q){return document.querySelector(q)}
function $$(q){return [...document.querySelectorAll(q)]}
function seasonForDate(d=new Date()){const m=d.getMonth()+1;if([12,1,2].includes(m))return'Winter';if([3,4,5].includes(m))return'Spring';if([6,7,8].includes(m))return'Summer';return'Fall'}
function colorHex(name){const map={Black:'#262626',White:'#faf9f4',Cream:'#f1e7c9',Gray:'#8a8984',Brown:'#7a5744',Coffee:'#6c5142',Tan:'#b79876',Beige:'#d9c7a6',Burgundy:'#7d3547',Red:'#b84b46',Orange:'#d37c3f',Yellow:'#d7bb4e',Mustard:'#c3a04b',Olive:'#66715a',Green:'#4d7851',Mint:'#9cc5ab',Turquoise:'#4d8e8a',Blue:'#527aa7',Navy:'#34455f',Purple:'#79618c',Pink:'#c7788b',Multicolor:'#ad7b6a'};return map[name]||'#a39a89'}
function isArchived(item){return item?.status==='archived'}

async function init(){
  state=await loadState();
  const taxonomyChanged=migrateCatalogTaxonomy();
  const wishlistModelChanged=migrateWishlistModel();
  ensureSettings();
  if(taxonomyChanged||wishlistModelChanged){try{await persistState(state)}catch(e){console.warn('Startup data migration could not be persisted yet',e)}}
  renderStudioBackgroundPalette();applyLocalizedStrings();
  fillSelects(); bindNav(); bindDialogs(); bindBoard(); bindPhotoStudio();
  $('#catalogSearch').addEventListener('input',()=>{updateCatalogSearchClear();renderCatalog()});
  $('#clearCatalogSearchBtn').onclick=()=>{const search=$('#catalogSearch');search.value='';updateCatalogSearchClear();renderCatalog();search.focus()};
  $('#filterBtn').onclick=()=>$('#filterPanel').classList.toggle('hidden');
  $('#clearFilters').onclick=()=>{selectedCategory='';$('#catalogSearch').value='';$('#filterCategory').value='';$('#filterSeason').value='';$('#filterColor').value='';updateCatalogSearchClear();renderCatalog();renderCategories()};
  ['filterCategory','filterSeason','filterColor'].forEach(x=>$('#'+x).addEventListener('change',renderCatalog));
  $('#includeArchivedCloset').checked=includeArchivedCloset;
  $('#includeArchivedCloset').addEventListener('change',e=>{includeArchivedCloset=!!e.target.checked;localStorage.setItem('audreyIncludeArchivedCloset',includeArchivedCloset?'true':'false');renderCategories();renderCatalog()});
  $('#exportBtn').onclick=exportData;$('#importFile').onchange=importData;$('#resetBtn').onclick=resetData;
  $('#saveAppNameBtn').onclick=saveAppName;$('#resetAppNameBtn').onclick=resetAppName;
  $('#settingsBtn').onclick=()=>{renderPortfolioFolderEditor();renderJournalOrderEditor();showScreen('more')};
  $('#addPortfolioFolderBtn').onclick=addPortfolioFolder;
  $('#portfolioNewBtn').onclick=()=>guardBoardSwitch(()=>{startNewOutfit();showScreen('outfits')},'start a new look');  $('#portfolioSearch').oninput=e=>{portfolioSearchQuery=e.target.value||'';renderSavedOutfits()};$('#portfolioSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur()}});$('#portfolioItemFilterBtn').onclick=()=>{portfolioItemPickerOpen=!portfolioItemPickerOpen;renderPortfolioDiscovery()};
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=13.15',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
  renderAll();
}
function fillSelects(){
  const catOpts=CATEGORIES.map(c=>`<option>${c}</option>`).join('');
  $('#itemCategory').innerHTML=catOpts;$('#wishCategory').innerHTML=catOpts;
  $('#filterCategory').innerHTML='<option value="">All categories</option>'+catOpts;
  $('#itemAcquired').innerHTML=ACQUIRED.map(a=>`<option>${a}</option>`).join('');
  const colorOpts='<option value="">Not set</option>'+COLORS.map(c=>`<option>${c}</option>`).join('');
  $('#itemColor').innerHTML=colorOpts;$('#wishColor').innerHTML=colorOpts;
  $('#filterColor').innerHTML='<option value="">All colors</option>'+COLORS.map(c=>`<option>${c}</option>`).join('');
  $('#wishPattern').innerHTML='<option value="">Not set</option>'+PATTERNS.map(x=>`<option>${x}</option>`).join('');
  $('#wishSeason').innerHTML='<option value="">Not set</option>'+SEASONS.map(x=>`<option>${x}</option>`).join('');
  populateTypeOptions('Tops');populateSizeOptions('Tops');populateWishTypeOptions('Tops');populateWishSizeOptions('Tops');setWishAttributeContext('Tops',$('#wishType').value);
  $('#itemCategory').addEventListener('change',()=>{stashItemContextAttributes();populateTypeOptions($('#itemCategory').value);populateSizeOptions($('#itemCategory').value);setItemAttributeContext($('#itemCategory').value,$('#itemType').value);updateItemReviewSummary()});
  $('#itemType').addEventListener('change',()=>{stashItemContextAttributes();setItemAttributeContext($('#itemCategory').value,$('#itemType').value);updateItemReviewSummary()});
  $('#wishCategory').addEventListener('change',()=>{stashWishContextAttributes();populateWishTypeOptions($('#wishCategory').value);populateWishSizeOptions($('#wishCategory').value);setWishAttributeContext($('#wishCategory').value,$('#wishType').value)});
  $('#wishType').addEventListener('change',()=>{stashWishContextAttributes();setWishAttributeContext($('#wishCategory').value,$('#wishType').value)});
}
function populateTypeOptions(category,selected=''){const opts=[...(TYPES[category]||['Other'])];if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemType').innerHTML=opts.map(v=>`<option${v===selected?' selected':''}>${esc(v)}</option>`).join('')}
function sizesForCategory(category){if(category==='Shoes')return [...SHOE_SIZES];if(category==='Accessories')return [...ACCESSORY_SIZES];if(category==='Bottoms')return [...BOTTOM_SIZES];return [...CLOTHING_SIZES]}
function populateSizeOptions(category,selected=''){const opts=sizesForCategory(category);if(selected&&!opts.includes(selected))opts.unshift(selected);$('#itemSize').innerHTML=opts.map(v=>`<option value="${v==='Not set'?'':esc(v)}"${v===selected||(!selected&&v==='Not set')?' selected':''}>${esc(v)}</option>`).join('')}
function populateWishTypeOptions(category,selected=''){const opts=[...(TYPES[category]||['Other'])];if(selected&&!opts.includes(selected))opts.unshift(selected);$('#wishType').innerHTML=opts.map(v=>`<option${v===selected?' selected':''}>${esc(v)}</option>`).join('')}
function populateWishSizeOptions(category,selected=''){const opts=sizesForCategory(category);if(selected&&!opts.includes(selected))opts.unshift(selected);$('#wishSize').innerHTML=opts.map(v=>`<option value="${v==='Not set'?'':esc(v)}"${v===selected||(!selected&&v==='Not set')?' selected':''}>${esc(v)}</option>`).join('')}
function stashWishContextAttributes(){if(!wishAttributeContextKey)return;const splitAt=wishAttributeContextKey.indexOf('|'),category=splitAt>=0?wishAttributeContextKey.slice(0,splitAt):wishAttributeContextKey;wishFitDrafts[category]=$('#wishFit')?.value||'';wishStyleDrafts[wishAttributeContextKey]=$('#wishStyle')?.value||''}
function setWishAttributeContext(category,type,seed=null){const key=itemContextKey(category,type),fits=validFitOptions(category),styles=validStyleOptions(category,type);const fitDraft=Object.prototype.hasOwnProperty.call(wishFitDrafts,category)?wishFitDrafts[category]:(seed?.fit||'');const styleDraft=Object.prototype.hasOwnProperty.call(wishStyleDrafts,key)?wishStyleDrafts[key]:(seed?.style||'');fillContextAttributeSelect($('#wishFit'),fits,fitDraft);fillContextAttributeSelect($('#wishStyle'),styles,styleDraft);$('#wishFitLabel').classList.toggle('hidden',!fits.length);$('#wishStyleLabel').classList.toggle('hidden',!styles.length);wishAttributeContextKey=key}
function itemContextKey(category,type){return `${category||''}|${type||''}`}
function validFitOptions(category){return FIT_OPTIONS[category]||[]}
function validStyleOptions(category,type){return STYLE_OPTIONS[itemContextKey(category,type)]||[]}
function stashItemContextAttributes(){
  if(!itemAttributeContextKey)return;
  const splitAt=itemAttributeContextKey.indexOf('|'),category=splitAt>=0?itemAttributeContextKey.slice(0,splitAt):itemAttributeContextKey;
  itemFitDrafts[category]=$('#itemFit')?.value||'';
  itemStyleDrafts[itemAttributeContextKey]=$('#itemStyle')?.value||'';
}
function fillContextAttributeSelect(select,options,selected=''){
  select.innerHTML='<option value="">Not set</option>'+options.map(v=>`<option${v===selected?' selected':''}>${esc(v)}</option>`).join('');
  select.value=options.includes(selected)?selected:'';
}
function setItemAttributeContext(category,type,seed=null){
  const key=itemContextKey(category,type),fits=validFitOptions(category),styles=validStyleOptions(category,type);
  const fitDraft=Object.prototype.hasOwnProperty.call(itemFitDrafts,category)?itemFitDrafts[category]:(seed?.fit||'');
  const styleDraft=Object.prototype.hasOwnProperty.call(itemStyleDrafts,key)?itemStyleDrafts[key]:(seed?.style||'');
  fillContextAttributeSelect($('#itemFit'),fits,fitDraft);
  fillContextAttributeSelect($('#itemStyle'),styles,styleDraft);
  $('#itemFitLabel').classList.toggle('hidden',!fits.length);
  $('#itemStyleLabel').classList.toggle('hidden',!styles.length);
  itemAttributeContextKey=key;
}
function cleanedItemFit(category,value){return validFitOptions(category).includes(value)?value:''}
function cleanedItemStyle(category,type,value){return validStyleOptions(category,type).includes(value)?value:''}
function bindNav(){
  $$('.bottom-nav button').forEach(b=>b.onclick=()=>showScreen(b.dataset.nav));
  ['addItemBtn','emptyAddBtn','quickAddBtn'].forEach(x=>$('#'+x).onclick=()=>openItem(null, selectedCategory||$('#filterCategory').value||''));
  $('#addWishBtn').onclick=()=>openWish();
  $('#quickCaptureWishBtn').onclick=openQuickCapture;
  $('#wishlistAllBtn').onclick=()=>setWishlistView('all');
  $('#wishlistTop10Btn').onclick=()=>setWishlistView('top10');
  $('#wishlistRemovedBtn').onclick=()=>setWishlistView('removed');
  $('#wishlistReorderBtn').onclick=toggleWishlistReorderMode;
  $('#wishlistSessionsBtn').onclick=openShoppingSessionsDialog;
  $('#logWearBtn').onclick=()=>openWear();
}
function showScreen(name){$$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));scrollTo({top:0,behavior:'smooth'});if(name==='journal')renderJournal();if(name==='outfits')renderOutfits();if(name==='portfolio')renderSavedOutfits();if(name==='more'){renderPortfolioFolderEditor();renderJournalOrderEditor()}}

function bindDialogs(){
  $('#itemPhoto').onchange=e=>handleItemPhotoSelection(e,'camera');
  $('#itemPhotoLibrary').onchange=e=>handleItemPhotoSelection(e,'library');
  $('#reviewItemPhoto').onchange=e=>handleItemPhotoSelection(e,'camera');
  $('#reviewItemPhotoLibrary').onchange=e=>handleItemPhotoSelection(e,'library');
  ['itemPhoto','itemPhotoLibrary','reviewItemPhoto','reviewItemPhotoLibrary'].forEach(inputId=>{const input=$('#'+inputId);input.addEventListener('click',()=>{if(itemDialogMode==='review')enterItemEditMode();itemPhotoPickerActive=true;closeReviewPhotoMenu();ensureItemDialogVisible();document.body.classList.add('item-photo-picker-active')})});
  const restoreAfterPhotoPicker=()=>{if(!itemPhotoPickerActive)return;[80,260,650].forEach(ms=>setTimeout(restoreItemDialogAfterPicker,ms))};
  window.addEventListener('focus',restoreAfterPhotoPicker);
  window.addEventListener('pageshow',restoreAfterPhotoPicker);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restoreAfterPhotoPicker()});
  $('#photoStudioBtn').onclick=()=>openPhotoStudio();
  $('#restoreOriginalPhotoBtn').onclick=()=>restoreCapturedOriginal(false);
  $('#reviewStudioBtn').onclick=()=>{if(itemDialogMode==='review')enterItemEditMode();closeReviewPhotoMenu();openPhotoStudio()};
  $('#reviewRestoreOriginalBtn').onclick=()=>{if(itemDialogMode==='review')enterItemEditMode();closeReviewPhotoMenu();restoreCapturedOriginal(false)};
  $('#reviewPhotoMenuBtn').onclick=e=>{e.stopPropagation();toggleReviewPhotoMenu()};
  $('#smartScanIconBtn').onclick=()=>{if(itemDialogMode==='review')enterItemEditMode();smartScan()};
  $('#closeSmartScanReviewBtn').onclick=closeSmartScanReview;
  $('#cancelSmartScanReviewBtn').onclick=closeSmartScanReview;
  $('#applySmartScanReviewBtn').onclick=applyPendingSmartScan;
  $('#smartScanReviewDialog').addEventListener('cancel',e=>{e.preventDefault();closeSmartScanReview()});
  $('#itemForm').onsubmit=e=>{e.preventDefault();if(itemDialogMode==='review')enterItemEditMode();else saveItem()};
  $('#cancelItemBtn').onclick=()=>{if(itemDialogMode==='edit'&&$('#itemId').value)cancelItemEditToReview();else closeItemWithoutSaving()};
  $('#closeItemDialogBtn').onclick=closeItemWithoutSaving;
  $('#itemDialog').addEventListener('cancel',e=>{e.preventDefault();if(itemPhotoPickerActive){restoreItemDialogAfterPicker();return}closeItemWithoutSaving()});
  $('#itemDialog').addEventListener('close',()=>{if(itemPhotoPickerActive){[60,180,420].forEach(ms=>setTimeout(restoreItemDialogAfterPicker,ms));return}unlockPageForItemDialog()});
  document.addEventListener('click',e=>{if(!e.target.closest('#reviewPhotoMenuWrap'))closeReviewPhotoMenu()});
  ['itemCategory','itemType','itemBrand','itemColor'].forEach(id=>$('#'+id).addEventListener('input',updateItemReviewSummary));
  bindBrandSuggestions();
  bindWishlistEntrySuggestions();
  $('#deleteItemBtn').onclick=toggleItemArchived;
  $('#permanentDeleteItemBtn').onclick=permanentDeleteItem;
  bindItemSwipe();
  ['wishPhoto','wishPhotoLibrary','wishCameraPhoto','wishLibraryPhoto'].forEach(inputId=>{const input=$('#'+inputId);if(!input)return;input.onchange=e=>handleWishPhotoSelection(e,(inputId==='wishPhoto'||inputId==='wishCameraPhoto')?'camera':'library');});
  $('#wishPhotoMenuBtn').onclick=e=>{e.stopPropagation();$('#wishPhotoMenu').classList.toggle('hidden')};
  document.addEventListener('click',e=>{if(!e.target.closest('#wishPhotoMenuWrap'))$('#wishPhotoMenu')?.classList.add('hidden')});
  $('#wishStudioBtn').onclick=()=>{if(wishDialogMode==='review')enterWishEditMode();$('#wishPhotoMenu').classList.add('hidden');openPhotoStudio('wish')};
  $('#wishRestoreOriginalBtn').onclick=()=>{if(wishDialogMode==='review')enterWishEditMode();$('#wishPhotoMenu').classList.add('hidden');restoreWishCapturedOriginal()};
  $('#wishSmartScanBtn').onclick=()=>{if(wishDialogMode==='review')enterWishEditMode();smartScan('wish')};
  ['quickCaptureItemPhoto','quickCaptureLabelPhoto','quickCapturePricePhoto'].forEach(inputId=>{const input=$('#'+inputId);if(input){input.onchange=e=>handleQuickCapturePhoto(e,inputId);input.addEventListener('click',()=>{quickCapturePickerActive=true;quickCapturePickerStartedAt=Date.now();document.body.classList.add('quick-capture-picker-active')})}});
  $('#quickCaptureAnalyzeBtn').onclick=analyzeQuickCapture;
  $('#quickCaptureCancelBtn').onclick=closeQuickCapture;
  $('#closeQuickCaptureBtn').onclick=closeQuickCapture;
  $('#quickCaptureDialog').addEventListener('cancel',e=>{e.preventDefault();closeQuickCapture()});
  $('#quickCaptureDialog').addEventListener('close',()=>{if(quickCaptureSessionActive&&quickCapturePickerActive)restoreAfterQuickCapturePicker()});
  $('#quickCaptureReviewCancelBtn').onclick=closeQuickCaptureReview;
  $('#closeQuickCaptureReviewBtn').onclick=closeQuickCaptureReview;
  $('#quickCaptureApplyBtn').onclick=applyQuickCaptureSuggestions;
  $('#quickCaptureReviewDialog').addEventListener('cancel',e=>{e.preventDefault();closeQuickCaptureReview()});
  window.addEventListener('pageshow',restoreAfterQuickCapturePicker);
  window.addEventListener('focus',restoreAfterQuickCapturePicker);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restoreAfterQuickCapturePicker()});
  $('#wishForm').onsubmit=e=>{e.preventDefault();if(wishDialogMode==='review')enterWishEditMode();else saveWish()};
  $('#closeWishDialogBtn').onclick=closeWishWithoutSaving;
  $('#cancelWishBtn').onclick=()=>{if(wishDialogMode==='edit'&&$('#wishId').value)cancelWishEditToReview();else closeWishWithoutSaving()};
  $('#wishDialog').addEventListener('cancel',e=>{e.preventDefault();if(wishDialogMode==='edit'&&$('#wishId').value)cancelWishEditToReview();else closeWishWithoutSaving()});
  $('#wishDialog').addEventListener('close',restoreWishlistViewport);
  $('#deleteWishBtn').onclick=deleteWish;
  $('#purchaseWishBtn').onclick=openPurchaseWish;
  $('#wishShoppingSession').addEventListener('change',()=>{const session=shoppingSessionById($('#wishShoppingSession').value);if(session&&session.store&&!$('#wishStore').value.trim())$('#wishStore').value=session.store});
  $('#newShoppingSessionFromWishBtn').onclick=()=>openShoppingSessionsDialog(true);
  $('#closeShoppingSessionsBtn').onclick=closeShoppingSessionsDialog;
  $('#returnToWishlistBtn').onclick=closeShoppingSessionsDialog;
  $('#clearWishlistSessionBtn').onclick=clearActiveShoppingSession;
  $('#shoppingSessionForm').onsubmit=e=>{e.preventDefault();saveShoppingSession()};
  bindShoppingSessionStoreSuggestions();
  $('#shoppingSessionsDialog').addEventListener('cancel',e=>{e.preventDefault();closeShoppingSessionsDialog()});
  $('#shoppingSessionsDialog').addEventListener('close',unlockPageForShoppingSessions);
  $('#cancelShoppingSessionEditBtn').onclick=resetShoppingSessionForm;
  $('#purchaseWishForm').onsubmit=e=>{e.preventDefault();completeWishPurchase()};
  $('#purchaseWishAcquired').onchange=updatePurchaseWishPriceVisibility;
  $('#cancelPurchaseWishBtn').onclick=()=>$('#purchaseWishDialog').close();
  $('#closePurchaseWishBtn').onclick=()=>$('#purchaseWishDialog').close();
  $('#purchaseWishDialog').addEventListener('cancel',e=>{e.preventDefault();$('#purchaseWishDialog').close()});
  $('#closeAcquisitionMomentBtn').onclick=closeAcquisitionMoment;
  $('#acquisitionMomentContinueBtn').onclick=closeAcquisitionMoment;
  $('#acquisitionMomentViewBtn').onclick=viewAcquiredPiece;
  $('#acquisitionMomentDialog').addEventListener('cancel',e=>{e.preventDefault();closeAcquisitionMoment()});
  $('#wishDialog').addEventListener('click',e=>{const heart=e.target.closest('[data-wish-desire]');if(!heart)return;e.preventDefault();e.stopPropagation();setWishDesire(heart.dataset.wishDesire)});
  $('#wearForm').onsubmit=e=>{e.preventDefault();saveWear()};
  $('#closeWearBtn').onclick=closeWearWithoutSaving;
  $('#cancelWearBtn').onclick=closeWearWithoutSaving;
  $('#wearDialog').addEventListener('cancel',e=>{e.preventDefault();closeWearWithoutSaving()});
  $('#wearDialog').addEventListener('close',unlockPageForWearDialog);
  $('#wearDate').addEventListener('change',handleWearDateChange);
  $('#wearDateConflictOpen').onclick=()=>resolveWearDateConflict('open');
  $('#wearDateConflictReplace').onclick=()=>resolveWearDateConflict('replace');
  $('#wearDateConflictCancel').onclick=()=>resolveWearDateConflict('cancel');
  $('#clearWearSelectionBtn').onclick=()=>{wearDraftIds.clear();$$('.wear-option.selected').forEach(b=>b.classList.remove('selected'));updateWearSelectedCount()};
  $('#deleteWearBtn').onclick=deleteWearEntry;
  const journalRangeSelect=$('#journalRange');
  if(journalRangeSelect){
    journalRangeSelect.onchange=e=>handleJournalRangeFilterChange(e.target.value);
    const primeCustomRangeReselect=()=>{
      // A native <select> does not fire change when the user chooses the already-selected option.
      // Clear the transient UI selection before opening the picker so Custom range can be chosen again
      // without adding a duplicate option to the list. The persisted filter state is left untouched.
      if(journalRangeFilter==='custom'&&journalRangeSelect.value==='custom')journalRangeSelect.selectedIndex=-1;
    };
    journalRangeSelect.addEventListener('pointerdown',primeCustomRangeReselect);
    journalRangeSelect.addEventListener('touchstart',primeCustomRangeReselect,{passive:true});
    journalRangeSelect.addEventListener('mousedown',primeCustomRangeReselect);
    journalRangeSelect.addEventListener('blur',()=>{
      if(!journalRangeSelect.value)journalRangeSelect.value=journalRangeFilter;
    });
  }
  const journalCalendar=$('#journalRangeDialog');if(journalCalendar)journalCalendar.addEventListener('dblclick',e=>e.preventDefault());
  $('#journalClearFiltersBtn').onclick=clearJournalFilters;
  $('#closeJournalRangeBtn').onclick=closeJournalRangeDialog;
  $('#cancelJournalRangeBtn').onclick=closeJournalRangeDialog;
  $('#clearJournalRangeBtn').onclick=()=>{journalRangeDraftStart='';journalRangeDraftEnd='';renderJournalRangeCalendar()};
  $('#applyJournalRangeBtn').onclick=applyJournalCustomRange;
  $('#journalCalendarPrev').onclick=()=>shiftJournalCalendarMonth(-1);
  $('#journalCalendarNext').onclick=()=>shiftJournalCalendarMonth(1);
  $('#journalRangeDialog').addEventListener('cancel',e=>{e.preventDefault();closeJournalRangeDialog()});
  $('#todayJournalToggle').onclick=()=>{todayJournalExpanded=!todayJournalExpanded;localStorage.setItem('audreyTodayJournalExpanded',todayJournalExpanded?'true':'false');renderTodayJournalVisibility()};
  $('#plannedJournalToggle').onclick=()=>{plannedJournalExpanded=!plannedJournalExpanded;localStorage.setItem('audreyPlannedJournalExpanded',plannedJournalExpanded?'true':'false');renderPlannedJournalVisibility()};
  $('#wearLogToggle').onclick=()=>{wearLogExpanded=!wearLogExpanded;localStorage.setItem('audreyWearLogExpanded',wearLogExpanded?'true':'false');renderWearLogVisibility()};
  $('#wearInsightsToggle').onclick=()=>{wearInsightsExpanded=!wearInsightsExpanded;localStorage.setItem('audreyWearInsightsExpanded',wearInsightsExpanded?'true':'false');renderWearInsightsVisibility()};
  $('#closeJournalDetailBtn').onclick=closeJournalDetail;
  $('#cancelJournalDetailBtn').onclick=closeJournalDetail;
  $('#journalDetailDialog').addEventListener('cancel',e=>{e.preventDefault();closeJournalDetail()});
  $('#closeJournalItemPreviewBtn').onclick=closeJournalItemPreviewToDay;
  $('#backJournalItemPreviewBtn').onclick=closeJournalItemPreviewToDay;
  $('#journalItemPreviewDialog').addEventListener('cancel',e=>{e.preventDefault();closeJournalItemPreviewToDay()});
  $('#journalItemPreviewDialog').addEventListener('close',unlockPageForJournalItemPreview);
  $('#editJournalItemPreviewBtn').onclick=editJournalItemPreview;
  $$('#journalDetailRatingStars .journal-rating-star').forEach(btn=>btn.onclick=()=>saveJournalDetailRating(Number(btn.dataset.rating)));
  $('#journalDetailFavoriteBtn').onclick=toggleJournalDetailFavorite;
  $('#saveJournalDetailNotesBtn').onclick=saveJournalDetailNotes;
  $('#journalDetailNotesToggle').onclick=toggleJournalDetailNotes;
  $('#editJournalDetailBtn').onclick=()=>{const j=state.journal.find(x=>x.id===viewingJournalId);closeJournalDetail();if(j)openWear(j.date)};
  $('#deleteJournalDetailBtn').onclick=()=>deleteJournalEntryById(viewingJournalId,true);
  $('#closeJournalStatBtn').onclick=closeJournalStat;
  $('#journalStatDialog').addEventListener('cancel',e=>{e.preventDefault();closeJournalStat()});
  $('#journalStatDialog').addEventListener('close',unlockPageForJournalStat);
  $$('.stat-action').forEach(b=>b.onclick=()=>openJournalStat(b.dataset.stat));
  $('#deleteOutfitBtn').onclick=deleteOutfit;$('#favoriteViewedOutfitBtn').onclick=favoriteViewedOutfit;$('#editViewedOutfitBtn').onclick=editViewedOutfit;$('#duplicateViewedOutfitBtn').onclick=duplicateViewedOutfit;$('#shareViewedOutfitBtn').onclick=shareViewedOutfit;$('#closeViewedOutfitBtn').onclick=closeViewedOutfit;$('#outfitViewDialog').addEventListener('cancel',e=>{e.preventDefault();closeViewedOutfit()});$('#boardConflictSaveBtn').onclick=saveBoardBeforeSwitch;$('#boardConflictReplaceBtn').onclick=replaceBoardForSwitch;$('#boardConflictCancelBtn').onclick=cancelBoardSwitch;$('#boardConflictCloseBtn').onclick=cancelBoardSwitch;$('#closePortfolioItemPreviewBtn').onclick=closePortfolioItemPreview;$('#backPortfolioItemPreviewBtn').onclick=closePortfolioItemPreview;$('#portfolioItemPreviewDialog').addEventListener('cancel',e=>{e.preventDefault();closePortfolioItemPreview()});$('#shareChoiceCloseBtn').onclick=cancelShareChoice;$('#shareChoiceDialog').addEventListener('cancel',e=>{e.preventDefault();cancelShareChoice()});$$('.share-choice-btn').forEach(b=>b.onclick=()=>prepareOutfitShare(b.dataset.shareMode||'look'));
}
function openItem(item=null,preferredCategory='',mode='review'){
  itemReviewIds=item ? (catalogReviewIds.includes(item.id)?[...catalogReviewIds]:state.items.map(i=>i.id)) : [];
  loadItemIntoEditor(item,preferredCategory,item?mode:'create');
  if(!$('#itemDialog').open){lockPageForItemDialog();$('#itemDialog').showModal()}
}
function loadItemIntoEditor(item=null,preferredCategory='',mode='review'){
  const isExisting=!!item;
  itemDialogMode=isExisting?(mode==='edit'?'edit':'review'):'create';
  $('#itemDialog').classList.toggle('editing-existing',isExisting);
  $('#itemDialog').classList.toggle('item-review-mode',itemDialogMode==='review');
  $('#itemDialog').classList.toggle('item-edit-mode',itemDialogMode!=='review');
  $('#itemDialogTitle').textContent=isExisting?(itemDialogMode==='review'?'Piece details':'Edit piece'):'Add a piece';$('#itemId').value=item?.id||'';itemWorkingPhoto=item?.photo||'';itemOriginalPhoto=item?.originalPhoto||item?.photo||'';itemCutoutApplied=item?.photoStudioCutoutApplied ?? (!!item?.photo&&!!item?.originalPhoto&&item.photo!==item.originalPhoto);itemStudioState=item?.photoStudioState?JSON.parse(JSON.stringify(item.photoStudioState)):null;
  showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();const category=item?.category||preferredCategory||selectedCategory||$('#filterCategory').value||'Tops';$('#itemCategory').value=category;populateTypeOptions(category,item?.type||'');populateSizeOptions(category,item?.size||'');itemFitDrafts={};itemStyleDrafts={};itemAttributeContextKey='';setItemAttributeContext(category,$('#itemType').value,{fit:item?.sizeVariant||item?.fit||'',style:item?.style||''});$('#itemBrand').value=item?.brand||'';closeBrandSuggestions();$('#itemColor').value=item?.color||'';$('#itemPattern').value=item?.pattern||'Solid';$('#itemAcquired').value=item?.acquired||'Bought new';$('#itemSeason').value=item?.season||'All-season';$('#itemNotes').value=item?.notes||'';$('#scanStatus').textContent='';const archived=!!item&&isArchived(item);$('#deleteItemBtn').classList.toggle('hidden',!item);$('#deleteItemBtn').textContent=archived?'Reactivate':'Remove from Closet';$('#deleteItemBtn').classList.toggle('reactivate-item',archived);$('#permanentDeleteItemBtn').classList.toggle('hidden',!item);$('#itemArchiveNotice').classList.toggle('hidden',!archived);$('#itemPhoto').value='';$('#itemPhotoLibrary').value='';
  $('#itemCardUtilityActions').classList.toggle('hidden',!isExisting&&!itemWorkingPhoto);$('#reviewPhotoMenuWrap').classList.toggle('hidden',!isExisting&&!itemWorkingPhoto);$('#smartScanIconBtn').classList.toggle('hidden',!itemWorkingPhoto);closeReviewPhotoMenu();updateReviewPhotoMenuState();updatePhotoToolAvailability();
  $('#itemReviewSummary').classList.toggle('hidden',!isExisting);$('#itemSwipeHint').classList.add('hidden');updateItemReviewSummary();applyItemDialogMode(item);updateItemSwipeArrows();
  if($('#itemDialog').open){const scroller=$('#itemDialog .item-detail-scroll');if(scroller)scroller.scrollTop=0;else $('#itemDialog').scrollTop=0;}
}
function itemReviewValue(value,fallback='Not set'){const v=String(value||'').trim();return v||fallback}
function renderItemReviewDetails(item){
  const box=$('#itemReviewDetails');if(!box)return;
  const category=$('#itemCategory').value,type=displayItemType(category,$('#itemType').value);
  const rows=[['Category',category],['Type',type],['Brand',$('#itemBrand').value],['Size',$('#itemSize').value]];
  if($('#itemFit').value)rows.push(['Fit',$('#itemFit').value]);
  if($('#itemStyle').value)rows.push(['Style',$('#itemStyle').value]);
  rows.push(['Color',$('#itemColor').value],['Pattern',$('#itemPattern').value],['Acquired',$('#itemAcquired').value],['Season',$('#itemSeason').value]);
  box.innerHTML=`<div class="item-review-detail-grid">${rows.map(([k,v])=>`<div class="item-review-detail-row"><span>${esc(k)}</span><strong>${esc(itemReviewValue(v))}</strong></div>`).join('')}</div>${String($('#itemNotes').value||'').trim()?`<div class="item-review-notes"><span>Notes</span><p>${esc($('#itemNotes').value.trim())}</p></div>`:''}`;
}
function applyItemDialogMode(item=null){
  const reviewing=itemDialogMode==='review',existing=!!$('#itemId').value;
  $('#itemReviewDetails').classList.toggle('hidden',!reviewing);
  $('#itemEditFields').classList.toggle('hidden',reviewing);
  $('#newPiecePhotoActions').classList.toggle('hidden',existing||!!itemWorkingPhoto);
  $('#saveItemBtn').textContent=reviewing?'Edit piece':'Save piece';
  $('#cancelItemBtn').textContent=reviewing?'Close':'Cancel';
  $('#deleteItemBtn').classList.toggle('hidden',!existing);
  $('#permanentDeleteItemBtn').classList.toggle('hidden',reviewing||!existing);
  if(reviewing)renderItemReviewDetails(item);
}
function enterItemEditMode(){
  if(itemDialogMode!=='review')return;itemDialogMode='edit';
  $('#itemDialog').classList.remove('item-review-mode');$('#itemDialog').classList.add('item-edit-mode');$('#itemDialogTitle').textContent='Edit piece';applyItemDialogMode();updateItemSwipeArrows();
}
function cancelItemEditToReview(){
  const iid=$('#itemId').value,live=state.items.find(x=>x.id===iid);if(!live){closeItemWithoutSaving();return}
  loadItemIntoEditor(live,'','review');
}
function updateItemSwipeArrows(){const prev=$('#itemSwipePrevBtn'),next=$('#itemSwipeNextBtn'),current=$('#itemId').value;if(!prev||!next)return;if(itemDialogMode!=='review'){prev.classList.add('hidden');next.classList.add('hidden');return}const idx=current?itemReviewIds.indexOf(current):-1,canPrev=idx>0,canNext=idx>=0&&idx<itemReviewIds.length-1;prev.classList.toggle('hidden',!canPrev);next.classList.toggle('hidden',!canNext)}
function bindItemSwipe(){
  const zone=$('#itemSwipeZone');if(!zone)return;$('#itemSwipePrevBtn')?.addEventListener('click',()=>navigateReviewItem(-1));$('#itemSwipeNextBtn')?.addEventListener('click',()=>navigateReviewItem(1));
  zone.addEventListener('touchstart',e=>{if(!$('#itemId').value||e.touches.length!==1||e.target.closest('button,label,input,.review-photo-menu'))return;const t=e.touches[0];itemSwipeStart={x:t.clientX,y:t.clientY,time:Date.now(),axis:null}},{passive:true});
  zone.addEventListener('touchmove',e=>{if(!itemSwipeStart||!$('#itemId').value||e.touches.length!==1)return;const t=e.touches[0],dx=t.clientX-itemSwipeStart.x,dy=t.clientY-itemSwipeStart.y;if(!itemSwipeStart.axis&&Math.hypot(dx,dy)>10){if(Math.abs(dx)>Math.abs(dy)*1.15)itemSwipeStart.axis='x';else if(Math.abs(dy)>Math.abs(dx)*1.05)itemSwipeStart.axis='y'}if(itemSwipeStart.axis==='x')e.preventDefault()},{passive:false});
  zone.addEventListener('touchend',e=>{if(!itemSwipeStart||!$('#itemId').value)return;const start=itemSwipeStart,t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y,elapsed=Date.now()-start.time;itemSwipeStart=null;if(start.axis!=='x'||elapsed>850||Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.15)return;navigateReviewItem(dx<0?1:-1)});
  zone.addEventListener('touchcancel',()=>{itemSwipeStart=null},{passive:true});
}
function navigateReviewItem(delta){
  const current=$('#itemId').value;if(!current||itemReviewIds.length<2)return;const idx=itemReviewIds.indexOf(current);if(idx<0)return;const nextIndex=idx+delta;if(nextIndex<0||nextIndex>=itemReviewIds.length){toast(delta<0?'First piece in this view':'Last piece in this view');return}const next=state.items.find(i=>i.id===itemReviewIds[nextIndex]);if(!next)return;loadItemIntoEditor(next);const zone=$('#itemSwipeZone');zone.classList.remove('swipe-next','swipe-prev');void zone.offsetWidth;zone.classList.add(delta>0?'swipe-next':'swipe-prev');setTimeout(()=>zone.classList.remove('swipe-next','swipe-prev'),220);
}
function closeItemWithoutSaving(){
  // Form fields and photo edits are working copies only. Closing never mutates state.
  itemWorkingPhoto='';itemOriginalPhoto='';itemCutoutApplied=false;itemStudioState=null;itemPhotoPickerActive=false;document.body.classList.remove('item-photo-picker-active');pendingSmartScanResult=null;closeReviewPhotoMenu();$('#itemPhoto').value='';$('#itemPhotoLibrary').value='';$('#reviewItemPhoto').value='';$('#reviewItemPhotoLibrary').value='';$('#scanStatus').textContent='';
  if($('#itemDialog').open)$('#itemDialog').close('cancel');
  unlockPageForItemDialog();
}
async function handleItemPhotoSelection(e,source='camera'){
  const f=e.target.files&&e.target.files[0];
  ensureItemDialogVisible();
  if(!f){$('#scanStatus').textContent=source==='library'?'No photo selected — your piece is still open.':'Camera canceled — your piece is still open.';setTimeout(()=>{itemPhotoPickerActive=false;document.body.classList.remove('item-photo-picker-active');ensureItemDialogVisible()},500);return}
  setPhotoBusy(true,source==='library'?'Importing photo…':'Optimizing photo…');
  try{
    itemOriginalPhoto=await fileToDataURL(f,1100,.78);
    itemWorkingPhoto=itemOriginalPhoto;itemCutoutApplied=false;itemStudioState=null;
    showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();$('#smartScanIconBtn').classList.remove('hidden');$('#itemCardUtilityActions').classList.remove('hidden');updateReviewPhotoMenuState();updatePhotoToolAvailability();
    const scan=await analyzeImage(itemWorkingPhoto);
    $('#scanStatus').textContent=`${source==='library'?'Imported':'Photo ready'} · likely ${scan.color} · ${scan.pattern}. Tap Smart Scan to review detected details.`;
  }catch(err){console.error(err);$('#scanStatus').textContent='Photo could not be processed. Try another photo.';toast('Could not process that photo')}
  finally{setPhotoBusy(false);e.target.value='';updateReviewPhotoMenuState();updatePhotoToolAvailability();setTimeout(()=>{itemPhotoPickerActive=false;document.body.classList.remove('item-photo-picker-active');ensureItemDialogVisible()},500)}
}
function ensureItemDialogVisible(){
  const d=$('#itemDialog');
  if(!d.open){try{lockPageForItemDialog();d.showModal()}catch(err){console.warn('Could not restore item review dialog',err)}}
}
function restoreItemDialogAfterPicker(){
  if(!itemPhotoPickerActive)return;
  ensureItemDialogVisible();
  if(!document.body.classList.contains('item-dialog-open'))lockPageForItemDialog();
  const d=$('#itemDialog');if(d?.open){d.classList.add('picker-returning');setTimeout(()=>d.classList.remove('picker-returning'),220)}
}
function lockPageForItemDialog(){
  if(document.body.classList.contains('item-dialog-open'))return;
  itemDialogScrollY=window.scrollY||0;
  document.body.style.top=`-${itemDialogScrollY}px`;
  document.body.classList.add('item-dialog-open');
}
function unlockPageForItemDialog(){
  if(!document.body.classList.contains('item-dialog-open'))return;
  document.body.classList.remove('item-dialog-open');document.body.style.top='';
  window.scrollTo(0,itemDialogScrollY||0);
}

function normalizeBrandKey(name=''){return String(name).trim().toLocaleLowerCase()}
function rememberBrandSuggestion(name){
  name=String(name||'').trim();if(!name)return;
  ensureSettings();const key=normalizeBrandKey(name),now=Date.now();let found=state.settings.brandSuggestions.find(b=>normalizeBrandKey(typeof b==='string'?b:b?.name)===key);
  if(typeof found==='string'){const idx=state.settings.brandSuggestions.indexOf(found);found={name:found,count:1,lastUsed:0};state.settings.brandSuggestions[idx]=found}
  if(found){found.name=found.name||name;found.count=(Number(found.count)||0)+1;found.lastUsed=now}else state.settings.brandSuggestions.push({name,count:1,lastUsed:now});
  state.settings.brandSuggestions.sort((a,b)=>(Number(b.lastUsed)||0)-(Number(a.lastUsed)||0)||(Number(b.count)||0)-(Number(a.count)||0)||String(a.name).localeCompare(String(b.name)));
  state.settings.brandSuggestions=state.settings.brandSuggestions.slice(0,150)
}
function matchingBrandSuggestions(query=''){
  ensureSettings();const q=normalizeBrandKey(query);if(!q)return[];
  return state.settings.brandSuggestions.filter(b=>normalizeBrandKey(b?.name).startsWith(q)&&normalizeBrandKey(b?.name)!==q).sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0)||(Number(b.lastUsed)||0)-(Number(a.lastUsed)||0)).slice(0,5)
}
function renderBrandSuggestions(){
  const box=$('#brandSuggestions'),input=$('#itemBrand');if(!box||!input)return;const matches=matchingBrandSuggestions(input.value);
  box.innerHTML=matches.map(b=>`<button type="button" class="brand-suggestion" data-brand="${esc(b.name)}"><span>${esc(b.name)}</span></button>`).join('');box.classList.toggle('hidden',!matches.length);
  $$('#brandSuggestions .brand-suggestion').forEach(btn=>{btn.onpointerdown=e=>e.preventDefault();btn.onclick=()=>{input.value=btn.dataset.brand||'';closeBrandSuggestions();updateItemReviewSummary();input.focus()}})
}
function closeBrandSuggestions(){const box=$('#brandSuggestions');if(box){box.classList.add('hidden');box.innerHTML=''}}
function bindBrandSuggestions(){
  const input=$('#itemBrand');if(!input||input.dataset.brandSuggestionsBound)return;input.dataset.brandSuggestionsBound='true';
  input.addEventListener('input',renderBrandSuggestions);input.addEventListener('focus',renderBrandSuggestions);input.addEventListener('keydown',e=>{if(e.key==='Escape')closeBrandSuggestions()});input.addEventListener('blur',()=>setTimeout(closeBrandSuggestions,120));
}
function rememberStoreSuggestion(name){
  name=String(name||'').trim();if(!name)return;
  ensureSettings();const key=normalizeBrandKey(name),now=Date.now();let found=state.settings.storeSuggestions.find(x=>normalizeBrandKey(typeof x==='string'?x:x?.name)===key);
  if(typeof found==='string'){const idx=state.settings.storeSuggestions.indexOf(found);found={name:found,count:1,lastUsed:0};state.settings.storeSuggestions[idx]=found}
  if(found){found.name=found.name||name;found.count=(Number(found.count)||0)+1;found.lastUsed=now}else state.settings.storeSuggestions.push({name,count:1,lastUsed:now});
  state.settings.storeSuggestions.sort((a,b)=>(Number(b.lastUsed)||0)-(Number(a.lastUsed)||0)||(Number(b.count)||0)-(Number(a.count)||0)||String(a.name).localeCompare(String(b.name)));
  state.settings.storeSuggestions=state.settings.storeSuggestions.slice(0,150)
}
function matchingStoreSuggestions(query=''){
  ensureSettings();const q=normalizeBrandKey(query);if(!q)return[];
  return state.settings.storeSuggestions.filter(x=>normalizeBrandKey(x?.name).startsWith(q)&&normalizeBrandKey(x?.name)!==q).sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0)||(Number(b.lastUsed)||0)-(Number(a.lastUsed)||0)).slice(0,5)
}
function renderEntrySuggestionBox(inputSelector,boxSelector,matches,dataKey){
  const input=$(inputSelector),box=$(boxSelector);if(!input||!box)return;
  box.innerHTML=matches.map(x=>`<button type="button" class="brand-suggestion" data-entry-value="${esc(x.name)}"><span>${esc(x.name)}</span></button>`).join('');box.classList.toggle('hidden',!matches.length);
  $$(`${boxSelector} .brand-suggestion`).forEach(btn=>{btn.onpointerdown=e=>e.preventDefault();btn.onclick=()=>{input.value=btn.dataset.entryValue||'';box.classList.add('hidden');box.innerHTML='';input.focus()}})
}
function closeWishlistEntrySuggestions(){['#wishBrandSuggestions','#wishStoreSuggestions'].forEach(sel=>{const box=$(sel);if(box){box.classList.add('hidden');box.innerHTML=''}})}
function closeShoppingSessionStoreSuggestions(){const box=$('#shoppingSessionStoreSuggestions');if(box){box.classList.add('hidden');box.innerHTML=''}}
function bindShoppingSessionStoreSuggestions(){
  const store=$('#shoppingSessionStore');if(!store||store.dataset.entrySuggestionsBound)return;store.dataset.entrySuggestionsBound='true';
  const render=()=>renderEntrySuggestionBox('#shoppingSessionStore','#shoppingSessionStoreSuggestions',matchingStoreSuggestions(store.value),'store');
  store.addEventListener('input',render);store.addEventListener('focus',render);store.addEventListener('keydown',e=>{if(e.key==='Escape')closeShoppingSessionStoreSuggestions()});store.addEventListener('blur',()=>setTimeout(closeShoppingSessionStoreSuggestions,120));
}
function bindWishlistEntrySuggestions(){
  const brand=$('#wishBrand'),store=$('#wishStore');
  if(brand&&!brand.dataset.entrySuggestionsBound){brand.dataset.entrySuggestionsBound='true';const render=()=>renderEntrySuggestionBox('#wishBrand','#wishBrandSuggestions',matchingBrandSuggestions(brand.value),'brand');brand.addEventListener('input',render);brand.addEventListener('focus',render);brand.addEventListener('keydown',e=>{if(e.key==='Escape')closeWishlistEntrySuggestions()});brand.addEventListener('blur',()=>setTimeout(closeWishlistEntrySuggestions,120))}
  if(store&&!store.dataset.entrySuggestionsBound){store.dataset.entrySuggestionsBound='true';const render=()=>renderEntrySuggestionBox('#wishStore','#wishStoreSuggestions',matchingStoreSuggestions(store.value),'store');store.addEventListener('input',render);store.addEventListener('focus',render);store.addEventListener('keydown',e=>{if(e.key==='Escape')closeWishlistEntrySuggestions()});store.addEventListener('blur',()=>setTimeout(closeWishlistEntrySuggestions,120))}
}
function normalizedProductUrl(raw=''){
  let value=String(raw||'').trim();if(!value)return'';if(!/^[a-z][a-z0-9+.-]*:/i.test(value))value='https://'+value;
  try{const u=new URL(value);return (u.protocol==='http:'||u.protocol==='https:')?u.href:''}catch{return''}
}
function productUrlDisplay(raw=''){
  const href=normalizedProductUrl(raw);if(!href)return'';try{return new URL(href).hostname.replace(/^www\./i,'')||'Open product link'}catch{return'Open product link'}
}
function updateItemReviewSummary(){
  const isEdit=!!$('#itemId').value;$('#itemReviewSummary').classList.toggle('hidden',!isEdit);if(!isEdit)return;
  const type=displayItemType($('#itemCategory').value,$('#itemType').value),color=$('#itemColor').value||'Color not set',brand=$('#itemBrand').value.trim()||'No brand';
  $('#itemReviewTitle').textContent=type;$('#itemReviewMeta').innerHTML=`<span class="swatch" style="background:${colorHex(color)}"></span>${esc(color)} · ${esc(brand)}`;
}
async function saveItem(){
  const iid=$('#itemId').value;const old=state.items.find(x=>x.id===iid);const obj={id:iid||id(),photo:itemWorkingPhoto,originalPhoto:itemOriginalPhoto||itemWorkingPhoto,photoStudioCutoutApplied:!!itemCutoutApplied,photoStudioState:itemStudioState||null,category:$('#itemCategory').value,categoryId:categoryIdFor($('#itemCategory').value),type:$('#itemType').value,brand:$('#itemBrand').value.trim(),size:$('#itemSize').value,sizeVariant:cleanedItemFit($('#itemCategory').value,$('#itemFit').value),style:cleanedItemStyle($('#itemCategory').value,$('#itemType').value,$('#itemStyle').value),color:$('#itemColor').value,pattern:$('#itemPattern').value,acquired:$('#itemAcquired').value,season:$('#itemSeason').value,notes:$('#itemNotes').value.trim(),created:old?.created||Date.now(),wears:old?.wears||0,status:old?.status||'active',statusDate:old?.statusDate||''};
  const previous=state.items;rememberBrandSuggestion(obj.brand);if(iid)state.items=state.items.map(x=>x.id===iid?obj:x);else{state.items=[obj,...state.items];ensureSettings();const order=state.settings.closetOrder[obj.category]||[];state.settings.closetOrder[obj.category]=[obj.id,...order.filter(x=>x!==obj.id)];}
  const btn=$('#saveItemBtn');btn.disabled=true;btn.textContent='Saving…';$('#scanStatus').textContent='Saving securely on this device…';
  const ok=await saveState();btn.disabled=false;btn.textContent='Save piece';
  if(ok){
    if(iid){
      // Keep the user in the same browsing context after editing an existing piece.
      // The review sequence (itemReviewIds) is intentionally preserved so they can
      // swipe to the next/previous item without returning to the Closet overview.
      const savedItem=state.items.find(x=>x.id===iid)||obj;
      loadItemIntoEditor(savedItem,'','review');
      toast('Piece updated');
    }else{
      $('#itemDialog').close();unlockPageForItemDialog();toast('Added to closet');
    }
  }else{state.items=previous;$('#scanStatus').textContent='Save failed. Your entry is still open so you can try again.'}
}
function setPhotoBusy(busy,message=''){['#removeBgBtn','#smartScanIconBtn','#saveItemBtn','#reviewPhotoMenuBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=busy});if(message)$('#scanStatus').textContent=message}
async function toggleItemArchived(){
  const iid=$('#itemId').value,item=state.items.find(x=>x.id===iid);if(!item)return;
  if(isArchived(item)){
    item.status='active';item.statusDate='';
    const ok=await saveState();if(!ok)return;
    loadItemIntoEditor(item,'',itemDialogMode);toast('Piece returned to closet');return;
  }
  if(!confirm('Remove this piece from your active Closet? It will be archived, but Journal history and saved outfits will be preserved.'))return;
  item.status='archived';item.statusDate=localTodayISO();
  const ok=await saveState();if(!ok)return;
  $('#itemDialog').close();unlockPageForItemDialog();toast('Piece archived');
}
async function permanentDeleteItem(){
  const iid=$('#itemId').value,item=state.items.find(x=>x.id===iid);if(!item)return;
  const label=displayItemType(item)||'this piece';
  if(!confirm(`Permanently delete ${label}? This is only for mistakes. It will also be removed from Journal entries and saved outfits. This cannot be undone.`))return;
  if(!confirm('Final warning: permanently delete this piece and its history references?'))return;
  state.items=state.items.filter(x=>x.id!==iid);
  state.journal=state.journal.map(j=>({...j,itemIds:(j.itemIds||[]).filter(x=>x!==iid)}));
  state.outfits=state.outfits.map(o=>({...o,pieces:(o.pieces||[]).filter(p=>!(p.kind==='piece'&&p.source==='closet'&&p.id===iid))}));
  boardItems=boardItems.filter(p=>!(p.kind==='piece'&&p.source==='closet'&&p.id===iid));
  if(state.settings?.boardRecent?.closet)state.settings.boardRecent.closet=state.settings.boardRecent.closet.filter(x=>x!==iid);
  if(state.settings?.closetOrder)Object.keys(state.settings.closetOrder).forEach(cat=>state.settings.closetOrder[cat]=(state.settings.closetOrder[cat]||[]).filter(x=>x!==iid));
  const ok=await saveState();if(!ok)return;
  $('#itemDialog').close();unlockPageForItemDialog();drawBoard();toast('Piece permanently deleted');
}

function renderAll(){ensureSettings();applyAppName();renderCategories();renderCatalog();renderOutfits();renderSavedOutfits();renderWishlist();renderJournal();renderPortfolioFolderEditor();renderJournalOrderEditor()}
function renderCategories(){const host=$('#categoryStrip');host.innerHTML=CATEGORIES.map(c=>{const n=state.items.filter(i=>i.category===c&&(includeArchivedCloset||!isArchived(i))).length;return`<button class="category-chip ${selectedCategory===c?'active':''}" data-cat="${c}"><strong>${c}</strong><span>${n} ${n===1?'piece':'pieces'}</span></button>`}).join('');$$('.category-chip').forEach(b=>b.onclick=()=>{selectedCategory=selectedCategory===b.dataset.cat?'':b.dataset.cat;renderCategories();renderCatalog()})}
function updateCatalogSearchClear(){const btn=$('#clearCatalogSearchBtn'),search=$('#catalogSearch');if(btn&&search)btn.classList.toggle('hidden',!search.value.trim())}
function renderCatalog(){
  ensureSettings();
  const q=$('#catalogSearch').value.toLowerCase().trim(),fc=$('#filterCategory').value,fs=$('#filterSeason').value,fcol=$('#filterColor').value;
  const activeCategory=selectedCategory||fc||'';
  let items=state.items.filter(i=>(includeArchivedCloset||!isArchived(i))&&(!selectedCategory||i.category===selectedCategory)&&(!fc||i.category===fc)&&(!fs||i.season===fs)&&(!fcol||i.color===fcol)&&(!q||[i.type,i.brand,i.color,i.pattern,i.notes,i.category].join(' ').toLowerCase().includes(q)));
  if(activeCategory){const order=state.settings.closetOrder[activeCategory]||[];items=[...items].sort((a,b)=>{const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?999999:ai)-(bi<0?999999:bi)})}
  catalogReviewIds=items.map(i=>i.id);
  const eligibleCount=state.items.filter(i=>includeArchivedCloset||!isArchived(i)).length;$('#catalogCount').textContent=`${items.length} ${items.length===1?'piece':'pieces'}`;$('#catalogGrid').innerHTML=items.map(i=>itemCard(i)).join('');$('#catalogEmpty').classList.toggle('hidden',eligibleCount>0||q||selectedCategory||fc||fs||fcol);
  $$('.item-card').forEach(c=>c.onclick=()=>{if(Date.now()<suppressCatalogClickUntil)return;openItem(state.items.find(i=>i.id===c.dataset.id))});
  bindCatalogReorder(activeCategory);
}

function bindCatalogReorder(activeCategory){
  const grid=$('#catalogGrid');if(!grid)return;
  grid.querySelectorAll('.item-card').forEach(card=>{
    // Never let iOS/Safari treat the garment image itself as a draggable/copyable image.
    card.draggable=false;
    card.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});
    // Mouse / trackpad path. Touch gets its own non-passive handlers below so iOS
    // can hand control to us after a deliberate long press.
    card.onpointerdown=e=>{
      if(e.pointerType==='touch')return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      const p=catalogViewportPoint(e);beginCatalogPress(card,activeCategory,e.pointerId,p.x,p.y,null);
    };
    card.onpointermove=e=>{if(e.pointerType!=='touch'){const p=catalogViewportPoint(e);moveCatalogDrag(p.x,p.y,e.pointerId,null,e)}};
    card.onpointerup=e=>{if(e.pointerType!=='touch')finishCatalogDrag(e.pointerId,null,false,e)};
    card.onpointercancel=e=>{if(e.pointerType!=='touch')finishCatalogDrag(e.pointerId,null,true,e)};
    card.ontouchstart=e=>{
      if(e.touches.length!==1)return;
      const t=e.changedTouches[0];
      const p=catalogViewportPoint(t);beginCatalogPress(card,activeCategory,null,p.x,p.y,t.identifier);
    };
    card.ontouchmove=e=>{
      const d=closetDrag;if(d.touchId==null||d.active)return;
      const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);
      if(!t)return;
      const p=catalogViewportPoint(t);moveCatalogDrag(p.x,p.y,null,d.touchId,e);
    };
    card.ontouchend=e=>{
      const d=closetDrag;if(d.touchId==null||d.active)return;
      const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);
      if(t)finishCatalogDrag(null,d.touchId,false,e);
    };
    card.ontouchcancel=e=>{
      const d=closetDrag;if(d.touchId==null||d.active)return;
      finishCatalogDrag(null,d.touchId,true,e);
    };
    card.oncontextmenu=e=>{if(closetDrag.active||closetDrag.timer)e.preventDefault()};
  });
}
function catalogViewportPoint(point){
  // The drag ghost lives in a fixed viewport overlay, so use the same coordinate
  // system as getBoundingClientRect(): raw client coordinates. Mixing page/visual
  // viewport offsets caused the ghost to drift off-screen on iPhone while scrolling.
  return {x:Number(point?.clientX)||0,y:Number(point?.clientY)||0};
}
function catalogViewportHeight(){return window.innerHeight||document.documentElement.clientHeight||0}
function beginCatalogPress(card,activeCategory,pointerId,x,y,touchId){
  clearTimeout(closetDrag.timer);cleanupCatalogGhost();
  closetDrag={timer:null,pointerId,touchId,startX:x,startY:y,x,y,card,category:activeCategory||'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,scrollRaf:null,longPressed:false};
  closetDrag.timer=setTimeout(()=>startCatalogDrag(),430);
}

function handleActiveCatalogTouchMove(e){
  const d=closetDrag;if(!d?.active||d.touchId==null)return;
  const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);
  if(!t)return;
  const p=catalogViewportPoint(t);moveCatalogDrag(p.x,p.y,null,d.touchId,e);
}
function handleActiveCatalogTouchEnd(e){
  const d=closetDrag;if(!d?.active||d.touchId==null)return;
  const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);
  if(t)finishCatalogDrag(null,d.touchId,false,e);
}
function handleActiveCatalogTouchCancel(e){
  const d=closetDrag;if(!d?.active||d.touchId==null)return;
  finishCatalogDrag(null,d.touchId,true,e);
}
function bindActiveCatalogTouchTracking(){
  window.addEventListener('touchmove',handleActiveCatalogTouchMove,{passive:false,capture:true});
  window.addEventListener('touchend',handleActiveCatalogTouchEnd,{passive:false,capture:true});
  window.addEventListener('touchcancel',handleActiveCatalogTouchCancel,{passive:false,capture:true});
}
function unbindActiveCatalogTouchTracking(){
  window.removeEventListener('touchmove',handleActiveCatalogTouchMove,true);
  window.removeEventListener('touchend',handleActiveCatalogTouchEnd,true);
  window.removeEventListener('touchcancel',handleActiveCatalogTouchCancel,true);
}

function ensureClosetDragOverlay(){
  let overlay=document.getElementById('closetDragOverlay');
  if(!overlay){overlay=document.createElement('div');overlay.id='closetDragOverlay';overlay.className='closet-drag-overlay';overlay.setAttribute('aria-hidden','true');document.body.appendChild(overlay)}
  return overlay;
}
function startCatalogDrag(){
  const d=closetDrag;if(!d.card)return;
  if(!d.category){d.timer=null;d.longPressed=true;suppressCatalogClickUntil=Date.now()+1100;navigator.vibrate?.(12);toast('Choose a clothing category first, then press & hold to reorder.');return}
  d.active=true;d.longPressed=true;d.timer=null;suppressCatalogClickUntil=Date.now()+900;
  const rect=d.card.getBoundingClientRect();

  // Keep the grid completely stable while dragging. The original card remains in its slot
  // (dimmed) and we only highlight the intended destination. No neighboring cards move
  // until the user actually drops the item, which prevents the flashing seen on iPhone.
  d.card.classList.add('closet-drag-source');
  d.originalId=d.card.dataset.id;
  d.targetId=d.originalId;
  d.targetAfter=false;

  const overlay=ensureClosetDragOverlay();d.overlay=overlay;
  const ghost=d.card.cloneNode(true);ghost.classList.add('closet-drag-ghost');ghost.removeAttribute('data-id');ghost.removeAttribute('style');
  ghost.querySelectorAll('img').forEach(img=>{img.draggable=false});
  Object.assign(ghost.style,{position:'absolute',left:'0',top:'0',width:rect.width+'px',height:rect.height+'px',margin:'0',pointerEvents:'none',willChange:'left, top, transform',transformOrigin:'top left'});
  overlay.appendChild(ghost);d.ghost=ghost;d.ghostOffsetX=d.x-rect.left;d.ghostOffsetY=d.y-rect.top;
  const dropOutline=document.createElement('div');dropOutline.className='closet-drop-outline';dropOutline.setAttribute('aria-hidden','true');overlay.appendChild(dropOutline);d.dropOutline=dropOutline;
  document.body.classList.add('closet-reordering');$('#catalogGrid')?.classList.add('closet-grid-reordering');
  if(d.touchId!=null)bindActiveCatalogTouchTracking();
  navigator.vibrate?.(18);positionCatalogGhost(d.x,d.y);startCatalogAutoScroll();
  // Do not choose a destination until the user actually starts dragging.
  clearCatalogDropTarget();d.targetId=null;d.targetAfter=false;
  toast('Reorder mode — drag to a new slot, then release');
}
function positionCatalogGhost(x,y){
  const d=closetDrag;if(!d.ghost)return;
  const left=x-(d.ghostOffsetX||0),top=y-(d.ghostOffsetY||0);
  d.ghost.style.left=left+'px';d.ghost.style.top=top+'px';d.ghost.style.transform='scale(1.018)';
}
function moveCatalogDrag(x,y,pointerId,touchId,e){
  const d=closetDrag;if(!d.card)return;
  if(pointerId!=null&&d.pointerId!==pointerId)return;
  if(touchId!=null&&d.touchId!==touchId)return;
  d.x=x;d.y=y;
  const dx=x-d.startX,dy=y-d.startY;
  if(!d.active){
    if(Math.hypot(dx,dy)>14){clearTimeout(d.timer);d.timer=null}
    return;
  }
  if(e?.cancelable)e.preventDefault();
  positionCatalogGhost(x,y);
  // Require a deliberate movement before highlighting any destination. This prevents
  // the neighboring card from lighting up the instant reorder mode begins.
  const dragDistance=Math.hypot(dx,dy);
  if(dragDistance<24){clearCatalogDropTarget();d.targetId=null;d.targetAfter=false;return}
  d.moved=true;d.pendingX=x;d.pendingY=y;
  if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=null;autoScrollCatalogDrag(d.pendingY);updateCatalogDropTarget(d.pendingX,d.pendingY)});
}
function autoScrollCatalogDrag(y){
  const vh=catalogViewportHeight(),edge=Math.min(130,vh*.18),maxSpeed=16;let delta=0;
  if(y<edge)delta=-maxSpeed*(1-y/edge);
  else if(y>vh-edge)delta=maxSpeed*(1-(vh-y)/edge);
  if(Math.abs(delta)>.25)window.scrollBy(0,delta);
}
function startCatalogAutoScroll(){
  const tick=()=>{const d=closetDrag;if(!d?.active){if(d)d.scrollRaf=null;return}const before=window.scrollY;autoScrollCatalogDrag(d.y);if(window.scrollY!==before){positionCatalogGhost(d.x,d.y);updateCatalogDropTarget(d.x,d.y)}d.scrollRaf=requestAnimationFrame(tick)};
  if(!closetDrag.scrollRaf)closetDrag.scrollRaf=requestAnimationFrame(tick);
}
function clearCatalogDropTarget(){
  $$('#catalogGrid .closet-drop-target').forEach(el=>el.classList.remove('closet-drop-target','drop-before','drop-after'));
  const o=closetDrag?.dropOutline;if(o)o.classList.remove('visible');
}
function updateCatalogDropTarget(x,y){
  const d=closetDrag,grid=$('#catalogGrid');if(!grid||!d.card)return;
  const allCards=[...grid.querySelectorAll('.item-card[data-id]')],cards=allCards.filter(c=>c!==d.card);
  clearCatalogDropTarget();
  if(!cards.length){d.targetId=d.originalId;d.targetAfter=false;return}

  // Use the floating card's actual overlap instead of waiting for the finger/card center
  // to cross the destination midpoint. A light overlap is enough to select a slot so the visual cue and swap feel immediate.
  const sourceRect=d.card.getBoundingClientRect(),ghostLeft=x-(d.ghostOffsetX||0),ghostTop=y-(d.ghostOffsetY||0);
  const ghostRight=ghostLeft+sourceRect.width,ghostBottom=ghostTop+sourceRect.height;
  let target=null,bestOverlap=0;
  for(const c of cards){
    const r=c.getBoundingClientRect();
    const overlapW=Math.max(0,Math.min(ghostRight,r.right)-Math.max(ghostLeft,r.left));
    const overlapH=Math.max(0,Math.min(ghostBottom,r.bottom)-Math.max(ghostTop,r.top));
    const overlap=(overlapW*overlapH)/Math.max(1,r.width*r.height);
    if(overlap>bestOverlap){bestOverlap=overlap;target=c}
  }
  if(!target||bestOverlap<.10){d.targetId=null;d.targetAfter=false;return}

  const sourceIndex=allCards.indexOf(d.card),targetIndex=allCards.indexOf(target);
  const after=targetIndex>sourceIndex;
  d.targetId=target.dataset.id;d.targetAfter=after;
  target.classList.add('closet-drop-target',after?'drop-after':'drop-before');
  if(d.dropOutline){const tr=target.getBoundingClientRect();Object.assign(d.dropOutline.style,{left:tr.left+'px',top:tr.top+'px',width:tr.width+'px',height:tr.height+'px'});d.dropOutline.classList.add('visible')}
}

function cleanupCatalogGhost(){
  unbindActiveCatalogTouchTracking();
  const d=closetDrag;
  if(d?.raf){cancelAnimationFrame(d.raf);d.raf=null}
  if(d?.scrollRaf){cancelAnimationFrame(d.scrollRaf);d.scrollRaf=null}
  if(d?.ghost){try{d.ghost.remove()}catch{}}
  if(d?.dropOutline){try{d.dropOutline.remove()}catch{}}
  if(d?.overlay){try{d.overlay.remove()}catch{}}
  clearCatalogDropTarget();
  $('#catalogGrid')?.classList.remove('closet-grid-reordering');
  document.body.classList.remove('closet-reordering');
  d?.card?.classList.remove('closet-drag-source');
}
async function finishCatalogDrag(pointerId,touchId,canceled=false,e){
  const d=closetDrag;if(!d.card)return;
  if(pointerId!=null&&d.pointerId!==pointerId)return;
  if(touchId!=null&&d.touchId!==touchId)return;
  clearTimeout(d.timer);
  if(d.active){
    if(e?.cancelable)e.preventDefault();
    suppressCatalogClickUntil=Date.now()+650;
    if(!canceled&&d.targetId&&d.originalId){
      ensureSettings();
      const categoryIds=state.items.filter(x=>x.category===d.category).map(x=>x.id);
      let order=(state.settings.closetOrder[d.category]||[]).filter(id=>categoryIds.includes(id));
      order=[...order,...categoryIds.filter(id=>!order.includes(id))];
      order=order.filter(id=>id!==d.originalId);
      let idx=order.indexOf(d.targetId);
      if(idx<0)idx=0;
      if(d.targetAfter)idx+=1;
      order.splice(Math.max(0,Math.min(order.length,idx)),0,d.originalId);
      state.settings.closetOrder[d.category]=[...new Set(order)];
      await saveState();
      const movedId=d.originalId;renderCatalog();
      const moved=$(`#catalogGrid .item-card[data-id="${movedId}"]`);if(moved){moved.classList.add('closet-drop-confirm');setTimeout(()=>moved.classList.remove('closet-drop-confirm'),380)}
      toast('Closet order saved');
    }
  }
  cleanupCatalogGhost();
  closetDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,category:'',active:false,moved:false,ghost:null,dropOutline:null,placeholder:null,lastPlacement:'',raf:null,targetId:null,targetAfter:false,originalId:null,longPressed:false};
}

function itemCard(i){return`<article class="item-card ${isArchived(i)?'item-card-archived':''}" data-id="${i.id}"><div class="thumb">${i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i))}" draggable="false">`:`<div class="hanger">⌇</div>`}<span class="count-badge">${i.wears||0} wears</span>${isArchived(i)?'<span class="archived-badge">Archived</span>':''}</div><div class="card-body"><h4>${esc(displayItemType(i))}</h4><p>${i.color?`<span class="swatch" style="background:${colorHex(i.color)}"></span>${esc(i.color)} · `:''}${esc(i.brand||'No brand')}</p><p>${esc(i.size||'Size —')} · ${esc(i.pattern||'Solid')}</p></div></article>`}

let wishDesireDraft=null;
let wishRatingToastTimer=null;
function showWishRatingToast(msg,duration=3200){const t=$('#wishRatingToast');if(!t)return;clearTimeout(wishRatingToastTimer);t.textContent=msg;t.classList.add('show');wishRatingToastTimer=setTimeout(()=>t.classList.remove('show'),duration)}

function populateWishShoppingSessionSelect(selected='',useCurrent=false){
  const select=$('#wishShoppingSession');if(!select)return;
  const sessions=(state.shoppingSessions||[]).filter(s=>s.status!=='closed');
  select.innerHTML='<option value="">None</option>'+sessions.map(s=>`<option value="${esc(s.id)}">${esc(shoppingSessionLabel(s))}</option>`).join('');
  const fallback=selected||(useCurrent?state.settings?.activeShoppingSessionId:'')||'';select.value=sessions.some(s=>s.id===fallback)?fallback:'';
}
function renderShoppingSessions(){
  const host=$('#shoppingSessionsList');if(!host)return;ensureSettings();
  const sessions=(state.shoppingSessions||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(b.updatedAt||0)-(a.updatedAt||0));
  host.innerHTML=sessions.length?sessions.map(s=>{const current=state.settings.activeShoppingSessionId===s.id;const count=(state.wishlist||[]).filter(w=>w.shoppingSessionId===s.id&&(w.wishlistStatus||'active')==='active').length;return `<article class="shopping-session-row ${current?'current':''}" data-session-id="${esc(s.id)}"><div class="shopping-session-main"><div class="shopping-session-title"><strong>${esc(s.name)}</strong>${current?'<span class="shopping-session-current">Current</span>':''}</div><small>${esc([s.date,s.store,s.location].filter(Boolean).join(' · '))}</small><em>${count} wish${count===1?'':'es'}</em></div><div class="shopping-session-actions"><button type="button" class="text-btn" data-session-action="${current?'clear':'use'}">${current?'Clear current':'Use'}</button><button type="button" class="text-btn" data-session-action="edit">Edit</button><button type="button" class="text-btn danger-text" data-session-action="delete">Delete</button></div></article>`}).join(''):'<p class="shopping-session-empty">No shopping sessions yet.</p>';
  host.querySelectorAll('[data-session-action]').forEach(btn=>btn.onclick=async()=>{const row=btn.closest('[data-session-id]'),session=shoppingSessionById(row?.dataset.sessionId);if(!session)return;const action=btn.dataset.sessionAction;if(action==='edit'){fillShoppingSessionForm(session);return}if(action==='delete'){await deleteShoppingSession(session);return}ensureSettings();state.settings.activeShoppingSessionId=action==='clear'?'':session.id;await saveState();renderShoppingSessions();renderActiveShoppingSession();populateWishShoppingSessionSelect($('#wishShoppingSession')?.value||'',false);toast(action==='clear'?'Current shopping session cleared':`Current session — ${session.name}`)});
}
function renderActiveShoppingSession(){
  ensureSettings();const box=$('#wishlistActiveSession'),name=$('#wishlistActiveSessionName'),startBtn=$('#wishlistSessionsBtn');if(!box||!name)return;const session=shoppingSessionById(state.settings.activeShoppingSessionId||'');const show=!!session&&session.status!=='closed';box.classList.toggle('hidden',!show);name.textContent=show?shoppingSessionLabel(session):'';if(startBtn)startBtn.classList.toggle('hidden',show);
}
async function clearActiveShoppingSession(){
  ensureSettings();if(!state.settings.activeShoppingSessionId)return;state.settings.activeShoppingSessionId='';await saveState();renderActiveShoppingSession();renderShoppingSessions();populateWishShoppingSessionSelect($('#wishShoppingSession')?.value||'',false);toast('Current shopping session cleared');
}
async function deleteShoppingSession(session){
  if(!session)return;const linked=(state.wishlist||[]).filter(w=>w.shoppingSessionId===session.id).length;if(!confirm(`Delete “${session.name}”?${linked?`\n\n${linked} Wishlist item${linked===1?'':'s'} will stay in your Wishlist but will no longer belong to this session.`:''}`))return;
  state.shoppingSessions=(state.shoppingSessions||[]).filter(s=>s.id!==session.id);(state.wishlist||[]).forEach(w=>{if(w.shoppingSessionId===session.id)w.shoppingSessionId=''});ensureSettings();if(state.settings.activeShoppingSessionId===session.id)state.settings.activeShoppingSessionId='';await saveState();resetShoppingSessionForm();renderShoppingSessions();renderActiveShoppingSession();renderWishlist();populateWishShoppingSessionSelect('',false);toast('Shopping session deleted');
}
function resetShoppingSessionForm(){
  $('#shoppingSessionId').value='';$('#shoppingSessionName').value='';$('#shoppingSessionDate').value=localTodayISO();$('#shoppingSessionStore').value='';$('#shoppingSessionLocation').value='';$('#shoppingSessionSaveBtn').textContent='Save session';
}
function fillShoppingSessionForm(session){
  $('#shoppingSessionId').value=session.id;$('#shoppingSessionName').value=session.name||'';$('#shoppingSessionDate').value=session.date||localTodayISO();$('#shoppingSessionStore').value=session.store||'';$('#shoppingSessionLocation').value=session.location||'';$('#shoppingSessionSaveBtn').textContent='Update session';
}
let shoppingSessionsScrollY=0;
function lockPageForShoppingSessions(){if(document.body.classList.contains('shopping-sessions-open'))return;shoppingSessionsScrollY=window.scrollY||0;document.body.style.top=`-${shoppingSessionsScrollY}px`;document.body.classList.add('shopping-sessions-open')}
function unlockPageForShoppingSessions(){if(!document.body.classList.contains('shopping-sessions-open'))return;document.body.classList.remove('shopping-sessions-open');document.body.style.top='';window.scrollTo(0,shoppingSessionsScrollY||0)}
function closeShoppingSessionsDialog(){const d=$('#shoppingSessionsDialog');if(d.open)d.close();else unlockPageForShoppingSessions()}
function openShoppingSessionsDialog(fromWish=false){
  resetShoppingSessionForm();renderShoppingSessions();const d=$('#shoppingSessionsDialog');d.dataset.fromWish=fromWish?'true':'false';if(!d.open){lockPageForShoppingSessions();d.showModal()}
}
async function saveShoppingSession(){
  const sid=$('#shoppingSessionId').value,existing=shoppingSessionById(sid),now=Date.now();
  const session=normalizeShoppingSession({...(existing||{}),id:sid||id(),name:$('#shoppingSessionName').value.trim(),date:$('#shoppingSessionDate').value||localTodayISO(),store:$('#shoppingSessionStore').value.trim(),location:$('#shoppingSessionLocation').value.trim(),createdAt:existing?.createdAt||now,updatedAt:now});
  rememberStoreSuggestion(session.store);
  if(existing)state.shoppingSessions=state.shoppingSessions.map(s=>s.id===session.id?session:s);else state.shoppingSessions.unshift(session);
  ensureSettings();if(!state.settings.activeShoppingSessionId)state.settings.activeShoppingSessionId=session.id;await saveState();renderShoppingSessions();renderActiveShoppingSession();populateWishShoppingSessionSelect(session.id,false);if($('#shoppingSessionsDialog').dataset.fromWish==='true')$('#wishShoppingSession').value=session.id;resetShoppingSessionForm();toast(existing?'Shopping session updated':'Shopping session saved');
}


function resetQuickCaptureDraft(){
  quickCaptureDraft={item:'',label:'',price:'',itemName:'',labelText:'',priceText:'',barcode:'',ocrAvailable:true,suggestions:{}};
  ['quickCaptureItemPhoto','quickCaptureLabelPhoto','quickCapturePricePhoto'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});
  [['#quickCaptureItemPreview','#quickCaptureItemPlaceholder'],['#quickCaptureLabelPreview','#quickCaptureLabelPlaceholder'],['#quickCapturePricePreview','#quickCapturePricePlaceholder']].forEach(([img,ph])=>showPhoto(img,ph,''));
  const status=$('#quickCaptureStatus');if(status){status.textContent='Take the item photo first. Label and price-tag photos are optional.';status.classList.remove('quick-capture-warning')}
  const analyze=$('#quickCaptureAnalyzeBtn');if(analyze)analyze.disabled=false;
  const alert=$('#quickCaptureAlert');if(alert){alert.textContent='';alert.classList.add('hidden')}
  quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active');
}
let quickCaptureScrollY=0;
function lockPageForQuickCapture(){
  if(document.body.classList.contains('quick-capture-open'))return;
  quickCaptureScrollY=window.scrollY||document.documentElement.scrollTop||0;
  document.body.style.top=`-${quickCaptureScrollY}px`;
  document.body.classList.add('quick-capture-open');
}
function unlockPageForQuickCapture(){
  if(!document.body.classList.contains('quick-capture-open'))return;
  document.body.classList.remove('quick-capture-open');
  document.body.style.top='';
  window.scrollTo(0,quickCaptureScrollY||0);
}
function quickCaptureNoPhotoMessage(){
  const msg='Capture or upload an item photo first, or tap Cancel to exit.';
  const status=$('#quickCaptureStatus');if(status){status.textContent=msg;status.classList.add('quick-capture-warning')}
  const alert=$('#quickCaptureAlert');if(alert){alert.textContent=msg;alert.classList.remove('hidden')}
}
function openQuickCapture(){
  resetQuickCaptureDraft();
  quickCaptureSessionActive=true;
  ensureSettings();const session=shoppingSessionById(state.settings.activeShoppingSessionId||'');
  const note=$('#quickCaptureSessionNote');if(note){note.textContent=session?`Current session — ${shoppingSessionLabel(session)}`:'No current shopping session. You can still capture a wish now.';note.classList.toggle('no-session',!session)}
  const d=$('#quickCaptureDialog');if(d&&!d.open){lockPageForQuickCapture();d.showModal()}
}
function closeQuickCapture(){quickCaptureSessionActive=false;quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active');const d=$('#quickCaptureDialog');if(d?.open)d.close();resetQuickCaptureDraft();unlockPageForQuickCapture()}
function restoreAfterQuickCapturePicker(){
  if(!quickCapturePickerActive||!quickCaptureSessionActive)return;
  const restore=()=>{
    if(!quickCaptureSessionActive)return;
    const review=$('#quickCaptureReviewDialog');
    if(review?.open)return;
    const d=$('#quickCaptureDialog');
    if(d&&!d.open){try{d.showModal()}catch{}}
    lockPageForQuickCapture();
    if(d?.open){quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active')}
  };
  [80,240,520,900].forEach(ms=>setTimeout(restore,ms));
}
async function handleQuickCapturePhoto(e,inputId){
  const f=e.target.files&&e.target.files[0];if(!f){e.target.value='';setTimeout(()=>{quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active');const d=$('#quickCaptureDialog');if(d&&!d.open){try{d.showModal()}catch{}}lockPageForQuickCapture()},240);return}
  const role=inputId==='quickCaptureItemPhoto'?'item':inputId==='quickCaptureLabelPhoto'?'label':'price';
  const photo=await fileToDataURL(f,1000,.78);quickCaptureDraft[role]=photo;
  showPhoto(`#quickCapture${role[0].toUpperCase()+role.slice(1)}Preview`,`#quickCapture${role[0].toUpperCase()+role.slice(1)}Placeholder`,photo);
  $('#quickCaptureStatus').textContent=role==='item'?'Item photo ready. Add a label or price tag if useful, then review suggestions.':`${role==='label'?'Label':'Price tag'} photo added.`;
  $('#quickCaptureStatus').classList.remove('quick-capture-warning');const alert=$('#quickCaptureAlert');if(alert){alert.textContent='';alert.classList.add('hidden')}
  e.target.value='';setTimeout(()=>{quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active');const d=$('#quickCaptureDialog');if(d&&!d.open){try{d.showModal()}catch{}}lockPageForQuickCapture()},220);
}
function quickCaptureKnownBrands(){
  const learned=[...(state.items||[]).map(x=>x.brand),...(state.wishlist||[]).map(x=>x.brand)].filter(Boolean);
  return [...new Set([...learned,'Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','The North Face'].map(x=>String(x).trim()).filter(Boolean))].sort((a,b)=>b.length-a.length);
}
function quickCaptureExtractBrand(text=''){const flat=String(text).replace(/\s+/g,' ');return quickCaptureKnownBrands().find(b=>flat.toLowerCase().includes(b.toLowerCase()))||''}
function quickCaptureExtractSize(text=''){const flat=String(text).toUpperCase();const m=flat.match(/(?:SIZE\s*[:#-]?\s*)?\b(XXS|XS|S|M|L|XL|XXL|XXXL|00|0|2|4|6|8|10|12|14|16|18|2[4-9]|3[0-9]|4[0-8])\b/);return m?m[1]:''}
function quickCaptureExtractPrice(text=''){const matches=[...String(text).matchAll(/(?:\$|USD\s*|EUR\s*|GBP\s*|CAD\s*|JPY\s*|TWD\s*|€|£|¥)?([0-9]{1,4}(?:\.[0-9]{2})?)/gi)].map(m=>Number(m[1])).filter(n=>Number.isFinite(n)&&n>0&&n<10000);if(!matches.length)return'';const decimal=matches.find(n=>!Number.isInteger(n));return String(decimal??matches[0])}
function quickCaptureExtractCurrency(text=''){const t=String(text).toUpperCase();if(/(?:\bEUR\b|€)/.test(t))return'EUR';if(/(?:\bGBP\b|£)/.test(t))return'GBP';if(/\bCAD\b/.test(t))return'CAD';if(/\bTWD\b/.test(t))return'TWD';if(/(?:\bJPY\b|¥)/.test(t))return'JPY';if(/(?:\bUSD\b|\$)/.test(t))return'USD';return''}
async function quickCaptureBarcode(dataURL){
  if(!dataURL||!('BarcodeDetector'in window))return'';
  try{const detector=new BarcodeDetector({formats:['qr_code','ean_13','ean_8','upc_a','upc_e','code_128']});const img=await imageFrom(dataURL);const results=await detector.detect(img);return String(results?.[0]?.rawValue||'')}catch{return''}
}
function quickCaptureSuggestion(value,source,confidence=.7){return value?{value:String(value),source,confidence}:null}
async function analyzeQuickCapture(){
  if(!quickCaptureDraft.item){quickCaptureNoPhotoMessage();return}
  const btn=$('#quickCaptureAnalyzeBtn');btn.disabled=true;$('#quickCaptureStatus').classList.remove('quick-capture-warning');$('#quickCaptureStatus').textContent='Reading the item, label and price tag…';
  try{
    const visual=await analyzeImage(quickCaptureDraft.item);
    let labelText='',priceText='',ocrAttempted=!!(quickCaptureDraft.label||quickCaptureDraft.price),ocrFailed=false;
    if(quickCaptureDraft.label)try{labelText=await tryOCR(quickCaptureDraft.label)}catch{ocrFailed=true}
    if(quickCaptureDraft.price)try{priceText=await tryOCR(quickCaptureDraft.price)}catch{ocrFailed=true}
    quickCaptureDraft.ocrAvailable=!ocrAttempted||(!ocrFailed&&(!!labelText||!!priceText));
    const barcode=await quickCaptureBarcode(quickCaptureDraft.price||quickCaptureDraft.label);
    quickCaptureDraft.labelText=labelText.slice(0,1600);quickCaptureDraft.priceText=priceText.slice(0,1600);quickCaptureDraft.barcode=barcode;
    const allText=`${labelText}\n${priceText}`;
    const session=shoppingSessionById(state.settings?.activeShoppingSessionId||'');
    quickCaptureDraft.suggestions={
      itemName:quickCaptureSuggestion(quickCaptureDraft.itemName,'manual entry',1),
      brand:quickCaptureSuggestion(quickCaptureExtractBrand(allText),'label',.82),
      size:quickCaptureSuggestion(quickCaptureExtractSize(labelText),'label',.76),
      price:quickCaptureSuggestion(quickCaptureExtractPrice(priceText),'price tag',.86),
      currency:quickCaptureSuggestion(quickCaptureExtractCurrency(priceText)||(session?.currency||'USD'),quickCaptureExtractCurrency(priceText)?'price tag':'default',quickCaptureExtractCurrency(priceText)?.92:.55),
      store:quickCaptureSuggestion(session?.store||'','shopping session',.98),
      color:quickCaptureSuggestion(visual.color||'','item photo',.7),
      pattern:quickCaptureSuggestion(visual.pattern||'','item photo',.65),
      barcode:quickCaptureSuggestion(barcode,'barcode / QR',.95)
    };
    renderQuickCaptureReview();
    $('#quickCaptureDialog').close();$('#quickCaptureReviewDialog').showModal();
  }catch(err){console.error(err);toast('Could not analyze the capture');$('#quickCaptureStatus').textContent='Capture saved. You can retry or add the wish manually.'}
  finally{btn.disabled=false}
}
function quickCaptureReviewField(key,label,type='text',options={}){
  const sug=quickCaptureDraft.suggestions[key],value=sug?.value||'',checked=(value||options.defaultChecked)?'checked':'';
  const input=type==='select-pattern'?`<select data-qc-value="${key}">${PATTERNS.map(v=>`<option${v===value?' selected':''}>${esc(v)}</option>`).join('')}</select>`:type==='select-color'?`<select data-qc-value="${key}">${COLORS.map(v=>`<option${v===value?' selected':''}>${esc(v)}</option>`).join('')}</select>`:`<input data-qc-value="${key}" value="${esc(value)}" ${key==='price'?'inputmode="decimal"':''} ${options.placeholder?`placeholder="${esc(options.placeholder)}"`:''}>`;
  const extra=key==='brand'?'<div id="quickCaptureBrandSuggestions" class="brand-suggestions quick-capture-brand-suggestions hidden"></div>':'';
  return `<div class="quick-capture-review-row" data-qc-row="${key}"><label class="quick-capture-apply"><input type="checkbox" data-qc-apply="${key}" ${checked}><span></span></label><div class="quick-capture-review-copy"><strong>${esc(label)}</strong>${sug?.source?`<small>${esc(sug.source)}</small>`:''}${input}${extra}</div></div>`;
}
function quickCapturePriceCurrencyField(){
  const price=quickCaptureDraft.suggestions.price?.value||'',currency=quickCaptureDraft.suggestions.currency?.value||'USD',checked=price?'checked':'';
  return `<div class="quick-capture-review-row quick-capture-price-row"><label class="quick-capture-apply"><input type="checkbox" data-qc-apply-group="priceCurrency" ${checked}><span></span></label><div class="quick-capture-review-copy"><strong>Price</strong><small>${esc(quickCaptureDraft.suggestions.price?.source||'price tag')}</small><div class="quick-capture-price-currency"><input data-qc-value="price" value="${esc(price)}" inputmode="decimal" placeholder="0.00"><select data-qc-value="currency">${['USD','EUR','GBP','CAD','JPY','TWD'].map(v=>`<option value="${v}"${v===currency?' selected':''}>${v}</option>`).join('')}</select></div></div></div>`;
}
function renderQuickCaptureBrandSuggestions(){
  const input=$('#quickCaptureReviewFields [data-qc-value="brand"]'),box=$('#quickCaptureBrandSuggestions');if(!input||!box)return;
  const matches=matchingBrandSuggestions(input.value);
  box.innerHTML=matches.map(b=>`<button type="button" class="brand-suggestion" data-qc-brand="${esc(b.name)}"><span>${esc(b.name)}</span></button>`).join('');box.classList.toggle('hidden',!matches.length);
  $$('#quickCaptureBrandSuggestions [data-qc-brand]').forEach(btn=>{btn.onpointerdown=e=>e.preventDefault();btn.onclick=()=>{input.value=btn.dataset.qcBrand||'';const check=$('#quickCaptureReviewFields [data-qc-apply="brand"]');if(check)check.checked=true;box.classList.add('hidden');input.focus()}});
}
function renderQuickCaptureReview(){
  const fields=$('#quickCaptureReviewFields');if(!fields)return;
  fields.innerHTML=[quickCaptureReviewField('itemName','Item description','text',{defaultChecked:true,placeholder:'e.g. Denim jacket'}),quickCaptureReviewField('brand','Brand'),quickCaptureReviewField('size','Size / label text'),quickCaptureReviewField('color','Color','select-color'),quickCaptureReviewField('pattern','Pattern','select-pattern'),quickCapturePriceCurrencyField(),quickCaptureReviewField('store','Store')].join('');
  const brandInput=$('#quickCaptureReviewFields [data-qc-value="brand"]');if(brandInput){const render=()=>renderQuickCaptureBrandSuggestions();brandInput.addEventListener('input',render);brandInput.addEventListener('focus',render);brandInput.addEventListener('blur',()=>setTimeout(()=>$('#quickCaptureBrandSuggestions')?.classList.add('hidden'),140))}
  ['itemName','brand','size','store'].forEach(key=>{const input=$(`#quickCaptureReviewFields [data-qc-value="${key}"]`),check=$(`#quickCaptureReviewFields [data-qc-apply="${key}"]`);if(input&&check){input.addEventListener('input',()=>{check.checked=!!String(input.value||'').trim();if(key==='itemName')quickCaptureDraft.itemName=input.value});input.addEventListener('change',()=>{check.checked=!!String(input.value||'').trim()})}});
  const barcode=quickCaptureDraft.suggestions.barcode?.value||'';const ocrNote=quickCaptureDraft.ocrAvailable?'':' Text recognition was unavailable or could not confidently read the tag; you can enter the values manually.';$('#quickCaptureBarcodeNote').textContent=(barcode?`Code detected: ${barcode}.`:'No barcode or QR code detected. That’s okay — the photos are still saved with the wish.')+ocrNote;
}
function closeQuickCaptureReview(){const d=$('#quickCaptureReviewDialog');if(d?.open)d.close();if(!$('#quickCaptureDialog').open)$('#quickCaptureDialog').showModal()}
function setWishSelectValue(selector,value){const sel=$(selector);if(!sel||!value)return;let opt=[...sel.options].find(o=>o.value===value||o.textContent===value);if(!opt){opt=document.createElement('option');opt.value=value;opt.textContent=value;opt.dataset.scanSuggestion='true';sel.appendChild(opt)}sel.value=opt.value}
function applyQuickCaptureSuggestions(){
  const picked={};$$('#quickCaptureReviewFields [data-qc-apply]:checked').forEach(box=>{const key=box.dataset.qcApply,val=$(`#quickCaptureReviewFields [data-qc-value="${key}"]`)?.value?.trim?.()||'';if(val)picked[key]=val});const priceGroup=$('#quickCaptureReviewFields [data-qc-apply-group="priceCurrency"]');if(priceGroup?.checked){const price=$('#quickCaptureReviewFields [data-qc-value="price"]')?.value?.trim?.()||'',currency=$('#quickCaptureReviewFields [data-qc-value="currency"]')?.value||'';if(price)picked.price=price;if(currency)picked.currency=currency}
  const assets=[{role:'item',imageRef:'photo',createdAt:Date.now()},...([['label',quickCaptureDraft.label],['price',quickCaptureDraft.price]].filter(([,image])=>image).map(([role,image])=>({role,image,createdAt:Date.now()})))];
  const scanData={version:2,analyzedAt:Date.now(),itemPhotoStoredAs:'photo',labelText:quickCaptureDraft.labelText,priceText:quickCaptureDraft.priceText,recognitionAvailable:quickCaptureDraft.ocrAvailable,barcode:quickCaptureDraft.barcode?{value:quickCaptureDraft.barcode,source:'barcode / QR',confidence:.95}:null,suggestions:quickCaptureDraft.suggestions};
  const itemPhoto=quickCaptureDraft.item;
  const currentSessionId=state.settings?.activeShoppingSessionId||'';
  $('#quickCaptureReviewDialog').close();
  unlockPageForQuickCapture();
  openWish(null,'create');
  wishWorkingPhoto=itemPhoto;wishOriginalPhoto=itemPhoto;wishStudioState=null;wishCaptureAssetsDraft=assets;wishScanDataDraft=scanData;wishInputSourceDraft='quick_capture';
  showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);applyWishDialogMode();
  if(picked.itemName)$('#wishName').value=picked.itemName;
  if(picked.brand)$('#wishBrand').value=picked.brand;
  if(picked.size){setWishSelectValue('#wishSize',picked.size);wishScanDataDraft.sizeRaw={value:picked.size,source:quickCaptureDraft.suggestions.size?.source||'label',confidence:Number(quickCaptureDraft.suggestions.size?.confidence||0)};}
  if(picked.currency)$('#wishCurrency').value=picked.currency;
  if(picked.color)setWishSelectValue('#wishColor',picked.color);
  if(picked.pattern)setWishSelectValue('#wishPattern',picked.pattern);
  if(picked.price)$('#wishPrice').value=picked.price;
  if(picked.store)$('#wishStore').value=picked.store;
  if(currentSessionId)$('#wishShoppingSession').value=currentSessionId;
  $('#wishScanStatus').textContent='Quick Capture suggestions applied. Review or override any field before saving.';
  quickCaptureSessionActive=false;quickCapturePickerActive=false;document.body.classList.remove('quick-capture-picker-active');
  quickCaptureDraft={item:'',label:'',price:'',itemName:'',labelText:'',priceText:'',barcode:'',ocrAvailable:true,suggestions:{}};
}

function openWish(w=null,mode='review'){
  wishDialogScrollY=window.scrollY||document.documentElement.scrollTop||0;
  wishDialogMode=w?(mode==='edit'?'edit':'review'):'create';
  $('#wishDialog').classList.toggle('wish-review-mode',wishDialogMode==='review');
  $('#wishDialog').classList.toggle('wish-edit-mode',wishDialogMode!=='review');
  $('#wishDialog').classList.toggle('wish-create-mode',wishDialogMode==='create');
  $('#wishDialogKicker').textContent=wishDialogMode==='review'?'Wish List':'future find';
  $('#wishDialogTitle').textContent=w?(wishDialogMode==='review'?(w.name||displayItemType(w)||'Wishlist item'):'Edit wish'):'Add a wish';
  $('#wishId').value=w?.id||'';wishWorkingPhoto=w?.photo||'';wishOriginalPhoto=w?.originalPhoto||w?.photo||'';wishStudioState=w?.photoStudioState?JSON.parse(JSON.stringify(w.photoStudioState)):null;
  wishCaptureAssetsDraft=Array.isArray(w?.captureAssets)?JSON.parse(JSON.stringify(w.captureAssets)):[];
  wishScanDataDraft=(w?.scanData&&typeof w.scanData==='object')?JSON.parse(JSON.stringify(w.scanData)):{};
  wishInputSourceDraft=w?.inputSource||'manual';
  wishDesireDraft=(()=>{const d=Number(w?.wishlistDesire);return d>=1?Math.min(4,Math.round(d)):null})();
  showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);
  const category=w?.category||'Tops';$('#wishCategory').value=category;populateWishTypeOptions(category,w?.type||'');populateWishSizeOptions(category,w?.size||'');wishFitDrafts={};wishStyleDrafts={};wishAttributeContextKey='';setWishAttributeContext(category,$('#wishType').value,{fit:w?.sizeVariant||'',style:w?.style||''});
  $('#wishName').value=w?.name||'';$('#wishBrand').value=w?.brand||'';$('#wishColor').value=w?.color||'';$('#wishPattern').value=w?.pattern||'';$('#wishSeason').value=w?.season||'';
  $('#wishPrice').value=w?.wishlistPrice??w?.price??'';$('#wishCurrency').value=w?.currency||'USD';$('#wishStore').value=w?.store||'';$('#wishLink').value=w?.productUrl??w?.link??'';$('#wishNotes').value=w?.notes||'';populateWishShoppingSessionSelect(w?.shoppingSessionId||'',!w);if(!w){const currentSession=shoppingSessionById($('#wishShoppingSession').value);if(currentSession?.store&&!$('#wishStore').value.trim())$('#wishStore').value=currentSession.store}closeWishlistEntrySuggestions();
  ['wishPhoto','wishPhotoLibrary','wishCameraPhoto','wishLibraryPhoto'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});
  $('#wishScanStatus').textContent='';$('#wishPhotoMenu').classList.add('hidden');applyWishDialogMode(w);
  if(!$('#wishDialog').open)$('#wishDialog').showModal();const scroller=$('#wishDialog .wish-detail-scroll');if(scroller)scroller.scrollTop=0;
}
function wishReviewValue(value,fallback='Not set'){const v=String(value??'').trim();return v||fallback}
function wishlistDesireLabel(value){const n=Number(value);return n>=1&&n<=4?['','Keep an eye on it','Interested','Really want it','Gotta have it'][n]:''}
function wishDesireHeartsMarkup(){const value=Number(wishDesireDraft)||0;return `<div class="wish-desire-hearts" role="group" aria-label="Wishlist desire rating">${[1,2,3,4].map(n=>`<button type="button" class="wish-heart ${n<=value?'active':''} ${n===value?'selected':''}" data-wish-desire="${n}" aria-label="${n} of 4 hearts: ${esc(wishlistDesireLabel(n))}" title="${esc(wishlistDesireLabel(n))}">♥</button>`).join('')}</div>`}
function renderWishDesirePickers(){const edit=$('#wishEditDesire');if(edit)edit.innerHTML=wishDesireHeartsMarkup()}
async function setWishDesire(value){const n=Math.max(1,Math.min(4,Number(value)||1));wishDesireDraft=n;renderWishDesirePickers();if(wishDialogMode==='review'){const wid=$('#wishId').value,idx=state.wishlist.findIndex(x=>x.id===wid);if(idx>=0){state.wishlist[idx]=normalizeWishlistItem({...state.wishlist[idx],wishlistDesire:n,updatedAt:Date.now()});await saveState();renderWishlist();renderWishReviewDetails();showWishRatingToast(`Rating — ${wishlistDesireLabel(n)}`,3200)}}}
function renderWishReviewDetails(){
  const category=$('#wishCategory').value,type=displayItemType(category,$('#wishType').value),price=formatWishlistPrice($('#wishPrice').value,$('#wishCurrency').value||'USD');
  const garment=[['Category',category],['Type',type],['Brand',$('#wishBrand').value],['Size',$('#wishSize').value]];
  if($('#wishFit').value)garment.push(['Fit',$('#wishFit').value]);if($('#wishStyle').value)garment.push(['Style',$('#wishStyle').value]);
  garment.push(['Color',$('#wishColor').value],['Pattern',$('#wishPattern').value],['Season',$('#wishSeason').value]);
  const session=shoppingSessionById($('#wishShoppingSession').value);
  const shopping=[['Price',price],['Store',$('#wishStore').value],['Shopping session',session?shoppingSessionLabel(session):'']].filter(([,v])=>String(v||'').trim());
  const rawLink=$('#wishLink').value.trim(),safeLink=normalizedProductUrl(rawLink),linkLabel=productUrlDisplay(rawLink);
  const linkRow=rawLink?`<div class="item-review-detail-row wish-review-link-row"><span>Link</span>${safeLink?`<a class="wish-product-link" href="${esc(safeLink)}" target="_blank" rel="noopener noreferrer">${esc(linkLabel)} <span aria-hidden="true">↗</span></a>`:`<strong>${esc(rawLink)}</strong>`}</div>`:'';
  $('#wishReviewDetails').innerHTML=`<div class="wish-review-section"><div class="wish-section-heading"><p class="wish-section-label">Garment</p>${wishDesireHeartsMarkup()}</div><div class="item-review-detail-grid">${garment.map(([k,v])=>`<div class="item-review-detail-row"><span>${esc(k)}</span><strong>${esc(wishReviewValue(v))}</strong></div>`).join('')}</div></div>${shopping.length||linkRow?`<div class="wish-review-section"><p class="wish-section-label">Shopping</p><div class="item-review-detail-grid">${shopping.map(([k,v])=>`<div class="item-review-detail-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}${linkRow}</div></div>`:''}${String($('#wishNotes').value||'').trim()?`<div class="item-review-notes"><span>Notes</span><p>${esc($('#wishNotes').value.trim())}</p></div>`:''}`;
}
function applyWishDialogMode(w=null){
  const reviewing=wishDialogMode==='review',existing=!!$('#wishId').value;
  $('#wishReviewDetails').classList.toggle('hidden',!reviewing);$('#wishEditFields').classList.toggle('hidden',reviewing);
  $('#newWishPhotoActions').classList.toggle('hidden',existing||!!wishWorkingPhoto);
  $('#wishCardUtilityActions').classList.toggle('hidden',!existing&&!wishWorkingPhoto);$('#wishPhotoMenuWrap').classList.toggle('hidden',!existing&&!wishWorkingPhoto);$('#wishSmartScanBtn').classList.toggle('hidden',!wishWorkingPhoto);$('#wishRestoreOriginalBtn').classList.toggle('hidden',!wishOriginalPhoto||wishWorkingPhoto===wishOriginalPhoto);
  const current=existing?state.wishlist.find(x=>x.id===$('#wishId').value):null,status=current?.wishlistStatus||'active',dismissed=status==='dismissed';
  $('#saveWishBtn').textContent=reviewing?'Edit':(existing?'Save':'Add to Wishlist');$('#cancelWishBtn').textContent=reviewing?'Close':'Cancel';
  $('#deleteWishBtn').classList.toggle('hidden',!existing);$('#deleteWishBtn').textContent=dismissed?'Restore':'Remove';
  $('#purchaseWishBtn').classList.toggle('hidden',!existing||!reviewing||status!=='active');
  $('#saveWishBtn').classList.toggle('hidden',status==='purchased');
  if(reviewing)renderWishReviewDetails();else renderWishDesirePickers();
}
function enterWishEditMode(){if(wishDialogMode!=='review')return;wishDialogMode='edit';$('#wishDialog').classList.remove('wish-review-mode','wish-create-mode');$('#wishDialog').classList.add('wish-edit-mode');$('#wishDialogKicker').textContent='future find';$('#wishDialogTitle').textContent='Edit wish';applyWishDialogMode()}
function cancelWishEditToReview(){const wid=$('#wishId').value,live=state.wishlist.find(x=>x.id===wid);if(!live)return closeWishWithoutSaving();openWish(live,'review')}
async function handleWishPhotoSelection(e,source='library'){const f=e.target.files&&e.target.files[0];if(!f){e.target.value='';return}if(wishDialogMode==='review')enterWishEditMode();wishWorkingPhoto=await fileToDataURL(f,900,.74);if(!wishOriginalPhoto)wishOriginalPhoto=wishWorkingPhoto;wishStudioState=null;if(!$('#wishId').value&&wishInputSourceDraft==='manual')wishInputSourceDraft=source;showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);$('#wishScanStatus').textContent='Photo ready. Review or edit it before saving.';$('#wishPhotoMenu').classList.add('hidden');applyWishDialogMode();e.target.value=''}
function restoreWishlistViewport(){const active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();requestAnimationFrame(()=>{window.scrollTo(0,wishDialogScrollY||0);setTimeout(()=>window.scrollTo(0,wishDialogScrollY||0),80)})}
function closeWishWithoutSaving(){const d=$('#wishDialog');const active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();wishWorkingPhoto='';wishOriginalPhoto='';wishStudioState=null;wishCaptureAssetsDraft=[];wishScanDataDraft={};wishInputSourceDraft='manual';$('#wishPhotoMenu')?.classList.add('hidden');if(d?.open)d.close()}
function restoreWishCapturedOriginal(){if(!wishOriginalPhoto)return toast('No captured original is available');if(wishWorkingPhoto!==wishOriginalPhoto&&!confirm('Restore the original photo? This will replace the current photo edits for this wish.'))return;wishWorkingPhoto=wishOriginalPhoto;wishStudioState=null;showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);$('#wishRestoreOriginalBtn').classList.add('hidden');$('#wishScanStatus').textContent='Original photo restored.';toast('Original photo restored')}
async function saveWish(){
  const wid=$('#wishId').value,old=state.wishlist.find(x=>x.id===wid),now=Date.now(),category=$('#wishCategory').value,type=$('#wishType').value;
  const wishlistPrice=$('#wishPrice').value.trim(),productUrl=$('#wishLink').value.trim();
  if(!wid&&productUrl&&wishInputSourceDraft==='manual')wishInputSourceDraft='url_manual';
  const obj=normalizeWishlistItem({...(old||{}),id:wid||id(),photo:wishWorkingPhoto,originalPhoto:wishOriginalPhoto||wishWorkingPhoto,photoStudioState:wishStudioState,name:$('#wishName').value.trim(),brand:$('#wishBrand').value.trim(),category,categoryId:categoryIdFor(category),type,size:$('#wishSize').value,sizeRaw:String(wishScanDataDraft?.sizeRaw?.value||old?.sizeRaw||''),sizeVariant:cleanedItemFit(category,$('#wishFit').value),style:cleanedItemStyle(category,type,$('#wishStyle').value),color:$('#wishColor').value,pattern:$('#wishPattern').value,season:$('#wishSeason').value,wishlistPrice,price:wishlistPrice,currency:$('#wishCurrency').value||'USD',store:$('#wishStore').value.trim(),shoppingSessionId:$('#wishShoppingSession').value||'',productUrl,link:productUrl,notes:$('#wishNotes').value.trim(),wishlistDesire:wishDesireDraft,lifecycle:'wishlist',wishlistStatus:old?.wishlistStatus||'active',inputSource:wishInputSourceDraft||old?.inputSource||'manual',captureAssets:wishCaptureAssetsDraft,scanData:wishScanDataDraft,sourceMetadata:{...(old?.sourceMetadata||{}),productUrlAdded:!!productUrl},barcode:String(wishScanDataDraft?.barcode?.value||old?.barcode||''),createdAt:old?.createdAt||old?.created||now,created:old?.createdAt||old?.created||now,updatedAt:now});
  const desireChanged=Number(old?.wishlistDesire||0)!==Number(obj.wishlistDesire||0);
  rememberBrandSuggestion(obj.brand);rememberStoreSuggestion(obj.store);
  if(wid)state.wishlist=state.wishlist.map(x=>x.id===wid?obj:x);else{state.wishlist.unshift(obj);ensureSettings();state.settings.wishlistOrder=[obj.id,...state.settings.wishlistOrder.filter(id=>id!==obj.id)]}await saveState();renderWishlist();
  if(wid){openWish(obj,'review');if(desireChanged&&obj.wishlistDesire)showWishRatingToast(`Rating — ${wishlistDesireLabel(obj.wishlistDesire)}`,3200);else toast('Wishlist updated')}else{$('#wishDialog').close();toast(desireChanged&&obj.wishlistDesire?`Rating — ${wishlistDesireLabel(obj.wishlistDesire)}`:'Wishlist saved',desireChanged&&obj.wishlistDesire?3200:1800)}
}
async function deleteWish(){
  const wid=$('#wishId').value,w=state.wishlist.find(x=>x.id===wid);if(!w)return;
  if((w.wishlistStatus||'active')==='dismissed'){
    w.wishlistStatus='active';w.dismissedAt=null;w.updatedAt=Date.now();ensureSettings();
    const activeIds=state.settings.wishlistOrder.filter(id=>id!==wid&&state.wishlist.some(x=>x.id===id&&(x.wishlistStatus||'active')==='active'));
    const requested=Number.isInteger(Number(w.wishlistPreviousOrderIndex))?Number(w.wishlistPreviousOrderIndex):activeIds.length;
    const insertAt=Math.max(0,Math.min(activeIds.length,requested));
    activeIds.splice(insertAt,0,wid);state.settings.wishlistOrder=activeIds;w.wishlistPreviousOrderIndex=null;
    if(await saveState()===false)return;wishlistView='all';$('#wishDialog').close();renderWishlist();toast('Wish restored');return;
  }
  if(!confirm('Remove this item from your active Wishlist? You can restore it later from Removed.'))return;
  ensureSettings();const previousOrder=orderedActiveWishlist().map(x=>x.id);w.wishlistPreviousOrderIndex=Math.max(0,previousOrder.indexOf(wid));
  w.wishlistStatus='dismissed';w.dismissedAt=Date.now();w.updatedAt=Date.now();state.settings.wishlistOrder=state.settings.wishlistOrder.filter(id=>id!==wid);
  if(await saveState()===false)return;$('#wishDialog').close();renderWishlist();toast('Moved to Removed');
}
function openPurchaseWish(){
  const wid=$('#wishId').value,w=state.wishlist.find(x=>x.id===wid);if(!w||w.wishlistStatus!=='active')return;
  $('#purchaseWishId').value=wid;$('#purchaseWishDate').value=localTodayISO();
  $('#purchaseWishAcquired').innerHTML=ACQUIRED.map(a=>`<option>${esc(a)}</option>`).join('');
  $('#purchaseWishAcquired').value='Bought new';$('#purchaseWishPrice').value=w.wishlistPrice??w.price??'';$('#purchaseWishCurrency').value=w.currency||'USD';
  $('#purchaseWishSummary').textContent=[w.name||displayItemType(w),w.brand].filter(Boolean).join(' · ');
  updatePurchaseWishPriceVisibility();
  $('#purchaseWishDialog').showModal();
}
function acquisitionUsesPrice(acquired){return !['Gifted','Hand-me-down','DIY'].includes(String(acquired||''))}
function updatePurchaseWishPriceVisibility(){
  const show=acquisitionUsesPrice($('#purchaseWishAcquired')?.value);
  $('#purchaseWishPriceFields')?.classList.toggle('hidden',!show);
  $('#purchaseWishPriceNote')?.classList.toggle('hidden',show);
}
async function completeWishPurchase(){
  const wid=$('#purchaseWishId').value,w=state.wishlist.find(x=>x.id===wid);if(!w)return $('#purchaseWishDialog').close();
  if(state.items.some(i=>i.id===wid)){w.wishlistStatus='purchased';w.purchasedAt=$('#purchaseWishDate').value||localTodayISO();await saveState();$('#purchaseWishDialog').close();$('#wishDialog').close();renderAll();return toast('This piece is already in your Closet')}
  const purchaseDate=$('#purchaseWishDate').value||localTodayISO(),acquired=$('#purchaseWishAcquired').value||'Bought new',purchasePrice=acquisitionUsesPrice(acquired)?$('#purchaseWishPrice').value.trim():'',purchaseCurrency=$('#purchaseWishCurrency').value||w.currency||'USD';
  const item={
    id:w.id,photo:w.photo||'',originalPhoto:w.originalPhoto||w.photo||'',photoStudioCutoutApplied:!!w.photoStudioCutoutApplied,photoStudioState:w.photoStudioState||null,
    name:w.name||'',category:w.category,categoryId:w.categoryId||categoryIdFor(w.category),type:w.type||'',brand:w.brand||'',size:w.size||'',sizeVariant:w.sizeVariant||'',style:w.style||'',color:w.color||'',pattern:w.pattern||'Solid',season:w.season||'All-season',notes:w.notes||'',
    acquired,acquiredDate:purchaseDate,purchasePrice,purchaseCurrency,purchaseStore:w.store||'',wishlistOriginId:w.id,wishlistAddedAt:w.createdAt||w.created||null,wishlistPrice:w.wishlistPrice??w.price??'',wishlistDesireAtAcquisition:w.wishlistDesire||0,created:Date.now(),wears:0,status:'active',statusDate:''
  };
  state.items=[item,...state.items.filter(i=>i.id!==item.id)];rememberBrandSuggestion(item.brand);ensureSettings();const order=state.settings.closetOrder[item.category]||[];state.settings.closetOrder[item.category]=[item.id,...order.filter(id=>id!==item.id)];
  w.wishlistStatus='purchased';w.purchasedAt=purchaseDate;w.purchasePrice=purchasePrice;w.purchaseCurrency=purchaseCurrency;w.acquiredMethod=acquired;w.wishlistDesireAtAcquisition=w.wishlistDesire||0;w.updatedAt=Date.now();state.settings.wishlistOrder=state.settings.wishlistOrder.filter(id=>id!==wid);
  if(await saveState()===false)return toast('Could not move this item — please try again');
  $('#purchaseWishDialog').close();$('#wishDialog').close();renderAll();showAcquisitionMoment(item,w);
}
let acquisitionMomentItemId='';
function acquisitionMomentDate(value){
  if(!value)return '';
  const d=typeof value==='number'?new Date(value):new Date(String(value).length===10?`${value}T12:00:00`:value);
  if(Number.isNaN(d.getTime()))return '';
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
function acquisitionMomentDuration(startValue,endValue){
  if(!startValue||!endValue)return '';
  const start=typeof startValue==='number'?new Date(startValue):new Date(String(startValue).length===10?`${startValue}T12:00:00`:startValue),end=typeof endValue==='number'?new Date(endValue):new Date(String(endValue).length===10?`${endValue}T12:00:00`:endValue);
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return '';
  const days=Math.max(0,Math.round((end-start)/86400000));
  if(days<1)return 'It made it to your Closet today.';
  if(days===1)return 'Wanted for 1 day before it made it to your Closet.';
  return `Wanted for ${days.toLocaleString()} days before it made it to your Closet.`;
}
function showAcquisitionMoment(item,wish){
  const dialog=$('#acquisitionMomentDialog');if(!dialog)return toast('Moved to Closet');
  acquisitionMomentItemId=item.id;
  $('#acquisitionMomentPhoto').innerHTML=item.photo?`<img src="${item.photo}" alt="${esc(item.name||displayItemType(item)||'Closet piece')}" draggable="false">`:'<div class="acquisition-moment-placeholder">♥</div>';
  $('#acquisitionMomentTitle').textContent=item.name||displayItemType(item)||'New closet piece';
  const rating=Math.max(0,Math.min(4,Number(item.wishlistDesireAtAcquisition||wish?.wishlistDesire||0)));
  const ratingBox=$('#acquisitionMomentRating');ratingBox.innerHTML=rating?`${Array.from({length:4},(_,i)=>`<span class="${i<rating?'filled':''}" aria-hidden="true">♥</span>`).join('')}<small>${esc(wishlistDesireLabel(rating))}</small>`:'';
  ratingBox.classList.toggle('hidden',!rating);
  const wished=acquisitionMomentDate(item.wishlistAddedAt),acquired=acquisitionMomentDate(item.acquiredDate);
  $('#acquisitionMomentMeta').textContent=[wished?`Wishlisted ${wished}`:'',acquired?`Acquired ${acquired}`:''].filter(Boolean).join(' · ');
  const wait=acquisitionMomentDuration(item.wishlistAddedAt,item.acquiredDate),waitEl=$('#acquisitionMomentWait');waitEl.textContent=wait;waitEl.classList.toggle('hidden',!wait);
  dialog.classList.remove('moment-entered');dialog.showModal();requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('moment-entered')));
}
function closeAcquisitionMoment(){
  const dialog=$('#acquisitionMomentDialog');if(dialog?.open)dialog.close();acquisitionMomentItemId='';showScreen('wishlist');renderWishlist();
}
function viewAcquiredPiece(){
  const iid=acquisitionMomentItemId,item=state.items.find(i=>i.id===iid),dialog=$('#acquisitionMomentDialog');if(dialog?.open)dialog.close();acquisitionMomentItemId='';
  if(!item)return showScreen('catalog');showScreen('catalog');openItem(item,'','review');
}

function formatWishlistPrice(value,currency='USD'){
  if(value===undefined||value===null||String(value).trim()==='')return '';
  const raw=String(value).trim(),numeric=Number(raw.replace(/[^0-9.-]/g,''));
  if(!Number.isFinite(numeric))return raw;
  try{return new Intl.NumberFormat(undefined,{style:'currency',currency:currency||'USD',minimumFractionDigits:Number.isInteger(numeric)?0:2,maximumFractionDigits:2}).format(numeric)}catch{return `${currency==='USD'?'$':''}${numeric.toLocaleString(undefined,{maximumFractionDigits:2})}`}
}
function wishlistListType(w){const type=displayItemType(w);if(type&&type!=='Other')return type;if(w.category)return w.category;return 'Wishlist item'}
function setWishlistView(view){
  if(wishlistReorderMode&&view!=='all')return;
  wishlistView=['all','top10','removed'].includes(view)?view:'all';
  renderWishlist();
}
function toggleWishlistReorderMode(){
  wishlistDragCleanup();
  wishlistReorderMode=!wishlistReorderMode;
  if(wishlistReorderMode)wishlistView='all';
  renderWishlist();
  if(wishlistReorderMode)toast('Drag items to rank your Wishlist');
}
function orderedActiveWishlist(){
  ensureSettings();
  const active=state.wishlist.filter(w=>(w.wishlistStatus||'active')==='active'),byId=new Map(active.map(w=>[w.id,w]));
  return [...state.settings.wishlistOrder.filter(id=>byId.has(id)).map(id=>byId.get(id)),...active.filter(w=>!state.settings.wishlistOrder.includes(w.id))];
}
function wishlistDragCleanup(){
  clearTimeout(wishlistDrag.timer);
  wishlistDrag.target?.classList.remove('wishlist-drop-target','drop-before','drop-after');
  wishlistDrag.ghost?.remove();wishlistDrag.placeholder?.remove();
  wishlistDrag.card?.classList.remove('wishlist-drag-source');
  $$('#wishlistGrid .wish-card').forEach(card=>{card.style.height='';card.style.minHeight='';card.style.maxHeight=''});
  document.body.classList.remove('wishlist-reordering');
  wishlistDrag={timer:null,pointerId:null,startY:0,active:false,card:null,id:null,ghost:null,placeholder:null,target:null,targetAfter:false,originalOrder:[],lastTargetId:null,lastTargetAfter:false};
}
function beginWishlistDrag(card,e){
  if(!wishlistReorderMode||wishlistView!=='all')return;
  clearTimeout(wishlistDrag.timer);
  const originalOrder=orderedActiveWishlist().map(w=>w.id);
  wishlistDrag={timer:null,pointerId:e.pointerId,startY:e.clientY,active:false,card,id:card.dataset.id,ghost:null,placeholder:null,target:null,targetAfter:false,originalOrder,lastTargetId:null,lastTargetAfter:false};
  wishlistDrag.timer=setTimeout(()=>{
    if(!wishlistDrag.card)return;
    wishlistDrag.active=true;suppressWishlistClickUntil=Date.now()+650;document.body.classList.add('wishlist-reordering');
    // Freeze every visible row before the drag begins. Target highlights therefore cannot
    // change row geometry or make the rows below jump while the finger crosses boundaries.
    $$('#wishlistGrid .wish-card').forEach(row=>{const rr=row.getBoundingClientRect();row.style.height=rr.height+'px';row.style.minHeight=rr.height+'px';row.style.maxHeight=rr.height+'px'});
    const r=card.getBoundingClientRect(),ghost=card.cloneNode(true);
    ghost.classList.add('wishlist-drag-ghost');ghost.querySelector('.wish-reorder-handle')?.remove();
    Object.assign(ghost.style,{left:(r.left+2)+'px',top:r.top+'px',width:Math.max(1,r.width-4)+'px',height:r.height+'px'});
    card.classList.add('wishlist-drag-source');document.body.appendChild(ghost);
    wishlistDrag.ghost=ghost;wishlistDrag.placeholder=null;
    if(card.setPointerCapture)try{card.setPointerCapture(e.pointerId)}catch{}
  },120);
}
function moveWishlistDrag(e){
  const d=wishlistDrag;if(!d.card||d.pointerId!==e.pointerId)return;
  if(!d.active){if(Math.abs(e.clientY-d.startY)>10)wishlistDragCleanup();return}
  if(e.cancelable)e.preventDefault();
  const g=d.ghost;if(g){const h=g.getBoundingClientRect().height;g.style.top=(e.clientY-h*.5)+'px'}
  const cards=[...$('#wishlistGrid').querySelectorAll('.wish-card:not(.wishlist-drag-source)')];
  let target=null,targetAfter=false;
  for(const c of cards){
    const r=c.getBoundingClientRect();
    if(e.clientY>=r.top&&e.clientY<=r.bottom){
      target=c;
      // A small neutral zone around the midpoint prevents rapid before/after flipping
      // when the finger hovers on the boundary between insertion positions.
      const mid=r.top+r.height/2,dead=Math.min(7,r.height*.10);
      if(d.target===c&&Math.abs(e.clientY-mid)<=dead)targetAfter=d.targetAfter;
      else targetAfter=e.clientY>=mid;
      break;
    }
  }
  if(d.target!==target||d.targetAfter!==targetAfter){
    d.target?.classList.remove('wishlist-drop-target','drop-before','drop-after');
    d.target=target;d.targetAfter=targetAfter;
    if(d.target)d.target.classList.add('wishlist-drop-target',targetAfter?'drop-after':'drop-before');
  }
  const edge=72;if(e.clientY<edge)window.scrollBy(0,-8);else if(e.clientY>window.innerHeight-edge)window.scrollBy(0,8);
}
async function finishWishlistDrag(e,canceled=false){
  const d=wishlistDrag;if(!d.card||d.pointerId!==e.pointerId)return;
  clearTimeout(d.timer);
  if(d.active){
    if(e.cancelable)e.preventDefault();
    if(!canceled&&d.target){
      const ids=d.originalOrder.filter(id=>id!==d.id);
      const targetIndex=ids.indexOf(d.target.dataset.id);
      if(targetIndex>=0)ids.splice(targetIndex+(d.targetAfter?1:0),0,d.id);
      const changed=ids.length===d.originalOrder.length&&ids.some((id,i)=>id!==d.originalOrder[i]);
      if(changed){
        ensureSettings();const activeIds=new Set(d.originalOrder);
        const inactive=state.settings.wishlistOrder.filter(id=>!activeIds.has(id));
        state.settings.wishlistOrder=[...ids,...inactive.filter(id=>!ids.includes(id))];
        await saveState();
        wishlistDragCleanup();
        renderWishlist();toast('Wishlist order saved');
        return;
      }
    }
  }
  // Dropping outside another row, canceling, or choosing the same slot restores the
  // original queue exactly as it was; nothing is persisted and no row appears deleted.
  wishlistDragCleanup();
}
function bindWishlistReorder(){
  $$('.wish-reorder-handle').forEach(handle=>{
    const card=handle.closest('.wish-card');
    handle.onpointerdown=e=>{e.preventDefault();e.stopPropagation();beginWishlistDrag(card,e)};
  });
  $$('.wish-card').forEach(card=>{
    card.onpointermove=moveWishlistDrag;
    card.onpointerup=e=>finishWishlistDrag(e,false);
    card.onpointercancel=e=>finishWishlistDrag(e,true);
  });
}
function renderWishlist(){
  renderActiveShoppingSession();
  const ordered=orderedActiveWishlist(),removed=state.wishlist.filter(w=>(w.wishlistStatus||'active')==='dismissed').slice().sort((a,b)=>(b.dismissedAt||b.updatedAt||0)-(a.dismissedAt||a.updatedAt||0)),visible=wishlistView==='top10'?ordered.slice(0,10):wishlistView==='removed'?removed:ordered;
  $('#wishlistAllBtn')?.classList.toggle('active',wishlistView==='all');$('#wishlistTop10Btn')?.classList.toggle('active',wishlistView==='top10');$('#wishlistRemovedBtn')?.classList.toggle('active',wishlistView==='removed');
  $('#wishlistTop10Btn').textContent=`Top 10${ordered.length?` (${Math.min(10,ordered.length)})`:''}`;
  $('#wishlistGrid').classList.toggle('wishlist-top10-view',wishlistView==='top10');$('#wishlistGrid').classList.toggle('wishlist-removed-view',wishlistView==='removed');
  $('#wishlistGrid').classList.toggle('wishlist-reorder-mode',wishlistReorderMode);
  const reorderBtn=$('#wishlistReorderBtn');if(reorderBtn){reorderBtn.textContent=wishlistReorderMode?'Done':'Reorder';reorderBtn.classList.toggle('active',wishlistReorderMode);reorderBtn.classList.toggle('hidden',wishlistView==='removed');reorderBtn.setAttribute('aria-pressed',wishlistReorderMode?'true':'false')}
  if($('#wishlistTop10Btn'))$('#wishlistTop10Btn').disabled=wishlistReorderMode;if($('#wishlistRemovedBtn'))$('#wishlistRemovedBtn').disabled=wishlistReorderMode;
  $('#wishlistGrid').innerHTML=visible.map((w,index)=>{
    const rawPrice=w.wishlistPrice??w.price??'',price=formatWishlistPrice(rawPrice,w.currency||'USD'),desire=wishlistDesireLabel(w.wishlistDesire),desireValue=Number(w.wishlistDesire),link=w.productUrl||w.link,safeRowLink=normalizedProductUrl(link);
    const meta=[w.brand,w.color].filter(Boolean).join(' · ');
    const desireMark=desireValue>=1&&desireValue<=4?`<div class="wish-desire" title="${esc(desire)}" aria-label="Desire ${desireValue} of 4: ${esc(desire)}"><span aria-hidden="true">${'♥'.repeat(desireValue)}${'♡'.repeat(4-desireValue)}</span></div>`:'';
    const rank=wishlistView==='top10'?`<span class="wish-rank">#${index+1}</span>`:'';
    const handle=wishlistReorderMode?`<button type="button" class="wish-reorder-handle" aria-label="Reorder ${esc(w.name||wishlistListType(w))}" title="Drag to reorder"><span></span><span></span><span></span></button>`:'';
    return `<article class="wish-card" data-id="${esc(w.id)}" tabindex="${wishlistReorderMode?'-1':'0'}" role="${wishlistReorderMode?'listitem':'button'}" aria-label="${wishlistReorderMode?'Reorder':'Open'} ${esc(w.name||wishlistListType(w))}"><div class="wish-photo">${w.photo?`<img src="${w.photo}" alt="" draggable="false">`:'♡'}</div><div class="wish-body"><div class="wish-title-line">${rank}<h4>${esc(w.name||wishlistListType(w))}</h4></div>${desireMark}<p class="wish-type">${esc(wishlistListType(w))}</p>${meta?`<p>${esc(meta)}</p>`:''}${w.store?`<p class="wish-store">${esc(w.store)}</p>`:''}${w.shoppingSessionId&&shoppingSessionById(w.shoppingSessionId)?`<p class="wish-session">${esc(shoppingSessionById(w.shoppingSessionId).name)}</p>`:''}</div><div class="wish-side">${price?`<div class="price">${esc(price)}</div>`:''}${safeRowLink?`<a class="wish-link-mark" href="${esc(safeRowLink)}" target="_blank" rel="noopener noreferrer" aria-label="Open product link for ${esc(w.name||wishlistListType(w))}">link ↗</a>`:''}<span class="wish-chevron" aria-hidden="true">›</span>${handle}</div></article>`
  }).join('');
  const empty=$('#wishlistEmpty');empty.classList.toggle('hidden',visible.length>0);if(!visible.length){const h=empty.querySelector('h3'),p=empty.querySelector('p');if(wishlistView==='removed'){h.textContent='Nothing removed';p.textContent='Items you remove from your Wishlist can be restored here.'}else{h.textContent='Save future finds';p.textContent='Add a photo, link, price and brand. Wishlist pieces can be tried on your Outfit Board.'}}
  $$('.wish-card').forEach(c=>{const open=()=>{if(wishlistReorderMode||Date.now()<suppressWishlistClickUntil)return;openWish(state.wishlist.find(w=>w.id===c.dataset.id))};c.onclick=e=>{if(wishlistReorderMode||e.target.closest('.wish-reorder-handle,.wish-link-mark'))return;open()};c.onkeydown=e=>{if(e.target.closest?.('.wish-link-mark'))return;if(!wishlistReorderMode&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open()}}});
  $$('.wish-link-mark').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));
  bindWishlistReorder();
}


function bindBoard(){
  $('#newBoardBtn').onclick=startNewOutfit;
  $('#clearBoardBtn').onclick=clearBoard;$('#saveOutfitBtn').onclick=requestSaveOutfit;$('#shareOutfitBtn').onclick=()=>requestOutfitShare(null);
  $('#confirmSaveOutfitBtn').onclick=saveOutfit;$('#cancelOutfitSaveBtn').onclick=()=>$('#outfitSaveDialog').close();$('#closeOutfitSaveBtn').onclick=()=>$('#outfitSaveDialog').close();
  $('#shareNowBtn').onclick=sharePreparedOutfit;
  $('#openShareImageBtn').onclick=openPreparedShareImage;
  $('#closeSharePreviewBtn').onclick=closeSharePreview;
  $$('.tabs-small button').forEach(b=>b.onclick=()=>{traySource=b.dataset.source;trayCategory='Recent';$$('.tabs-small button').forEach(x=>x.classList.toggle('active',x===b));renderPieceTray()});
  $('#decorateToggle').onclick=()=>{const panel=$('#creativeTools');const opening=panel.classList.contains('hidden');panel.classList.toggle('hidden');$('#decorateToggle').classList.toggle('active',opening);$('#decorateToggle').firstChild.textContent=opening?'− Decorate ':'＋ Decorate '};
  $('#addBoardTextBtn').onclick=()=>{const text=$('#boardTextInput').value.trim();if(!text)return toast('Type something first');addCreativeItem('text',text);$('#boardTextInput').value=''};
  $$('.sticker-row [data-sticker]').forEach(b=>b.onclick=()=>addCreativeItem('sticker',b.dataset.sticker));
  $$('.shape-row [data-shape]').forEach(b=>b.onclick=()=>addCreativeItem('shape',b.dataset.shape));
  $('#bringFrontBtn').onclick=()=>layerSelected('front');$('#sendBackBtn').onclick=()=>layerSelected('back');
  $('#rotateLeftBtn').onclick=()=>rotateSelected(-10);$('#rotateRightBtn').onclick=()=>rotateSelected(10);
  $('#duplicateBoardBtn').onclick=duplicateSelected;$('#deleteBoardBtn').onclick=deleteSelected;$('#undoBoardBtn').onclick=undoBoardDelete;
  $('#drawModeBtn').onclick=()=>{doodleMode=!doodleMode;$('#drawModeBtn').classList.toggle('active',doodleMode);$('#outfitBoard').classList.toggle('drawing',doodleMode);$('#boardHelp').textContent=doodleMode?'Doodle mode: draw directly on the board. Tap doodle again when finished.':'Select an object to move, resize, rotate, layer or delete it.'};
  const board=$('#outfitBoard');
  board.addEventListener('pointerdown',startDoodle);
  board.addEventListener('pointermove',moveDoodle);
  board.addEventListener('pointerup',endDoodle);
  board.addEventListener('pointercancel',endDoodle);
  board.addEventListener('pointerdown',e=>{if(!doodleMode&&e.target===board){selectedBoardUid=null;drawBoard()}});
}
function renderOutfits(){populatePortfolioFolderSelect($('#outfitFolder').value);renderPieceTray()}
function boardHasDraft(){return boardItems.length>0}
function guardBoardSwitch(action,label='replace the current board'){if(typeof action!=='function')return;if(!boardHasDraft()){action();return}pendingBoardSwitchAction=action;const msg=$('#boardConflictMessage');if(msg)msg.textContent=`There is already a look on the Design Board. Save it before you ${label}, replace it, or cancel and keep working.`;const d=$('#boardConflictDialog');if(d&&!d.open)d.showModal()}
async function saveCurrentBoardForSwitch(){if(!boardItems.length)return true;const name=$('#outfitName').value.trim()||'Untitled look';const board=$('#outfitBoard');ensureSettings();const prior=editingOutfitId?state.outfits.find(x=>x.id===editingOutfitId):null,priorFolder=prior?.folder||'';const snapshot={name,notes:$('#outfitNotes').value.trim(),folder:$('#outfitFolder').value||state.settings.portfolioFolders[0]||'Everyday',favorite:prior?.favorite||false,pieces:boardItems.map(x=>({...x})),boardWidth:board.clientWidth,boardHeight:board.clientHeight};let savedId=editingOutfitId;if(savedId){const existing=state.outfits.find(x=>x.id===savedId);if(existing)Object.assign(existing,snapshot,{updated:Date.now()});else savedId=null}if(!savedId){const created={id:id(),...snapshot,created:Date.now()};state.outfits.unshift(created);savedId=created.id;editingOutfitId=savedId}ensureSettings();if(priorFolder&&priorFolder!==snapshot.folder&&state.settings.portfolioOrder[priorFolder])state.settings.portfolioOrder[priorFolder]=state.settings.portfolioOrder[priorFolder].filter(x=>x!==savedId);let order=state.settings.portfolioOrder[snapshot.folder]||(state.settings.portfolioOrder[snapshot.folder]=[]);if(!prior||priorFolder!==snapshot.folder){order=order.filter(x=>x!==savedId);order.unshift(savedId);state.settings.portfolioOrder[snapshot.folder]=order}else if(!order.includes(savedId))order.unshift(savedId);const ok=await saveState();if(ok===false)return false;renderSavedOutfits();return true}
async function saveBoardBeforeSwitch(){const action=pendingBoardSwitchAction;pendingBoardSwitchAction=null;const d=$('#boardConflictDialog');if(d?.open)d.close();const ok=await saveCurrentBoardForSwitch();if(!ok){toast('Could not save the current board');return}toast('Current board saved');if(action)action()}
function replaceBoardForSwitch(){const action=pendingBoardSwitchAction;pendingBoardSwitchAction=null;const d=$('#boardConflictDialog');if(d?.open)d.close();if(action)action()}
function cancelBoardSwitch(){pendingBoardSwitchAction=null;const d=$('#boardConflictDialog');if(d?.open)d.close();toast('Kept the current board')}
function startNewOutfit(){editingOutfitId=null;boardUndoStack=[];clearBoard();$('#outfitName').value='';$('#outfitNotes').value='';populatePortfolioFolderSelect(state.settings.portfolioFolders[0]||'Everyday');$('#saveOutfitBtn').textContent='Save outfit';toast('New outfit board')}
function populatePortfolioFolderSelect(selected=''){
  ensureSettings();
  const folders=state.settings.portfolioFolders;
  const value=folders.includes(selected)?selected:(folders[0]||'Everyday');
  $('#outfitFolder').innerHTML=folders.map(f=>`<option${f===value?' selected':''}>${esc(f)}</option>`).join('');
}
function renderPieceTray(){
  ensureSettings();
  const all=traySource==='closet'?state.items.filter(i=>!isArchived(i)):state.wishlist.filter(w=>(w.wishlistStatus||'active')==='active');
  const validRecent=(state.settings.boardRecent[traySource]||[]).filter(pid=>all.some(x=>x.id===pid));
  const cats=['Recent','All',...CATEGORIES.filter(c=>all.some(x=>x.category===c))];
  if(!cats.includes(trayCategory)||(trayCategory==='Recent'&&!validRecent.length))trayCategory=validRecent.length?'Recent':'All';
  $('#outfitCategoryFilter').innerHTML=cats.map(c=>`<button class="${trayCategory===c?'active':''}" data-traycat="${c}">${c}<span>${c==='Recent'?validRecent.length:c==='All'?all.length:all.filter(x=>x.category===c).length}</span></button>`).join('');
  $$('#outfitCategoryFilter [data-traycat]').forEach(b=>b.onclick=()=>{trayCategory=b.dataset.traycat;renderPieceTray()});
  let arr;
  if(trayCategory==='Recent')arr=validRecent.map(pid=>all.find(x=>x.id===pid)).filter(Boolean);
  else arr=all.filter(x=>trayCategory==='All'||x.category===trayCategory);
  $('#pieceTray').innerHTML=arr.map(x=>`<button class="tray-piece" data-id="${x.id}" data-source="${traySource}"><div class="mini-photo">${x.photo?`<img src="${x.photo}">`:'✣'}</div><small>${esc(x.type||x.name||x.category)}</small><em>${esc(x.category||'')}</em></button>`).join('')||`<p class="tray-empty">${trayCategory==='Recent'?'Recently used pieces will appear here.':'No pieces in this category yet.'}</p>`;
  $$('.tray-piece').forEach(b=>b.onclick=()=>addBoardPiece(b.dataset.id,b.dataset.source));
}
function nextZ(){return Math.max(0,...boardItems.map(x=>Number(x.z)||0))+1}
function addBoardPiece(pid,source){const src=source==='closet'?state.items:state.wishlist,obj=src.find(x=>x.id===pid);if(!obj)return;const bi={uid:id(),kind:'piece',source,id:pid,x:28+Math.random()*120,y:42+Math.random()*100,w:146,h:172,rotation:0,z:nextZ()};boardItems.push(bi);selectedBoardUid=bi.uid;ensureSettings();state.settings.boardRecent[source]=[pid,...state.settings.boardRecent[source].filter(x=>x!==pid)].slice(0,18);persistState(state).catch(()=>{});drawBoard();renderPieceTray()}
function addCreativeItem(kind,value){const defaults=kind==='text'?{w:180,h:70}:{w:90,h:90};const bi={uid:id(),kind,value,x:60+Math.random()*90,y:70+Math.random()*80,...defaults,rotation:kind==='shape'&&value==='tape'?-8:0,z:nextZ()};if(kind==='shape'&&value==='line'){bi.w=170;bi.h=35}boardItems.push(bi);selectedBoardUid=bi.uid;drawBoard()}
function normalizeBoardItem(b){b.kind=b.kind||'piece';b.w=Number(b.w)||132;b.h=Number(b.h)||156;b.rotation=Number(b.rotation)||0;b.z=Number(b.z)||1;return b}
function boardItemContent(b){
  if(b.kind==='piece'){const obj=(b.source==='closet'?state.items:state.wishlist).find(x=>x.id===b.id);if(!obj)return '';return obj.photo?`<img src="${obj.photo}" alt="">`:`<div class="piece-fallback">${esc(obj.name||displayItemType(obj)||'piece')}</div>`}
  if(b.kind==='text')return `<div class="board-text">${esc(b.value)}</div>`;
  if(b.kind==='sticker')return `<div class="board-sticker">${esc(b.value)}</div>`;
  if(b.kind==='shape')return `<div class="board-shape shape-${esc(b.value)}"></div>`;
  if(b.kind==='doodle')return `<svg class="doodle-svg" viewBox="0 0 ${Math.max(1,b.w)} ${Math.max(1,b.h)}" preserveAspectRatio="none"><polyline points="${esc(b.points||'')}" fill="none" vector-effect="non-scaling-stroke"/></svg>`;
  return '';
}
function drawBoard(){
  const board=$('#outfitBoard');board.querySelectorAll('.board-piece').forEach(x=>x.remove());const tip=board.querySelector('.board-tip');tip.style.display=boardItems.length?'none':'flex';
  boardItems.map(normalizeBoardItem).sort((a,b)=>a.z-b.z).forEach(b=>{const content=boardItemContent(b);if(!content)return;const el=document.createElement('div');el.className='board-piece kind-'+b.kind+(selectedBoardUid===b.uid?' selected':'');el.dataset.uid=b.uid;el.style.left=b.x+'px';el.style.top=b.y+'px';el.style.width=b.w+'px';el.style.height=b.h+'px';el.style.zIndex=b.z;el.style.transform=`rotate(${b.rotation}deg)`;el.innerHTML=`<div class="board-object">${content}</div><button type="button" class="board-remove-handle" aria-label="Remove from board">×</button><button type="button" class="resize-handle" aria-label="Resize">↘</button>`;makeBoardInteractive(el,b);board.appendChild(el)});
  const selected=boardItems.find(x=>x.uid===selectedBoardUid);updateBoardEditControls(!!selected);if(selected&&!doodleMode)$('#boardHelp').textContent='Drag gently to move. Pinch to resize + rotate. Use Front / Back for layering.';updateUndoButton();
}
function makeBoardInteractive(el,model){
  const pointers=new Map();let gesture=null;
  const board=$('#outfitBoard');
  function clampPosition(){model.x=Math.max(-model.w*.55,Math.min(board.clientWidth-model.w*.45,model.x));model.y=Math.max(-model.h*.55,Math.min(board.clientHeight-model.h*.45,model.y))}
  function twoPointStats(){const pts=[...pointers.values()];if(pts.length<2)return null;const a=pts[0],b=pts[1],dx=b.x-a.x,dy=b.y-a.y;return{dist:Math.hypot(dx,dy),angle:Math.atan2(dy,dx)*180/Math.PI,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2}}
  el.addEventListener('pointerdown',e=>{if(doodleMode)return;e.stopPropagation();if(e.target.classList.contains('board-remove-handle')){e.preventDefault();removeBoardItem(model.uid);return}selectedBoardUid=model.uid;model.z=model.z||nextZ();drawSelectionOnly(model.uid);el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(e.target.classList.contains('resize-handle')){gesture={mode:'resize',sx:e.clientX,sy:e.clientY,w:model.w,h:model.h};return}if(pointers.size===1){gesture={mode:'drag',sx:e.clientX,sy:e.clientY,x:model.x,y:model.y}}else if(pointers.size===2){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}});
  el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture.mode==='resize'){const dx=e.clientX-gesture.sx,dy=e.clientY-gesture.sy,delta=((dx+dy)/2)*.78,ratio=model.h/model.w;model.w=Math.max(45,Math.min(300,gesture.w+delta));model.h=Math.max(40,Math.min(340,model.w*ratio));}else if(gesture.mode==='drag'&&pointers.size===1){model.x=gesture.x+(e.clientX-gesture.sx)*BOARD_MOVE_SENSITIVITY;model.y=gesture.y+(e.clientY-gesture.sy)*BOARD_MOVE_SENSITIVITY;clampPosition()}else if(pointers.size>=2){if(gesture.mode!=='pinch'){const st=twoPointStats();gesture={mode:'pinch',start:st,w:model.w,h:model.h,rotation:model.rotation,x:model.x,y:model.y}}const st=twoPointStats(),rawScale=st.dist/Math.max(1,gesture.start.dist),scale=Math.max(.52,Math.min(2.15,1+(rawScale-1)*BOARD_PINCH_SCALE_SENSITIVITY));model.w=Math.max(45,Math.min(320,gesture.w*scale));model.h=Math.max(40,Math.min(360,gesture.h*scale));model.rotation=gesture.rotation+(st.angle-gesture.start.angle)*BOARD_PINCH_ROTATION_SENSITIVITY;model.x=gesture.x+(st.cx-gesture.start.cx)*BOARD_PINCH_MOVE_SENSITIVITY;model.y=gesture.y+(st.cy-gesture.start.cy)*BOARD_PINCH_MOVE_SENSITIVITY;clampPosition()}el.style.left=model.x+'px';el.style.top=model.y+'px';el.style.width=model.w+'px';el.style.height=model.h+'px';el.style.transform=`rotate(${model.rotation}deg)`});
  function release(e){pointers.delete(e.pointerId);if(pointers.size===1){const p=[...pointers.values()][0];gesture={mode:'drag',sx:p.x,sy:p.y,x:model.x,y:model.y}}else if(!pointers.size)gesture=null}
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
}
function updateBoardEditControls(hasSelection){const bar=$('#boardEditbar');if(!bar)return;bar.classList.toggle('has-selection',hasSelection);['sendBackBtn','bringFrontBtn','rotateLeftBtn','rotateRightBtn','duplicateBoardBtn','deleteBoardBtn'].forEach(id=>{const btn=$('#'+id);if(btn)btn.disabled=!hasSelection})}
function drawSelectionOnly(uid){$$('#outfitBoard .board-piece').forEach(el=>el.classList.toggle('selected',el.dataset.uid===uid));updateBoardEditControls(!!uid);updateUndoButton()}
function selectedBoardItem(){return boardItems.find(x=>x.uid===selectedBoardUid)}
function layerSelected(where){const b=selectedBoardItem();if(!b)return toast('Select something on the board');if(where==='front')b.z=nextZ();else b.z=Math.min(0,...boardItems.filter(x=>x!==b).map(x=>Number(x.z)||0))-1;drawBoard()}
function rotateSelected(delta){const b=selectedBoardItem();if(!b)return toast('Select something on the board');b.rotation=(Number(b.rotation)||0)+delta;drawBoard()}
function duplicateSelected(){const b=selectedBoardItem();if(!b)return toast('Select something on the board');const copy={...b,uid:id(),x:b.x+18,y:b.y+18,z:nextZ()};boardItems.push(copy);selectedBoardUid=copy.uid;drawBoard()}
function updateUndoButton(){const b=$('#undoBoardBtn');if(!b)return;b.disabled=!boardUndoStack.length;b.classList.toggle('undo-ready',!!boardUndoStack.length)}
function removeBoardItem(uid){const idx=boardItems.findIndex(x=>x.uid===uid);if(idx<0)return;const removed={item:{...boardItems[idx]},index:idx};boardItems.splice(idx,1);boardUndoStack.push(removed);if(boardUndoStack.length>12)boardUndoStack.shift();if(selectedBoardUid===uid)selectedBoardUid=null;drawBoard();updateUndoButton();toast('Item removed — Undo is available')}
function deleteSelected(){if(!selectedBoardUid)return toast('Select something on the board');removeBoardItem(selectedBoardUid)}
function undoBoardDelete(){const last=boardUndoStack.pop();if(!last)return toast('Nothing to undo');const idx=Math.max(0,Math.min(boardItems.length,last.index));boardItems.splice(idx,0,last.item);selectedBoardUid=last.item.uid;drawBoard();updateUndoButton();toast('Item restored')}
function clearBoard(){boardItems=[];boardUndoStack=[];selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');drawBoard();updateUndoButton()}
function localBoardPoint(e,board){const r=board.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function startDoodle(e){if(!doodleMode||e.target.closest('.board-piece'))return;e.preventDefault();const board=$('#outfitBoard'),p=localBoardPoint(e,board);activeDoodle={pointerId:e.pointerId,points:[p]};board.setPointerCapture(e.pointerId)}
function moveDoodle(e){if(!doodleMode||!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;e.preventDefault();activeDoodle.points.push(localBoardPoint(e,$('#outfitBoard')))}
function endDoodle(e){if(!activeDoodle||activeDoodle.pointerId!==e.pointerId)return;const pts=activeDoodle.points;activeDoodle=null;if(pts.length<2)return;const minx=Math.min(...pts.map(p=>p.x)),maxx=Math.max(...pts.map(p=>p.x)),miny=Math.min(...pts.map(p=>p.y)),maxy=Math.max(...pts.map(p=>p.y));const pad=8,w=Math.max(24,maxx-minx+pad*2),h=Math.max(24,maxy-miny+pad*2);const points=pts.map(p=>`${(p.x-minx+pad).toFixed(1)},${(p.y-miny+pad).toFixed(1)}`).join(' ');const b={uid:id(),kind:'doodle',points,x:minx-pad,y:miny-pad,w,h,rotation:0,z:nextZ()};boardItems.push(b);selectedBoardUid=b.uid;drawBoard()}

async function imageFromSrc(src){
  return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
}
function roundRectPath(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function parseDoodlePoints(points=''){return points.trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite))}
function wrapCanvasLines(ctx,text,maxWidth,maxLines=20){const words=String(text||'').trim().split(/\s+/).filter(Boolean),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines)break}else line=test}if(line&&lines.length<maxLines)lines.push(line);return lines}
function compactShareItemLabel(r){return `${r.label}${r.count>1?` ×${r.count}`:''}`}
function shareStickerText(value=''){const s=String(value||'✨');return /[\uFE0E\uFE0F]/u.test(s)?s:s+'\uFE0F'}
async function makeOutfitShareBlob({mode='look',outfit=null}={}){
  const pieces=(outfit?.pieces||boardItems).map(x=>normalizeBoardItem({...x}));if(!pieces.length)throw new Error('empty');
  const board=$('#outfitBoard'),sourceW=outfit?.boardWidth||board.clientWidth||390,sourceH=outfit?.boardHeight||board.clientHeight||420;
  const title=(outfit?.name||$('#outfitName').value.trim()||'My outfit'),notes=(outfit?.notes??$('#outfitNotes').value.trim())||'';
  const shareOutfit=outfit||{pieces},rows=portfolioItemDetails(shareOutfit),includeItems=mode==='items'||mode==='itemsNotes',includeNotes=mode==='itemsNotes';
  const W=1080,pad=66,header=130,footer=58,drawW=W-pad*2,scale=drawW/sourceW,drawH=sourceH*scale;
  const detailLine=56,detailHeader=52,notesGap=includeNotes&&notes?44:0,notesFont=23,maxTextW=W-pad*2;
  const probe=document.createElement('canvas').getContext('2d');probe.font=`${notesFont}px system-ui`;const lookNoteLines=includeNotes&&notes?wrapCanvasLines(probe,notes,maxTextW,5):[];
  const itemNoteLines=includeNotes?rows.reduce((n,r)=>{if(!r.obj?.notes)return n;probe.font='20px system-ui';return n+Math.min(2,wrapCanvasLines(probe,String(r.obj.notes),maxTextW-40,2).length)},0):0;
  const detailsH=includeItems?(detailHeader+rows.length*detailLine+itemNoteLines*28+(includeNotes&&notes?(notesGap+lookNoteLines.length*32+42):0)+30):0;
  const boardTop=header,H=Math.ceil(header+drawH+footer+detailsH);
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#f7f0df';ctx.fillRect(0,0,W,H);ctx.fillStyle='#efe9d9';roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.fill();
  ctx.save();roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.clip();ctx.strokeStyle='rgba(108,81,66,.10)';ctx.lineWidth=2;const grid=24*scale;for(let x=pad;x<=pad+drawW;x+=grid){ctx.beginPath();ctx.moveTo(x,boardTop);ctx.lineTo(x,boardTop+drawH);ctx.stroke()}for(let y=boardTop;y<=boardTop+drawH;y+=grid){ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(pad+drawW,y);ctx.stroke()}
  for(const b of pieces.sort((a,b)=>a.z-b.z)){
    const x=pad+b.x*scale,y=boardTop+b.y*scale,w=b.w*scale,h=b.h*scale,cx=x+w/2,cy=y+h/2;ctx.save();ctx.translate(cx,cy);ctx.rotate((b.rotation||0)*Math.PI/180);ctx.translate(-w/2,-h/2);
    if(b.kind==='piece'){const obj=(b.source==='closet'?state.items:state.wishlist).find(o=>o.id===b.id);if(obj?.photo){try{const img=await imageFromSrc(obj.photo),ar=img.naturalWidth/img.naturalHeight,box=w/h;let dw=w,dh=h,dx=0,dy=0;if(ar>box){dh=w/ar;dy=(h-dh)/2}else{dw=h*ar;dx=(w-dw)/2}ctx.drawImage(img,dx,dy,dw,dh)}catch{}}else if(obj){ctx.fillStyle='#6c5142';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(16,18*scale)}px Georgia`;ctx.fillText(obj.name||displayItemType(obj)||'piece',w/2,h/2,w*.9)}}
    else if(b.kind==='text'){ctx.fillStyle='#7d3547';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(18,28*scale)}px "Brush Script MT","Segoe Script",cursive`;wrapCanvasText(ctx,b.value||'',w/2,h/2,w*.95,Math.max(22,29.4*scale))}
    else if(b.kind==='sticker'){ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111';ctx.font=`${Math.max(30,58*scale)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui`;ctx.fillText(shareStickerText(b.value),w/2,h/2,w)}
    else if(b.kind==='shape'){if(b.value==='circle'){ctx.strokeStyle='#4d8e8a';ctx.fillStyle='rgba(77,142,138,.08)';ctx.lineWidth=Math.max(2,6*scale);ctx.beginPath();ctx.ellipse(w/2,h/2,Math.max(2,w/2-7*scale),Math.max(2,h/2-7*scale),0,0,Math.PI*2);ctx.fill();ctx.stroke()}if(b.value==='line'){ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-4*Math.PI/180);ctx.fillStyle='#7d3547';roundRectPath(ctx,-w/2,-4*scale,w,8*scale,4*scale);ctx.fill();ctx.restore()}if(b.value==='tape'){ctx.fillStyle='rgba(198,163,78,.42)';ctx.fillRect(0,h*.08,w,h*.84)}}
    else if(b.kind==='doodle'){const pts=parseDoodlePoints(b.points||'');if(pts.length){ctx.strokeStyle='#6c5142';ctx.lineWidth=Math.max(2,4*scale);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{const px=p[0]*w/b.w,py=p[1]*h/b.h;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()}}ctx.restore();
  }ctx.restore();
  ctx.fillStyle='#2e2a24';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='600 48px Georgia';ctx.fillText(title,pad,74,W-pad*2);ctx.fillStyle='#7d3547';ctx.font='italic 27px Georgia';ctx.fillText((state.settings?.appName||DEFAULT_APP_NAME),pad,108,W-pad*2);
  if(includeItems){let y=boardTop+drawH+42;ctx.fillStyle='#2e2a24';ctx.font='600 30px Georgia';ctx.fillText('Items in this look',pad,y);y+=30;ctx.font='22px system-ui';for(const r of rows){ctx.fillStyle='#3f3931';ctx.font='600 22px system-ui';ctx.fillText(compactShareItemLabel(r),pad,y+24,maxTextW);ctx.fillStyle='#776c5e';ctx.font='18px system-ui';ctx.fillText([r.meta,r.archived?'Archived':'',r.source==='wishlist'?'Wishlist':''].filter(Boolean).join(' · '),pad,y+48,maxTextW);y+=detailLine;if(includeNotes&&r.obj?.notes){ctx.fillStyle='#74695d';ctx.font='20px system-ui';const ls=wrapCanvasLines(ctx,String(r.obj.notes),maxTextW-28,2);for(const l of ls){ctx.fillText(l,pad+18,y+18,maxTextW-28);y+=28}}ctx.strokeStyle='rgba(108,81,66,.12)';ctx.beginPath();ctx.moveTo(pad,y+3);ctx.lineTo(W-pad,y+3);ctx.stroke()}
    if(includeNotes&&notes){y+=notesGap;ctx.fillStyle='#2e2a24';ctx.font='600 27px Georgia';ctx.fillText('Look notes',pad,y);y+=32;ctx.fillStyle='#6c5142';ctx.font=`${notesFont}px system-ui`;for(const l of lookNoteLines){ctx.fillText(l,pad,y,maxTextW);y+=32}}
  }
  return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('image export failed')),'image/jpeg',.92));
}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){const words=String(text).split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);const start=y-(lines.length-1)*lineHeight/2;lines.slice(0,4).forEach((l,i)=>ctx.fillText(l,x,start+i*lineHeight,maxWidth))}
async function prepareOutfitShare(mode='look'){
  const outfit=pendingShareOutfitId?state.outfits.find(x=>x.id===pendingShareOutfitId):null;if(!outfit&&!boardItems.length)return toast('Add something to the board first');
  const choice=$('#shareChoiceDialog');if(choice?.open)choice.close();const btn=$('#shareOutfitBtn');if(btn){btn.disabled=true;var old=btn.textContent;btn.textContent='Creating preview…'}
  try{if(pendingShareUrl){URL.revokeObjectURL(pendingShareUrl);pendingShareUrl=''}pendingShareBlob=await makeOutfitShareBlob({mode,outfit});const title=outfit?.name||$('#outfitName').value.trim()||'My outfit';const safe=((title.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase())||'outfit');pendingShareFileName=`${safe}.jpg`;pendingShareUrl=URL.createObjectURL(pendingShareBlob);$('#sharePreviewImage').src=pendingShareUrl;$('#sharePreviewTitle').textContent=title;$('#sharePreviewStatus').textContent=navigator.share?'Image ready. Tap “Share now” to open the iPhone share sheet.':'Image ready. Tap “Open image” and use the browser share button.';$('#shareNowBtn').classList.toggle('hidden',!navigator.share);$('#sharePreviewDialog').showModal()}catch(err){console.error(err);toast('Could not create the outfit image');const returnId=shareReturnOutfitId;pendingShareOutfitId=null;shareReturnOutfitId=null;if(returnId)viewOutfit(returnId)}finally{if(btn){btn.disabled=false;btn.textContent=old}}}
async function sharePreparedOutfit(){
  if(!pendingShareBlob)return toast('Create the preview again');
  const btn=$('#shareNowBtn');btn.disabled=true;const old=btn.textContent;btn.textContent='Opening share…';
  try{
    const file=new File([pendingShareBlob],pendingShareFileName,{type:'image/jpeg'});
    if(navigator.canShare&&!navigator.canShare({files:[file]}))throw new Error('file sharing unsupported');
    await navigator.share({title:$('#sharePreviewTitle').textContent||'Outfit',text:'Check out this outfit board!',files:[file]});
  }catch(err){
    if(err?.name!=='AbortError'){
      console.warn('Native file share failed',err);
      $('#sharePreviewStatus').textContent='The iPhone share sheet could not accept the file here. Tap “Open image” below, then use Share from Safari.';
      toast('Try Open image instead');
    }
  }finally{btn.disabled=false;btn.textContent=old}
}
function openPreparedShareImage(){
  if(!pendingShareUrl)return toast('Create the preview again');
  // This runs directly from the user tap, so iOS is much less likely to block it.
  const w=window.open(pendingShareUrl,'_blank');
  if(!w){
    const a=document.createElement('a');a.href=pendingShareUrl;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  }
  $('#sharePreviewStatus').textContent='The image should open by itself. Use the iPhone Share button there, or touch and hold the image to save/copy it.';
}
function closeSharePreview(){const returnId=shareReturnOutfitId;$('#sharePreviewDialog').close();if(pendingShareUrl){URL.revokeObjectURL(pendingShareUrl);pendingShareUrl=''}$('#sharePreviewImage').removeAttribute('src');pendingShareOutfitId=null;shareReturnOutfitId=null;if(returnId&&state.outfits.some(o=>o.id===returnId))viewOutfit(returnId)}


function requestSaveOutfit(){if(!boardItems.length)return toast('Add at least one piece');ensureSettings();const existing=editingOutfitId?state.outfits.find(x=>x.id===editingOutfitId):null;populatePortfolioFolderSelect(existing?.folder||state.settings.portfolioFolders[0]||'Everyday');$('#confirmSaveOutfitBtn').textContent=editingOutfitId?'Update here':'Save here';$('#outfitSaveDialog').showModal()}
async function saveOutfit(){if(!boardItems.length){$('#outfitSaveDialog').close();return toast('Add at least one piece')}const name=$('#outfitName').value.trim()||'Untitled look';const board=$('#outfitBoard');ensureSettings();const prior=editingOutfitId?state.outfits.find(x=>x.id===editingOutfitId):null,priorFolder=prior?.folder||'',wasNew=!prior;const snapshot={name,notes:$('#outfitNotes').value.trim(),folder:$('#outfitFolder').value||state.settings.portfolioFolders[0]||'Everyday',favorite:prior?.favorite||false,pieces:boardItems.map(x=>({...x})),boardWidth:board.clientWidth,boardHeight:board.clientHeight};if(editingOutfitId){const existing=state.outfits.find(x=>x.id===editingOutfitId);if(existing){Object.assign(existing,snapshot,{updated:Date.now()})}else editingOutfitId=null}if(!editingOutfitId){const created={id:id(),...snapshot,created:Date.now()};state.outfits.unshift(created);editingOutfitId=created.id}ensureSettings();if(priorFolder&&priorFolder!==snapshot.folder&&state.settings.portfolioOrder[priorFolder])state.settings.portfolioOrder[priorFolder]=state.settings.portfolioOrder[priorFolder].filter(x=>x!==editingOutfitId);let order=state.settings.portfolioOrder[snapshot.folder]||(state.settings.portfolioOrder[snapshot.folder]=[]);if(wasNew||priorFolder!==snapshot.folder){order=order.filter(x=>x!==editingOutfitId);order.unshift(editingOutfitId);state.settings.portfolioOrder[snapshot.folder]=order}else if(!order.includes(editingOutfitId))order.unshift(editingOutfitId);const ok=await saveState();if(ok===false)return toast('Could not save — please try again');$('#outfitSaveDialog').close();renderSavedOutfits();$('#saveOutfitBtn').textContent='Update outfit';toast('Outfit saved to '+snapshot.folder)}
function renderMiniPiece(p,o){
  p=normalizeBoardItem({...p});const sw=o.boardWidth||390,sh=o.boardHeight||420;
  const left=Math.max(-10,Math.min(100,(p.x/sw)*100)),top=Math.max(-10,Math.min(100,(p.y/sh)*100));
  const width=Math.max(8,Math.min(70,(p.w/sw)*100)),height=Math.max(8,Math.min(70,(p.h/sh)*100));
  const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${p.z||1};transform:rotate(${p.rotation||0}deg)`;
  if(p.kind==='piece'){const obj=(p.source==='closet'?state.items:state.wishlist).find(x=>x.id===p.id);return obj?.photo?`<img class="portfolio-piece" src="${obj.photo}" style="${style}" draggable="false">`:''}
  if(p.kind==='text')return `<span class="portfolio-deco mini-deco" style="${style}">${esc(p.value)}</span>`;
  if(p.kind==='sticker')return `<span class="portfolio-deco mini-sticker" style="${style}">${esc(p.value)}</span>`;
  if(p.kind==='shape')return `<span class="portfolio-shape shape-${esc(p.value)}" style="${style}"></span>`;
  return '';
}
function orderedOutfitsForFolder(folder){ensureSettings();const rows=state.outfits.filter(o=>(o.folder||'Everyday')===folder),order=state.settings.portfolioOrder[folder]||[],rank=new Map(order.map((id,i)=>[id,i]));return rows.slice().sort((a,b)=>(rank.get(a.id)??999999)-(rank.get(b.id)??999999)||((b.updated||b.created||0)-(a.updated||a.created||0)))}
function portfolioItemDetails(outfit){const counts=new Map();for(const p of outfit?.pieces||[]){const b=normalizeBoardItem({...p});if(b.kind!=='piece'||!b.id)continue;const key=`${b.source||'closet'}:${b.id}`,row=counts.get(key)||{source:b.source||'closet',id:b.id,count:0};row.count++;counts.set(key,row)}return [...counts.values()].map(row=>{const pool=row.source==='wishlist'?state.wishlist:state.items,obj=pool.find(x=>x.id===row.id);const label=obj?(obj.name||displayItemType(obj)||'Closet piece'):'Removed item';const meta=obj?[obj.color,obj.brand].filter(Boolean).join(' · '):'No longer in closet';return {...row,obj,label,meta,archived:obj&&isArchived(obj)}})}
function renderPortfolioItemList(outfit){const rows=portfolioItemDetails(outfit);if(!rows.length)return '<p class="portfolio-items-empty">No closet pieces are linked to this look.</p>';return rows.map(r=>`<button type="button" class="portfolio-item-row" data-item-id="${esc(r.id)}" data-item-source="${esc(r.source)}">${r.obj?.photo?`<img src="${r.obj.photo}" alt="" draggable="false">`:'<div class="portfolio-item-placeholder">✣</div>'}<div><strong>${esc(r.label)}${r.count>1?` <span class="portfolio-item-count">×${r.count}</span>`:''}</strong><small>${esc(r.meta)}${r.archived?' · Archived':''}${r.source==='wishlist'?' · Wishlist':''}</small></div><span class="portfolio-item-chevron" aria-hidden="true">›</span></button>`).join('')}
function resetPortfolioDrag(){const d=portfolioDrag;clearTimeout(d.timer);if(d.raf)cancelAnimationFrame(d.raf);if(d.scrollRaf)cancelAnimationFrame(d.scrollRaf);unbindActivePortfolioTouchTracking();d.ghost?.remove();d.dropOutline?.remove();$$('#savedOutfits .portfolio-drop-target').forEach(x=>x.classList.remove('portfolio-drop-target','drop-before','drop-after'));d.card?.classList.remove('portfolio-drag-source');document.body.classList.remove('portfolio-reordering');portfolioDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,card:null,folder:'',active:false,moved:false,ghost:null,dropOutline:null,targetId:null,targetAfter:false,originalId:null,raf:null,scrollRaf:null,aggregate:false,aggregateLongPress:false}}
function beginPortfolioPress(card,folder,pointerId,x,y,touchId=null){resetPortfolioDrag();const aggregate=folder==='All'||folder==='Favorites',filtered=portfolioDiscoveryActive();portfolioDrag={...portfolioDrag,card,folder:aggregate?'':folder,pointerId,touchId,startX:x,startY:y,x,y,aggregate,aggregateLongPress:false};portfolioDrag.timer=setTimeout(()=>{if(portfolioDrag.aggregate||filtered){portfolioDrag.timer=null;portfolioDrag.aggregateLongPress=true;suppressPortfolioClickUntil=Date.now()+1600;navigator.vibrate?.(12);toast(portfolioDrag.aggregate?'Choose a specific portfolio category before reordering looks.':'Clear Portfolio filters before reordering looks.');return}startPortfolioDrag()},430)}
function bindActivePortfolioTouchTracking(){window.addEventListener('touchmove',handleActivePortfolioTouchMove,{passive:false,capture:true});window.addEventListener('touchend',handleActivePortfolioTouchEnd,{passive:false,capture:true});window.addEventListener('touchcancel',handleActivePortfolioTouchCancel,{passive:false,capture:true})}
function unbindActivePortfolioTouchTracking(){window.removeEventListener('touchmove',handleActivePortfolioTouchMove,true);window.removeEventListener('touchend',handleActivePortfolioTouchEnd,true);window.removeEventListener('touchcancel',handleActivePortfolioTouchCancel,true)}
function handleActivePortfolioTouchMove(e){const d=portfolioDrag;if(!d?.active||d.touchId==null)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);if(!t)return;movePortfolioDragPoint(t.clientX,t.clientY,null,d.touchId,e)}
function handleActivePortfolioTouchEnd(e){const d=portfolioDrag;if(!d?.active||d.touchId==null)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);if(t)finishPortfolioDrag(null,d.touchId,false,e)}
function handleActivePortfolioTouchCancel(e){const d=portfolioDrag;if(!d?.active||d.touchId==null)return;finishPortfolioDrag(null,d.touchId,true,e)}
function startPortfolioDrag(){const d=portfolioDrag;if(!d.card||!d.folder)return;d.timer=null;d.active=true;d.moved=false;d.originalId=d.card.dataset.id;d.targetId=null;suppressPortfolioClickUntil=Date.now()+900;const r=d.card.getBoundingClientRect();d.card.classList.add('portfolio-drag-source');const ghost=d.card.cloneNode(true);ghost.classList.add('portfolio-drag-ghost');ghost.removeAttribute('data-id');ghost.querySelectorAll('button').forEach(b=>b.disabled=true);ghost.querySelectorAll('img').forEach(img=>{img.draggable=false});Object.assign(ghost.style,{position:'fixed',left:'0',top:'0',width:r.width+'px',height:r.height+'px',margin:'0',pointerEvents:'none',zIndex:'5000',willChange:'transform'});document.body.appendChild(ghost);d.ghost=ghost;d.ghostOffsetX=d.x-r.left;d.ghostOffsetY=d.y-r.top;const outline=document.createElement('div');outline.className='portfolio-drop-outline';document.body.appendChild(outline);d.dropOutline=outline;document.body.classList.add('portfolio-reordering');if(d.touchId!=null)bindActivePortfolioTouchTracking();navigator.vibrate?.(18);positionPortfolioGhost(d.x,d.y);startPortfolioAutoScroll();toast('Reorder mode — drag this look to a new position')}
function positionPortfolioGhost(x,y){const d=portfolioDrag;if(!d.ghost)return;d.ghost.style.transform=`translate3d(${x-(d.ghostOffsetX||0)}px,${y-(d.ghostOffsetY||0)}px,0) scale(1.018)`}
function startPortfolioAutoScroll(){const tick=()=>{const d=portfolioDrag;if(!d.active){d.scrollRaf=null;return}const edge=Math.min(130,window.innerHeight*.18),maxSpeed=16;let delta=0;if(d.y<edge)delta=-maxSpeed*(1-d.y/edge);else if(d.y>window.innerHeight-edge)delta=maxSpeed*(1-(window.innerHeight-d.y)/edge);if(Math.abs(delta)>.25){window.scrollBy(0,delta);positionPortfolioGhost(d.x,d.y);updatePortfolioDropTarget(d.x,d.y)}d.scrollRaf=requestAnimationFrame(tick)};if(!portfolioDrag.scrollRaf)portfolioDrag.scrollRaf=requestAnimationFrame(tick)}
function clearPortfolioDropTarget(){$$('#savedOutfits .portfolio-drop-target').forEach(x=>x.classList.remove('portfolio-drop-target','drop-before','drop-after'));portfolioDrag.dropOutline?.classList.remove('visible')}
function updatePortfolioDropTarget(x,y){const d=portfolioDrag,grid=$('#savedOutfits');if(!grid||!d.card)return;const cards=[...grid.querySelectorAll('.portfolio-card[data-id]')].filter(c=>c!==d.card);clearPortfolioDropTarget();if(!cards.length)return;let target=null,best=Infinity;for(const c of cards){const r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,verticalWeight=Math.abs(y-cy)*.82,dist=Math.hypot(x-cx,verticalWeight);if(dist<best){best=dist;target=c}}if(!target)return;const r=target.getBoundingClientRect();const rowTolerance=Math.max(18,r.height*.18),sameRow=y>=r.top-rowTolerance&&y<=r.bottom+rowTolerance,after=sameRow?x>r.left+r.width/2:y>r.top+r.height/2;d.targetId=target.dataset.id;d.targetAfter=after;target.classList.add('portfolio-drop-target',after?'drop-after':'drop-before');if(d.dropOutline){Object.assign(d.dropOutline.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});d.dropOutline.classList.add('visible')}}
function movePortfolioDragPoint(x,y,pointerId,touchId,e){const d=portfolioDrag;if(!d.card)return;if(pointerId!=null&&d.pointerId!==pointerId)return;if(touchId!=null&&d.touchId!==touchId)return;d.x=x;d.y=y;const dist=Math.hypot(x-d.startX,y-d.startY);if(!d.active){if(dist>14){clearTimeout(d.timer);d.timer=null}return}if(e?.cancelable)e.preventDefault();positionPortfolioGhost(x,y);if(dist<24){clearPortfolioDropTarget();d.targetId=null;return}d.moved=true;d.pendingX=x;d.pendingY=y;if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=null;updatePortfolioDropTarget(d.pendingX,d.pendingY)})}
function movePortfolioDrag(e){movePortfolioDragPoint(e.clientX,e.clientY,e.pointerId,null,e)}
async function finishPortfolioDrag(pointerId,touchId,cancelled=false,e){const d=portfolioDrag;if(!d.card)return;if(pointerId!=null&&d.pointerId!==pointerId)return;if(touchId!=null&&d.touchId!==touchId)return;clearTimeout(d.timer);if(d.aggregateLongPress){if(e?.cancelable)e.preventDefault();suppressPortfolioClickUntil=Date.now()+1200;resetPortfolioDrag();return}if(d.active){if(e?.cancelable)e.preventDefault();suppressPortfolioClickUntil=Date.now()+650;if(!cancelled&&d.targetId&&d.originalId){ensureSettings();const folderIds=state.outfits.filter(o=>(o.folder||'Everyday')===d.folder).map(o=>o.id);let order=(state.settings.portfolioOrder[d.folder]||[]).filter(id=>folderIds.includes(id));order=[...order,...folderIds.filter(id=>!order.includes(id))].filter(id=>id!==d.originalId);let idx=order.indexOf(d.targetId);if(idx<0)idx=0;if(d.targetAfter)idx++;order.splice(Math.max(0,Math.min(order.length,idx)),0,d.originalId);state.settings.portfolioOrder[d.folder]=[...new Set(order)];await saveState();renderSavedOutfits();const moved=$('#savedOutfits .portfolio-card[data-id="'+d.originalId+'"]');if(moved){moved.classList.add('portfolio-drop-confirm');setTimeout(()=>moved.classList.remove('portfolio-drop-confirm'),380)}toast('Portfolio order saved')}}resetPortfolioDrag()}
function bindPortfolioReorder(){const folder=portfolioFilter,enabled=folder!=='All'&&folder!=='Favorites'&&!portfolioDiscoveryActive();$$('#savedOutfits .portfolio-card').forEach(card=>{card.draggable=false;card.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});card.onpointerdown=e=>{if(e.pointerType==='touch')return;if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('.favorite-outfit'))return;beginPortfolioPress(card,folder,e.pointerId,e.clientX,e.clientY,null)};card.onpointermove=e=>{if(e.pointerType!=='touch')movePortfolioDrag(e)};card.onpointerup=e=>{if(e.pointerType!=='touch')finishPortfolioDrag(e.pointerId,null,false,e)};card.onpointercancel=e=>{if(e.pointerType!=='touch')finishPortfolioDrag(e.pointerId,null,true,e)};card.ontouchstart=e=>{if(e.touches.length!==1||e.target.closest('.favorite-outfit'))return;const t=e.changedTouches[0];beginPortfolioPress(card,folder,null,t.clientX,t.clientY,t.identifier)};card.ontouchmove=e=>{const d=portfolioDrag;if(d.touchId==null||d.active)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);if(t)movePortfolioDragPoint(t.clientX,t.clientY,null,d.touchId,e)};card.ontouchend=e=>{const d=portfolioDrag;if(d.touchId==null||d.active)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);if(t)finishPortfolioDrag(null,d.touchId,false,e)};card.ontouchcancel=e=>{const d=portfolioDrag;if(d.touchId==null||d.active)return;finishPortfolioDrag(null,d.touchId,true,e)};card.oncontextmenu=e=>{if(portfolioDrag.active||portfolioDrag.timer)e.preventDefault()}});const hint=$('#portfolioReorderHint');if(hint)hint.textContent=enabled?'Press and hold a look to reorder this folder.':portfolioDiscoveryActive()?'Clear Portfolio filters to reorder looks.':'Choose a portfolio folder to reorder looks.'}
function portfolioDiscoveryActive(){return !!portfolioSearchQuery.trim()||portfolioDiscoveryItemIds.size>0}
function portfolioOutfitItemObjects(outfit){const rows=[];for(const p of outfit?.pieces||[]){const b=normalizeBoardItem({...p});if(b.kind!=='piece'||!b.id)continue;const pool=(b.source||'closet')==='wishlist'?state.wishlist:state.items,obj=pool.find(x=>x.id===b.id);if(obj)rows.push({source:b.source||'closet',id:b.id,obj})}return rows}
function portfolioOutfitMatchesDiscovery(outfit){const selected=[...portfolioDiscoveryItemIds];if(selected.length){const ids=new Set((outfit.pieces||[]).filter(p=>(p.kind||'piece')==='piece'&&(p.source||'closet')==='closet').map(p=>p.id));if(!selected.every(id=>ids.has(id)))return false}const q=portfolioSearchQuery.trim().toLowerCase();if(!q)return true;const itemText=portfolioOutfitItemObjects(outfit).map(({obj})=>[obj.category,obj.type,obj.name,obj.color,obj.brand,obj.size,obj.pattern,obj.season,obj.notes].filter(Boolean).join(' ')).join(' ');return portfolioTextMatchesQuery([outfit.name,outfit.notes,outfit.folder,itemText].filter(Boolean).join(' '),q)}
function portfolioDiscoveryLabel(item){return [displayItemType(item),item.color].filter(Boolean).join(' · ')||'Closet item'}
function renderPortfolioDiscovery(){const search=$('#portfolioSearch');if(search&&search.value!==portfolioSearchQuery)search.value=portfolioSearchQuery;const selectedBox=$('#portfolioSelectedFilters');if(selectedBox){const selected=[...portfolioDiscoveryItemIds].map(id=>state.items.find(i=>i.id===id)).filter(Boolean);selectedBox.innerHTML=selected.map(i=>`<button type="button" class="portfolio-filter-chip" data-filter-item="${i.id}" title="Remove ${esc(portfolioDiscoveryLabel(i))}">${i.photo?`<img src="${i.photo}" alt="">`:''}<span>${esc(portfolioDiscoveryLabel(i))}</span><b>×</b></button>`).join('');selectedBox.classList.toggle('hidden',!selected.length);$$('#portfolioSelectedFilters [data-filter-item]').forEach(b=>b.onclick=()=>{portfolioDiscoveryItemIds.delete(b.dataset.filterItem);renderSavedOutfits()});selectedBox.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()})}const picker=$('#portfolioItemFilterPanel');if(picker){const priorGrid=picker.querySelector('.portfolio-filter-item-grid'),priorScrollTop=priorGrid?.scrollTop||0;picker.classList.toggle('hidden',!portfolioItemPickerOpen);if(portfolioItemPickerOpen){const active=state.items.filter(i=>!isArchived(i));picker.innerHTML=`<div class="portfolio-filter-picker-head"><div><strong>Filter by closet items</strong><small>Select more than one to find looks containing all selected items.</small></div><button type="button" class="text-btn portfolio-filter-clear" id="portfolioFilterClearBtn">Clear</button></div><div class="portfolio-filter-item-grid">${active.map(i=>`<button type="button" class="portfolio-filter-item ${portfolioDiscoveryItemIds.has(i.id)?'selected':''}" data-pick-item="${i.id}">${i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i)||'Closet item')}">`:'<span class="portfolio-filter-placeholder">✣</span>'}<span>${esc(displayItemType(i)||'Piece')}</span><small>${esc([i.color,i.brand].filter(Boolean).join(' · ')||i.category||'')}</small></button>`).join('')||'<p class="portfolio-filter-empty">Add closet pieces to use item filters.</p>'}</div>`;$('#portfolioFilterClearBtn').onclick=()=>{portfolioSearchQuery='';portfolioDiscoveryItemIds.clear();renderSavedOutfits()};const grid=picker.querySelector('.portfolio-filter-item-grid');if(grid)grid.scrollTop=priorScrollTop;picker.oncontextmenu=e=>{if(e.target.closest('img'))e.preventDefault()};picker.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});$$('#portfolioItemFilterPanel [data-pick-item]').forEach(b=>b.onclick=()=>{const gridNow=$('#portfolioItemFilterPanel .portfolio-filter-item-grid'),keep=gridNow?.scrollTop||0,id=b.dataset.pickItem;if(portfolioDiscoveryItemIds.has(id))portfolioDiscoveryItemIds.delete(id);else portfolioDiscoveryItemIds.add(id);renderSavedOutfits();requestAnimationFrame(()=>{const next=$('#portfolioItemFilterPanel .portfolio-filter-item-grid');if(next)next.scrollTop=keep})})}}}
function clearPortfolioDiscovery(){portfolioSearchQuery='';portfolioDiscoveryItemIds.clear();portfolioItemPickerOpen=false;renderSavedOutfits()}
const PORTFOLIO_CLOTHING_SEARCH_ALIASES={jackets:'jacket',coats:'coat',blazers:'blazer',vests:'vest',shirts:'shirt',tees:'t-shirt',tshirts:'t-shirt',blouses:'blouse',sweaters:'sweater',hoodies:'hoodie',cardigans:'cardigan',tops:'top',bottoms:'bottom',trousers:'trouser',leggings:'legging',joggers:'jogger',skirts:'skirt',dresses:'dress',shoes:'shoe',sneakers:'sneaker',boots:'boot',sandals:'sandal',flats:'flat',heels:'heel',loafers:'loafer',hats:'hat',belts:'belt',bags:'bag',scarves:'scarf',gloves:'glove',swimsuits:'swimsuit',socks:'sock',accessories:'accessory'};
function normalizePortfolioSearchToken(token=''){const clean=String(token).toLowerCase().trim();return PORTFOLIO_CLOTHING_SEARCH_ALIASES[clean]||clean}
function portfolioTextMatchesQuery(text,query){const hay=String(text||'').toLowerCase(),tokens=String(query||'').toLowerCase().trim().split(/\s+/).filter(Boolean);if(!tokens.length)return true;return tokens.every(token=>{const norm=normalizePortfolioSearchToken(token);if(hay.includes(token)||hay.includes(norm))return true;const aliases=Object.entries(PORTFOLIO_CLOTHING_SEARCH_ALIASES).filter(([,singular])=>singular===norm).map(([plural])=>plural);return aliases.some(alias=>hay.includes(alias))})}
function resetPortfolioTabDrag(){const d=portfolioTabDrag;clearTimeout(d.timer);if(d.raf)cancelAnimationFrame(d.raf);d.ghost?.remove();$$('#portfolioTabs .portfolio-tab-drop-target').forEach(x=>x.classList.remove('portfolio-tab-drop-target'));d.tab?.classList.remove('portfolio-tab-drag-source');document.body.classList.remove('portfolio-tab-reordering');portfolioTabDrag={timer:null,pointerId:null,touchId:null,startX:0,startY:0,x:0,y:0,tab:null,active:false,ghost:null,target:null,originalName:'',raf:null}}
function beginPortfolioTabPress(tab,pointerId,x,y,touchId=null){resetPortfolioTabDrag();portfolioTabDrag={...portfolioTabDrag,pointerId,touchId,startX:x,startY:y,x,y,tab,originalName:tab.dataset.portfolio||''};portfolioTabDrag.timer=setTimeout(()=>startPortfolioTabDrag(),420)}
function startPortfolioTabDrag(){const d=portfolioTabDrag;if(!d.tab||!d.originalName)return;d.timer=null;d.active=true;suppressPortfolioTabClickUntil=Date.now()+1200;const r=d.tab.getBoundingClientRect(),ghost=d.tab.cloneNode(true);d.tab.classList.add('portfolio-tab-drag-source');ghost.classList.add('portfolio-tab-drag-ghost');ghost.removeAttribute('data-portfolio');ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0',pointerEvents:'none',zIndex:'6000'});document.body.appendChild(ghost);d.ghost=ghost;d.ghostOffsetX=d.x-r.left;d.ghostOffsetY=d.y-r.top;document.body.classList.add('portfolio-tab-reordering');navigator.vibrate?.(14);positionPortfolioTabGhost(d.x,d.y)}
function positionPortfolioTabGhost(x,y){const d=portfolioTabDrag;if(!d.ghost)return;d.ghost.style.left=(x-(d.ghostOffsetX||0))+'px';d.ghost.style.top=(y-(d.ghostOffsetY||0))+'px'}
function updatePortfolioTabDropTarget(x,y){const d=portfolioTabDrag,tabs=$$('#portfolioTabs .portfolio-tab[data-portfolio]').filter(t=>t!==d.tab);$$('#portfolioTabs .portfolio-tab-drop-target').forEach(t=>t.classList.remove('portfolio-tab-drop-target'));d.target=null;if(!tabs.length)return;let target=null,best=Infinity;for(const tab of tabs){const r=tab.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dist=Math.hypot(x-cx,(y-cy)*.55);if(dist<best){best=dist;target=tab}}if(target){d.target=target;target.classList.add('portfolio-tab-drop-target')}}
function movePortfolioTabDragPoint(x,y,pointerId,touchId,e){const d=portfolioTabDrag;if(!d.tab)return;if(pointerId!=null&&d.pointerId!==pointerId)return;if(touchId!=null&&d.touchId!==touchId)return;d.x=x;d.y=y;const dist=Math.hypot(x-d.startX,y-d.startY);if(!d.active){if(dist>12){clearTimeout(d.timer);d.timer=null}return}if(e?.cancelable)e.preventDefault();positionPortfolioTabGhost(x,y);if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=null;updatePortfolioTabDropTarget(d.x,d.y)})}
async function finishPortfolioTabDrag(pointerId,touchId,cancelled=false,e){const d=portfolioTabDrag;if(!d.tab)return;if(pointerId!=null&&d.pointerId!==pointerId)return;if(touchId!=null&&d.touchId!==touchId)return;clearTimeout(d.timer);if(d.active){if(e?.cancelable)e.preventDefault();suppressPortfolioTabClickUntil=Date.now()+900;if(!cancelled&&d.target){ensureSettings();const order=state.settings.portfolioTabOrder.slice(),from=order.indexOf(d.originalName),toName=d.target.dataset.portfolio,to=order.indexOf(toName);if(from>=0&&to>=0&&from!==to){order.splice(from,1);const insertAt=order.indexOf(toName);order.splice(insertAt,0,d.originalName);state.settings.portfolioTabOrder=order;await saveState();renderPortfolioFolderEditor();renderSavedOutfits();toast('Portfolio folder order saved')}}}resetPortfolioTabDrag()}
function bindPortfolioTabReorder(){const tabs=$$('#portfolioTabs .portfolio-tab[data-portfolio]');tabs.forEach(tab=>{tab.draggable=false;tab.oncontextmenu=e=>{e.preventDefault()};tab.onselectstart=e=>e.preventDefault();tab.onpointerdown=e=>{if(e.pointerType==='touch')return;if(e.pointerType==='mouse'&&e.button!==0)return;beginPortfolioTabPress(tab,e.pointerId,e.clientX,e.clientY,null)};tab.onpointermove=e=>{if(e.pointerType!=='touch')movePortfolioTabDragPoint(e.clientX,e.clientY,e.pointerId,null,e)};tab.onpointerup=e=>{if(e.pointerType!=='touch')finishPortfolioTabDrag(e.pointerId,null,false,e)};tab.onpointercancel=e=>{if(e.pointerType!=='touch')finishPortfolioTabDrag(e.pointerId,null,true,e)};tab.ontouchstart=e=>{if(e.touches.length!==1)return;const t=e.changedTouches[0];beginPortfolioTabPress(tab,null,t.clientX,t.clientY,t.identifier)};tab.ontouchmove=e=>{const d=portfolioTabDrag;if(d.touchId==null)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId)||[...e.touches].find(x=>x.identifier===d.touchId);if(t)movePortfolioTabDragPoint(t.clientX,t.clientY,null,d.touchId,e)};tab.ontouchend=e=>{const d=portfolioTabDrag;if(d.touchId==null)return;const t=[...e.changedTouches].find(x=>x.identifier===d.touchId);if(t)finishPortfolioTabDrag(null,d.touchId,false,e)};tab.ontouchcancel=e=>{const d=portfolioTabDrag;if(d.touchId==null)return;finishPortfolioTabDrag(null,d.touchId,true,e)}})}
function renderSavedOutfits(){
  ensureSettings();
  const known=new Set(state.settings.portfolioFolders);
  const legacy=state.outfits.map(o=>o.folder||'Everyday').filter(f=>!known.has(f));
  if(legacy.length){const added=[...new Set(legacy)].filter(f=>!state.settings.portfolioFolders.includes(f));state.settings.portfolioFolders.push(...added);state.settings.portfolioFolders=state.settings.portfolioFolders.slice(0,12);ensureSettings()}
  const folders=state.settings.portfolioTabOrder.slice();
  if(!folders.includes(portfolioFilter))portfolioFilter='All';
  $('#portfolioTabs').innerHTML=folders.map(f=>`<button class="portfolio-tab ${portfolioFilter===f?'active':''}" data-portfolio="${esc(f)}">${f==='Favorites'?'★ ':''}${esc(f)}<span>${f==='All'?state.outfits.length:f==='Favorites'?state.outfits.filter(o=>o.favorite).length:state.outfits.filter(o=>(o.folder||'Everyday')===f).length}</span></button>`).join('');
  $$('#portfolioTabs [data-portfolio]').forEach(b=>b.onclick=e=>{if(Date.now()<suppressPortfolioTabClickUntil||portfolioTabDrag.active){e.preventDefault();return}portfolioFilter=b.dataset.portfolio;renderSavedOutfits()});
  bindPortfolioTabReorder();
  const folderShown=portfolioFilter==='All'?state.outfits.slice():portfolioFilter==='Favorites'?state.outfits.filter(o=>o.favorite):orderedOutfitsForFolder(portfolioFilter);
  const shown=folderShown.filter(portfolioOutfitMatchesDiscovery);
  $('#outfitCount').textContent=portfolioDiscoveryActive()?`${shown.length} of ${folderShown.length} ${folderShown.length===1?'look':'looks'}`:`${shown.length} ${shown.length===1?'look':'looks'}`;
  renderPortfolioDiscovery();
  $('#savedOutfits').innerHTML=shown.map(o=>`<article class="outfit-card portfolio-card" data-id="${o.id}"><button class="favorite-outfit ${o.favorite?'active':''}" data-fav="${o.id}" aria-label="Favorite">${o.favorite?'★':'☆'}</button><div class="folder-label">${esc(o.folder||'Everyday')}</div><div class="outfit-mini">${o.pieces.slice().sort((a,b)=>(a.z||0)-(b.z||0)).map(p=>renderMiniPiece(p,o)).join('')}</div><h4>${esc(o.name)}</h4><p>${o.pieces.filter(p=>(p.kind||'piece')==='piece').length} pieces · ${new Date(o.updated||o.created).toLocaleDateString()}</p></article>`).join('')||'<div class="portfolio-empty">No looks in this folder yet. Create one on the Board.</div>';
  $$('.outfit-card').forEach(c=>c.onclick=e=>{if(Date.now()<suppressPortfolioClickUntil||portfolioDrag.active)return;if(e.target.closest('.favorite-outfit'))return;viewOutfit(c.dataset.id)});
  $$('.favorite-outfit').forEach(b=>b.onclick=async e=>{e.stopPropagation();const o=state.outfits.find(x=>x.id===b.dataset.fav);if(!o)return;o.favorite=!o.favorite;await saveState();renderSavedOutfits();toast(o.favorite?'Added to favorites':'Removed from favorites')});const gallery=$('#savedOutfits');gallery.oncontextmenu=e=>{if(e.target.closest('img'))e.preventDefault()};gallery.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});bindPortfolioReorder();
}
function loadOutfitForEditing(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;editingOutfitId=oid;boardUndoStack=[];boardItems=(o.pieces||[]).map(p=>normalizeBoardItem({...p,uid:p.uid||id()}));selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');$('#outfitName').value=o.name||'';$('#outfitNotes').value=o.notes||'';populatePortfolioFolderSelect(o.folder||state.settings.portfolioFolders[0]);$('#saveOutfitBtn').textContent='Update outfit';drawBoard();showScreen('outfits');setTimeout(()=>$('#outfitBoard').scrollIntoView({behavior:'smooth',block:'center'}),80);toast('Outfit loaded — keep editing')}
function renderSnapshotPiece(board,p,scaleX,scaleY,offsetX=0,offsetY=0){p=normalizeBoardItem({...p});const el=document.createElement('div');el.className='snapshot-piece kind-'+p.kind;el.style.left=(offsetX+p.x*scaleX)+'px';el.style.top=(offsetY+p.y*scaleY)+'px';el.style.width=(p.w*scaleX)+'px';el.style.height=(p.h*scaleY)+'px';el.style.zIndex=p.z;el.style.transform=`rotate(${p.rotation}deg)`;el.innerHTML=boardItemContent(p);el.querySelectorAll('img').forEach(img=>{img.draggable=false;img.ondragstart=e=>e.preventDefault()});board.appendChild(el)}
function refreshViewedOutfitFavorite(o){const b=$('#favoriteViewedOutfitBtn');if(!b||!o)return;b.textContent=o.favorite?'★':'☆';b.classList.toggle('active',!!o.favorite);b.setAttribute('aria-label',o.favorite?'Remove from favorites':'Add to favorites');b.setAttribute('aria-pressed',o.favorite?'true':'false')}

function lockPageForPortfolioModal(){if(document.body.classList.contains('portfolio-modal-open'))return;portfolioModalScrollY=window.scrollY||0;document.body.style.top=`-${portfolioModalScrollY}px`;document.body.classList.add('portfolio-modal-open')}
function unlockPageForPortfolioModal(){if(!document.body.classList.contains('portfolio-modal-open'))return;document.body.classList.remove('portfolio-modal-open');document.body.style.top='';window.scrollTo(0,portfolioModalScrollY||0)}
function closeViewedOutfit({keepLocked=false}={}){const d=$('#outfitViewDialog');if(d.open)d.close();viewingOutfitId=null;if(!keepLocked)unlockPageForPortfolioModal()}
function updateOutfitDetailScrollLock(){const scroll=$('#outfitViewDialog .outfit-view-scroll'),panel=$('#outfitViewDialog .outfit-items-panel');if(!scroll||!panel)return;const expanded=panel.open;scroll.classList.toggle('allow-detail-scroll',expanded);if(!expanded)scroll.scrollTop=0}
function viewOutfit(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;viewingOutfitId=oid;$('#viewOutfitName').textContent=o.name;refreshViewedOutfitFavorite(o);$('#viewOutfitNotes').textContent=o.notes||'No notes yet.';$('#viewOutfitFolder').textContent=o.folder||'Everyday';$('#viewOutfitItems').innerHTML=renderPortfolioItemList(o);const unique=portfolioItemDetails(o),copies=unique.reduce((n,x)=>n+x.count,0);$('#viewOutfitItemsSummary').textContent=`${unique.length} ${unique.length===1?'item':'items'}${copies>unique.length?` · ${copies} placements`:''}`;$$('#viewOutfitItems .portfolio-item-row').forEach(row=>row.onclick=()=>openPortfolioItemPreview(row.dataset.itemSource,row.dataset.itemId));const board=$('#viewOutfitBoard');board.innerHTML='';board.oncontextmenu=e=>{if(e.target.closest('img'))e.preventDefault()};const itemPanel=$('#outfitViewDialog .outfit-items-panel');if(itemPanel){itemPanel.open=false;itemPanel.ontoggle=()=>requestAnimationFrame(updateOutfitDetailScrollLock)}lockPageForPortfolioModal();$('#outfitViewDialog').showModal();updateOutfitDetailScrollLock();requestAnimationFrame(()=>{const sourceW=o.boardWidth||390,sourceH=o.boardHeight||420,bw=board.clientWidth||390,bh=board.clientHeight||350,scale=Math.min(bw/sourceW,bh/sourceH),offsetX=(bw-sourceW*scale)/2,offsetY=(bh-sourceH*scale)/2;o.pieces.slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(p=>renderSnapshotPiece(board,p,scale,scale,offsetX,offsetY))})}
function portfolioItemDetailRows(item,source='closet'){const rows=source==='wishlist'?[['Category',item.category],['Item',item.name||item.type],['Brand',item.brand],['Color',item.color],['Price',item.wishlistPrice??item.price],['Notes',item.notes]]:[['Category',item.category],['Type',displayItemType(item)],['Brand',item.brand],['Color',item.color],['Size',item.size],['Pattern',item.pattern],['Season',item.season],['Acquired',item.acquired],['Wears',Number(item.wears||0)||0],['Status',isArchived(item)?'Archived':'Active'],['Notes',item.notes]];return rows.filter(([,value])=>value!==undefined&&value!==null&&String(value).trim()!=='').map(([label,value])=>`<div class="journal-preview-detail-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}
function openPortfolioItemPreview(source,itemId){const pool=source==='wishlist'?state.wishlist:state.items,item=pool.find(x=>x.id===itemId);if(!item)return toast('This item is no longer available');portfolioPreviewReturnOutfitId=viewingOutfitId;portfolioPreviewItemId=item.id;portfolioPreviewItemSource=source==='wishlist'?'wishlist':'closet';const d=$('#outfitViewDialog');if(d.open)d.close();lockPageForPortfolioModal();$('#portfolioItemPreviewTitle').textContent=item.name||displayItemType(item)||'Piece details';$('#portfolioItemPreviewKicker').textContent=portfolioPreviewItemSource==='wishlist'?'wishlist piece':'portfolio piece';$('#portfolioItemPreviewPhoto').innerHTML=item.photo?`<img src="${item.photo}" alt="${esc(item.name||displayItemType(item)||'Piece')}" draggable="false">`:'<div class="journal-preview-placeholder">✣</div>';$('#portfolioItemPreviewDetails').innerHTML=portfolioItemDetailRows(item,portfolioPreviewItemSource);$('#portfolioItemPreviewDialog').showModal()}
function closePortfolioItemPreview(){const returnId=portfolioPreviewReturnOutfitId,d=$('#portfolioItemPreviewDialog');if(d.open)d.close();portfolioPreviewReturnOutfitId=null;portfolioPreviewItemId=null;portfolioPreviewItemSource='closet';if(returnId&&state.outfits.some(o=>o.id===returnId))viewOutfit(returnId);else unlockPageForPortfolioModal()}
function deleteOutfit(){if(!viewingOutfitId||!confirm('Delete this saved outfit?'))return;const doomed=viewingOutfitId;state.outfits=state.outfits.filter(x=>x.id!==doomed);ensureSettings();Object.keys(state.settings.portfolioOrder||{}).forEach(f=>state.settings.portfolioOrder[f]=state.settings.portfolioOrder[f].filter(x=>x!==doomed));saveState();$('#outfitViewDialog').close();unlockPageForPortfolioModal();renderSavedOutfits()}
async function favoriteViewedOutfit(){const o=state.outfits.find(x=>x.id===viewingOutfitId);if(!o)return;o.favorite=!o.favorite;await saveState();refreshViewedOutfitFavorite(o);renderSavedOutfits();toast(o.favorite?'Added to favorites':'Removed from favorites')}
function editViewedOutfit(){const oid=viewingOutfitId;if(!oid)return;$('#outfitViewDialog').close();unlockPageForPortfolioModal();guardBoardSwitch(()=>loadOutfitForEditing(oid),'edit this saved look')}
function duplicateViewedOutfit(){const oid=viewingOutfitId;if(!oid)return;$('#outfitViewDialog').close();unlockPageForPortfolioModal();guardBoardSwitch(()=>loadOutfitAsDuplicate(oid),'duplicate this saved look')}
function loadOutfitAsDuplicate(oid){const o=state.outfits.find(x=>x.id===oid);if(!o)return;editingOutfitId=null;boardUndoStack=[];boardItems=(o.pieces||[]).map(p=>normalizeBoardItem({...p,uid:id()}));selectedBoardUid=null;doodleMode=false;$('#drawModeBtn')?.classList.remove('active');$('#outfitBoard')?.classList.remove('drawing');$('#outfitName').value=`${o.name||'Untitled look'} — Copy`;$('#outfitNotes').value=o.notes||'';populatePortfolioFolderSelect(o.folder||state.settings.portfolioFolders[0]);$('#saveOutfitBtn').textContent='Save outfit';drawBoard();showScreen('outfits');setTimeout(()=>$('#outfitBoard').scrollIntoView({behavior:'smooth',block:'center'}),80);toast('Copy loaded as a new look — save when ready')}
function requestOutfitShare(outfitId=null){if(outfitId){const o=state.outfits.find(x=>x.id===outfitId);if(!o)return;pendingShareOutfitId=outfitId;shareReturnOutfitId=outfitId}else{if(!boardItems.length)return toast('Add something to the board first');pendingShareOutfitId=null;shareReturnOutfitId=null}const d=$('#shareChoiceDialog');if(d&&!d.open)d.showModal()}
function cancelShareChoice(){const returnId=shareReturnOutfitId;pendingShareOutfitId=null;shareReturnOutfitId=null;const d=$('#shareChoiceDialog');if(d?.open)d.close();if(returnId&&state.outfits.some(o=>o.id===returnId))viewOutfit(returnId)}
function shareViewedOutfit(){const o=state.outfits.find(x=>x.id===viewingOutfitId);if(!o)return;const oid=o.id;const d=$('#outfitViewDialog');if(d.open)d.close();unlockPageForPortfolioModal();requestOutfitShare(oid)}

function renderPortfolioFolderEditor(){
  ensureSettings();
  const box=$('#portfolioFolderEditor');if(!box)return;
  const order=state.settings.portfolioTabOrder;
  box.innerHTML=order.map((f,i)=>{const system=SYSTEM_PORTFOLIO_TABS.includes(f);return `<div class="folder-edit-row ${system?'system-folder-row':''}" data-index="${i}" data-folder="${esc(f)}"><input value="${esc(f)}" maxlength="24" aria-label="Folder name" ${system?'readonly':''}><div class="folder-row-actions"><button type="button" class="folder-up" ${i===0?'disabled':''}>↑</button><button type="button" class="folder-down" ${i===order.length-1?'disabled':''}>↓</button>${system?'<span class="system-folder-lock" title="Built-in folder">🔒</span>':'<button type="button" class="folder-delete">×</button>'}</div></div>`}).join('');
  $$('.folder-edit-row input:not([readonly])').forEach(inp=>inp.onchange=()=>renamePortfolioFolderByName(inp.closest('.folder-edit-row').dataset.folder,inp.value));
  $$('.folder-up').forEach(b=>b.onclick=()=>movePortfolioTab(Number(b.closest('.folder-edit-row').dataset.index),-1));
  $$('.folder-down').forEach(b=>b.onclick=()=>movePortfolioTab(Number(b.closest('.folder-edit-row').dataset.index),1));
  $$('.folder-delete').forEach(b=>b.onclick=()=>deletePortfolioFolderByName(b.closest('.folder-edit-row').dataset.folder));
}
async function renamePortfolioFolderByName(old,name){if(SYSTEM_PORTFOLIO_TABS.includes(old))return;name=String(name||'').trim();if(!name)return renderPortfolioFolderEditor();if(SYSTEM_PORTFOLIO_TABS.includes(name)||state.settings.portfolioFolders.some(x=>x!==old&&x.toLowerCase()===name.toLowerCase())){toast('That folder name is already in use');return renderPortfolioFolderEditor()}const index=state.settings.portfolioFolders.indexOf(old);if(index<0)return;state.settings.portfolioFolders[index]=name;state.outfits.forEach(o=>{if((o.folder||'Everyday')===old)o.folder=name});if(state.settings.portfolioOrder[old]){state.settings.portfolioOrder[name]=state.settings.portfolioOrder[old];delete state.settings.portfolioOrder[old]}state.settings.portfolioTabOrder=state.settings.portfolioTabOrder.map(x=>x===old?name:x);if(portfolioFilter===old)portfolioFilter=name;await saveState();populatePortfolioFolderSelect(name);renderPortfolioFolderEditor();toast('Folder renamed')}
async function movePortfolioTab(index,dir){ensureSettings();const order=state.settings.portfolioTabOrder,j=index+dir;if(j<0||j>=order.length)return;[order[index],order[j]]=[order[j],order[index]];await saveState();renderPortfolioFolderEditor();renderSavedOutfits()}
async function deletePortfolioFolderByName(old){if(SYSTEM_PORTFOLIO_TABS.includes(old))return;const index=state.settings.portfolioFolders.indexOf(old);if(index<0)return;if(state.settings.portfolioFolders.length<=1)return;const replacement=state.settings.portfolioFolders.find(x=>x!==old)||'Everyday';if(!confirm(`Remove “${old}”? Saved looks in it will move to “${replacement}”.`))return;const moved=(state.settings.portfolioOrder[old]||[]).slice();state.settings.portfolioFolders.splice(index,1);state.settings.portfolioTabOrder=state.settings.portfolioTabOrder.filter(x=>x!==old);state.outfits.forEach(o=>{if((o.folder||'Everyday')===old)o.folder=replacement});state.settings.portfolioOrder[replacement]=[...(state.settings.portfolioOrder[replacement]||[]),...moved.filter(x=>!(state.settings.portfolioOrder[replacement]||[]).includes(x))];delete state.settings.portfolioOrder[old];if(portfolioFilter===old)portfolioFilter='All';await saveState();populatePortfolioFolderSelect(replacement);renderPortfolioFolderEditor();renderSavedOutfits();toast('Folder removed')}
async function addPortfolioFolder(){ensureSettings();const input=$('#newPortfolioFolder'),name=input.value.trim();if(!name)return toast('Enter a folder name');if(state.settings.portfolioFolders.length>=12)return toast('Up to 12 folders');if(SYSTEM_PORTFOLIO_TABS.includes(name)||state.settings.portfolioFolders.some(x=>x.toLowerCase()===name.toLowerCase()))return toast('That folder already exists');state.settings.portfolioFolders.push(name);state.settings.portfolioTabOrder.push(name);input.value='';await saveState();populatePortfolioFolderSelect(name);renderPortfolioFolderEditor();toast('Folder added')}

function applyJournalSectionOrder(){
  ensureSettings();
  const screen=document.querySelector('.screen[data-screen="journal"]');if(!screen)return;
  state.settings.journalSectionOrder.forEach(key=>{const section=screen.querySelector(`[data-journal-section="${key}"]`);if(section)screen.appendChild(section)});
}
function renderJournalOrderEditor(){
  ensureSettings();
  const box=$('#journalOrderEditor');if(!box)return;
  const order=state.settings.journalSectionOrder;
  box.innerHTML=order.map((key,i)=>`<div class="journal-order-row" data-index="${i}" data-journal-key="${key}"><span class="journal-order-name">${esc(JOURNAL_SECTION_LABELS[key]||key)}</span><div class="journal-order-actions"><button type="button" class="journal-order-up" aria-label="Move ${esc(JOURNAL_SECTION_LABELS[key]||key)} up" ${i===0?'disabled':''}>↑</button><button type="button" class="journal-order-down" aria-label="Move ${esc(JOURNAL_SECTION_LABELS[key]||key)} down" ${i===order.length-1?'disabled':''}>↓</button></div></div>`).join('');
  $$('.journal-order-up').forEach(b=>b.onclick=()=>moveJournalSection(Number(b.closest('.journal-order-row').dataset.index),-1));
  $$('.journal-order-down').forEach(b=>b.onclick=()=>moveJournalSection(Number(b.closest('.journal-order-row').dataset.index),1));
}
async function moveJournalSection(index,dir){
  ensureSettings();const order=state.settings.journalSectionOrder,j=index+dir;if(j<0||j>=order.length)return;
  [order[index],order[j]]=[order[j],order[index]];
  await saveState();applyJournalSectionOrder();renderJournalOrderEditor();toast('Journal layout saved');
}

function renderWearCategoryTabs(){
  const tabs=['All',...CATEGORIES];
  $('#wearCategoryTabs').innerHTML=tabs.map(c=>`<button type="button" class="${wearCategoryFilter===c?'active':''}" data-cat="${c}">${c}</button>`).join('');
  $$('#wearCategoryTabs button').forEach(b=>b.onclick=()=>{wearCategoryFilter=b.dataset.cat;renderWearPicker()});
}
function renderWearPicker(){
  const items=state.items.filter(i=>(!isArchived(i)||wearDraftIds.has(i.id))&&(wearCategoryFilter==='All'||i.category===wearCategoryFilter));
  $('#wearPicker').innerHTML=items.map(i=>`<button type="button" class="wear-option ${wearDraftIds.has(i.id)?'selected':''}" data-id="${i.id}">${i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i))}">`:'<div class="wear-placeholder">✣</div>'}<strong>${esc(displayItemType(i))}</strong><small>${esc(i.color||'')} ${i.brand?`· ${esc(i.brand)}`:''}</small></button>`).join('')||'<div class="empty-state compact wear-empty"><p>No pieces in this category.</p></div>';
  $$('.wear-option').forEach(b=>b.onclick=()=>{const iid=b.dataset.id;if(wearDraftIds.has(iid)){wearDraftIds.delete(iid);b.classList.remove('selected')}else{wearDraftIds.add(iid);b.classList.add('selected')}updateWearSelectedCount()});
  renderWearCategoryTabs();updateWearSelectedCount();
}
function updateWearSelectedCount(){const n=wearDraftIds.size;$('#wearSelectedCount').textContent=`${n} selected`}
function setWearDateLock(locked){
  wearDateLocked=!!locked;
  const input=$('#wearDate');if(!input)return;
  input.disabled=wearDateLocked;
  input.classList.toggle('date-locked',wearDateLocked);
  input.setAttribute('aria-disabled',wearDateLocked?'true':'false');
  const label=input.closest('.wear-date-label');if(label)label.classList.toggle('wear-date-locked',wearDateLocked);
}
function loadWearDate(date,{lockDate=null}={}){
  const existing=state.journal.find(j=>j.date===date);
  wearSessionMode=existing?'edit':'add';
  editingWearId=existing?.id||null;
  wearDraftIds=new Set(existing?.itemIds||[]);
  wearOriginalDate=date;
  wearMoveOverrideTarget=false;
  wearMoveSourceId=existing?.id||null;
  $('#wearDate').value=date;
  $('#wearDialogTitle').textContent=existing?'Edit what you wore':'Log outfit';
  $('#deleteWearBtn').classList.toggle('hidden',!existing);
  const shouldLock=lockDate===null?!!existing&&date<=localTodayISO():!!lockDate;
  setWearDateLock(shouldLock);
  wearCategoryFilter='All';
  renderWearPicker();
}
function startNewWearLog(){
  wearSessionMode='add';
  editingWearId=null;
  wearDraftIds=new Set();
  wearOriginalDate=localTodayISO();
  wearMoveOverrideTarget=false;
  wearMoveSourceId=null;
  closeWearDateConflict();
  $('#wearDate').value=wearOriginalDate;
  $('#wearDialogTitle').textContent='Log outfit';
  $('#deleteWearBtn').classList.add('hidden');
  // A new Log outfit session is always date-flexible, even if today already has a saved entry.
  // The user only transitions into edit/replace behavior after explicitly choosing an occupied date.
  setWearDateLock(false);
  wearCategoryFilter='All';
  renderWearPicker();
}
function closeWearDateConflict(){const panel=$('#wearDateConflict');if(panel)panel.classList.add('hidden');wearDateConflictPending=null}
function showWearDateConflict(next,previous,currentIds){const target=state.journal.find(j=>j.date===next);if(!target)return false;wearDateConflictPending={next,previous,currentIds:[...currentIds],targetId:target.id};const dateLabel=$('#wearDateConflictDate');if(dateLabel)dateLabel.textContent=formatJournalDate(next);const panel=$('#wearDateConflict');if(panel)panel.classList.remove('hidden');return true}
function resolveWearDateConflict(action){const pending=wearDateConflictPending;if(!pending)return;const {next,previous,currentIds,targetId}=pending;closeWearDateConflict();if(action==='cancel'){$('#wearDate').value=previous;wearOriginalDate=previous;return}if(action==='open'){loadWearDate(next,{lockDate:next<=localTodayISO()});return}if(action==='replace'){const target=state.journal.find(j=>j.id===targetId);if(!target){wearSessionMode='add';wearOriginalDate=next;$('#wearDate').value=next;setWearDateLock(false);renderWearPicker();return}wearSessionMode='edit';editingWearId=target.id;wearDraftIds=new Set(currentIds);wearOriginalDate=next;wearMoveOverrideTarget=false;wearMoveSourceId=target.id;$('#wearDate').value=next;$('#wearDialogTitle').textContent='Edit what you wore';$('#deleteWearBtn').classList.remove('hidden');setWearDateLock(next<=localTodayISO());wearCategoryFilter='All';renderWearPicker();toast('Current selection ready to replace this day when saved')}}
function handleWearDateChange(){
  const input=$('#wearDate'),next=input.value,previous=wearOriginalDate||localTodayISO();
  if(!next||next===previous)return;
  if(wearDateLocked){input.value=previous;return}

  // ADD MODE: changing the date must never reload the picker or discard selections.
  // The date stays editable until the new journal entry is saved, including for past dates.
  if(wearSessionMode==='add'){
    const target=state.journal.find(j=>j.date===next);
    if(target&&showWearDateConflict(next,previous,wearDraftIds)){input.value=next;return}
    wearOriginalDate=next;
    input.value=next;
    editingWearId=null;
    wearMoveSourceId=null;
    wearMoveOverrideTarget=false;
    setWearDateLock(false);
    renderWearPicker();
    return;
  }

  const source=wearMoveSourceId?state.journal.find(j=>j.id===wearMoveSourceId):null;
  // EDIT MODE: existing past/today entries are locked. An existing future/planned entry can be moved.
  if(source&&String(source.date||'')>localTodayISO()){
    const keepCurrent=confirm(`Move this planned look to ${formatJournalDate(next)} and use these selected items for that day?

OK = move these items to the new day
Cancel = keep this planned look on ${formatJournalDate(previous)}`);
    if(keepCurrent){
      wearMoveOverrideTarget=true;
      input.value=next;
      // Keep the source selection visible so the user can review/add pieces before saving.
      renderWearPicker();
      return;
    }
    // Cancel means cancel the date move itself. Stay in the same planned-look edit
    // session, preserve its selected pieces, and restore the prior date.
    input.value=previous;
    wearMoveOverrideTarget=false;
    return;
  }
  const target=state.journal.find(j=>j.date===next);
  if(target&&showWearDateConflict(next,previous,wearDraftIds)){input.value=next;return}
  // An editable future entry moving to an unused date keeps its current selection.
  wearOriginalDate=next;
  input.value=next;
  wearMoveOverrideTarget=true;
  renderWearPicker();
}
function lockPageForWearDialog(){
  if(document.body.classList.contains('wear-dialog-open'))return;
  wearDialogScrollY=window.scrollY||0;
  document.body.style.top=`-${wearDialogScrollY}px`;
  document.body.classList.add('wear-dialog-open');
}
function unlockPageForWearDialog(){
  if(!document.body.classList.contains('wear-dialog-open'))return;
  document.body.classList.remove('wear-dialog-open');
  document.body.style.top='';
  window.scrollTo(0,wearDialogScrollY||0);
}
function openWear(date=''){
  closeWearDateConflict();
  if(!state.items.some(i=>!isArchived(i)))return toast('Add or reactivate a closet piece first');
  if(date){
    const existing=state.journal.find(j=>j.date===date);
    if(existing)loadWearDate(date,{lockDate:date<=localTodayISO()});
    else{
      startNewWearLog();
      wearOriginalDate=date;
      $('#wearDate').value=date;
    }
  }else startNewWearLog();
  if(!$('#wearDialog').open){lockPageForWearDialog();$('#wearDialog').showModal();}
}
function closeWearWithoutSaving(){closeWearDateConflict();wearSessionMode='add';editingWearId=null;wearCategoryFilter='All';wearDraftIds=new Set();wearOriginalDate='';wearDateLocked=false;wearMoveOverrideTarget=false;wearMoveSourceId=null;if($('#wearDialog').open)$('#wearDialog').close('cancel');else unlockPageForWearDialog()}
function recalcWears(){const today=localTodayISO();state.items.forEach(i=>i.wears=state.journal.filter(j=>String(j.date||'')<=today).reduce((n,j)=>n+(j.itemIds||[]).filter(x=>x===i.id).length,0))}
async function saveWear(){
  const ids=[...wearDraftIds];
  if(!ids.length)return toast('Select at least one item');
  const date=$('#wearDate').value;if(!date)return toast('Choose a date');
  // Log outfit always begins as a new-entry workflow. If the chosen day was already
  // logged (including the default today), never overwrite it merely because Save was tapped.
  if(wearSessionMode==='add'){
    const occupied=state.journal.find(j=>j.date===date);
    if(occupied&&showWearDateConflict(date,wearOriginalDate||date,wearDraftIds))return;
  }
  const source=wearMoveSourceId?state.journal.find(j=>j.id===wearMoveSourceId):null;
  if(source&&wearMoveOverrideTarget&&source.date!==date){
    // Moving a planned look: replace the destination day's item selection, then remove the old planned day.
    const target=state.journal.find(j=>j.date===date&&j.id!==source.id);
    const payload={date,itemIds:[...new Set(ids)],notes:source.notes||target?.notes||'',updated:Date.now()};
    if(target){
      Object.assign(target,payload);
      // Keep destination feedback/history when replacing its items.
      state.journal=state.journal.filter(j=>j.id!==source.id);
      editingWearId=target.id;
    }else Object.assign(source,payload);
  }else{
    let existing=editingWearId?state.journal.find(j=>j.id===editingWearId):state.journal.find(j=>j.date===date);
    const payload={date,itemIds:[...new Set(ids)],notes:existing?.notes||'',updated:Date.now()};
    if(existing)Object.assign(existing,payload);else state.journal.unshift({id:id(),created:Date.now(),feel:'',favorite:false,...payload});
    // One entry per day. Merge only unexpected legacy duplicates.
    const sameDay=state.journal.filter(j=>j.date===date);
    if(sameDay.length>1){const keeper=existing||sameDay[0];keeper.itemIds=[...new Set(sameDay.flatMap(j=>j.itemIds||[]))];state.journal=state.journal.filter(j=>j.date!==date||j.id===keeper.id)}
  }
  recalcWears();await saveState();wearSessionMode='add';editingWearId=null;wearOriginalDate='';wearDateLocked=false;wearMoveOverrideTarget=false;wearMoveSourceId=null;$('#wearDialog').close();unlockPageForWearDialog();renderJournal();toast(date>localTodayISO()?'Planned look saved':'Journal updated')
}
async function deleteWearEntry(){if(!editingWearId)return;await deleteJournalEntryById(editingWearId,false)}
async function deleteJournalEntryById(jid,fromDetail=false){
  const j=state.journal.find(x=>x.id===jid);if(!j)return;
  if(!confirm(`Delete the journal entry for ${formatJournalDate(j.date)}?`))return;
  state.journal=state.journal.filter(x=>x.id!==jid);recalcWears();await saveState();
  if($('#wearDialog').open){$('#wearDialog').close();unlockPageForWearDialog();}if(fromDetail&&$('#journalDetailDialog').open)closeJournalDetail();
  editingWearId=null;viewingJournalId=null;renderJournal();toast('Journal entry deleted')
}
function formatJournalDate(date){return new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
function localTodayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function isFutureJournal(j){return String(j?.date||'')>localTodayISO()}
function journalEntriesForRange(){
  let rows=state.journal.filter(j=>!isFutureJournal(j));const now=new Date();
  if(journalRangeFilter==='favorites')rows=rows.filter(j=>j.favorite);
  else if(journalRangeFilter==='season'){const sn=seasonForDate(now);rows=rows.filter(j=>seasonForDate(new Date(j.date+'T12:00:00'))===sn)}
  else if(journalRangeFilter==='year'){const year=now.getFullYear();rows=rows.filter(j=>new Date(j.date+'T12:00:00').getFullYear()===year)}
  else if(['7','30','90'].includes(journalRangeFilter)){const cutoff=new Date(now);cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-(Number(journalRangeFilter)-1));rows=rows.filter(j=>new Date(j.date+'T12:00:00')>=cutoff)}
  else if(journalRangeFilter==='custom'){
    if(journalRangeStart)rows=rows.filter(j=>String(j.date||'')>=journalRangeStart);
    if(journalRangeEnd)rows=rows.filter(j=>String(j.date||'')<=journalRangeEnd);
  }
  return rows.sort((a,b)=>b.date.localeCompare(a.date));
}
function formatJournalRangeCompact(start,end){
  if(!start||!end)return '';
  const a=new Date(start+'T12:00:00'),b=new Date(end+'T12:00:00'),now=new Date(),currentYear=now.getFullYear(),ay=a.getFullYear(),by=b.getFullYear();
  const monthDay=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  if(ay===currentYear&&by===currentYear)return `${monthDay(a)} – ${monthDay(b)}`;
  if(ay===by)return `${monthDay(a)} – ${monthDay(b)}, ${ay}`;
  return `${monthDay(a)}, ${ay} – ${monthDay(b)}, ${by}`;
}
function updateJournalFilterUI(){
  const summary=$('#journalRangeSummary'),clear=$('#journalClearFiltersBtn'),select=$('#journalRange');if(!summary)return;
  const custom=journalRangeFilter==='custom'&&journalRangeStart&&journalRangeEnd;
  summary.textContent=custom?formatJournalRangeCompact(journalRangeStart,journalRangeEnd):'';
  summary.classList.toggle('hidden',!custom);
  const active=journalRangeFilter!=='all';
  if(clear)clear.classList.toggle('hidden',!active);
  if(select){select.value=journalRangeFilter;select.classList.toggle('active-filter',active)}
}
function closeJournalFilterPanel(){}
function handleJournalRangeFilterChange(value){
  const select=$('#journalRange');if(select)select.blur();
  if(value==='custom'){requestAnimationFrame(openJournalRangeDialog);return}
  journalRangeFilter=value;journalRangeStart='';journalRangeEnd='';closeJournalFilterPanel();renderJournal();
}
function clearJournalFilters(){
  journalRangeFilter='all';journalRangeStart='';journalRangeEnd='';journalRangeDraftStart='';journalRangeDraftEnd='';closeJournalFilterPanel();renderJournal();
}
function openJournalRangeDialog(){
  journalRangeDraftStart=journalRangeStart;journalRangeDraftEnd=journalRangeEnd;
  const seed=journalRangeDraftStart||localTodayISO();journalCalendarMonth=seed.slice(0,7)+'-01';renderJournalRangeCalendar();
  const d=$('#journalRangeDialog');if(d&&!d.open)d.showModal();
}
function closeJournalRangeDialog(){
  const d=$('#journalRangeDialog');if(d?.open)d.close();
  const select=$('#journalRange');if(select){select.value=journalRangeFilter;select.blur()}
}
function shiftJournalCalendarMonth(delta){
  const base=new Date((journalCalendarMonth||localTodayISO().slice(0,7)+'-01')+'T12:00:00');base.setMonth(base.getMonth()+delta);journalCalendarMonth=`${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-01`;renderJournalRangeCalendar();
}
function journalRangeDayClick(date){
  if(!journalRangeDraftStart||(journalRangeDraftStart&&journalRangeDraftEnd)){journalRangeDraftStart=date;journalRangeDraftEnd=''}
  else if(date<journalRangeDraftStart){journalRangeDraftStart=date;journalRangeDraftEnd=''}
  else journalRangeDraftEnd=date;
  renderJournalRangeCalendar();
}
function renderJournalRangeCalendar(){
  const grid=$('#journalCalendarGrid'),label=$('#journalCalendarMonthLabel'),summary=$('#journalRangeDraftSummary'),apply=$('#applyJournalRangeBtn');if(!grid||!label)return;
  const base=new Date((journalCalendarMonth||localTodayISO().slice(0,7)+'-01')+'T12:00:00');const y=base.getFullYear(),m=base.getMonth();
  label.textContent=base.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const first=new Date(y,m,1,12),days=new Date(y,m+1,0,12).getDate(),offset=first.getDay(),today=localTodayISO();let html='';
  for(let i=0;i<offset;i++)html+='<span class="journal-calendar-blank"></span>';
  for(let day=1;day<=days;day++){
    const date=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const start=date===journalRangeDraftStart,end=date===journalRangeDraftEnd,inRange=journalRangeDraftStart&&journalRangeDraftEnd&&date>journalRangeDraftStart&&date<journalRangeDraftEnd;
    const future=date>today,cls=['journal-calendar-day',start?'range-start':'',end?'range-end':'',inRange?'in-range':'',date===today?'today':''].filter(Boolean).join(' ');
    html+=`<button type="button" class="${cls}" data-date="${date}" ${future?'disabled':''}>${day}</button>`;
  }
  grid.innerHTML=html;$$('#journalCalendarGrid .journal-calendar-day:not(:disabled)').forEach(b=>b.onclick=()=>journalRangeDayClick(b.dataset.date));
  if(!journalRangeDraftStart)summary.textContent='Choose a start date';
  else if(!journalRangeDraftEnd)summary.textContent=`Start: ${new Date(journalRangeDraftStart+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · choose an end date`;
  else summary.textContent=formatJournalRangeCompact(journalRangeDraftStart,journalRangeDraftEnd);
  apply.disabled=!(journalRangeDraftStart&&journalRangeDraftEnd);
  const next=$('#journalCalendarNext');if(next){const thisMonth=localTodayISO().slice(0,7);next.disabled=`${y}-${String(m+1).padStart(2,'0')}`>=thisMonth}
}
function applyJournalCustomRange(){
  if(!journalRangeDraftStart||!journalRangeDraftEnd)return;
  journalRangeStart=journalRangeDraftStart;journalRangeEnd=journalRangeDraftEnd;journalRangeFilter='custom';
  const select=$('#journalRange');if(select)select.blur();
  const d=$('#journalRangeDialog');if(d?.open)d.close();closeJournalFilterPanel();renderJournal();
  requestAnimationFrame(()=>{const current=$('#journalRange');if(current){current.value='custom';current.blur()}});
}

function applyJournalListScrollLimit(list,count,limit=7){
  if(!list)return;
  list.classList.toggle('journal-scroll-limited',count>limit);
  list.style.removeProperty('--journal-scroll-height');
  if(count<=limit||list.offsetParent===null)return;
  requestAnimationFrame(()=>{
    const rows=[...list.children].slice(0,limit);
    if(!rows.length)return;
    const style=getComputedStyle(list),gap=parseFloat(style.rowGap||style.gap)||0;
    const height=rows.reduce((sum,row)=>sum+row.getBoundingClientRect().height,0)+gap*Math.max(0,rows.length-1);
    list.style.setProperty('--journal-scroll-height',Math.ceil(height)+'px');
  });
}
function journalRow(j,planned=false){
  const d=new Date(j.date+'T12:00:00'),items=(j.itemIds||[]).map(x=>state.items.find(i=>i.id===x)).filter(Boolean);
  const pics=items.slice(0,4).map(i=>i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i))}">`:'').join('');
  const sub=planned?'Planned outfit':(j.feel||j.notes||'Tap to see what you wore');
  return `<button type="button" class="journal-row journal-row-button ${planned?'journal-row-planned':''}" data-journal-id="${j.id}"><div class="journal-date ${planned?'journal-date-planned':''}"><small>${d.toLocaleString('en',{month:'short'}).toUpperCase()}</small><strong>${d.getDate()}</strong></div><div class="journal-row-main"><div class="journal-thumbs">${pics}</div><div class="journal-row-copy"><strong>${j.favorite?'★ ':''}${items.length} ${items.length===1?'piece':'pieces'}${planned?' <span class="planned-badge">PLANNED</span>':''}</strong><small>${esc(sub)}</small></div></div><span class="journal-chevron">›</span></button>`;
}
function renderJournal(){
  applyJournalSectionOrder();
  const pastJournal=state.journal.filter(j=>!isFutureJournal(j));
  const wears=state.items.map(i=>({...i,w:pastJournal.reduce((n,j)=>n+(j.itemIds||[]).filter(x=>x===i.id).length,0)})).sort((a,b)=>b.w-a.w),total=wears.reduce((n,i)=>n+i.w,0);$('#totalWears').textContent=total;const mw=wears[0]?.w?wears[0]:null;$('#mostWorn').textContent=mw?displayItemType(mw):'—';$('#mostWornMeta').textContent=mw?`${mw.w} wears · ${mw.color||'color not set'}`:'No wear data yet';
  const colorCounts={};pastJournal.forEach(j=>(j.itemIds||[]).forEach(x=>{const i=state.items.find(z=>z.id===x);if(i?.color)colorCounts[i.color]=(colorCounts[i.color]||0)+1}));const fav=Object.entries(colorCounts).sort((a,b)=>b[1]-a[1])[0];$('#favColor').textContent=fav?.[0]||'—';$('#favColorMeta').textContent=fav?`${fav[1]} item-wears`:'No wear data yet';const sn=seasonForDate();$('#seasonName').textContent=sn;$('#seasonWears').textContent=pastJournal.filter(j=>seasonForDate(new Date(j.date+'T12:00:00'))===sn).reduce((n,j)=>n+(j.itemIds||[]).length,0);
  const today=localTodayISO(),todayEntry=state.journal.find(j=>String(j.date||'')===today);
  $('#todayJournalSection').classList.toggle('hidden',!todayEntry);
  $('#todayJournalList').innerHTML=todayEntry?journalRow(todayEntry,false):'';
  $('#todayJournalMeta').textContent=todayEntry?`${(todayEntry.itemIds||[]).length} ${(todayEntry.itemIds||[]).length===1?'piece':'pieces'}`:'today';renderTodayJournalVisibility();
  const planned=state.journal.filter(isFutureJournal).sort((a,b)=>a.date.localeCompare(b.date));$('#plannedJournalSection').classList.toggle('hidden',!planned.length);$('#plannedJournalList').innerHTML=planned.map(j=>journalRow(j,true)).join('');$('#plannedJournalCount').textContent=`${planned.length} ${planned.length===1?'planned day':'planned days'}`;renderPlannedJournalVisibility();applyJournalListScrollLimit($('#plannedJournalList'),planned.length);
  const rows=journalEntriesForRange().filter(j=>String(j.date||'')!==today);updateJournalFilterUI();$('#journalCount').textContent=`${rows.length} ${rows.length===1?'day':'days'}`;$('#journalList').innerHTML=rows.map(j=>journalRow(j,false)).join('')||'<div class="empty-state compact"><p>No journal entries in this view.</p></div>';applyJournalListScrollLimit($('#journalList'),rows.length);$$('.journal-row-button').forEach(b=>b.onclick=()=>openJournalDetail(b.dataset.journalId));renderWearLogVisibility();
  renderWearInsightsVisibility();drawDonut($('#colorChart'),colorCounts);const seasonCounts={Winter:0,Spring:0,Summer:0,Fall:0};pastJournal.forEach(j=>seasonCounts[seasonForDate(new Date(j.date+'T12:00:00'))]++);drawBars($('#seasonChart'),seasonCounts)
}


function renderTodayJournalVisibility(){
  const content=$('#todayJournalContent'),toggle=$('#todayJournalToggle');if(!content||!toggle)return;
  content.classList.toggle('hidden',!todayJournalExpanded);toggle.setAttribute('aria-expanded',todayJournalExpanded?'true':'false');const icon=toggle.querySelector('.today-toggle-icon');if(icon)icon.textContent=todayJournalExpanded?'−':'＋';
}

function renderWearLogVisibility(){
  const content=$('#wearLogContent'),toggle=$('#wearLogToggle');if(!content||!toggle)return;
  content.classList.toggle('hidden',!wearLogExpanded);
  toggle.setAttribute('aria-expanded',wearLogExpanded?'true':'false');
  const icon=toggle.querySelector('.wear-log-toggle-icon');if(icon)icon.textContent=wearLogExpanded?'−':'＋';
  if(wearLogExpanded){const list=$('#journalList');applyJournalListScrollLimit(list,list?list.querySelectorAll('.journal-row-button').length:0)}
}

function renderPlannedJournalVisibility(){
  const list=$('#plannedJournalList'),toggle=$('#plannedJournalToggle');if(!list||!toggle)return;
  list.classList.toggle('hidden',!plannedJournalExpanded);toggle.setAttribute('aria-expanded',plannedJournalExpanded?'true':'false');const icon=toggle.querySelector('.planned-toggle-icon');if(icon)icon.textContent=plannedJournalExpanded?'−':'＋';
  if(plannedJournalExpanded)applyJournalListScrollLimit(list,list.querySelectorAll('.journal-row-button').length);
}

function renderWearInsightsVisibility(){
  const content=$('#wearInsightsContent'),toggle=$('#wearInsightsToggle');if(!content||!toggle)return;
  content.classList.toggle('hidden',!wearInsightsExpanded);toggle.setAttribute('aria-expanded',wearInsightsExpanded?'true':'false');const icon=toggle.querySelector('.wear-insights-toggle-icon');if(icon)icon.textContent=wearInsightsExpanded?'−':'＋';
}
function lockPageForJournalDetail(){
  if(document.body.classList.contains('journal-detail-open'))return;
  journalDetailScrollY=window.scrollY||0;document.body.style.top=`-${journalDetailScrollY}px`;document.body.classList.add('journal-detail-open');
}
function unlockPageForJournalDetail(){
  if(!document.body.classList.contains('journal-detail-open'))return;
  document.body.classList.remove('journal-detail-open');document.body.style.top='';window.scrollTo(0,journalDetailScrollY||0);
}
function closeJournalDetail(){const d=$('#journalDetailDialog');if(d.open)d.close();unlockPageForJournalDetail();viewingJournalId=null}
const JOURNAL_RATING_TEXT={1:'Would change it',2:'Not quite right',3:'Pretty good',4:'Felt great',5:'Loved it'};
function legacyJournalRating(feel){const map={'Would change it':1,'Just okay':3,'Felt good':4,'Loved it':5};return map[feel]||0}
function journalRatingValue(j){const n=Number(j?.rating||0);return n>=1&&n<=5?n:legacyJournalRating(j?.feel)}
function refreshJournalDetailFeedback(j){
  const planned=isFutureJournal(j),rating=journalRatingValue(j);$('#journalDetailKicker').textContent=planned?'planned look':'wear log';
  $$('#journalDetailRatingStars .journal-rating-star').forEach(btn=>{const on=Number(btn.dataset.rating)<=rating;btn.textContent=on?'★':'☆';btn.classList.toggle('active',on);btn.setAttribute('aria-checked',Number(btn.dataset.rating)===rating?'true':'false')});
  $('#journalDetailRatingText').textContent=rating?`${rating} of 5 · ${JOURNAL_RATING_TEXT[rating]}`:'Not rated yet';
  $('#journalDetailFavoriteBtn').textContent=j.favorite?'★':'☆';$('#journalDetailFavoriteBtn').classList.toggle('active',!!j.favorite);
}
async function saveJournalDetailRating(rating){const j=state.journal.find(x=>x.id===viewingJournalId);if(!j)return;rating=Math.max(1,Math.min(5,Number(rating)||0));j.rating=rating;j.feel=JOURNAL_RATING_TEXT[rating];j.updated=Date.now();await saveState();refreshJournalDetailFeedback(j);renderJournal();toast(`${rating}-star rating saved`)}
async function toggleJournalDetailFavorite(){const j=state.journal.find(x=>x.id===viewingJournalId);if(!j)return;j.favorite=!j.favorite;j.updated=Date.now();await saveState();refreshJournalDetailFeedback(j);renderJournal();toast(j.favorite?'Added to favorites':'Removed from favorites')}
async function saveJournalDetailNotes(){const j=state.journal.find(x=>x.id===viewingJournalId);if(!j)return;j.notes=$('#journalDetailNotesInput').value.trim();j.updated=Date.now();await saveState();const notesSummary=$('#journalDetailNotesSummary');if(notesSummary)notesSummary.textContent=j.notes?'Notes saved':'Add a note';renderJournal();toast('Notes saved')}
function setJournalDetailNotesExpanded(expanded){const body=$('#journalDetailNotesBody'),toggle=$('#journalDetailNotesToggle'),icon=toggle?.querySelector('.journal-notes-toggle-icon');if(!body||!toggle)return;body.classList.toggle('hidden',!expanded);toggle.setAttribute('aria-expanded',expanded?'true':'false');if(icon)icon.textContent=expanded?'−':'＋'}
function toggleJournalDetailNotes(){const toggle=$('#journalDetailNotesToggle');setJournalDetailNotesExpanded(toggle?.getAttribute('aria-expanded')!=='true')}
function openJournalDetail(jid){
  const j=state.journal.find(x=>x.id===jid);if(!j)return;viewingJournalId=jid;$('#journalDetailTitle').textContent=formatJournalDate(j.date);refreshJournalDetailFeedback(j);
  const items=(j.itemIds||[]).map(x=>state.items.find(i=>i.id===x)).filter(Boolean);$('#journalDetailItems').innerHTML=items.map(i=>`<button type="button" class="journal-detail-item" data-item-id="${i.id}">${i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i))}">`:'<div class="wear-placeholder">✣</div>'}<div><strong>${esc(displayItemType(i))}</strong><small>${esc([i.color,i.brand,i.size].filter(Boolean).join(' · ')||i.category)}</small></div></button>`).join('');$$('#journalDetailItems .journal-detail-item').forEach(b=>b.onclick=()=>openJournalItemPreview(b.dataset.itemId));$('#journalDetailNotesInput').value=j.notes||'';setJournalDetailNotesExpanded(false);const notesSummary=$('#journalDetailNotesSummary');if(notesSummary)notesSummary.textContent=j.notes?'Notes saved':'Add a note';lockPageForJournalDetail();$('#journalDetailDialog').showModal()
}
function journalItemDetailRows(item){
  const rows=[['Category',item.category],['Type',displayItemType(item)],['Brand',item.brand],['Color',item.color],['Size',item.size],['Pattern',item.pattern],['Season',item.season],['Acquired',item.acquired],['Wears',Number(item.wears||0)||0],['Notes',item.notes]].filter(([,value])=>value!==undefined&&value!==null&&String(value).trim()!=='');
  return rows.map(([label,value])=>`<div class="journal-preview-detail-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
}
function lockPageForJournalItemPreview(){if(document.body.classList.contains('journal-item-preview-open'))return;journalItemPreviewScrollY=window.scrollY||0;document.body.style.top=`-${journalItemPreviewScrollY}px`;document.body.classList.add('journal-item-preview-open')}
function unlockPageForJournalItemPreview(){if(!document.body.classList.contains('journal-item-preview-open'))return;document.body.classList.remove('journal-item-preview-open');document.body.style.top='';window.scrollTo(0,journalItemPreviewScrollY||0)}
function openJournalItemPreview(itemId){
  const live=state.items.find(i=>i.id===itemId);if(!live)return;
  journalItemReturnId=viewingJournalId;journalItemPreviewId=live.id;journalItemPreviewSnapshot={...live};
  const detail=$('#journalDetailDialog');if(detail.open)detail.close();unlockPageForJournalDetail();viewingJournalId=null;
  $('#journalItemPreviewTitle').textContent=journalItemPreviewSnapshot.type||journalItemPreviewSnapshot.category||'Piece details';
  $('#journalItemPreviewPhoto').innerHTML=journalItemPreviewSnapshot.photo?`<img src="${journalItemPreviewSnapshot.photo}" alt="${esc(journalItemPreviewSnapshot.type||journalItemPreviewSnapshot.category||'Closet piece')}">`:'<div class="journal-preview-placeholder">✣</div>';
  $('#journalItemPreviewDetails').innerHTML=journalItemDetailRows(journalItemPreviewSnapshot);
  lockPageForJournalItemPreview();$('#journalItemPreviewDialog').showModal();
}
function clearJournalItemPreview(){journalItemPreviewId=null;journalItemPreviewSnapshot=null}
function closeJournalItemPreviewToDay(){const returnId=journalItemReturnId,d=$('#journalItemPreviewDialog');if(d.open)d.close();unlockPageForJournalItemPreview();clearJournalItemPreview();journalItemReturnId=null;if(returnId&&state.journal.some(j=>j.id===returnId))openJournalDetail(returnId)}
function editJournalItemPreview(){const itemId=journalItemPreviewId,d=$('#journalItemPreviewDialog');if(d.open)d.close();unlockPageForJournalItemPreview();clearJournalItemPreview();journalItemReturnId=null;const live=state.items.find(i=>i.id===itemId);if(!live)return;showScreen('catalog');openItem(live,'','edit')}
function lockPageForJournalStat(){
  if(document.body.classList.contains('journal-stat-open'))return;
  journalStatScrollY=window.scrollY||0;document.body.style.top=`-${journalStatScrollY}px`;document.body.classList.add('journal-stat-open');
}
function unlockPageForJournalStat(){
  if(!document.body.classList.contains('journal-stat-open'))return;
  document.body.classList.remove('journal-stat-open');document.body.style.top='';window.scrollTo(0,journalStatScrollY||0);
}
function closeJournalStat(){const d=$('#journalStatDialog');if(d.open)d.close();unlockPageForJournalStat()}
function openJournalStat(kind){
  const pastJournal=state.journal.filter(j=>!isFutureJournal(j));const wearItems=state.items.map(i=>({...i,w:pastJournal.reduce((n,j)=>n+(j.itemIds||[]).filter(x=>x===i.id).length,0)})).filter(i=>i.w>0).sort((a,b)=>b.w-a.w);let title='Wear details',summary='',items=wearItems;
  if(kind==='most'){title='Most worn pieces';summary=wearItems.length?`Your most-worn piece has ${wearItems[0].w} logged wears.`:'Start logging days to see your most-worn pieces.';items=wearItems.slice(0,12)}
  else if(kind==='color'){const counts={};wearItems.forEach(i=>{if(i.color)counts[i.color]=(counts[i.color]||0)+i.w});const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];title='Favorite color';summary=top?`${top[0]} leads with ${top[1]} item-wears.`:'No color data yet.';items=top?wearItems.filter(i=>i.color===top[0]):[]}
  else if(kind==='season'){const sn=seasonForDate();title=`${sn} wears`;const ids=new Set(pastJournal.filter(j=>seasonForDate(new Date(j.date+'T12:00:00'))===sn).flatMap(j=>j.itemIds||[]));items=wearItems.filter(i=>ids.has(i.id));summary=`${items.length} closet pieces appear in your ${sn.toLowerCase()} journal entries.`}
  else {title='Closet wears';summary=`${wearItems.reduce((n,i)=>n+i.w,0)} total item-wears across ${pastJournal.length} logged days.`;items=wearItems}
  $('#journalStatTitle').textContent=title;$('#journalStatSummary').textContent=summary;$('#journalStatItems').innerHTML=items.map(i=>`<div class="journal-detail-item stat-detail-item">${i.photo?`<img src="${i.photo}" alt="${esc(displayItemType(i))}">`:'<div class="wear-placeholder">✣</div>'}<div><strong>${esc(displayItemType(i))}${i.w?` · ${i.w} wears`:''}</strong><small>${esc([i.color,i.brand].filter(Boolean).join(' · '))}</small></div></div>`).join('')||'<div class="empty-state compact"><p>No matching wear data yet.</p></div>';lockPageForJournalStat();$('#journalStatDialog').showModal()
}
function drawDonut(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,7),total=entries.reduce((n,x)=>n+x[1],0);if(!total){ctx.fillStyle='#8d8273';ctx.font='18px Avenir';ctx.textAlign='center';ctx.fillText('Log outfits to reveal your color story',w/2,h/2);return}let a=-Math.PI/2;entries.forEach(([c,v])=>{const next=a+(v/total)*Math.PI*2;ctx.beginPath();ctx.strokeStyle=colorHex(c);ctx.lineWidth=44;ctx.arc(150,h/2,75,a,next);ctx.stroke();a=next});ctx.fillStyle='#2e2a24';ctx.textAlign='center';ctx.font='32px Georgia';ctx.fillText(total,150,h/2+7);ctx.font='12px Avenir';ctx.fillText('item-wears',150,h/2+27);ctx.textAlign='left';entries.forEach(([c,v],n)=>{const y=42+n*27;ctx.fillStyle=colorHex(c);ctx.fillRect(285,y-11,16,16);ctx.fillStyle='#3c372f';ctx.font='14px Avenir';ctx.fillText(`${c}  ${v}`,312,y+2)})}
function drawBars(canvas,data){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const vals=Object.values(data),max=Math.max(1,...vals),names=Object.keys(data),gap=32,bw=(w-gap*5)/4;names.forEach((n,i)=>{const x=gap+i*(bw+gap),bh=(data[n]/max)*(h-70);ctx.fillStyle=['#6d7a5d','#8ca78d','#c6a34e','#8a4b58'][i];ctx.fillRect(x,h-40-bh,bw,bh);ctx.fillStyle='#4b443a';ctx.textAlign='center';ctx.font='13px Avenir';ctx.fillText(n,x+bw/2,h-16);ctx.font='18px Georgia';ctx.fillText(data[n],x+bw/2,h-48-bh)})}


function templateHint(category){return {Tops:'TOP • center shoulders and sleeves',Bottoms:'BOTTOM • center waistband and hems',Dresses:'DRESS • center neckline and hem',Outerwear:'OUTERWEAR • leave room around sleeves',Shoes:'SHOES • place pair side-by-side',Accessories:'ACCESSORY • center the full shape',Misc:'GARMENT • keep the whole item inside the guide'}[category]||'CENTER ITEM'}
function newStudioCanvas(){const c=document.createElement('canvas');c.width=720;c.height=720;return c}
function photoFingerprint(src=''){let h=2166136261;const sample=(src.slice(0,220)+src.slice(-220));for(let i=0;i<sample.length;i++){h^=sample.charCodeAt(i);h=Math.imul(h,16777619)}return `${src.length}:${(h>>>0).toString(16)}`}
function blankStudioMask(){return newStudioCanvas()}
function cloneCanvasImageData(canvas){return canvas?.getContext('2d').getImageData(0,0,720,720)||null}
function restoreCanvasImageData(canvas,im){if(!canvas||!im)return;canvas.getContext('2d').putImageData(im,0,0)}
function maskDataURL(canvas){return canvas?canvas.toDataURL('image/png'):''}
async function loadMaskDataURL(src){const c=blankStudioMask();if(!src)return c;try{const img=await imageFrom(src);c.getContext('2d').drawImage(img,0,0,720,720)}catch{}return c}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function updateStudioAdjustmentLabels(){setText('#studioExposureValue',studioExposure>0?`+${studioExposure}`:`${studioExposure}`);setText('#studioContrastValue',studioContrast>0?`+${studioContrast}`:`${studioContrast}`);setText('#studioHighlightsValue',studioHighlights>0?`+${studioHighlights}`:`${studioHighlights}`)}
function syncStudioAdjustmentControls(){if($('#studioExposure'))$('#studioExposure').value=studioExposure;if($('#studioContrast'))$('#studioContrast').value=studioContrast;if($('#studioHighlights'))$('#studioHighlights').value=studioHighlights;updateStudioAdjustmentLabels()}
function studioHasAdjustments(){return !!(studioExposure||studioContrast||studioHighlights)}
function clamp255(v){return Math.max(0,Math.min(255,v))}
function buildAdjustedStudioCanvas(){if(!studioWorkCanvas){studioAdjustedCanvas=null;return}if(!studioHasAdjustments()){studioAdjustedCanvas=studioWorkCanvas;return}const out=newStudioCanvas(),ctx=out.getContext('2d');ctx.drawImage(studioWorkCanvas,0,0);const im=ctx.getImageData(0,0,720,720),d=im.data;const exposureMul=Math.max(.4,1+studioExposure/100);const contrastFactor=(259*((studioContrast*2)+255))/(255*(259-(studioContrast*2)));const hi=studioHighlights/100;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;let r=d[i],g=d[i+1],b=d[i+2];r=clamp255(r*exposureMul);g=clamp255(g*exposureMul);b=clamp255(b*exposureMul);r=clamp255(contrastFactor*(r-128)+128);g=clamp255(contrastFactor*(g-128)+128);b=clamp255(contrastFactor*(b-128)+128);const lum=(.2126*r+.7152*g+.0722*b)/255;const w=Math.max(0,Math.min(1,(lum-.42)/.58));const weight=w*w*(3-2*w);if(hi<0){const mul=1+hi*weight;r=clamp255(r*mul);g=clamp255(g*mul);b=clamp255(b*mul)}else if(hi>0){r=clamp255(r+(255-r)*hi*weight);g=clamp255(g+(255-g)*hi*weight);b=clamp255(b+(255-b)*hi*weight)}d[i]=r;d[i+1]=g;d[i+2]=b}ctx.putImageData(im,0,0);studioAdjustedCanvas=out}
function applyStudioAdjustmentsAndRender(){buildAdjustedStudioCanvas();renderStudio()}
function cloneStudioHistoryState(){return{erase:cloneCanvasImageData(studioManualEraseMask),restore:cloneCanvasImageData(studioManualRestoreMask),scale:studioObjectScale,x:studioObjectX,y:studioObjectY,rotation:studioObjectRotation,exposure:studioExposure,contrast:studioContrast,highlights:studioHighlights}}
function restoreStudioHistoryState(s){if(!s)return;restoreCanvasImageData(studioManualEraseMask,s.erase);restoreCanvasImageData(studioManualRestoreMask,s.restore);if(Number.isFinite(s.scale))studioObjectScale=s.scale;if(Number.isFinite(s.x))studioObjectX=s.x;if(Number.isFinite(s.y))studioObjectY=s.y;if(Number.isFinite(s.rotation))studioObjectRotation=s.rotation;if(Number.isFinite(s.exposure))studioExposure=s.exposure;if(Number.isFinite(s.contrast))studioContrast=s.contrast;if(Number.isFinite(s.highlights))studioHighlights=s.highlights;syncStudioAdjustmentControls();rebuildStudioWorkCanvas()}
function updateStudioHistoryButtons(){const u=$('#studioUndo'),r=$('#studioRedo');if(u)u.disabled=!studioUndoStack.length;if(r)r.disabled=!studioRedoStack.length}
function resetStudioHistory(){studioUndoStack=[];studioRedoStack=[];studioPendingTransformHistory=null;studioPendingAdjustmentHistory=null;updateStudioHistoryButtons()}
function pushStudioHistoryState(s){if(!s?.erase||!s?.restore)return;studioUndoStack.push(s);if(studioUndoStack.length>12)studioUndoStack.shift();studioRedoStack=[];updateStudioHistoryButtons()}
function pushStudioHistory(){pushStudioHistoryState(cloneStudioHistoryState())}
function studioTransformChanged(a,b){return!!a&&!!b&&(Math.abs((a.scale??1)-(b.scale??1))>.0005||Math.abs((a.x??0)-(b.x??0))>.25||Math.abs((a.y??0)-(b.y??0))>.25||Math.abs((a.rotation??0)-(b.rotation??0))>.05)}
function undoStudio(){if(!studioUndoStack.length)return;studioRedoStack.push(cloneStudioHistoryState());restoreStudioHistoryState(studioUndoStack.pop());updateStudioHistoryButtons();renderStudio()}
function redoStudio(){if(!studioRedoStack.length)return;studioUndoStack.push(cloneStudioHistoryState());restoreStudioHistoryState(studioRedoStack.pop());updateStudioHistoryButtons();renderStudio()}
function studioFillBackground(ctx){if(studioBg==='cream'){ctx.fillStyle='#f4ecd9';ctx.fillRect(0,0,720,720)}else if(studioBg==='paper'){ctx.fillStyle='#e9dfc9';ctx.fillRect(0,0,720,720);ctx.globalAlpha=.15;for(let y=0;y<720;y+=24){ctx.fillStyle=y%48===0?'#8b765e':'#fff';ctx.fillRect(0,y,720,1)}ctx.globalAlpha=1}else if(studioBg==='custom'){ctx.fillStyle=studioCustomBg||'#ffffff';ctx.fillRect(0,0,720,720)}}
async function sourceToStudioCanvas(src){const img=await imageFrom(src),c=newStudioCanvas(),ctx=c.getContext('2d');const fit=Math.min(650/img.width,650/img.height),dw=img.width*fit,dh=img.height*fit;ctx.drawImage(img,0,0,img.width,img.height,360-dw/2,360-dh/2,dw,dh);return c}
function rebuildStudioWorkCanvas(){if(!studioBaseCanvas)return;studioWorkCanvas=newStudioCanvas();const ctx=studioWorkCanvas.getContext('2d');ctx.drawImage(studioBaseCanvas,0,0);if(studioManualRestoreMask){const patch=newStudioCanvas(),pc=patch.getContext('2d');pc.drawImage(studioOriginalCanvas||studioBaseCanvas,0,0);pc.globalCompositeOperation='destination-in';pc.drawImage(studioManualRestoreMask,0,0);ctx.drawImage(patch,0,0)}if(studioManualEraseMask){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.drawImage(studioManualEraseMask,0,0);ctx.restore()}applyStudioAdjustmentsAndRender()}
async function ensureStudioOriginalCanvas(){if(!studioOriginalCanvas&&itemOriginalPhoto)studioOriginalCanvas=await sourceToStudioCanvas(itemOriginalPhoto)}
async function applyStudioMode(mode,{showBusy=true}={}){const src=itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto;if(!src)return;studioMode=mode;studioLegacyMode=false;$$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));try{if(mode==='original'){if(showBusy)$('#studioStatus').textContent='Original source selected. Manual erase, restore and placement edits are preserved.';await ensureStudioOriginalCanvas();studioBaseCanvas=newStudioCanvas();studioBaseCanvas.getContext('2d').drawImage(studioOriginalCanvas,0,0);rebuildStudioWorkCanvas();return}if(showBusy)$('#studioStatus').textContent=mode==='clean'?t('studio.cleanBuilding'):t('studio.quickBuilding');studioCutoutPhoto=mode==='clean'?await removeAdvancedBackground(src,studioEdge):await removeSimpleBackground(src,studioEdge);studioBaseCanvas=await sourceToStudioCanvas(studioCutoutPhoto);rebuildStudioWorkCanvas();$('#studioStatus').textContent=t('studio.cutoutReady')}catch(e){console.error(e);$('#studioStatus').textContent=t('studio.cutoutFailed');toast('Could not remove background')}}
async function openPhotoStudio(target='item'){studioTarget=target==='wish'?'wish':'item';const working=studioTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto,original=studioTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto,savedState=studioTarget==='wish'?wishStudioState:itemStudioState;if(!working)return toast('Take or choose a photo first');studioSourcePhoto=original||working;studioCutoutPhoto='';studioBg='transparent';studioCustomBg='#ffffff';studioEdge=45;studioBrushMode=null;studioMoveMode=false;studioDrawing=false;studioPointers.clear();studioGesture=null;studioOriginalCanvas=null;studioManualEraseMask=blankStudioMask();studioManualRestoreMask=blankStudioMask();studioLegacyMode=false;const saved=savedState&&savedState.sourceFingerprint===photoFingerprint(original||'')?savedState:null;if(saved){studioMode=['original','quick','clean'].includes(saved.mode)?saved.mode:'original';studioEdge=Number(saved.edge)||45;studioObjectScale=Number(saved.scale)||1;studioObjectX=Number(saved.x)||0;studioObjectY=Number(saved.y)||0;studioObjectRotation=Number(saved.rotation)||0;studioBg=saved.bg||'transparent';studioCustomBg=saved.customBg||'#ffffff';studioManualEraseMask=await loadMaskDataURL(saved.eraseMask);studioManualRestoreMask=await loadMaskDataURL(saved.restoreMask);await ensureStudioOriginalCanvas();await applyStudioMode(studioMode,{showBusy:false})}else{studioMode='original';studioObjectScale=1;studioObjectX=0;studioObjectY=0;studioObjectRotation=0;studioViewZoom=1;studioViewX=0;studioViewY=0;studioLegacyMode=working!==original;studioBaseCanvas=await sourceToStudioCanvas(studioLegacyMode?working:studioSourcePhoto);await ensureStudioOriginalCanvas();rebuildStudioWorkCanvas()}$('#studioEdge').value=studioEdge;$('#studioBrush').value=26;$('#studioBrushValue').textContent='26';$('#studioTemplateHint').textContent=templateHint(studioTarget==='wish'?$('#wishCategory').value:$('#itemCategory').value);$$('.studio-mode').forEach(b=>b.classList.toggle('active',!studioLegacyMode&&b.dataset.mode===studioMode));$$('.studio-bg').forEach(b=>b.classList.toggle('active',b.dataset.bg===studioBg||(studioBg==='custom'&&b.id==='studioCustomBgBtn')));$('#studioBgPalette')?.classList.toggle('hidden',studioBg!=='custom');$$('.brush-btn').forEach(b=>b.classList.remove('active'));$('#studioMoveToggle').classList.remove('active');updateStudioToolUI();resetStudioHistory();$('#studioStatus').textContent=studioLegacyMode?'Existing edited photo loaded. Choose Original, Quick or Clean to start the new non-destructive cutout workflow; Reset all photo edits returns fully to the captured source.':t('studio.noTool');$('#photoStudioDialog').showModal();updateStudioZoomLabel();renderStudio()}
function drawStudioBoard(ctx){ctx.save();ctx.translate(360+studioViewX,360+studioViewY);ctx.scale(studioViewZoom,studioViewZoom);ctx.fillStyle='#faf6ec';ctx.fillRect(-360,-360,720,720);if(studioBg==='transparent'){const cell=24;for(let y=-360;y<360;y+=cell)for(let x=-360;x<360;x+=cell){ctx.fillStyle=(((x+360)/cell+(y+360)/cell)&1)?'#f7f1e5':'#e9e2d5';ctx.fillRect(x,y,cell,cell)}}else if(studioBg==='cream'){ctx.fillStyle='#f4ecd9';ctx.fillRect(-360,-360,720,720)}else if(studioBg==='paper'){ctx.fillStyle='#e9dfc9';ctx.fillRect(-360,-360,720,720);ctx.globalAlpha=.14;for(let y=-360;y<360;y+=24){ctx.fillStyle=((y+360)%48===0)?'#8b765e':'#fff';ctx.fillRect(-360,y,720,1)}ctx.globalAlpha=1}else if(studioBg==='custom'){ctx.fillStyle=studioCustomBg||'#ffffff';ctx.fillRect(-360,-360,720,720)}ctx.strokeStyle='rgba(71,86,61,.86)';ctx.lineWidth=1.8/studioViewZoom;ctx.setLineDash([9/studioViewZoom,6/studioViewZoom]);ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-310,-310,620,620,18/studioViewZoom);else ctx.rect(-310,-310,620,620);ctx.stroke();ctx.strokeStyle='rgba(71,86,61,.66)';ctx.lineWidth=1.25/studioViewZoom;ctx.setLineDash([7/studioViewZoom,6/studioViewZoom]);ctx.beginPath();ctx.moveTo(0,-360);ctx.lineTo(0,360);ctx.moveTo(-360,0);ctx.lineTo(360,0);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(90,78,65,.25)';ctx.lineWidth=1/studioViewZoom;ctx.strokeRect(-360,-360,720,720);ctx.restore()}
async function renderStudio(){const c=$('#studioCanvas'),ctx=c.getContext('2d');if(c.width!==720||c.height!==720){c.width=720;c.height=720}ctx.clearRect(0,0,720,720);ctx.fillStyle='#e9e3d8';ctx.fillRect(0,0,720,720);drawStudioBoard(ctx);const drawCanvas=studioAdjustedCanvas||studioWorkCanvas;if(!drawCanvas)return;ctx.save();ctx.translate(360+studioViewX,360+studioViewY);ctx.scale(studioViewZoom,studioViewZoom);ctx.translate(studioObjectX,studioObjectY);ctx.rotate(studioObjectRotation*Math.PI/180);ctx.scale(studioObjectScale,studioObjectScale);ctx.drawImage(drawCanvas,-360,-360);ctx.restore()}
function updateStudioZoomLabel(){const b=$('#studioZoomReset');if(b)b.textContent=Math.round(studioViewZoom*100)+'%'}
function setStudioViewZoom(next,anchor={x:360,y:360}){const old=studioViewZoom;next=Math.max(1,Math.min(4,next));if(next===old)return;const wx=(anchor.x-360-studioViewX)/old,wy=(anchor.y-360-studioViewY)/old;studioViewZoom=next;studioViewX=anchor.x-360-wx*next;studioViewY=anchor.y-360-wy*next;updateStudioZoomLabel();renderStudio()}
function resetStudioView(){studioViewZoom=1;studioViewX=0;studioViewY=0;updateStudioZoomLabel();renderStudio()}
function centerStudioObject(){if(Math.abs(studioObjectX)<.25&&Math.abs(studioObjectY)<.25)return toast('Already centered');pushStudioHistory();studioObjectX=0;studioObjectY=0;renderStudio();toast('Centered')}
function fitStudioObject(){if(Math.abs(studioObjectScale-1)<.0005)return toast('Already at original size');pushStudioHistory();studioObjectScale=1;renderStudio();toast('Fit to original size')}
async function transparentBounds(img){const c=document.createElement('canvas'),max=360,sc=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=-1,maxY=-1;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){if(d[(y*c.width+xx)*4+3]>30){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(y<minY)minY=y;if(y>maxY)maxY=y}}if(maxX<0)return{x:0,y:0,w:img.width,h:img.height};const pad=8;minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);maxX=Math.min(c.width-1,maxX+pad);maxY=Math.min(c.height-1,maxY+pad);return{x:minX/sc,y:minY/sc,w:(maxX-minX+1)/sc,h:(maxY-minY+1)/sc}}
function studioPointerDisplay(e){const c=$('#studioCanvas'),r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*720/r.height}}
function studioDisplayToWork(p){let x=(p.x-360-studioViewX)/studioViewZoom,y=(p.y-360-studioViewY)/studioViewZoom;x-=studioObjectX;y-=studioObjectY;const a=-studioObjectRotation*Math.PI/180,rx=x*Math.cos(a)-y*Math.sin(a),ry=x*Math.sin(a)+y*Math.cos(a);return{x:rx/studioObjectScale+360,y:ry/studioObjectScale+360}}
function paintStudioMask(mask,from,to,erase=false){if(!mask)return;const ctx=mask.getContext('2d'),rad=(Number($('#studioBrush').value)||26)/(studioViewZoom*studioObjectScale),a=studioDisplayToWork(from),b=studioDisplayToWork(to),dot=Math.hypot(b.x-a.x,b.y-a.y)<.5;ctx.save();ctx.globalCompositeOperation=erase?'destination-out':'source-over';ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=rad*2;ctx.lineCap='round';ctx.lineJoin='round';if(dot){ctx.beginPath();ctx.arc(a.x,a.y,rad,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore()}
function studioStroke(from,to){if(!studioBrushMode)return;if(studioBrushMode==='erase'){paintStudioMask(studioManualEraseMask,from,to,false);paintStudioMask(studioManualRestoreMask,from,to,true)}else{paintStudioMask(studioManualRestoreMask,from,to,false);paintStudioMask(studioManualEraseMask,from,to,true)}rebuildStudioWorkCanvas()}
function updateStudioToolUI(){const move=$('#studioMoveHint'),brush=$('#studioBrushControl'),view=$('#studioViewHint'),instruction=$('#studioToolInstruction');if(move)move.classList.toggle('hidden',!studioMoveMode);if(brush)brush.classList.toggle('hidden',studioMoveMode||!studioBrushMode);if(view)view.classList.toggle('hidden',studioMoveMode||!!studioBrushMode);if(instruction)instruction.classList.toggle('hidden',!studioMoveMode&&!studioBrushMode);$$('.brush-btn').forEach(b=>b.classList.toggle('active',!studioMoveMode&&b.dataset.brush===studioBrushMode));$('#studioMoveToggle')?.classList.toggle('active',studioMoveMode);const wrap=$('#studioCanvas')?.closest('.studio-canvas-wrap');if(wrap){wrap.classList.toggle('studio-view-mode',!studioMoveMode&&!studioBrushMode);wrap.classList.toggle('studio-brush-mode',!!studioBrushMode&&!studioMoveMode);wrap.classList.toggle('studio-object-move-mode',studioMoveMode)}}
function toggleStudioMove(){studioMoveMode=!studioMoveMode;studioBrushMode=null;studioDrawing=false;studioGesture=null;studioPointers.clear();studioPendingTransformHistory=null;if(studioMoveMode){studioViewZoom=1;studioViewX=0;studioViewY=0;updateStudioZoomLabel();renderStudio()}updateStudioToolUI();const msg=studioMoveMode?'Adjust mode: drag to reposition; pinch to resize and gently twist to rotate. Tap Adjust again to lock it.':t('studio.noTool');$('#studioStatus').textContent=msg;const tip=$('#studioToolInstruction');if(tip)tip.textContent=studioMoveMode?msg:''}
function studioGestureStart(){const pts=[...studioPointers.values()];if(pts.length<2)return null;const a=pts[0],b=pts[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dist=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);return{mx,my,dist,angle,viewZoom:studioViewZoom,viewX:studioViewX,viewY:studioViewY,objScale:studioObjectScale,objX:studioObjectX,objY:studioObjectY,objRotation:studioObjectRotation}}
function studioAngleDelta(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d}
function handleStudioPointerDown(e){const c=$('#studioCanvas'),p=studioPointerDisplay(e);studioPointers.set(e.pointerId,p);try{c.setPointerCapture(e.pointerId)}catch{}if(studioBrushMode){if(studioPointers.size===1){pushStudioHistory();studioDrawing=true;studioLastPoint=p;studioStroke(p,p)}else{studioDrawing=false;studioLastPoint=null}return}if(studioMoveMode){if(studioPointers.size===1)studioPendingTransformHistory=cloneStudioHistoryState();if(studioPointers.size>=2){studioGesture=studioGestureStart();return}studioGesture={start:p,objX:studioObjectX,objY:studioObjectY};return}if(studioPointers.size>=2){studioGesture=studioGestureStart();return}studioGesture={start:p,viewX:studioViewX,viewY:studioViewY}}
function handleStudioPointerMove(e){if(!studioPointers.has(e.pointerId))return;const p=studioPointerDisplay(e);studioPointers.set(e.pointerId,p);if(studioBrushMode){if(studioPointers.size===1&&studioDrawing&&studioLastPoint){studioStroke(studioLastPoint,p);studioLastPoint=p}return}if(studioMoveMode){if(studioPointers.size>=2){if(!studioGesture||!studioGesture.dist)studioGesture=studioGestureStart();const pts=[...studioPointers.values()],a=pts[0],b=pts[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dist=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x),g=studioGesture;if(!g)return;const ratio=dist/Math.max(1,g.dist);studioObjectScale=Math.max(.45,Math.min(2.6,g.objScale*ratio));studioObjectX=g.objX+(mx-g.mx)/studioViewZoom;studioObjectY=g.objY+(my-g.my)/studioViewZoom;studioObjectRotation=g.objRotation+studioAngleDelta(angle,g.angle)*(180/Math.PI)*.42;renderStudio();return}if(studioGesture?.start){const sensitivity=.8;studioObjectX=studioGesture.objX+(p.x-studioGesture.start.x)/studioViewZoom*sensitivity;studioObjectY=studioGesture.objY+(p.y-studioGesture.start.y)/studioViewZoom*sensitivity;renderStudio()}return}if(studioPointers.size>=2){if(!studioGesture||!studioGesture.dist)studioGesture=studioGestureStart();const pts=[...studioPointers.values()],a=pts[0],b=pts[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dist=Math.hypot(b.x-a.x,b.y-a.y),g=studioGesture;if(!g)return;studioViewZoom=Math.max(1,Math.min(4,g.viewZoom*(dist/Math.max(1,g.dist))));studioViewX=g.viewX+(mx-g.mx);studioViewY=g.viewY+(my-g.my);updateStudioZoomLabel();renderStudio();return}if(studioGesture?.start&&studioPointers.size===1){studioViewX=studioGesture.viewX+(p.x-studioGesture.start.x);studioViewY=studioGesture.viewY+(p.y-studioGesture.start.y);renderStudio()}}
function handleStudioPointerUp(e){studioPointers.delete(e.pointerId);studioDrawing=false;studioLastPoint=null;if(studioMoveMode&&studioPointers.size===0&&studioPendingTransformHistory){const before=studioPendingTransformHistory,after=cloneStudioHistoryState();studioPendingTransformHistory=null;if(studioTransformChanged(before,after))pushStudioHistoryState(before)}if(!studioMoveMode&&!studioBrushMode&&studioPointers.size===1){const p=[...studioPointers.values()][0];studioGesture={start:p,viewX:studioViewX,viewY:studioViewY}}else if(studioPointers.size<2)studioGesture=null;updateStudioHistoryButtons()}
function maskHasPaint(canvas){if(!canvas)return false;const d=canvas.getContext('2d').getImageData(0,0,720,720).data;for(let i=3;i<d.length;i+=64)if(d[i]>10)return true;return false}
async function applyPhotoStudio(){const drawCanvas=studioAdjustedCanvas||studioWorkCanvas;if(!drawCanvas)return;const out=newStudioCanvas(),ctx=out.getContext('2d');studioFillBackground(ctx);ctx.save();ctx.translate(360+studioObjectX,360+studioObjectY);ctx.rotate(studioObjectRotation*Math.PI/180);ctx.scale(studioObjectScale,studioObjectScale);ctx.drawImage(drawCanvas,-360,-360);ctx.restore();const output=studioBg==='transparent'?out.toDataURL('image/png'):(out.toDataURL('image/webp',.86).startsWith('data:image/webp')?out.toDataURL('image/webp',.86):out.toDataURL('image/jpeg',.88));const nextState=studioLegacyMode?null:{version:3,sourceFingerprint:photoFingerprint((studioTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto)||''),mode:studioMode,edge:studioEdge,eraseMask:maskDataURL(studioManualEraseMask),restoreMask:maskDataURL(studioManualRestoreMask),scale:studioObjectScale,x:studioObjectX,y:studioObjectY,rotation:studioObjectRotation,exposure:studioExposure,contrast:studioContrast,highlights:studioHighlights,bg:studioBg,customBg:studioCustomBg};if(studioTarget==='wish'){wishWorkingPhoto=output;wishStudioState=nextState;showPhoto('#wishPhotoPreview','#wishPhotoPlaceholder',wishWorkingPhoto);$('#wishRestoreOriginalBtn').classList.toggle('hidden',!wishOriginalPhoto||wishWorkingPhoto===wishOriginalPhoto);$('#wishScanStatus').textContent=studioBg==='transparent'?'Photo Studio image applied · transparency preserved.':'Photo Studio image applied · standardized square crop.';applyWishDialogMode()}else{itemWorkingPhoto=output;itemCutoutApplied=studioMode!=='original'||maskHasPaint(studioManualEraseMask)||maskHasPaint(studioManualRestoreMask)||studioHasAdjustments();itemStudioState=nextState;showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();$('#scanStatus').textContent=studioBg==='transparent'?'Photo Studio image applied · transparency preserved.':'Photo Studio image applied · standardized square crop.'}$('#photoStudioDialog').close();toast('Photo applied')}
function updateOriginalPhotoButton(){const b=$('#restoreOriginalPhotoBtn');if(b)b.classList.toggle('hidden',!itemOriginalPhoto||itemWorkingPhoto===itemOriginalPhoto);updateReviewPhotoMenuState()}
function updateReviewPhotoMenuState(){const restore=$('#reviewRestoreOriginalBtn');if(restore)restore.classList.toggle('hidden',!itemOriginalPhoto||itemWorkingPhoto===itemOriginalPhoto);const scan=$('#smartScanIconBtn');if(scan)scan.classList.toggle('hidden',!itemWorkingPhoto);const hasReviewContext=!!$('#itemId').value||!!itemWorkingPhoto;const utilities=$('#itemCardUtilityActions');if(utilities)utilities.classList.toggle('hidden',!hasReviewContext);const menuWrap=$('#reviewPhotoMenuWrap');if(menuWrap)menuWrap.classList.toggle('hidden',!hasReviewContext)}
function updatePhotoToolAvailability(){const studio=$('#photoStudioBtn');if(studio){studio.disabled=!itemWorkingPhoto;studio.classList.toggle('hidden',!itemWorkingPhoto)}const reviewStudio=$('#reviewStudioBtn');if(reviewStudio)reviewStudio.disabled=!itemWorkingPhoto;const newActions=$('#newPiecePhotoActions');if(newActions)newActions.classList.toggle('hidden',!!$('#itemId').value||!!itemWorkingPhoto)}
function toggleReviewPhotoMenu(){const menu=$('#reviewPhotoMenu');if(!menu)return;menu.classList.toggle('hidden');$('#reviewPhotoMenuBtn')?.setAttribute('aria-expanded',menu.classList.contains('hidden')?'false':'true')}
function closeReviewPhotoMenu(){const menu=$('#reviewPhotoMenu');if(menu)menu.classList.add('hidden');$('#reviewPhotoMenuBtn')?.setAttribute('aria-expanded','false')}
function restoreCapturedOriginal(closeStudio=false){if(!itemOriginalPhoto)return toast('No captured original is available');if(itemWorkingPhoto!==itemOriginalPhoto){const ok=confirm('Restore the original photo? This will replace the current photo edits and Photo Studio adjustments for this piece.');if(!ok)return}itemWorkingPhoto=itemOriginalPhoto;itemCutoutApplied=false;itemStudioState=null;showPhoto('#itemPhotoPreview','#photoPlaceholder',itemWorkingPhoto);updateOriginalPhotoButton();updatePhotoToolAvailability();$('#scanStatus').textContent='Restored the original captured photo.';if(closeStudio&&$('#photoStudioDialog').open)$('#photoStudioDialog').close();toast('Original photo restored')}
async function resetStudioAllEdits(){const original=studioTarget==='wish'?wishOriginalPhoto:itemOriginalPhoto;if(!original)return toast('No captured original is available');if(!confirm(t('studio.resetConfirm')))return;studioMode='original';studioLegacyMode=false;studioEdge=45;studioBrushMode=null;studioMoveMode=false;studioObjectScale=1;studioObjectX=0;studioObjectY=0;studioObjectRotation=0;studioExposure=0;studioContrast=0;studioHighlights=0;studioViewZoom=1;studioViewX=0;studioViewY=0;studioManualEraseMask=blankStudioMask();studioManualRestoreMask=blankStudioMask();await ensureStudioOriginalCanvas();studioBaseCanvas=newStudioCanvas();studioBaseCanvas.getContext('2d').drawImage(studioOriginalCanvas,0,0);syncStudioAdjustmentControls();rebuildStudioWorkCanvas();resetStudioHistory();$('#studioEdge').value=45;$$('.studio-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode==='original'));$$('.brush-btn').forEach(b=>b.classList.remove('active'));$('#studioMoveToggle')?.classList.remove('active');updateStudioToolUI();updateStudioZoomLabel();$('#studioStatus').textContent=t('studio.resetDone');renderStudio()}
function setStudioBackgroundChoice(bg){studioBg=bg;$$('.studio-bg').forEach(x=>x.classList.toggle('active',x.dataset.bg===bg));const palette=$('#studioBgPalette');if(palette)palette.classList.toggle('hidden',bg!=='custom');if(bg!=='custom')$$('.studio-bg-swatch').forEach(x=>x.classList.remove('active'));renderStudio()}
function bindPhotoStudio(){$$('.studio-mode').forEach(b=>b.onclick=async()=>{await applyStudioMode(b.dataset.mode)});$$('.studio-bg').forEach(b=>b.onclick=()=>{const bg=b.dataset.bg;if(bg==='custom'){setStudioBackgroundChoice('custom');const current=$$('.studio-bg-swatch').find(x=>(x.dataset.color||'').toLowerCase()===studioCustomBg.toLowerCase())||$$('.studio-bg-swatch')[0];$$('.studio-bg-swatch').forEach(x=>x.classList.toggle('active',x===current));if(current)studioCustomBg=current.dataset.color||'#ffffff';renderStudio();return}setStudioBackgroundChoice(bg)});$('#studioEdge').oninput=e=>{studioEdge=Number(e.target.value)||45};$('#studioEdge').onchange=async()=>{studioEdge=Number($('#studioEdge').value)||45;if(studioMode==='quick'||studioMode==='clean')await applyStudioMode(studioMode)};const bindAdjustment=(id,key)=>{const el=$(id);if(!el)return;el.addEventListener('pointerdown',()=>{studioPendingAdjustmentHistory=cloneStudioHistoryState()});el.addEventListener('input',e=>{const value=Number(e.target.value)||0;if(key==='exposure')studioExposure=value;else if(key==='contrast')studioContrast=value;else studioHighlights=value;updateStudioAdjustmentLabels();applyStudioAdjustmentsAndRender()});el.addEventListener('change',()=>{const before=studioPendingAdjustmentHistory,after=cloneStudioHistoryState();studioPendingAdjustmentHistory=null;if(before&&((before.exposure??0)!==(after.exposure??0)||(before.contrast??0)!==(after.contrast??0)||(before.highlights??0)!==(after.highlights??0)))pushStudioHistoryState(before)})};bindAdjustment('#studioExposure','exposure');bindAdjustment('#studioContrast','contrast');bindAdjustment('#studioHighlights','highlights');$('#studioBrush').oninput=e=>$('#studioBrushValue').textContent=e.target.value;$('#studioCenter').onclick=centerStudioObject;$('#studioFit').onclick=fitStudioObject;$('#studioApply').onclick=applyPhotoStudio;$('#studioResetAll').onclick=resetStudioAllEdits;$('#studioResetAdjustments').onclick=()=>{if(!studioHasAdjustments())return toast('Adjustments already reset');pushStudioHistory();studioExposure=0;studioContrast=0;studioHighlights=0;syncStudioAdjustmentControls();applyStudioAdjustmentsAndRender();toast('Adjustments reset')};$('#studioUndo').onclick=undoStudio;$('#studioRedo').onclick=redoStudio;$('#studioMoveToggle').onclick=toggleStudioMove;$('#studioZoomIn').onclick=()=>setStudioViewZoom(studioViewZoom+.35);$('#studioZoomOut').onclick=()=>setStudioViewZoom(studioViewZoom-.35);$('#studioZoomReset').onclick=resetStudioView;$('#studioCloseBtn').onclick=()=>$('#photoStudioDialog').close();$('#studioCancelBtn').onclick=()=>$('#photoStudioDialog').close();$$('.brush-btn').forEach(b=>b.onclick=()=>{const next=(!studioMoveMode&&studioBrushMode===b.dataset.brush)?null:b.dataset.brush;studioMoveMode=false;studioBrushMode=next;studioDrawing=false;studioGesture=null;studioPointers.clear();updateStudioToolUI();const msg=!studioBrushMode?t('studio.noTool'):studioBrushMode==='erase'?'Erase mode: one finger erases only. Tap Erase again to return to view mode.':'Restore mode: one finger brings back pixels from the captured original photo so you can recover clothing details that the cutout removed. Tap Restore again to return to view mode.';$('#studioStatus').textContent=msg;const tip=$('#studioToolInstruction');if(tip)tip.textContent=studioBrushMode?msg:''});const c=$('#studioCanvas');c.addEventListener('pointerdown',handleStudioPointerDown);c.addEventListener('pointermove',handleStudioPointerMove);c.addEventListener('pointerup',handleStudioPointerUp);c.addEventListener('pointercancel',handleStudioPointerUp)}
function cutoutSourceCanvasFromImage(img){const max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c}
function median(arr){if(!arr.length)return 0;const a=[...arr].sort((x,y)=>x-y),m=(a.length/2)|0;return a.length%2?a[m]:(a[m-1]+a[m])/2}
function percentile(arr,p){if(!arr.length)return 0;const a=[...arr].sort((x,y)=>x-y),idx=Math.max(0,Math.min(a.length-1,Math.round((a.length-1)*p)));return a[idx]}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function borderBackgroundModel(d,w,h){const rs=[],gs=[],bs=[];const take=(x,y)=>{const i=(y*w+x)*4;rs.push(d[i]);gs.push(d[i+1]);bs.push(d[i+2])};const step=Math.max(2,Math.floor(Math.min(w,h)/36));const inset=Math.min(8,Math.max(2,Math.floor(Math.min(w,h)/80)));for(let x=0;x<w;x+=step){for(let k=0;k<=inset;k+=Math.max(1,Math.floor(inset/2))){take(x,k);take(x,h-1-k)}}for(let y=0;y<h;y+=step){for(let k=0;k<=inset;k+=Math.max(1,Math.floor(inset/2))){take(k,y);take(w-1-k,y)}}const bg=[median(rs),median(gs),median(bs)];let devs=[];for(let i=0;i<rs.length;i++){const dr=rs[i]-bg[0],dg=gs[i]-bg[1],db=bs[i]-bg[2];devs.push(Math.sqrt(dr*dr+dg*dg+db*db))}return {bg,mad:median(devs)||0}}
function fillMaskHoles(mask,w,h){const bg=new Uint8Array(w*h),q=new Int32Array(w*h);let head=0,tail=0;const push=p=>{if(p<0||p>=w*h||bg[p]||mask[p])return;bg[p]=1;q[tail++]=p};for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}while(head<tail){const p=q[head++],x=p%w,y=(p/w)|0;if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}const out=mask.slice();for(let p=0;p<w*h;p++)if(!out[p]&&!bg[p])out[p]=1;return out}
function dilateMask(mask,w,h){const out=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let on=0;for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1)&&!on;yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++)if(mask[yy*w+xx]){on=1;break}out[y*w+x]=on}return out}
function erodeMask(mask,w,h){const out=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let on=1;for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1)&&on;yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++)if(!mask[yy*w+xx]){on=0;break}out[y*w+x]=on}return out}
function closeMask(mask,w,h){return erodeMask(dilateMask(mask,w,h),w,h)}
function keepMainForeground(mask,w,h,mainRatio=.12,islandRatio=.04){const seen=new Uint8Array(w*h),components=[];const q=new Int32Array(w*h);for(let start=0;start<w*h;start++)if(mask[start]&&!seen[start]){let head=0,tail=0,area=0,border=0;seen[start]=1;q[tail++]=start;const pixels=[];while(head<tail){const p=q[head++],x=p%w,y=(p/w)|0;pixels.push(p);area++;if(x===0||y===0||x===w-1||y===h-1)border=1;const ns=[x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1];for(const n of ns)if(n>=0&&mask[n]&&!seen[n]){seen[n]=1;q[tail++]=n}}components.push({area,border,pixels})}if(!components.length)return mask;components.sort((a,b)=>b.area-a.area);const largest=components[0].area||1;const out=new Uint8Array(w*h);for(const comp of components){if(comp.area>=largest*mainRatio||(!comp.border&&comp.area>=largest*islandRatio)){for(const p of comp.pixels)out[p]=1}}return out}
function isMaskBoundary(mask,w,h,p){const x=p%w,y=(p/w)|0;if(x===0||y===0||x===w-1||y===h-1)return true;return !mask[p-1]||!mask[p+1]||!mask[p-w]||!mask[p+w]}
function removeTinyMaskIslands(mask,w,h,minArea){const seen=new Uint8Array(w*h),out=mask.slice(),q=new Int32Array(w*h);for(let start=0;start<w*h;start++)if(mask[start]&&!seen[start]){let head=0,tail=0;seen[start]=1;q[tail++]=start;const pixels=[];while(head<tail){const p=q[head++],x=p%w,y=(p/w)|0;pixels.push(p);const ns=[x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1];for(const n of ns)if(n>=0&&mask[n]&&!seen[n]){seen[n]=1;q[tail++]=n}}if(pixels.length<minArea)for(const p of pixels)out[p]=0}return out}
function rescueFineCutoutDetails(mask,strength,w,h,mode){const out=mask.slice(),threshold=mode==='clean'?172:188;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=y*w+x;if(out[p]||strength[p]<threshold)continue;const neighbors=mask[p-1]+mask[p+1]+mask[p-w]+mask[p+w];if(neighbors>=2)out[p]=1}return out}
function cutoutBoundaryAlpha(mask,strength,w,h,p,mode){if(!isMaskBoundary(mask,w,h,p))return 255;const x=p%w,y=(p/w)|0;let neighbors=0;if(x>0)neighbors+=mask[p-1];if(x<w-1)neighbors+=mask[p+1];if(y>0)neighbors+=mask[p-w];if(y<h-1)neighbors+=mask[p+w];const floor=mode==='clean'?224:214,shapeBoost=neighbors>=3?18:neighbors===2?10:0;return clamp(Math.max(floor+shapeBoost,strength[p]),0,255)}
function buildCutoutPass(im,w,h,edge=45,mode='quick'){const d=im.data;const {bg,mad}=borderBackgroundModel(d,w,h);const passable=new Uint8Array(w*h),strength=new Uint8ClampedArray(w*h),distSample=[];const base=mode==='clean'?0.82:0.74,gradBase=(mode==='clean'?26:21)+edge*.28,floodBase=Math.max(18,edge*base+mad*.55);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=y*w+x,i=p*4,r=d[i],g=d[i+1],b=d[i+2],dr=r-bg[0],dg=g-bg[1],db=b-bg[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);if(((x+y)&7)===0)distSample.push(dist);const xr=Math.min(w-1,x+1),yd=Math.min(h-1,y+1),ir=(y*w+xr)*4,id=(yd*w+x)*4,grad=Math.max(Math.abs(r-d[ir])+Math.abs(g-d[ir+1])+Math.abs(b-d[ir+2]),Math.abs(r-d[id])+Math.abs(g-d[id+1])+Math.abs(b-d[id+2]))/3;passable[p]=grad;strength[p]=dist}const contrastScore=percentile(distSample,.90)-floodBase,contrastBias=clamp((contrastScore-12)/52,0,1),conservativeBias=1-contrastBias,floodThresh=floodBase+contrastBias*6-conservativeBias*3,gradLimit=gradBase+contrastBias*3-conservativeBias*2,sureFg=floodThresh+(mode==='clean'?20:15)-conservativeBias*2+contrastBias*2,protectThreshold=(mode==='clean'?230:215)-conservativeBias*22+contrastBias*8;for(let p=0;p<w*h;p++){const grad=passable[p],dist=strength[p];passable[p]=(dist<floodThresh&&grad<gradLimit)?1:0;strength[p]=clamp(Math.round((dist-floodThresh)/(sureFg-floodThresh)*255),0,255)}const bgFlood=new Uint8Array(w*h),q=new Int32Array(w*h);let head=0,tail=0;const push=p=>{if(p<0||p>=w*h||bgFlood[p]||!passable[p])return;bgFlood[p]=1;q[tail++]=p};for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}while(head<tail){const p=q[head++],x=p%w,y=(p/w)|0;if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}let mask=new Uint8Array(w*h);for(let p=0;p<w*h;p++)mask[p]=bgFlood[p]?0:1;for(let p=0;p<w*h;p++)if(strength[p]>=protectThreshold)mask[p]=1;mask=fillMaskHoles(mask,w,h);mask=rescueFineCutoutDetails(mask,strength,w,h,mode);mask=keepMainForeground(mask,w,h,.05+contrastBias*.04,.012+contrastBias*.012);mask=closeMask(mask,w,h);mask=removeTinyMaskIslands(mask,w,h,Math.max(mode==='clean'?18:12,Math.round(w*h*((mode==='clean'?.000045:.00003)+(contrastBias*.00004)))));mask=fillMaskHoles(mask,w,h);const alpha=new Uint8ClampedArray(w*h);for(let p=0;p<w*h;p++){if(!mask[p]){alpha[p]=0;continue}alpha[p]=cutoutBoundaryAlpha(mask,strength,w,h,p,mode)}return {alpha,mask}}
async function removeBackgroundSmart(dataURL,edge=45,mode='quick'){const img=await imageFrom(dataURL),c=cutoutSourceCanvasFromImage(img),ctx=c.getContext('2d'),im=ctx.getImageData(0,0,c.width,c.height),alpha=buildCutoutPass(im,c.width,c.height,edge,mode).alpha;for(let p=0;p<alpha.length;p++)im.data[p*4+3]=alpha[p];ctx.putImageData(im,0,0);return c.toDataURL('image/png')}
async function removeAdvancedBackground(dataURL,edge=45){return removeBackgroundSmart(dataURL,edge,'clean')}

async function smartScan(target='item'){smartScanTarget=target==='wish'?'wish':'item';const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;if(!photo)return toast('Take or choose a photo first');if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent='Scanning color, pattern and visible text…'}else setPhotoBusy(true,'Scanning color, pattern and visible text…');try{const visual=await analyzeImage(photo);let ocr='';try{ocr=await tryOCR(photo)}catch{}const flat=ocr.replace(/\n/g,' ');const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];const brand=brands.find(b=>new RegExp(`\b${b.replace("'","\\'")}\b`,'i').test(flat))||'';const sm=flat.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);pendingSmartScanResult={color:visual.color||'',pattern:visual.pattern||'',brand,size:sm?sm[1].toUpperCase():''};openSmartScanReview(pendingSmartScanResult);$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan complete. Review detected details before applying.'}catch(err){console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.'}finally{if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false})}else setPhotoBusy(false)}}
function smartScanFieldLabel(key){return({color:'Color',pattern:'Pattern',brand:'Brand',size:'Size'})[key]||key}
function openSmartScanReview(result){const fields=$('#smartScanReviewFields');if(!fields)return;const entries=Object.entries(result||{}).filter(([,v])=>String(v||'').trim());fields.innerHTML=entries.length?entries.map(([key,value])=>`<label class="smart-scan-field"><input type="checkbox" data-scan-field="${key}" checked><span class="smart-scan-field-copy"><strong>${smartScanFieldLabel(key)}</strong><span>${esc(String(value))}</span></span></label>`).join(''):'<p class="empty-note">No reliable attributes were detected. You can still enter the details manually.</p>';$('#applySmartScanReviewBtn').disabled=!entries.length;if(!$('#smartScanReviewDialog').open)$('#smartScanReviewDialog').showModal()}
function closeSmartScanReview(){pendingSmartScanResult=null;if($('#smartScanReviewDialog').open)$('#smartScanReviewDialog').close()}
function applyPendingSmartScan(){if(!pendingSmartScanResult)return closeSmartScanReview();const chosen=new Set($$('#smartScanReviewFields input[data-scan-field]:checked').map(x=>x.dataset.scanField));const wish=smartScanTarget==='wish';if(chosen.has('color')&&pendingSmartScanResult.color)$(wish?'#wishColor':'#itemColor').value=pendingSmartScanResult.color;if(chosen.has('pattern')&&pendingSmartScanResult.pattern)$(wish?'#wishPattern':'#itemPattern').value=pendingSmartScanResult.pattern;if(chosen.has('brand')&&pendingSmartScanResult.brand)$(wish?'#wishBrand':'#itemBrand').value=pendingSmartScanResult.brand;if(chosen.has('size')&&pendingSmartScanResult.size){const sel=$(wish?'#wishSize':'#itemSize'),opt=[...sel.options].find(o=>o.value===pendingSmartScanResult.size||o.textContent===pendingSmartScanResult.size);if(opt)sel.value=opt.value}if(wish){$('#wishScanStatus').textContent='Selected Smart Scan details applied. Review them before saving.'}else{updateItemReviewSummary();$('#scanStatus').textContent='Selected Smart Scan details applied. Review them before saving.'}closeSmartScanReview();toast('Detected details applied')}
async function tryOCR(dataURL){if(!navigator.onLine)return'';if(!window.Tesseract){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}const r=await Tesseract.recognize(dataURL,'eng',{logger:()=>{}});return r?.data?.text||''}
async function analyzeImage(dataURL){const img=await imageFrom(dataURL);const c=document.createElement('canvas'),size=96;c.width=c.height=size;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,size,size);const d=ctx.getImageData(0,0,size,size).data;let rs=0,gs=0,bs=0,n=0,lum=[],sat=[];for(let i=0;i<d.length;i+=4){if(d[i+3]<80)continue;const r=d[i],g=d[i+1],b=d[i+2];if(r>245&&g>245&&b>245)continue;rs+=r;gs+=g;bs+=b;n++;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);lum.push((r+g+b)/3);sat.push(mx-mn)}if(!n)return{color:'Multicolor',pattern:'Solid'};const r=rs/n,g=gs/n,b=bs/n;color=nearestColor(r,g,b);const mean=lum.reduce((a,x)=>a+x,0)/lum.length,variance=lum.reduce((a,x)=>a+(x-mean)**2,0)/lum.length,avgSat=sat.reduce((a,x)=>a+x,0)/sat.length;let pattern='Solid';if(variance>2200&&avgSat>45)pattern='Floral/Print';else if(variance>1500)pattern='Graphic';return{color,pattern}}
function nearestColor(r,g,b){const palette={Black:[35,35,35],White:[242,240,234],Cream:[235,222,190],Gray:[135,135,130],Brown:[117,82,60],Coffee:[108,81,66],Tan:[177,145,105],Beige:[211,192,157],Burgundy:[125,53,71],Red:[178,63,61],Orange:[209,120,53],Yellow:[220,190,65],Mustard:[195,160,75],Olive:[102,113,90],Green:[67,117,70],Mint:[151,196,166],Turquoise:[77,142,138],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Pink:[196,107,132]};let best='Multicolor',dist=1e9;for(const[k,v]of Object.entries(palette)){const d=(r-v[0])**2+(g-v[1])**2+(b-v[2])**2;if(d<dist){dist=d;best=k}}return best}
async function removeSimpleBackground(dataURL,edge=45){return removeBackgroundSmart(dataURL,edge,'quick')}
function imageFrom(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function fileToDataURL(file,max=1200,quality=.85){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=async()=>{try{const img=await imageFrom(r.result),scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',quality))}catch(e){reject(e)}};r.onerror=reject;r.readAsDataURL(file)})}
function showPhoto(imgSel,phSel,src){const img=$(imgSel),ph=$(phSel);if(src){img.src=src;img.style.display='block';ph.style.display='none'}else{img.removeAttribute('src');img.style.display='none';ph.style.display='block'}}
function getAppName(){return (state.settings?.appName||DEFAULT_APP_NAME).trim()||DEFAULT_APP_NAME}
function applyAppName(){
  if(!state.settings)state.settings={appName:DEFAULT_APP_NAME};
  const name=getAppName();
  const eyebrow=$('#appNameEyebrow'),input=$('#appNameInput'),current=$('#currentAppName');
  if(eyebrow)eyebrow.textContent=name.toUpperCase();
  if(input&&document.activeElement!==input)input.value=name;
  if(current)current.textContent=name;
  document.title=`${name} · Closet Journal`;
  const appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');if(appleTitle)appleTitle.setAttribute('content',name);
}
async function saveAppName(){
  const value=$('#appNameInput').value.trim().replace(/\s+/g,' ');
  if(!value)return toast('Enter an app name');
  if(!state.settings)state.settings={};state.settings.appName=value.slice(0,60);
  const ok=await saveState();if(ok)toast('App name updated');
}
async function resetAppName(){
  if(!state.settings)state.settings={};state.settings.appName=DEFAULT_APP_NAME;$('#appNameInput').value=DEFAULT_APP_NAME;
  const ok=await saveState();if(ok)toast("Restored Audrey's default");
}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);const safe=getAppName().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'clothing-app';a.download=`${safe}-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
async function importData(e){const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());state={...emptyState(),...obj,settings:{...emptyState().settings,...(obj.settings||{})}};migrateCatalogTaxonomy();migrateWishlistModel();ensureSettings();saveState();toast('Backup imported')}catch{alert('That file does not look like a valid clothing-app backup.')}e.target.value=''}
function resetData(){if(confirm('Erase all closet, outfit, journal and wishlist data from this device?')){state=emptyState();saveState();toast('App data erased')}}

init();
