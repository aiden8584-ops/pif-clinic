// PIF 오늘 클리닉 서비스 워커 — 화면 파일만 보관 (학생 데이터·로그인은 저장하지 않음)
// 항상 최신 화면을 먼저 받고, 인터넷이 끊겼을 때만 보관본을 보여 줍니다.
const CACHE = 'pif-clinic-shell-v2';   // v2 (10-23): 새 학원관리 앱 안내 화면, 옛 앱은 old.html
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // 서버(Apps Script) 요청은 건드리지 않음
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
