// @ts-nocheck
import{NextResponse}from 'next/server'
export async function GET(){
  const KEY=process.env.HOLDED_API_KEY
  if(!KEY)return NextResponse.json({error:'No HOLDED_API_KEY'},{status:400})
  const r=await fetch('https://api.holded.com/api/invoicing/v1/numberseries',{headers:{key:KEY}})
  const d=await r.json()
  return NextResponse.json(d)
}
