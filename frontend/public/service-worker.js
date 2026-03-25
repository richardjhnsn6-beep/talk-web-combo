/* eslint-disable no-restricted-globals */

// Service Worker for RJHNSN12 PWA
// Enables offline functionality and app-like experience

const CACHE_NAME = 'rjhnsn12-v3-march25'; // Force complete cache refresh
const urlsToCache = [
  '/',
  '/ai-chat',
  '/radio',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/css/main.css'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache install failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline - API unavailable' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Cache-first strategy for static assets ONLY (images, fonts)
  // Network-first for HTML pages to ensure fresh content
  if (event.request.url.includes('.png') || 
      event.request.url.includes('.jpg') || 
      event.request.url.includes('.css') ||
      event.request.url.includes('.js') && !event.request.url.includes('hot-update')) {
    
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          });
        })
        .catch(() => {
          return new Response('Offline', { headers: { 'Content-Type': 'text/plain' } });
        })
    );
  } else {
    // Network-first for HTML pages (ensures fresh content on refresh)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              return new Response(
                '<h1>Offline</h1><p>Please check your internet connection.</p>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        })
    );
  }
});
