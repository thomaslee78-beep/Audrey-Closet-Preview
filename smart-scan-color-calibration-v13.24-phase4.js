/* Audrey Closet v13.24 — Smart Scan Phase 4
 * Perceptual Lab color calibration + dark-neutral suppression on top of Phase 3 clustering.
 * Pattern classifier remains unchanged so Phase 4 isolates color calibration behavior.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase4-lab1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE3=window.AUDREY_SMART_SCAN_PHASE3;
  const PHASE3_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;

  if(!PHASE2?.sampleGarmentPixels||!PHASE3?.clusterPixels){
    console.warn('Audrey Smart Scan Phase 4 skipped: Phase 2/3 dependencies are unavailable.');
    return;
  }

  const PALETTE_RGB={
    Black:[35,35,35],White:[242,240,234],Cream:[235,222,190],Gray:[135,135,130],
    Brown:[117,82,60],Coffee:[108,81,66],Tan:[177,145,105],Beige:[211,192,157],
    Burgundy:[125,53,71],Red:[178,63,61],Orange:[209,120,53],Yellow:[220,190,65],
    Mustard:[195,160,75],Olive:[102,113,90],Green:[67,117,70],Mint:[151,196,166],
    Turquoise:[77,142,138],Blue:[78,117,164],Navy:[50,65,92],Purple:[116,88,139],Pink:[196,107,132]
  };

  function srgbToLinear(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}
  function rgbToLab(r,g,b){
    r=srgbToLinear(r);g=srgbToLinear(g);b=srgbToLinear(b);
    let x=(r*.4124564+g*.3575761+b*.1804375)/.95047;
    let y=(r*.2126729+g*.7151522+b*.0721750)/1.00000;
    let z=(r*.0193339+g*.1191920+b*.9503041)/1.08883;
    const f=t=>t>.008856451679?Math.cbrt(t):(7.787037*t)+(16/116);
    x=f(x);y=f(y);z=f(z);
    return{L:(116*y)-16,a:500*(x-y),b:200*(y-z)};
  }
  function chroma(lab){return Math.hypot(lab.a,lab.b)}
  function deltaE76(a,b){return Math.hypot(a.L-b.L,a.a-b.a,a.b-b.b)}

  const PALETTE_LAB=Object.fromEntries(Object.entries(PALETTE_RGB).map(([name,rgb])=>[name,rgbToLab(...rgb)]));

  function calibratedPaletteScore(name,lab){
    let score=deltaE76(lab,PALETTE_LAB[name]),C=chroma(lab);
    // Prevent dark but clearly chromatic reds/blues/etc. from collapsing into Black/Gray.
    if(name==='Black'&&C>=12)score+=10+Math.min(18,(C-12)*.65);
    if(name==='Gray'&&C>=16)score+=Math.min(12,(C-16)*.45);
    // White should remain a high-lightness result rather than a generic nearest neutral.
    if(name==='White'&&lab.L<82)score+=Math.min(18,(82-lab.L)*.55);
    return score;
  }

  function nearestColorLab(r,g,b){
    const lab=rgbToLab(r,g,b),C=chroma(lab);
    // Strong achromatic gates are intentionally conservative.
    if(lab.L<=16&&C<13)return{label:'Black',lab,chroma:C,reason:'neutral-gate'};
    if(C<6){
      if(lab.L>=91)return{label:'White',lab,chroma:C,reason:'neutral-gate'};
      if(lab.L<=22)return{label:'Black',lab,chroma:C,reason:'neutral-gate'};
      return{label:'Gray',lab,chroma:C,reason:'neutral-gate'};
    }
    let best='Multicolor',bestScore=Infinity;
    for(const name of Object.keys(PALETTE_LAB)){
      const score=calibratedPaletteScore(name,lab);
      if(score<bestScore){bestScore=score;best=name}
    }
    return{label:best,lab,chroma:C,score:bestScore,reason:'lab-nearest'};
  }

  function clusterPrimaryScore(cluster){
    const calibrated=nearestColorLab(cluster.r,cluster.g,cluster.b);
    let score=cluster.share;
    const darkNeutral=calibrated.lab.L<38&&calibrated.chroma<15;
    const clearlyChromatic=calibrated.chroma>=18;
    if(darkNeutral)score-=.18;
    if(clearlyChromatic)score+=Math.min(.14,(calibrated.chroma-18)/180);
    return{cluster,calibrated,primaryScore:score,darkNeutral,clearlyChromatic};
  }

  function selectPrimaryClusterCalibrated(clusters){
    if(!clusters.length)return null;
    const scored=clusters.map(clusterPrimaryScore).sort((a,b)=>b.primaryScore-a.primaryScore);
    return{winner:scored[0],scored};
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

  async function analyzeImagePhase4(dataURL){
    const sample=await PHASE2.sampleGarmentPixels(dataURL),n=sample.sampledPixels;
    if(!n)return{color:'Multicolor',pattern:'Solid'};
    const clusters=PHASE3.clusterPixels(sample.pixels);
    const selection=selectPrimaryClusterCalibrated(clusters);
    const patternStats=classifyPatternPhase2(sample);
    const color=selection?.winner?.calibrated?.label||'Multicolor';
    window.AUDREY_SMART_SCAN_PHASE4.lastDiagnostics={
      version:VERSION,
      alphaAware:sample.alphaAware,
      transparentFraction:sample.transparentFraction,
      sampledPixels:n,
      color,
      pattern:patternStats.pattern,
      winner:selection?.winner?{
        label:selection.winner.calibrated.label,
        share:selection.winner.cluster.share,
        primaryScore:selection.winner.primaryScore,
        rgb:[selection.winner.cluster.r,selection.winner.cluster.g,selection.winner.cluster.b],
        lab:selection.winner.calibrated.lab,
        chroma:selection.winner.calibrated.chroma,
        reason:selection.winner.calibrated.reason
      }:null,
      clusters:(selection?.scored||[]).map(x=>({
        label:x.calibrated.label,share:x.cluster.share,primaryScore:x.primaryScore,
        rgb:[x.cluster.r,x.cluster.g,x.cluster.b],lab:x.calibrated.lab,chroma:x.calibrated.chroma,
        darkNeutral:x.darkNeutral,clearlyChromatic:x.clearlyChromatic
      })),
      variance:patternStats.variance,
      avgSat:patternStats.avgSat
    };
    return{color,pattern:patternStats.pattern};
  }

  async function comparePhase3(dataURL){
    const phase4=await analyzeImagePhase4(dataURL);
    const phase3=PHASE3_ANALYZE?await PHASE3_ANALYZE(dataURL):null;
    return{version:VERSION,phase4,phase3,diagnostics:window.AUDREY_SMART_SCAN_PHASE4.lastDiagnostics};
  }

  window.AUDREY_SMART_SCAN_PHASE4={
    version:VERSION,paletteRgb:PALETTE_RGB,paletteLab:PALETTE_LAB,rgbToLab,chroma,deltaE76,
    nearestColorLab,clusterPrimaryScore,selectPrimaryClusterCalibrated,
    phase3AnalyzeImage:PHASE3_ANALYZE,analyzeImage:analyzeImagePhase4,comparePhase3,lastDiagnostics:null
  };
  window.analyzeImage=analyzeImagePhase4;
  console.info(`Audrey Smart Scan ${VERSION} installed: Lab calibration and dark-neutral suppression enabled; pattern classifier unchanged.`);
})();
