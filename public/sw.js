/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `e-reussite-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `e-reussite-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

function isHtmlRequest(request) {
  return request.destination === 'document' || (request.headers.get('accept') || '').includes('text/html');
}

function isStaticAsset(request) {
  return ['script', 'style'].includes(request.destination);
}

function isImageOrFont(request) {
  return ['image', 'font'].includes(request.destination);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Network-first for HTML/documents to ensure fresh navigation
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Stale-While-Revalidate for JS/CSS
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          // Only cache if response is valid and request is http(s)
          if (response.ok && request.url.startsWith('http')) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Cache-first for images and fonts
  if (isImageOrFont(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});

// ============================================
// PUSH NOTIFICATIONS HANDLERS
// ============================================

/**
 * Événement 'push' - Réception d'une notification push
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'E-réussite',
    body: 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {}
  };

  // Si des données sont envoyées avec le push
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload:', payload);

      notificationData = {
        ...notificationData,
        ...payload,
        data: payload.data || {}
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Afficher la notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions || []
    })
  );
});

/**
 * Événement 'notificationclick' - Clic sur une notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Données de la notification
  const data = event.notification.data || {};
  const url = data.url || '/';

  // Ouvrir ou focus la fenêtre de l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre existe déjà, la focus
        for (const client of clientList) {
          if (client.url === self.location.origin + url && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

/**
 * Événement 'notificationclose' - Fermeture d'une notification
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
  
  // Optionnel : Logger la fermeture dans analytics
  const data = event.notification.data || {};
  if (data.trackClose) {
    // Envoyer un événement de tracking si nécessaire
    console.log('[Service Worker] Tracking notification close');
  }
});