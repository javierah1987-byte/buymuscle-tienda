import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<NextResponse> {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const KEY = process.env.HOLDED_API_KEY
  if (!KEY) return NextResponse.json({ error: 'no key' }, { status: 400 })
  const r = await fetch('https://api.holded.com/api/invoicing/v1/numberseries', { headers: { key: KEY } })
  const text = await r.text()
  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ raw: text.slice(0, 200) })
  }
}
