/* Audrey Cloud Smart Scan Calibration — Phase 7A6A
 * Admin-only calibration lab. Does not persist images.
 */
export const CALIBRATION_VERSION='13.24-phase7a6a-calibration1';

function extractText(body){
  if(typeof body?.output_text==='string'&&body.output_text.trim())return body.output_text.trim();
  for(const out of body?.output||[])for(const c of out?.content||[])if((c?.type==='output_text'||c?.type==='text')&&typeof c.text==='string'&&c.text.trim())return c.text.trim();
  return'';
}
function responseSchema(taxonomy){
  const allTypes=[...new Set(Object.values(taxonomy.types).flat())];
  return{name:'audrey_smart_scan_result',strict:true,schema:{type:'object',additionalProperties:false,properties:{category:{type:'string',enum:['',...taxonomy.categories]},type:{type:'string',enum:['',...allTypes]},color:{type:'string',enum:['',...taxonomy.colors]},pattern:{type:'string',enum:['',...taxonomy.patterns]},brand:{type:'string'},size:{type:'string'},confidence:{type:'object',additionalProperties:false,properties:{category:{type:'number',minimum:0,maximum:1},type:{type:'number',minimum:0,maximum:1},color:{type:'number',minimum:0,maximum:1},pattern:{type:'number',minimum:0,maximum:1}},required:['category','type','color','pattern']}},required:['category','type','color','pattern','brand','size','confidence']}};
}
function validateResult(raw,taxonomy){
  if(!raw||!taxonomy.categories.includes(raw.category)||!taxonomy.colors.includes(raw.color)||!taxonomy.patterns.includes(raw.pattern))return false;
  if(raw.type&&!(taxonomy.types[raw.category]||[]).includes(raw.type))return false;
  return true;
}
function usageOf(body={}){const u=body.usage||{},input=u.input_tokens||u.inputTokens||0,output=u.output_tokens||u.outputTokens||0;return{inputTokens:Number(input)||0,outputTokens:Number(output)||0,totalTokens:Number(u.total_tokens||u.totalTokens||Number(input)+Number(output))||0}}
function rawResult(raw){const c=raw.confidence||{};return{category:raw.category||'',type:raw.type||'',color:raw.color||'',pattern:raw.pattern||'',brand:raw.brand||'',size:raw.size||'',confidence:{category:Number(c.category)||0,type:Number(c.type)||0,color:Number(c.color)||0,pattern:Number(c.pattern)||0}}}
function safeTruth(raw,taxonomy){const category=taxonomy.categories.includes(raw?.category)?raw.category:'',type=raw?.type&&taxonomy.types[category]?.includes(raw.type)?raw.type:'',color=taxonomy.colors.includes(raw?.color)?raw.color:'',pattern=taxonomy.patterns.includes(raw?.pattern)?raw.pattern:'';return{category,type,color,pattern}}
async function analyzeOne({env,image,model,detail,taxonomy}){
  const prompt='Analyze this clothing item for Audrey Closet calibration. Choose only values from the supplied taxonomy. Return the most likely category, exact type within that category, primary color, pattern, visible brand if any, visible size if any, and confidence for category/type/color/pattern. Taxonomy: '+JSON.stringify(taxonomy);
  const req={model,input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail}]}],text:{format:{type:'json_schema',...responseSchema(taxonomy)}},max_output_tokens:500};
  const started=Date.now();let response,body={};
  try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.OPENAI_API_KEY},body:JSON.stringify(req)});try{body=await response.json()}catch{}}
  catch{return{model,ok:false,error:'PROVIDER_UNAVAILABLE',requestMs:Date.now()-started,...usageOf(body)}}
  const requestMs=Date.now()-started;
  if(!response.ok)return{model,ok:false,error:'PROVIDER_ERROR',providerStatus:response.status,requestMs,...usageOf(body)};
  let raw;try{raw=JSON.parse(extractText(body))}catch{return{model,ok:false,error:'INVALID_PROVIDER_RESPONSE',requestMs,...usageOf(body)}}
  if(!validateResult(raw,taxonomy))return{model,ok:false,error:'INVALID_PROVIDER_RESULT',requestMs,...usageOf(body)};
  return{model,ok:true,result:rawResult(raw),requestMs,...usageOf(body),providerRequestId:body.id||''};
}
async function persistRun(env,{runId,detail,imageChars,truth,notes,results}){
  if(!env.AUDREY_DB)return;
  await env.AUDREY_DB.prepare(`INSERT INTO ai_calibration_runs(id,detail,image_chars,truth_category,truth_type,truth_color,truth_pattern,notes) VALUES(?,?,?,?,?,?,?,?)`).bind(runId,detail,imageChars,truth.category,truth.type,truth.color,truth.pattern,String(notes||'').slice(0,1000)).run();
  for(const r of results){if(!r.ok)continue;const v=r.result,c=v.confidence||{};await env.AUDREY_DB.prepare(`INSERT INTO ai_calibration_results(run_id,model,category,type,color,pattern,brand,size,confidence_category,confidence_type,confidence_color,confidence_pattern,input_tokens,output_tokens,total_tokens,request_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(runId,r.model,v.category,v.type,v.color,v.pattern,v.brand,v.size,c.category||0,c.type||0,c.color||0,c.pattern||0,r.inputTokens||0,r.outputTokens||0,r.totalTokens||0,r.requestMs||0).run()}
}
async function updateTruth(env,runId,truth,notes){await env.AUDREY_DB.prepare(`UPDATE ai_calibration_runs SET truth_category=?,truth_type=?,truth_color=?,truth_pattern=?,notes=? WHERE id=?`).bind(truth.category,truth.type,truth.color,truth.pattern,String(notes||'').slice(0,1000),runId).run()}
async function summary(env,days=30){const n=Math.min(180,Math.max(1,Number(days)||30));const q=await env.AUDREY_DB.prepare(`SELECT r.id,r.created_at,r.detail,r.truth_category,r.truth_type,r.truth_color,r.truth_pattern,r.notes,x.model,x.category,x.type,x.color,x.pattern,x.input_tokens,x.output_tokens,x.total_tokens,x.request_ms FROM ai_calibration_runs r JOIN ai_calibration_results x ON x.run_id=r.id WHERE r.created_at>=datetime('now',?) ORDER BY r.created_at DESC,x.model`).bind(`-${n} day`).all();return{days:n,rows:q.results||[]}}

export async function handleCalibration({request,env,origin,json,error,adminAuthorized,taxonomy,allowedModels,allowedDetails}){
  const url=new URL(request.url),base='/v1/admin/smartscan/calibration';
  if(!url.pathname.startsWith(base))return null;
  if(!adminAuthorized(request,env))return error('ADMIN_UNAUTHORIZED','Admin authorization is required.',401,origin);
  if(!env.AUDREY_DB)return error('D1_NOT_CONFIGURED','AUDREY_DB is required for calibration.',503,origin);
  if(!env.OPENAI_API_KEY)return error('SERVICE_NOT_CONFIGURED','Smart Scan provider is not configured.',503,origin);
  if(url.pathname===base&&request.method==='GET'){try{return json({ok:true,version:CALIBRATION_VERSION,...await summary(env,url.searchParams.get('days'))},200,origin)}catch{return error('CALIBRATION_QUERY_FAILED','Could not load calibration history.',500,origin)}}
  if(url.pathname===base&&request.method==='POST'){
    let body;try{body=await request.json()}catch{return error('INVALID_JSON','Calibration request must be valid JSON.',400,origin)}
    const image=String(body.image||''),detail=allowedDetails.has(body.detail)?body.detail:'auto';
    if(!image.startsWith('data:image/'))return error('INVALID_IMAGE','A clothing image is required.',400,origin);
    if(image.length>7_500_000)return error('IMAGE_TOO_LARGE','Calibration image is too large.',413,origin);
    const requested=Array.isArray(body.models)?body.models:[],models=[...new Set(requested.filter(m=>allowedModels.has(m)))];
    if(!models.length)return error('INVALID_MODELS','Choose at least one approved model.',400,origin);
    if(models.length>3)return error('TOO_MANY_MODELS','Calibration supports at most three models per run.',400,origin);
    const truth=safeTruth(body.truth||{},taxonomy),runId=crypto.randomUUID();
    const results=await Promise.all(models.map(model=>analyzeOne({env,image,model,detail,taxonomy})));
    try{await persistRun(env,{runId,detail,imageChars:image.length,truth,notes:body.notes,results})}catch(e){console.warn('Calibration persistence failed',e);return error('CALIBRATION_SAVE_FAILED','Calibration results could not be saved.',500,origin)}
    return json({ok:true,version:CALIBRATION_VERSION,runId,detail,truth,results},200,origin);
  }
  if(url.pathname.startsWith(base+'/')&&request.method==='PUT'){
    const runId=url.pathname.slice((base+'/').length).trim();if(!runId)return error('INVALID_RUN','Calibration run ID is required.',400,origin);
    let body;try{body=await request.json()}catch{return error('INVALID_JSON','Calibration update must be valid JSON.',400,origin)}
    const truth=safeTruth(body.truth||{},taxonomy);try{await updateTruth(env,runId,truth,body.notes);return json({ok:true,runId,truth},200,origin)}catch{return error('CALIBRATION_UPDATE_FAILED','Could not update calibration truth.',500,origin)}
  }
  return error('NOT_FOUND','Calibration route not found.',404,origin);
}
