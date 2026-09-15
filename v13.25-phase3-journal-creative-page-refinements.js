/* Audrey Closet v13.25 Phase 3 — Journal Creative Page refinements
 * Layout44 targeted overlay:
 * - compact background chooser in Journal Entry toolbar
 * - non-default reader backgrounds suppress legacy ruled text lines
 * - disables Edit Journal sticker overlay/panel
 * - moves sticker placement to View Journal page-level decorate mode
 * - adds optional white sticker border
 */
(function(){
  'use strict';
  const VERSION='1.0';
  const STYLE_ID='v1325JournalCreativeRefinementStyles';
  const MAX_STICKERS=12;
  let activePackId='standard';
  let selectedStickerId='';
  let outlineDefault=false;
  let drag=null;

  const BACKGROUNDS=[
    ['default','Default / Transparent'],['postit','Post-it Note'],['graph','Graph Paper'],
    ['composition','Composition'],['newspaper','Newspaper'],['white','Plain White Paper']
  ];

  function entry(){const reader=document.querySelector('#v1325JournalReaderDialog');const id=reader?.dataset?.journalId||viewingJournalId||'';return state.journal.find(x=>String(x.id)===String(id))||null;}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function uid(){return `journalSticker_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;}
  function page(e){if(!e)return null;if(!e.creativePage||typeof e.creativePage!=='object')e.creativePage={};if(!e.creativePage.background)e.creativePage.background={id:'default'};if(!Array.isArray(e.creativePage.objects))e.creativePage.objects=[];return e.creativePage;}
  function save(e){if(!e)return;e.updated=Date.now();try{Promise.resolve(saveState()).catch(()=>{});}catch{}}
  function packs(){return Array.isArray(window.AUDREY_STICKER_PACKS_V1?.packs)?window.AUDREY_STICKER_PACKS_V1.packs:[];}
  function def(packId,id){return packs().find(p=>String(p.id)===String(packId))?.stickers?.find(s=>String(s.id)===String(id))||null;}
  function stickerMarkup(o){const d=def(o.packId,o.stickerId),src=o.src||(d?.type==='image'?d.src:'')||'',glyph=o.glyph||d?.glyph||'✨',alt=o.label||d?.label||'Sticker';return src?`<img src="${esc(src)}" alt="${esc(alt)}" draggable="false">`:`<span class="v1325-refine-sticker-glyph">${esc(glyph)}</span>`;}

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      /* Retire layout43's large creative controls and editor sticker layer. */
      #journalDetailDialog #v1325JournalCreativeControls,#journalDetailDialog .v1325-journal-sticker-layer,#journalDetailDialog .v1325-journal-sticker{display:none!important}
      #journalDetailDialog .v1325-creative-editor-surface{position:static!important;isolation:auto!important;overflow:visible!important;background:none!important;box-shadow:none!important}

      /* Compact background chooser appended to the Journal Entry formatting row. */
      #journalDetailDialog .v1325-refine-bg-control{display:flex;align-items:center;gap:5px;height:31px;padding:0 6px;border:1px solid rgba(108,81,66,.17);border-radius:8px;background:#fffdf8;color:var(--coffee);box-sizing:border-box}
      #journalDetailDialog .v1325-refine-bg-preview{width:20px;height:20px;flex:0 0 20px;border:1px solid rgba(108,81,66,.14);border-radius:5px;box-sizing:border-box}
      #journalDetailDialog .v1325-refine-bg-control select{width:82px!important;max-width:82px!important;height:29px!important;min-height:29px!important;padding:0 17px 0 0!important;border:0!important;border-radius:0!important;background:transparent!important;font-size:.7rem!important;color:var(--coffee)!important;box-shadow:none!important}
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-refine-bg-control{display:none!important}

      .v1325-refine-bg-postit{background:#fff1a8!important;background-image:linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,.04))!important}
      .v1325-refine-bg-graph{background-color:#fffefb!important;background-image:linear-gradient(rgba(90,142,168,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(90,142,168,.16) 1px,transparent 1px)!important;background-size:8px 8px!important}
      .v1325-refine-bg-composition{background-color:#fffdf6!important;background-image:linear-gradient(90deg,transparent 0 7px,rgba(193,90,90,.18) 7px 8px,transparent 8px),repeating-linear-gradient(180deg,transparent 0 8px,rgba(83,124,164,.15) 8px 9px)!important}
      .v1325-refine-bg-newspaper{background-color:#f3efe4!important;background-image:linear-gradient(90deg,transparent 0 32%,rgba(72,66,58,.08) 32% 33%,transparent 33% 66%,rgba(72,66,58,.08) 66% 67%,transparent 67%),repeating-linear-gradient(180deg,rgba(72,66,58,.025) 0 1px,transparent 1px 6px)!important}
      .v1325-refine-bg-white{background:#fff!important}

      /* Preserve selected background in Edit Journal without any stickers over contenteditable. */
      #journalDetailDialog #v1325JournalEditor[data-refine-bg="postit"]{background:#fff1a8!important;background-image:none!important}
      #journalDetailDialog #v1325JournalEditor[data-refine-bg="graph"]{background-color:#fffefb!important;background-image:linear-gradient(rgba(90,142,168,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(90,142,168,.16) 1px,transparent 1px)!important;background-size:20px 20px!important}
      #journalDetailDialog #v1325JournalEditor[data-refine-bg="composition"]{background-color:#fffdf6!important;background-image:linear-gradient(90deg,transparent 0 34px,rgba(193,90,90,.19) 34px 35px,transparent 35px),repeating-linear-gradient(180deg,transparent 0 30px,rgba(83,124,164,.16) 30px 31px)!important}
      #journalDetailDialog #v1325JournalEditor[data-refine-bg="newspaper"]{background-color:#f3efe4!important;background-image:linear-gradient(90deg,transparent 0 32%,rgba(72,66,58,.07) 32% 32.5%,transparent 32.5% 66%,rgba(72,66,58,.07) 66% 66.5%,transparent 66.5%),repeating-linear-gradient(180deg,rgba(72,66,58,.025) 0 1px,transparent 1px 18px)!important}
      #journalDetailDialog #v1325JournalEditor[data-refine-bg="white"]{background:#fff!important;background-image:none!important}

      /* Background owns the page in Journal View; legacy text ruling only remains on default. */
      #v1325JournalReaderDialog .v1325-reader-page[data-journal-bg]:not([data-journal-bg="default"]) .v1325-reader-writing{background:none!important;background-image:none!important}

      /* Page-level sticker editing in View Journal. */
      #v1325JournalReaderDialog .v1325-refine-sticker-layer{position:absolute;inset:0;z-index:24;pointer-events:none;overflow:visible}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker-layer{pointer-events:auto}
      #v1325JournalReaderDialog .v1325-refine-sticker{position:absolute;display:grid;place-items:center;box-sizing:border-box;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none;container-type:size}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker{pointer-events:auto;cursor:grab}
      #v1325JournalReaderDialog .v1325-refine-sticker img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none;filter:drop-shadow(0 2px 3px rgba(61,48,39,.13))}
      #v1325JournalReaderDialog .v1325-refine-sticker-glyph{font-size:min(76cqw,76cqh);line-height:1}
      #v1325JournalReaderDialog .v1325-refine-sticker.outlined img{filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 2px 3px rgba(61,48,39,.13))}
      #v1325JournalReaderDialog .v1325-refine-sticker.outlined .v1325-refine-sticker-glyph{text-shadow:-2px 0 #fff,2px 0 #fff,0 -2px #fff,0 2px #fff,-1px -1px #fff,1px 1px #fff,-1px 1px #fff,1px -1px #fff}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected{outline:1.5px dashed rgba(90,72,56,.58);outline-offset:4px;border-radius:8px}
      #v1325JournalReaderDialog .v1325-refine-delete,#v1325JournalReaderDialog .v1325-refine-resize{display:none;position:absolute;width:28px;height:28px;min-width:28px;padding:0;border:1px solid rgba(85,66,52,.28);border-radius:50%;background:#fffaf0;color:#664f3f;box-shadow:0 2px 8px rgba(50,39,31,.20);font:800 15px/26px system-ui;text-align:center;z-index:5}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected .v1325-refine-delete,#v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-sticker.selected .v1325-refine-resize{display:block}
      #v1325JournalReaderDialog .v1325-refine-delete{right:-17px;top:-17px}.v1325-refine-resize{right:-17px;bottom:-17px}

      #v1325JournalReaderDialog .v1325-refine-decorate-btn{position:absolute;top:60px;right:18px;z-index:72;min-height:34px;padding:6px 9px;border:1px solid rgba(111,91,69,.25);border-radius:10px;background:#eadfc9;color:#6f5d48;font:800 10px/1 system-ui;box-shadow:0 3px 10px rgba(74,58,44,.10)}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-decorate-btn{background:var(--olive,#66715a);color:#fff}
      #v1325JournalReaderDialog .v1325-refine-panel{display:none;position:absolute;right:14px;top:102px;z-index:90;width:min(310px,calc(100% - 28px));max-height:min(62dvh,540px);overflow:auto;padding:10px;border:1px solid rgba(100,78,58,.20);border-radius:15px;background:rgba(250,245,235,.98);box-shadow:0 16px 40px rgba(47,36,28,.24);backdrop-filter:blur(10px)}
      #v1325JournalReaderDialog.v1325-refine-decorating .v1325-refine-panel{display:block}
      #v1325JournalReaderDialog .v1325-refine-panel-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.v1325-refine-panel-head button{margin-left:auto}
      #v1325JournalReaderDialog .v1325-refine-pack-strip{display:flex;gap:5px;overflow-x:auto;padding-bottom:7px;scrollbar-width:none}.v1325-refine-pack-strip::-webkit-scrollbar{display:none}
      #v1325JournalReaderDialog .v1325-refine-pack{flex:0 0 auto;min-height:31px;padding:5px 8px;border:1px solid rgba(108,81,66,.15);border-radius:9px;background:#fffdf8;color:var(--coffee);font:700 9px/1 system-ui}.v1325-refine-pack.active{background:var(--olive,#66715a)!important;color:#fff!important}
      #v1325JournalReaderDialog .v1325-refine-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.v1325-refine-choice{min-height:58px;padding:4px;border:1px solid rgba(108,81,66,.12);border-radius:10px;background:rgba(255,255,255,.74);display:grid;place-items:center;grid-template-rows:1fr auto;gap:2px;color:var(--coffee)}
      #v1325JournalReaderDialog .v1325-refine-choice img{width:34px;height:34px;object-fit:contain}.v1325-refine-choice .glyph{font-size:28px}.v1325-refine-choice small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7px;color:var(--muted)}
      #v1325JournalReaderDialog .v1325-refine-outline-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:9px 0 7px;padding:7px 8px;border:1px solid rgba(108,81,66,.11);border-radius:10px;background:rgba(255,255,255,.54);font-size:.7rem}.v1325-refine-outline-btn.active{background:var(--olive,#66715a)!important;color:#fff!important}
      #v1325JournalReaderDialog .v1325-refine-help{margin:8px 1px 0;font-size:.66rem;line-height:1.35;color:var(--muted)}
      @media(max-width:560px){#v1325JournalReaderDialog .v1325-refine-decorate-btn{top:54px;right:12px}#v1325JournalReaderDialog .v1325-refine-panel{top:94px;right:9px;width:calc(100% - 18px);max-height:58dvh}}
    `;document.head.appendChild(s);
  }

  function bgClass(id){return `v1325-refine-bg-${id}`;}
  function applyBgEdit(e){const p=page(e),ed=document.querySelector('#v1325JournalEditor');if(!p||!ed)return;ed.dataset.refineBg=p.background?.id||'default';const prev=document.querySelector('#v1325RefineBgPreview');if(prev){BACKGROUNDS.forEach(([id])=>prev.classList.remove(bgClass(id)));if(p.background?.id&&p.background.id!=='default')prev.classList.add(bgClass(p.background.id));}const sel=document.querySelector('#v1325RefineBgSelect');if(sel)sel.value=p.background?.id||'default';}
  function chooser(e){const toolbar=document.querySelector('#journalDetailDialog .v1325-journal-toolbar');if(!toolbar)return;let wrap=toolbar.querySelector('.v1325-refine-bg-control');if(!wrap){wrap=document.createElement('label');wrap.className='v1325-refine-bg-control';wrap.innerHTML=`<span id="v1325RefineBgPreview" class="v1325-refine-bg-preview"></span><select id="v1325RefineBgSelect" aria-label="Journal background">${BACKGROUNDS.map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select>`;toolbar.appendChild(wrap);wrap.querySelector('select').onchange=ev=>{const p=page(e);p.background={id:ev.target.value||'default'};applyBgEdit(e);save(e);};}applyBgEdit(e);}

  function stickerNode(o){const n=document.createElement('div');n.className='v1325-refine-sticker'+(o.outline?' outlined':'')+(o.id===selectedStickerId?' selected':'');n.dataset.stickerId=o.id;n.style.left=clamp(+o.x||0,0,94)+'%';n.style.top=clamp(+o.y||0,0,94)+'%';n.style.width=clamp(+o.w||16,7,50)+'%';n.style.height=clamp(+o.h||15,7,50)+'%';n.style.zIndex=String(+o.z||30);n.innerHTML=stickerMarkup(o)+'<button type="button" class="v1325-refine-delete">×</button><button type="button" class="v1325-refine-resize">↘</button>';return n;}
  function renderStickers(e){const p=page(e),rp=document.querySelector('#v1325JournalReaderPage');if(!p||!rp)return;document.querySelectorAll('#v1325JournalReaderDialog .v1325-reader-sticker-layer').forEach(x=>x.style.display='none');let layer=rp.querySelector(':scope > .v1325-refine-sticker-layer');if(!layer){layer=document.createElement('div');layer.className='v1325-refine-sticker-layer';rp.appendChild(layer);}layer.replaceChildren();p.objects.forEach(o=>layer.appendChild(stickerNode(o)));}
  function packButtons(){return packs().map(p=>`<button type="button" class="v1325-refine-pack${p.id===activePackId?' active':''}" data-pack="${esc(p.id)}">${esc(p.icon||'✦')} ${esc(p.label||p.id)}</button>`).join('');}
  function grid(){const p=packs().find(x=>x.id===activePackId)||packs()[0];return (p?.stickers||[]).map(s=>{const pr=s.type==='image'&&s.src?`<img src="${esc(s.src)}" alt="">`:`<span class="glyph">${esc(s.glyph||'✨')}</span>`;return `<button type="button" class="v1325-refine-choice" data-sticker="${esc(s.id)}" data-pack-id="${esc(p.id)}">${pr}<small>${esc(s.label||s.id)}</small></button>`;}).join('');}
  function panelHtml(){return `<div class="v1325-refine-panel-head"><strong>Decorate Journal</strong><button type="button" class="soft-btn" data-done>Save</button></div><div class="v1325-refine-pack-strip">${packButtons()}</div><div class="v1325-refine-grid">${grid()}</div><div class="v1325-refine-outline-row"><span>Sticker white border</span><button type="button" class="soft-btn v1325-refine-outline-btn${outlineDefault?' active':''}" data-outline>${outlineDefault?'On':'Off'}</button></div><p class="v1325-refine-help">Tap a sticker to add it. Drag it anywhere on the Journal page. Select it to resize with ↘, remove with ×, or turn the white sticker border on/off.</p>`;}
  function controls(e){const r=document.querySelector('#v1325JournalReaderDialog');if(!r)return;let b=r.querySelector('.v1325-refine-decorate-btn');if(!b){b=document.createElement('button');b.className='v1325-refine-decorate-btn';b.textContent='✦ Stickers';r.appendChild(b);b.onclick=()=>{r.classList.toggle('v1325-refine-decorating');selectedStickerId='';renderStickers(e);};}let p=r.querySelector('.v1325-refine-panel');if(!p){p=document.createElement('div');p.className='v1325-refine-panel';r.appendChild(p);}p.innerHTML=panelHtml();p.querySelectorAll('[data-pack]').forEach(x=>x.onclick=()=>{activePackId=x.dataset.pack;controls(e);});p.querySelectorAll('[data-sticker]').forEach(x=>x.onclick=()=>add(e,x.dataset.packId,x.dataset.sticker));p.querySelector('[data-done]')?.addEventListener('click',()=>{save(e);r.classList.remove('v1325-refine-decorating');selectedStickerId='';renderStickers(e);});p.querySelector('[data-outline]')?.addEventListener('click',()=>{const o=page(e)?.objects.find(x=>x.id===selectedStickerId);if(o){o.outline=!o.outline;outlineDefault=!!o.outline;save(e);renderStickers(e);}else outlineDefault=!outlineDefault;controls(e);});}
  function add(e,packId,id){const p=page(e),d=def(packId,id);if(!p||!d)return;if(p.objects.length>=MAX_STICKERS){toast?.(`Journal pages can hold up to ${MAX_STICKERS} stickers`);return;}const medium=d.sizeClass==='medium',w=medium?21:16,h=medium?19:15,c=p.objects.length,o={id:uid(),kind:'sticker',packId,stickerId:id,label:d.label||id,glyph:d.glyph||'✨',src:d.type==='image'?d.src:'',x:clamp(58+(c%3)*6,5,100-w),y:clamp(25+(c%4)*8,8,100-h),w,h,z:30+c,rotation:0,outline:outlineDefault};p.objects.push(o);selectedStickerId=o.id;renderStickers(e);save(e);}
  function remove(e,id){const p=page(e);if(!p)return;p.objects=p.objects.filter(x=>x.id!==id);selectedStickerId='';renderStickers(e);save(e);}
  function startDrag(ev,node,mode){const e=entry(),p=page(e),o=p?.objects.find(x=>x.id===node.dataset.stickerId),rp=document.querySelector('#v1325JournalReaderPage');if(!e||!o||!rp)return;ev.preventDefault();ev.stopPropagation();selectedStickerId=o.id;renderStickers(e);const live=rp.querySelector(`[data-sticker-id="${CSS.escape(o.id)}"]`),rect=rp.getBoundingClientRect();drag={e,o,live,mode,pointerId:ev.pointerId,startX:ev.clientX,startY:ev.clientY,start:{x:+o.x||0,y:+o.y||0,w:+o.w||16,h:+o.h||15},rect};try{live.setPointerCapture(ev.pointerId);}catch{}}
  function move(ev){if(!drag||ev.pointerId!==drag.pointerId)return;ev.preventDefault();const d=drag,dx=(ev.clientX-d.startX)/Math.max(1,d.rect.width)*100,dy=(ev.clientY-d.startY)/Math.max(1,d.rect.height)*100;if(d.mode==='resize'){d.o.w=clamp(d.start.w+dx,7,50);d.o.h=clamp(d.start.h+dy,7,50);d.o.x=clamp(d.start.x,0,100-d.o.w);d.o.y=clamp(d.start.y,0,100-d.o.h);}else{d.o.x=clamp(d.start.x+dx,0,100-d.o.w);d.o.y=clamp(d.start.y+dy,0,100-d.o.h);}d.live.style.left=d.o.x+'%';d.live.style.top=d.o.y+'%';d.live.style.width=d.o.w+'%';d.live.style.height=d.o.h+'%';}
  function end(ev){if(!drag||ev.pointerId!==drag.pointerId)return;const d=drag;drag=null;save(d.e);}
  function bindReader(){const r=document.querySelector('#v1325JournalReaderDialog');if(!r||r.dataset.refineCreativeBound==='1')return;r.dataset.refineCreativeBound='1';r.addEventListener('pointerdown',ev=>{if(!r.classList.contains('v1325-refine-decorating'))return;const del=ev.target.closest?.('.v1325-refine-delete');if(del){remove(entry(),del.closest('.v1325-refine-sticker')?.dataset.stickerId);return;}const rz=ev.target.closest?.('.v1325-refine-resize');if(rz){startDrag(ev,rz.closest('.v1325-refine-sticker'),'resize');return;}const st=ev.target.closest?.('.v1325-refine-sticker');if(st)startDrag(ev,st,'move');},true);r.addEventListener('pointermove',move,{capture:true,passive:false});r.addEventListener('pointerup',end,true);r.addEventListener('pointercancel',end,true);}

  function syncEdit(){installStyles();const e=entry(),d=document.querySelector('#journalDetailDialog');if(!e||!d?.open)return;chooser(e);applyBgEdit(e);}
  function syncReader(){installStyles();const e=entry(),r=document.querySelector('#v1325JournalReaderDialog');if(!e||!r?.open)return;const p=page(e),rp=document.querySelector('#v1325JournalReaderPage');if(rp)rp.dataset.journalBg=p.background?.id||'default';controls(e);renderStickers(e);bindReader();}

  function wrap(){if(typeof openJournalDetail==='function'&&!openJournalDetail.__creativeRefineWrapped){const o=openJournalDetail;openJournalDetail=function(){const v=o.apply(this,arguments);requestAnimationFrame(syncEdit);setTimeout(syncEdit,80);setTimeout(syncEdit,200);return v;};openJournalDetail.__creativeRefineWrapped=true;}const api=window.AudreyJournalExperienceDev3;if(api?.openReader&&!api.__creativeRefineWrapped){const o=api.openReader.bind(api);api.openReader=function(id){const v=o(id);requestAnimationFrame(syncReader);setTimeout(syncReader,50);setTimeout(syncReader,150);return v;};api.__creativeRefineWrapped=true;}}
  document.addEventListener('click',ev=>{if(ev.target.closest?.('#v1325JournalEditToggle,#v1325SaveJournalBtn')){requestAnimationFrame(syncEdit);setTimeout(syncEdit,50);}if(ev.target.closest?.('#v1325JournalViewBtn')){requestAnimationFrame(syncReader);setTimeout(syncReader,60);}},true);
  installStyles();wrap();setTimeout(()=>{wrap();syncEdit();syncReader();},160);window.AudreyJournalCreativeRefinements={version:VERSION,refresh:()=>{syncEdit();syncReader();}};
})();
