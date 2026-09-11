/* Audrey Closet v13.24 — Smart Scan Phase 4.3
 * Narrow neutral-discrimination refinement on top of Phase 4.2.
 * Gray now requires affirmative distributed neutrality evidence; persistent hue bias
 * redirects muted pixels back toward color families. Existing 4.2 color calibration stays intact.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase4.3-neutral1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE4=window.AUDREY_SMART_SCAN_PHASE4;
  const PHASE42=window.AUDREY_SMART_SCAN_PHASE42;
  const PHASE42_ANALYZE=typeof window.analyzeImage==='function'?window.analyzeImage:null;

  if(!PHASE2?.sampleGarmentPixels||!PHASE4?.rgbToLab||!PHASE42?.analyzeImage){
    console.warn('Audrey Smart Scan Phase 4.3 skipped: Phase 2/4/4.2 dependencies unavailable.');
    return;
  }

  function chroma(lab){return Math.hypot(lab.a,lab.b)}
  function median(arr){if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}

  function neutralEvidence(sample){
    let lowChroma=0,strictNeutral=0,brightNeutral=0,darkNeutral=0;
    let redBias=0,greenBias=0,blueBias=0,warmBias=0,total=0;
    const deviations=[],lights=[];
    for(const p of sample.pixels){
      const lab=PHASE4.rgbToLab(p.r,p.g,p.b),C=chroma(lab),dev=Math.max(p.r,p.g,p.b)-Math.min(p.r,p.g,p.b);
      total++;deviations.push(dev);lights.push(lab.L);
      if(C<=12)lowChroma++;
      if(C<=8&&dev<=16)strictNeutral++;
      if(lab.L>=78&&C<=12)brightNeutral++;
      if(lab.L<=28&&C<=10)darkNeutral++;
      if(p.r-p.g>=5&&p.r-p.b>=5)redBias++;
      if(p.g-p.r>=5&&p.g-p.b>=5)greenBias++;
      if(p.b-p.r>=5&&p.b-p.g>=5)blueBias++;
      if((p.r+p.g)/2-p.b>=7)warmBias++;
    }
    const d=n=>total?n/total:0;
    const biases={red:d(redBias),green:d(greenBias),blue:d(blueBias),warm:d(warmBias)};
    const dominantBias=Math.max(biases.red,biases.green,biases.blue,biases.warm);
    return{
      total,
      lowChromaShare:d(lowChroma),
      strictNeutralShare:d(strictNeutral),
      brightNeutralShare:d(brightNeutral),
      darkNeutralShare:d(darkNeutral),
      medianDeviation:median(deviations),
      medianLightness:median(lights),
      biases,
      dominantBias,
      grayConfidence:d(strictNeutral)*.55+d(lowChroma)*.30+Math.max(0,1-Math.min(1,median(deviations)/26))*.15-dominantBias*.55
    };
  }

  function mutedFamilyFromBias(evidence,phase42Diag){
    const b=evidence.biases;
    const clusters=phase42Diag?.clusters||[];
    const distributed=clusters.filter(c=>c?.spatial?.coverage>=.18).sort((a,b)=>b.share-a.share);
    const existingColor=distributed.find(c=>c.family&&c.family!=='neutral');
    if(existingColor&&existingColor.share>=.07)return existingColor.label;
    if(b.green>=.18)return'Green';
    if(b.blue>=.18)return evidence.medianLightness<34?'Navy':'Blue';
    if(b.red>=.18)return evidence.medianLightness<34?'Burgundy':'Red';
    if(b.warm>=.24){
      if(evidence.medianLightness<42)return'Olive';
      return'Tan';
    }
    return null;
  }

  function refineNeutralResult(base,evidence,diag){
    let color=base.color,reason='phase4.2';
    const white=diag?.white;
    if(white&&((white.brightNeutralShare>=.48&&white.l90>=84)||(white.score>=.45&&evidence.brightNeutralShare>=.40))){
      return{color:'White',reason:'phase4.3-white-protected'};
    }

    if(color==='Gray'){
      // Gray must be genuinely neutral throughout the garment, not merely low-saturation.
      const grayStrong=evidence.strictNeutralShare>=.46&&evidence.lowChromaShare>=.62&&evidence.dominantBias<.22;
      const grayModerate=evidence.grayConfidence>=.45&&evidence.strictNeutralShare>=.34&&evidence.dominantBias<.17;
      if(grayStrong||grayModerate)return{color:'Gray',reason:'phase4.3-gray-affirmed'};
      const muted=mutedFamilyFromBias(evidence,diag);
      if(muted)return{color:muted,reason:'phase4.3-gray-hue-bias'};
      // If hue evidence is weak but the garment is predominantly charcoal neutral, Gray remains appropriate.
      if(evidence.lowChromaShare>=.70&&evidence.medianDeviation<=20)return{color:'Gray',reason:'phase4.3-charcoal-neutral'};
    }

    if(color==='Black'){
      // Black remains reserved for overwhelmingly dark, achromatic garments.
      const trueBlack=evidence.darkNeutralShare>=.62&&evidence.strictNeutralShare>=.50&&evidence.dominantBias<.14;
      if(trueBlack)return{color:'Black',reason:'phase4.3-black-affirmed'};
      const muted=mutedFamilyFromBias(evidence,diag);
      if(muted)return{color:muted,reason:'phase4.3-black-hue-bias'};
      if(evidence.lowChromaShare>=.68&&evidence.medianLightness>=20)return{color:'Gray',reason:'phase4.3-black-to-charcoal'};
    }

    return{color,reason};
  }

  async function analyzeImagePhase43(dataURL){
    const base=await PHASE42_ANALYZE(dataURL);
    const diag42=window.AUDREY_SMART_SCAN_PHASE42?.lastDiagnostics||null;
    const sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return base;
    const evidence=neutralEvidence(sample),refined=refineNeutralResult(base,evidence,diag42);
    window.AUDREY_SMART_SCAN_PHASE43.lastDiagnostics={
      version:VERSION,
      sampleSize:PHASE2.sampleSize||sample.sampleSize||256,
      baseColor:base.color,
      color:refined.color,
      pattern:base.pattern,
      reason:refined.reason,
      evidence,
      phase42:diag42
    };
    return{color:refined.color,pattern:base.pattern};
  }

  async function comparePhase42(dataURL){
    const phase43=await analyzeImagePhase43(dataURL);
    const phase42=PHASE42_ANALYZE?await PHASE42_ANALYZE(dataURL):null;
    return{version:VERSION,phase43,phase42,diagnostics:window.AUDREY_SMART_SCAN_PHASE43.lastDiagnostics};
  }

  window.AUDREY_SMART_SCAN_PHASE43={version:VERSION,neutralEvidence,mutedFamilyFromBias,refineNeutralResult,phase42AnalyzeImage:PHASE42_ANALYZE,analyzeImage:analyzeImagePhase43,comparePhase42,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase43;
  console.info(`Audrey Smart Scan ${VERSION} installed: Gray/Black now require affirmative distributed neutral evidence.`);
})();
