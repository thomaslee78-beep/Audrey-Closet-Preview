/* Audrey Closet v13.24 — Smart Scan Phase 4.1
 * Targeted calibration on top of Phase 4:
 * - stricter Black vs Gray
 * - Blue vs Navy lightness gating
 * - preserve dark/forest Green as Green
 * - Orange vs Red hue gating
 * - promote meaningful chromatic clusters over neutral/shadow clusters
 *
 * Pattern classification output remains unchanged.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase4.1-calibration1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE4=window.AUDREY_SMART_SCAN_PHASE4;
  const PHASE4_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels||!PHASE4?.rgbToLab){
    console.warn('Audrey Smart Scan Phase 4.1 skipped: Phase 2/3/4 dependencies unavailable.');
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

  function chroma(lab){return Math.hypot(lab.a,lab.b)}
  function hueAngle(lab){let h=Math.atan2(lab.b,lab.a)*180/Math.PI;return h<0?h+360:h}
  function deltaE(a,b){return Math.hypot(a.L-b.L,a.a-b.a,a.b-b.b)}

  function classifyHueFamily(lab){
    const C=chroma(lab),h=hueAngle(lab);
    if(C<10)return'neutral';
    if(h>=330||h<18)return lab.L>=48?'pink':'red';
    if(h<45)return'red';
    if(h<75)return'orange';
    if(h<110)return'yellow';
    if(h<175)return'green';
    if(h<225)return'turquoise';
    if(h<295)return'blue';
    if(h<330)return'purple';
    return'pink';
  }

  function classifyNeutral(lab){
    const L=lab.L,C=chroma(lab);
    // Black is intentionally very strict. Charcoal remains Gray.
    if(L<=16&&C<9)return'Black';
    if(C<6){
      if(L>=91)return'White';
      if(L<=18)return'Black';
      return'Gray';
    }
    if(C<11&&L<47)return L<=16?'Black':'Gray';
    return null;
  }

  function nearestCandidate(lab,names){
    let best='Multicolor',score=Infinity;
    for(const name of names){
      const d=deltaE(lab,PALETTE_LAB[name]);
      if(d<score){score=d;best=name}
    }
    return{label:best,score};
  }

  function classifyClusterColor(cluster){
    const lab=PHASE4.rgbToLab(cluster.r,cluster.g,cluster.b),C=chroma(lab),h=hueAngle(lab);
    const neutral=classifyNeutral(lab);
    if(neutral)return{label:neutral,family:'neutral',lab,chroma:C,hue:h,reason:'neutral-gate'};

    const family=classifyHueFamily(lab);
    let match;
    if(family==='red'){
      match={label:lab.L<36?'Burgundy':'Red',reason:'red-hue-gate'};
    }else if(family==='orange'){
      // A muted/dark orange can legitimately be Brown/Coffee, but a clearly chromatic orange stays Orange.
      if(C>=24&&lab.L>=36)match={label:'Orange',reason:'orange-hue-gate'};
      else match={...nearestCandidate(lab,['Orange','Brown','Coffee','Tan']),reason:'orange-muted-nearest'};
    }else if(family==='yellow'){
      match={...nearestCandidate(lab,['Yellow','Mustard','Tan','Beige']),reason:'yellow-family'};
    }else if(family==='green'){
      // Preserve forest/dark green as Green rather than allowing darkness to turn it Black.
      if(lab.L<43&&C>=13&&h>=118&&h<=170)match={label:'Green',reason:'dark-green-preservation'};
      else match={...nearestCandidate(lab,['Green','Olive','Mint']),reason:'green-family'};
    }else if(family==='turquoise'){
      match={...nearestCandidate(lab,['Turquoise','Mint','Blue','Green']),reason:'turquoise-family'};
    }else if(family==='blue'){
      // Navy is reserved for genuinely dark blue. Medium blues remain Blue.
      if(lab.L>=40)match={label:'Blue',reason:'blue-lightness-gate'};
      else if(lab.L<=30&&C>=11)match={label:'Navy',reason:'navy-dark-blue-gate'};
      else{
        const blueD=deltaE(lab,PALETTE_LAB.Blue),navyD=deltaE(lab,PALETTE_LAB.Navy);
        match={label:navyD+4<blueD?'Navy':'Blue',reason:'blue-navy-direct'};
      }
    }else if(family==='purple'){
      match={...nearestCandidate(lab,['Purple','Pink','Burgundy']),reason:'purple-family'};
    }else if(family==='pink'){
      match={...nearestCandidate(lab,['Pink','Red','Purple']),reason:'pink-family'};
    }else{
      match={...nearestCandidate(lab,['Gray','Brown','Coffee','Tan','Beige','Cream']),reason:'neutral-nearest'};
    }
    return{...match,family,lab,chroma:C,hue:h};
  }

  function patternStats(sample){
    const mean=sample.lum.reduce((a,x)=>a+x,0)/sample.lum.length;
    const variance=sample.lum.reduce((a,x)=>a+(x-mean)**2,0)/sample.lum.length;
    const avgSat=sample.sat.reduce((a,x)=>a+x,0)/sample.sat.length;
    let pattern='Solid';
    if(variance>2200&&avgSat>45)pattern='Floral/Print';
    else if(variance>1500)pattern='Graphic';
    return{pattern,variance,avgSat};
  }

  function scoreCluster(cluster,classification,stats){
    let score=cluster.share;
    const {family,lab,chroma:C}=classification;
    if(family==='neutral'&&lab.L<48&&C<12)score-=.24; // shadow/black/gray suppression
    if(family!=='neutral'&&C>=18)score+=Math.min(.16,(C-18)/150);
    // Pattern-independent variation evidence lets stripe/plaid accents matter even before the real pattern phase.
    if(family!=='neutral'&&stats.variance>900&&cluster.share>=.10&&C>=20)score+=.11;
    if(family!=='neutral'&&stats.variance>1400&&cluster.share>=.075&&C>=28)score+=.08;
    return score;
  }

  function selectPrimaryCluster(clusters,stats){
    const scored=clusters.map(cluster=>{
      const classification=classifyClusterColor(cluster);
      return{cluster,classification,score:scoreCluster(cluster,classification,stats)};
    }).sort((a,b)=>b.score-a.score);

    // If a neutral/shadow cluster still wins, allow a substantial strongly chromatic runner-up to displace it.
    if(scored.length>1&&scored[0].classification.family==='neutral'){
      const color=scored.find(x=>x.classification.family!=='neutral'&&x.cluster.share>=.09&&x.classification.chroma>=24);
      if(color&&color.score>=scored[0].score-.10){
        color.score+=.101;
        scored.sort((a,b)=>b.score-a.score);
      }
    }
    return{winner:scored[0]||null,scored};
  }

  async function analyzeImagePhase41(dataURL){
    const sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return{color:'Multicolor',pattern:'Solid'};
    const clusters=PHASE3.clusterPixels(sample.pixels),stats=patternStats(sample),selection=selectPrimaryCluster(clusters,stats);
    const winner=selection.winner,color=winner?.classification?.label||'Multicolor';
    window.AUDREY_SMART_SCAN_PHASE41.lastDiagnostics={
      version:VERSION,alphaAware:sample.alphaAware,transparentFraction:sample.transparentFraction,sampledPixels:sample.sampledPixels,
      color,pattern:stats.pattern,variance:stats.variance,avgSat:stats.avgSat,
      winner:winner?{label:winner.classification.label,family:winner.classification.family,share:winner.cluster.share,score:winner.score,rgb:[winner.cluster.r,winner.cluster.g,winner.cluster.b],lightness:winner.classification.lab.L,chroma:winner.classification.chroma,hue:winner.classification.hue,reason:winner.classification.reason}:null,
      clusters:selection.scored.map(x=>({label:x.classification.label,family:x.classification.family,share:x.cluster.share,score:x.score,rgb:[x.cluster.r,x.cluster.g,x.cluster.b],lightness:x.classification.lab.L,chroma:x.classification.chroma,hue:x.classification.hue,reason:x.classification.reason}))
    };
    return{color,pattern:stats.pattern};
  }

  async function comparePhase4(dataURL){
    const phase41=await analyzeImagePhase41(dataURL),phase4=PHASE4_ANALYZE?await PHASE4_ANALYZE(dataURL):null;
    return{version:VERSION,phase41,phase4,diagnostics:window.AUDREY_SMART_SCAN_PHASE41.lastDiagnostics};
  }

  window.AUDREY_SMART_SCAN_PHASE41={version:VERSION,paletteRgb:PALETTE_RGB,paletteLab:PALETTE_LAB,chroma,hueAngle,classifyHueFamily,classifyNeutral,classifyClusterColor,scoreCluster,selectPrimaryCluster,phase4AnalyzeImage:PHASE4_ANALYZE,analyzeImage:analyzeImagePhase41,comparePhase4,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase41;
  console.info(`Audrey Smart Scan ${VERSION} installed: hue-family calibration and chromatic-cluster promotion enabled.`);
})();
