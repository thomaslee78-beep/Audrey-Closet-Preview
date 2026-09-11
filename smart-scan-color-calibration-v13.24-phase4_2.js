/* Audrey Closet v13.24 — Smart Scan Phase 4.2
 * Empirical calibration from real Audrey garment samples.
 * Adds: 256px-aware white likelihood, red/orange/burgundy tuning,
 * olive/tan/gray refinement, charcoal vs black distribution logic,
 * dark-green preservation, and spatially distributed color promotion.
 * Pattern classification output remains unchanged.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase4.2-empirical1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE4=window.AUDREY_SMART_SCAN_PHASE4;
  const PHASE41=window.AUDREY_SMART_SCAN_PHASE41;
  const PHASE41_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels||!PHASE4?.rgbToLab){
    console.warn('Audrey Smart Scan Phase 4.2 skipped: Phase 2/3/4 dependencies unavailable.');
    return;
  }

  const PALETTE_RGB={
    Black:[35,35,35],White:[242,240,234],Cream:[235,222,190],Gray:[135,135,130],
    Brown:[117,82,60],Coffee:[108,81,66],Tan:[177,145,105],Beige:[211,192,157],
    Burgundy:[125,53,71],Red:[178,63,61],Orange:[209,120,53],Yellow:[220,190,65],
    Mustard:[195,160,75],Olive:[102,113,90],Green:[67,117,70],Mint:[151,196,166],
    Turquoise:[77,142,138],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Pink:[196,107,132]
  };
  const PALETTE_LAB=Object.fromEntries(Object.entries(PALETTE_RGB).map(([name,rgb])=>[name,PHASE4.rgbToLab(...rgb)]));
  const GRID=8;

  function chroma(lab){return Math.hypot(lab.a,lab.b)}
  function hueAngle(lab){let h=Math.atan2(lab.b,lab.a)*180/Math.PI;return h<0?h+360:h}
  function deltaE(a,b){return Math.hypot(a.L-b.L,a.a-b.a,a.b-b.b)}
  function percentile(arr,p){if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b),i=Math.min(s.length-1,Math.max(0,Math.round((s.length-1)*p)));return s[i]}

  function classifyHueFamily(lab){
    const C=chroma(lab),h=hueAngle(lab);
    if(C<8)return'neutral';
    if(h>=330||h<18)return lab.L>=50?'pink':'red';
    if(h<37)return'red';
    if(h<72)return'orange';
    if(h<112)return'yellow';
    if(h<178)return'green';
    if(h<226)return'turquoise';
    if(h<296)return'blue';
    if(h<330)return'purple';
    return'pink';
  }

  function nearestCandidate(lab,names){let best='Multicolor',score=Infinity;for(const name of names){const d=deltaE(lab,PALETTE_LAB[name]);if(d<score){score=d;best=name}}return{label:best,score}}

  function classifyClusterColor(cluster){
    const lab=PHASE4.rgbToLab(cluster.r,cluster.g,cluster.b),C=chroma(lab),h=hueAngle(lab),family=classifyHueFamily(lab);

    if(family==='neutral'){
      if(lab.L>=88)return{label:'White',family,lab,chroma:C,hue:h,reason:'bright-neutral'};
      if(lab.L<=14&&C<7)return{label:'Black',family,lab,chroma:C,hue:h,reason:'true-black-gate'};
      return{label:'Gray',family,lab,chroma:C,hue:h,reason:'neutral-gray-default'};
    }

    let match;
    if(family==='red'){
      // Real samples show dark saturated reds still read as Red; Burgundy is dark + muted/brownish.
      if(C>=40)match={label:'Red',reason:'saturated-red-preservation'};
      else if(lab.L<38&&C<34)match={label:'Burgundy',reason:'dark-muted-red'};
      else match={...nearestCandidate(lab,['Red','Burgundy','Pink']),reason:'red-family-nearest'};
    }else if(family==='orange'){
      if(C>=22)match={label:'Orange',reason:'orange-hue-preservation'};
      else match={...nearestCandidate(lab,['Orange','Brown','Coffee','Tan']),reason:'muted-orange-nearest'};
    }else if(family==='yellow'){
      match={...nearestCandidate(lab,['Yellow','Mustard','Tan','Beige','Olive']),reason:'yellow-family'};
    }else if(family==='green'){
      // Preserve forest/deep greens even when dark and somewhat muted.
      const channelGreenBias=(cluster.g-cluster.r)+(cluster.g-cluster.b);
      if((lab.L<44&&C>=10)||(lab.L<34&&channelGreenBias>=6))match={label:'Green',reason:'dark-green-preservation'};
      else if(C<24&&h>=100&&h<=145&&lab.L<58)match={label:'Olive',reason:'muted-olive-zone'};
      else match={...nearestCandidate(lab,['Green','Olive','Mint']),reason:'green-family'};
    }else if(family==='turquoise'){
      match={...nearestCandidate(lab,['Turquoise','Mint','Blue','Green']),reason:'turquoise-family'};
    }else if(family==='blue'){
      if(lab.L>=42)match={label:'Blue',reason:'blue-lightness-gate'};
      else if(lab.L<=29&&C>=10)match={label:'Navy',reason:'true-navy-gate'};
      else{const bd=deltaE(lab,PALETTE_LAB.Blue),nd=deltaE(lab,PALETTE_LAB.Navy);match={label:nd+5<bd?'Navy':'Blue',reason:'blue-navy-direct'}}
    }else if(family==='purple'){
      match={...nearestCandidate(lab,['Purple','Pink','Burgundy']),reason:'purple-family'};
    }else{
      match={...nearestCandidate(lab,['Pink','Red','Purple']),reason:'pink-family'};
    }
    return{...match,family,lab,chroma:C,hue:h};
  }

  function patternStats(sample){
    const mean=sample.lum.reduce((a,x)=>a+x,0)/sample.lum.length;
    const variance=sample.lum.reduce((a,x)=>a+(x-mean)**2,0)/sample.lum.length;
    const avgSat=sample.sat.reduce((a,x)=>a+x,0)/sample.sat.length;
    let pattern='Solid';if(variance>2200&&avgSat>45)pattern='Floral/Print';else if(variance>1500)pattern='Graphic';
    return{pattern,variance,avgSat};
  }

  function whiteLikelihood(sample){
    if(!sample.pixels.length)return{score:0,brightNeutralShare:0,veryBrightShare:0,l90:0};
    let brightNeutral=0,veryBright=0;
    const light=[];
    for(const p of sample.pixels){
      const lab=PHASE4.rgbToLab(p.r,p.g,p.b),C=chroma(lab);light.push(lab.L);
      if(lab.L>=76&&C<=13)brightNeutral++;
      if(lab.L>=88&&C<=11)veryBright++;
    }
    const brightNeutralShare=brightNeutral/sample.pixels.length,veryBrightShare=veryBright/sample.pixels.length,l90=percentile(light,.90);
    const score=brightNeutralShare*.65+veryBrightShare*.35+(l90>=88?.10:0);
    return{score,brightNeutralShare,veryBrightShare,l90};
  }

  function neutralDistribution(sample){
    let nearBlack=0,charcoal=0,grayish=0,totalNeutral=0;
    for(const p of sample.pixels){
      const lab=PHASE4.rgbToLab(p.r,p.g,p.b),C=chroma(lab);
      if(C>12)continue;totalNeutral++;
      if(lab.L<=16)nearBlack++;
      else if(lab.L<=42)charcoal++;
      else if(lab.L<=72)grayish++;
    }
    const d=x=>totalNeutral?x/totalNeutral:0;
    return{totalNeutral,nearBlackShare:d(nearBlack),charcoalShare:d(charcoal),grayishShare:d(grayish)};
  }

  function clusterSpatialCoverage(cluster,sample){
    if(!sample.width||!sample.height||!sample.pixels.length)return{coverage:0,concentration:1,cells:0};
    const cells=new Array(GRID*GRID).fill(0),all=new Array(GRID*GRID).fill(0);
    const threshold=52*52;
    for(const p of sample.pixels){
      const gx=Math.min(GRID-1,Math.floor(p.x/sample.width*GRID)),gy=Math.min(GRID-1,Math.floor(p.y/sample.height*GRID)),idx=gy*GRID+gx;all[idx]++;
      const dr=p.r-cluster.r,dg=p.g-cluster.g,db=p.b-cluster.b;if(dr*dr+dg*dg+db*db<=threshold)cells[idx]++;
    }
    let active=0,clusterPixels=0,maxCell=0;
    for(let i=0;i<cells.length;i++){if(cells[i]>=Math.max(2,all[i]*.08))active++;clusterPixels+=cells[i];maxCell=Math.max(maxCell,cells[i]);}
    const coverage=active/(GRID*GRID),concentration=clusterPixels?maxCell/clusterPixels:1;
    return{coverage,concentration,cells:active};
  }

  function scoreCluster(cluster,classification,stats,spatial){
    let score=cluster.share;
    const {family,lab,chroma:C}=classification;
    if(family==='neutral'&&lab.L<45&&C<12)score-=.10;
    if(family!=='neutral'&&C>=18)score+=Math.min(.10,(C-18)/180);
    // Promote distributed chromatic stripes/plaid, not localized graphics/logos.
    if(family!=='neutral'&&cluster.share>=.055&&C>=18&&spatial.coverage>=.22)score+=.12;
    if(family!=='neutral'&&cluster.share>=.04&&C>=24&&spatial.coverage>=.38)score+=.08;
    if(family!=='neutral'&&spatial.coverage<.14&&spatial.concentration>.16)score-=.10;
    return score;
  }

  function selectPrimaryCluster(clusters,sample,stats){
    const scored=clusters.map(cluster=>{const classification=classifyClusterColor(cluster),spatial=clusterSpatialCoverage(cluster,sample);return{cluster,classification,spatial,score:scoreCluster(cluster,classification,stats,spatial)}}).sort((a,b)=>b.score-a.score);
    return{winner:scored[0]||null,scored};
  }

  async function analyzeImagePhase42(dataURL){
    const sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return{color:'Multicolor',pattern:'Solid'};
    const stats=patternStats(sample),white=whiteLikelihood(sample),neutral=neutralDistribution(sample),clusters=PHASE3.clusterPixels(sample.pixels),selection=selectPrimaryCluster(clusters,sample,stats);
    let winner=selection.winner,color=winner?.classification?.label||'Multicolor',reason=winner?.classification?.reason||'cluster';

    // White is based on distribution, so shadows/graphics don't turn a white garment Gray.
    const largestColorShare=selection.scored.filter(x=>x.classification.family!=='neutral').reduce((m,x)=>Math.max(m,x.cluster.share),0);
    if((white.brightNeutralShare>=.48&&white.l90>=84)||(white.score>=.45&&largestColorShare<.34)){
      color='White';reason='white-distribution-likelihood';
    }

    // Charcoal/heather garments should be Gray unless the neutral distribution is overwhelmingly true black.
    if((color==='Black'||color==='Gray')&&neutral.totalNeutral){
      if(neutral.nearBlackShare<.58&&(neutral.charcoalShare+neutral.grayishShare)>.34){color='Gray';reason='charcoal-distribution'}
      else if(neutral.nearBlackShare>=.72&&neutral.charcoalShare<.20){color='Black';reason='true-black-distribution'}
    }

    window.AUDREY_SMART_SCAN_PHASE42.lastDiagnostics={
      version:VERSION,sampleSize:PHASE2.sampleSize||sample.sampleSize||256,alphaAware:sample.alphaAware,transparentFraction:sample.transparentFraction,sampledPixels:sample.sampledPixels,
      color,pattern:stats.pattern,reason,white,neutral,variance:stats.variance,avgSat:stats.avgSat,
      winner:winner?{label:winner.classification.label,family:winner.classification.family,share:winner.cluster.share,score:winner.score,rgb:[winner.cluster.r,winner.cluster.g,winner.cluster.b],lightness:winner.classification.lab.L,chroma:winner.classification.chroma,hue:winner.classification.hue,reason:winner.classification.reason,spatial:winner.spatial}:null,
      clusters:selection.scored.map(x=>({label:x.classification.label,family:x.classification.family,share:x.cluster.share,score:x.score,rgb:[x.cluster.r,x.cluster.g,x.cluster.b],lightness:x.classification.lab.L,chroma:x.classification.chroma,hue:x.classification.hue,reason:x.classification.reason,spatial:x.spatial}))
    };
    return{color,pattern:stats.pattern};
  }

  async function comparePhase41(dataURL){const phase42=await analyzeImagePhase42(dataURL),phase41=PHASE41_ANALYZE?await PHASE41_ANALYZE(dataURL):null;return{version:VERSION,phase42,phase41,diagnostics:window.AUDREY_SMART_SCAN_PHASE42.lastDiagnostics}}

  window.AUDREY_SMART_SCAN_PHASE42={version:VERSION,classifyHueFamily,classifyClusterColor,whiteLikelihood,neutralDistribution,clusterSpatialCoverage,selectPrimaryCluster,phase41AnalyzeImage:PHASE41_ANALYZE,analyzeImage:analyzeImagePhase42,comparePhase41,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase42;
  console.info(`Audrey Smart Scan ${VERSION} installed: empirical color calibration, white/gray distribution logic, and spatial color coverage enabled.`);
})();
