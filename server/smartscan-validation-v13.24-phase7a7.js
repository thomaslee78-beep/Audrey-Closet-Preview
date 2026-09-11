/* Audrey Cloud Smart Scan — Phase 7A7 validation harness
 * Admin-only, zero-provider-call safety validation. Does not mutate production config.
 */
export const VALIDATION_VERSION='13.24-phase7a7-validation1';

function synthetic(url,{method='GET',origin='https://thomaslee78-beep.github.io',headers={},body}={}){
  const h=new Headers(headers);if(origin)h.set('Origin',origin);
  return new Request(url,{method,headers:h,body});
}
async function read(response){let body={};try{body=await response.clone().json()}catch{}return{status:response.status,code:body?.error?.code||'',ok:Boolean(body?.ok)}}
function pass(actual,{status,code,ok}){return actual.status===status&&(code===undefined||actual.code===code)&&(ok===undefined||actual.ok===ok)}

export async function handleValidation({request,env,origin,json,error,adminAuthorized,baseWorker}){
  if(!adminAuthorized(request,env))return error('ADMIN_UNAUTHORIZED','Admin authorization is required.',401,origin);
  const url=new URL(request.url);
  if(url.pathname==='/v1/admin/smartscan/validation/info'&&request.method==='GET'){
    return json({ok:true,version:VALIDATION_VERSION,safeAutomatedTests:true,providerCalls:false,mutatesConfig:false,manualTests:['offline-local-fallback','service-recovery','review-save-regression']},200,origin);
  }
  if(url.pathname!=='/v1/admin/smartscan/validation/run'||request.method!=='POST')return error('NOT_FOUND','Not found.',404,origin);
  const workerUrl=new URL(request.url).origin;
  const tests=[];
  async function run(name,expected,req,testEnv=env){
    let actual;try{actual=await read(await baseWorker.fetch(req,testEnv,{}))}catch(e){actual={status:0,code:'THREW',ok:false,message:String(e?.message||e)}}
    tests.push({name,expected,actual,passed:pass(actual,expected)});
  }
  await run('Reject unapproved browser origin',{status:403,code:'ORIGIN_NOT_ALLOWED'},synthetic(workerUrl+'/v1/smartscan/config',{origin:'https://example.invalid'}));
  await run('Reject missing admin authorization',{status:401,code:'ADMIN_UNAUTHORIZED'},synthetic(workerUrl+'/v1/admin/smartscan/config',{origin,headers:{Authorization:''}}));
  await run('Reject invalid app/feature headers',{status:403,code:'INVALID_CLIENT'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'wrong-app','X-Audrey-Feature':'smartscan'},body:'{}'}));
  await run('Reject invalid Smart Scan envelope',{status:403,code:'INVALID_CLIENT'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'audrey-closet','X-Audrey-Feature':'smartscan'},body:JSON.stringify({appId:'wrong-app',feature:'smartscan'})}));
  await run('Reject malformed JSON',{status:400,code:'INVALID_JSON'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'audrey-closet','X-Audrey-Feature':'smartscan'},body:'{"broken":'}));
  await run('Reject missing request ID/image',{status:400,code:'INVALID_REQUEST'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'audrey-closet','X-Audrey-Feature':'smartscan'},body:JSON.stringify({appId:'audrey-closet',feature:'smartscan'})}));
  const disabledEnv={...env,AUDREY_DB:undefined,SMARTSCAN_ENABLED:'false'};
  await run('Return service-disabled without provider call',{status:503,code:'SERVICE_DISABLED'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'audrey-closet','X-Audrey-Feature':'smartscan'},body:JSON.stringify({appId:'audrey-closet',feature:'smartscan',requestId:'validation-disabled',image:'data:image/png;base64,AA=='})}),disabledEnv);
  const noKeyEnv={...env,OPENAI_API_KEY:undefined};
  await run('Return service-not-configured when provider secret missing',{status:503,code:'SERVICE_NOT_CONFIGURED'},synthetic(workerUrl+'/v1/smartscan/analyze',{method:'POST',origin,headers:{'Content-Type':'application/json','X-Audrey-App':'audrey-closet','X-Audrey-Feature':'smartscan'},body:JSON.stringify({appId:'audrey-closet',feature:'smartscan',requestId:'validation-no-key',image:'data:image/png;base64,AA=='})}),noKeyEnv);
  const passed=tests.filter(t=>t.passed).length;
  return json({ok:passed===tests.length,version:VALIDATION_VERSION,providerCalls:0,configMutations:0,summary:{passed,total:tests.length},tests},200,origin);
}
