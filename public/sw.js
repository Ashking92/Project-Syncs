
const CACHE_NAME = 'proposync-v2';
const urlsToCache = [
  '/',
  '/submit',
  '/admin',
  '/auth',
  '/student-dashboard',
  '/welcome',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Prevent automatic refresh on PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Take control immediately
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Enhanced fetch handler to prevent unnecessary refreshes
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (page refreshes)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, return the response
          if (response.ok) {
            return response;
          }
          // If failed, serve the cached index.html (SPA fallback)
          return caches.match('/') || caches.match('/index.html');
        })
        .catch(() => {
          // Network failed, serve cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'PropoSync Notification',
        body: event.data.text() || 'You have a new update!',
        icon: '/feedback.png',
        badge: '/feedback.png'
      };
    }
  } else {
    notificationData = {
      title: 'PropoSync Notification',
      body: 'You have a new update!',
      icon: '/feedback.png',
      badge: '/feedback.png'
    };
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/feedback.png',
    badge: notificationData.badge || '/feedback.png',
    vibrate: [200, 100, 200],
    data: notificationData.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/feedback.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus on it
        for (const client of clientList) {
          if (client.url.includes('/student-dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('/student-dashboard');
        }
      })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      console.log('Performing background sync...')
    );
  }
});

// Handle app updates without forcing refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
