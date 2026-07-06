import { useState } from 'react'
import { ShoppingCart, Truck, Shield, RotateCcw, Star, Minus, Plus } from 'lucide-react'
import type { Product } from '../../types/database'
import { formatPrice, calculateSavings } from '../../lib/utils'
import { useCart } from '../../hooks/useCart'
import { ProductGallery } from './ProductGallery'
import { trackAddToCart } from '../../lib/pixel'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const savings = calculateSavings(product.price, product.compare_price)
  const hasDiscount = savings > 0
  const discountPercent = hasDiscount && product.compare_price
    ? Math.round((savings / product.compare_price) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.main_image || product.images[0] || '',
      quantity,
      slug: product.slug,
    })
    trackAddToCart({
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'EUR',
    })
  }

  const benefits = [
    { icon: Truck, text: 'Livraison gratuite dès 49€' },
    { icon: Shield, text: 'Garantie 30 jours satisfait ou remboursé' },
    { icon: RotateCcw, text: 'Retours gratuits sous 14 jours' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <ProductGallery images={product.images} productName={product.name} />

      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-anthracite mb-2">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className={star <= 4 ? 'text-soft-gold fill-soft-gold' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.8 (127 avis)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-cta-green">{formatPrice(product.price)}</span>
            {hasDiscount && product.compare_price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                <span className="bg-soft-gold/10 text-soft-gold text-sm font-bold px-3 py-1 rounded-full">-{discountPercent}%</span>
              </>
            )}
          </div>
          {hasDiscount && <p className="text-soft-gold font-medium mt-1">Économisez {formatPrice(savings)} aujourd'hui</p>}
        </div>

        <p className="text-gray-600 leading-relaxed">{product.short_description}</p>

        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 font-medium">En stock — Expédition sous 24h</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-500 font-medium">Rupture de stock</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="p-3 hover:bg-gray-50 disabled:opacity-50">
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} className="p-3 hover:bg-gray-50 disabled:opacity-50">
              <Plus size={18} />
            </button>
          </div>

          <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-cta-green text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50">
            <ShoppingCart size={20} />
            Ajouter au panier — {formatPrice(product.price * quantity)}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-full flex items-center justify-center flex-shrink-0">
                <b.icon size={20} className="text-sage" />
              </div>
              <span className="text-sm text-gray-600">{b.text}</span>
            </div>
          ))}
        </div>

        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="bg-warm-beige text-anthracite text-xs px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none text-gray-600">
          <h3 className="font-display text-lg font-semibold text-anthracite mb-2">Description</h3>
          <p>{product.description}</p>
        </div>

        <div className="bg-warm-beige/50 rounded-xl p-4">
          <h3 className="font-display text-lg font-semibold text-anthracite mb-3">Caractéristiques</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Poids</span><span className="font-medium">{product.weight} kg</span></div>
            {product.dimensions && (
              <>
                <div className="flex justify-between"><span className="text-gray-500">Longueur</span><span className="font-medium">{(product.dimensions as Record<string, number>).length} cm</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Largeur</span><span className="font-medium">{(product.dimensions as Record<string, number>).width} cm</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Hauteur</span><span className="font-medium">{(product.dimensions as Record<string, number>).height} cm</span></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
