/* Audrey Cloud Worker entry — Phase 7A7C
 * Adds pre-provider production hardening while preserving 7A7 validation, 7A6 calibration, and validated base Smart Scan runtime.
 */
import phase7a7Worker from './worker-entry-v13.24-phase7a7.js';
import baseWorker from './smartscan-worker.js';
import {hardenAnalyze,hardeningStatus,HARDENING_VERSION} from './smartscan-hardening-v13.24-phase7a7c.js';

const ALLOWED_ORIGINS=new Set(['https://thomaslee78-beep.github.io']);
function cors(origin){const allowed=origin&&ALLOWED_ORIGINS.has(origin)?origin:'';return{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,X-Audrey-App,X-Audrey-Feature,X-Audrey-Request,X-Audrey-Channel,X-Audrey-Build','Access-Control-Max-Age':'86400','Vary':'Origin'}}
function json(body,status=200,origin=''){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(origin)}})}
function error(code,message,status,origin){return json({ok:false,error:{code,message}},status,origin)}
function adminAuthorized(request,env){return Boolean(env.AUDREY_ADMIN_TOKEN&&(request.headers.get('Authorization')||'')==='Bearer '+env.AUDREY_ADMIN_TOKEN)}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(url.pathname==='/health/hardening'&&request.method==='GET')return json({ok:true,service:'audrey-smartscan-hardening',version:HARDENING_VERSION,status:hardeningStatus(env)},200,origin);
    if(url.pathname==='/v1/admin/smartscan/hardening'&&request.method==='GET'){
      if(!ALLOWED_ORIGINS.has(origin))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
      if(!adminAuthorized(request,env))return error('ADMIN_UNAUTHORIZED','Admin authorization is required.',401,origin);
      return json({ok:true,status:hardeningStatus(env)},200,origin);
    }
    if(url.pathname==='/v1/smartscan/analyze'&&request.method==='POST')return hardenAnalyze({request,env,origin,json,error,baseWorker,ctx});
    return phase7a7Worker.fetch(request,env,ctx);
  }
};
