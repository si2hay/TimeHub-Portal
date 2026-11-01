// sw.js: Умный Service Worker (Network First)

const CACHE_NAME = 'timehub-v3';
const ASSETS = [
    './',
    './index.html',
    './builder.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/css/themes.css',
    './assets/css/radial.css',
    './assets/js/main.js',
    './assets/fonts/MinecraftRus.woff2',
    './assets/fonts/Tsap-Tsarap.woff2'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => console.warn('Ошибка кэширования файлов:', err));
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('telegram.org') || 
        e.request.url.includes('open-meteo.com') || 
        e.request.url.includes('wttr.in') ||
        e.request.url.includes('esm.sh')) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .then((response) => {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(e.request);
            })
    );
});