const CACHE_NAME = 'catalyx-grow-os-v8'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/install',
  '/feed-calculator',
  '/feed-log',
  '/products',
  '/offline',
  '/manifest.json',
  '/brand/catalyx/favicon_180x180.png',
  '/brand/catalyx/favicon_256x256.png',
  '/brand/catalyx/favicon_512x512.png',
  '/brand/catalyx/CATALYX_Monogram_Full_Colour.png',
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

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'Catalyx reminder', body: event.data ? event.data.text() : 'Open Catalyx to review your grow task.' }
  }

  const title = payload.title || 'Catalyx reminder'
  const options = {
    body: payload.body || 'Open Catalyx to review your grow task.',
    icon: '/brand/catalyx/favicon_256x256.png',
    badge: '/brand/catalyx/favicon_128x128.png',
    tag: payload.tag || 'catalyx-reminder',
    data: {
      url: payload.url || '/reminders',
      reminderId: payload.reminderId || null,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(targetUrl)) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(targetUrl)
      return undefined
    })
  )
})
