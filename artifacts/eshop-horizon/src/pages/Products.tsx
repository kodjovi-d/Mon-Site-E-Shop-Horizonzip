import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Filter, SlidersHorizontal, Leaf, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import type { Product, Category } from '../types/database'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('categorie') || ''
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]) // Augmenté le range par sécurité
  const searchQuery = searchParams.get('q') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Requête de base : on sélectionne tout sans filtre restrictif pour déboguer
      let query = supabase
        .from('products')
        .select('*')

      if (selectedCategory) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single()

        if (catData) {
          query = query.eq('category_id', catData.id)
        }
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      // Application des filtres de prix
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

      // Tri
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        setFetchError(error.message)
      } else {
        // On s'assure de recevoir un tableau
        setProducts(data || [])
      }
    } catch (err: any) {
      console.error('Erreur chargement produits:', err)
      setFetchError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, sortBy, priceRange, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order') // Retiré le filtre is_active pour être sûr de tout voir
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    const newParams = new URLSearchParams(searchParams)
    if (slug) {
      newParams.set('categorie', slug)
    } else {
      newParams.delete('categorie')
    }
    setSearchParams(newParams)
  }

  return (
    <>
      <Helmet>
        <title>Nos Produits | E-Shop Horizon</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-anthracite mb-2">Nos produits</h1>
          <p className="text-gray-500">
            {products.length} produit{products.length !== 1 ? 's' : ''} trouvé{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ... (Garder le reste du JSX identique à votre code précédent) ... */}
        {/* Assurez-vous que le composant ProductCard est bien présent après cette fonction */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" /></div>
        ) : fetchError ? (
          <div className="text-center py-16 text-red-500">Erreur : {fetchError}</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="text-center py-16">Aucun produit trouvé.</div>
        )}
      </div>
    </>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/produit/${product.slug}`} className="group bg-white p-4 rounded-xl border border-warm-beige">
      <img src={product.main_image || ''} alt={product.name} className="w-full h-40 object-cover mb-3" />
      <h3 className="font-medium text-sm">{product.name}</h3>
      <p className="font-semibold text-cta-green">{formatPrice(Number(product.price))}</p>
    </Link>
  )
}
