self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing Service Worker...`, event)
  event.waitUntil(caches.open('static').then(cache => {
    console.log(`[Service Worker] Pre-Caching App Shell`)
    cache.add(`/js/script.js`)
  }))
})


self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating Service Worker...`, event)
  return self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => {
    response ? response : fetch(event.request)
  }))
})
