const CACHE_NAME = 'map-viewer-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
  // 外部CDNのキャッシュはブラウザのポリシーによるため、
  // 完全オフライン化には本来ライブラリをダウンロードしてローカル配置するのがベストですが、
  // 簡易的にRuntime Cacheで対応します。
];

// インストール時にコアファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// リクエスト処理（キャッシュ優先、なければネットワーク）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあればそれを返す
      if (cachedResponse) {
        return cachedResponse;
      }
      // なければネットワークへ取りに行く
      return fetch(event.request).then((response) => {
        // レスポンスが正しいかチェック
        if (!response || response.status !== 200 || response.type !== 'basic') {
          // CDNなどの外部リソース(type: opaque/cors)もキャッシュしたい場合は条件を緩める必要がありますが、
          // ここでは簡易実装としてそのまま返します。
          // Leaflet等のCDNをオフライン対応させる最も確実な方法は、
          // JS/CSSファイルをダウンロードしてプロジェクトフォルダに含めることです。
        }
        return response;
      });
    })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );

});
