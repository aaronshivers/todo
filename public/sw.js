const CACHE_STATIC_NAME = `static-v1`
const CACHE_DYNAMIC_NAME = `dynamic-v1`

self.addEventListener('install', async event => {
  try {
    console.log(`[Service Worker] Installing Service Worker...`, event)
        const cache = await caches.open(CACHE_STATIC_NAME)
        if (cache) {
      console.log(`[Service Worker] Pre-Caching App Shell`)
            cache.addAll([
        `/`,
        `/offline`,
        `/login`,
        `/signup`,
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
    }
  } catch (error) {
    console.log(error.message)
  }
})


self.addEventListener('activate', async event => {
  try {
    console.log(`[Service Worker] Activating Service Worker...`, event)
  
    const keyList = await caches.keys()
    keyList.map(key => {
      if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
        console.log(`[Service Worker] Removing Old Cache.`)
        return caches.delete(key)
      }
    })
    return self.clients.claim()    
  } catch (error) {
    console.log(error.message)
  }
})

self.addEventListener('fetch', async event => {
  try {
    const response = await event.respondWith(caches.match(event.request))
    if (response) {
      return response
    } else {
      const res = await fetch(event.request)
      const cache = await caches.open(CACHE_DYNAMIC_NAME)
      cache.put(event.request.url, res.clone())
      return res
    }
  } catch (error) {
    const cache = await caches.open(CACHE_STATIC_NAME)
    return cache.match(`/offline.html`)
  }
})
