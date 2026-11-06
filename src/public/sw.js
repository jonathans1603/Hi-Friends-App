const SHELL = 'hf-shell-v1', DATA = 'hf-data', ASSETS = 'hf-assets';
const PRECACHE = ['/', '/index.html', '/app.bundle.js', '/manifest.json', '/favicon.png', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('hf-shell') && k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function put(name, req, res) {
  try { if (res && (res.ok || res.type === 'opaque')) await (await caches.open(name)).put(req, res.clone()); } catch { /* abaikan */ }
  return res;
}
// Network first: selalu coba data terbaru, jatuh ke cache saat offline (app shell & data API)
async function networkFirst(req, name, fallback) {
  try { return await put(name, req, await fetch(req)); }
  catch { return (await caches.match(req)) || (fallback && (await caches.match(fallback))) || Response.error(); }
}
// Stale while revalidate: gambar, tile peta, font
async function swr(req, name) {
  const hit = await caches.match(req);
  const net = fetch(req).then((r) => put(name, req, r)).catch(() => hit || Response.error());
  return hit || net;
}
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (!u.protocol.startsWith('http')) return;
  if (u.hostname === 'story-api.dicoding.dev') e.respondWith(u.pathname.includes('/images/') ? swr(r, ASSETS) : networkFirst(r, DATA));
  else if (u.origin === location.origin) e.respondWith(networkFirst(r, SHELL, r.mode === 'navigate' ? '/index.html' : null));
  else e.respondWith(swr(r, ASSETS));
});

// Push: judul, isi, dan ikon diambil dari data yang dikirim server
self.addEventListener('push', (e) => {
  let d = { title: 'Hi-Friends', options: { body: 'Ada kabar baru dari temanmu!' } };
  try { d = e.data.json(); } catch { if (e.data) d.options.body = e.data.text(); }
  const o = d.options || {};
  e.waitUntil(self.registration.showNotification(d.title || 'Hi-Friends', {
    icon: '/icons/icon-192.png', badge: '/icons/icon-192.png',
    actions: [{ action: 'detail', title: 'Lihat detail' }],
    ...o, data: { storyId: 'latest', ...(o.data || {}) },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = `/#/story/${encodeURIComponent(e.notification.data?.storyId || 'latest')}`;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    if (list.length) { list[0].focus(); return list[0].navigate(url); }
    return self.clients.openWindow(url);
  }));
});
