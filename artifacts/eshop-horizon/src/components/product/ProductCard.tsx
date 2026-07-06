import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import type { Product } from '../../types/database'
import { formatPrice, calculateSavings } from '../../lib/utils'
import { useCart } from '../../hooks/useCart'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()

  // Priorité : colonne 'image' > 'main_image' > premier élément du tableau 'images'
  const imageUrl = product.image || product.main_image || (product.images && product.images[0]) || '';

  const savings = calculateSavings(product.price, product.compare_price)
  const hasDiscount = savings > 0
  const discountPercent = hasDiscount && product.compare_price
    ? Math.round((savings / product.compare_price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity: 1,
      slug: product.slug,
    })
  }

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link to={`/produit/${product.slug}`} className="block relative aspect-square overflow-hidden bg-warm-beige">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-sage/20" />
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-soft-gold text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="bg-anthracite text-white text-xs font-medium px-3 py-1 rounded-full">
              Plus que {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              Rupture
            </span>
          )}
        </div>

        {/* Boutons rapides (hover) */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-cta-green text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Ajouter
          </button>
          <button className="bg-white text-anthracite p-2 rounded-lg hover:bg-warm-beige transition-colors">
            <Heart size={16} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/produit/${product.slug}`) }}
            className="bg-white text-anthracite p-2 rounded-lg hover:bg-warm-beige transition-colors"
            aria-label="Voir le produit"
          >
            <Eye size={16} />
          </button>
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-display text-sm font-medium text-anthracite mb-1 line-clamp-2 min-h-[2.5rem]">
          <Link to={`/produit/${product.slug}`} className="hover:text-cta-green transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-cta-green">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && product.compare_price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {hasDiscount && (
          <p className="text-xs text-soft-gold font-medium mt-1">
            Économisez {formatPrice(savings)}
          </p>
        )}
      </div>
    </div>
  )
}
