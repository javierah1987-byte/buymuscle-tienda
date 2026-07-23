// Queries compartidas de la home. Solo lecturas; misma fuente canónica de
// columnas que las tarjetas.
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

// ── Queries del clon fiel de la home PrestaShop ──

// Novedades: primero los marcados is_new, completando con los últimos altas
// hasta el límite (el carrusel del PrestaShop muestra ~10 novedades).
export async function getNovedadesClon(limit = 10) {
  const { data: nuevos } = await supabase.from('products').select(CARD_COLS)
    .eq('active', true).gt('stock', 0).eq('is_new', true)
    .order('id', { ascending: false }).limit(limit)
  let out = (nuevos || []) as any[]
  if (out.length < limit) {
    let q = supabase.from('products').select(CARD_COLS)
      .eq('active', true).gt('stock', 0)
      .order('id', { ascending: false }).limit(limit - out.length)
    const ids = out.map(p => p.id)
    if (ids.length) q = q.not('id', 'in', '(' + ids.join(',') + ')')
    const { data: extra } = await q
    out = out.concat((extra || []) as any[])
  }
  return out
}

// Productos por lista de categorías (sportswear = varias categorías de ropa;
// proteínas = las familias de proteína). IDs verificados contra la BD.
export async function getByCategoryIds(catIds: number[], limit = 12) {
  const { data } = await supabase.from('products').select(CARD_COLS)
    .eq('active', true).gt('stock', 0).in('category_id', catIds)
    .order('id', { ascending: false }).limit(limit)
  return (data || []) as any[]
}
