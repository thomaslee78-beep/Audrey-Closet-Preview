/* Audrey Closet v13.21-dev12 — flattened saved-look Share renderer */
(function(){
  'use strict';

  if(!document.querySelector('script[data-audrey-models]')){
    const modelScript=document.createElement('script');
    modelScript.src='models-v13.22-dev1.js?v=13.22-models-dev1';
    modelScript.dataset.audreyModels='1';
    document.head.appendChild(modelScript);
  }

  async function waitForFontsV132112(){
    try{if(document.fonts&&document.fonts.ready)await document.fonts.ready}catch{}
  }

  function savedOutfitForShareV132112(outfit){
    if(outfit&&outfit.id)return outfit;
    if(pendingShareOutfitId)return state.outfits.find(x=>x.id===pendingShareOutfitId)||null;
    return null;
  }

  function paintFallbackBoardV132112(ctx,w,h){
    ctx.fillStyle='#efe9d9';
    ctx.fillRect(0,0,w,h);
    ctx.save();
    ctx.strokeStyle='rgba(108,81,66,.10)';
    ctx.lineWidth=1;
    const grid=24;
    for(let x=0;x<=w;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
    for(let y=0;y<=h;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.restore();
  }

  function paintModelV1322(ctx,type,w,h){
    const sx=w/120,sy=h/(type==='child'?240:type==='alien'?290:280),ink='#554b43',fill='#e7decc';
    ctx.save();ctx.scale(sx,sy);ctx.strokeStyle=ink;ctx.fillStyle=fill;ctx.lineWidth=2.4/Math.max(.1,Math.min(sx,sy));ctx.lineCap='round';ctx.lineJoin='round';
    const ellipse=(x,y,rx,ry)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke()};
    const limb=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
    if(type==='child'){
      ellipse(60,27,19,19);ctx.beginPath();ctx.moveTo(43,51);ctx.quadraticCurveTo(60,45,77,51);ctx.lineTo(80,112);ctx.quadraticCurveTo(72,126,70,141);ctx.lineTo(75,218);ctx.quadraticCurveTo(68,226,61,218);ctx.lineTo(59,148);ctx.lineTo(56,218);ctx.quadraticCurveTo(49,226,42,218);ctx.lineTo(48,141);ctx.quadraticCurveTo(47,126,40,112);ctx.closePath();ctx.fill();ctx.stroke();limb(42,63,23,130);limb(78,63,97,130);
    }else if(type==='alien'){
      ctx.beginPath();ctx.moveTo(60,4);ctx.quadraticCurveTo(92,7,88,39);ctx.quadraticCurveTo(84,67,60,72);ctx.quadraticCurveTo(36,67,32,39);ctx.quadraticCurveTo(28,7,60,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=ink;ellipse(50,31,5,9);ellipse(70,31,5,9);ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(45,75);ctx.quadraticCurveTo(60,68,75,75);ctx.lineTo(79,138);ctx.quadraticCurveTo(71,151,69,166);ctx.lineTo(75,269);ctx.quadraticCurveTo(68,279,61,269);ctx.lineTo(59,178);ctx.lineTo(56,269);ctx.quadraticCurveTo(49,279,42,269);ctx.lineTo(49,166);ctx.quadraticCurveTo(46,151,41,138);ctx.closePath();ctx.fill();ctx.stroke();limb(42,86,16,166);limb(78,86,104,166);
    }else{
      if(type==='cat'){
        ctx.beginPath();ctx.moveTo(43,17);ctx.lineTo(48,3);ctx.lineTo(57,15);ctx.quadraticCurveTo(60,14,63,15);ctx.lineTo(72,3);ctx.lineTo(77,18);ctx.quadraticCurveTo(83,26,79,38);ctx.quadraticCurveTo(73,49,60,49);ctx.quadraticCurveTo(47,49,41,38);ctx.quadraticCurveTo(37,27,43,17);ctx.closePath();ctx.fill();ctx.stroke();
      }else ellipse(60,27,19,22);
      const woman=type==='woman';ctx.beginPath();ctx.moveTo(woman?43:40,54);ctx.quadraticCurveTo(60,woman?45:46,woman?77:80,54);ctx.lineTo(woman?85:84,woman?113:121);ctx.quadraticCurveTo(woman?75:75,woman?132:135,woman?73:72,151);ctx.lineTo(woman?80:79,259);ctx.quadraticCurveTo(woman?72:71,270,woman?64:64,259);ctx.lineTo(woman?59:60,164);ctx.lineTo(woman?55:56,259);ctx.quadraticCurveTo(woman?47:48,270,woman?39:40,259);ctx.lineTo(47,151);ctx.quadraticCurveTo(woman?45:45,woman?132:135,woman?35:36,woman?113:121);ctx.closePath();ctx.fill();ctx.stroke();limb(woman?39:39,woman?67:66,woman?19:17,woman?142:145);limb(woman?81:81,woman?67:66,woman?101:103,woman?142:145);if(type==='cat'){ctx.beginPath();ctx.moveTo(77,119);ctx.quadraticCurveTo(108,131,96,175);ctx.quadraticCurveTo(91,191,103,202);ctx.stroke()}
    }
    ctx.restore();
  }

  async function renderSavedBoardToCanvasV132112(outfit){
    if(!outfit)throw new Error('saved outfit required');
    await waitForFontsV132112();

    const sourceW=Math.max(1,Math.round(Number(outfit.boardWidth)||390));
    const sourceH=Math.max(1,Math.round(Number(outfit.boardHeight)||420));
    const canvas=document.createElement('canvas');
    canvas.width=sourceW;
    canvas.height=sourceH;
    const ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';

    if(typeof window.__audreyPaintBoardCanvasV1320==='function'){
      window.__audreyPaintBoardCanvasV1320(ctx,0,0,sourceW,sourceH,outfit.canvasBackground||{id:'default'});
    }else{
      paintFallbackBoardV132112(ctx,sourceW,sourceH);
    }

    const pieces=(outfit.pieces||[]).map(x=>normalizeBoardItem({...x})).sort((a,b)=>(Number(a.z)||0)-(Number(b.z)||0));
    for(const b of pieces){
      const w=Math.max(1,Number(b.w)||1),h=Math.max(1,Number(b.h)||1);
      const cx=(Number(b.x)||0)+w/2,cy=(Number(b.y)||0)+h/2;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate((Number(b.rotation)||0)*Math.PI/180);
      ctx.translate(-w/2,-h/2);

      if(b.kind==='piece'){
        const obj=(b.source==='wishlist'?state.wishlist:state.items).find(o=>o.id===b.id);
        if(obj?.photo){
          try{
            const img=await imageFromSrc(obj.photo);
            const ar=(img.naturalWidth||img.width)/(img.naturalHeight||img.height||1),box=w/h;
            let dw=w,dh=h,dx=0,dy=0;
            if(ar>box){dh=w/ar;dy=(h-dh)/2}else{dw=h*ar;dx=(w-dw)/2}
            ctx.drawImage(img,dx,dy,dw,dh);
          }catch{}
        }else if(obj){
          ctx.fillStyle='#6c5142';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='18px Georgia';
          ctx.fillText(obj.name||displayItemType(obj)||'piece',w/2,h/2,w*.9);
        }
      }else if(b.kind==='model'){
        paintModelV1322(ctx,b.value||'man',w,h);
      }else if(b.kind==='text'){
        if(typeof window.__audreyDrawBoardTextV132011==='function')window.__audreyDrawBoardTextV132011(ctx,b,w,h,1);
        else{ctx.fillStyle='#7d3547';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='28px Georgia';ctx.fillText(b.value||'',w/2,h/2,w*.94)}
      }else if(b.kind==='sticker'){
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111';ctx.font='58px "Apple Color Emoji","Segoe UI Emoji",system-ui';
        ctx.fillText(typeof shareStickerText==='function'?shareStickerText(b.value):String(b.value||'✨'),w/2,h/2,w);
      }else if(b.kind==='shape'){
        if(b.value==='circle'){
          ctx.strokeStyle='#4d8e8a';ctx.fillStyle='rgba(77,142,138,.08)';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(w/2,h/2,Math.max(2,w/2-7),Math.max(2,h/2-7),0,0,Math.PI*2);ctx.fill();ctx.stroke();
        }else if(b.value==='line'){
          ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-4*Math.PI/180);ctx.fillStyle='#7d3547';roundRectPath(ctx,-w/2,-4,w,8,4);ctx.fill();ctx.restore();
        }else if(b.value==='tape'){
          ctx.fillStyle='rgba(198,163,78,.42)';ctx.fillRect(0,h*.08,w,h*.84);
        }
      }else if(b.kind==='doodle'){
        const pts=parseDoodlePoints(b.points||'');
        if(pts.length){ctx.strokeStyle='#6c5142';ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.stroke()}
      }
      ctx.restore();
    }
    return canvas;
  }

  async function makeFlattenedShareBlobV132112({mode='look',outfit=null}={}){
    const saved=savedOutfitForShareV132112(outfit);
    if(!saved)throw new Error('Share requires a saved look');

    const flatBoard=await renderSavedBoardToCanvasV132112(saved);
    const title=saved.name||'My outfit';
    const notes=saved.notes||'';
    const rows=portfolioItemDetails(saved);
    const includeItems=mode==='items'||mode==='itemsNotes';
    const includeNotes=mode==='itemsNotes';

    const W=1080,pad=66,header=130,footer=58,drawW=W-pad*2;
    const scale=drawW/flatBoard.width,drawH=flatBoard.height*scale;
    const maxTextW=W-pad*2;
    const detailLine=66;
    let detailsH=0,lookNoteLines=[];
    if(includeItems){
      detailsH=56+rows.length*detailLine;
      if(includeNotes){
        const ctxMeasure=document.createElement('canvas').getContext('2d');
        ctxMeasure.font='20px system-ui';
        if(notes)lookNoteLines=wrapCanvasLines(ctxMeasure,notes,maxTextW,8);
        detailsH+=notes?52+lookNoteLines.length*32:0;
      }
    }
    const H=Math.ceil(header+drawH+footer+detailsH);
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';

    ctx.fillStyle='#f7f0df';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#2e2a24';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='600 48px Georgia';ctx.fillText(title,pad,74,W-pad*2);
    ctx.fillStyle='#7d3547';ctx.font='italic 27px Georgia';ctx.fillText((state.settings?.appName||DEFAULT_APP_NAME),pad,108,W-pad*2);

    const boardTop=header;
    ctx.save();roundRectPath(ctx,pad,boardTop,drawW,drawH,42);ctx.clip();ctx.drawImage(flatBoard,pad,boardTop,drawW,drawH);ctx.restore();

    if(includeItems){
      let y=boardTop+drawH+42;
      ctx.fillStyle='#2e2a24';ctx.font='600 30px Georgia';ctx.fillText('Items in this look',pad,y);y+=30;
      for(const r of rows){
        ctx.fillStyle='#3f3931';ctx.font='600 22px system-ui';ctx.fillText(compactShareItemLabel(r),pad,y+24,maxTextW);
        ctx.fillStyle='#776c5e';ctx.font='18px system-ui';ctx.fillText([r.meta,r.archived?'Archived':'',r.source==='wishlist'?'Wishlist':''].filter(Boolean).join(' · '),pad,y+48,maxTextW);
        y+=detailLine;
        ctx.strokeStyle='rgba(108,81,66,.12)';ctx.beginPath();ctx.moveTo(pad,y+3);ctx.lineTo(W-pad,y+3);ctx.stroke();
      }
      if(includeNotes&&notes){
        y+=28;ctx.fillStyle='#2e2a24';ctx.font='600 27px Georgia';ctx.fillText('Look notes',pad,y);y+=32;
        ctx.fillStyle='#6c5142';ctx.font='20px system-ui';
        for(const line of lookNoteLines){ctx.fillText(line,pad,y,maxTextW);y+=32}
      }
    }

    return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('image export failed')),'image/jpeg',.92));
  }

  const originalRequestOutfitShareV132112=requestOutfitShare;
  requestOutfitShare=function(outfitId=null){
    if(outfitId){
      const saved=state.outfits.find(x=>x.id===outfitId);
      if(!saved)return toast('Saved look not found');
      return originalRequestOutfitShareV132112(outfitId);
    }
    if(editingOutfitId&&state.outfits.some(x=>x.id===editingOutfitId)){
      const oid=editingOutfitId;
      toast('Share from the full saved look preview');
      viewOutfit(oid);
      return;
    }
    toast('Save this look first, then share it from Portfolio');
  };

  makeOutfitShareBlob=makeFlattenedShareBlobV132112;
  window.__audreyRenderSavedBoardToCanvasV132112=renderSavedBoardToCanvasV132112;
})();
