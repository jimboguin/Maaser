// keeps the app working without internet; checks for updates when online
const CACHE = "maaser-v7";
const FILES = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    // always ask GitHub for the newest copy of the app itself (cheap: unchanged files aren't re-downloaded)
    (new URL(req.url).origin === location.origin ? fetch(req.url, {cache: "no-cache"}) : fetch(req)).then(res => {
      if (res.ok && (new URL(req.url).origin === location.origin || req.url.startsWith("https://fonts.") || req.url.startsWith("https://cdn.jsdelivr.net/"))) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("index.html")))
  );
});
