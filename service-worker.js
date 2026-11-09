// MangaLog v12.9.2: app shell only; Supabase is network-only; user data is never stored in SW cache.
// Re-trigger GitHub Pages publishing after the previous Pages build was marked abandoned.
const CACHE = 'mangalog-v12-9-2-wishlist-mobile-desktop-20261109';
const SHELL = ['./', './index.html', './manifest.webmanifest', './cloud-config.js', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './assets/manga-library-room.svg', './assets/library-blue.webp', './assets/library-red.webp', './assets/library-violet.webp', './assets/library-white.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('mangatrack-') || key.startsWith('mangalog-')) && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put('./index.html', copy)); }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
