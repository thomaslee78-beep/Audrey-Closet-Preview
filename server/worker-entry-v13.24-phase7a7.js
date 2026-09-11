/* Audrey Cloud Worker entry — Phase 7A7
 * Preserves validated 7A4C Smart Scan + 7A6 calibration and adds admin-only validation routes.
 */
import baseWorker from './smartscan-worker.js';
import {handleCalibration,CALIBRATION_VERSION} from './smartscan-calibration-v13.24-phase7a6a.js';
import {handleValidation,VALIDATION_VERSION} from './smartscan-validation-v13.24-phase7a7.js';

const ALLOWED_MODELS=new Set(['gpt-5.6-luna','gpt-5.6-terra','gpt-5.6-sol']);
const ALLOWED_DETAILS=new Set(['low','high','auto']);
const ALLOWED_ORIGINS=new Set(['https://thomaslee78-beep.github.io']);
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
function error(code,message,status,origin){return json({ok:false,error:{code,message}},status,origin)}
function adminAuthorized(request,env){return Boolean(env.AUDREY_ADMIN_TOKEN&&(request.headers.get('Authorization')||'')==='Bearer '+env.AUDREY_ADMIN_TOKEN)}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(url.pathname==='/health/calibration'&&request.method==='GET')return json({ok:true,service:'audrey-smartscan-calibration',version:CALIBRATION_VERSION},200,origin);
    if(url.pathname==='/health/validation'&&request.method==='GET')return json({ok:true,service:'audrey-smartscan-validation',version:VALIDATION_VERSION},200,origin);
    if(url.pathname.startsWith('/v1/admin/smartscan/calibration')){
      if(request.method==='OPTIONS')return ALLOWED_ORIGINS.has(origin)?new Response(null,{status:204,headers:cors(origin)}):error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
      if(!ALLOWED_ORIGINS.has(origin))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
      return handleCalibration({request,env,origin,json,error,adminAuthorized,taxonomy:TAXONOMY,allowedModels:ALLOWED_MODELS,allowedDetails:ALLOWED_DETAILS});
    }
    if(url.pathname.startsWith('/v1/admin/smartscan/validation')){
      if(request.method==='OPTIONS')return ALLOWED_ORIGINS.has(origin)?new Response(null,{status:204,headers:cors(origin)}):error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
      if(!ALLOWED_ORIGINS.has(origin))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
      return handleValidation({request,env,origin,json,error,adminAuthorized,baseWorker});
    }
    return baseWorker.fetch(request,env,ctx);
  }
};
