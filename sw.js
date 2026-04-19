/* RMS Service Worker — Network First, No Caching */
const VERSION = 'rms-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    // Delete ALL old caches
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim(); // take control of all pages immediately
    })
  );
});

// NETWORK FIRST — always try network, never serve from cache
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .catch(function() {
        // Only fall back to cache if completely offline
        return caches.match(e.request);
      })
  );
});
