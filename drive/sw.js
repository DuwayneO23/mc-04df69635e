// Offline cache: the car screen has to open with no signal (clock, places, music links all work without the PC).
// Bump V on every release. Only this app's own files are cached; the PC link and the weather are never touched.
const V = 'tars-drive-v1.0.0';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './tars-check.mp3', './silence.mp3'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('tars-drive-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {     // the page: newest when there's signal, the cached copy within 3 s when there isn't
    const net = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put('./index.html', copy)); } return res; });
    e.respondWith(Promise.race([net, new Promise((_, no) => setTimeout(no, 3000))]).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
