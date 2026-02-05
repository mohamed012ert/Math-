const cacheName = 'academy-v1';
const assets = ['./', './index.html', './dashboard.html', './config.js'];

// Install Service Worker
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(assets);
        })
    );
});

// Fetch Assets
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request);
        })
    );
});