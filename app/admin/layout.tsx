// @ts-nocheck
export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#111', color: 'white' }}>
      {/* Barra de navegación global del admin — presente en TODAS las páginas del panel.
          Deja volver siempre a la tienda y al panel principal. */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#111', borderBottom: '1px solid #2a2a2a',
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '10px 20px', fontSize: 13,
      }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver a la tienda
        </a>
        <a href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 600 }}>
          🏠 Panel principal
        </a>
      </div>
      {children}
    </div>
  )
}
