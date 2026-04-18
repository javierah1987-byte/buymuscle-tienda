export async function GET(request){
  try{
    const KEY=process.env.HOLDED_API_KEY
    if(!KEY)return Response.json({error:'no key'},{status:400})
    const r=await fetch('https://api.holded.com/api/invoicing/v1/numberseries',{headers:{key:KEY}})
    const d=await r.json()
    return Response.json(d)
  }catch(e){return Response.json({error:e.message},{status:500})}
}
