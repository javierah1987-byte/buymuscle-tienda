// @ts-nocheck
'use client'
import { useEffect, useRef, useState } from 'react'

// Botón PayPal con captura REAL server-side.
//  - createOrder  → POST /api/paypal/create-order (importe autoritativo en servidor)
//  - onApprove    → POST /api/paypal/capture       (captura + crea el pedido 'paid')
// Props:
//   getPayload(): { items, discount_code, customer, channel }  (datos del carrito)
//   onSuccess(orderNumber)   onError(err)   validate?():boolean
export default function PayPalButton({ getPayload, onSuccess, onError, validate }){
  const ref = useRef(null)
  const [err, setErr] = useState('')
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

  useEffect(() => {
    if(!clientId || !ref.current) return
    const render = () => {
      if(!window.paypal || !ref.current) return
      ref.current.innerHTML = ''
      window.paypal.Buttons({
        style:{ layout:'vertical', color:'blue', shape:'rect', label:'pay' },
        onClick: (_, actions) => {
          if(validate && !validate()) return actions.reject?.()
        },
        createOrder: async () => {
          const r = await fetch('/api/paypal/create-order', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify(getPayload ? getPayload() : {}),
          })
          const d = await r.json()
          if(!r.ok || !d.ok || !d.id) throw new Error(d.error || 'No se pudo iniciar el pago')
          return d.id
        },
        onApprove: async (data) => {
          const r = await fetch('/api/paypal/capture', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ ...(getPayload ? getPayload() : {}), paypalOrderId: data.orderID }),
          })
          const d = await r.json()
          if(!r.ok || !d.ok){
            const m = d.error === 'sin_stock' ? 'Producto sin stock'
              : d.error === 'importe_no_coincide' ? 'El importe no coincide'
              : 'No se pudo confirmar el pago'
            onError && onError(new Error(m))
            return
          }
          onSuccess && onSuccess(d.order_number)
        },
        onError: (e) => { onError && onError(e) },
      }).render(ref.current)
    }
    const existing = document.getElementById('paypal-sdk')
    if(existing && window.paypal){ render(); return }
    const s = document.createElement('script')
    s.id = 'paypal-sdk'
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + clientId + '&currency=EUR&locale=es_ES'
    s.onload = render
    s.onerror = () => setErr('Error cargando PayPal')
    document.head.appendChild(s)
  }, [clientId])

  if(!clientId) return null
  if(err) return <div style={{ color:'red', fontSize:13, textAlign:'center' }}>{err}</div>
  return <div ref={ref} />
}
