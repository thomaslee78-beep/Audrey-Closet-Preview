/* Audrey Closet v13.23 background-removal preview — Phase 4 Cutout Method lab.
 * Standard preserves the current production cutout path exactly.
 * Center Focus rescues likely centered subject pixels.
 * Edge Guide rescues subtle subject detail near detected boundaries/shadows.
 * Subject Grow expands outward only from confident foreground using source-color continuity.
 */
(function(){
  'use strict';

  const METHODS=[
    {id:'standard',label:'Standard',help:'Uses the current background removal method.',enabled:true},
    {id:'center',label:'Center Focus',help:'Protects likely subject pixels near the center after the normal cutout pass.',enabled:true},
    {id:'edge',label:'Edge Guide',help:'Protects subtle outlines and shadow-adjacent subject detail.',enabled:true},
    {id:'grow',label:'Subject Grow',help:'Grows outward from confident garment pixels when nearby source colors still look like the subject.',enabled:true}
  ];

  let studioCutoutMethod='standard';

  function normalizeMethod(value){return METHODS.some(x=>x.id===value)?value:'standard';}
  function methodDef(value=studioCutoutMethod){return METHODS.find(x=>x.id===normalizeMethod(value))||METHODS[0];}

  function ensureMethodStyles(){
    if(document.getElementById('studioCutoutMethodStyles'))return;
    const style=document.createElement('style');
    style.id='studioCutoutMethodStyles';
    style.textContent=`
      .studio-cutout-methods{display:grid;gap:7px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(108,81,66,.12)}
      .studio-cutout-method-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .studio-cutout-method-heading strong{font-size:11px;letter-spacing:.02em;color:#665c50}
      .studio-cutout-method-heading small{font-size:9px;color:#8a7d70}
      .studio-cutout-method-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      .studio-cutout-method-row::-webkit-scrollbar{display:none}
      .studio-cutout-method-btn{flex:0 0 auto;min-height:34px;padding:7px 10px;border:1px solid rgba(108,81,66,.18);border-radius:10px;background:#f8f1e3;color:#675d51;font:800 10px/1.05 system-ui,-apple-system,sans-serif}
      .studio-cutout-method-btn.active{background:#6d7863;border-color:#6d7863;color:#fff}
      .studio-cutout-method-btn:disabled{opacity:.42;filter:saturate(.55)}
      .studio-cutout-methods.is-original .studio-cutout-method-row{opacity:.5;pointer-events:none}
      .studio-cutout-method-help{margin:0;font-size:9.5px;line-height:1.3;color:#817568}
    `;
    document.head.appendChild(style);
  }

  function methodHost(){const modes=[...document.querySelectorAll('.studio-mode')];return modes.length?modes[0].parentElement:null;}
  function syncMethodUI(){
    const root=document.getElementById('studioCutoutMethods');if(!root)return;
    root.classList.toggle('is-original',typeof studioMode!=='undefined'&&studioMode==='original');
    root.querySelectorAll('[data-cutout-method]').forEach(btn=>{const active=btn.dataset.cutoutMethod===studioCutoutMethod;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
    const help=root.querySelector('.studio-cutout-method-help');if(help)help.textContent=methodDef().help;
  }
  function installMethodUI(){
    if(document.getElementById('studioCutoutMethods')){syncMethodUI();return;}
    const host=methodHost();if(!host)return;ensureMethodStyles();
    const root=document.createElement('section');root.id='studioCutoutMethods';root.className='studio-cutout-methods';root.setAttribute('aria-label','Cutout method');
    root.innerHTML=`<div class="studio-cutout-method-heading"><strong>Cutout method</strong><small>Preview lab</small></div><div class="studio-cutout-method-row" role="group" aria-label="Choose cutout method"></div><p class="studio-cutout-method-help"></p>`;
    const row=root.querySelector('.studio-cutout-method-row');
    METHODS.forEach(def=>{const btn=document.createElement('button');btn.type='button';btn.className='studio-cutout-method-btn';btn.dataset.cutoutMethod=def.id;btn.textContent=def.label;btn.disabled=!def.enabled;btn.setAttribute('aria-pressed','false');btn.addEventListener('click',async()=>{if(!def.enabled)return;studioCutoutMethod=def.id;syncMethodUI();if(typeof studioMode!=='undefined'&&studioMode!=='original'&&typeof applyStudioMode==='function')await applyStudioMode(studioMode);});row.appendChild(btn);});
    host.insertAdjacentElement('afterend',root);syncMethodUI();
  }

  function studioOriginalSourceV1323(){if(typeof studioTarget!=='undefined'&&studioTarget==='wish')return wishOriginalPhoto||studioSourcePhoto||wishWorkingPhoto||'';return itemOriginalPhoto||studioSourcePhoto||itemWorkingPhoto||'';}
  function estimateBorderColorV1323(data,w,h){const band=Math.max(2,Math.round(Math.min(w,h)*.035));let r=0,g=0,b=0,count=0;const step=Math.max(1,Math.round(Math.min(w,h)/220));function take(x,y){const i=(y*w+x)*4;r+=data[i];g+=data[i+1];b+=data[i+2];count++;}for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)if(x<band||x>=w-band||y<band||y>=h-band)take(x,y);return count?[r/count,g/count,b/count]:[255,255,255];}
  function lumaV1323(data,i){return data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;}
  function rgbDistanceV1323(data,i,j){const dr=data[i]-data[j],dg=data[i+1]-data[j+1],db=data[i+2]-data[j+2];return Math.sqrt(dr*dr+dg*dg+db*db);}
  async function sourceAndCutoutImagesV1323(){const src=studioOriginalSourceV1323();if(!src||!studioBaseCanvas)return null;const originalCanvas=await sourceToStudioCanvas(src);if(!originalCanvas)return null;const w=studioBaseCanvas.width,h=studioBaseCanvas.height;if(!w||!h)return null;const source=document.createElement('canvas');source.width=w;source.height=h;const sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(originalCanvas,0,0,w,h);const cutCtx=studioBaseCanvas.getContext('2d',{willReadFrequently:true});return {w,h,sourceCtx,cutCtx,srcImage:sourceCtx.getImageData(0,0,w,h),cutImage:cutCtx.getImageData(0,0,w,h)};}

  async function applyCenterFocusRescueV1323(mode){
    const pack=await sourceAndCutoutImagesV1323();if(!pack)return false;const {w,h,cutCtx,srcImage,cutImage}=pack;const s=srcImage.data,c=cutImage.data,bg=estimateBorderColorV1323(s,w,h),cx=(w-1)/2,cy=(h-1)/2,rx=Math.max(1,w*.46),ry=Math.max(1,h*.52),threshold=mode==='clean'?.50:.54;let rescued=0;
    for(let y=2;y<h-2;y++){const ny=(y-cy)/ry;for(let x=2;x<w-2;x++){const i=(y*w+x)*4;if(c[i+3]>=245)continue;const nx=(x-cx)/rx,radial=nx*nx+ny*ny;if(radial>=1)continue;const centerWeight=1-radial;if(centerWeight<.10)continue;const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2],colorDistance=Math.sqrt(dr*dr+dg*dg+db*db),left=(y*w+(x-2))*4,right=(y*w+(x+2))*4,up=((y-2)*w+x)*4,down=((y+2)*w+x)*4,gradient=Math.max(Math.abs(lumaV1323(s,left)-lumaV1323(s,right)),Math.abs(lumaV1323(s,up)-lumaV1323(s,down))),score=centerWeight*.60+Math.min(1,colorDistance/72)*.24+Math.min(1,gradient/34)*.16;if(score<threshold)continue;const confidence=Math.min(1,(score-threshold)/(1-threshold)),rescueAlpha=Math.round(95+160*Math.max(centerWeight*.55,confidence));c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],Math.min(255,rescueAlpha));rescued++;}}
    if(!rescued)return false;cutCtx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();return true;
  }

  async function applyEdgeGuideRescueV1323(mode){
    const pack=await sourceAndCutoutImagesV1323();if(!pack)return false;const {w,h,cutCtx,srcImage,cutImage}=pack;const s=srcImage.data,c=cutImage.data,bg=estimateBorderColorV1323(s,w,h),radius=mode==='clean'?3:2,threshold=mode==='clean'?.48:.53;let rescued=0;const alphaAt=(x,y)=>c[(y*w+x)*4+3];
    for(let y=radius+1;y<h-radius-1;y++)for(let x=radius+1;x<w-radius-1;x++){const i=(y*w+x)*4;if(c[i+3]>=245)continue;let nearForeground=0,strongForeground=0;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){if(!dx&&!dy)continue;const a=alphaAt(x+dx,y+dy);if(a>35)nearForeground++;if(a>180)strongForeground++;}if(!nearForeground||!strongForeground)continue;const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2],colorDistance=Math.sqrt(dr*dr+dg*dg+db*db),left=(y*w+(x-2))*4,right=(y*w+(x+2))*4,up=((y-2)*w+x)*4,down=((y+2)*w+x)*4,edgeSignal=Math.min(1,Math.max(Math.abs(lumaV1323(s,left)-lumaV1323(s,right)),Math.abs(lumaV1323(s,up)-lumaV1323(s,down)))/28),colorSignal=Math.min(1,colorDistance/68),continuity=Math.min(1,strongForeground/Math.max(2,(radius*2+1)*2)),score=edgeSignal*.46+continuity*.34+colorSignal*.20;if(score<threshold)continue;const confidence=Math.min(1,(score-threshold)/(1-threshold)),rescueAlpha=Math.round(80+150*Math.max(continuity*.72,confidence));c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],Math.min(235,rescueAlpha));rescued++;}
    if(!rescued)return false;cutCtx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();return true;
  }

  async function applySubjectGrowRescueV1323(mode){
    const pack=await sourceAndCutoutImagesV1323();if(!pack)return false;const {w,h,cutCtx,srcImage,cutImage}=pack;const s=srcImage.data,c=cutImage.data,bg=estimateBorderColorV1323(s,w,h);const passes=mode==='clean'?4:3,maxColorStep=mode==='clean'?52:46,bgReject=mode==='clean'?28:34;let rescued=0;
    const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    for(let pass=0;pass<passes;pass++){
      const next=[];
      for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
        const i=(y*w+x)*4;if(c[i+3]>=90)continue;
        let bestSeed=-1,bestAlpha=0,seedCount=0;
        for(const [dx,dy] of dirs){const ni=((y+dy)*w+(x+dx))*4,a=c[ni+3];if(a>=150){seedCount++;if(a>bestAlpha){bestAlpha=a;bestSeed=ni;}}}
        if(bestSeed<0||seedCount<(pass===0?2:1))continue;
        const dr=s[i]-bg[0],dg=s[i+1]-bg[1],db=s[i+2]-bg[2],bgDistance=Math.sqrt(dr*dr+dg*dg+db*db);if(bgDistance<bgReject)continue;
        const seedDistance=rgbDistanceV1323(s,i,bestSeed);if(seedDistance>maxColorStep+pass*7)continue;
        const localSimilarity=1-Math.min(1,seedDistance/(maxColorStep+pass*7));
        const bgSignal=Math.min(1,bgDistance/76),support=Math.min(1,seedCount/4),score=localSimilarity*.50+support*.30+bgSignal*.20;
        const threshold=.52+pass*.04;if(score<threshold)continue;
        const alpha=Math.round(Math.max(70,Math.min(225,bestAlpha*(.62-pass*.06)+support*45)));
        next.push([i,alpha]);
      }
      if(!next.length)break;
      for(const [i,alpha] of next){c[i]=s[i];c[i+1]=s[i+1];c[i+2]=s[i+2];c[i+3]=Math.max(c[i+3],alpha);rescued++;}
    }
    if(!rescued)return false;cutCtx.putImageData(cutImage,0,0);rebuildStudioWorkCanvas();return true;
  }

  const originalOpenPhotoStudioV1323Methods=openPhotoStudio;
  openPhotoStudio=async function(target='item'){const nextTarget=target==='wish'?'wish':'item',saved=nextTarget==='wish'?wishStudioState:itemStudioState;studioCutoutMethod=normalizeMethod(saved&&saved.cutoutMethod);const result=await originalOpenPhotoStudioV1323Methods.apply(this,arguments);installMethodUI();syncMethodUI();return result;};

  const originalApplyStudioModeV1323Methods=applyStudioMode;
  applyStudioMode=async function(mode,options){
    const result=await originalApplyStudioModeV1323Methods.apply(this,arguments);
    if(mode!=='original'){
      try{
        let rescued=false;
        if(studioCutoutMethod==='center')rescued=await applyCenterFocusRescueV1323(mode);
        else if(studioCutoutMethod==='edge')rescued=await applyEdgeGuideRescueV1323(mode);
        else if(studioCutoutMethod==='grow')rescued=await applySubjectGrowRescueV1323(mode);
        if(rescued&&document.getElementById('studioStatus')){
          const messages={center:'Center Focus applied. Compare with Standard to choose the cleaner result.',edge:'Edge Guide applied. Compare with Standard or Center Focus to choose the cleanest boundary.',grow:'Subject Grow applied. It expanded outward from confident garment pixels; compare for recovered hems, sleeves, and disconnected-looking edges.'};
          document.getElementById('studioStatus').textContent=messages[studioCutoutMethod]||'Preview method applied.';
        }
      }catch(error){console.error('Cutout method preview failed',error);if(document.getElementById('studioStatus'))document.getElementById('studioStatus').textContent='This preview method could not improve the photo. Standard cutout is still intact.';}
    }
    syncMethodUI();return result;
  };

  const originalApplyPhotoStudioV1323Methods=applyPhotoStudio;
  applyPhotoStudio=async function(){const target=typeof studioTarget!=='undefined'&&studioTarget==='wish'?'wish':'item';const result=await originalApplyPhotoStudioV1323Methods.apply(this,arguments);const stateRef=target==='wish'?wishStudioState:itemStudioState;if(stateRef&&typeof stateRef==='object')stateRef.cutoutMethod=normalizeMethod(studioCutoutMethod);return result;};

  window.__audreyCutoutMethodPreview={phase:4,getMethod:()=>studioCutoutMethod,methods:METHODS.map(x=>({...x}))};
})();
