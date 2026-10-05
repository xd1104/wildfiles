// 荒野數據 — Service Worker（2026-10-05）
// 只做一件事：收手機推播（題目出來了、有片可以審）。⛔ 不快取任何檔案，免得手機卡在舊版。
// 推播由電腦的 animal-shorts/live/work.py 在狀態變化時送出（Web Push，VAPID 跟交易儀表板共用同一組）。
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: '荒野數據', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '荒野數據', {
    body: d.body || '', tag: d.tag || 'wildfiles', renotify: true,
    icon: 'icon-192.png', badge: 'icon-192.png', data: { tab: d.tab || '' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var tab = (e.notification.data && e.notification.data.tab) || '';
  var url = new URL('./' + (tab ? '#' + tab : ''), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) {
      if (cs[i].url.indexOf(self.registration.scope) === 0) { cs[i].postMessage({ tab: tab }); return cs[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
