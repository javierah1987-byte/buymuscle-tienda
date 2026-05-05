// BuyMuscle Service Worker v3 - PWA
const CACHE_VERSION = 'bm-v3'
const STATIC_CACHE = CACHE_VERSION + '-static'
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic'

// Archivos a cachear en install
const PRECACHE_URLS = [
  '/',
  '/tienda',
  '/carrito',
  '/offline',
  '/manifest.json',
]

// Install: precachear páginas clave
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(err) {
        console.log('[SW] Precache error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate: limpiar caches viejos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== STATIC_CACHE && k !== DYNAMIC_CACHE })
            .map(function(k) { return caches.delete(k) })
      )
    })
  )
  self.clients.claim()
})

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url)

  // Ignorar: no GET, Supabase API, Analytics, extensiones
  if (e.request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.hostname.includes('google-analytics')) return
  if (url.hostname.includes('facebook')) return
  if (url.protocol === 'chrome-extension:') return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // Imágenes: cache first (hasta 30 días)
  if (e.request.destination === 'image') {
    e.respondWith(
      caches.open(DYNAMIC_CACHE).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          if (cached) return cached
          return fetch(e.request).then(function(res) {
            if (res && res.status === 200) cache.put(e.request, res.clone())
            return res
          }).catch(function() { return cached || new Response('', { status: 404 }) })
        })
      })
    )
    return
  }

  // Next.js static assets (_next/static): cache first
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.open(STATIC_CACHE).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          if (cached) return cached
          return fetch(e.request).then(function(res) {
            if (res && res.status === 200) cache.put(e.request, res.clone())
            return res
          })
        })
      })
    )
    return
  }

  // Páginas HTML: network first, cache fallback, offline fallback
  if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(function(res) {
          if (res && res.status === 200) {
            const resClone = res.clone()
            caches.open(DYNAMIC_CACHE).then(function(cache) { cache.put(e.request, resClone) })
          }
          return res
        })
        .catch(function() {
          return caches.match(e.request).then(function(cached) {
            return cached || caches.match('/offline')
          })
        })
    )
    return
  }
})

// Push notifications
self.addEventListener('push', function(e) {
  const data = e.data ? e.data.json() : {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'BuyMuscle', {
      body: data.body || 'Nueva notificación',
      icon: '/icon?size=192',
      badge: '/icon?size=72',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
    })
  )
})

// Click en notificación -> abrir URL
self.addEventListener('notificationclick', function(e) {
  e.notification.close()
  e.waitUntil(
    clients.openWindow(e.notification.data.url || '/')
  )
})
