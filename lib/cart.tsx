'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Product } from './supabase'

export type CartItem = { product: Product; quantity: number; unitPrice: number }

type CartCtx = {
  items: CartItem[]
  add: (product: Product, qty?: number, distributorDiscount?: number) => void
  remove: (productId: number) => void
  update: (productId: number, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const add = useCallback((product: Product, qty = 1, discount = 0) => {
    const unitPrice = product.price_incl_tax * (1 - discount / 100)
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { product, quantity: qty, unitPrice }]
    })
  }, [])
  const remove = useCallback((id: number) => setItems(p => p.filter(i => i.product.id !== id)), [])
  const update = useCallback((id: number, qty: number) => setItems(p => p.map(i => i.product.id === id ? { ...i, quantity: qty } : i).filter(i => i.quantity > 0)), [])
  const clear = useCallback(() => setItems([]), [])
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)
  return <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
