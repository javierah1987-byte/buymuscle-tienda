'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Product } from './supabase'

export type CartItem = {
  product: Product
  qty: number          // cantidad
  price: number        // precio unitario con descuento
  discountPct: number  // % descuento aplicado
  // aliases para compatibilidad
  quantity: number
  unitPrice: number
}

type CartCtx = {
  items: CartItem[]
  add: (product: Product, qty?: number, discountPct?: number) => void
  remove: (productId: number) => void
  updateQty: (productId: number, qty: number) => void
  update: (productId: number, qty: number) => void  // alias
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartCtx | null>(null)

function makeItem(product: Product, qty: number, discountPct: number): CartItem {
  const price = product.price_incl_tax * (1 - discountPct / 100)
  return { product, qty, price, discountPct, quantity: qty, unitPrice: price }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = useCallback((product: Product, qty = 1, discountPct = 0) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, qty: i.qty + qty, quantity: i.qty + qty }
          : i)
      }
      return [...prev, makeItem(product, qty, discountPct)]
    })
  }, [])

  const remove = useCallback((id: number) =>
    setItems(p => p.filter(i => i.product.id !== id)), [])

  const updateQty = useCallback((id: number, qty: number) =>
    setItems(p => p.map(i => i.product.id === id
      ? { ...i, qty, quantity: qty }
      : i).filter(i => i.qty > 0)), [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, update: updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
