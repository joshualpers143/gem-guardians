const CACHE='gem-guardians-public-pass-look-2026101139';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./privacy.html','./gg-sound.js?v=2026.10.11.39','./gg-art.js?v=2026.10.11.39','./gg-game.js?v=2026.10.11.39'];
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>
    k!==CACHE && (k.startsWith('gem-guardians-public-') ||
      (k.startsWith('gem-guardians-update-info-') && k.endsWith('-public')))
  ).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
      return response;
    }).catch(()=>caches.open(CACHE).then(cache=>cache.match('./index.html'))));
  }else{
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok)cache.put(event.request,response.clone());return response;}))));
  }
});
