const CACHE = "qcm-cgp-v9";
const CORE = [
  "./",
  "./index.html",
  "./assets/styles.css?v=9",
  "./assets/app.js?v=9",
  "./assets/icon.svg",
  "./assets/icon-180.png",
  "./assets/icon-512.png",
  "./manifest.webmanifest",
  "./sources/sources.json"
];

for (let index = 1; index <= 22; index += 1) {
  CORE.push(`./questions/lot-${String(index).padStart(3, "0")}.json`);
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
