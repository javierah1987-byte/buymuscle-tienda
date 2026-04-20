// @ts-nocheck
'use client'
import{useEffect,useState}from 'react'
import Link from 'next/link'
const S='https://awwlbepjxuoxaigztugh.supabase.co'
const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3d2xiZXBqeHVveGFpZ3p0dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzM5MDksImV4cCI6MjA5MTYwOTkwOX0.-80Bx1i8ZyGTHEhsO_cjMQMOt3B5OgEz3nXCNQ3ijCo'
const CAT_COLORS:any={nutricion:'#3b82f6',entrenamiento:'#f59e0b',recetas:'#22c55e',suplementacion:'#ff1e41',lifestyle:'#8b5cf6'}

export default function BlogPost({params}:any){
  const[post,setPost]=useState(null)
  const[loading,setLoading]=useState(true)
  const[related,setRelated]=useState([])

  useEffect(()=>{
    if(!params?.slug)return
    fetch(S+'/rest/v1/blog_posts?slug=eq.'+params.slug+'&published=eq.true',{headers:{'apikey':K,'Authorization':'Bearer '+K}})
      .then(r=>r.json()).then(d=>{
        const p=d?.[0]
        setPost(p||null);setLoading(false)
        if(p){
          fetch(S+'/rest/v1/blog_posts?published=eq.true&category=eq.'+p.category+'&slug=neq.'+params.slug+'&limit=3',{headers:{'apikey':K,'Authorization':'Bearer '+K}})
            .then(r=>r.json()).then(d=>setRelated(d||[]))
        }
      }).catch(()=>setLoading(false))
  },[params?.slug])

  const fmt=d=>new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'})

  if(loading) return <div style={{padding:'60px',textAlign:'center',fontFamily:'Arial,sans-serif',color:'#aaa'}}>Cargando...</div>
  if(!post) return(
    <div style={{padding:'60px',textAlign:'center',fontFamily:'Arial,sans-serif'}}>
      <div style={{fontSize:48,marginBottom:16}}>😕</div>
      <h2>Artículo no encontrado</h2>
      <Link href="/blog" style={{color:'#ff1e41',fontWeight:700}}>Volver al blog</Link>
    </div>
  )

  // Renderizar markdown básico
  function renderContent(text:string){
    return text.split('\n').map((line,i)=>{
      if(line.startsWith('# ')) return <h2 key={i} style={{fontSize:24,fontWeight:900,color:'#111',margin:'32px 0 12px',textTransform:'uppercase'}}>{line.slice(2)}</h2>
      if(line.startsWith('## ')) return <h3 key={i} style={{fontSize:18,fontWeight:700,color:'#111',margin:'24px 0 10px'}}>{line.slice(3)}</h3>
      if(line.startsWith('- ')) return <li key={i} style={{fontSize:15,color:'#444',lineHeight:1.8,marginBottom:4}}>{line.slice(2)}</li>
      if(line.startsWith('**')&&line.endsWith('**')) return <strong key={i} style={{display:'block',fontSize:15,color:'#111',margin:'12px 0 4px'}}>{line.slice(2,-2)}</strong>
      if(!line.trim()) return <br key={i}/>
      return <p key={i} style={{fontSize:15,color:'#444',lineHeight:1.8,margin:'0 0 16px'}}>{line}</p>
    })
  }

  return(
    <div style={{background:'white',fontFamily:'Arial,sans-serif'}}>
      {/* Portada */}
      {post.cover_image&&<div style={{width:'100%',height:320,overflow:'hidden',position:'relative'}}>
        <img src={post.cover_image} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7))'}}/>
      </div>}

      <div style={{maxWidth:760,margin:'0 auto',padding:'40px 20px'}}>
        {/* Breadcrumb */}
        <div style={{fontSize:13,color:'#aaa',marginBottom:20}}>
          <Link href="/" style={{color:'#aaa',textDecoration:'none'}}>Inicio</Link>
          {' / '}
          <Link href="/blog" style={{color:'#aaa',textDecoration:'none'}}>Blog</Link>
          {' / '}
          <span style={{color:'#333'}}>{post.title}</span>
        </div>

        {/* Categoría */}
        <div style={{marginBottom:16}}>
          <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:CAT_COLORS[post.category]||'#888',background:(CAT_COLORS[post.category]||'#888')+'15',padding:'3px 10px',border:'1px solid '+(CAT_COLORS[post.category]||'#888')+'40'}}>
            {post.category}
          </span>
        </div>

        {/* Título */}
        <h1 style={{fontSize:30,fontWeight:900,color:'#111',margin:'0 0 16px',lineHeight:1.2}}>{post.title}</h1>

        {/* Meta */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32,paddingBottom:24,borderBottom:'2px solid #f0f0f0'}}>
          <span style={{fontSize:13,color:'#aaa'}}>{post.published_at?fmt(post.published_at):''}</span>
          {(post.tags||[]).map((t:string)=>(
            <span key={t} style={{fontSize:12,background:'#f5f5f5',padding:'2px 10px',color:'#666'}}>{t}</span>
          ))}
        </div>

        {/* Contenido */}
        {post.excerpt&&<p style={{fontSize:16,color:'#555',lineHeight:1.7,margin:'0 0 24px',fontWeight:600,borderLeft:'3px solid #ff1e41',paddingLeft:16}}>{post.excerpt}</p>}

        <div>{post.content?renderContent(post.content):<p style={{color:'#aaa'}}>Sin contenido todavía.</p>}</div>

        {/* Tags */}
        {(post.tags||[]).length>0&&<div style={{marginTop:32,paddingTop:20,borderTop:'1px solid #f0f0f0',display:'flex',gap:8,flexWrap:'wrap'}}>
          {post.tags.map((t:string)=>(
            <span key={t} style={{fontSize:13,background:'#f5f5f5',padding:'4px 12px',color:'#555'}}>#{t}</span>
          ))}
        </div>}

        {/* Back */}
        <div style={{marginTop:40,paddingTop:24,borderTop:'1px solid #f0f0f0',textAlign:'center'}}>
          <Link href="/blog" style={{display:'inline-block',background:'#111',color:'white',padding:'10px 24px',textDecoration:'none',fontWeight:700,fontSize:13,textTransform:'uppercase'}}>
            ← Volver al blog
          </Link>
        </div>
      </div>

      {/* Artículos relacionados */}
      {related.length>0&&<div style={{background:'#f8f8f8',padding:'40px 20px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h3 style={{fontSize:16,fontWeight:800,textTransform:'uppercase',color:'#111',margin:'0 0 20px',paddingBottom:8,borderBottom:'2px solid #ff1e41',display:'inline-block'}}>También te puede interesar</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {related.map(p=>(
              <Link key={p.id} href={'/blog/'+p.slug} style={{textDecoration:'none',background:'white',border:'1px solid #e8e8e8',padding:16,display:'block'}}>
                {p.cover_image&&<img src={p.cover_image} alt={p.title} style={{width:'100%',height:100,objectFit:'cover',marginBottom:12}}/>}
                <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:6}}>{p.title}</div>
                <div style={{fontSize:12,color:'#ff1e41',fontWeight:700}}>Leer →</div>
              </Link>
            ))}
          </div>
        </div>
      </div>}
    </div>
  )
    }
