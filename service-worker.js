// MangaLog v12.10: app shell only; Supabase is network-only; user data is never stored in SW cache.
// Re-trigger GitHub Pages publishing after the previous Pages build was marked abandoned.
const CACHE = 'mangalog-v12-10-10-look-back-isbn-beta7-1-20261113';
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
    // Cache only the actual PWA entry. Never replace it with a laboratory/test page.
    const rootPath = new URL(self.registration.scope).pathname;
    const requestedPath = new URL(event.request.url).pathname;
    if (requestedPath !== rootPath && requestedPath !== rootPath + 'index.html') return;
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put('./index.html', copy)); }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
