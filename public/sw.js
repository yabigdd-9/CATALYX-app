const CACHE_NAME = 'catalyx-grow-os-v3'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/feed-calculator',
  '/feed-log',
  '/products',
  '/offline',
  '/manifest.json',
  '/brand/official/logo-app-icon-official.png',
  '/brand/official/logo-production-official.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() =>
        caches.match(event.request).then((response) => {
          if (response) return response
          if (event.request.mode === 'navigate') return caches.match('/offline')
          return undefined
        })
      )
  )
})
