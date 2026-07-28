// @ts-nocheck
// Página "Lo más vendido" (la que abre el menú). Lista CURADA por data:
// products.is_bestseller=true ordenados por bestseller_rank asc (los 21 poblados).
// Server component (ISR 5 min) — mismo dato que el carrusel de la home, aquí como GRID.
import { supabase } from '@/lib/supabase'
import { CARD_COLUMNS } from '@/lib/productCard'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Lo más vendido | BuyMuscle',
  description: 'Los productos más vendidos de BuyMuscle Canarias, en orden.',
}

async function getBestsellers() {
  const { data } = await supabase.from('products')
    .select(CARD_COLUMNS + ',categories(name)')
    .eq('active', true).gt('stock', 0)
    .eq('is_bestseller', true)
    .order('bestseller_rank', { ascending: true })
    .limit(60)
  return data || []
}

export default async function LoMasVendidoPage() {
  const products = await getBestsellers()
  return (
    <main style={{ background: '#f5f5f5', minHeight: '70vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontSize: 13, color: '#888', margin: '0 0 10px', fontWeight: 400 }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</Link> › <strong style={{ color: '#111' }}>Lo más vendido</strong>
        </h1>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>🏆 Lo más vendido</h2>
        </div>
        <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px' }}>
          Nuestros {products.length} productos más vendidos, en orden.
        </p>
        {products.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #eee', padding: '40px', textAlign: 'center', color: '#888', borderRadius: 6 }}>
            Aún no hay productos destacados. <Link href="/tienda" style={{ color: 'var(--red)' }}>Ver toda la tienda →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: '#e8e8e8', border: '1px solid #e8e8e8' }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  )
}
