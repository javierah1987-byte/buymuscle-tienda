// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function MisFacturas() {
  const { user, levelName, loading: authLoading } = useAuth()
  const [invoices, setInvoices] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading || !user?.email) return
    setLoading(true)
    // Últimos 12 meses. RLS de orders acota a los pedidos del propio email.
    const since = new Date(); since.setMonth(since.getMonth() - 12)
    supabase.from('orders')
      .select('order_number,created_at,total,holded_series,holded_invoice_id')
      .eq('customer_email', user.email.toLowerCase())
      .not('holded_invoice_id', 'is', null)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => { setInvoices(data || []); setLoading(false) })
  }, [user, authLoading])

  const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ background: '#f8f8f8', minHeight: '60vh', fontFamily: 'Arial,sans-serif' }}>
      <div style={{ background: '#111', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', textTransform: 'uppercase' }}>Mis Facturas</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>
          Descarga tus facturas del último año{levelName ? ` · Nivel ${levelName}` : ''}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        {authLoading ? <Box>Cargando…</Box>
        : !user ? <Box>
            Necesitas iniciar sesión para ver tus facturas.{' '}
            <Link href="/distribuidores/login" style={{ color: '#ff1e41', fontWeight: 700 }}>Acceder al portal →</Link>
          </Box>
        : loading || invoices === null ? <Box>Cargando facturas…</Box>
        : invoices.length === 0 ? <Box>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            Todavía no hay facturas disponibles en los últimos 12 meses.
          </Box>
        : <div style={{ background: 'white', border: '1px solid #e8e8e8' }}>
            {invoices.map((inv, i) => (
              <div key={inv.order_number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < invoices.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                    Factura · {inv.order_number}
                    {inv.holded_series && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>({inv.holded_series})</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{fmt(inv.created_at)} · {Number(inv.total || 0).toFixed(2)} €</div>
                </div>
                <a href={`/api/order-invoice?n=${encodeURIComponent(inv.order_number)}`} target="_blank" rel="noopener"
                  style={{ background: '#ff1e41', color: 'white', padding: '9px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                  ⬇ Descargar PDF
                </a>
              </div>
            ))}
          </div>}
      </div>
    </div>
  )
}

function Box({ children }) {
  return <div style={{ background: 'white', padding: 28, border: '1px solid #e8e8e8', textAlign: 'center', color: '#666', fontSize: 14 }}>{children}</div>
}
