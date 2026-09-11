/* Audrey Closet v13.22-dev4 — Shape Studio fun shapes */
(function(){
  'use strict';

  const api=window.__audreyShapeStudioV132201;
  if(!api)return;

  const FUN_SHAPES=[
    {id:'thoughtBubble',label:'Thought Bubble',short:'Thought',w:170,h:110},
    {id:'caption',label:'Caption',short:'Caption',w:180,h:100},
    {id:'tape',label:'Tape',short:'Tape',w:170,h:58},
    {id:'postIt',label:'Post-it Note',short:'Post-it',w:140,h:130},
    {id:'priceTag',label:'Price Tag',short:'Tag',w:155,h:90},
    {id:'questionMark',label:'Question Mark',short:'?',w:86,h:118},
    {id:'exclamationPoint',label:'Exclamation Point',short:'!',w:70,h:118}
  ];
  const FUN_IDS=new Set(FUN_SHAPES.map(x=>x.id));

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  }

  function defFor(type){return FUN_SHAPES.find(x=>x.id===type)}
  function isFun(piece){return piece?.kind==='shape'&&FUN_IDS.has(String(piece.shapeType||piece.value||''))}

  function defaultStyle(type){
    if(type==='tape')return {fill:'rgba(225,196,112,.42)',borderColor:'#b69443',borderWidth:2};
    if(type==='postIt')return {fill:'#fff1a8',borderColor:'#d2b758',borderWidth:2};
    if(type==='priceTag')return {fill:'#fff8e7',borderColor:'#8b6f52',borderWidth:3};
    if(type==='questionMark'||type==='exclamationPoint')return {fill:'#6b5b52',borderColor:'#6b5b52',borderWidth:2};
    return {fill:'rgba(77,142,138,.08)',borderColor:'#4d8e8a',borderWidth:4};
  }

  function styleFor(piece,{preview=false}={}){
    const base=defaultStyle(piece.shapeType||piece.value);
    const s={...base,...(piece.shapeStyle||{})};
    return {
      fill:preview?(piece.shapeType==='postIt'?'#fff1a8':piece.shapeType==='tape'?'rgba(225,196,112,.42)':piece.shapeType==='priceTag'?'#fff8e7':'rgba(77,142,138,.07)'):s.fill,
      stroke:preview?'#4d8e8a':s.borderColor,
      width:preview?2:Math.max(1,Number(s.borderWidth)||1)
    };
  }

  function funSvgMarkup(piece,{preview=false}={}){
    const type=String(piece.shapeType||piece.value||'');
    const st=styleFor(piece,{preview});
    const fill=esc(st.fill),stroke=esc(st.stroke),sw=st.width;
    const common=`fill="${fill}" stroke="${stroke}" stroke-width="${sw}" vector-effect="non-scaling-stroke"`;
    let body='';

    if(type==='thoughtBubble'){
      body=`<path d="M20 69 C8 60 10 45 23 39 C19 25 35 16 48 23 C57 10 76 15 80 29 C95 27 101 44 93 55 C101 68 88 82 74 78 C63 91 45 87 40 78 C31 83 21 79 20 69 Z" ${common}/><circle cx="26" cy="88" r="6" ${common}/><circle cx="14" cy="96" r="3.5" ${common}/>`;
    }else if(type==='caption'){
      body=`<path d="M8 12 H92 Q97 12 97 17 V69 Q97 74 92 74 H58 L44 92 L45 74 H8 Q3 74 3 69 V17 Q3 12 8 12 Z" ${common}/>`;
    }else if(type==='tape'){
      body=`<rect x="4" y="18" width="92" height="64" rx="5" ${common}/><path d="M4 30 L14 18 M4 70 L14 82 M86 18 L96 30 M86 82 L96 70" fill="none" stroke="${stroke}" stroke-width="${Math.max(1,sw*.7)}" opacity=".45" vector-effect="non-scaling-stroke"/>`;
    }else if(type==='postIt'){
      body=`<path d="M8 6 H92 V72 L70 94 H8 Z" ${common}/><path d="M70 94 V72 H92" fill="rgba(255,255,255,.38)" stroke="${stroke}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`;
    }else if(type==='priceTag'){
      body=`<path d="M8 25 L28 7 H92 V93 H28 L8 75 Z" ${common}/><circle cx="27" cy="50" r="7" fill="#fffaf0" stroke="${stroke}" stroke-width="${Math.max(1,sw*.8)}" vector-effect="non-scaling-stroke"/>`;
    }else if(type==='questionMark'){
      body=`<text x="50" y="75" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="82" font-weight="800" fill="${fill}" stroke="${stroke}" stroke-width="${Math.max(.6,sw*.35)}" paint-order="stroke fill">?</text>`;
    }else if(type==='exclamationPoint'){
      body=`<text x="50" y="77" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="84" font-weight="800" fill="${fill}" stroke="${stroke}" stroke-width="${Math.max(.6,sw*.35)}" paint-order="stroke fill">!</text>`;
    }

    return `<svg class="shape-studio-svg shape-studio-fun shape-studio-type-${esc(type)}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  function addFunShape(type){
    const def=defFor(type);
    if(!def)return;
    const before=typeof window.cloneBoardStateV13205==='function'?window.cloneBoardStateV13205():null;
    const item={
      uid:id(),kind:'shape',shapeType:def.id,value:def.id,
      shapeStyle:defaultStyle(def.id),
      x:55+Math.random()*70,y:65+Math.random()*70,
      w:def.w,h:def.h,rotation:0,z:nextZ()
    };
    boardItems.push(item);
    selectedBoardUid=item.uid;
    if(before&&typeof window.pushBoardStateUndoV13205==='function')window.pushBoardStateUndoV13205(before,null,'add fun shape');
    drawBoard();
    if(typeof toast==='function')toast(def.label+' added');
  }

  const previousBoardItemContent=window.boardItemContent;
  window.boardItemContent=function(piece){
    if(isFun(piece))return funSvgMarkup(piece);
    return previousBoardItemContent.apply(this,arguments);
  };

  const previousRenderMiniPiece=window.renderMiniPiece;
  if(typeof previousRenderMiniPiece==='function'){
    window.renderMiniPiece=function(piece,outfit){
      if(!isFun(piece))return previousRenderMiniPiece.apply(this,arguments);
      const sw=Number(outfit?.boardWidth)||390,sh=Number(outfit?.boardHeight)||420;
      const left=Math.max(-10,Math.min(100,(Number(piece.x)||0)/sw*100));
      const top=Math.max(-10,Math.min(100,(Number(piece.y)||0)/sh*100));
      const width=Math.max(8,Math.min(70,(Number(piece.w)||90)/sw*100));
      const height=Math.max(8,Math.min(70,(Number(piece.h)||90)/sh*100));
      const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${Number(piece.z)||1};transform:rotate(${Number(piece.rotation)||0}deg)`;
      return `<span class="portfolio-shape shape-studio-mini" style="${style}">${funSvgMarkup(piece)}</span>`;
    };
  }

  const previousRenderSnapshotPiece=window.renderSnapshotPiece;
  if(typeof previousRenderSnapshotPiece==='function'){
    window.renderSnapshotPiece=function(piece,sourceW,sourceH){
      if(!isFun(piece))return previousRenderSnapshotPiece.apply(this,arguments);
      const sw=Number(sourceW)||390,sh=Number(sourceH)||420;
      const left=(Number(piece.x)||0)/sw*100,top=(Number(piece.y)||0)/sh*100;
      const width=(Number(piece.w)||90)/sw*100,height=(Number(piece.h)||90)/sh*100;
      const style=`left:${left}%;top:${top}%;width:${width}%;height:${height}%;z-index:${Number(piece.z)||1};transform:rotate(${Number(piece.rotation)||0}deg)`;
      return `<span class="snapshot-piece portfolio-shape shape-studio-mini" style="${style}">${funSvgMarkup(piece)}</span>`;
    };
  }

  function installFunRow(){
    const studio=document.getElementById('shapeStudioV132201');
    if(!studio||document.getElementById('shapeFunRowV132204'))return;
    const basic=studio.querySelector('.shape-studio-section');
    if(!basic)return;

    const section=document.createElement('div');
    section.className='shape-studio-section shape-fun-section';
    section.innerHTML='<span class="shape-studio-label">Fun</span><div class="shape-fun-row" id="shapeFunRowV132204" role="group" aria-label="Fun shapes"></div>';
    basic.insertAdjacentElement('afterend',section);

    const row=section.querySelector('.shape-fun-row');
    FUN_SHAPES.forEach(def=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='shape-picker-btn shape-fun-btn';
      btn.dataset.funShape=def.id;
      btn.title=def.label;
      btn.setAttribute('aria-label','Add '+def.label);
      btn.innerHTML=`<span class="shape-picker-icon">${funSvgMarkup({kind:'shape',shapeType:def.id,shapeStyle:defaultStyle(def.id)},{preview:true})}</span><small>${esc(def.short)}</small>`;
      btn.addEventListener('click',e=>{e.preventDefault();addFunShape(def.id)});
      row.appendChild(btn);
    });
  }

  function installStyles(){
    if(document.getElementById('shapeStudioStylesV132204'))return;
    const style=document.createElement('style');
    style.id='shapeStudioStylesV132204';
    style.textContent=`
      .screen[data-screen="outfits"] .shape-fun-row{display:grid;grid-template-columns:repeat(7,minmax(38px,1fr));gap:5px;align-items:stretch}
      .screen[data-screen="outfits"] .shape-fun-btn .shape-picker-icon{width:30px;height:30px}
      .screen[data-screen="outfits"] .shape-fun-btn[data-fun-shape="tape"] .shape-picker-icon{width:34px;height:24px}
      .screen[data-screen="outfits"] .shape-fun-btn[data-fun-shape="caption"] .shape-picker-icon,.screen[data-screen="outfits"] .shape-fun-btn[data-fun-shape="thoughtBubble"] .shape-picker-icon{width:34px;height:28px}
      .screen[data-screen="outfits"] .shape-fun-btn[data-fun-shape="questionMark"] .shape-picker-icon,.screen[data-screen="outfits"] .shape-fun-btn[data-fun-shape="exclamationPoint"] .shape-picker-icon{width:24px;height:30px}
      @media(max-width:390px){.screen[data-screen="outfits"] .shape-fun-row{gap:3px}}
    `;
    document.head.appendChild(style);
  }

  installStyles();
  installFunRow();
  setTimeout(installFunRow,200);
  setTimeout(installFunRow,700);

  window.__audreyShapeStudioV132204={funShapes:FUN_SHAPES.map(x=>({...x})),funSvgMarkup,addFunShape};
})();
