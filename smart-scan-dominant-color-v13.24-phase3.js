/* Audrey Closet v13.24 — Smart Scan Phase 3
 * Dominant color clustering on top of Phase 2 alpha-aware garment sampling.
 * Pattern thresholds remain unchanged so Phase 3 isolates color-selection improvements.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase3-dominant1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE2_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;
  const MAX_CLUSTERS=4;
  const ITERATIONS=6;

  if(!PHASE2?.sampleGarmentPixels){
    console.warn('Audrey Smart Scan Phase 3 skipped: Phase 2 sampler is unavailable.');
    return;
  }

  function dist2(a,b){const dr=a.r-b.r,dg=a.g-b.g,db=a.b-b.b;return dr*dr+dg*dg+db*db}
  function q(v){return Math.max(0,Math.min(255,Math.round(v/32)*32))}

  function seedCenters(pixels,k=MAX_CLUSTERS){
    const bins=new Map();
    for(const p of pixels){
      const key=`${q(p.r)},${q(p.g)},${q(p.b)}`;
      let b=bins.get(key);
      if(!b){b={count:0,r:0,g:0,b:0};bins.set(key,b)}
      b.count++;b.r+=p.r;b.g+=p.g;b.b+=p.b;
    }
    const ranked=[...bins.values()].sort((a,b)=>b.count-a.count);
    const centers=[];
    for(const bin of ranked){
      const candidate={r:bin.r/bin.count,g:bin.g/bin.count,b:bin.b/bin.count};
      if(!centers.length||centers.every(c=>dist2(candidate,c)>28*28))centers.push(candidate);
      if(centers.length>=k)break;
    }
    if(!centers.length&&pixels.length)centers.push({r:pixels[0].r,g:pixels[0].g,b:pixels[0].b});
    return centers;
  }

  function clusterPixels(pixels){
    let centers=seedCenters(pixels);
    if(!centers.length)return[];
    let assignments=new Int16Array(pixels.length);
    for(let iteration=0;iteration<ITERATIONS;iteration++){
      const sums=centers.map(()=>({count:0,r:0,g:0,b:0}));
      for(let i=0;i<pixels.length;i++){
        const p=pixels[i];let best=0,bestDist=Infinity;
        for(let c=0;c<centers.length;c++){const d=dist2(p,centers[c]);if(d<bestDist){bestDist=d;best=c}}
        assignments[i]=best;const s=sums[best];s.count++;s.r+=p.r;s.g+=p.g;s.b+=p.b;
      }
      centers=centers.map((center,i)=>sums[i].count?{r:sums[i].r/sums[i].count,g:sums[i].g/sums[i].count,b:sums[i].b/sums[i].count}:center);
    }
    const counts=centers.map(()=>0);
    for(const a of assignments)counts[a]++;
    return centers.map((center,i)=>({
      ...center,
      count:counts[i],
      share:pixels.length?counts[i]/pixels.length:0,
      label:typeof window.nearestColor==='function'?window.nearestColor(center.r,center.g,center.b):'Multicolor'
    })).filter(c=>c.count>0).sort((a,b)=>b.count-a.count);
  }

  function selectDominantCluster(clusters){
    if(!clusters.length)return null;
    // Phase 3 deliberately uses population as the primary-color definition.
    // Shadow/highlight weighting and perceptual color calibration belong to Phase 4.
    return clusters[0];
  }

  function classifyPatternPhase2(sample){
    const mean=sample.lum.reduce((a,x)=>a+x,0)/sample.lum.length;
    const variance=sample.lum.reduce((a,x)=>a+(x-mean)**2,0)/sample.lum.length;
    const avgSat=sample.sat.reduce((a,x)=>a+x,0)/sample.sat.length;
    let pattern='Solid';
    if(variance>2200&&avgSat>45)pattern='Floral/Print';
    else if(variance>1500)pattern='Graphic';
    return{pattern,variance,avgSat};
  }

  async function analyzeImagePhase3(dataURL){
    const sample=await PHASE2.sampleGarmentPixels(dataURL),n=sample.sampledPixels;
    if(!n)return{color:'Multicolor',pattern:'Solid'};
    const clusters=clusterPixels(sample.pixels),dominant=selectDominantCluster(clusters);
    const patternStats=classifyPatternPhase2(sample);
    const color=dominant?.label||'Multicolor';
    window.AUDREY_SMART_SCAN_PHASE3.lastDiagnostics={
      version:VERSION,
      alphaAware:sample.alphaAware,
      transparentFraction:sample.transparentFraction,
      sampledPixels:n,
      dominant:dominant?{label:dominant.label,share:dominant.share,rgb:[dominant.r,dominant.g,dominant.b]}:null,
      clusters:clusters.map(c=>({label:c.label,share:c.share,rgb:[c.r,c.g,c.b]})),
      variance:patternStats.variance,
      avgSat:patternStats.avgSat,
      color,
      pattern:patternStats.pattern
    };
    return{color,pattern:patternStats.pattern};
  }

  async function comparePhase2(dataURL){
    const phase3=await analyzeImagePhase3(dataURL);
    const phase2=PHASE2_ANALYZE?await PHASE2_ANALYZE(dataURL):null;
    return{version:VERSION,phase3,phase2,diagnostics:window.AUDREY_SMART_SCAN_PHASE3.lastDiagnostics};
  }

  window.AUDREY_SMART_SCAN_PHASE3={version:VERSION,phase2AnalyzeImage:PHASE2_ANALYZE,clusterPixels,selectDominantCluster,analyzeImage:analyzeImagePhase3,comparePhase2,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase3;
  console.info(`Audrey Smart Scan ${VERSION} installed: dominant color clustering enabled; pattern classifier unchanged.`);
})();
