/* Audrey Closet v13.24.2 — production service worker
 * Runtime JS/CSS is network-first while online, with current-generation cache fallback offline.
 * Decorative/static assets remain cache-first. All reads are constrained to this cache generation.
 */
const CACHE='audrey-closet-v13.24.2-release1';
importScripts('./release-assets-v13.24.js');
const ASSETS=Array.isArray(self.AUDREY_RELEASE_ASSETS_V1324)?self.AUDREY_RELEASE_ASSETS_V1324:[];
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const RUNTIME_JS=ASSETS.filter(asset=>/\.js(?:$|\?)/.test(asset));
const CORE=[...new Set([...SHELL,...RUNTIME_JS])];

async function cacheOne(cache,asset){
  const request=new Request(asset,{cache:'reload'});
  const response=await fetch(request);
  if(!response||!response.ok)throw new Error('HTTP '+(response&&response.status)+' for '+asset);
  await cache.put(request,response.clone());
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const asset of CORE)await cacheOne(cache,asset);
    const secondary=ASSETS.filter(asset=>!CORE.includes(asset));
    const results=await Promise.allSettled(secondary.map(asset=>cacheOne(cache,asset)));
    const failed=secondary.filter((_,i)=>results[i].status==='rejected');
    if(failed.length)console.warn('Audrey v13.24.2 secondary precache misses',failed);
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('audrey-closet-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

function sameOrigin(request){try{return new URL(request.url).origin===self.location.origin}catch{return false}}
function navigation(request){return request.mode==='navigate'||request.destination==='document'}
function runtimeAsset(request){
  try{
    const path=new URL(request.url).pathname;
    return request.destination==='script'||request.destination==='style'||/\.(?:js|css)$/i.test(path);
  }catch{return false}
}
async function currentCache(){return caches.open(CACHE)}
async function matchCurrent(request,options={}){const cache=await currentCache();return cache.match(request,options)}
async function putCurrent(request,response){if(!response||!response.ok)return response;const cache=await currentCache();await cache.put(request,response.clone());return response}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!sameOrigin(request))return;

  if(navigation(request)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response&&response.ok){const cache=await currentCache();cache.put('./index.html',response.clone()).catch(()=>{})}
        return response;
      }catch{
        return (await matchCurrent(request,{ignoreSearch:true}))||(await matchCurrent('./index.html',{ignoreSearch:true}))||(await matchCurrent('./',{ignoreSearch:true}))||Response.error();
      }
    })());
    return;
  }

  if(runtimeAsset(request)){
    event.respondWith((async()=>{
      try{
        // Revalidate runtime code while online so a prior PWA cache/HTTP cache
        // cannot hide a newer Photo Studio or Smart Scan module on first launch.
        const freshRequest=new Request(request,{cache:'no-cache'});
        const response=await fetch(freshRequest);
        if(response&&response.ok)await putCurrent(request,response);
        return response;
      }catch{
        // ignoreSearch is intentionally used only on the OFFLINE fallback inside
        // the current cache generation because precache entries omit ?v= strings.
        return (await matchCurrent(request))||(await matchCurrent(request,{ignoreSearch:true}))||Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    // Decorative/static assets may remain cache-first for fast PWA rendering.
    // Constrain the lookup to the active cache instead of searching old/warm caches.
    const cached=(await matchCurrent(request))||(await matchCurrent(request,{ignoreSearch:true}));
    if(cached){
      event.waitUntil(fetch(request).then(response=>putCurrent(request,response)).catch(()=>{}));
      return cached;
    }
    try{
      const response=await fetch(request);
      if(response&&response.ok)await putCurrent(request,response);
      return response;
    }catch{return Response.error()}
  })());
});
