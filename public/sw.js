const CACHE_NAME = 'izlenti-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon.png',
  '/critic/liked_clapper.png',
  '/critic/liked_heart.png',
  '/critic/liked_oscar.png',
  '/critic/liked_popcorn.png',
  '/critic/liked_tea.png',
  '/critic/average_clapper.png',
  '/critic/disliked_clapper.png',
  '/critic/disliked_bored.png',
  '/critic/disliked_thumbsdown.png',
  '/critic/disliked_facepalm.png',
  '/critic/disliked_brokenheart.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Let the browser handle standard requests organically, fallback to cache if offline
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
