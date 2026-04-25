// BuyMuscle Service Worker v1
const CACHE = 'bm-v1'
const PRECACHE = ['/', '/tienda', '/carrito', '/offline']

// Instalar y cachear páginas clave
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  )
  self.skipWaiting()
})

// Activar y limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, cache fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('supabase') || e.request.url.includes('api/')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/offline')))
  )
})

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || 'BuyMuscle'
  const options = {
    body: data.body || 'Nueva oferta disponible en BuyMuscle',
    icon: '/icon',
    badge: '/icon',
    image: data.image || undefined,
    data: { url: data.url || '/' },
    actions: [
      { action: 'ver', title: 'Ver ahora' },
      { action: 'cerrar', title: 'Cerrar' },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || 'bm-notif',
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

// Click en notificación
self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'cerrar') return
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
      const match = ws.find(w => w.url === url && 'focus' in w)
      if (match) return match.focus()
      return clients.openWindow(url)
    })
  )
})

// Background sync (carritos abandonados)
self.addEventListener('sync', e => {
  if (e.tag === 'bm-abandoned') {
    e.waitUntil(
      self.registration.showNotification('Tienes productos en tu carrito', {
        body: 'Completa tu compra y no pierdas tus productos.',
        icon: '/icon',
        data: { url: '/carrito' },
        tag: 'bm-abandoned',
      })
    )
  }
})
