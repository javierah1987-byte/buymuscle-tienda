// @ts-nocheck
// Eventos de e-commerce para GA4 (gtag) y Meta Pixel (fbq).
// Los scripts solo se cargan tras el consentimiento de cookies
// (components/CookieConsentManager.tsx), así que aquí basta con comprobar
// que los globales existen: si no hay consentimiento, son no-ops.

function gtag(...args) {
  try { if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args) } catch {}
}
function fbq(...args) {
  try { if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq(...args) } catch {}
}

// item: { id, name, price, qty? }
export function trackAddToCart(item) {
  if (!item) return
  const price = Number(item.price) || 0
  const qty = Number(item.qty) || 1
  gtag('event', 'add_to_cart', {
    currency: 'EUR',
    value: price * qty,
    items: [{ item_id: String(item.id), item_name: item.name, price, quantity: qty }],
  })
  fbq('track', 'AddToCart', {
    currency: 'EUR',
    value: price * qty,
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: 'product',
  })
}

export function trackBeginCheckout(total) {
  gtag('event', 'begin_checkout', { currency: 'EUR', value: Number(total) || 0 })
  fbq('track', 'InitiateCheckout', { currency: 'EUR', value: Number(total) || 0 })
}

// { order_number, total, items?: [{ id?, name?, price?, qty? }] }
export function trackPurchase({ order_number, total, items = [] } = {}) {
  const value = Number(total) || 0
  gtag('event', 'purchase', {
    transaction_id: order_number,
    currency: 'EUR',
    value,
    items: (items || []).map((i) => ({
      item_id: i.id != null ? String(i.id) : undefined,
      item_name: i.name,
      price: Number(i.price) || 0,
      quantity: Number(i.qty) || 1,
    })),
  })
  fbq('track', 'Purchase', {
    currency: 'EUR',
    value,
    content_ids: (items || []).map((i) => String(i.id)).filter(Boolean),
    content_type: 'product',
  })
}
