const CACHE_NAME = 'generator-app-v5_0';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo-lgt-blau.jpg'
];

// Deaktiviere Service Worker im lokalen Umfeld (z. B. bei Entwicklung)
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  console.log("🧰 Dev-Modus erkannt – Service Worker wird nicht aktiviert.");
  self.addEventListener('install', e => self.skipWaiting());
  self.addEventListener('activate', e => self.registration.unregister());
  self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));
} else {

  // ---------- INSTALLATION ----------
  self.addEventListener('install', evt => {
    console.log("📦 Service Worker installiert (Cache v5.0)");
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
  });

  // ---------- AKTIVIERUNG ----------
  self.addEventListener('activate', evt => {
    console.log("🔁 Alte Caches werden entfernt …");
    evt.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
        )
      )
    );
    self.clients.claim();
  });

  // ---------- FETCH ----------
  self.addEventListener('fetch', evt => {
    evt.respondWith(
      fetch(evt.request)
        .then(response => {
          // Erfolgreich aus Netz → Cache aktualisieren
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(evt.request, clone));
          return response;
        })
        .catch(() => caches.match(evt.request)) // Offline-Fallback
    );
  });

}
