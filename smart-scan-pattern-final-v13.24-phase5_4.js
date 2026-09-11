/* Audrey Closet v13.24 — Smart Scan Phase 5.4 Final Local Pattern
 * Finalizes Local Smart Scan v1.1 pattern behavior from Calibration Lab findings.
 * Keeps Phase 5.3 normalization, tightens Stripe threshold, prioritizes strong structured patterns,
 * preserves small-logo Solid protection, and lets meaningful Graphic evidence precede normalized Solid.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase5.4-final1';
  const P53=window.AUDREY_SMART_SCAN_PHASE53;
  if(!P53?.analyzeImage){console.warn('Smart Scan Phase 5.4 final skipped: Phase 5.3 unavailable.');return}

  const SETTINGS={
    stripeMinScore:.62,
    plaidMinAxis:.15,
    plaidMinCoverage:.42,
    graphicMinRegion:.065,
    graphicMaxCoverage:.42,
    smallLogoMaxRegion:.06
  };

  function normalizedSolid(diag){
    const shares=diag?.normalization?.after?.shares||{};
    const sorted=Object.values(shares).sort((a,b)=>b-a),top=sorted[0]||0,second=sorted[1]||0;
    if(top>=.86&&second<=.06)return{pattern:'Solid',confidence:.94,reason:'final-normalized-solid-strong'};
    if(top>=.76&&second<=.10)return{pattern:'Solid',confidence:.89,reason:'final-normalized-solid'};
    return null;
  }

  function classify(diag){
    if(!diag?.features)return{pattern:diag?.pattern||'Other',confidence:Number(diag?.confidence)||.40,reason:'final-no-pattern-features'};
    const {graphic:g={},plaid:p={},floral:f={},colorblock:cb={},stripe={}}=diag.features;

    // Preserve tiny-logo protection before allowing Graphic to challenge Solid.
    if(g.dominantShare>=.74&&g.secondaryShare<=.065&&g.largestShare<=SETTINGS.smallLogoMaxRegion){
      return{pattern:'Solid',confidence:.92,reason:'final-small-logo-solid'};
    }

    // Strong obvious structures get first priority. Stripe is deliberately stricter than the old .52 calibration default.
    if(stripe?.best?.score>=SETTINGS.stripeMinScore&&stripe.best.avgRuns>=4.5&&stripe.best.agreement>=.35){
      return{pattern:'Stripe',confidence:.90,reason:'final-strong-stripe'};
    }
    if(p.axes?.horizontal>=SETTINGS.plaidMinAxis&&p.axes?.vertical>=SETTINGS.plaidMinAxis&&p.runs?.rows>=.12&&p.runs?.cols>=.12&&p.nonDominantCoverage>=SETTINGS.plaidMinCoverage&&p.edgeReach>=.50&&g.localizedCoverage>=.38){
      return{pattern:'Plaid',confidence:.88,reason:'final-strong-plaid'};
    }
    if(f.meaningful>=3&&f.coverage>=.38&&f.smallComponents>=7){
      return{pattern:'Floral/Print',confidence:.86,reason:'final-strong-floral-print'};
    }

    // Calibration testing showed the existing Phase 5.3/5.2 Graphic evidence works better than the spatial experiments.
    const coherent=g.secondaryShare>=.085&&g.secondaryShare<=.48&&g.largestShare>=SETTINGS.graphicMinRegion&&g.localizedCoverage<=SETTINGS.graphicMaxCoverage;
    const complex=g.internalVariation>=.35||g.partCount>=2||g.largestBoxShare>=.08;
    const torso=P53.torso||{x0:6,x1:25};
    const centerOrEdge=g.centerDistance<=.34||(g.largest&&((g.largest.minX<=torso.x0+3)||(g.largest.maxX>=torso.x1-3)));
    if(coherent&&complex&&centerOrEdge)return{pattern:'Graphic',confidence:.87,reason:'final-localized-graphic'};
    if(g.secondaryShare>=.10&&g.secondaryShare<=.40&&g.largestShare>=Math.max(.09,SETTINGS.graphicMinRegion)&&g.localizedCoverage<=Math.min(.34,SETTINGS.graphicMaxCoverage)){
      return{pattern:'Graphic',confidence:.79,reason:'final-substantial-graphic'};
    }

    // Only after strong structure and meaningful Graphic evidence fail do we terminate as Solid.
    const solid=normalizedSolid(diag);if(solid)return solid;

    if(cb.meaningfulParts>=2&&cb.meaningfulParts<=4&&g.internalVariation<.35&&g.localizedCoverage>=.28){
      return{pattern:'Colorblock',confidence:.72,reason:'final-large-simple-regions'};
    }
    return{pattern:'Other',confidence:.40,reason:'final-pattern-fallback'};
  }

  async function analyzeImagePhase54(dataURL){
    const base=await P53.analyzeImage(dataURL);
    const phase53Diagnostics=JSON.parse(JSON.stringify(P53.lastDiagnostics||{}));
    const decision=classify(phase53Diagnostics);
    const diagnostics={version:VERSION,color:base?.color||'',pattern:decision.pattern,confidence:decision.confidence,reason:decision.reason,settings:{...SETTINGS},phase53:phase53Diagnostics};
    window.AUDREY_SMART_SCAN_PHASE54.lastDiagnostics=diagnostics;
    return{color:base?.color||'',pattern:decision.pattern};
  }

  window.AUDREY_SMART_SCAN_PHASE54={version:VERSION,settings:{...SETTINGS},classify,analyzeImage:analyzeImagePhase54,lastDiagnostics:null};
  window.analyzeImage=analyzeImagePhase54;
  console.info(`Audrey Smart Scan ${VERSION} loaded: Local Smart Scan v1.1 pattern finalized.`);
})();
