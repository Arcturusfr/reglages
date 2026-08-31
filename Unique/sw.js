// PhotoManuel — Service Worker
const CACHE_NAME = 'photomanuel-v19';

const ASSETS = [
  './index.html',
  './manifest.json',
];

// Installation : mise en cache initiale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activation : supprimer TOUS les anciens caches sans exception
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Suppression ancien cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

// Interception — stratégie NETWORK-FIRST pour index.html, cache-first pour le reste
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // index.html → Network-First : toujours essayer le réseau d'abord
  const isDocument = event.request.destination === 'document' ||
                     url.pathname.endsWith('index.html') ||
                     url.pathname === '/' || url.pathname === '';

  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre à jour le cache avec la version fraîche
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html')) // Fallback hors-ligne
    );
    return;
  }

  // Autres assets → Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.destination === 'document')
          return caches.match('./index.html');
      });
    })
  );
});
