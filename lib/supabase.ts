import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: number
  name: string
  reference: string | null
  category_id: number | null
  price_excl_tax: number
  price_incl_tax: number
  stock: number
  active: boolean
  image_url: string | null
  categories?: { name: string }
}

export type Category = {
  id: number
  name: string
  slug: string
}

export type DistributorLevel = {
  id: number
  name: string
  discount_pct: number
  min_order_amount: number
}
