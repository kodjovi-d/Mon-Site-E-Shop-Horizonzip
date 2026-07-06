import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useProduct } from '../hooks/useProduct'
import { ProductDetails } from '../components/product/ProductDetails'
import { ProductCard } from '../components/product/ProductCard'
import ReviewSection from '../components/product/ReviewSection'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { product, relatedProducts, loading, error } = useProduct(slug || '')

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-anthracite mb-4">Produit non trouvé</h1>
        <p className="text-gray-500">Ce produit n'existe pas ou n'est plus disponible.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{product.seo_title || product.name} | E-Shop Horizon</title>
        <meta name="description" content={product.seo_description || product.short_description || ''} />
      </Helmet>

      <ProductDetails product={product} />

      <ReviewSection productId={product.id} productSlug={product.slug} />

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-anthracite mb-6">
            Vous aimerez aussi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
