import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

interface UseProductsOptions {
  category_id?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name'
  limit?: number
  offset?: number
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const {
    category_id,
    search,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    limit = 12,
    offset = 0,
  } = options

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (category_id) {
        query = query.eq('category_id', category_id)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (minPrice !== undefined) {
        query = query.gte('price', minPrice)
      }

      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice)
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      query = query.range(offset, offset + limit - 1)

      const { data, error: supabaseError, count } = await query

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setProducts(data || [])
      setTotalCount(count || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits')
      console.error('useProducts error:', err)
    } finally {
      setLoading(false)
    }
  }, [category_id, search, minPrice, maxPrice, sortBy, limit, offset])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, totalCount, refetch: fetchProducts }
}
