// sw.js: Умный Service Worker (Network First)
const CACHE_NAME = 'timehub-v1793753649'; // Это значение теперь обновляется автоматически Git-хуком
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
    // Не ждем закрытия старых вкладок, активируемся сразу
    self.skipWaiting(); 
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => console.warn('Ошибка кэширования:', err));
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

// Слушаем команду от pwa.js на принудительную активацию
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('telegram.org') || 
        e.request.url.includes('open-meteo.com') || 
        e.request.url.includes('wttr.in') ||
        e.request.url.includes('esm.sh') ||
        e.request.url.includes('fonts.googleapis.com') ||
        e.request.url.includes('fonts.gstatic.com')) {
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