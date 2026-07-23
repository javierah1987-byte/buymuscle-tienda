import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── QUÉ PROTEGE QUÉ (mapa único; leer antes de tocar el matcher) ─────────────
//
// /admin/*            → AQUÍ. Sesión Supabase (cookie) + allowlist vía is_admin().
//                       Funciona porque /login usa createBrowserClient de
//                       @supabase/ssr, que guarda la sesión en COOKIE y por eso el
//                       middleware la ve.
//
// /tpv                → PIN, no sesión. Cookie httpOnly `bm_tpv` derivada del hash
//                       del PIN (lib/tpvAuth), 12 h, con límite de intentos y
//                       FAIL-CLOSED si no hay PIN configurado. La página NO se
//                       bloquea aquí a propósito: el formulario del PIN vive DENTRO
//                       de /tpv, así que cerrarla en el edge impediría entrar. Lo que
//                       de verdad protege son las APIs — /api/tpv-order, /tpv-return,
//                       /tpv-caja y /tpv-stats exigen tpvAuthorized() (o sesión admin)
//                       en SERVIDOR, con service role. La página por sí sola no expone
//                       nada: el catálogo que carga es el público (anon key + RLS).
//
// /distribuidores/*   → RLS, no middleware. El login del portal usa el cliente de
//                       lib/supabase.ts (createClient de supabase-js), que guarda la
//                       sesión en localStorage, NO en cookie: el middleware NO puede
//                       verla. Gatear /distribuidores/facturas aquí echaría fuera a
//                       los distribuidores YA logueados (bucle al login). Su frontera
//                       real está en la base de datos: la política orders_select es
//                       `is_admin() OR customer_email = jwt.email`, así que un
//                       distribuidor solo puede leer SUS pedidos aunque manipule la
//                       consulta desde el navegador. login y nueva-password son
//                       públicas por diseño (son la puerta y el destino del enlace de
//                       recuperación).
//                       ⚠️ Para poder gatear aquí primero hay que migrar ese login a
//                       createBrowserClient (@supabase/ssr) — cambia dónde vive la
//                       sesión, así que va aparte y con aviso a los distribuidores.
//
// Lo que sí se aplica a las tres zonas: no indexar.
// ─────────────────────────────────────────────────────────────────────────────

function privada(res: NextResponse) {
  // Zona privada (panel, terminal de tienda, portal): fuera de los buscadores
  // aunque alguien enlace la URL o el crawler ignore robots.txt.
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Solo /admin necesita resolver la sesión. Comprobarla en /tpv y /distribuidores
  // sería una llamada de red por petición que no decide nada (ver mapa arriba).
  if (!path.startsWith('/admin')) return privada(NextResponse.next({ request }))

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const alLogin = (denied?: boolean) => {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', path)
    if (denied) loginUrl.searchParams.set('denied', '1')
    return NextResponse.redirect(loginUrl)
  }

  if (!user) return alLogin()

  // is_admin() es SECURITY DEFINER: comprueba la allowlist sin exponer la tabla.
  // Así un usuario logueado que NO sea admin (p.ej. un distribuidor) no entra al panel.
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) return alLogin(true)

  return privada(supabaseResponse)
}

export const config = {
  // /tpv y /distribuidores entran para marcarlos noindex (y para que este fichero
  // sea el sitio único donde se documenta qué protege cada zona). El gate real de
  // sesión sigue siendo solo /admin — ver el mapa de arriba.
  matcher: ['/admin/:path*', '/tpv/:path*', '/distribuidores/:path*'],
}
