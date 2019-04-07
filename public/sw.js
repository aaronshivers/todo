const CACHE_STATIC_NAME = `static-v1`
const CACHE_DYNAMIC_NAME = `dynamic-v1`

self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing Service Worker...`, event)
  event.waitUntil(caches.open(CACHE_STATIC_NAME).then(cache => {
    console.log(`[Service Worker] Pre-Caching App Shell`)
    cache.addAll([
      `/`,
      `/login`,
      `/signup`,
      `/todos`,
      `/todos/new`,
      `/users`,
      `/users/profile`,
      `/admin`,
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
  }))
})


self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating Service Worker...`, event)
  event.waitUntil(caches.keys().then(keyList => {
    return Promise.all(keyList.map(key => {
      if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
        console.log(`[Service Worker] Removing Old Cache.`)
        return caches.delete(key)
      }
    }))
  }))
  return self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => {
    if (response) {
      return response
    } else {
      return fetch(event.request).then(res => {
        return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
          cache.put(event.request.url, res.clone())
          return res
        })
      })
    }
  }))
})

