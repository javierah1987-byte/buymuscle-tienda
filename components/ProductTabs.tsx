// @ts-nocheck
'use client'
import { useState } from 'react'
import ProductReviews from '@/components/ProductReviews'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

export default function ProductTabs({ description, reviews, productId }) {
  const [tab, setTab] = useState('desc')

  const tabs = [
    { id: 'desc', label: 'Descripción' },
    { id: 'nutri', label: 'Valores nutricionales' },
    { id: 'uso', label: 'Modo de uso' },
    { id: 'reviews', label: 'Reseñas' },
  ]

  const ST = {
    wrap: { background: 'white', marginBottom: 24, borderRadius: 4, overflow: 'hidden', border: '1px solid #e8e8e8' },
    tabBar: { display: 'flex', borderBottom: '2px solid #f0f0f0', background: 'white', overflowX: 'auto', scrollbarWidth: 'none' },
    tab: (active) => ({
      padding: '14px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
      border: 'none', background: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
      color: active ? '#ff1e41' : '#888',
      borderBottom: active ? '2px solid #ff1e41' : '2px solid transparent',
      marginBottom: -2, transition: 'color 0.15s',
    }),
    body: { padding: '24px', fontSize: 14, color: '#444', lineHeight: 1.8 },
  }

  return (
    <div style={ST.wrap}>
      <div style={ST.tabBar}>
        {tabs.map(function(t) {
          return (
            <button key={t.id} style={ST.tab(tab === t.id)} onClick={function(){ setTab(t.id) }}>
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={ST.body}>
        {tab === 'desc' && (
          description
            ? <div dangerouslySetInnerHTML={{__html: sanitizeHtml(description)}} />
            : <div style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Sin descripción disponible todavía.<br/>
                <span style={{ fontSize: 12 }}>Puedes añadirla desde el panel de administración.</span>
              </div>
        )}

        {tab === 'nutri' && (
          <div style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
            Tabla nutricional no disponible para este producto.<br/>
            <span style={{ fontSize: 12 }}>Puedes añadirla desde el panel de administración.</span>
          </div>
        )}

        {tab === 'uso' && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12 }}>Modo de empleo recomendado</h3>
            <p>Toma 1-2 servicios al día según tus objetivos. Para mejores resultados:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Mezcla con 200-300ml de agua o leche</li>
              <li style={{ marginBottom: 6 }}>Toma preferiblemente post-entrenamiento</li>
              <li style={{ marginBottom: 6 }}>Complementa con una dieta equilibrada y ejercicio regular</li>
            </ul>
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff8f8', border: '1px solid #ffe0e0', borderRadius: 4, fontSize: 12, color: '#888' }}>
              ⚠️ Complemento alimenticio. No sustituye a una dieta variada y equilibrada.
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <ProductReviews productId={productId} initialReviews={reviews} />
        )}
      </div>
    </div>
  )
}
