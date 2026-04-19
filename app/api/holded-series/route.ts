import { NextResponse } from 'next/server'

export async function GET(request: Request): Promise<NextResponse> {
  const KEY = process.env.HOLDED_API_KEY
  if (!KEY) return NextResponse.json({ error: 'no key' }, { status: 400 })
  const r = await fetch('https://api.holded.com/api/invoicing/v1/numberseries', { headers: { key: KEY } })
  const d = await r.json()
  return NextResponse.json(d)
}
