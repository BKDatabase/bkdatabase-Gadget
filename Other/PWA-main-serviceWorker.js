const CACHE_NAME = "mediawiki-pwa-bkdsafepatch-v4";
const MAX_CACHE_ITEMS = 20; // số item tối đa
const MAX_ITEM_SIZE = 50 * 1024; // 50 kB, chỉ cache response ≤50kB

// Asset cơ bản luôn cache khi install
const urlsToCache = [
  "/", // Main Page
  "/wiki/Main_Page", // ví dụ cache ngay luôn tại Main Page
  "/w/load.php", // script js/css core của MediaWiki
  "/1.44/resources/assets/poweredby_mediawiki.svg", // Logo poweredbymediawiki
  "/1.44/resources/assets/licenses/cc-by-sa.png" // Logo cc-by-sa licenses
];

// Xóa item thừa cho đến khi <= maxItems
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  let keys = await cache.keys();
  while (keys.length > maxItems) {
    await cache.delete(keys[0]);
    keys = await cache.keys();
  }
}

self.addEventListener("install", event => {
  console.log("ServiceWorker: installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  console.log("ServiceWorker: activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Chỉ cache same-origin & file tĩnh nhỏ
  if (url.origin === location.origin && /\.(js|css|svg|png|jpg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request).then(fetchResponse => {
          if (!fetchResponse.ok) return fetchResponse;

          const contentLength = fetchResponse.headers.get("content-length");
          if (!contentLength || parseInt(contentLength) > MAX_ITEM_SIZE) {
            return fetchResponse; // không cache nếu không rõ size
          }

          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            limitCacheSize(CACHE_NAME, MAX_CACHE_ITEMS);
            return fetchResponse;
          });
        });
      })
    );
  }

  // Page HTML (/wiki/) → chỉ cache nếu nhỏ và có content-length
  else if (url.origin === location.origin && url.pathname.startsWith("/wiki/")) {
    event.respondWith(
      fetch(event.request).then(fetchResponse => {
        if (fetchResponse.ok) {
          const contentLength = fetchResponse.headers.get("content-length");
          if (contentLength && parseInt(contentLength) <= MAX_ITEM_SIZE) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              limitCacheSize(CACHE_NAME, MAX_CACHE_ITEMS);
            });
          }
        }
        return fetchResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
