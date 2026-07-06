import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        setCategories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories')
        console.error('useCategories error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
