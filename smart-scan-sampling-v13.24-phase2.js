/* Audrey Closet v13.24 — Smart Scan Phase 2
 * Alpha-aware garment sampling while preserving the existing color/pattern classifier contract.
 * Phase 4.2 raises sampling fidelity to 256x256 and retains pixel coordinates for spatial analysis.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase2-sampling2';
  const LEGACY_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;
  const SAMPLE_SIZE=256;
  const ALPHA_MIN=80;
  const TRANSPARENT_IMAGE_MIN_FRACTION=.04;

  function imageFromLocal(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}

  function sampleGarmentPixelsFromImageData(data,width,height){
    let transparentCount=0,total=width*height;
    for(let i=3;i<data.length;i+=4)if(data[i]<ALPHA_MIN)transparentCount++;
    const transparentFraction=total?transparentCount/total:0;
    const alphaAware=transparentFraction>=TRANSPARENT_IMAGE_MIN_FRACTION;
    const pixels=[],lum=[],sat=[];
    let rs=0,gs=0,bs=0;

    for(let i=0;i<data.length;i+=4){
      const a=data[i+3];
      if(a<ALPHA_MIN)continue;
      const px=i/4,x=px%width,y=Math.floor(px/width);
      const r=data[i],g=data[i+1],b=data[i+2];
      // Legacy photos often use a white photographic background, so retain the old
      // near-white exclusion only when the image has no meaningful transparency.
      // Once Photo Studio has isolated the garment, white opaque pixels are garment data.
      if(!alphaAware&&r>245&&g>245&&b>245)continue;
      rs+=r;gs+=g;bs+=b;
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
      const l=(r+g+b)/3,s=mx-mn;
      lum.push(l);sat.push(s);pixels.push({r,g,b,a,lum:l,sat:s,x,y});
    }

    return{
      version:VERSION,
      width,height,
      sampleSize:SAMPLE_SIZE,
      alphaAware,
      transparentFraction,
      totalPixels:total,
      sampledPixels:pixels.length,
      pixels,lum,sat,
      sums:{r:rs,g:gs,b:bs}
    };
  }

  async function sampleGarmentPixels(dataURL){
    const img=await imageFromLocal(dataURL),c=document.createElement('canvas');
    c.width=c.height=SAMPLE_SIZE;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.clearRect(0,0,SAMPLE_SIZE,SAMPLE_SIZE);
    ctx.drawImage(img,0,0,SAMPLE_SIZE,SAMPLE_SIZE);
    const im=ctx.getImageData(0,0,SAMPLE_SIZE,SAMPLE_SIZE);
    return sampleGarmentPixelsFromImageData(im.data,SAMPLE_SIZE,SAMPLE_SIZE);
  }

  async function analyzeImagePhase2(dataURL){
    const sample=await sampleGarmentPixels(dataURL),n=sample.sampledPixels;
    if(!n)return{color:'Multicolor',pattern:'Solid'};
    const r=sample.sums.r/n,g=sample.sums.g/n,b=sample.sums.b/n;
    const color=typeof window.nearestColor==='function'?window.nearestColor(r,g,b):'Multicolor';
    const mean=sample.lum.reduce((a,x)=>a+x,0)/sample.lum.length;
    const variance=sample.lum.reduce((a,x)=>a+(x-mean)**2,0)/sample.lum.length;
    const avgSat=sample.sat.reduce((a,x)=>a+x,0)/sample.sat.length;
    let pattern='Solid';
    if(variance>2200&&avgSat>45)pattern='Floral/Print';
    else if(variance>1500)pattern='Graphic';
    window.AUDREY_SMART_SCAN_PHASE2.lastDiagnostics={version:VERSION,sampleSize:SAMPLE_SIZE,alphaAware:sample.alphaAware,transparentFraction:sample.transparentFraction,sampledPixels:n,averageRgb:[r,g,b],variance,avgSat,color,pattern};
    return{color,pattern};
  }

  async function compareLegacy(dataURL){
    const current=await analyzeImagePhase2(dataURL);
    const legacy=LEGACY_ANALYZE?await LEGACY_ANALYZE(dataURL):null;
    const sample=await sampleGarmentPixels(dataURL);
    return{version:VERSION,current,legacy,sampling:{sampleSize:SAMPLE_SIZE,alphaAware:sample.alphaAware,transparentFraction:sample.transparentFraction,sampledPixels:sample.sampledPixels}};
  }

  window.AUDREY_SMART_SCAN_PHASE2={version:VERSION,sampleSize:SAMPLE_SIZE,legacyAnalyzeImage:LEGACY_ANALYZE,sampleGarmentPixels,sampleGarmentPixelsFromImageData,analyzeImage:analyzeImagePhase2,compareLegacy,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase2;
  console.info(`Audrey Smart Scan ${VERSION} installed: 256x256 alpha-aware sampling enabled; spatial coordinates retained.`);
})();
