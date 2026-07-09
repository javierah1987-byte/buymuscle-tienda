'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type DistributorLevel = string | null

type AuthCtx = {
  user: User | null
  isDistributor: boolean
  levelName: DistributorLevel
  discountPct: number
  // Descuentos de distribuidor por PRODUCTO (override del grupo). El servidor los aplica
  // (distributor_product_discounts); esto es para que el precio MOSTRADO coincida con el cobrado.
  overrides: Record<number, number>
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, isDistributor: false, levelName: null,
  discountPct: 0, overrides: {}, loading: true, signOut: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [levelName, setLevelName] = useState<DistributorLevel>(null)
  const [discountPct, setDiscountPct] = useState(0)
  const [overrides, setOverrides] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  const loadDistributor = async (uid: string) => {
    // El % de grupo: query INTACTA (no la arriesgamos añadiéndole columnas nuevas).
    const { data } = await supabase
      .from('distributor_profiles')
      .select('level_name, discount_pct')
      .eq('user_id', uid)
      .single()
    if (data) {
      setLevelName(data.level_name as DistributorLevel)
      setDiscountPct(Number(data.discount_pct) || 0)
    } else {
      setLevelName(null)
      setDiscountPct(0)
    }
    // Overrides por producto: BEST-EFFORT y en query SEPARADA. Si level_id/la tabla no son
    // accesibles (RLS/esquema), cae a {} → se usa el % de grupo (comportamiento actual, sin regresión).
    try {
      const { data: prof } = await supabase
        .from('distributor_profiles').select('level_id').eq('user_id', uid).single()
      const levelId = (prof as any)?.level_id
      if (levelId != null) {
        const { data: ov } = await supabase
          .from('distributor_product_discounts')
          .select('product_id, discount_pct')
          .eq('level_id', levelId)
        const map: Record<number, number> = {}
        for (const r of (ov || [])) map[Number(r.product_id)] = Number(r.discount_pct)
        setOverrides(map)
      } else setOverrides({})
    } catch { setOverrides({}) }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) await loadDistributor(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadDistributor(session.user.id)
      } else {
        setLevelName(null)
        setDiscountPct(0)
        setOverrides({})
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setLevelName(null); setDiscountPct(0); setOverrides({})
  }

  return (
    <AuthContext.Provider value={{ user, isDistributor: !!user && discountPct > 0, levelName, discountPct, overrides, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
