import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'

const BASE = 'https://buymuscle-tienda.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createClient(S, K)
  
  // Páginas estáticas
  const staticPages = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: BASE + '/tienda', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: BASE + '/carrito', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: BASE + '/blog', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: BASE + '/sport-wear', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: BASE + '/veganos', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: BASE + '/distribuidores', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: BASE + '/sobre-nosotros', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: BASE + '/politica-privacidad', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: BASE + '/politica-cookies', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: BASE + '/aviso-legal', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: BASE + '/politica-envios', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: BASE + '/devoluciones', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: BASE + '/faq', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // Productos activos
  const { data: products } = await db.from('products')
    .select('id, updated_at')
    .eq('active', true)
    .gt('stock', 0)
    .order('id', { ascending: false })
    .limit(500)

  const productPages = (products || []).map(p => ({
    url: `${BASE}/producto/${p.id}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Blog posts
  const { data: posts } = await db.from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(100)

  const blogPages = (posts || []).map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
