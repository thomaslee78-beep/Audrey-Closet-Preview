/* Audrey Closet v13.24 — Smart Scan Phase 6
 * Category Detection v1 layered after Phase 5.1.
 * Suggests one existing catalog category: Tops, Bottoms, Dresses, Outerwear,
 * Shoes, Accessories, or Misc. Suggestions remain reviewable before apply.
 * Existing color (Phase 4.2), pattern (Phase 5.1), OCR brand and size behavior are preserved.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase6-category1';
  const VISUAL_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;
  const SIZE=160;
  const CATEGORIES=['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc'];

  if(!VISUAL_ANALYZE){
    console.warn('Audrey Smart Scan Phase 6 skipped: visual analyzer unavailable.');
    return;
  }

  function imageFromLocal(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function colorDistance(r,g,b,c){const dr=r-c[0],dg=g-c[1],db=b-c[2];return Math.sqrt(dr*dr+dg*dg+db*db)}
  function median(arr){if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}

  function borderModel(data,w,h){
    const rs=[],gs=[],bs=[];
    const push=(x,y)=>{const i=(y*w+x)*4;if(data[i+3]<80)return;rs.push(data[i]);gs.push(data[i+1]);bs.push(data[i+2])};
    const band=Math.max(2,Math.round(Math.min(w,h)*.035));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<band||x>=w-band||y<band||y>=h-band)push(x,y);
    return[median(rs),median(gs),median(bs)];
  }

  function keepLargeComponents(mask,w,h,minShare=.006){
    const seen=new Uint8Array(mask.length),parts=[];
    for(let i=0;i<mask.length;i++){
      if(!mask[i]||seen[i])continue;const stack=[i],cells=[];seen[i]=1;
      while(stack.length){const q=stack.pop(),x=q%w,y=(q/w)|0;cells.push(q);for(const n of [q-1,q+1,q-w,q+w]){if(n<0||n>=mask.length||seen[n]||!mask[n])continue;const nx=n%w,ny=(n/w)|0;if(Math.abs(nx-x)+Math.abs(ny-y)!==1)continue;seen[n]=1;stack.push(n)}}
      parts.push(cells);
    }
    parts.sort((a,b)=>b.length-a.length);const min=Math.max(8,w*h*minShare),out=new Uint8Array(mask.length);for(const part of parts)if(part.length>=min)for(const q of part)out[q]=1;
    return{mask:out,parts:parts.filter(p=>p.length>=min)};
  }

  function buildForegroundMask(data,w,h){
    let transparent=0,total=w*h;for(let i=3;i<data.length;i+=4)if(data[i]<80)transparent++;
    const alphaAware=transparent/total>=.04,raw=new Uint8Array(total);
    if(alphaAware){for(let p=0;p<total;p++)raw[p]=data[p*4+3]>=80?1:0}
    else{
      const bg=borderModel(data,w,h),distances=[];
      for(let p=0;p<total;p+=13){const i=p*4;if(data[i+3]>=80)distances.push(colorDistance(data[i],data[i+1],data[i+2],bg))}
      const threshold=clamp(median(distances)*1.35+18,24,62);
      for(let p=0;p<total;p++){const i=p*4;if(data[i+3]<80)continue;raw[p]=colorDistance(data[i],data[i+1],data[i+2],bg)>=threshold?1:0}
    }
    const kept=keepLargeComponents(raw,w,h,alphaAware?.0025:.006);
    return{...kept,alphaAware,transparentFraction:transparent/total};
  }

  function bboxForMask(mask,w,h){
    let minX=w,maxX=-1,minY=h,maxY=-1,count=0;
    for(let p=0;p<mask.length;p++)if(mask[p]){const x=p%w,y=(p/w)|0;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++}
    if(maxX<minX)return null;return{minX,maxX,minY,maxY,width:maxX-minX+1,height:maxY-minY+1,count};
  }

  function rowWidth(mask,w,bbox,yNorm){
    const y=clamp(Math.round(bbox.minY+yNorm*(bbox.height-1)),bbox.minY,bbox.maxY);let min=w,max=-1,count=0;
    for(let x=bbox.minX;x<=bbox.maxX;x++)if(mask[y*w+x]){min=Math.min(min,x);max=Math.max(max,x);count++}
    return{width:max>=min?max-min+1:0,fill:bbox.width?count/bbox.width:0};
  }

  function bandWidth(mask,w,bbox,a,b){
    const values=[];for(let n=a;n<=b;n+=.035){const r=rowWidth(mask,w,bbox,n);if(r.width)values.push(r.width)}return values.length?median(values):0;
  }

  function centerGapFeatures(mask,w,bbox){
    let splitRows=0,rows=0;
    const center=Math.round((bbox.minX+bbox.maxX)/2),half=Math.max(1,Math.round(bbox.width*.075));
    for(let yn=.62;yn<=.96;yn+=.035){const y=Math.round(bbox.minY+yn*(bbox.height-1));let centerOn=0,left=0,right=0;
      for(let x=center-half;x<=center+half;x++)if(x>=0&&x<w&&mask[y*w+x])centerOn++;
      for(let x=bbox.minX;x<center-half;x++)if(mask[y*w+x])left++;
      for(let x=center+half+1;x<=bbox.maxX;x++)if(mask[y*w+x])right++;
      rows++;if(centerOn<=Math.max(1,half*.35)&&left>=bbox.width*.08&&right>=bbox.width*.08)splitRows++;
    }
    return{splitShare:rows?splitRows/rows:0};
  }

  function componentGeometry(parts,w,h){
    const geoms=parts.map(part=>{let minX=w,maxX=0,minY=h,maxY=0;for(const p of part){const x=p%w,y=(p/w)|0;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}return{size:part.length,minX,maxX,minY,maxY,width:maxX-minX+1,height:maxY-minY+1,cx:(minX+maxX)/2,cy:(minY+maxY)/2}}).sort((a,b)=>b.size-a.size);
    return geoms;
  }

  function silhouetteFeatures(maskInfo,w,h){
    const bbox=bboxForMask(maskInfo.mask,w,h);if(!bbox)return null;
    const shoulder=bandWidth(maskInfo.mask,w,bbox,.12,.30),middle=bandWidth(maskInfo.mask,w,bbox,.40,.62),bottom=bandWidth(maskInfo.mask,w,bbox,.76,.96),top=bandWidth(maskInfo.mask,w,bbox,.02,.12);
    const aspect=bbox.height/Math.max(1,bbox.width),fill=bbox.count/(bbox.width*bbox.height),gap=centerGapFeatures(maskInfo.mask,w,bbox),components=componentGeometry(maskInfo.parts,w,h);
    const shoulderRatio=shoulder/Math.max(1,middle),bottomRatio=bottom/Math.max(1,middle),topRatio=top/Math.max(1,middle);
    let pairScore=0;if(components.length>=2){const a=components[0],b=components[1],sizeRatio=Math.min(a.size,b.size)/Math.max(a.size,b.size),heightRatio=Math.min(a.height,b.height)/Math.max(a.height,b.height),horizontalSeparation=Math.abs(a.cx-b.cx)/Math.max(1,bbox.width),verticalAlignment=1-Math.min(1,Math.abs(a.cy-b.cy)/Math.max(1,bbox.height));pairScore=sizeRatio*.35+heightRatio*.25+horizontalSeparation*.20+verticalAlignment*.20}
    return{bbox,aspect,fill,shoulder,middle,bottom,top,shoulderRatio,bottomRatio,topRatio,splitShare:gap.splitShare,components,pairScore,alphaAware:maskInfo.alphaAware};
  }

  function scoreCategories(f){
    const scores={Tops:0,Bottoms:0,Dresses:0,Outerwear:0,Shoes:0,Accessories:0,Misc:.12};
    const {aspect,fill,shoulderRatio,bottomRatio,splitShare,components,pairScore}=f;

    // Shoes: two similarly sized, horizontally paired objects or a very low/wide silhouette.
    if(components.length>=2&&pairScore>=.68){scores.Shoes+=.78;scores.Accessories+=.12}
    if(aspect<=.62&&fill<.62){scores.Shoes+=.48;scores.Accessories+=.26}

    // Bottoms: lower-body silhouettes commonly split into two legs; shorts/pants are narrower at top than through the legs.
    if(splitShare>=.36){scores.Bottoms+=.82}
    else if(splitShare>=.20){scores.Bottoms+=.48}
    if(aspect>=.85&&aspect<=1.65&&bottomRatio>=.82&&shoulderRatio<1.12)scores.Bottoms+=.20;

    // Dresses: continuous long silhouette with a noticeably wider lower section.
    if(aspect>=1.12&&splitShare<.14&&bottomRatio>=1.13){scores.Dresses+=.68}
    if(aspect>=1.35&&bottomRatio>=1.02&&splitShare<.12){scores.Dresses+=.26}

    // Tops: shoulder/sleeve width and a body that does not flare dramatically at the bottom.
    if(aspect>=.72&&aspect<=1.48&&shoulderRatio>=1.04&&bottomRatio<1.18){scores.Tops+=.58}
    if(aspect>=.78&&aspect<=1.32&&splitShare<.12){scores.Tops+=.22}

    // Outerwear overlaps tops; favor it only for longer, broad, relatively straight coat/jacket silhouettes.
    if(aspect>=1.08&&aspect<=1.72&&shoulderRatio>=1.03&&bottomRatio>=.86&&bottomRatio<=1.18&&splitShare<.12){scores.Outerwear+=.46}
    if(aspect>=1.30&&fill>=.42){scores.Outerwear+=.18}

    // Accessories are the conservative choice for compact/extreme shapes that do not resemble a garment body.
    if(aspect<.58||aspect>2.05){scores.Accessories+=.45}
    if(fill<.24&&splitShare<.15){scores.Accessories+=.24}
    if(components.length>2){scores.Accessories+=.12}

    return scores;
  }

  function classifyCategory(features){
    if(!features)return{category:'Misc',confidence:.18,reason:'no-silhouette'};
    const scores=scoreCategories(features),ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]),winner=ranked[0],runner=ranked[1];
    let category=winner[0],confidence=clamp(.35+winner[1]*.48+(winner[1]-runner[1])*.22,.20,.91),reason='silhouette-score';
    if(winner[1]<.34){category='Misc';confidence=.28;reason='low-category-confidence'}
    return{category,confidence,reason,scores};
  }

  async function analyzeCategory(dataURL){
    const img=await imageFromLocal(dataURL),c=document.createElement('canvas');c.width=c.height=SIZE;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,SIZE,SIZE);ctx.drawImage(img,0,0,SIZE,SIZE);const im=ctx.getImageData(0,0,SIZE,SIZE),maskInfo=buildForegroundMask(im.data,SIZE,SIZE),features=silhouetteFeatures(maskInfo,SIZE,SIZE),decision=classifyCategory(features);
    window.AUDREY_SMART_SCAN_PHASE6.lastDiagnostics={version:VERSION,category:decision.category,confidence:decision.confidence,reason:decision.reason,scores:decision.scores||{},features:features?{aspect:features.aspect,fill:features.fill,shoulderRatio:features.shoulderRatio,bottomRatio:features.bottomRatio,splitShare:features.splitShare,pairScore:features.pairScore,components:features.components.length,alphaAware:features.alphaAware}:null};
    return decision;
  }

  async function analyzeImagePhase6(dataURL){
    const visual=await VISUAL_ANALYZE(dataURL);let categoryResult={category:'',confidence:0};try{categoryResult=await analyzeCategory(dataURL)}catch(err){console.warn('Smart Scan category analysis skipped',err)}
    return{...visual,category:categoryResult.category||'',categoryConfidence:categoryResult.confidence||0};
  }

  const originalFieldLabel=window.smartScanFieldLabel;
  window.smartScanFieldLabel=function(key){if(key==='category')return'Category';return typeof originalFieldLabel==='function'?originalFieldLabel(key):key};

  window.smartScan=async function(target='item'){
    smartScanTarget=target==='wish'?'wish':'item';const photo=smartScanTarget==='wish'?wishWorkingPhoto:itemWorkingPhoto;if(!photo)return toast('Take or choose a photo first');
    if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=true});$('#wishScanStatus').textContent='Scanning category, color, pattern and visible text…'}else setPhotoBusy(true,'Scanning category, color, pattern and visible text…');
    try{
      const visual=await analyzeImagePhase6(photo);let ocr='';try{ocr=await tryOCR(photo)}catch{}const flat=ocr.replace(/\n/g,' ');
      const brands=['Nike','Adidas','Lacoste','Gap','Old Navy','Zara','H&M','Uniqlo','Levi','Levi\'s','Converse','Vans','Champion','Aritzia','Brandy Melville','Hollister','Abercrombie','American Eagle','Puma','New Balance','Patagonia','North Face'];
      const brand=brands.find(b=>new RegExp(`\\b${b.replace("'","\\'")}\\b`,'i').test(flat))||'';const sm=flat.match(/\b(XXS|XS|S|M|L|XL|XXL|[0-9]{1,2}(?:\.[05])?)\b/i);
      pendingSmartScanResult={category:CATEGORIES.includes(visual.category)?visual.category:'',color:visual.color||'',pattern:visual.pattern||'',brand,size:sm?sm[1].toUpperCase():''};
      openSmartScanReview(pendingSmartScanResult);$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan complete. Review detected details before applying.';
    }catch(err){console.error(err);toast('Smart Scan could not analyze this photo');$(smartScanTarget==='wish'?'#wishScanStatus':'#scanStatus').textContent='Smart Scan could not analyze this photo.'}
    finally{if(smartScanTarget==='wish'){['#wishSmartScanBtn','#wishPhotoMenuBtn','#saveWishBtn'].forEach(sel=>{const el=$(sel);if(el)el.disabled=false})}else setPhotoBusy(false)}
  };

  window.applyPendingSmartScan=function(){
    if(!pendingSmartScanResult)return closeSmartScanReview();const chosen=new Set($$('#smartScanReviewFields input[data-scan-field]:checked').map(x=>x.dataset.scanField)),wish=smartScanTarget==='wish';
    if(chosen.has('category')&&CATEGORIES.includes(pendingSmartScanResult.category)){
      const sel=$(wish?'#wishCategory':'#itemCategory');sel.value=pendingSmartScanResult.category;sel.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(chosen.has('color')&&pendingSmartScanResult.color)$(wish?'#wishColor':'#itemColor').value=pendingSmartScanResult.color;
    if(chosen.has('pattern')&&pendingSmartScanResult.pattern)$(wish?'#wishPattern':'#itemPattern').value=pendingSmartScanResult.pattern;
    if(chosen.has('brand')&&pendingSmartScanResult.brand)$(wish?'#wishBrand':'#itemBrand').value=pendingSmartScanResult.brand;
    if(chosen.has('size')&&pendingSmartScanResult.size){const sel=$(wish?'#wishSize':'#itemSize'),opt=[...sel.options].find(o=>o.value===pendingSmartScanResult.size||o.textContent===pendingSmartScanResult.size);if(opt)sel.value=opt.value}
    if(wish){$('#wishScanStatus').textContent='Selected Smart Scan details applied. Review them before saving.'}else{updateItemReviewSummary();$('#scanStatus').textContent='Selected Smart Scan details applied. Review them before saving.'}
    closeSmartScanReview();toast('Detected details applied');
  };

  window.AUDREY_SMART_SCAN_PHASE6={version:VERSION,categories:CATEGORIES,buildForegroundMask,silhouetteFeatures,scoreCategories,classifyCategory,analyzeCategory,visualAnalyzeImage:VISUAL_ANALYZE,analyzeImage:analyzeImagePhase6,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase6;
  console.info(`Audrey Smart Scan ${VERSION} installed: category suggestion enabled; existing color/pattern analysis preserved.`);
})();
