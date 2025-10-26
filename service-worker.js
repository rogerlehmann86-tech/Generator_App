/* =========================================
   Lehmann GT – GeneratorCalc v6.3_auto
   Auto-Update Service Worker (2025)
   ========================================= */

const CACHE_NAME = "generator-app-v6.7_" + new Date().toISOString().slice(0, 10);
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo-lgt-blau.jpg",
  "./Bild Generatorvermietung.jpg",
  "./icon-192.png",
  "./icon-512.png"
];

// ---------- INSTALL ----------
self.addEventListener("install", event => {
  console.log("[SW] Installiere neue Version:", CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Neue Version sofort aktivieren
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", event => {
  console.log("[SW] Aktiviere Version:", CACHE_NAME);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log("[SW] Entferne alten Cache:", key);
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- FETCH ----------
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(response => {
      if (response) return response; // aus Cache laden

      return fetch(request)
        .then(networkResponse => {
          // erfolgreiche Antwort → Cache aktualisieren
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic" &&
            request.url.startsWith(self.location.origin)
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match("./index.html")); // Fallback offline
    })
  );
});

// ---------- MESSAGE ----------
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    console.log("[SW] SkipWaiting empfangen – aktiviere sofort neue Version");
    self.skipWaiting();
  }
});

