import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ProductSearchResult {
  id: number
  name: string
  brand: string | null
  price_incl_tax: number
  image_url: string | null
  stock: number
  active: boolean
  category_name: string | null
  relevance: number
}

export function useSearch() {
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const search = useCallback(async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('buscar_productos', {
        query: q.trim(), limite: 20, offset_val: 0
      })
      if (error) throw error
      setResults(data ?? [])
    } catch (err) {
      console.error('Error en busqueda:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => { setResults([]); setQuery('') }, [])

  return { results, loading, query, search, clear }
}
