const CACHE_NAME = 'flowtrack-v2';
const ASSETS = [
  '/Flowtrack/',
  '/Flowtrack/index.html',
  '/Flowtrack/manifest.json',
  '/Flowtrack/icons/icon-192.png',
  '/Flowtrack/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(e.request.method === 'GET' && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/Flowtrack/index.html'));
    })
  );
});
