const CACHE="umrah-v2";
const FILES=["./","./index.html","./manifest.json","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return; // live rates and fonts go straight to the network
  const isPage=e.request.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("index.html");
  if(isPage){
    // Network first for the app page, so updates arrive; cached copy when offline.
    e.respondWith(fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy)).catch(()=>{});return res;})
      .catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return res;
  }).catch(()=>caches.match("./index.html"))));
});
