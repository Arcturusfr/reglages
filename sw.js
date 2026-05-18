// PhotoManuel — Service Worker
// Version du cache
const CACHE_NAME = 'photomanuel-v3';

// Fichiers à mettre en cache pour le mode hors-ligne
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Échec de mise en cache de certains fichiers:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes — stratégie Cache-First pour les assets locaux
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-GET et les extensions chrome
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Mettre en cache les réponses valides des assets locaux
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback : retourner la page principale si hors-ligne
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
