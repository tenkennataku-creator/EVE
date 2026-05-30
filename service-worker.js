const CACHE_NAME = "eve-offline-v1";
const CORE_ASSETS = [
  "/EVE/",
  "/EVE/index.html",
  "/EVE/manifest.json",
  "/EVE/offline-fallback.js",
  "/EVE/assets/index-BulEJuIc.js",
  "/EVE/assets/index-DO3_s9Ij.css",
  "/EVE/spine-player-4.0.css",
  "/EVE/spine-player-4.0.js",
  "/EVE/spine-player-4.1.css",
  "/EVE/spine-player-4.1.js",
  "/EVE/icons/icon-192.svg",
  "/EVE/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith("/EVE/")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/EVE/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/EVE/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
