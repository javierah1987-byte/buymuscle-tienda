// BuyMuscle Service Worker v4 - PWA
// v4: el SW YA NO intercepta imágenes (ver el bloque `destination === 'image'` abajo).
// Subir la versión es parte del arreglo: `activate` borra todos los caches que no sean
// los de esta versión, así que al actualizar se PURGAN las entradas de imagen envenenadas
// que la v3 dejó en los navegadores (era lo que hacía ver fotos rotas aunque el
// servidor las sirviera con 200).
const CACHE_VERSION = 'bm-v4'
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

  // ── IMÁGENES: el SW NO las toca. Las gestiona el caché HTTP del navegador. ──
  //
  // La v3 hacía cache-first sobre ellas y tenía dos fallos que se veían como FOTOS ROTAS
  // en el navegador aunque el servidor las sirviera con 200:
  //   1) Cache-first SIN caducidad ni revalidación (el comentario "hasta 30 días" no lo
  //      implementaba nadie): la primera respuesta que entrara al caché se servía PARA
  //      SIEMPRE. Una imagen que cambió de URL/host —p. ej. las que se rehospedaron al
  //      dejar de hotlinkear el PrestaShop viejo— se quedaba clavada en la versión mala,
  //      y el único modo de purgarla era cambiar CACHE_VERSION (por eso esto es v4).
  //   2) Ante CUALQUIER fallo de red fabricaba `new Response('', {status:404})`: una
  //      respuesta vacía que el navegador pinta como imagen rota, en vez de dejar que
  //      falle de verdad (que es lo que activa el reintento del navegador y el
  //      `onError` de los componentes, que sí tienen su propio placeholder).
  //
  // No se sustituye por stale-while-revalidate: para una tienda, una foto de producto
  // equivocada es peor que una petición de red, y el caché HTTP ya hace bien este trabajo
  // (valida con ETag/Last-Modified y respeta Cache-Control; el optimizador de Next sirve
  // /_next/image con max-age de 30 días). El SW no aportaba nada aquí salvo el bug.
  // Si algún día se quiere caché de imágenes offline, hay que hacerlo con TTL, sin
  // guardar respuestas opacas (status 0 = no sabemos si el otro dominio devolvió 404)
  // y sin inventar respuestas de error.
  if (e.request.destination === 'image') return

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
