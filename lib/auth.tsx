'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type DistributorLevel = 'Bronze' | 'Silver' | 'Gold' | null

type AuthCtx = {
  user: User | null
  isDistributor: boolean
  levelName: DistributorLevel
  discountPct: number
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null, isDistributor: false, levelName: null,
  discountPct: 0, loading: true, signOut: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [levelName, setLevelName] = useState<DistributorLevel>(null)
  const [discountPct, setDiscountPct] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadDistributor = async (uid: string) => {
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
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setLevelName(null); setDiscountPct(0)
  }

  return (
    <AuthContext.Provider value={{ user, isDistributor: !!user && discountPct > 0, levelName, discountPct, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
