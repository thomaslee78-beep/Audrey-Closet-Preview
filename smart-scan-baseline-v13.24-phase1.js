/* Audrey Closet v13.24 — Smart Scan Phase 1 baseline harness
 * Development-only diagnostics. Does not replace or wrap analyzeImage().
 * Purpose: preserve current behavior as a measurable baseline before algorithm changes.
 */
(function(){
  'use strict';

  const VERSION='13.24-phase1-baseline1';
  const BASELINE_MAIN_SHA='2791575a227ce4c6828def0bb287c8094ae53b6a';

  const CASES=[
    {id:'solid-white',group:'color',label:'Solid White',expected:{color:'White',pattern:'Solid'},draw:c=>fill(c,'#f3f1eb')},
    {id:'solid-black',group:'color',label:'Solid Black',expected:{color:'Black',pattern:'Solid'},draw:c=>fill(c,'#232323')},
    {id:'solid-navy',group:'color',label:'Solid Navy',expected:{color:'Navy',pattern:'Solid'},draw:c=>fill(c,'#32415c')},
    {id:'solid-orange',group:'color',label:'Solid Orange',expected:{color:'Orange',pattern:'Solid'},draw:c=>fill(c,'#d17838')},
    {id:'solid-red',group:'color',label:'Solid Red',expected:{color:'Red',pattern:'Solid'},draw:c=>fill(c,'#b23f3d')},
    {id:'solid-green',group:'color',label:'Solid Green',expected:{color:'Green',pattern:'Solid'},draw:c=>fill(c,'#437546')},
    {id:'stripe-green-white',group:'pattern',label:'Green / White Stripe',expected:{color:'White',pattern:'Stripe'},draw:c=>stripes(c,'#f3f1eb','#437546',12,'vertical')},
    {id:'stripe-navy-white',group:'pattern',label:'Navy / White Stripe',expected:{color:'White',pattern:'Stripe'},draw:c=>stripes(c,'#f3f1eb','#32415c',10,'horizontal')},
    {id:'plaid-red-navy',group:'pattern',label:'Red / Navy Plaid',expected:{color:'Red',pattern:'Plaid'},draw:c=>plaid(c,'#c7b9a2','#b23f3d','#32415c')},
    {id:'colorblock-blue-white',group:'pattern',label:'Blue / White Colorblock',expected:{color:'Blue',pattern:'Colorblock'},draw:c=>colorblock(c,['#4e75a4','#f3f1eb','#4e75a4'])},
    {id:'graphic-black-white',group:'pattern',label:'White Tee + Dark Graphic',expected:{color:'White',pattern:'Graphic'},draw:c=>graphic(c,'#f3f1eb','#232323')},
    {id:'print-green-pink',group:'pattern',label:'Green / Pink Distributed Print',expected:{color:'Green',pattern:'Floral/Print'},draw:c=>distributedPrint(c,'#437546','#c46b84')}
  ];

  function canvas(){const c=document.createElement('canvas');c.width=c.height=240;return c}
  function ctx(c){return c.getContext('2d',{willReadFrequently:true})}
  function fill(c,color){const x=ctx(c);x.fillStyle=color;x.fillRect(0,0,c.width,c.height)}
  function stripes(c,a,b,width,direction){const x=ctx(c);x.fillStyle=a;x.fillRect(0,0,c.width,c.height);x.fillStyle=b;if(direction==='horizontal'){for(let y=0;y<c.height;y+=width*2)x.fillRect(0,y,c.width,width)}else{for(let xx=0;xx<c.width;xx+=width*2)x.fillRect(xx,0,width,c.height)}}
  function plaid(c,base,a,b){const x=ctx(c);x.fillStyle=base;x.fillRect(0,0,c.width,c.height);x.globalAlpha=.88;x.fillStyle=a;for(let xx=8;xx<c.width;xx+=42)x.fillRect(xx,0,17,c.height);x.fillStyle=b;for(let y=12;y<c.height;y+=48)x.fillRect(0,y,c.width,16);x.globalAlpha=1}
  function colorblock(c,colors){const x=ctx(c),w=c.width/colors.length;colors.forEach((color,i)=>{x.fillStyle=color;x.fillRect(i*w,0,Math.ceil(w),c.height)})}
  function graphic(c,bg,ink){const x=ctx(c);x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=ink;x.fillRect(70,72,100,80);x.fillStyle=bg;x.font='bold 28px system-ui';x.textAlign='center';x.fillText('A',120,122)}
  function distributedPrint(c,bg,accent){const x=ctx(c);x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=accent;for(let y=18;y<c.height;y+=42){for(let xx=18+(y%84?15:0);xx<c.width;xx+=46){x.beginPath();x.arc(xx,y,9,0,Math.PI*2);x.fill()}}}

  function toDataURL(testCase){const c=canvas();testCase.draw(c);return c.toDataURL('image/png')}
  function compare(actual,expected){return{color:actual?.color===expected.color,pattern:actual?.pattern===expected.pattern,all:actual?.color===expected.color&&actual?.pattern===expected.pattern}}

  async function runSyntheticSuite(){
    if(typeof window.analyzeImage!=='function')throw new Error('Current analyzeImage() is not available');
    const started=performance.now(),results=[];
    for(const testCase of CASES){
      const actual=await window.analyzeImage(toDataURL(testCase));
      results.push({id:testCase.id,group:testCase.group,label:testCase.label,expected:{...testCase.expected},actual,pass:compare(actual,testCase.expected)});
    }
    const summary={total:results.length,fullPass:results.filter(r=>r.pass.all).length,colorPass:results.filter(r=>r.pass.color).length,patternPass:results.filter(r=>r.pass.pattern).length,durationMs:Math.round(performance.now()-started)};
    const report={version:VERSION,baselineMainSha:BASELINE_MAIN_SHA,createdAt:new Date().toISOString(),summary,results};
    try{sessionStorage.setItem('audreySmartScanPhase1LastSynthetic',JSON.stringify(report))}catch{}
    console.table(results.map(r=>({case:r.label,expectedColor:r.expected.color,actualColor:r.actual.color,colorOK:r.pass.color,expectedPattern:r.expected.pattern,actualPattern:r.actual.pattern,patternOK:r.pass.pattern})));
    console.info('Audrey Smart Scan Phase 1 baseline',report);
    return report;
  }

  async function runDataURL(dataURL,meta={}){
    if(typeof window.analyzeImage!=='function')throw new Error('Current analyzeImage() is not available');
    if(!dataURL)throw new Error('A data URL is required');
    const actual=await window.analyzeImage(dataURL);
    return{version:VERSION,baselineMainSha:BASELINE_MAIN_SHA,createdAt:new Date().toISOString(),meta:{...meta},actual};
  }

  async function runCurrentItem(){
    const preview=document.querySelector('#itemPhotoPreview');
    const src=preview?.getAttribute('src')||preview?.src||'';
    if(!src||!src.startsWith('data:image/'))throw new Error('Open an item with a working photo first');
    return runDataURL(src,{source:'itemWorkingPhoto-preview'});
  }

  function cases(){return CASES.map(x=>({id:x.id,group:x.group,label:x.label,expected:{...x.expected}}))}
  function lastSynthetic(){try{return JSON.parse(sessionStorage.getItem('audreySmartScanPhase1LastSynthetic')||'null')}catch{return null}}

  window.AUDREY_SMART_SCAN_PHASE1={version:VERSION,baselineMainSha:BASELINE_MAIN_SHA,cases,runSyntheticSuite,runDataURL,runCurrentItem,lastSynthetic};
  console.info(`Audrey Smart Scan ${VERSION} baseline harness loaded. Current analyzeImage() is unchanged.`);
})();
