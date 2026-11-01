// sw.js: Временная версия для разработки (без кэширования)

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});