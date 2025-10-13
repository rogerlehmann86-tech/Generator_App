// 🔹 Versioniere den Cache – ändere nur diese Nummer bei jedem Update!
const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `generator-app-${CACHE_VERSION}`;

// 🔹 Liste aller Dateien, die offline verfügbar sein sollen
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 🔹 Installationsphase – Dateien zwischenspeichern
self.addEventListener('install', (event) => {
  console.log(`[SW] Installiere Version ${CACHE_VERSION} …`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 🔹 Aktivierungsphase – alte Caches entfernen
self.addEventListener('activate', (event) => {
  console.log(`[SW] Aktiviere Version ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('generator-app-') && key !== CACHE_NAME)
          .map((key) => {
            console.log(`[SW] Lösche alten Cache: ${key}`);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// 🔹 Fetch-Handler – versucht zuerst aus Cache, sonst aus Netzwerk
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Nur GET-Anfragen cachen
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Gibt Cache-Version zurück
        return cachedResponse;
      }

      // Falls nicht im Cache → vom Netzwerk laden
      return fetch(req)
        .then((networkResponse) => {
          // Erfolgreiche Antwort im Cache speichern (kopieren)
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback bei Offline / Fehler (optional: eigene Offline-Seite)
          if (req.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
