// Queries compartidas de la home (page.tsx recomendada + home-b conservadora).
// Solo lecturas; misma fuente canónica de columnas que las tarjetas.
import { supabase } from '@/lib/supabase'
import { CARD_COLUMNS } from '@/lib/productCard'

// Las tarjetas solo usan CARD_COLS; el tipo Product completo no aplica aquí.
const CARD_COLS = CARD_COLUMNS + ',categories(name)'

export async function getHomeProducts(opts: { cat?: string; brand?: string; limit?: number; orderBy?: 'id' | 'stock' } = {}) {
  const { cat, brand, limit = 8, orderBy = 'id' } = opts
  let q = supabase.from('products').select(CARD_COLS).eq('active', true).gt('stock', 0)
  if (cat) {
    const { data: cd } = await supabase.from('categories').select('id').eq('name', cat).single()
    if (cd) q = q.eq('category_id', cd.id)
  }
  if (brand) q = q.eq('brand', brand)
  q = orderBy === 'stock' ? q.order('stock', { ascending: false }) : q.order('id', { ascending: false })
  const { data } = await q.limit(limit)
  return (data || []) as any[]
}

// Banners del hero en servidor (ISR): el primer slide sale en el HTML inicial
// → mejor LCP y sin doble descarga fallback→real en el cliente.
export async function getHomeBanners() {
  const { data } = await supabase.from('banners')
    .select('id,image_url,url,title,subtitle')
    .eq('active', true).order('order_pos', { ascending: true })
  return data || []
}

// Oferta de la semana: producto EN OFERTA estable durante la semana (rota con
// la semana del año). Con on_sale siempre hay precio tachado + % real — el
// descuento sin referencia no convierte. Fallback: último producto (como antes).
export async function getWeekOffer() {
  const { data } = await supabase.from('products')
    .select(CARD_COLS)
    .eq('active', true).gt('stock', 0).eq('on_sale', true).not('sale_price', 'is', null)
    .order('id', { ascending: true }).limit(30)
  const pool = (data || []) as any[]
  if (!pool.length) return null
  const week = Math.floor(Date.now() / (7 * 86400000))
  return pool[week % pool.length]
}
