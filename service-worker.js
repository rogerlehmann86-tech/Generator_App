const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `generator-app-${CACHE_VERSION}`;
const FILES_TO_CACHE = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request).then(netRes => {
    return caches.open(CACHE_NAME).then(c => { c.put(e.request, netRes.clone()); return netRes; });
  })));
});
