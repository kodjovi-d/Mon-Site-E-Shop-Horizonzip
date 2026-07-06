// src/hooks/useProduct.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

interface UseProductReturn {
  product: Product | null
  relatedProducts: Product[]
  loading: boolean
  error: string | null
}

export function useProduct(slug: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        if (!data) {
          throw new Error('Produit non trouvé')
        }

        setProduct(data)

        // Produits similaires (même catégorie)
        if (data.category_id) {
          const { data: related, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(4)

          if (!relatedError) {
            setRelatedProducts(related || [])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  return { product, relatedProducts, loading, error }
}
