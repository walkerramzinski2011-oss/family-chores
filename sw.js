const CACHE_NAME = "family-chores-v5";
const APP_SHELL = ["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function addInstallHelp(response) {
  const html = await response.text();
  const help = `
    <div class="card" style="margin-top:14px">
      <h2>Install Family Chores on your phone</h2>
      <p class="muted"><b>iPhone:</b> Open Family Chores in Safari, tap the Share button, choose <b>Add to Home Screen</b>, turn on <b>Open as Web App</b>, then tap <b>Add</b>.</p>
      <p class="muted"><b>Android:</b> Open Family Chores in Chrome, then choose <b>Install app</b> or <b>Add to Home screen</b>.</p>
      <p class="muted">Once installed, the Family Chores icon will appear on your Home Screen and you can open it like an app.</p>
    </div>`;
  return new Response(html.replace("</main>", help + "</main>"), {
    headers: {"Content-Type": "text/html; charset=utf-8"}
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAppPage = url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");

  if (isAppPage) {
    event.respondWith(fetch(request, {cache: "no-store"}).then(async response => {
      if (!response.ok) return response;
      const transformed = await addInstallHelp(response.clone());
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, transformed.clone());
      return transformed;
    }).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
