/* Audrey Closet — Phase 7A7B prod-like offline Preview service worker
 * The Preview workflow replaces __AUDREY_OFFLINE_ASSETS__ and __AUDREY_OFFLINE_CACHE__.
 * Scope is intentionally limited to /Audrey-Closet-Preview/offline/.
 */
const CACHE='__AUDREY_OFFLINE_CACHE__';
const ASSETS=__AUDREY_OFFLINE_ASSETS__;

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const results=await Promise.allSettled(ASSETS.map(asset=>cache.add(new Request(asset,{cache:'reload'}))));
    const failed=results.filter(r=>r.status==='rejected');
    if(failed.length) throw new Error('Offline precache failed for '+failed.length+' asset(s)');
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('audrey-offline-preview-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

function sameOrigin(request){try{return new URL(request.url).origin===self.location.origin}catch{return false}}
function isNavigation(request){return request.mode==='navigate'||request.destination==='document'}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!sameOrigin(request))return;
  if(isNavigation(request)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response&&response.ok){const cache=await caches.open(CACHE);cache.put('./index.html',response.clone()).catch(()=>{});}
        return response;
      }catch{
        return (await caches.match(request,{ignoreSearch:true}))||(await caches.match('./index.html',{ignoreSearch:true}))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached){
      event.waitUntil(fetch(request).then(async response=>{if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}}).catch(()=>{}));
      return cached;
    }
    try{
      const response=await fetch(request);
      if(response&&response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{});}
      return response;
    }catch{return Response.error();}
  })());
});
