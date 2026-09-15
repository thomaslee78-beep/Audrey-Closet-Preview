/* Audrey Closet v13.25 Phase 3 — Journal Creative Page v1
 * Adds per-entry Journal backgrounds plus Board sticker-pack reuse.
 * Stickers overlay the writing surface and support add/drag/resize/delete.
 * creativePage is backward-compatible optional Journal data; no DB bump.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalCreativePageStyles';
  const CONTROL_ID='v1325JournalCreativeControls';
  const EDIT_LAYER_CLASS='v1325-journal-sticker-layer';
  const READER_LAYER_CLASS='v1325-reader-sticker-layer';
  const MAX_STICKERS=12;
  let selectedStickerId='';
  let activePackId='standard';
  let dragging=null;

  const BACKGROUNDS=[
    {id:'default',label:'Default',short:'Default'},
    {id:'postit',label:'Post-it Note',short:'Post-it'},
    {id:'graph',label:'Graph Paper',short:'Graph'},
    {id:'composition',label:'Composition',short:'Composition'},
    {id:'newspaper',label:'Newspaper',short:'Newspaper'},
    {id:'white',label:'Plain White Paper',short:'White'}
  ];

  function currentEntry(){
    const reader=document.querySelector('#v1325JournalReaderDialog');
    const id=reader?.dataset?.journalId||viewingJournalId||'';
    return state.journal.find(row=>String(row.id)===String(id))||null;
  }

  function uid(){return `journalSticker_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function ensureCreative(entry){
    if(!entry)return null;
    if(!entry.creativePage||typeof entry.creativePage!=='object')entry.creativePage={};
    if(!entry.creativePage.background||typeof entry.creativePage.background!=='object')entry.creativePage.background={id:'default'};
    if(!Array.isArray(entry.creativePage.objects))entry.creativePage.objects=[];
    entry.creativePage.objects=entry.creativePage.objects.filter(o=>o&&o.kind==='sticker');
    return entry.creativePage;
  }

  function stickerPacks(){
    const packs=window.AUDREY_STICKER_PACKS_V1?.packs;
    if(Array.isArray(packs)&&packs.length)return packs;
    return [
      {id:'standard',label:'Standard',icon:'✦',stickers:[
        {id:'heart',label:'Heart',glyph:'♥',type:'image',src:'assets/stickers/standard/heart-pop.svg'},
        {id:'star',label:'Star',glyph:'★',type:'image',src:'assets/stickers/standard/star-burst.svg'},
        {id:'sparkle',label:'Sparkle',glyph:'✨',type:'image',src:'assets/stickers/standard/sparkle-burst.svg'},
        {id:'flower',label:'Flower',glyph:'🌼',type:'image',src:'assets/stickers/standard/flower-detailed.svg'},
        {id:'rainbow',label:'Rainbow',glyph:'🌈',type:'image',src:'assets/stickers/standard/rainbow-soft.svg'},
        {id:'butterfly',label:'Butterfly',glyph:'🦋',type:'image',src:'assets/stickers/standard/butterfly-cartoon.svg'}
      ]},
      {id:'music',label:'Music',icon:'♫',stickers:[{id:'guitar',label:'Guitar',glyph:'🎸'},{id:'piano',label:'Piano',glyph:'🎹'},{id:'drums',label:'Drums',glyph:'🥁'},{id:'headphones',label:'Headphones',glyph:'🎧',type:'image',src:'assets/stickers/music/headphones.svg'},{id:'record',label:'Record',glyph:'💿',type:'image',src:'assets/stickers/music/record.svg'}]},
      {id:'cute-animals',label:'Cute Animals',icon:'🐾',stickers:[{id:'dog',label:'Dog',glyph:'🐶',sizeClass:'medium'},{id:'cat',label:'Cat',glyph:'🐱',sizeClass:'medium'},{id:'bunny',label:'Bunny',glyph:'🐰',sizeClass:'medium'},{id:'panda',label:'Panda',glyph:'🐼',sizeClass:'medium'},{id:'fox',label:'Fox',glyph:'🦊',sizeClass:'medium'}]},
      {id:'fashion',label:'Fashion',icon:'✂',stickers:[{id:'button',label:'Button',glyph:'◉',type:'image',src:'assets/stickers/fashion/button-sewing.svg'},{id:'pin',label:'Pin',glyph:'📌'},{id:'swatch',label:'Fabric swatch',glyph:'▧',type:'image',src:'assets/stickers/fashion/fabric-swatch-floral.svg'},{id:'bag',label:'Handbag',glyph:'👜'},{id:'bow',label:'Bow',glyph:'🎀'},{id:'shoe',label:'Shoe',glyph:'👠'},{id:'hanger',label:'Hanger',glyph:'♧',type:'image',src:'assets/stickers/fashion/hanger-wood.svg'}]}
    ];
  }

  function stickerDef(packId,stickerId){
    const packs=stickerPacks();
    const pack=packs.find(p=>String(p.id)===String(packId));
    return pack?.stickers?.find(s=>String(s.id)===String(stickerId))||null;
  }

  function stickerContent(obj){
    const def=stickerDef(obj.packId,obj.stickerId);
    const src=obj.src||(def?.type==='image'?def.src:'')||'';
    const glyph=obj.glyph||def?.glyph||'✨';
    const alt=obj.label||def?.alt||def?.label||'Sticker';
    return src?`<img src="${esc(src)}" alt="${esc(alt)}" draggable="false">`:`<span class="v1325-sticker-glyph">${esc(glyph)}</span>`;
  }

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      #journalDetailDialog .v1325-creative-editor-surface{position:relative;isolation:isolate;border-radius:12px;overflow:visible}
      #journalDetailDialog .v1325-creative-editor-surface>.v1325-journal-editor{position:relative;z-index:1;margin:0!important;box-sizing:border-box!important}
      #journalDetailDialog .v1325-creative-editor-surface[data-journal-bg]:not([data-journal-bg="default"])>.v1325-journal-editor{background:transparent!important;background-image:none!important}
      #journalDetailDialog .${EDIT_LAYER_CLASS}{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:visible;border-radius:12px}
      #journalDetailDialog .v1325-journal-sticker{position:absolute;display:grid;place-items:center;box-sizing:border-box;touch-action:none;pointer-events:auto;user-select:none;-webkit-user-select:none;cursor:grab;transform-origin:center;z-index:2}
      #journalDetailDialog .v1325-journal-sticker:active{cursor:grabbing}
      #journalDetailDialog .v1325-journal-sticker img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none;filter:drop-shadow(0 2px 3px rgba(61,48,39,.12))}
      #journalDetailDialog .v1325-journal-sticker .v1325-sticker-glyph{font-size:min(76cqw,76cqh);line-height:1;pointer-events:none}
      #journalDetailDialog .v1325-journal-sticker.selected{outline:1.5px dashed rgba(91,77,61,.52);outline-offset:3px;border-radius:8px}
      #journalDetailDialog .v1325-journal-sticker-delete,#journalDetailDialog .v1325-journal-sticker-resize{display:none;position:absolute;width:24px;height:24px;min-width:24px;padding:0;border:1px solid rgba(85,66,52,.26);border-radius:50%;background:#fffaf0;color:#664f3f;box-shadow:0 2px 7px rgba(50,39,31,.18);font:800 14px/22px system-ui;text-align:center;z-index:5}
      #journalDetailDialog .v1325-journal-sticker.selected .v1325-journal-sticker-delete,#journalDetailDialog .v1325-journal-sticker.selected .v1325-journal-sticker-resize{display:block}
      #journalDetailDialog .v1325-journal-sticker-delete{right:-15px;top:-15px}
      #journalDetailDialog .v1325-journal-sticker-resize{right:-15px;bottom:-15px;cursor:nwse-resize;font-size:13px}

      #journalDetailDialog #${CONTROL_ID}{display:none;margin:13px 0 4px;border:1px solid rgba(108,81,66,.15);border-radius:13px;background:rgba(248,243,233,.72);overflow:hidden}
      #journalDetailDialog .v1325-journal-sheet.editing #${CONTROL_ID}{display:block}
      #journalDetailDialog #${CONTROL_ID} details+details{border-top:1px solid rgba(108,81,66,.10)}
      #journalDetailDialog #${CONTROL_ID} summary{list-style:none;display:flex;align-items:center;gap:7px;min-height:39px;padding:8px 10px;cursor:pointer;font-family:var(--serif);font-size:.78rem;font-weight:700;color:var(--coffee)}
      #journalDetailDialog #${CONTROL_ID} summary::-webkit-details-marker{display:none}
      #journalDetailDialog #${CONTROL_ID} summary:after{content:'⌄';margin-left:auto;font-size:.74rem;transition:transform .14s ease}
      #journalDetailDialog #${CONTROL_ID} details[open] summary:after{transform:rotate(180deg)}
      #journalDetailDialog .v1325-creative-panel-body{padding:0 9px 10px}
      #journalDetailDialog .v1325-bg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
      #journalDetailDialog .v1325-bg-choice{min-height:64px;padding:5px;border:1px solid rgba(108,81,66,.14);border-radius:10px;background:#fffdf8;color:var(--coffee);font:700 9px/1.1 system-ui;display:grid;grid-template-rows:1fr auto;gap:4px}
      #journalDetailDialog .v1325-bg-choice.active{outline:2px solid var(--olive,#66715a);outline-offset:-2px}
      #journalDetailDialog .v1325-bg-sample{display:block;min-height:38px;border-radius:7px;border:1px solid rgba(108,81,66,.11)}
      #journalDetailDialog .v1325-sticker-pack-strip{display:flex;gap:5px;overflow-x:auto;padding:0 0 7px;scrollbar-width:none}
      #journalDetailDialog .v1325-sticker-pack-strip::-webkit-scrollbar{display:none}
      #journalDetailDialog .v1325-sticker-pack-btn{flex:0 0 auto;min-height:31px;padding:5px 8px;border:1px solid rgba(108,81,66,.15);border-radius:9px;background:#fffdf8;color:var(--coffee);font:700 9px/1 system-ui}
      #journalDetailDialog .v1325-sticker-pack-btn.active{background:var(--olive,#66715a);color:#fff;border-color:var(--olive-dark,#4e5945)}
      #journalDetailDialog .v1325-sticker-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
      #journalDetailDialog .v1325-sticker-choice{min-height:54px;padding:4px;border:1px solid rgba(108,81,66,.12);border-radius:10px;background:rgba(255,255,255,.72);display:grid;place-items:center;grid-template-rows:1fr auto;gap:2px;color:var(--coffee)}
      #journalDetailDialog .v1325-sticker-choice img{width:33px;height:33px;object-fit:contain;pointer-events:none}
      #journalDetailDialog .v1325-sticker-choice .glyph{font-size:27px;line-height:1}
      #journalDetailDialog .v1325-sticker-choice small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7px;color:var(--muted)}
      #journalDetailDialog .v1325-sticker-help{margin:7px 1px 0;font-size:.66rem;color:var(--muted);line-height:1.3}

      .v1325-bg-postit{background-color:#fff1a8!important;background-image:linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,.04))!important;box-shadow:inset 0 0 0 1px rgba(166,139,52,.12)}
      .v1325-bg-graph{background-color:#fffefb!important;background-image:linear-gradient(rgba(90,142,168,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(90,142,168,.16) 1px,transparent 1px)!important;background-size:20px 20px!important}
      .v1325-bg-composition{background-color:#fffdf6!important;background-image:linear-gradient(90deg,transparent 0 34px,rgba(193,90,90,.19) 34px 35px,transparent 35px),repeating-linear-gradient(180deg,transparent 0 30px,rgba(83,124,164,.16) 30px 31px)!important}
      .v1325-bg-newspaper{background-color:#f3efe4!important;background-image:linear-gradient(90deg,transparent 0 32%,rgba(72,66,58,.07) 32% 32.5%,transparent 32.5% 66%,rgba(72,66,58,.07) 66% 66.5%,transparent 66.5%),repeating-linear-gradient(180deg,rgba(72,66,58,.025) 0 1px,transparent 1px 18px)!important}
      .v1325-bg-white{background:#fff!important}

      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg="postit"]{background:#fff1a8!important;background-image:linear-gradient(rgba(255,255,255,.20),rgba(255,255,255,.05))!important}
      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg="graph"]{background-color:#fffefb!important;background-image:linear-gradient(rgba(90,142,168,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(90,142,168,.13) 1px,transparent 1px)!important;background-size:22px 22px!important}
      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg="composition"]{background-color:#fffdf6!important;background-image:linear-gradient(90deg,transparent 0 54px,rgba(193,90,90,.16) 54px 55px,transparent 55px),repeating-linear-gradient(180deg,transparent 0 31px,rgba(83,124,164,.13) 31px 32px)!important}
      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg="newspaper"]{background-color:#f3efe4!important;background-image:linear-gradient(90deg,transparent 0 32%,rgba(72,66,58,.055) 32% 32.4%,transparent 32.4% 66%,rgba(72,66,58,.055) 66% 66.4%,transparent 66.4%),repeating-linear-gradient(180deg,rgba(72,66,58,.018) 0 1px,transparent 1px 18px)!important}
      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg="white"]{background:#fff!important}
      #v1325JournalReaderDialog .v1325-reader-writing{position:relative;isolation:isolate;min-height:120px}
      #v1325JournalReaderDialog .${READER_LAYER_CLASS}{position:absolute;inset:0;z-index:12;pointer-events:none;overflow:visible}
      #v1325JournalReaderDialog .v1325-reader-sticker{position:absolute;display:grid;place-items:center;pointer-events:none;user-select:none;transform-origin:center}
      #v1325JournalReaderDialog .v1325-reader-sticker img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 2px 3px rgba(61,48,39,.12))}
      #v1325JournalReaderDialog .v1325-reader-sticker .v1325-sticker-glyph{font-size:min(76cqw,76cqh);line-height:1}

      @media(max-width:520px){
        #journalDetailDialog .v1325-bg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        #journalDetailDialog .v1325-sticker-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
        #journalDetailDialog .v1325-sticker-choice{min-height:58px}
      }
    `;document.head.appendChild(style);
  }

  function backgroundClass(id){return `v1325-bg-${id}`;}
  function applyBackgroundToEdit(entry){
    const page=ensureCreative(entry),surface=document.querySelector('#journalDetailDialog .v1325-creative-editor-surface');
    if(!surface||!page)return;
    BACKGROUNDS.forEach(bg=>surface.classList.remove(backgroundClass(bg.id)));
    const id=BACKGROUNDS.some(bg=>bg.id===page.background.id)?page.background.id:'default';
    surface.dataset.journalBg=id;
    if(id!=='default')surface.classList.add(backgroundClass(id));
  }
  function applyBackgroundToReader(entry){
    const page=ensureCreative(entry),readerPage=document.querySelector('#v1325JournalReaderPage');
    if(!readerPage||!page)return;
    const id=BACKGROUNDS.some(bg=>bg.id===page.background.id)?page.background.id:'default';
    readerPage.dataset.journalBg=id;
  }

  function ensureEditorSurface(entry){
    const editor=document.querySelector('#journalDetailDialog #v1325JournalEditor');if(!editor)return null;
    let surface=editor.closest('.v1325-creative-editor-surface');
    if(!surface){surface=document.createElement('div');surface.className='v1325-creative-editor-surface';editor.parentNode.insertBefore(surface,editor);surface.appendChild(editor);}
    let layer=surface.querySelector(':scope > .'+EDIT_LAYER_CLASS);
    if(!layer){layer=document.createElement('div');layer.className=EDIT_LAYER_CLASS;surface.appendChild(layer);}
    applyBackgroundToEdit(entry);return surface;
  }

  function persist(entry){
    if(!entry)return Promise.resolve();entry.updated=Date.now();
    try{return Promise.resolve(saveState()).catch(err=>console.error('[v13.25 creative page] save failed',err));}catch(err){console.error('[v13.25 creative page] save failed',err);return Promise.resolve();}
  }

  function renderStickerNode(obj,editable=true){
    const el=document.createElement('div');el.className=editable?'v1325-journal-sticker':'v1325-reader-sticker';el.dataset.stickerObjectId=obj.id;
    el.style.left=clamp(Number(obj.x)||0,0,92)+'%';el.style.top=clamp(Number(obj.y)||0,0,92)+'%';el.style.width=clamp(Number(obj.w)||18,8,55)+'%';el.style.height=clamp(Number(obj.h)||22,8,65)+'%';el.style.zIndex=String(Number(obj.z)||1);el.style.transform=`rotate(${Number(obj.rotation)||0}deg)`;
    el.innerHTML=stickerContent(obj)+(editable?'<button type="button" class="v1325-journal-sticker-delete" aria-label="Delete sticker">×</button><button type="button" class="v1325-journal-sticker-resize" aria-label="Resize sticker">↘</button>':'');
    if(editable&&obj.id===selectedStickerId)el.classList.add('selected');return el;
  }

  function renderEditStickers(entry){
    const surface=ensureEditorSurface(entry);if(!surface)return;
    const page=ensureCreative(entry),layer=surface.querySelector(':scope > .'+EDIT_LAYER_CLASS);if(!layer||!page)return;
    layer.replaceChildren();page.objects.forEach(obj=>layer.appendChild(renderStickerNode(obj,true)));
  }

  function renderReaderStickers(entry){
    const page=ensureCreative(entry),reader=document.querySelector('#v1325JournalReaderDialog');if(!reader||!page)return;
    reader.querySelectorAll('.'+READER_LAYER_CLASS).forEach(node=>node.remove());
    const writings=[...reader.querySelectorAll('.v1325-reader-writing')];if(!writings.length)return;
    const target=writings[0];if(page.objects.length)target.style.minHeight='220px';
    const layer=document.createElement('div');layer.className=READER_LAYER_CLASS;page.objects.forEach(obj=>layer.appendChild(renderStickerNode(obj,false)));target.appendChild(layer);
  }

  function packButtons(){return stickerPacks().map(pack=>`<button type="button" class="v1325-sticker-pack-btn${pack.id===activePackId?' active':''}" data-journal-pack="${esc(pack.id)}">${esc(pack.icon||'✦')} ${esc(pack.label||pack.id)}</button>`).join('');}
  function stickerGrid(){
    const pack=stickerPacks().find(p=>p.id===activePackId)||stickerPacks()[0];if(!pack)return '';
    return (pack.stickers||[]).map(sticker=>{const preview=sticker.type==='image'&&sticker.src?`<img src="${esc(sticker.src)}" alt="">`:`<span class="glyph">${esc(sticker.glyph||'✨')}</span>`;return `<button type="button" class="v1325-sticker-choice" data-journal-sticker="${esc(sticker.id)}" data-journal-pack-id="${esc(pack.id)}">${preview}<small>${esc(sticker.label||sticker.id)}</small></button>`;}).join('');
  }

  function backgroundSampleClass(id){return id==='default'?'':backgroundClass(id);}
  function controlsMarkup(entry){
    const page=ensureCreative(entry),bgId=page?.background?.id||'default';
    return `<details open><summary>Page Background</summary><div class="v1325-creative-panel-body"><div class="v1325-bg-grid">${BACKGROUNDS.map(bg=>`<button type="button" class="v1325-bg-choice${bg.id===bgId?' active':''}" data-journal-bg="${bg.id}"><span class="v1325-bg-sample ${backgroundSampleClass(bg.id)}"></span><span>${esc(bg.label)}</span></button>`).join('')}</div></div></details><details><summary>Stickers</summary><div class="v1325-creative-panel-body"><div class="v1325-sticker-pack-strip">${packButtons()}</div><div class="v1325-sticker-grid">${stickerGrid()}</div><p class="v1325-sticker-help">Tap a sticker to add it. Drag to move, select it to resize with ↘, or tap × to remove. Up to ${MAX_STICKERS} stickers per Journal page.</p></div></details>`;
  }

  function installControls(entry){
    const write=document.querySelector('#journalDetailDialog .v1325-journal-write');if(!write||!entry)return;
    let controls=write.querySelector('#'+CONTROL_ID);if(!controls){controls=document.createElement('div');controls.id=CONTROL_ID;const save=write.querySelector('.v1325-journal-save-row');if(save)save.before(controls);else write.appendChild(controls);}
    controls.innerHTML=controlsMarkup(entry);bindControls(controls,entry);
  }

  function refreshStickerBrowser(controls,entry){
    const strip=controls.querySelector('.v1325-sticker-pack-strip'),grid=controls.querySelector('.v1325-sticker-grid');
    if(strip)strip.innerHTML=packButtons();if(grid)grid.innerHTML=stickerGrid();bindControls(controls,entry);
  }

  function addSticker(entry,packId,stickerId){
    const page=ensureCreative(entry),def=stickerDef(packId,stickerId);if(!page||!def)return;
    if(page.objects.length>=MAX_STICKERS){if(typeof toast==='function')toast(`Journal pages can hold up to ${MAX_STICKERS} stickers`);return;}
    const surface=ensureEditorSurface(entry),rect=surface?.getBoundingClientRect();
    const medium=def.sizeClass==='medium',w=medium?24:19,h=medium?30:24;
    const count=page.objects.length,obj={id:uid(),kind:'sticker',packId,stickerId,label:def.label||stickerId,glyph:def.glyph||'✨',src:def.type==='image'?def.src:'',x:clamp(58+(count%3)*7,5,100-w),y:clamp(12+(count%4)*10,5,100-h),w,h,z:10+count,rotation:0};
    page.objects.push(obj);selectedStickerId=obj.id;renderEditStickers(entry);persist(entry);if(typeof toast==='function')toast(`Added ${obj.label}`);
  }

  function deleteSticker(entry,id){
    const page=ensureCreative(entry);if(!page)return;page.objects=page.objects.filter(obj=>obj.id!==id);if(selectedStickerId===id)selectedStickerId='';renderEditStickers(entry);persist(entry);
  }

  function bindControls(controls,entry){
    controls.querySelectorAll('[data-journal-bg]').forEach(btn=>{btn.onclick=()=>{const page=ensureCreative(entry);page.background={id:btn.dataset.journalBg||'default'};applyBackgroundToEdit(entry);controls.querySelectorAll('[data-journal-bg]').forEach(x=>x.classList.toggle('active',x===btn));persist(entry);};});
    controls.querySelectorAll('[data-journal-pack]').forEach(btn=>{btn.onclick=()=>{activePackId=btn.dataset.journalPack||'standard';refreshStickerBrowser(controls,entry);};});
    controls.querySelectorAll('[data-journal-sticker]').forEach(btn=>{btn.onclick=()=>addSticker(entry,btn.dataset.journalPackId,btn.dataset.journalSticker);});
  }

  function beginDrag(event,el,mode){
    const entry=currentEntry(),page=ensureCreative(entry),obj=page?.objects.find(o=>o.id===el.dataset.stickerObjectId),surface=el.closest('.v1325-creative-editor-surface');if(!entry||!obj||!surface)return;
    event.preventDefault();event.stopPropagation();selectedStickerId=obj.id;renderEditStickers(entry);
    const live=surface.querySelector(`[data-sticker-object-id="${CSS.escape(obj.id)}"]`);if(!live)return;
    const rect=surface.getBoundingClientRect();dragging={entry,obj,surface,el:live,mode,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,start:{x:Number(obj.x)||0,y:Number(obj.y)||0,w:Number(obj.w)||18,h:Number(obj.h)||22},rect};
    try{live.setPointerCapture(event.pointerId);}catch{}
  }

  function moveDrag(event){
    if(!dragging||event.pointerId!==dragging.pointerId)return;event.preventDefault();
    const d=dragging,dx=(event.clientX-d.startX)/Math.max(1,d.rect.width)*100,dy=(event.clientY-d.startY)/Math.max(1,d.rect.height)*100;
    if(d.mode==='resize'){
      d.obj.w=clamp(d.start.w+dx,8,55);d.obj.h=clamp(d.start.h+dy,8,65);d.obj.x=clamp(d.start.x,0,100-d.obj.w);d.obj.y=clamp(d.start.y,0,100-d.obj.h);
    }else{
      d.obj.x=clamp(d.start.x+dx,0,100-d.obj.w);d.obj.y=clamp(d.start.y+dy,0,100-d.obj.h);
    }
    d.el.style.left=d.obj.x+'%';d.el.style.top=d.obj.y+'%';d.el.style.width=d.obj.w+'%';d.el.style.height=d.obj.h+'%';
  }

  function endDrag(event){
    if(!dragging||event.pointerId!==dragging.pointerId)return;const d=dragging;dragging=null;try{d.el.releasePointerCapture(event.pointerId);}catch{}persist(d.entry);
  }

  function bindStickerInteractions(){
    const dialog=document.querySelector('#journalDetailDialog');if(!dialog||dialog.dataset.v1325CreativeStickerBound==='1')return;dialog.dataset.v1325CreativeStickerBound='1';
    dialog.addEventListener('pointerdown',event=>{
      const del=event.target.closest?.('.v1325-journal-sticker-delete');if(del){event.preventDefault();event.stopPropagation();const sticker=del.closest('.v1325-journal-sticker');deleteSticker(currentEntry(),sticker?.dataset.stickerObjectId);return;}
      const resize=event.target.closest?.('.v1325-journal-sticker-resize');if(resize){beginDrag(event,resize.closest('.v1325-journal-sticker'),'resize');return;}
      const sticker=event.target.closest?.('.v1325-journal-sticker');if(sticker)beginDrag(event,sticker,'move');
    },true);
    dialog.addEventListener('pointermove',moveDrag,{capture:true,passive:false});dialog.addEventListener('pointerup',endDrag,true);dialog.addEventListener('pointercancel',endDrag,true);
  }

  function syncEdit(){
    installStyles();const entry=currentEntry(),dialog=document.querySelector('#journalDetailDialog'),sheet=dialog?.querySelector('.v1325-journal-sheet');if(!entry||!dialog?.open||!sheet)return;
    ensureCreative(entry);ensureEditorSurface(entry);installControls(entry);renderEditStickers(entry);bindStickerInteractions();applyBackgroundToEdit(entry);
  }

  function syncReader(){
    installStyles();const reader=document.querySelector('#v1325JournalReaderDialog'),entry=currentEntry();if(!reader?.open||!entry)return;ensureCreative(entry);applyBackgroundToReader(entry);renderReaderStickers(entry);
  }

  function wrapOpenDetail(){
    if(typeof openJournalDetail!=='function'||openJournalDetail.__creativePageWrapped)return;const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);requestAnimationFrame(syncEdit);setTimeout(syncEdit,80);setTimeout(syncEdit,220);return out;};openJournalDetail.__creativePageWrapped=true;
  }

  function wrapReader(){
    const api=window.AudreyJournalExperienceDev3;if(!api?.openReader||api.__creativePageWrapped)return;const open0=api.openReader.bind(api);api.openReader=function(id){const out=open0(id);requestAnimationFrame(syncReader);setTimeout(syncReader,40);setTimeout(syncReader,140);return out;};api.__creativePageWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle,#v1325SaveJournalBtn')){requestAnimationFrame(syncEdit);setTimeout(syncEdit,45);setTimeout(syncEdit,140);}
    if(event.target.closest?.('#v1325JournalViewBtn,#v1325ReaderBackBtn,#v1325ReaderEditBtn')){requestAnimationFrame(syncReader);setTimeout(syncReader,45);setTimeout(syncReader,150);}
  },true);

  installStyles();wrapOpenDetail();wrapReader();requestAnimationFrame(()=>{syncEdit();syncReader();});setTimeout(()=>{wrapReader();syncEdit();syncReader();},180);
  window.AudreyJournalCreativePage={version:VERSION,refresh:()=>{syncEdit();syncReader();},backgrounds:BACKGROUNDS,packs:stickerPacks};
})();
