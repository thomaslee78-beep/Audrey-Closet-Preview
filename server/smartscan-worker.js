/* Audrey Closet Smart Scan Service — Phase 7A4C Admin1
 * Server-authoritative Smart Scan controls + Audrey Cloud admin foundation.
 * Required secret: OPENAI_API_KEY
 * Optional secret: AUDREY_ADMIN_TOKEN (admin API)
 * Optional bindings: SMARTSCAN_USAGE_KV (quotas), AUDREY_DB (D1 config + usage)
 */
const SERVICE_VERSION='13.24-phase7a4c-admin1-worker1';
const APP_ID='audrey-closet';
const FEATURE='smartscan';
const ALLOWED_MODELS=new Set(['gpt-5.6-luna','gpt-5.6-terra','gpt-5.6-sol']);
const ALLOWED_DETAILS=new Set(['low','high','auto']);
const ALLOWED_ORIGINS=new Set(['https://thomaslee78-beep.github.io']);
const DEFAULTS={enabled:true,model:'gpt-5.6-luna',detail:'auto',maxBodyBytes:8_000_000,maxImageChars:7_500_000,dailyInstallLimit:30,globalDailyLimit:500,minimumClientVersion:''};
const TAXONOMY={
  categories:['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc'],
  patterns:['Solid','Stripe','Plaid','Floral/Print','Graphic','Colorblock','Other'],
  colors:['Black','White','Cream','Gray','Brown','Coffee','Tan','Beige','Burgundy','Red','Orange','Yellow','Mustard','Olive','Green','Mint','Turquoise','Blue','Navy','Purple','Pink','Multicolor'],
  types:{
    Tops:['T-shirt','Long-sleeve T-shirt','Tank top','Blouse','Button-down shirt','Polo','Sweater','Sweatshirt','Hoodie','Cardigan','Crop top','Camisole','Other'],
    Bottoms:['Jeans','Pants / Trousers','Leggings','Shorts','Skirt','Joggers / Sweatpants','Other'],
    Dresses:['Mini Dress','Midi Dress','Maxi Dress','Shirt Dress','Sweater Dress','Slip Dress','Wrap Dress','Casual Dress','Formal / Event Dress','Other'],
    Outerwear:['Jacket','Coat','Blazer','Vest','Rain jacket','Puffer','Fleece','Other'],
    Shoes:['Sneakers','Athletic shoes','Boots','Sandals','Flats','Heels','Loafers','Slippers','Other'],
    Accessories:['Hat','Belt','Bag / Purse','Backpack','Scarf','Jewelry','Sunglasses','Hair accessory','Gloves','Other'],
    Misc:['Jumpsuit / Romper','Swimsuit','Socks','Tights','Underwear','Pajamas / Sleepwear','Costume','Uniform','Other']
  }
};

function cors(origin){const allowed=origin&&ALLOWED_ORIGINS.has(origin)?origin:'';return{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,X-Audrey-App,X-Audrey-Feature,X-Audrey-Request,X-Audrey-Channel,X-Audrey-Build','Access-Control-Max-Age':'86400','Vary':'Origin'}}
function json(body,status=200,origin=''){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(origin)}})}
function error(code,message,status,origin,retryAfter){const body={ok:false,error:{code,message}};if(retryAfter)body.retryAfter=retryAfter;return json(body,status,origin)}
function validOrigin(request){const origin=request.headers.get('Origin')||'';return Boolean(origin&&ALLOWED_ORIGINS.has(origin))}
function envInt(env,key,fallback){const n=Number(env?.[key]);return Number.isFinite(n)&&n>0?Math.floor(n):fallback}
function safeConfig(raw={}){const model=ALLOWED_MODELS.has(raw.model)?raw.model:DEFAULTS.model,detail=ALLOWED_DETAILS.has(raw.detail)?raw.detail:DEFAULTS.detail;return{enabled:raw.enabled===undefined?DEFAULTS.enabled:Boolean(raw.enabled),model,detail,maxBodyBytes:Math.max(100_000,Number(raw.maxBodyBytes)||DEFAULTS.maxBodyBytes),maxImageChars:Math.max(100_000,Number(raw.maxImageChars)||DEFAULTS.maxImageChars),dailyInstallLimit:Math.max(1,Number(raw.dailyInstallLimit)||DEFAULTS.dailyInstallLimit),globalDailyLimit:Math.max(1,Number(raw.globalDailyLimit)||DEFAULTS.globalDailyLimit),minimumClientVersion:String(raw.minimumClientVersion||'')}}
async function loadConfig(env){
  const fallback=safeConfig({enabled:String(env.SMARTSCAN_ENABLED??'true')!=='false',model:env.SMARTSCAN_MODEL||DEFAULTS.model,detail:env.SMARTSCAN_DETAIL||DEFAULTS.detail,maxBodyBytes:envInt(env,'SMARTSCAN_MAX_BODY_BYTES',DEFAULTS.maxBodyBytes),maxImageChars:envInt(env,'SMARTSCAN_MAX_IMAGE_CHARS',DEFAULTS.maxImageChars),dailyInstallLimit:envInt(env,'SMARTSCAN_DAILY_LIMIT',DEFAULTS.dailyInstallLimit),globalDailyLimit:envInt(env,'SMARTSCAN_GLOBAL_DAILY_LIMIT',DEFAULTS.globalDailyLimit),minimumClientVersion:env.SMARTSCAN_MIN_CLIENT_VERSION||''});
  if(!env.AUDREY_DB)return{...fallback,source:'environment-defaults'};
  try{const row=await env.AUDREY_DB.prepare("SELECT value FROM app_config WHERE namespace='smartscan' AND key='production' LIMIT 1").first();if(!row?.value)return{...fallback,source:'environment-defaults'};return{...safeConfig({...fallback,...JSON.parse(row.value)}),source:'d1'}}catch(err){console.warn('Smart Scan config D1 read failed; using defaults.',err);return{...fallback,source:'environment-defaults'}}
}
function publicConfig(cfg){return{enabled:cfg.enabled,model:cfg.model,detail:cfg.detail,maxBodyBytes:cfg.maxBodyBytes,maxImageChars:cfg.maxImageChars,dailyInstallLimit:cfg.dailyInstallLimit,globalDailyLimit:cfg.globalDailyLimit,minimumClientVersion:cfg.minimumClientVersion,source:cfg.source,serviceVersion:SERVICE_VERSION}}
function adminAuthorized(request,env){if(!env.AUDREY_ADMIN_TOKEN)return false;return(request.headers.get('Authorization')||'')==='Bearer '+env.AUDREY_ADMIN_TOKEN}
async function saveAdminConfig(env,next){if(!env.AUDREY_DB)throw Object.assign(new Error('AUDREY_DB D1 binding is not configured.'),{code:'D1_NOT_CONFIGURED'});const cfg=safeConfig(next);await env.AUDREY_DB.prepare("INSERT INTO app_config(namespace,key,value,updated_at) VALUES('smartscan','production',?,datetime('now')) ON CONFLICT(namespace,key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify(cfg)).run();return{...cfg,source:'d1'}}
function extractText(body){if(typeof body?.output_text==='string'&&body.output_text.trim())return body.output_text.trim();for(const out of body?.output||[])for(const c of out?.content||[])if((c?.type==='output_text'||c?.type==='text')&&typeof c.text==='string'&&c.text.trim())return c.text.trim();return''}
function schema(){const allTypes=[...new Set(Object.values(TAXONOMY.types).flat())];return{name:'audrey_smart_scan_result',strict:true,schema:{type:'object',additionalProperties:false,properties:{category:{type:'string',enum:['',...TAXONOMY.categories]},type:{type:'string',enum:['',...allTypes]},color:{type:'string',enum:['',...TAXONOMY.colors]},pattern:{type:'string',enum:['',...TAXONOMY.patterns]},brand:{type:'string'},size:{type:'string'},confidence:{type:'object',additionalProperties:false,properties:{category:{type:'number',minimum:0,maximum:1},type:{type:'number',minimum:0,maximum:1},color:{type:'number',minimum:0,maximum:1},pattern:{type:'number',minimum:0,maximum:1}},required:['category','type','color','pattern']}},required:['category','type','color','pattern','brand','size','confidence']}}}
function validateResult(raw){if(!raw||!TAXONOMY.categories.includes(raw.category)||!TAXONOMY.colors.includes(raw.color)||!TAXONOMY.patterns.includes(raw.pattern))return false;if(raw.type&&!(TAXONOMY.types[raw.category]||[]).includes(raw.type))return false;return true}
async function sha256(text){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function quota(request,env,installId,cfg){
  if(!env.SMARTSCAN_USAGE_KV)return{allowed:true,limit:cfg.dailyInstallLimit,remaining:null,globalRemaining:null,mode:'log-only'};
  const day=new Date().toISOString().slice(0,10),ip=request.headers.get('CF-Connecting-IP')||'unknown',hash=await sha256(`${APP_ID}:${FEATURE}:${day}:${installId||'no-install'}:${ip}`),installKey='quota:install:'+hash,globalKey=`quota:global:${APP_ID}:${FEATURE}:${day}`;
  const[installRaw,globalRaw]=await Promise.all([env.SMARTSCAN_USAGE_KV.get(installKey),env.SMARTSCAN_USAGE_KV.get(globalKey)]),installCount=Number(installRaw||0),globalCount=Number(globalRaw||0);
  if(globalCount>=cfg.globalDailyLimit)return{allowed:false,reason:'GLOBAL_LIMIT',limit:cfg.dailyInstallLimit,remaining:Math.max(0,cfg.dailyInstallLimit-installCount),globalRemaining:0,mode:'kv'};
  if(installCount>=cfg.dailyInstallLimit)return{allowed:false,reason:'INSTALL_LIMIT',limit:cfg.dailyInstallLimit,remaining:0,globalRemaining:Math.max(0,cfg.globalDailyLimit-globalCount),mode:'kv'};
  await Promise.all([env.SMARTSCAN_USAGE_KV.put(installKey,String(installCount+1),{expirationTtl:172800}),env.SMARTSCAN_USAGE_KV.put(globalKey,String(globalCount+1),{expirationTtl:172800})]);
  return{allowed:true,limit:cfg.dailyInstallLimit,remaining:Math.max(0,cfg.dailyInstallLimit-installCount-1),globalRemaining:Math.max(0,cfg.globalDailyLimit-globalCount-1),mode:'kv'}
}
function logUsage(entry){console.log(JSON.stringify({type:'audrey.ai.usage',serviceVersion:SERVICE_VERSION,...entry}))}
async function recordUsage(env,{channel='unknown',build='',model='',installId='',success=false,inputTokens=0,outputTokens=0,totalTokens=0,requestMs=0}={}){
  if(!env.AUDREY_DB)return;
  const day=new Date().toISOString().slice(0,10),safeChannel=String(channel||'unknown').slice(0,40),safeBuild=String(build||'').slice(0,120),safeModel=String(model||'').slice(0,80);
  try{
    await env.AUDREY_DB.prepare(`INSERT INTO ai_usage_daily(day,app_id,feature,channel,build,model,requests,successes,failures,input_tokens,output_tokens,total_tokens,request_ms,updated_at) VALUES(?,?,?,?,?,?,1,?,?,?,?,?,?,datetime('now')) ON CONFLICT(day,app_id,feature,channel,build,model) DO UPDATE SET requests=requests+1,successes=successes+excluded.successes,failures=failures+excluded.failures,input_tokens=input_tokens+excluded.input_tokens,output_tokens=output_tokens+excluded.output_tokens,total_tokens=total_tokens+excluded.total_tokens,request_ms=request_ms+excluded.request_ms,updated_at=datetime('now')`).bind(day,APP_ID,FEATURE,safeChannel,safeBuild,safeModel,success?1:0,success?0:1,Number(inputTokens)||0,Number(outputTokens)||0,Number(totalTokens)||0,Number(requestMs)||0).run();
    if(installId){const installHash=await sha256(`${APP_ID}:${installId}`);await env.AUDREY_DB.prepare(`INSERT INTO ai_install_daily(day,app_id,feature,channel,build,install_hash,requests,updated_at) VALUES(?,?,?,?,?,?,1,datetime('now')) ON CONFLICT(day,app_id,feature,channel,build,install_hash) DO UPDATE SET requests=requests+1,updated_at=datetime('now')`).bind(day,APP_ID,FEATURE,safeChannel,safeBuild,installHash).run()}
  }catch(err){console.warn('Smart Scan D1 usage aggregation failed.',err)}
}
async function adminUsage(env,days){
  const n=Math.min(90,Math.max(1,Number(days)||14));
  if(!env.AUDREY_DB)return{d1Configured:false,days:n,rows:[],installs:[]};
  try{
    const rows=await env.AUDREY_DB.prepare(`SELECT day,app_id,feature,channel,build,model,requests,successes,failures,input_tokens,output_tokens,total_tokens,request_ms FROM ai_usage_daily WHERE day>=date('now', ?) ORDER BY day DESC,channel,build,model`).bind(`-${n-1} day`).all();
    const installs=await env.AUDREY_DB.prepare(`SELECT day,channel,build,COUNT(*) AS unique_installs,SUM(requests) AS requests FROM ai_install_daily WHERE day>=date('now', ?) GROUP BY day,channel,build ORDER BY day DESC,channel,build`).bind(`-${n-1} day`).all();
    return{d1Configured:true,days:n,rows:rows.results||[],installs:installs.results||[]};
  }catch(err){console.warn('Admin usage query failed.',err);return{d1Configured:true,days:n,rows:[],installs:[],error:'USAGE_QUERY_FAILED'}}
}

export default{
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'';
    if(request.method==='OPTIONS')return validOrigin(request)?new Response(null,{status:204,headers:cors(origin)}):error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
    const url=new URL(request.url);
    if(url.pathname==='/health'&&request.method==='GET'){const cfg=await loadConfig(env);return json({ok:true,service:'audrey-smartscan',version:SERVICE_VERSION,provider:'openai',configSource:cfg.source},200,origin)}
    if(url.pathname==='/v1/smartscan/config'&&request.method==='GET'){if(!validOrigin(request))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);return json({ok:true,config:publicConfig(await loadConfig(env))},200,origin)}
    if(url.pathname==='/v1/admin/smartscan/config'&&(request.method==='GET'||request.method==='PUT')){
      if(!adminAuthorized(request,env))return error('ADMIN_UNAUTHORIZED','Admin authorization is required.',401,origin);
      if(request.method==='GET')return json({ok:true,config:publicConfig(await loadConfig(env)),d1Configured:Boolean(env.AUDREY_DB),quotaKvConfigured:Boolean(env.SMARTSCAN_USAGE_KV),adminTokenConfigured:Boolean(env.AUDREY_ADMIN_TOKEN)},200,origin);
      let incoming;try{incoming=await request.json()}catch{return error('INVALID_JSON','Admin config must be valid JSON.',400,origin)}
      try{return json({ok:true,config:publicConfig(await saveAdminConfig(env,incoming?.config||incoming))},200,origin)}catch(err){return error(err.code||'ADMIN_CONFIG_ERROR',err.message||'Could not save Smart Scan configuration.',503,origin)}
    }
    if(url.pathname==='/v1/admin/smartscan/usage'&&request.method==='GET'){
      if(!adminAuthorized(request,env))return error('ADMIN_UNAUTHORIZED','Admin authorization is required.',401,origin);
      return json({ok:true,...await adminUsage(env,url.searchParams.get('days'))},200,origin);
    }
    if(url.pathname!=='/v1/smartscan/analyze'||request.method!=='POST')return error('NOT_FOUND','Not found.',404,origin);
    if(!validOrigin(request))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
    if(request.headers.get('X-Audrey-App')!==APP_ID||request.headers.get('X-Audrey-Feature')!==FEATURE)return error('INVALID_CLIENT','Invalid application or feature.',403,origin);
    if(!env.OPENAI_API_KEY)return error('SERVICE_NOT_CONFIGURED','Smart Scan service is not configured.',503,origin);
    const cfg=await loadConfig(env);if(!cfg.enabled)return error('SERVICE_DISABLED','AI Smart Scan is temporarily disabled.',503,origin);
    const len=Number(request.headers.get('Content-Length')||0);if(len>cfg.maxBodyBytes)return error('REQUEST_TOO_LARGE','Smart Scan image is too large.',413,origin);
    let body;try{body=await request.json()}catch{return error('INVALID_JSON','Request body must be valid JSON.',400,origin)}
    if(body?.appId!==APP_ID||body?.feature!==FEATURE)return error('INVALID_CLIENT','Invalid Smart Scan client envelope.',403,origin);
    const requestId=String(body.requestId||request.headers.get('X-Audrey-Request')||'').slice(0,160),installId=String(body.installId||'').slice(0,160),channel=String(body?.client?.channel||request.headers.get('X-Audrey-Channel')||'unknown').slice(0,40),build=String(body?.client?.build||request.headers.get('X-Audrey-Build')||'').slice(0,120),image=String(body.image||'');
    if(!requestId||!image.startsWith('data:image/'))return error('INVALID_REQUEST','A request ID and image are required.',400,origin);
    if(image.length>cfg.maxImageChars)return error('IMAGE_TOO_LARGE','Smart Scan image is too large.',413,origin);
    const q=await quota(request,env,installId,cfg);if(!q.allowed)return error('RATE_LIMITED',q.reason==='GLOBAL_LIMIT'?'Smart Scan is temporarily at its service usage limit.':'Daily Smart Scan limit reached for this device/network.',429,origin,'tomorrow');
    const prompt='Analyze this clothing item for Audrey Closet. Choose only values from the supplied taxonomy. Return the most likely category, exact type within that category, primary color, pattern, visible brand if any, visible size if any, and confidence for category/type/color/pattern. Taxonomy: '+JSON.stringify(TAXONOMY);
    const providerRequest={model:cfg.model,input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail:cfg.detail}]}],text:{format:{type:'json_schema',...schema()}},max_output_tokens:500};
    const started=Date.now();let providerResponse,providerBody={};
    try{providerResponse=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.OPENAI_API_KEY},body:JSON.stringify(providerRequest)});try{providerBody=await providerResponse.json()}catch{}}
    catch(err){const requestMs=Date.now()-started;logUsage({requestId,installId,channel,build,model:cfg.model,status:'provider-network-error',requestMs});await recordUsage(env,{channel,build,model:cfg.model,installId,success:false,requestMs});return error('PROVIDER_UNAVAILABLE','AI provider is temporarily unavailable.',502,origin)}
    const requestMs=Date.now()-started;
    if(!providerResponse.ok){logUsage({requestId,installId,channel,build,model:cfg.model,status:'provider-error',providerStatus:providerResponse.status,requestMs});await recordUsage(env,{channel,build,model:cfg.model,installId,success:false,requestMs});return error('PROVIDER_ERROR','AI provider could not complete Smart Scan.',502,origin)}
    const text=extractText(providerBody);let raw;try{raw=JSON.parse(text)}catch{await recordUsage(env,{channel,build,model:cfg.model,installId,success:false,requestMs});return error('INVALID_PROVIDER_RESPONSE','AI provider returned an unreadable Smart Scan result.',502,origin)}
    if(!validateResult(raw)){await recordUsage(env,{channel,build,model:cfg.model,installId,success:false,requestMs});return error('INVALID_PROVIDER_RESULT','AI provider returned a result outside Audrey taxonomy.',502,origin)}
    const c=raw.confidence||{},usage=providerBody?.usage||{},inputTokens=usage.input_tokens||usage.inputTokens||0,outputTokens=usage.output_tokens||usage.outputTokens||0,totalTokens=usage.total_tokens||usage.totalTokens||Number(inputTokens)+Number(outputTokens);
    const result={category:{value:raw.category,confidence:c.category||0},type:{value:raw.type||'',confidence:c.type||0},color:{value:raw.color,confidence:c.color||0},pattern:{value:raw.pattern,confidence:c.pattern||0},brand:{value:raw.brand||'',confidence:null},size:{value:raw.size||'',confidence:null}};
    logUsage({requestId,installId,userId:body.userId||null,sessionId:body.sessionId||'',appId:APP_ID,feature:FEATURE,channel,build,model:cfg.model,detail:cfg.detail,status:'success',requestMs,providerRequestId:providerBody?.id||'',usage,quota:q,configSource:cfg.source});
    await recordUsage(env,{channel,build,model:cfg.model,installId,success:true,inputTokens,outputTokens,totalTokens,requestMs});
    return json({ok:true,serviceVersion:SERVICE_VERSION,requestId,provider:'openai',providerRequestId:providerBody?.id||'',model:cfg.model,detail:cfg.detail,requestMs,usage,quota:{limit:q.limit,remaining:q.remaining,globalRemaining:q.globalRemaining},result},200,origin);
  }
};
