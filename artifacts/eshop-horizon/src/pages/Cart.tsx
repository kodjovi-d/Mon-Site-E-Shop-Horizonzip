import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Leaf } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/utils'

export default function Cart() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalItems, 
    subtotal, 
    total, 
    shippingCost, 
    isFreeShipping, 
    freeShippingThreshold,
    clearCart 
  } = useCart()
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>Mon Panier | E-Shop Horizon</title>
        <meta name="description" content="Consultez et modifiez votre panier." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-8">
          Mon panier
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-sage/30 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-anthracite mb-2">
              Votre panier est vide
            </h2>
            <p className="text-gray-500 mb-6">
              Découvrez nos produits et ajoutez-les à votre panier.
            </p>
            <Link to="/produits" className="btn-primary inline-flex items-center gap-2">
              Découvrir les produits
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Vider le panier
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl border border-warm-beige p-4 flex gap-4"
                >
                  <div
                    className="w-24 h-24 bg-warm-beige/50 rounded-lg flex-shrink-0 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/produit/${item.slug}`)}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="h-8 w-8 text-sage/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-medium text-anthracite text-sm cursor-pointer hover:text-cta-green transition-colors line-clamp-2"
                        onClick={() => navigate(`/produit/${item.slug}`)}
                      >
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-warm-beige rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-warm-beige transition-colors"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-warm-beige transition-colors"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="font-semibold text-cta-green">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/produits"
                className="inline-flex items-center gap-1 text-sm text-cta-green hover:underline"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continuer mes achats
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-warm-beige p-6 sticky top-24">
                <h2 className="font-display text-lg font-semibold text-anthracite mb-4">
                  Récapitulatif
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-medium">
                      {isFreeShipping ? 'Gratuite' : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                {!isFreeShipping && (
                  <div className="bg-sage/10 rounded-lg p-3 mb-4 text-sm text-sage">
                    Plus que{' '}
                    <strong>
                      {formatPrice(freeShippingThreshold - subtotal)}
                    </strong>{' '}
                    pour la livraison gratuite !
                  </div>
                )}

                <div className="border-t border-warm-beige pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-anthracite">Total</span>
                    <span className="font-bold text-lg text-cta-green">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">TTC</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Passer la commande
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-4 text-center text-xs text-gray-400">
                  Paiement sécurisé via GeniusPay
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
