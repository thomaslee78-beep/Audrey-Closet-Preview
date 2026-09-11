/* Audrey Closet v13.23.5 — shared Board text layout engine
 * One authoritative typography/layout definition for Board, Portfolio and Share.
 * Preserves explicit user line breaks; wraps only an individual explicit line
 * when it genuinely exceeds the saved text width. Never truncates by box height.
 */
(function(){
  'use strict';

  const VERSION='13.23.5-font-registry1';
  const FONTS={
    script:{label:'Signature Script',css:'"Snell Roundhand","Segoe Script","Bradley Hand",cursive'},
    editorial:{label:'Editorial Serif',css:'"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'},
    classic:{label:'Classic Serif',css:'Georgia,"Times New Roman",serif'},
    modern:{label:'Modern Sans',css:'"Avenir Next","Helvetica Neue",Arial,sans-serif'},
    thin:{label:'Modern Thin',css:'"Avenir Next Ultra Light","Avenir Next","Helvetica Neue",Arial,sans-serif',weight:300},
    rounded:{label:'Soft Rounded',css:'"Avenir Next Rounded","Trebuchet MS",Arial,sans-serif'},
    handwritten:{label:'Pencil / Handwritten',css:'"Bradley Hand","Noteworthy","Marker Felt",cursive'},
    typewriter:{label:'Typewriter',css:'Menlo,"Courier New",monospace'},
    clean:{label:'Clean System',css:'-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif'},
    fun:{label:'Fun / Chalk',css:'"Chalkboard SE","Comic Sans MS","Marker Felt",cursive'}
  };
  const FONT_ALIASES={
    'modern-thin':'thin',modernthin:'thin',
    'soft-rounded':'rounded',softrounded:'rounded',
    pencil:'handwritten','pencil-handwritten':'handwritten',
    'fun-chalk':'fun',chalk:'fun',
    mono:'typewriter'
  };
  const SIZES={
    small:{label:'S',px:20,lineHeight:1.12},
    medium:{label:'M',px:28,lineHeight:1.12},
    large:{label:'L',px:38,lineHeight:1.12},
    xlarge:{label:'XL',px:50,lineHeight:1.12}
  };

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function normalizeStyle(style){
    const s=style&&typeof style==='object'?style:{};
    const requested=String(s.font||'').trim();
    const font=FONTS[requested]?requested:(FONT_ALIASES[requested.toLowerCase()]||'script');
    const color=/^#[0-9a-f]{6}$/i.test(String(s.color||''))?String(s.color).toLowerCase():'#7d3547';
    const align=['left','center','right'].includes(s.align)?s.align:'center';
    return{font,size:SIZES[s.size]?s.size:'medium',bold:!!s.bold,italic:!!s.italic,underline:!!s.underline,color,align};
  }
  function resolveFont(style){const s=normalizeStyle(style);return FONTS[s.font];}
  function resolveSize(style,scale=1){const s=normalizeStyle(style),base=SIZES[s.size];return{...base,px:base.px*Math.max(.15,Number(scale)||1)};}
  function canvasFont(style,px){const s=normalizeStyle(style),f=FONTS[s.font];return `${s.italic?'italic ':''}${s.bold?700:(f.weight||400)} ${Math.max(7,px)}px ${f.css}`;}

  function splitLongToken(ctx,token,maxWidth){
    const out=[];let chunk='';
    for(const ch of String(token||'')){
      const test=chunk+ch;
      if(chunk&&ctx.measureText(test).width>maxWidth){out.push(chunk);chunk=ch}else chunk=test;
    }
    if(chunk)out.push(chunk);
    return out.length?out:[''];
  }
  function wrapExplicitLine(ctx,line,maxWidth){
    line=String(line??'');
    if(line==='')return[''];
    if(ctx.measureText(line).width<=maxWidth)return[line];
    const words=line.trim().split(/\s+/).filter(Boolean),lines=[];let current='';
    for(const word of words){
      if(ctx.measureText(word).width>maxWidth){
        if(current){lines.push(current);current='';}
        const chunks=splitLongToken(ctx,word,maxWidth);
        lines.push(...chunks.slice(0,-1));current=chunks[chunks.length-1]||'';continue;
      }
      const test=current?current+' '+word:word;
      if(current&&ctx.measureText(test).width>maxWidth){lines.push(current);current=word}else current=test;
    }
    if(current)lines.push(current);
    return lines.length?lines:[''];
  }
  function layout(ctx,piece,width,scale=1){
    const style=normalizeStyle(piece?.textStyle),size=resolveSize(style,scale),fontSize=size.px,lineHeight=fontSize*size.lineHeight;
    const boxWidth=Math.max(1,Number(width)||Number(piece?.w)||220),pad=boxWidth*.03,maxWidth=boxWidth*.94;
    ctx.save();ctx.font=canvasFont(style,fontSize);
    const explicit=String(piece?.value||'').replace(/\r\n?/g,'\n').split('\n');
    const lines=[];explicit.forEach(line=>lines.push(...wrapExplicitLine(ctx,line,maxWidth)));
    const measured=lines.map(line=>ctx.measureText(line).width);ctx.restore();
    return{version:VERSION,style,font:FONTS[style.font],sizeKey:style.size,fontSize,lineHeight,pad,maxWidth,lines:lines.length?lines:[''],lineWidths:measured,contentHeight:Math.max(lineHeight,(lines.length||1)*lineHeight)};
  }
  function drawCanvas(ctx,piece,w,h,scale=1){
    const l=layout(ctx,piece,w,scale),s=l.style;
    const x=s.align==='left'?l.pad:(s.align==='right'?w-l.pad:w/2),centerY=h/2,start=centerY-(l.lines.length-1)*l.lineHeight/2;
    ctx.save();ctx.fillStyle=s.color;ctx.textAlign=s.align;ctx.textBaseline='middle';ctx.font=canvasFont(s,l.fontSize);
    l.lines.forEach((line,i)=>{
      const y=start+i*l.lineHeight;
      ctx.fillText(line,x,y,l.maxWidth);
      if(s.underline&&line){
        const ww=Math.min(l.maxWidth,ctx.measureText(line).width);let x1=x-ww/2,x2=x+ww/2;
        if(s.align==='left'){x1=x;x2=x+ww}else if(s.align==='right'){x1=x-ww;x2=x}
        ctx.save();ctx.strokeStyle=s.color;ctx.lineWidth=Math.max(1,l.fontSize*.055);ctx.beginPath();ctx.moveTo(x1,y+l.fontSize*.48);ctx.lineTo(x2,y+l.fontSize*.48);ctx.stroke();ctx.restore();
      }
    });ctx.restore();return l;
  }
  function css(style,scale=1){
    const s=normalizeStyle(style),f=FONTS[s.font],z=resolveSize(s,scale);
    return{fontFamily:f.css,fontSize:z.px+'px',fontWeight:String(s.bold?700:(f.weight||400)),fontStyle:s.italic?'italic':'normal',textDecoration:s.underline?'underline':'none',color:s.color,textAlign:s.align,justifyContent:s.align==='left'?'flex-start':(s.align==='right'?'flex-end':'center'),lineHeight:String(z.lineHeight),whiteSpace:'pre-wrap',overflow:'visible',overflowWrap:'break-word',wordBreak:'normal'};
  }
  function textMarkup(piece){
    const c=css(piece?.textStyle),style=`font-family:${c.fontFamily};font-size:${c.fontSize};font-weight:${c.fontWeight};font-style:${c.fontStyle};text-decoration:${c.textDecoration};color:${c.color};text-align:${c.textAlign};justify-content:${c.justifyContent};line-height:${c.lineHeight};white-space:pre-wrap;overflow:visible;overflow-wrap:break-word;word-break:normal`;
    return `<div class="board-text board-text-shared-v13235" style="${style}">${esc(piece?.value||'')}</div>`;
  }

  function installBoardRenderer(){
    if(window.__audreyBoardTextLayoutBoardWrappedV13235||typeof boardItemContent!=='function')return false;
    const previous=boardItemContent;
    boardItemContent=function(piece){if(piece?.kind==='text')return textMarkup(piece);return previous.apply(this,arguments);};
    window.__audreyBoardTextLayoutBoardWrappedV13235=true;return true;
  }
  function installSnapshotStyling(){
    if(window.__audreyBoardTextLayoutSnapshotWrappedV13235||typeof renderSnapshotPiece!=='function')return false;
    const previous=renderSnapshotPiece;
    renderSnapshotPiece=function(board,piece,scaleX,scaleY,offsetX=0,offsetY=0){
      const before=board?.children?.length||0,result=previous.apply(this,arguments);
      if(piece?.kind==='text'&&board){const el=board.children[before]||board.lastElementChild,t=el?.querySelector?.('.board-text');if(t)Object.assign(t.style,css(piece.textStyle,Math.min(scaleX||1,scaleY||1)));}
      return result;
    };
    window.__audreyBoardTextLayoutSnapshotWrappedV13235=true;return true;
  }
  function install(){
    window.AUDREY_BOARD_TEXT_LAYOUT_V13235={version:VERSION,fonts:FONTS,fontAliases:FONT_ALIASES,sizes:SIZES,normalizeStyle,resolveFont,resolveSize,canvasFont,wrapExplicitLine,layout,drawCanvas,css,textMarkup};
    // Make the legacy Canvas entry point authoritative through the new shared engine.
    window.__audreyDrawBoardTextV132011=function(ctx,piece,w,h,scale){return drawCanvas(ctx,piece,w,h,scale||1);};
    installBoardRenderer();installSnapshotStyling();
    const style=document.createElement('style');style.id='boardTextLayoutV13235Styles';style.textContent='.board-text-shared-v13235{width:100%;height:100%;display:flex;align-items:center;box-sizing:border-box;padding:3%;}';if(!document.getElementById(style.id))document.head.appendChild(style);
    try{if(typeof drawBoard==='function')drawBoard();if(typeof renderSavedOutfits==='function')renderSavedOutfits();}catch(e){console.warn('Text Layout v13.23.5 font registry refresh skipped',e)}
    return true;
  }
  function start(){let tries=0;const attempt=()=>{tries++;if(typeof boardItemContent==='function'&&typeof renderSnapshotPiece==='function'){install();return true}return false};if(attempt())return;const timer=setInterval(()=>{if(attempt()||tries>40)clearInterval(timer)},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
