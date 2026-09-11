/* Audrey Closet v13.24 — Smart Scan Phase 5.1
 * Pattern refinement on top of Phase 5.
 * Targets: stronger Solid dominance, repetition-based Stripe detection,
 * and distributed Floral/Print detection. Phase 4.2 color remains unchanged.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase5.1-pattern2';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE42=window.AUDREY_SMART_SCAN_PHASE42;
  const PHASE5=window.AUDREY_SMART_SCAN_PHASE5;
  const COLOR_ANALYZE=PHASE5?.colorAnalyzeImage||PHASE42?.analyzeImage||null;
  const GRID=32;

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels||!PHASE42?.analyzeImage){
    console.warn('Audrey Smart Scan Phase 5.1 skipped: Phase 2/3/4.2 dependencies unavailable.');
    return;
  }

  function dist2(a,b){const dr=a.r-b.r,dg=a.g-b.g,db=a.b-b.b;return dr*dr+dg*dg+db*db}
  function nearestClusterIndex(p,clusters){let best=0,d=Infinity;for(let i=0;i<clusters.length;i++){const x=dist2(p,clusters[i]);if(x<d){d=x;best=i}}return best}

  function buildGrid(sample,clusters){
    const cells=Array.from({length:GRID*GRID},()=>({count:0,labels:[]}));
    for(const p of sample.pixels){
      const x=Math.min(GRID-1,Math.floor(p.x/sample.width*GRID)),y=Math.min(GRID-1,Math.floor(p.y/sample.height*GRID)),c=cells[y*GRID+x];
      c.count++;c.labels.push(nearestClusterIndex(p,clusters));
    }
    return cells.map(c=>{
      if(!c.count)return null;
      const m=new Map();for(const label of c.labels)m.set(label,(m.get(label)||0)+1);
      let label=-1,max=0;for(const[k,v]of m){if(v>max){max=v;label=k}}
      return{label,purity:max/c.count,count:c.count};
    });
  }

  function componentStats(grid){
    const seen=new Uint8Array(grid.length),parts=[];
    for(let i=0;i<grid.length;i++){
      if(seen[i]||!grid[i])continue;const label=grid[i].label,stack=[i];seen[i]=1;let size=0,minX=GRID,maxX=0,minY=GRID,maxY=0;
      while(stack.length){
        const q=stack.pop(),x=q%GRID,y=Math.floor(q/GRID),c=grid[q];if(!c||c.label!==label)continue;
        size++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        for(const n of [q-1,q+1,q-GRID,q+GRID]){
          if(n<0||n>=grid.length||seen[n])continue;const nx=n%GRID,ny=Math.floor(n/GRID);if(Math.abs(nx-x)+Math.abs(ny-y)!==1)continue;
          if(grid[n]?.label===label){seen[n]=1;stack.push(n)}
        }
      }
      parts.push({label,size,width:maxX-minX+1,height:maxY-minY+1});
    }
    parts.sort((a,b)=>b.size-a.size);const valid=grid.filter(Boolean).length||1;
    return{parts,largestShare:parts[0]?parts[0].size/valid:0,secondShare:parts[1]?parts[1].size/valid:0,valid};
  }

  function clusterCoverage(grid,clusterCount){
    const counts=new Array(clusterCount).fill(0),cells=grid.filter(Boolean).length||1;
    for(const c of grid)if(c)counts[c.label]++;
    return counts.map(x=>x/cells);
  }

  function solidFeatures(grid,clusters){
    const coverage=clusterCoverage(grid,clusters.length),top=coverage[0]||0;
    const second=coverage.slice(1).reduce((m,x)=>Math.max(m,x),0);
    const secondaryLocalized=coverage.slice(1).every(x=>x<.10);
    return{topCoverage:top,secondCoverage:second,secondaryLocalized,coverage};
  }

  function compressRuns(labels){const out=[];for(const x of labels){if(x<0)continue;if(!out.length||out[out.length-1]!==x)out.push(x)}return out}

  function scanLineRuns(grid,axis,index){
    const labels=[];
    if(axis==='vertical')for(let y=0;y<GRID;y++){const c=grid[y*GRID+index];labels.push(c&&c.purity>=.45?c.label:-1)}
    else for(let x=0;x<GRID;x++){const c=grid[index*GRID+x];labels.push(c&&c.purity>=.45?c.label:-1)}
    return compressRuns(labels);
  }

  function stripeRepetition(grid){
    function score(axis){
      const lineRuns=[];
      for(let i=4;i<GRID-4;i+=3){const runs=scanLineRuns(grid,axis,i);if(runs.length>=4)lineRuns.push(runs)}
      if(lineRuns.length<3)return{score:0,lines:lineRuns.length,avgRuns:0,agreement:0};
      const avgRuns=lineRuns.reduce((a,r)=>a+r.length,0)/lineRuns.length;
      let agree=0,pairs=0;
      for(let i=0;i<lineRuns.length;i++)for(let j=i+1;j<lineRuns.length;j++){
        pairs++;const a=lineRuns[i],b=lineRuns[j],n=Math.min(a.length,b.length);if(n<3)continue;
        let same=0;for(let k=0;k<n;k++)if(a[k]===b[k])same++;
        if(same/n>=.60)agree++;
      }
      const agreement=pairs?agree/pairs:0;
      return{score:Math.min(1,(avgRuns-3)/8)*.55+agreement*.45,lines:lineRuns.length,avgRuns,agreement};
    }
    // Horizontal stripes are encountered down vertical scan lines; vertical stripes across horizontal scan lines.
    const horizontal=score('vertical'),vertical=score('horizontal');
    return{horizontal,vertical,best:horizontal.score>=vertical.score?horizontal:vertical,orientation:horizontal.score>=vertical.score?'horizontal':'vertical'};
  }

  function transitionAxes(grid){
    let h=0,v=0,hp=0,vp=0;
    for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
      const a=grid[y*GRID+x];if(!a)continue;
      if(x<GRID-1){const b=grid[y*GRID+x+1];if(b){hp++;if(a.label!==b.label)h++}}
      if(y<GRID-1){const b=grid[(y+1)*GRID+x];if(b){vp++;if(a.label!==b.label)v++}}
    }
    return{horizontal:hp?h/hp:0,vertical:vp?v/vp:0};
  }

  function distributedDetail(grid,clusters){
    const dominant=0,activeCells=grid.filter(Boolean).length||1;
    let nonDominantCells=0;const occupied=new Set();
    for(let i=0;i<grid.length;i++){
      const c=grid[i];if(!c||c.label===dominant)continue;nonDominantCells++;const x=i%GRID,y=Math.floor(i/GRID);occupied.add(Math.floor(x/4)+','+Math.floor(y/4));
    }
    const coverage=nonDominantCells/activeCells;
    const regionCoverage=occupied.size/64;
    const meaningfulColors=clusters.filter(c=>c.share>=.045).length;
    const comps=componentStats(grid),smallComponents=comps.parts.filter(p=>p.size<=Math.max(4,activeCells*.025)).length;
    return{coverage,regionCoverage,meaningfulColors,smallComponents,componentCount:comps.parts.length};
  }

  function colorblockEvidence(grid,clusters){
    const comps=componentStats(grid),meaningful=clusters.filter(c=>c.share>=.08).length;
    return{meaningful,largestShare:comps.largestShare,secondShare:comps.secondShare,componentCount:comps.parts.length};
  }

  function classify(features){
    const s=features.solid,stripe=features.stripe,axes=features.axes,print=features.print,cb=features.colorblock;

    // Solid override first: small logos/buttons should not create a pattern.
    if(s.topCoverage>=.78&&s.secondCoverage<.11&&s.secondaryLocalized)return{pattern:'Solid',confidence:.92,reason:'dominant-solid-override'};
    if(s.topCoverage>=.70&&s.secondCoverage<.08)return{pattern:'Solid',confidence:.86,reason:'dominant-solid-small-accent'};

    // Repeated runs across many scan lines are stronger evidence than generic edge density.
    if(stripe.best.score>=.52&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35)return{pattern:'Stripe',confidence:.88,reason:'repeated-band-sequence'};

    // Plaid requires meaningful changes on both axes and no single dominant solid override.
    if(axes.horizontal>=.18&&axes.vertical>=.18&&s.topCoverage<.72&&features.print.meaningfulColors>=2)return{pattern:'Plaid',confidence:.78,reason:'two-axis-grid-structure'};

    // A few genuinely large contiguous regions indicate colorblock.
    if(cb.meaningful>=2&&cb.meaningful<=4&&cb.largestShare>=.34&&cb.secondShare>=.18&&cb.componentCount<=12)return{pattern:'Colorblock',confidence:.74,reason:'large-contiguous-regions'};

    // Distributed irregular detail across many regions = floral/print.
    if(print.meaningfulColors>=3&&print.coverage>=.22&&print.regionCoverage>=.30&&print.smallComponents>=8)return{pattern:'Floral/Print',confidence:.84,reason:'distributed-irregular-print'};
    if(print.meaningfulColors>=3&&print.regionCoverage>=.42&&print.componentCount>=14)return{pattern:'Floral/Print',confidence:.76,reason:'distributed-multicolor-detail'};

    // Remaining localized non-dominant detail is more likely a graphic.
    if(s.topCoverage>=.48&&print.coverage>=.08&&print.coverage<.32&&print.regionCoverage<.30)return{pattern:'Graphic',confidence:.72,reason:'localized-graphic-detail'};

    if(s.topCoverage>=.62)return{pattern:'Solid',confidence:.66,reason:'mostly-solid-fallback'};
    return{pattern:'Other',confidence:.40,reason:'mixed-unclassified-structure'};
  }

  function extract(sample,clusters){
    const grid=buildGrid(sample,clusters);
    return{grid,solid:solidFeatures(grid,clusters),stripe:stripeRepetition(grid),axes:transitionAxes(grid),print:distributedDetail(grid,clusters),colorblock:colorblockEvidence(grid,clusters)};
  }

  async function analyzeImagePhase51(dataURL){
    const colorResult=await COLOR_ANALYZE(dataURL),colorDiag=window.AUDREY_SMART_SCAN_PHASE42?.lastDiagnostics||null;
    const sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return colorResult;
    const clusters=PHASE3.clusterPixels(sample.pixels),features=extract(sample,clusters),decision=classify(features);
    window.AUDREY_SMART_SCAN_PHASE51.lastDiagnostics={version:VERSION,color:colorResult.color,pattern:decision.pattern,confidence:decision.confidence,reason:decision.reason,sampleSize:PHASE2.sampleSize||sample.sampleSize||256,gridSize:GRID,features:{solid:features.solid,stripe:features.stripe,axes:features.axes,print:features.print,colorblock:features.colorblock},colorDiagnostics:colorDiag};
    return{color:colorResult.color,pattern:decision.pattern};
  }

  window.AUDREY_SMART_SCAN_PHASE51={version:VERSION,buildGrid,solidFeatures,stripeRepetition,transitionAxes,distributedDetail,colorblockEvidence,extract,classify,colorAnalyzeImage:COLOR_ANALYZE,analyzeImage:analyzeImagePhase51,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase51;
  console.info(`Audrey Smart Scan ${VERSION} installed: solid, stripe, and floral/print refinement enabled; Phase 4.2 color preserved.`);
})();
