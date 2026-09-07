// PhotoManuel — Service Worker Optimisé
const CACHE_NAME = 'photomanuel-v20';

const ASSETS = [
  '/', // 💡 Utiliser la racine plutôt que ./index.html pour éviter les doublons
  './index.html',
  './manifest.json',
];

// Installation : mise en cache initiale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
});

// Activation : supprimer TOUS les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Suppression ancien cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim()) // Prend le contrôle des pages immédiatement
  );
});

// Interception
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Détection propre du document principal
  const isDocument = event.request.destination === 'document' ||
                     url.pathname.endsWith('index.html') ||
                     url.pathname === '/';

  if (isDocument) {
    // 💡 STRATÉGIE NETWORK-FIRST PROPRE
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback : On cherche d'abord la requête exacte, sinon la racine
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/') || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Autres assets (images, js, css) → Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
