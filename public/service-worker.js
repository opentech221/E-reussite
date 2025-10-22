const CACHE_NAME = 'e-reussite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de la mise en cache:', error);
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Stratégie de cache: Network First avec fallback vers Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers les APIs externes
  if (
    request.url.includes('supabase.co') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('analytics') ||
    request.url.includes('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    // Essayer le réseau d'abord
    fetch(request)
      .then((response) => {
        // Si la réponse est valide, la mettre en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, chercher dans le cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si pas dans le cache et que c'est une page HTML, renvoyer la page offline
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[SW] Synchronisation en arrière-plan:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Fonction de synchronisation des données
async function syncData() {
  try {
    // Récupérer les données en attente depuis IndexedDB
    // et les envoyer au serveur
    console.log('[SW] Synchronisation des données...');
    
    // Cette logique sera implémentée selon vos besoins
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Erreur lors de la synchronisation:', error);
    return Promise.reject(error);
  }
}
