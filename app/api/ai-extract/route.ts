// @ts-nocheck
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// POST /api/ai-extract  { b64, mediaType, textContent }
// Extrae productos+cantidades de una factura/albarán con Claude.
// La API key (ANTHROPIC_API_KEY) vive SOLO en servidor. Solo admin.
export async function POST(req){
  try{
    const admin = await getAdminUser()
    if(!admin) return NextResponse.json({ ok:false, error:'no_autorizado' }, { status:401 })

    const key = process.env.ANTHROPIC_API_KEY
    if(!key) return NextResponse.json({ ok:false, error:'No ANTHROPIC_API_KEY' }, { status:500 })

    const { b64, mediaType, textContent } = await req.json()
    const content = b64
      ? [{ type:'image', source:{ type:'base64', media_type:mediaType, data:b64 } },
         { type:'text', text:'Eres asistente de una tienda de suplementación deportiva en España. Analiza esta factura y extrae productos con cantidades. Devuelve SOLO JSON válido: {"productos":[{"nombre":"nombre","cantidad":50}]}' }]
      : [{ type:'text', text:'Extrae productos y cantidades de este albarán. Devuelve SOLO JSON: {"productos":[{"nombre":"nombre","cantidad":50}]}\n\n' + (textContent||'') }]

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'x-api-key':key, 'anthropic-version':'2023-06-01', 'Content-Type':'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{ role:'user', content }] }),
    })
    const data = await resp.json()
    if(!resp.ok) return NextResponse.json({ ok:false, error: data?.error?.message || 'anthropic_error' }, { status:502 })

    const text = data.content?.[0]?.text || '{}'
    let productos = []
    try { productos = JSON.parse(text.replace(/```json|```/g,'').trim()).productos || [] } catch {}
    return NextResponse.json({ ok:true, productos })
  }catch(e){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 })
  }
}
