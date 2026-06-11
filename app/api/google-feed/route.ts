// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'

// Feed de productos para Google Merchant Center (pestaña Shopping, gratis).
// Formato RSS 2.0 con namespace g:. Darlo de alta en Merchant Center como
// "feed programado" apuntando a {SITE_URL}/api/google-feed
export const revalidate = 3600 // se regenera como mucho cada hora

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

// Descripción en texto plano (las fichas guardan HTML)
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4900)

export async function GET() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: products, error } = await db.from('products')
    .select('id,name,brand,description,price_incl_tax,sale_price,on_sale,image_url,stock')
    .eq('active', true)
    .not('image_url', 'is', null) // Merchant rechaza items sin imagen
    .order('id')

  if (error) return new Response('feed error', { status: 500 })

  const items = (products || []).map(p => {
    const price = Number(p.price_incl_tax).toFixed(2)
    const sale = p.on_sale && p.sale_price ? Number(p.sale_price).toFixed(2) : null
    return `<item>
<g:id>${p.id}</g:id>
<g:title>${esc(p.name)}</g:title>
<g:description>${esc(plain(p.description) || p.name)}</g:description>
<g:link>${SITE_URL}/producto/${p.id}</g:link>
<g:image_link>${esc(p.image_url)}</g:image_link>
<g:availability>${Number(p.stock) > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
<g:price>${price} EUR</g:price>${sale ? `
<g:sale_price>${sale} EUR</g:sale_price>` : ''}
<g:brand>${esc(p.brand || 'BuyMuscle')}</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>false</g:identifier_exists>
</item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>BuyMuscle — Suplementación deportiva</title>
<link>${SITE_URL}</link>
<description>Catálogo de productos BuyMuscle</description>
${items}
</channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
