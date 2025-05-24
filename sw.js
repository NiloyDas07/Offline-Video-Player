const CACHE_NAME = "video-player-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./index.css",
  "./index.js",
  // any icons, fonts, etc.
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request))
  );
});
