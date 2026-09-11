/* Audrey Closet v13.24 — Smart Scan Phase 5.3
 * Pattern Color Normalization on top of Phase 5.2.
 * IMPORTANT: this module does NOT alter final garment color classification.
 * It creates a separate simplified color-family map used only for pattern detection,
 * collapsing lighting/shadow variants before Solid/Stripe/Plaid/Graphic analysis.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase5.3-pattern-normalization1';
  const PHASE2=window.AUDREY_SMART_SCAN_PHASE2;
  const PHASE4=window.AUDREY_SMART_SCAN_PHASE4;
  const PHASE42=window.AUDREY_SMART_SCAN_PHASE42;
  const PHASE51=window.AUDREY_SMART_SCAN_PHASE51;
  const PHASE52=window.AUDREY_SMART_SCAN_PHASE52;
  const COLOR_ANALYZE=PHASE52?.colorAnalyzeImage||PHASE51?.colorAnalyzeImage||PHASE42?.analyzeImage||null;
  const GRID=32;
  const TORSO=PHASE52?.torso||{x0:6,x1:25,y0:4,y1:29};
  const FAMILY_NAMES=['White','Gray','Black','Red','Orange','Yellow','Green','Turquoise','Blue','Purple','Pink','Brown'];
  const FAMILY_ID=Object.fromEntries(FAMILY_NAMES.map((x,i)=>[x,i]));
  const CHROMATIC=new Set(['Red','Orange','Yellow','Green','Turquoise','Blue','Purple','Pink','Brown']);

  if(!PHASE2?.sampleGarmentPixels||!PHASE4?.rgbToLab||!PHASE51?.stripeRepetition||!PHASE52?.classifyPattern52||!COLOR_ANALYZE){
    console.warn('Audrey Smart Scan Phase 5.3 skipped: Phase 2/4/5.1/5.2 dependencies unavailable.');
    return;
  }

  function chroma(lab){return Math.hypot(lab.a,lab.b)}
  function hueAngle(lab){let h=Math.atan2(lab.b,lab.a)*180/Math.PI;return h<0?h+360:h}

  function broadFamily(r,g,b){
    const lab=PHASE4.rgbToLab(r,g,b),C=chroma(lab),h=hueAngle(lab),mx=Math.max(r,g,b),mn=Math.min(r,g,b),spread=mx-mn;
    if(C<10){
      // Preserve weak but consistent dark hue bias before declaring a photographic neutral.
      if(spread>=7&&lab.L<48){
        if(g>=r+5&&g>=b+4)return{family:'Green',lab,chroma:C,hue:h,reason:'dark-channel-green'};
        if(b>=r+5&&b>=g+4)return{family:'Blue',lab,chroma:C,hue:h,reason:'dark-channel-blue'};
        if(r>=g+6&&r>=b+5)return{family:'Red',lab,chroma:C,hue:h,reason:'dark-channel-red'};
      }
      if(lab.L>=80)return{family:'White',lab,chroma:C,hue:h,reason:'neutral-white'};
      if(lab.L<=27)return{family:'Black',lab,chroma:C,hue:h,reason:'neutral-black'};
      return{family:'Gray',lab,chroma:C,hue:h,reason:'neutral-gray'};
    }
    if(h>=345||h<22)return{family:'Red',lab,chroma:C,hue:h,reason:'hue-red'};
    if(h<48)return{family:'Red',lab,chroma:C,hue:h,reason:'hue-red'};
    if(h<78)return{family:'Orange',lab,chroma:C,hue:h,reason:'hue-orange'};
    if(h<112)return{family:'Yellow',lab,chroma:C,hue:h,reason:'hue-yellow'};
    if(h<178)return{family:'Green',lab,chroma:C,hue:h,reason:'hue-green'};
    if(h<225)return{family:'Turquoise',lab,chroma:C,hue:h,reason:'hue-turquoise'};
    if(h<292)return{family:'Blue',lab,chroma:C,hue:h,reason:'hue-blue'};
    if(h<335)return{family:'Purple',lab,chroma:C,hue:h,reason:'hue-purple'};
    return{family:'Pink',lab,chroma:C,hue:h,reason:'hue-pink'};
  }

  function buildRawFamilyGrid(sample){
    const cells=Array.from({length:GRID*GRID},()=>({count:0,votes:new Map(),light:0,chroma:0}));
    for(const p of sample.pixels){
      const x=Math.min(GRID-1,Math.floor(p.x/sample.width*GRID)),y=Math.min(GRID-1,Math.floor(p.y/sample.height*GRID)),c=cells[y*GRID+x],f=broadFamily(p.r,p.g,p.b);
      c.count++;c.light+=f.lab.L;c.chroma+=f.chroma;c.votes.set(f.family,(c.votes.get(f.family)||0)+1);
    }
    return cells.map(c=>{
      if(!c.count)return null;
      let family='Gray',max=0;for(const[k,v]of c.votes){if(v>max){family=k;max=v}}
      return{family,label:FAMILY_ID[family],purity:max/c.count,count:c.count,lightness:c.light/c.count,chroma:c.chroma/c.count};
    });
  }

  function activeTorsoCells(grid){
    const out=[];for(let y=TORSO.y0;y<=TORSO.y1;y++)for(let x=TORSO.x0;x<=TORSO.x1;x++){const c=grid[y*GRID+x];if(c)out.push({x,y,c})}return out;
  }

  function familyShares(grid){
    const counts=Object.fromEntries(FAMILY_NAMES.map(n=>[n,0]));let total=0;
    for(const {c} of activeTorsoCells(grid)){counts[c.family]=(counts[c.family]||0)+1;total++}
    const shares=Object.fromEntries(FAMILY_NAMES.map(n=>[n,total?counts[n]/total:0]));
    const chromaticTotal=FAMILY_NAMES.filter(n=>CHROMATIC.has(n)).reduce((s,n)=>s+counts[n],0);
    let dominantChromatic='',dominantChromaticCount=0;
    for(const n of FAMILY_NAMES)if(CHROMATIC.has(n)&&counts[n]>dominantChromaticCount){dominantChromatic=n;dominantChromaticCount=counts[n]}
    const dominantChromaticShare=total?dominantChromaticCount/total:0;
    const dominantWithinChromatic=chromaticTotal?dominantChromaticCount/chromaticTotal:0;
    const chromaticShare=total?chromaticTotal/total:0;
    const neutralNames=['White','Gray','Black'];let dominantNeutral='Gray',dominantNeutralCount=0;
    for(const n of neutralNames)if(counts[n]>dominantNeutralCount){dominantNeutral=n;dominantNeutralCount=counts[n]}
    return{counts,shares,total,chromaticShare,dominantChromatic,dominantChromaticShare,dominantWithinChromatic,dominantNeutral,dominantNeutralShare:total?dominantNeutralCount/total:0};
  }

  function neighborFamilyCount(grid,x,y,family){
    let count=0,total=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GRID||ny>=GRID)continue;const c=grid[ny*GRID+nx];if(!c)continue;total++;if(c.family===family)count++;
    }
    return{count,total,share:total?count/total:0};
  }

  function normalizePatternGrid(rawGrid){
    const stats=familyShares(rawGrid),grid=rawGrid.map(c=>c?{...c}:null);
    const dominantColorStrong=stats.dominantChromatic&&stats.dominantWithinChromatic>=.58&&stats.chromaticShare>=.24;

    for(const {x,y,c} of activeTorsoCells(rawGrid)){
      const out=grid[y*GRID+x];if(!out)continue;
      if(dominantColorStrong&&['Gray','Black','White'].includes(c.family)){
        const n=neighborFamilyCount(rawGrid,x,y,stats.dominantChromatic);
        const neutralShare=stats.shares[c.family]||0;
        // Gray/black photographic variants inside a colored garment are normalized aggressively.
        if((c.family==='Gray'||c.family==='Black')&&(n.count>=2||stats.dominantChromaticShare>=.40||neutralShare<.12)){
          out.family=stats.dominantChromatic;out.label=FAMILY_ID[out.family];out.normalizedFrom=c.family;out.normalizationReason='colored-shadow-collapse';
        }
        // Bright white is retained when it is a meaningful design region; tiny isolated highlights/logos may collapse.
        else if(c.family==='White'&&stats.shares.White<.075&&n.share>=.55){
          out.family=stats.dominantChromatic;out.label=FAMILY_ID[out.family];out.normalizedFrom='White';out.normalizationReason='isolated-highlight-collapse';
        }
      }
    }

    // For neutral garments, collapse minor photographic neutral variants only when one neutral family overwhelmingly dominates.
    if(stats.chromaticShare<.18&&stats.dominantNeutralShare>=.68){
      for(const {x,y,c} of activeTorsoCells(rawGrid)){
        if(!['White','Gray','Black'].includes(c.family)||c.family===stats.dominantNeutral)continue;
        const share=stats.shares[c.family]||0,n=neighborFamilyCount(rawGrid,x,y,stats.dominantNeutral);
        if(share<.14&&n.share>=.45){const out=grid[y*GRID+x];out.family=stats.dominantNeutral;out.label=FAMILY_ID[out.family];out.normalizedFrom=c.family;out.normalizationReason='neutral-lighting-collapse'}
      }
    }

    // One conservative spatial smoothing pass removes one-cell shade noise without erasing real bands/graphics.
    const copy=grid.map(c=>c?{...c}:null);
    for(const {x,y,c} of activeTorsoCells(grid)){
      const votes=new Map();let total=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GRID||ny>=GRID)continue;const n=grid[ny*GRID+nx];if(!n)continue;total++;votes.set(n.family,(votes.get(n.family)||0)+1);
      }
      let family='',count=0;for(const[k,v]of votes){if(v>count){family=k;count=v}}
      if(total>=5&&family&&family!==c.family&&count/total>=.72){const out=copy[y*GRID+x];out.normalizedFrom=out.family;out.family=family;out.label=FAMILY_ID[family];out.normalizationReason='local-majority-smoothing'}
    }
    return{grid:copy,before:stats,after:familyShares(copy),dominantColorStrong};
  }

  function pseudoClusters(grid){
    const stats=familyShares(grid),clusters=[];
    for(const name of FAMILY_NAMES){const share=stats.shares[name]||0;if(share>0)clusters.push({name,share})}
    clusters.sort((a,b)=>b.share-a.share);return clusters;
  }

  function normalizedSolidDecision(grid){
    const stats=familyShares(grid),sorted=Object.entries(stats.shares).sort((a,b)=>b[1]-a[1]),top=sorted[0]||['Gray',0],second=sorted[1]||['Gray',0];
    if(top[1]>=.86&&second[1]<=.06)return{pattern:'Solid',confidence:.94,reason:'phase5.3-normalized-solid-strong'};
    if(top[1]>=.76&&second[1]<=.10)return{pattern:'Solid',confidence:.89,reason:'phase5.3-normalized-solid'};
    return null;
  }

  function classifyNormalizedPattern(normalizedGrid){
    const clusters=pseudoClusters(normalizedGrid),stripe=PHASE51.stripeRepetition(normalizedGrid),features={
      graphic:PHASE52.localizedGraphicFeatures(normalizedGrid),
      plaid:PHASE52.plaidEvidence(normalizedGrid),
      floral:PHASE52.floralEvidence(normalizedGrid,clusters),
      colorblock:PHASE52.colorblockEvidence(normalizedGrid),
      stripe
    };
    const solid=normalizedSolidDecision(normalizedGrid);
    if(solid)return{decision:solid,features};
    // Do not allow an older raw Plaid result to leak through. Phase 5.2 gets an Other fallback here,
    // so Plaid must pass the normalized torso-wide Plaid test itself.
    const decision=PHASE52.classifyPattern52(features,{pattern:'Other',confidence:.35,reason:'phase5.3-normalized-fallback'});
    return{decision,features};
  }

  async function analyzeImagePhase53(dataURL){
    const colorResult=await COLOR_ANALYZE(dataURL),sample=await PHASE2.sampleGarmentPixels(dataURL);
    if(!sample.sampledPixels)return colorResult;
    const rawGrid=buildRawFamilyGrid(sample),normalized=normalizePatternGrid(rawGrid),classified=classifyNormalizedPattern(normalized.grid);
    window.AUDREY_SMART_SCAN_PHASE53.lastDiagnostics={
      version:VERSION,color:colorResult.color,pattern:classified.decision.pattern,confidence:classified.decision.confidence,reason:classified.decision.reason,
      sampleSize:PHASE2.sampleSize||sample.sampleSize||256,gridSize:GRID,torso:TORSO,
      normalization:{dominantColorStrong:normalized.dominantColorStrong,before:normalized.before,after:normalized.after},features:classified.features
    };
    return{color:colorResult.color,pattern:classified.decision.pattern};
  }

  window.AUDREY_SMART_SCAN_PHASE53={version:VERSION,gridSize:GRID,torso:TORSO,broadFamily,buildRawFamilyGrid,familyShares,normalizePatternGrid,pseudoClusters,normalizedSolidDecision,classifyNormalizedPattern,colorAnalyzeImage:COLOR_ANALYZE,analyzeImage:analyzeImagePhase53,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase53;
  console.info(`Audrey Smart Scan ${VERSION} installed: pattern-only color normalization enabled; final Phase 4.2 color unchanged.`);
})();
