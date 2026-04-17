'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

const STORAGE_KEY = 'bm-cart-v2'

export type CartItem = {
  id: number
  name: string
  price: number
  image: string | null
  qty: number
  variant: string
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

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
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
    setItems(prev => {
      const key = String(item.id) + (item.variant || '')
      const existing = prev.find(i => String(i.id) + (i.variant || '') === key)
      if (existing) {
        return prev.map(i => String(i.id) + (i.variant || '') === key
          ? { ...i, qty: i.qty + (item.qty || 1) } : i)
      }
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
  }, [])

  const removeItem = useCallback((id: number, variant = '') => {
    setItems(prev => prev.filter(i => !(i.id === id && (i.variant || '') === variant)))
  }, [])

  const updateQty = useCallback((id: number, variant = '', qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => !(i.id === id && (i.variant || '') === variant))
        : prev.map(i => i.id === id && (i.variant || '') === variant ? { ...i, qty } : i)
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
