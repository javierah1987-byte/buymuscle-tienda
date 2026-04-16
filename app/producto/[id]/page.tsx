export const revalidate = 0

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartSection from '@/components/AddToCartSection'
import Link from 'next/link'

async function getProduct(id: string) {
  const { data } = await supabase.from('products').select('*, categories(name)').eq('id', id).single()
  return data
}

async function getVariants(productId: string) {
  const { data } = await supabase
    .from('product_variants')
    .select('id, stock, price_modifier, attribute_value_id, attribute_values(value, hex_color, position, attribute_types(name))')
    .eq('product_id', productId).eq('active', true)
  return data || []
}

async function getRelated(categoryId: number, excludeId: number) {
  const { data } = await supabase.from('products').select('*, categories(name)')
    .eq('category_id', categoryId).eq('active', true).neq('id', excludeId).limit(4)
  return data || []
}

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const [variants, related] = await Promise.all([
    getVariants(params.id),
    getRelated(product.category_id, product.id)
  ])

  const variantsByType: Record<string, {id:number; value:string; hex?:string; variantId:number; stock:number; priceModifier:number}[]> = {}
  for (const v of variants) {
    const av = v.attribute_values as any
    if (!av) continue
    const typeName = av.attribute_types?.name || 'Otro'
    if (!variantsByType[typeName]) variantsByType[typeName] = []
    if (!variantsByType[typeName].find((x: any) => x.value === av.value)) {
      variantsByType[typeName].push({
        id: av.position,
        value: av.value,
        hex: av.hex_color,
        variantId: v.id,
        stock: v.stock,
        priceModifier: v.price_modifier
      })
    }
  }

  const typeOrder = ['Sabor', 'Talla', 'Color']
  const sortedTypes = Object.keys(variantsByType).sort((a, b) => {
    const ai = typeOrder.indexOf(a); const bi = typeOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const hasVariants = sortedTypes.length > 0
  const catName = (product.categories as any)?.name || 'Suplemento'

  return (
    <div style={{background:'var(--bg)', minHeight:'100vh', paddingBottom:'4rem'}}>
      <div style={{background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'10px 0'}}>
        <div className="container" style={{display:'flex', gap:6, alignItems:'center', fontSize:12, color:'var(--muted)'}}>
          <Link href="/" style={{color:'var(--muted)'}}>Inicio</Link>
          <span>›</span>
          <Link href="/tienda" style={{color:'var(--muted)'}}>Tienda</Link>
          {catName && <>
            <span>›</span>
            <Link href={`/tienda?cat=${encodeURIComponent(catName)}`} style={{color:'var(--muted)'}}>{catName}</Link>
          </>}
          <span>›</span>
          <span style={{color:'var(--text)', fontWeight:600}}>{product.name.slice(0, 40)}{product.name.length > 40 ? '...' : ''}</span>
        </div>
      </div>

      <div className="container" style={{paddingTop:'2rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'start'}}>
          <div style={{background:'var(--surface)', border:'1px solid var(--border)', padding:'2rem', display:'flex', alignItems:'center', justifyContent:'center', minHeight:400}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url || 'https://placehold.co/500x500/f5f5f5/ccc?text=BuyMuscle'}
              alt={product.name}
              style={{maxWidth:'100%', maxHeight:420, objectFit:'contain'}}
            />
          </div>

          <div>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--red)', marginBottom:8}}>
              {catName}
            </div>
            <h1 style={{fontSize:'clamp(20px,3vw,28px)', fontWeight:900, textTransform:'uppercase', lineHeight:1.2, marginBottom:'1.5rem', color:'var(--text)'}}>
              {product.name}
            </h1>

            <div style={{marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:8}}>
              {product.stock > 0 ? (
                <>
                  <span style={{width:8, height:8, borderRadius:'50%', background:'#28a745', display:'inline-block'}}></span>
                  <span style={{fontSize:13, fontWeight:600, color:'#28a745'}}>En stock ({product.stock} uds)</span>
                </>
              ) : (
                <>
                  <span style={{width:8, height:8, borderRadius:'50%', background:'var(--red)', display:'inline-block'}}></span>
                  <span style={{fontSize:13, fontWeight:600, color:'var(--red)'}}>Sin stock</span>
                </>
              )}
            </div>

            <AddToCartSection
              product={product as any}
              variantsByType={variantsByType}
              sortedTypes={sortedTypes}
              hasVariants={hasVariants}
            />

            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'1.5rem'}}>
              {['🚚 Envío 24/48h', '🔒 Pago seguro', '🔄 Devoluciones'].map(b => (
                <span key={b} style={{background:'var(--bg)', border:'1px solid var(--border)', padding:'5px 12px', fontSize:12, fontWeight:600, color:'var(--muted)'}}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{marginTop:'4rem'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem'}}>
              <h2 className="section-title">PRODUCTOS <span>RELACIONADOS</span></h2>
              <Link href={`/tienda?cat=${encodeURIComponent(catName)}`} className="btn-outline" style={{fontSize:12, padding:'8px 18px'}}>Ver categoría →</Link>
            </div>
            <div className="products-grid">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
