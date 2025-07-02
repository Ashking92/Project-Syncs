
const CACHE_NAME = 'proposync-v1';
const urlsToCache = [
  '/',
  '/submit',
  '/admin',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
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
      // Handle background sync operations here
      console.log('Performing background sync...')
    );
  }
});
