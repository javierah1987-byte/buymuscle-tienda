// @ts-nocheck
'use client'
import { useCart } from '@/lib/cart'

const FREE_SHIP = 50
const SHIP_COST = 4.90

export default function ShippingBar() {
  const { items } = useCart()
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const remaining = Math.max(0, FREE_SHIP - total)
  const pct = Math.min(100, (total / FREE_SHIP) * 100)
  const free = total >= FREE_SHIP

  return (
    <div style={{
      background: free ? '#22c55e' : '#111',
      color: 'white',
      padding: '7px 20px',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.02em',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {free
        ? <span>🎉 ¡Envío GRATIS aplicado en tu pedido!</span>
        : <span>🚚 ¡Te faltan <strong style={{color:'#ffd700'}}>{remaining.toFixed(2)} €</strong> para envío GRATIS · Ahorra {SHIP_COST.toFixed(2)} €</span>
      }
      {!free && (
        <div style={{
          position:'absolute',bottom:0,left:0,
          height:3,width:pct+'%',
          background:'linear-gradient(90deg,#ff1e41,#ffd700)',
          transition:'width 0.5s ease'
        }}/>
      )}
    </div>
  )
}
