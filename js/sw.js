// PhotoManuel — Service Worker
const CACHE_NAME = 'photomanuel-v20'; // syntaxe corrigée

const ASSETS = [
  './index.html',
  './manifest.json',
];

// Installation : mise en cache initiale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // On attend que le cache soit prêt avant de skip
      .catch(err => console.error('[SW] Échec de l installation du cache:', err))
  );
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

  // index.html et requêtes de navigation → Network-First
  const isDocument = event.request.destination === 'document' ||
                     url.pathname.endsWith('index.html') ||
                     url.pathname === '/' || url.pathname === '';

  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html')) // Fallback hors-ligne
    );
    return;
  }

  // Autres assets (JS, CSS, Images) → Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Correction : On ne met en cache que les requêtes réussies de notre propre domaine
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Pas de réseau et pas de cache
        if (event.request.destination === 'image') {
          // Optionnel : retourner une image par défaut hors-ligne ici
        }
      });
    })
  );
});
