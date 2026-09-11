/* Audrey Closet v13.22 share export compatibility dev6
 * Export current creative objects without changing saved Board/Portfolio data.
 *
 * dev6:
 * - preserves drawing strokeColor, strokeWidth, opacity and dotted style in Share
 * - uses SVG-backed temporary image pieces for drawings and shapes
 * - marks temporary creative pieces as shareDecoration and filters them from
 *   "Items in this look" while still allowing the board image renderer to draw them
 * - keeps pencil/pen visual distinction in exported images
 * - retains shape geometry + fixed-pattern canvas alignment
 */
(function(){
  'use strict';

  let installed=false;
  let canvasPainterInstalled=false;

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d;}
  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function styleAwareShapeMarkup(item){
    const styleApi=window.__audreyShapeStudioV132206;
    if(typeof styleApi?.shapeMarkup==='function')return styleApi.shapeMarkup(item);
    const funApi=window.__audreyShapeStudioV132204;
    const type=String(item?.shapeType||item?.value||'');
    if(funApi?.funShapes?.some(x=>x.id===type)&&typeof funApi.funSvgMarkup==='function')return funApi.funSvgMarkup(item);
    const basicApi=window.__audreyShapeStudioV132201;
    if(typeof basicApi?.shapeSvgMarkup==='function')return basicApi.shapeSvgMarkup(item);
    return '';
  }

  function parsePairs(value){
    return String(value||'').trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));
  }

  function drawingMarkup(item){
    const w=Math.max(1,num(item?.w,1)),h=Math.max(1,num(item?.h,1));
    const color=esc(item?.strokeColor||'#6b6b6b');
    const sw=Math.max(1,num(item?.strokeWidth,2));
    const opacity=Math.max(0,Math.min(1,num(item?.opacity,1)));
    const pts=esc(item?.points||'');
    const tool=String(item?.tool||'pencil');
    const dotted=item?.strokeStyle==='dotted';
    const dash=dotted?` stroke-dasharray="${Math.max(1,sw*.6)} ${Math.max(2,sw*2.2)}"`:'';

    if(tool==='pencil'){
      return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.7,sw*.72)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.82,opacity*.82)}" vector-effect="non-scaling-stroke"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.55,sw*.38)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.24,opacity*.24)}" transform="translate(.55 -.35)" vector-effect="non-scaling-stroke"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${Math.max(.5,sw*.3)}" stroke-linecap="butt" stroke-linejoin="round"${dash} opacity="${Math.min(.18,opacity*.18)}" transform="translate(-.45 .45)" vector-effect="non-scaling-stroke"/></svg>`;
    }

    const pairs=parsePairs(item?.points);
    const terminals=(tool==='pen'&&pairs.length)?`<circle cx="${pairs[0][0]}" cy="${pairs[0][1]}" r="${Math.max(.9,sw*.56)}" fill="${color}" opacity="${Math.min(1,opacity*.94)}"/><circle cx="${pairs[pairs.length-1][0]}" cy="${pairs[pairs.length-1][1]}" r="${Math.max(.95,sw*.6)}" fill="${color}" opacity="${Math.min(1,opacity*.96)}"/>`:'';
    let arrow='';
    if(tool==='arrow'&&pairs.length>=2){
      const a=pairs[pairs.length-2],b=pairs[pairs.length-1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,px=-uy,py=ux,size=Math.max(9,sw*3.2),bx=b[0]-ux*size,by=b[1]-uy*size,half=size*.5;
      arrow=`<polyline points="${b[0]},${b[1]} ${bx+px*half},${by+py*half} ${b[0]},${b[1]} ${bx-px*half},${by-py*half}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" vector-effect="non-scaling-stroke"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash} opacity="${opacity}" vector-effect="non-scaling-stroke"/>${terminals}${arrow}</svg>`;
  }

  function svgDataUrl(markup,item){
    if(!markup)return '';
    const w=Math.max(1,num(item?.w,100)),h=Math.max(1,num(item?.h,100));
    const svg=markup.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" ');
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  function makeTempImagePiece(item,tempItems,markup,label){
    const photo=svgDataUrl(markup,item);if(!photo)return null;
    const tempId='share-'+String(label||'creative')+'-'+String(item.uid||Math.random().toString(36).slice(2));
    tempItems.push({id:tempId,name:label||'Creative',type:label||'Creative',category:'Misc',photo});
    return {...clone(item),kind:'piece',source:'shareDecoration',id:tempId};
  }

  function transformPieces(source,tempItems){
    const out=[];
    for(const raw of source||[]){
      const item=clone(raw);
      if(item.kind==='shape'){
        const converted=makeTempImagePiece(item,tempItems,styleAwareShapeMarkup(item),'Shape');
        out.push(converted||item);
      }else if(item.kind==='drawing'){
        const converted=makeTempImagePiece(item,tempItems,drawingMarkup(item),'Drawing');
        if(converted)out.push(converted);
      }else out.push(item);
    }
    return out;
  }

  function normalizedCanvas(value){
    if(typeof value==='string')return {id:value||'default',color:''};
    if(value&&typeof value==='object')return {id:value.id||'default',color:value.color||''};
    return {id:'default',color:''};
  }

  function paintFixedPattern(ctx,x,y,w,h,value,originalPainter){
    const v=normalizedCanvas(value),id=v.id;
    if(!['checker','gingham','plaid','tic-tac-toe'].includes(id))return originalPainter(ctx,x,y,w,h,value);
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    if(id==='checker'){
      ctx.fillStyle='#efe7d8';ctx.fillRect(x,y,w,h);const cell=14;ctx.fillStyle='rgba(74,67,60,.20)';let row=0;for(let yy=y;yy<y+h;yy+=cell,row++)for(let xx=x+(row%2?cell:0);xx<x+w;xx+=cell*2)ctx.fillRect(xx,yy,cell,cell);
    }else if(id==='gingham'){
      ctx.fillStyle='#f6eee0';ctx.fillRect(x,y,w,h);const tile=22,band=11;ctx.fillStyle='rgba(125,70,83,.14)';for(let xx=x;xx<x+w;xx+=tile)ctx.fillRect(xx,y,band,h);for(let yy=y;yy<y+h;yy+=tile)ctx.fillRect(x,yy,w,band);
    }else if(id==='plaid'){
      ctx.fillStyle='#d8c8a7';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(91,70,53,.15)';for(let yy=y+13;yy<y+h;yy+=31)ctx.fillRect(x,yy,w,4);for(let xx=x+15;xx<x+w;xx+=34)ctx.fillRect(xx,y,4,h);ctx.fillStyle='rgba(125,53,71,.11)';for(let yy=y+27;yy<y+h;yy+=31)ctx.fillRect(x,yy,w,4);for(let xx=x+30;xx<x+w;xx+=34)ctx.fillRect(xx,y,4,h);
    }else if(id==='tic-tac-toe'){
      ctx.fillStyle='#f4eddc';ctx.fillRect(x,y,w,h);const tile=76;ctx.fillStyle='rgba(109,120,99,.15)';for(let tx=x;tx<x+w;tx+=tile){ctx.fillRect(tx+tile*.32,y,Math.max(1,tile*.02),h);ctx.fillRect(tx+tile*.65,y,Math.max(1,tile*.02),h);}for(let ty=y;ty<y+h;ty+=tile){ctx.fillRect(x,ty+tile*.32,w,Math.max(1,tile*.02));ctx.fillRect(x,ty+tile*.65,w,Math.max(1,tile*.02));}
    }
    ctx.restore();
  }

  function installCanvasPainter(){
    if(canvasPainterInstalled||typeof window.__audreyPaintBoardCanvasV1320!=='function')return;
    const original=window.__audreyPaintBoardCanvasV1320;
    window.__audreyPaintBoardCanvasV1320=function(ctx,x,y,w,h,value){return paintFixedPattern(ctx,x,y,w,h,value,original);};
    canvasPainterInstalled=true;
  }

  function install(){
    if(installed||typeof makeOutfitShareBlob!=='function')return false;
    installCanvasPainter();
    const original=makeOutfitShareBlob;
    makeOutfitShareBlob=async function(options={}){
      const sourceOutfit=options?.outfit?clone(options.outfit):null;
      const board=document.getElementById('outfitBoard');
      const livePieces=typeof boardItems!=='undefined'?boardItems:[];
      const tempItems=[];
      const transformed=transformPieces(sourceOutfit?.pieces||livePieces,tempItems);
      const synthetic=sourceOutfit||{name:document.getElementById('outfitName')?.value?.trim()||'My outfit',notes:document.getElementById('outfitNotes')?.value?.trim()||'',boardWidth:board?.clientWidth||390,boardHeight:board?.clientHeight||420};
      synthetic.pieces=transformed;
      const originalLength=Array.isArray(state?.items)?state.items.length:0;
      const originalDetails=typeof portfolioItemDetails==='function'?portfolioItemDetails:null;
      try{
        if(Array.isArray(state?.items)&&tempItems.length)state.items.push(...tempItems);
        if(originalDetails){
          portfolioItemDetails=function(outfit){return originalDetails(outfit).filter(row=>row?.source!=='shareDecoration');};
        }
        return await original({...options,outfit:synthetic});
      }finally{
        if(originalDetails)portfolioItemDetails=originalDetails;
        if(Array.isArray(state?.items)&&state.items.length>originalLength)state.items.splice(originalLength);
      }
    };
    window.AUDREY_SHARE_EXPORT_COMPAT_V6={transformPieces,styleAwareShapeMarkup,drawingMarkup,paintFixedPattern};
    installed=true;return true;
  }

  function start(){installCanvasPainter();if(install())return;let tries=0;const timer=setInterval(()=>{tries++;installCanvasPainter();if(install()||tries>40)clearInterval(timer);},50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
