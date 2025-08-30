// public/serviceWorker.js

const CACHE_NAME = "my-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  // Add other resources that you want to cache
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         // Clone the response to inspect headers
//         const responseClone = response.clone();

//         // Check if the response has a no-store header
//         if (responseClone.headers.get("Cache-Control") === "no-store") {
//           return response; // Bypass the cache
//         }

//         // Check if the request URL should bypass cache
//         const url = new URL(event.request.url);
//         if (url.pathname.startsWith("/api/")) {
//           return response;
//         }

//         // Cache the response if not explicitly bypassed
//         return caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       })
//       .catch(() => {
//         // If the fetch fails, try to get it from the cache
//         console.error("Fetching failed:", error);
//         // throw error;
//       })
//   );
//   const requestUrl = new URL(event.request.url);

//   if (requestUrl.pathname.startsWith("/api/")) {
//     event.respondWith(fetch(event.request));
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }
//       return fetch(event.request);
//     })
//   );
// });

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
