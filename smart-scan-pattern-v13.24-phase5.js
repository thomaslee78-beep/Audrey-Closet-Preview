/* Audrey Closet v13.24 — Smart Scan Phase 5
 * Spatial Pattern Detection v1 on top of the frozen Phase 4.2 color baseline.
 * Detects: Solid, Stripe, Plaid, Graphic, Colorblock, Floral/Print, Other.
 * Color output is delegated unchanged to Phase 4.2.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase5-pattern1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE42=window.AUDREY_SMART_SCAN_PHASE42;
  const COLOR_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;
  const GRID=24;

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels||!PHASE42?.analyzeImage){
    console.warn('Audrey Smart Scan Phase 5 skipped: Phase 2/3/4.2 dependencies unavailable.');
    return;
  }

  function dist2(a,b){const dr=a.r-b.r,dg=a.g-b.g,db=a.b-b.b;return dr*dr+dg*dg+db*db}
  function nearestClusterIndex(p,clusters){let best=0,d=Infinity;for(let i=0;i<clusters.length;i++){const x=dist2(p,clusters[i]);if(x<d){d=x;best=i}}return best}

  function buildSpatialGrid(sample,clusters){
    const cells=Array.from({length:GRID*GRID},()=>({count:0,r:0,g:0,b:0,labels:[]}));
    for(const p of sample.pixels){
      const gx=Math.min(GRID-1,Math.floor(p.x/sample.width*GRID)),gy=Math.min(GRID-1,Math.floor(p.y/sample.height*GRID)),idx=gy*GRID+gx,c=cells[idx];
      c.count++;c.r+=p.r;c.g+=p.g;c.b+=p.b;c.labels.push(nearestClusterIndex(p,clusters));
    }
    return cells.map(c=>{
      if(!c.count)return null;
      const counts=new Map();for(const label of c.labels)counts.set(label,(counts.get(label)||0)+1);
      let label=0,max=0;for(const [k,v] of counts){if(v>max){max=v;label=k}}
      return{r:c.r/c.count,g:c.g/c.count,b:c.b/c.count,label,count:c.count};
    });
  }

  function transitionFeatures(grid){
    let hPairs=0,vPairs=0,hTransitions=0,vTransitions=0,hStrength=0,vStrength=0;
    const threshold=34*34;
    for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
      const i=y*GRID+x,a=grid[i];if(!a)continue;
      if(x<GRID-1){const b=grid[i+1];if(b){hPairs++;const d=dist2(a,b);if(a.label!==b.label&&d>threshold)hTransitions++;hStrength+=Math.sqrt(d)}}
      if(y<GRID-1){const b=grid[i+GRID];if(b){vPairs++;const d=dist2(a,b);if(a.label!==b.label&&d>threshold)vTransitions++;vStrength+=Math.sqrt(d)}}
    }
    return{
      horizontal:hPairs?hTransitions/hPairs:0,
      vertical:vPairs?vTransitions/vPairs:0,
      horizontalStrength:hPairs?hStrength/hPairs:0,
      verticalStrength:vPairs?vStrength/vPairs:0
    };
  }

  function rowColumnSignatures(grid){
    const rows=[],cols=[];
    for(let y=0;y<GRID;y++){const counts=new Map();let n=0;for(let x=0;x<GRID;x++){const c=grid[y*GRID+x];if(!c)continue;n++;counts.set(c.label,(counts.get(c.label)||0)+1)}let label=-1,max=0;for(const[k,v]of counts){if(v>max){max=v;label=k}}rows.push({label,purity:n?max/n:0})}
    for(let x=0;x<GRID;x++){const counts=new Map();let n=0;for(let y=0;y<GRID;y++){const c=grid[y*GRID+x];if(!c)continue;n++;counts.set(c.label,(counts.get(c.label)||0)+1)}let label=-1,max=0;for(const[k,v]of counts){if(v>max){max=v;label=k}}cols.push({label,purity:n?max/n:0})}
    function changes(sig){let c=0,p=-1,n=0;for(const s of sig){if(s.label<0||s.purity<.48)continue;if(p>=0&&s.label!==p)c++;p=s.label;n++}return n>1?c/(n-1):0}
    return{rowChanges:changes(rows),columnChanges:changes(cols),rows,cols};
  }

  function componentFeatures(grid){
    const seen=new Uint8Array(grid.length),components=[];
    for(let i=0;i<grid.length;i++){
      if(seen[i]||!grid[i])continue;const label=grid[i].label,stack=[i];seen[i]=1;let size=0,minX=GRID,maxX=0,minY=GRID,maxY=0;
      while(stack.length){const q=stack.pop(),x=q%GRID,y=Math.floor(q/GRID),c=grid[q];if(!c||c.label!==label)continue;size++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        for(const n of [q-1,q+1,q-GRID,q+GRID]){if(n<0||n>=grid.length||seen[n])continue;const nx=n%GRID,ny=Math.floor(n/GRID);if(Math.abs(nx-x)+Math.abs(ny-y)!==1)continue;if(grid[n]?.label===label){seen[n]=1;stack.push(n)}}
      }
      components.push({label,size,area:(maxX-minX+1)*(maxY-minY+1)});
    }
    components.sort((a,b)=>b.size-a.size);const valid=grid.filter(Boolean).length||1;
    return{count:components.length,largestShare:components[0]?components[0].size/valid:0,secondShare:components[1]?components[1].size/valid:0,components};
  }

  function clusterDiversity(clusters){
    const meaningful=clusters.filter(c=>c.share>=.055);return{meaningful:meaningful.length,topShare:clusters[0]?.share||0,secondShare:clusters[1]?.share||0};
  }

  function localDetail(grid){
    const cellScores=[];
    for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
      const a=grid[y*GRID+x];if(!a)continue;let changes=0,pairs=0;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GRID||ny>=GRID)continue;const b=grid[ny*GRID+nx];if(!b)continue;pairs++;if(a.label!==b.label)changes++}
      if(pairs)cellScores.push(changes/pairs);
    }
    if(!cellScores.length)return{mean:0,highShare:0};const mean=cellScores.reduce((a,b)=>a+b,0)/cellScores.length,highShare=cellScores.filter(x=>x>=.5).length/cellScores.length;return{mean,highShare};
  }

  function classifyPatternFeatures(f){
    const t=f.transitions,s=f.signatures,d=f.diversity,c=f.components,detail=f.detail;
    const directional=Math.max(t.horizontal,t.vertical),other=Math.min(t.horizontal,t.vertical);
    const signatureDirectional=Math.max(s.rowChanges,s.columnChanges),signatureOther=Math.min(s.rowChanges,s.columnChanges);

    // Strong repeated change in one direction = stripes. Row changes imply horizontal bands; column changes imply vertical bands.
    if(d.meaningful>=2&&directional>=.18&&other<=.13&&signatureDirectional>=.16&&signatureOther<=.18)return{pattern:'Stripe',confidence:.78,reason:'directional-repetition'};

    // Plaid/check requires substantial structure in both directions.
    if(d.meaningful>=2&&t.horizontal>=.15&&t.vertical>=.15&&s.rowChanges>=.12&&s.columnChanges>=.12)return{pattern:'Plaid',confidence:.76,reason:'two-axis-repetition'};

    // Colorblock: a few large contiguous color regions, relatively low fine detail.
    if(d.meaningful>=2&&d.meaningful<=4&&c.largestShare>=.32&&c.secondShare>=.14&&detail.mean<=.34&&directional<=.24)return{pattern:'Colorblock',confidence:.70,reason:'large-color-regions'};

    // Localized detail tends to be a logo/graphic. Distributed high detail leans floral/print.
    if(detail.highShare>=.18&&detail.highShare<.48&&d.meaningful>=2&&c.largestShare>=.38)return{pattern:'Graphic',confidence:.66,reason:'localized-detail'};
    if(detail.highShare>=.32&&d.meaningful>=3&&t.horizontal>=.12&&t.vertical>=.12)return{pattern:'Floral/Print',confidence:.64,reason:'distributed-detail'};

    // Very uniform garments remain Solid.
    if(d.topShare>=.72&&directional<.12&&detail.mean<.22)return{pattern:'Solid',confidence:.82,reason:'uniform-dominant-color'};
    if(d.meaningful<=1&&directional<.15)return{pattern:'Solid',confidence:.74,reason:'low-diversity'};

    return{pattern:'Other',confidence:.38,reason:'mixed-structure'};
  }

  function extractPatternFeatures(sample,clusters){
    const grid=buildSpatialGrid(sample,clusters);
    return{grid,transitions:transitionFeatures(grid),signatures:rowColumnSignatures(grid),components:componentFeatures(grid),diversity:clusterDiversity(clusters),detail:localDetail(grid)};
  }

  async function analyzeImagePhase5(dataURL){
    const colorResult=await COLOR_ANALYZE(dataURL),colorDiag=window.AUDREY_SMART_SCAN_PHASE42?.lastDiagnostics||null;
    const sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return colorResult;
    const clusters=PHASE3.clusterPixels(sample.pixels),features=extractPatternFeatures(sample,clusters),decision=classifyPatternFeatures(features);
    window.AUDREY_SMART_SCAN_PHASE5.lastDiagnostics={version:VERSION,color:colorResult.color,pattern:decision.pattern,confidence:decision.confidence,reason:decision.reason,sampleSize:PHASE2.sampleSize||sample.sampleSize||256,features:{transitions:features.transitions,signatures:{rowChanges:features.signatures.rowChanges,columnChanges:features.signatures.columnChanges},components:{count:features.components.count,largestShare:features.components.largestShare,secondShare:features.components.secondShare},diversity:features.diversity,detail:features.detail},colorDiagnostics:colorDiag};
    return{color:colorResult.color,pattern:decision.pattern};
  }

  window.AUDREY_SMART_SCAN_PHASE5={version:VERSION,buildSpatialGrid,transitionFeatures,rowColumnSignatures,componentFeatures,clusterDiversity,localDetail,extractPatternFeatures,classifyPatternFeatures,colorAnalyzeImage:COLOR_ANALYZE,analyzeImage:analyzeImagePhase5,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase5;
  console.info(`Audrey Smart Scan ${VERSION} installed: spatial pattern detection enabled; Phase 4.2 color baseline preserved.`);
})();
