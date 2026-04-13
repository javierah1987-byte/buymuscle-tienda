'use client'
import{useEffect,useState,useCallback,useRef}from 'react'
import{supabase}from '@/lib/supabase'

type Product={id:number;name:string;price_incl_tax:number;price_excl_tax:number;stock:number;image_url:string|null;categories?:{name:string}}
type LineItem={product:Product;qty:number;unitPrice:number}
type ClientType='particular'|'bronze'|'silver'|'gold'
const DISCOUNTS:Record<ClientType,number>={particular:0,bronze:10,silver:15,gold:20}
const CLIENT_LABELS:Record<ClientType,string>={particular:'Particular',bronze:'Bronze (-10%)',silver:'Silver (-15%)',gold:'Gold (-20%)'}
const CLIENT_COLORS:Record<ClientType,string>={particular:'var(--green)',bronze:'#cd7f32',silver:'#c0c0c0',gold:'#ffd700'}

export default function TPVPage(){
  const[products,setProducts]=useState<Product[]>([])
  const[filtered,setFiltered]=useState<Product[]>([])
  const[search,setSearch]=useState('')
  const[lines,setLines]=useState<LineItem[]>([])
  const[clientType,setClientType]=useState<ClientType>('particular')
  const[showPay,setShowPay]=useState(false)
  const[payMethod,setPayMethod]=useState<'cash'|'card'>('card')
  const[cashInput,setCashInput]=useState('')
  const[saleOk,setSaleOk]=useState(false)
  const[loading,setLoading]=useState(true)
  const[saving,setSaving]=useState(false)
  const searchRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{
    supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('name').limit(500)
      .then(({data})=>{setProducts(data||[]);setFiltered(data||[]);setLoading(false)})
  },[])

  useEffect(()=>{
    if(!search.trim()){setFiltered(products);return}
    const q=search.toLowerCase()
    setFiltered(products.filter(p=>p.name.toLowerCase().includes(q)||(p.categories as any)?.name?.toLowerCase().includes(q)))
  },[search,products])

  const addLine=(p:Product)=>{
    const disc=DISCOUNTS[clientType]
    const price=p.price_incl_tax*(1-disc/100)
    setLines(prev=>{
      const ex=prev.find(l=>l.product.id===p.id)
      if(ex)return prev.map(l=>l.product.id===p.id?{...l,qty:Math.min(l.qty+1,p.stock)}:l)
      return[...prev,{product:p,qty:1,unitPrice:price}]
    })
    if(searchRef.current)searchRef.current.focus()
  }

  const updateQty=(id:number,qty:number)=>{
    if(qty<=0){setLines(p=>p.filter(l=>l.product.id!==id));return}
    const prod=lines.find(l=>l.product.id===id)?.product
    if(prod)setLines(p=>p.map(l=>l.product.id===id?{...l,qty:Math.min(qty,prod.stock)}:l))
  }

  // Recalculate prices when client type changes
  useEffect(()=>{
    const disc=DISCOUNTS[clientType]
    setLines(prev=>prev.map(l=>({...l,unitPrice:l.product.price_incl_tax*(1-disc/100)})))
  },[clientType])

  const subtotal=lines.reduce((s,l)=>s+l.unitPrice*l.qty,0)
  const iva=subtotal*0.21/1.21
  const base=subtotal-iva
  const change=cashInput?Math.max(0,parseFloat(cashInput)||0-subtotal):0

  const confirmSale=useCallback(async()=>{
    if(lines.length===0)return
    setSaving(true)
    // Update stock for each line
    for(const line of lines){
      await supabase.from('products').update({stock:line.product.stock-line.qty}).eq('id',line.product.id)
    }
    // Record TPV session
    await supabase.from('tpv_sessions').insert({
      client_type:clientType,
      discount_pct:DISCOUNTS[clientType],
      total_incl_tax:subtotal,
      payment_method:payMethod,
      lines_json:JSON.stringify(lines.map(l=>({id:l.product.id,name:l.product.name,qty:l.qty,price:l.unitPrice})))
    })
    setSaving(false)
    setSaleOk(true)
    setTimeout(()=>{
      setLines([]);setShowPay(false);setSaleOk(false);setCashInput('');setPayMethod('card')
      // Refresh stock
      supabase.from('products').select('*, categories(name)').eq('active',true).gt('stock',0).order('name').limit(500)
        .then(({data})=>{setProducts(data||[]);setFiltered(data||[])})
    },2500)
  },[lines,clientType,subtotal,payMethod])

  return(
    <div style={{height:'calc(100vh - 64px)',display:'grid',gridTemplateColumns:'1fr 380px',background:'var(--black)',overflow:'hidden'}}>
      {/* LEFT: Catálogo */}
      <div style={{display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid var(--border)'}}>
        {/* Header */}
        <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--border)',background:'var(--dark)',display:'flex',gap:'1rem',alignItems:'center',flexShrink:0}}>
          <div style={{flex:1}}>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar producto por nombre o categoría..."
              style={{margin:0,background:'var(--surface)'}}
              autoFocus/>
          </div>
          <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--muted)',whiteSpace:'nowrap'}}>
            {filtered.length} productos
          </div>
        </div>
        {/* Product grid */}
        <div style={{flex:1,overflowY:'auto',padding:'1rem 1.5rem'}}>
          {loading?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'0.75rem'}}>
              {Array.from({length:20}).map((_,i)=><div key={i} className="skeleton" style={{height:180,borderRadius:8}}/>)}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'0.75rem'}}>
              {filtered.map(p=>(
                <button key={p.id} onClick={()=>addLine(p)}
                  style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.75rem',cursor:'pointer',textAlign:'left',transition:'all 0.15s',display:'flex',flexDirection:'column',gap:6}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--green)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                  <img src={p.image_url||'https://placehold.co/150x150/1a1a1a/888?text=BM'} alt={p.name}
                    style={{width:'100%',aspectRatio:'1',objectFit:'contain',borderRadius:4,background:'var(--dark)'}}
                    onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/150x150/1a1a1a/888?text=BM'}}/>
                  <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,textTransform:'uppercase',lineHeight:1.2,color:'var(--white)'}}>
                    {p.name.length>35?p.name.slice(0,35)+'...':p.name}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto'}}>
                    <span style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:900,color:'var(--green)'}}>
                      {(p.price_incl_tax*(1-DISCOUNTS[clientType]/100)).toFixed(2)} euro
                    </span>
                    <span style={{fontSize:11,color:p.stock<5?'var(--red)':'var(--muted)'}}>
                      {p.stock} ud
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Ticket */}
      <div style={{display:'flex',flexDirection:'column',overflow:'hidden',background:'var(--dark)'}}>
        {/* Cliente */}
        <div style={{padding:'1rem',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'0.5rem'}}>Tipo de cliente</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {(Object.keys(DISCOUNTS) as ClientType[]).map(t=>(
              <button key={t} onClick={()=>setClientType(t)}
                style={{padding:'8px 10px',borderRadius:6,border:`2px solid ${clientType===t?CLIENT_COLORS[t]:'var(--border)'}`,
                  background:clientType===t?`${CLIENT_COLORS[t]}15`:'transparent',
                  color:clientType===t?CLIENT_COLORS[t]:'var(--muted)',
                  fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
                {CLIENT_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Lines */}
        <div style={{flex:1,overflowY:'auto',padding:'0.75rem 1rem'}}>
          {lines.length===0?(
            <div style={{textAlign:'center',padding:'3rem 1rem',color:'var(--muted)'}}>
              <div style={{fontSize:48,marginBottom:'0.75rem'}}>🛒</div>
              <p style={{fontFamily:'var(--font-display)',fontSize:16,textTransform:'uppercase'}}>Ticket vacío</p>
              <p style={{fontSize:13,marginTop:4}}>Haz click en un producto para añadirlo</p>
            </div>
          ):(
            lines.map(l=>(
              <div key={l.product.id} style={{display:'flex',gap:'0.75rem',alignItems:'center',paddingBottom:'0.75rem',marginBottom:'0.75rem',borderBottom:'1px solid var(--border)'}}>
                <img src={l.product.image_url||'https://placehold.co/48x48/1a1a1a/888?text=BM'} alt=""
                  style={{width:48,height:48,objectFit:'contain',background:'var(--surface)',borderRadius:4,flexShrink:0}}
                  onError={e=>{(e.target as HTMLImageElement).src='https://placehold.co/48x48/1a1a1a/888?text=BM'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,textTransform:'uppercase',lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {l.product.name}
                  </div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{l.unitPrice.toFixed(2)} euro/ud</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                  <button onClick={()=>updateQty(l.product.id,l.qty-1)}
                    style={{width:26,height:26,borderRadius:4,border:'1px solid var(--border)',background:'none',color:'var(--white)',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--green)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>−</button>
                  <span style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,minWidth:24,textAlign:'center'}}>{l.qty}</span>
                  <button onClick={()=>updateQty(l.product.id,l.qty+1)}
                    style={{width:26,height:26,borderRadius:4,border:'1px solid var(--border)',background:'none',color:'var(--white)',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--green)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>+</button>
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:900,color:'var(--green)',minWidth:60,textAlign:'right',flexShrink:0}}>
                  {(l.unitPrice*l.qty).toFixed(2)} euro
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + Pay */}
        {lines.length>0&&(
          <div style={{padding:'1rem',borderTop:'1px solid var(--border)',flexShrink:0,background:'var(--surface)'}}>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--muted)'}}>
                <span>Base imponible</span><span>{base.toFixed(2)} euro</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--muted)'}}>
                <span>IVA (21%)</span><span>{iva.toFixed(2)} euro</span>
              </div>
              {DISCOUNTS[clientType]>0&&(
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:CLIENT_COLORS[clientType]}}>
                  <span>Dto. {CLIENT_LABELS[clientType]}</span><span>-{DISCOUNTS[clientType]}%</span>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--border)'}}>
                <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,textTransform:'uppercase'}}>TOTAL</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,color:'var(--green)'}}>{subtotal.toFixed(2)} euro</span>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setLines([])}}
                style={{flex:1,padding:'12px',borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--muted)',fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,textTransform:'uppercase',cursor:'pointer',transition:'all 0.15s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--red)';(e.currentTarget as HTMLElement).style.color='var(--red)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.color='var(--muted)'}}>
                Cancelar
              </button>
              <button onClick={()=>setShowPay(true)} className="btn-primary" style={{flex:2,padding:'12px',fontSize:'16px',justifyContent:'center'}}>
                Cobrar {subtotal.toFixed(2)} euro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPay&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:'var(--dark)',border:'1px solid var(--border)',borderRadius:12,padding:'2rem',width:'100%',maxWidth:420}}>
            {saleOk?(
              <div style={{textAlign:'center',padding:'2rem 0'}}>
                <div style={{fontSize:64,marginBottom:'1rem'}}>✅</div>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:32,fontWeight:900,textTransform:'uppercase',color:'var(--green)',marginBottom:'0.5rem'}}>Venta completada</h2>
                <p style={{color:'var(--muted)'}}>Stock actualizado · Ticket registrado</p>
              </div>
            ):(
              <>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:900,textTransform:'uppercase',marginBottom:'1.5rem'}}>COBRAR <span style={{color:'var(--green)'}}>{subtotal.toFixed(2)} euro</span></h2>
                {/* Method */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1.5rem'}}>
                  {(['card','cash'] as const).map(m=>(
                    <button key={m} onClick={()=>setPayMethod(m)}
                      style={{padding:'14px',borderRadius:8,border:`2px solid ${payMethod===m?'var(--green)':'var(--border)'}`,
                        background:payMethod===m?'rgba(0,230,118,0.1)':'transparent',
                        color:payMethod===m?'var(--green)':'var(--muted)',
                        fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
                      {m==='card'?'💳 Tarjeta':'💵 Efectivo'}
                    </button>
                  ))}
                </div>
                {payMethod==='cash'&&(
                  <div style={{marginBottom:'1.5rem'}}>
                    <label style={{marginBottom:8}}>Efectivo entregado</label>
                    <input value={cashInput} onChange={e=>setCashInput(e.target.value)} type="number" step="0.01" placeholder="0.00"
                      style={{marginBottom:8,fontSize:24,fontFamily:'var(--font-display)',fontWeight:900,textAlign:'right'}}
                      autoFocus/>
                    {cashInput&&parseFloat(cashInput)>=subtotal&&(
                      <div style={{background:'rgba(0,230,118,0.1)',border:'1px solid rgba(0,230,118,0.3)',borderRadius:8,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,textTransform:'uppercase'}}>Cambio</span>
                        <span style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,color:'var(--green)'}}>{change.toFixed(2)} euro</span>
                      </div>
                    )}
                    {cashInput&&parseFloat(cashInput)<subtotal&&(
                      <div style={{background:'rgba(255,61,61,0.1)',border:'1px solid rgba(255,61,61,0.3)',borderRadius:8,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,color:'var(--red)'}}>Faltan</span>
                        <span style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:900,color:'var(--red)'}}>{(subtotal-parseFloat(cashInput)).toFixed(2)} euro</span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setShowPay(false);setCashInput('')}}
                    style={{flex:1,padding:'14px',borderRadius:8,border:'1px solid var(--border)',background:'none',color:'var(--muted)',fontFamily:'var(--font-display)',fontSize:15,fontWeight:700,textTransform:'uppercase',cursor:'pointer'}}>
                    Cancelar
                  </button>
                  <button onClick={confirmSale} className="btn-primary"
                    disabled={saving||(payMethod==='cash'&&(!cashInput||parseFloat(cashInput)<subtotal))}
                    style={{flex:2,padding:'14px',fontSize:'17px',justifyContent:'center'}}>
                    {saving?'Procesando...':'Confirmar venta'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
      }
