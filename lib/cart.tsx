'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { trackAddToCart } from './analytics'

const STORAGE_KEY = 'bm-cart-v2'

export type CartItem = {
  id: number
  name: string
  price: number
  image: string | null
  qty: number
  variant: string
  variantId?: number | null
  stock?: number | null   // stock disponible conocido al añadir; capa la cantidad
}

// Tope de cantidad al stock disponible (defensa en cliente; el servidor revalida
// y reembolsa si hace falta). Solo capa cuando hay un stock fiable (>=1); mínimo 1.
function capToStock(qty: number, stock?: number | null): number {
  const q = Math.max(1, Math.floor(Number(qty) || 1))
  return (typeof stock === 'number' && Number.isFinite(stock) && stock >= 1)
    ? Math.min(q, Math.floor(stock))
    : q
}

type CartCtx = {
  items: CartItem[]
  add: (item: Omit<CartItem,'qty'> & { qty?: number }) => void
  removeItem: (id: number, variant?: string) => void
  remove: (id: number, variant?: string) => void
  updateQty: (id: number, variant: string, qty: number) => void
  clearCart: () => void
  clear: () => void
  count: number
  total: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Cargar desde localStorage al montar. Se valida cada entrada: un carrito
  // corrupto (precio/qty no numéricos) contaminaría TODOS los totales con NaN.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const clean = (Array.isArray(parsed) ? parsed : [])
          .map((i: any) => ({ ...i, id: Number(i?.id), price: Number(i?.price), qty: Number(i?.qty) }))
          .filter((i: any) => Number.isFinite(i.id) && Number.isFinite(i.price) && Number.isFinite(i.qty) && i.qty > 0)
        setItems(clean)
      }
    } catch {}
    setLoaded(true)
  }, [])

  // Guardar en localStorage cuando cambian los items
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, loaded])

  const add = useCallback((item: Omit<CartItem,'qty'> & { qty?: number }) => {
    trackAddToCart({ id: item.id, name: item.name, price: item.price, qty: item.qty || 1 })
    setItems(prev => {
      const key = String(item.id) + (item.variant || '')
      const existing = prev.find(i => String(i.id) + (i.variant || '') === key)
      // El stock recién informado manda; si no viene, se conserva el ya guardado.
      const stock = item.stock != null ? item.stock : existing?.stock
      if (existing) {
        return prev.map(i => String(i.id) + (i.variant || '') === key
          ? { ...i, qty: capToStock(i.qty + (item.qty || 1), stock), stock: stock ?? i.stock } : i)
      }
      return [...prev, { ...item, qty: capToStock(item.qty || 1, stock), stock: stock ?? null }]
    })
  }, [])

  const removeItem = useCallback((id: number, variant = '') => {
    setItems(prev => prev.filter(i => !(i.id === id && (i.variant || '') === variant)))
  }, [])

  const updateQty = useCallback((id: number, variant = '', qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => !(i.id === id && (i.variant || '') === variant))
        : prev.map(i => i.id === id && (i.variant || '') === variant
            ? { ...i, qty: capToStock(qty, i.stock) } : i)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, add,
      removeItem, remove: removeItem,
      updateQty,
      clearCart, clear: clearCart,
      count, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
