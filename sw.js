const CACHE_NAME = 'map-viewer-v3.9.0'; /* バージョンを更新 */
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. インストール時に強制的に待機状態をスキップ
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ネットワーク優先（Network First）戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワーク通信が成功したら、最新データをキャッシュにも保存して返す
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワーク通信が失敗（オフライン）した場合のみ、キャッシュを返す
        return caches.match(event.request);
      })
  );
});

// 3. アクティブ時に古いキャッシュを即座に削除し、すぐさまコントロールを奪う
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});
