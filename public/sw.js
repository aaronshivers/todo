self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing Service Worker...`, event)
  event.waitUntil(caches.open('static').then(cache => {
    console.log(`[Service Worker] Pre-Caching App Shell`)
    cache.addAll([
      `/`,
      `/js/script.js`,
      `/js/home-script.js`,
      `/js/promise.js`,
      `/js/fetch.js`,
      `/css/bootstrap.min.css`,
      `https://code.jquery.com/jquery-3.3.1.slim.min.js`,
      `https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js`,
      `https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js`,
      `https://fonts.googleapis.com/css?family=Lato:400,700,400italic`
    ])
    cache.add(`/js/script.js`)
  }))
})


self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating Service Worker...`, event)
  return self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => {
    if (response) {
      return response
    } else {
      fetch(event.request)
    }
  }))
})
