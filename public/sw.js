const CACHE_VERSION = `toutopia-v2-${Date.now()}`;
const CACHE_NAME = CACHE_VERSION;
const OFFLINE_DB_NAME = "ToutopiaOffline";
const OFFLINE_DB_VERSION = 1;

const STATIC_ASSETS = [
  "/",
  "/offline",
];

const API_CACHE_ROUTES = [
  "/api/offline-sync",
  "/api/daily-challenge",
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — smart caching strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Network-first for cacheable API routes (with offline fallback)
  if (API_CACHE_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({
                success: false,
                error: { code: "OFFLINE", message: "Kamu sedang offline. Data terakhir tidak tersedia." },
              }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Skip other API routes
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for static assets (fonts, images, scripts)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for pages, fallback to cache then /offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.pathname.startsWith("/dashboard")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/offline"))
      )
  );
});

// Background Sync — sync offline answers when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-answers") {
    event.waitUntil(syncOfflineAnswers());
  }
});

async function syncOfflineAnswers() {
  try {
    const db = await openDB();
    const tx = db.transaction("pendingSync", "readonly");
    const store = tx.objectStore("pendingSync");

    const items = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!items || items.length === 0) return;

    const response = await fetch("/api/offline-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => i.data) }),
    });

    if (response.ok) {
      // Clear synced items
      const deleteTx = db.transaction("pendingSync", "readwrite");
      const deleteStore = deleteTx.objectStore("pendingSync");
      for (const item of items) {
        deleteStore.delete(item.id);
      }
    }
  } catch (err) {
    // Will retry on next sync event
    console.warn("[SW] Sync failed, will retry:", err);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("cachedQuestions")) {
        db.createObjectStore("cachedQuestions", { keyPath: "attemptId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_EXAM") {
    cacheExamForOffline(event.data.attemptId);
  }
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function cacheExamForOffline(attemptId) {
  if (!attemptId) return;
  try {
    const response = await fetch(`/api/offline-sync?attemptId=${attemptId}`);
    if (response.ok) {
      const result = await response.json();
      const db = await openDB();
      const tx = db.transaction("cachedQuestions", "readwrite");
      const store = tx.objectStore("cachedQuestions");
      store.put({ attemptId, data: result.data, cachedAt: Date.now() });

      // Notify the app
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: "EXAM_CACHED", attemptId });
      });
    }
  } catch (err) {
    console.warn("[SW] Failed to cache exam:", err);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Toutopia";
  const options = {
    body: data.message ?? data.body ?? "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: { url: data.url ?? "/dashboard" },
    actions: data.actions ?? [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
