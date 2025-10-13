self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("gen-app-v2").then(cache => {
      return cache.addAll([
        "./index.html",
        "./style.css",
        "./app.js",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

