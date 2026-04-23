// @ts-nocheck
import Link from 'next/link'
import{createClient}from'@supabase/supabase-js'
export const revalidate=3600
const sb=createClient('https://awwlbepjxuoxaigztugh.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo')
export const metadata={title:'Blog | BUYMUSCLE',description:'Articulos sobre nutricion deportiva, suplementacion y entrenamiento.'}
export default async function BlogPage(){
  const{data:posts}=await sb.from('blog_posts').select('id,slug,title,excerpt,cover_image,category,published_at').eq('published',true).order('published_at',{ascending:false})
  const articulos=posts||[]
  return(
    <div style={{background:'#f8f8f8',minHeight:'100vh'}}>
      <div style={{background:'#111',padding:'40px 20px',textAlign:'center'}}>
        <h1 style={{color:'white',fontSize:28,fontWeight:900,textTransform:'uppercase',margin:'0 0 8px'}}>Blog <span style={{color:'#ff1e41'}}>BuyMuscle</span></h1>
        <p style={{color:'#888',fontSize:14,margin:0}}>Nutricion, suplementacion y entrenamiento para tus objetivos</p>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 20px'}}>
        {articulos.length===0?(
          <div style={{textAlign:'center',padding:'60px',color:'#888'}}>Proximamente nuevos articulos</div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24}}>
            {articulos.map(a=>(
              <article key={a.id} style={{background:'white',borderRadius:4,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                <Link href={'/blog/'+(a.slug||a.id)} style={{textDecoration:'none',color:'inherit',display:'block'}}>
                  <div style={{position:'relative',paddingTop:'56.25%',background:'#f0f0f0',overflow:'hidden'}}>
                    {a.cover_image&&<img src={a.cover_image} alt={a.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>}
                    {a.category&&<div style={{position:'absolute',top:10,left:10,background:'#ff1e41',color:'white',fontSize:10,fontWeight:700,padding:'3px 8px',textTransform:'uppercase'}}>{a.category}</div>}
                  </div>
                  <div style={{padding:16}}>
                    <h2 style={{fontSize:15,fontWeight:700,color:'#111',margin:'0 0 8px',lineHeight:1.4}}>{a.title}</h2>
                    {a.excerpt&&<p style={{fontSize:13,color:'#777',margin:'0 0 12px',lineHeight:1.6,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{a.excerpt}</p>}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:11,color:'#aaa'}}>{a.published_at?new Date(a.published_at).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}):''}</span>
                      <span style={{fontSize:12,color:'#ff1e41',fontWeight:700}}>Leer mas &rsaquo;</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
