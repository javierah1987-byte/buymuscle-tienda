// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// GET /api/my-orders?email=<email>
// Devuelve los pedidos de un email (con sus líneas). Mantiene la UX actual de
// "consultar mis pedidos por email" sin exponer toda la tabla a la anon key.
export async function GET(req){
  try{
    if(!SERVICE_KEY) return NextResponse.json({ ok:false, error:'server_misconfigured' }, { status:500 })
    const { searchParams } = new URL(req.url)
    const email = (searchParams.get('email') || '').trim().toLowerCase()
    if(!email || !email.includes('@'))
      return NextResponse.json({ ok:false, error:'invalid_email' }, { status:400 })

    const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })

    const { data: orders } = await db.from('orders')
      .select('*, order_lines(*)')
      .eq('customer_email', email)
      .order('created_at', { ascending:false })
      .limit(50)

    return NextResponse.json({ ok:true, orders: orders || [] })
  }catch(e){
    console.error('my-orders error:', e)
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status:500 })
  }
}
