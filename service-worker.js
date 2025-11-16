// service-worker.js

// ❗ Altere a versão sempre que atualizar o código
const CACHE_VERSION = 'v3';
const CACHE_NAME = `samenext-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.jpeg'
];

// Instalação (instala imediatamente)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // força ativação imediata
});

// Ativação (remove caches antigos automaticamente)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim(); // assume controle imediatamente
});

// Fetch com fallback à rede
self.addEventListener('fetch', event => {

  // Evita cachear o próprio service-worker
  if (event.request.url.includes('service-worker.js')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
