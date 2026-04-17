import type { Metadata } from 'next'
export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: p } = await supabase.from('products').select('name, short_description, image_url, brand').eq('id', params.id).single()
  if (!p) return { title: 'Producto | BUYMUSCLE' }
  return {
    title: p.name,
    description: p.short_description || ('Compra ' + p.name + ' en BuyMuscle. Envio rapido a Canarias.'),
    openGraph: {
      title: p.name + ' | BUYMUSCLE',
      description: p.short_description || '',
      images: p.image_url ? [{ url: p.image_url }] : [],
    },
  }
}import { supabase } from '@/lib/supabase'import { notFound } from 'next/navigation'import ProductCard from '@/components/ProductCard'import AddToCartSection from '@/components/AddToCartSection'import Link from 'next/link'async function getProduct(id: string) {  const { data } = await supabase    .from('products').select('*, categories(id, name)')    .eq('id', parseInt(id)).single()  return data}async function getVariants(productId: number) {  const { data } = await supabase    .from('product_variants')    .select('*, attribute_values(value, hex_color, attribute_types(name))')    .eq('product_id', productId).eq('active', true).gt('stock', 0)  return data || []}async function getRelated(categoryId: number, excludeId: number) {  const { data } = await supabase    .from('products').select('*, categories(name)')    .eq('category_id', categoryId).neq('id', excludeId)    .eq('active', true).gt('stock', 0).limit(4)  return data || []}export default async function ProductoPage({ params }: { params: { id: string } }) {  const product = await getProduct(params.id)  if (!product) return notFound()  const variants = await getVariants(product.id)  const related = await getRelated(product.category_id, product.id)  const variantsByType: Record<string, any[]> = {}
