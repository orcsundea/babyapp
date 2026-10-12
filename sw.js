const scope=new URL(self.registration.scope);
const prefix=`bodre-${scope.pathname}-`;
const CACHE=prefix+'v4';
const at=path=>new URL(path,scope).href;
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch(scope.href);
 if(!response.ok)throw new Error('App shell download failed');
 const html=await response.clone().text();
 await cache.put(scope.href,response);
 const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>new URL(m[1],scope)).filter(url=>url.origin===scope.origin&&url.pathname.startsWith(scope.pathname+'assets/')).map(url=>url.href);
 await cache.addAll([...assets,at('icon.svg'),at('icon-192.png'),at('icon-512.png'),at('manifest.webmanifest')]);
 await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 for(const key of await caches.keys())if((key.startsWith(prefix)&&key!==CACHE)||(scope.pathname==='/'&&key==='bodre-v1'))await caches.delete(key);
 await self.clients.claim();
})());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request);
   if(response.ok)await cache.put(event.request,response.clone());
   return response;
  }catch{
   const cached=await cache.match(event.request,{ignoreVary:true});
   if(cached)return cached;
   if(event.request.mode==='navigate')return (await cache.match(scope.href))||Response.error();
   return Response.error();
  }
 })());
});
