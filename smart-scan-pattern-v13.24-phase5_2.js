/* Audrey Closet v13.24 — Smart Scan Phase 5.2
 * Graphic / Plaid refinement on top of Phase 5.1.
 * - torso-focused pattern analysis to reduce sleeve rotation noise
 * - Graphic = localized meaningful design region with internal variation
 * - Solid ignores tiny localized logos/icons
 * - Plaid requires two-axis structure spread across most of the torso
 * Existing Phase 4.2 color remains unchanged.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase5.2-graphic1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE42=window.AUDREY_SMART_SCAN_PHASE42;
  const PHASE51=window.AUDREY_SMART_SCAN_PHASE51;
  const COLOR_ANALYZE=PHASE51?.colorAnalyzeImage||PHASE42?.analyzeImage||null;
  const GRID=32;
  const TORSO={x0:6,x1:25,y0:4,y1:29};

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels||!PHASE51?.buildGrid||!COLOR_ANALYZE){
    console.warn('Audrey Smart Scan Phase 5.2 skipped: Phase 2/3/5.1 dependencies unavailable.');
    return;
  }

  function torsoCells(grid){
    const cells=[];
    for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){
      const c=grid[y*GRID+x];if(c)cells.push({x,y,c});
    }
    return cells;
  }

  function dominantTorsoLabel(grid){
    const counts=new Map();let total=0;
    for(const {c} of torsoCells(grid)){total++;counts.set(c.label,(counts.get(c.label)||0)+1)}
    let label=-1,count=0;for(const[k,v]of counts){if(v>count){label=k;count=v}}
    return{label,share:total?count/total:0,total,counts};
  }

  function binaryComponents(grid,predicate){
    const seen=new Uint8Array(grid.length),parts=[];
    for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){
      const i=y*GRID+x;if(seen[i]||!grid[i]||!predicate(grid[i],x,y))continue;
      const stack=[i];seen[i]=1;let size=0,minX=x,maxX=x,minY=y,maxY=y;const labels=new Set();
      while(stack.length){
        const q=stack.pop(),qx=q%GRID,qy=Math.floor(q/GRID),c=grid[q];if(!c||!predicate(c,qx,qy))continue;
        size++;labels.add(c.label);minX=Math.min(minX,qx);maxX=Math.max(maxX,qx);minY=Math.min(minY,qy);maxY=Math.max(maxY,qy);
        for(const n of [q-1,q+1,q-GRID,q+GRID]){
          if(n<0||n>=grid.length||seen[n])continue;const nx=n%GRID,ny=Math.floor(n/GRID);
          if(nx<TORSO.x0||nx>TORSO.x1||ny<TORSO.y0||ny>TORSO.y1)continue;
          if(Math.abs(nx-qx)+Math.abs(ny-qy)!==1)continue;
          if(grid[n]&&predicate(grid[n],nx,ny)){seen[n]=1;stack.push(n)}
        }
      }
      parts.push({size,minX,maxX,minY,maxY,width:maxX-minX+1,height:maxY-minY+1,labels:[...labels],labelCount:labels.size,cx:(minX+maxX)/2,cy:(minY+maxY)/2});
    }
    return parts.sort((a,b)=>b.size-a.size);
  }

  function macroCoverage(grid,predicate){
    const occupied=new Set(),all=new Set();
    for(const {x,y,c} of torsoCells(grid)){
      const mx=Math.floor((x-TORSO.x0)/4),my=Math.floor((y-TORSO.y0)/4),key=mx+','+my;all.add(key);if(predicate(c,x,y))occupied.add(key);
    }
    return all.size?occupied.size/all.size:0;
  }

  function localizedGraphicFeatures(grid){
    const dom=dominantTorsoLabel(grid),active=dom.total||1;
    const secondary=(c)=>c.label!==dom.label;
    const parts=binaryComponents(grid,secondary),secondaryCount=torsoCells(grid).filter(({c})=>secondary(c)).length;
    const secondaryShare=secondaryCount/active,largest=parts[0]||null;
    const largestShare=largest?largest.size/active:0;
    const largestBoxShare=largest?(largest.width*largest.height)/Math.max(1,(TORSO.x1-TORSO.x0+1)*(TORSO.y1-TORSO.y0+1)):0;
    const centerX=(TORSO.x0+TORSO.x1)/2,centerY=(TORSO.y0+TORSO.y1)/2;
    const centerDistance=largest?Math.hypot((largest.cx-centerX)/(TORSO.x1-TORSO.x0+1),(largest.cy-centerY)/(TORSO.y1-TORSO.y0+1)):1;
    const localizedCoverage=macroCoverage(grid,secondary);
    const internalVariation=largest?Math.min(1,(largest.labelCount-1)/2):0;
    return{dominantShare:dom.share,secondaryShare,largestShare,largestBoxShare,centerDistance,localizedCoverage,internalVariation,partCount:parts.length,largest};
  }

  function torsoTransitionAxes(grid){
    let h=0,v=0,hp=0,vp=0;
    for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){
      const a=grid[y*GRID+x];if(!a)continue;
      if(x<TORSO.x1){const b=grid[y*GRID+x+1];if(b){hp++;if(a.label!==b.label)h++}}
      if(y<TORSO.y1){const b=grid[(y+1)*GRID+x];if(b){vp++;if(a.label!==b.label)v++}}
    }
    return{horizontal:hp?h/hp:0,vertical:vp?v/vp:0};
  }

  function torsoRunChanges(grid){
    function lineChanges(axis,index){
      const seq=[];
      if(axis==='row')for(let x=TORSO.x0;x<=TORSO.x1;x++){const c=grid[index*GRID+x];if(c&&c.purity>=.42)seq.push(c.label)}
      else for(let y=TORSO.y0;y<=TORSO.y1;y++){const c=grid[y*GRID+index];if(c&&c.purity>=.42)seq.push(c.label)}
      if(seq.length<3)return 0;let changes=0;for(let i=1;i<seq.length;i++)if(seq[i]!==seq[i-1])changes++;return changes/(seq.length-1);
    }
    const rows=[],cols=[];
    for(let y=TORSO.y0+2;y<=TORSO.y1-2;y+=3)rows.push(lineChanges('row',y));
    for(let x=TORSO.x0+2;x<=TORSO.x1-2;x+=3)cols.push(lineChanges('col',x));
    const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
    return{rows:avg(rows),cols:avg(cols)};
  }

  function plaidEvidence(grid){
    const axes=torsoTransitionAxes(grid),runs=torsoRunChanges(grid),dom=dominantTorsoLabel(grid);
    const nonDominantCoverage=macroCoverage(grid,c=>c.label!==dom.label);
    const edgeBands={left:0,right:0,top:0,bottom:0};let edgeTotal={left:0,right:0,top:0,bottom:0};
    for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){
      const c=grid[y*GRID+x];if(!c)continue;
      if(x<=TORSO.x0+2){edgeTotal.left++;if(c.label!==dom.label)edgeBands.left++}
      if(x>=TORSO.x1-2){edgeTotal.right++;if(c.label!==dom.label)edgeBands.right++}
      if(y<=TORSO.y0+2){edgeTotal.top++;if(c.label!==dom.label)edgeBands.top++}
      if(y>=TORSO.y1-2){edgeTotal.bottom++;if(c.label!==dom.label)edgeBands.bottom++}
    }
    const edgeShares=Object.fromEntries(Object.keys(edgeBands).map(k=>[k,edgeTotal[k]?edgeBands[k]/edgeTotal[k]:0]));
    const edgeReach=Object.values(edgeShares).filter(x=>x>=.10).length/4;
    const score=Math.min(1,axes.horizontal*.9+axes.vertical*.9+runs.rows*.55+runs.cols*.55+nonDominantCoverage*.35+edgeReach*.20);
    return{axes,runs,nonDominantCoverage,edgeReach,edgeShares,score};
  }

  function floralEvidence(grid,clusters){
    const dom=dominantTorsoLabel(grid),parts=binaryComponents(grid,c=>c.label!==dom.label),active=dom.total||1;
    const small=parts.filter(p=>p.size<=Math.max(3,active*.035)).length;
    const coverage=macroCoverage(grid,c=>c.label!==dom.label);
    const meaningful=clusters.filter(c=>c.share>=.045).length;
    return{smallComponents:small,coverage,meaningful,partCount:parts.length};
  }

  function colorblockEvidence(grid){
    const dom=dominantTorsoLabel(grid),parts=binaryComponents(grid,()=>true),active=dom.total||1;
    const meaningfulParts=parts.filter(p=>p.size/active>=.12);
    return{meaningfulParts:meaningfulParts.length,largestShare:parts[0]?parts[0].size/active:0,secondShare:parts[1]?parts[1].size/active:0};
  }

  function classifyPattern52(features,phase51Decision){
    const g=features.graphic,p=features.plaid,f=features.floral,cb=features.colorblock,stripe=features.stripe;

    // Tiny localized icon/logo remains Solid even if it has several colors.
    if(g.dominantShare>=.74&&g.secondaryShare<=.065&&g.largestShare<=.06)return{pattern:'Solid',confidence:.92,reason:'phase5.2-tiny-logo-solid'};

    // Preserve strong Phase 5.1 stripe evidence.
    if(stripe?.best?.score>=.52&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35)return{pattern:'Stripe',confidence:.88,reason:'phase5.2-repeated-stripe'};

    // Plaid must be a torso-wide two-axis structure, not a localized graphic.
    if(p.axes.horizontal>=.15&&p.axes.vertical>=.15&&p.runs.rows>=.12&&p.runs.cols>=.12&&p.nonDominantCoverage>=.42&&p.edgeReach>=.50&&g.localizedCoverage>=.38){
      return{pattern:'Plaid',confidence:.86,reason:'phase5.2-torso-wide-plaid'};
    }

    // Graphic = meaningful localized design region. Center is preferred but edge graphics are allowed.
    const coherentGraphic=g.secondaryShare>=.085&&g.secondaryShare<=.48&&g.largestShare>=.065&&g.localizedCoverage<=.42;
    const complexGraphic=g.internalVariation>=.35||g.partCount>=2||g.largestBoxShare>=.08;
    const centerOrEdge=(g.centerDistance<=.34)||(g.largest&&((g.largest.minX<=TORSO.x0+3)||(g.largest.maxX>=TORSO.x1-3)));
    if(coherentGraphic&&complexGraphic&&centerOrEdge)return{pattern:'Graphic',confidence:.87,reason:'phase5.2-localized-graphic'};

    // A simpler but still substantial isolated design can be Graphic if it occupies >10% of torso.
    if(g.secondaryShare>=.10&&g.secondaryShare<=.40&&g.largestShare>=.09&&g.localizedCoverage<=.34)return{pattern:'Graphic',confidence:.79,reason:'phase5.2-substantial-graphic'};

    // Colorblock requires a few large simple regions rather than an internally varied design.
    if(cb.meaningfulParts>=2&&cb.meaningfulParts<=4&&g.internalVariation<.35&&g.localizedCoverage>=.28)return{pattern:'Colorblock',confidence:.72,reason:'phase5.2-large-simple-regions'};

    // Floral/Print remains distributed irregular detail across much of the torso.
    if(f.meaningful>=3&&f.coverage>=.38&&f.smallComponents>=7)return{pattern:'Floral/Print',confidence:.84,reason:'phase5.2-distributed-print'};

    // If Phase 5.1 already found Solid and no meaningful graphic/plaid evidence exists, preserve it.
    if(phase51Decision?.pattern==='Solid'&&g.secondaryShare<.10)return{pattern:'Solid',confidence:.76,reason:'phase5.2-solid-preserved'};
    return phase51Decision||{pattern:'Other',confidence:.40,reason:'phase5.2-fallback'};
  }

  async function analyzeImagePhase52(dataURL){
    const colorResult=await COLOR_ANALYZE(dataURL),sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return colorResult;
    const clusters=PHASE3.clusterPixels(sample.pixels),grid=PHASE51.buildGrid(sample,clusters),baseFeatures=PHASE51.extract(sample,clusters),baseDecision=PHASE51.classify(baseFeatures);
    const features={graphic:localizedGraphicFeatures(grid),plaid:plaidEvidence(grid),floral:floralEvidence(grid,clusters),colorblock:colorblockEvidence(grid),stripe:baseFeatures.stripe};
    const decision=classifyPattern52(features,baseDecision);
    window.AUDREY_SMART_SCAN_PHASE52.lastDiagnostics={version:VERSION,color:colorResult.color,pattern:decision.pattern,confidence:decision.confidence,reason:decision.reason,sampleSize:PHASE2.sampleSize||sample.sampleSize||256,gridSize:GRID,torso:TORSO,features,phase51:{pattern:baseDecision.pattern,confidence:baseDecision.confidence,reason:baseDecision.reason}};
    return{color:colorResult.color,pattern:decision.pattern};
  }

  window.AUDREY_SMART_SCAN_PHASE52={version:VERSION,torso:TORSO,torsoCells,dominantTorsoLabel,binaryComponents,macroCoverage,localizedGraphicFeatures,torsoTransitionAxes,torsoRunChanges,plaidEvidence,floralEvidence,colorblockEvidence,classifyPattern52,colorAnalyzeImage:COLOR_ANALYZE,analyzeImage:analyzeImagePhase52,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase52;
  console.info(`Audrey Smart Scan ${VERSION} installed: Graphic/Plaid torso refinement enabled; Phase 4.2 color preserved.`);
})();
