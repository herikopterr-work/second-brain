const CACHE_NAME = 'second-brain-pwa-v1';

const STATIC_ASSETS = [
  '/capture',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Install: Simpan shell aplikasi dan aset statis ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Tangani offline navigation dan asset caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya proses request GET dari origin yang sama
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Jangan cache auth API callbacks atau telemetry
  if (url.pathname.startsWith('/auth/')) {
    return;
  }

  // Untuk navigasi halaman (HTML document)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Salin response sukses ke cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Jika offline, ambil halaman dari cache (atau fallback ke /capture)
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const captureFallback = await caches.match('/capture');
          if (captureFallback) return captureFallback;

          return new Response('Offline: Aplikasi sedang offline.', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // Untuk aset statis (_next/static, icons, styles) -> Cache first / Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
