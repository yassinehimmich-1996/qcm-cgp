const CACHE_PREFIX = "qcm-cgp-";
const CACHE = `${CACHE_PREFIX}v15-acces-fiches`;
const CORE = [
  "./",
  "./index.html",
  "./assets/styles.css?v=15-acces-fiches",
  "./assets/app.js?v=15-acces-fiches",
  "./assets/icon.svg",
  "./assets/icon-180.png",
  "./assets/icon-512.png",
  "./manifest.webmanifest",
  "./sources/sources.json",
  "./fiches/fiches.json?v=15-acces-fiches"
];

for (let index = 1; index <= 16; index += 1) {
  CORE.push(`./questions/lot-${String(index).padStart(3, "0")}.json?v=15-acces-fiches`);
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
