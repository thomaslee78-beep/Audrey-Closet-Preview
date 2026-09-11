/* Audrey Cloud Smart Scan — Phase 7A7C production hardening
 * Pre-provider safety gate. Valid requests are delegated unchanged to the validated base Worker.
 */
export const HARDENING_VERSION='13.24-phase7a7c-hardening1';
export const HARDENING_DEFAULTS=Object.freeze({
  maxImageWidth:4096,
  maxImageHeight:4096,
  maxImagePixels:16_000_000,
  burstWindowSeconds:60,
  burstLimit:10,
  maxProviderOutputTokens:500
});

function asPositiveInt(value,fallback,min=1,max=Number.MAX_SAFE_INTEGER){
  const n=Number(value);return Number.isFinite(n)&&n>=min?Math.min(max,Math.floor(n)):fallback;
}
function limits(env){return{
  maxImageWidth:asPositiveInt(env.SMARTSCAN_MAX_IMAGE_WIDTH,HARDENING_DEFAULTS.maxImageWidth,320,8192),
  maxImageHeight:asPositiveInt(env.SMARTSCAN_MAX_IMAGE_HEIGHT,HARDENING_DEFAULTS.maxImageHeight,320,8192),
  maxImagePixels:asPositiveInt(env.SMARTSCAN_MAX_IMAGE_PIXELS,HARDENING_DEFAULTS.maxImagePixels,100_000,40_000_000),
  burstWindowSeconds:asPositiveInt(env.SMARTSCAN_BURST_WINDOW_SECONDS,HARDENING_DEFAULTS.burstWindowSeconds,10,3600),
  burstLimit:asPositiveInt(env.SMARTSCAN_BURST_LIMIT,HARDENING_DEFAULTS.burstLimit,1,100),
  maxProviderOutputTokens:HARDENING_DEFAULTS.maxProviderOutputTokens
}}
function versionParts(value){const m=String(value||'').match(/\d+/g);return(m||[]).map(Number)}
export function compareVersions(actual,minimum){
  if(!String(minimum||'').trim())return 0;
  const a=versionParts(actual),b=versionParts(minimum);if(!a.length)return-1;
  const n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const av=a[i]||0,bv=b[i]||0;if(av>bv)return 1;if(av<bv)return-1}return 0;
}
async function minimumClientVersion(env){
  if(!env.AUDREY_DB)return'';
  try{const row=await env.AUDREY_DB.prepare("SELECT value FROM app_config WHERE namespace='smartscan' AND key='production' LIMIT 1").first();if(!row?.value)return'';return String(JSON.parse(row.value)?.minimumClientVersion||'').trim().slice(0,80)}catch{return''}
}
function decodePrefix(dataUrl,maxBytes=65536){
  const comma=dataUrl.indexOf(',');if(comma<0)return null;try{const raw=atob(dataUrl.slice(comma+1,comma+1+Math.ceil(maxBytes*4/3)+8));const len=Math.min(raw.length,maxBytes),out=new Uint8Array(len);for(let i=0;i<len;i++)out[i]=raw.charCodeAt(i);return out}catch{return null}
}
function u16be(b,i){return(b[i]<<8)|b[i+1]}
function u24le(b,i){return b[i]|(b[i+1]<<8)|(b[i+2]<<16)}
function u32be(b,i){return((b[i]*0x1000000)+((b[i+1]<<16)|(b[i+2]<<8)|b[i+3]))>>>0}
function imageDimensions(dataUrl){
  const b=decodePrefix(dataUrl);if(!b||b.length<12)return null;
  // PNG
  if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47&&b.length>=24)return{format:'png',width:u32be(b,16),height:u32be(b,20)};
  // GIF
  if(b[0]===0x47&&b[1]===0x49&&b[2]===0x46&&b.length>=10)return{format:'gif',width:b[6]|(b[7]<<8),height:b[8]|(b[9]<<8)};
  // WebP VP8X
  if(b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50){
    const tag=String.fromCharCode(...b.slice(12,16));
    if(tag==='VP8X'&&b.length>=30)return{format:'webp',width:1+u24le(b,24),height:1+u24le(b,27)};
    if(tag==='VP8 '&&b.length>=30&&b[23]===0x9d&&b[24]===0x01&&b[25]===0x2a)return{format:'webp',width:u16be(b,26)&0x3fff,height:u16be(b,28)&0x3fff};
    if(tag==='VP8L'&&b.length>=25&&b[20]===0x2f){const bits=(b[21]|(b[22]<<8)|(b[23]<<16)|(b[24]<<24))>>>0;return{format:'webp',width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1}}
  }
  // JPEG SOF marker scan
  if(b[0]===0xff&&b[1]===0xd8){let i=2;while(i+8<b.length){if(b[i]!==0xff){i++;continue}while(i<b.length&&b[i]===0xff)i++;const marker=b[i++];if(marker===0xd8||marker===0xd9||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;if(i+1>=b.length)break;const len=u16be(b,i);if(len<2||i+len>b.length)break;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&i+7<b.length)return{format:'jpeg',height:u16be(b,i+3),width:u16be(b,i+5)};i+=len} }
  return null;
}
async function sha256(text){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function burstCheck(request,env,body,lim){
  if(!env.SMARTSCAN_USAGE_KV)return{allowed:true,mode:'log-only',remaining:null};
  const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/lim.burstWindowSeconds),ip=request.headers.get('CF-Connecting-IP')||'unknown',install=String(body.installId||'no-install').slice(0,160),hash=await sha256(`burst:${install}:${ip}:${bucket}`),key='burst:'+hash;
  const count=Number(await env.SMARTSCAN_USAGE_KV.get(key)||0);if(count>=lim.burstLimit)return{allowed:false,mode:'kv',remaining:0,retryAfter:Math.max(1,lim.burstWindowSeconds-(now%lim.burstWindowSeconds))};
  await env.SMARTSCAN_USAGE_KV.put(key,String(count+1),{expirationTtl:Math.max(60,lim.burstWindowSeconds*2)});return{allowed:true,mode:'kv',remaining:Math.max(0,lim.burstLimit-count-1)}
}

export async function hardenAnalyze({request,env,origin,json,error,baseWorker,ctx}){
  const copy=request.clone();let body;try{body=await copy.json()}catch{return baseWorker.fetch(request,env,ctx)}
  if(body?.appId!=='audrey-closet'||body?.feature!=='smartscan')return baseWorker.fetch(request,env,ctx);
  const lim=limits(env),clientBuild=String(body?.client?.build||request.headers.get('X-Audrey-Build')||'').slice(0,120),minimum=await minimumClientVersion(env);
  if(minimum&&compareVersions(clientBuild,minimum)<0)return error('CLIENT_UPDATE_REQUIRED','This Audrey Closet version is too old for AI Smart Scan. Update the app and try again.',426,origin);
  const image=String(body.image||'');if(image.startsWith('data:image/')){
    const dim=imageDimensions(image);if(dim){const pixels=dim.width*dim.height;if(dim.width>lim.maxImageWidth||dim.height>lim.maxImageHeight||pixels>lim.maxImagePixels)return error('IMAGE_DIMENSIONS_TOO_LARGE',`Smart Scan image dimensions are too large (${dim.width}×${dim.height}).`,413,origin)}
  }
  const burst=await burstCheck(request,env,body,lim);if(!burst.allowed){const response=error('BURST_LIMITED','Too many Smart Scan requests in a short period. Please wait and try again.',429,origin);response.headers.set('Retry-After',String(burst.retryAfter||lim.burstWindowSeconds));return response}
  return baseWorker.fetch(request,env,ctx);
}

export function hardeningStatus(env){const l=limits(env);return{version:HARDENING_VERSION,...l,quotaMode:env.SMARTSCAN_USAGE_KV?'kv-enforced':'log-only',burstMode:env.SMARTSCAN_USAGE_KV?'kv-enforced':'log-only',imageDimensionValidation:true,minimumClientVersionEnforcement:true,providerOutputCeilingEnforced:l.maxProviderOutputTokens===500}}
