export const dynamic='force-dynamic'
const BASE='https://buymuscle-tienda.vercel.app'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const STATIC=['','/tienda','/sobre-nosotros','/faq','/envios','/devoluciones','/privacidad','/aviso-legal','/cookies']
export async function GET(){
  const today=new Date().toISOString().split('T')[0]
  let products=[]
  try{const r=await fetch(S+'/rest/v1/products?select=id,updated_at&active=eq.true&limit=500',{headers:{'apikey':K,'Authorization':'Bearer '+K}});products=await r.json()}catch(e){}
  const urls=[
    ...STATIC.map(u=>`  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod><changefreq>${u===''||u==='/tienda'?'daily':'monthly'}</changefreq><priority>${u===''?'1.0':u==='/tienda'?'0.9':'0.6'}</priority></url>`),
    ...(products||[]).map(p=>`  <url><loc>${BASE}/producto/${p.id}</loc><lastmod>${(p.updated_at||today).split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  ]
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`,{headers:{'Content-Type':'application/xml','Cache-Control':'public, max-age=3600'}})
}
