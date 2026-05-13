import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {a
// ok
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
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
  const path = request.nextUrl.pathname
  const isProtected = ['/admin', '/tpv'].some(p => path.startsWith(p))
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(loginUrl)
  }
  return supabaseResponse
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return request.cookies.getAll() }, setAll(c) { c.forEach(({name,value})=>request.cookies.set(name,value)); supabaseResponse=NextResponse.next({request}); c.forEach(({name,value,options})=>supabaseResponse.cookies.set(name,value,options)) } } })
  const {data:{user}} = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  if (['/admin','/tpv'].some(p=>path.startsWith(p)) && !user) { const u=request.nextUrl.clone(); u.pathname='/login'; u.searchParams.set('redirectTo',path); return NextResponse.redirect(u) }
  return supabaseResponse
}
export const config = { matcher: ['/admin/:path*','/tpv/:path*','/tpv'] }export const config = { matcher: ['/admin/:path*', '/tpv/:path*', '/tpv'] }
