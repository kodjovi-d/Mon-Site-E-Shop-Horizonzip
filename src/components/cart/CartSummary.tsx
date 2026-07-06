import { Truck } from 'lucide-react'
import { formatPrice } from '../../lib/utils'

interface CartSummaryProps {
  subtotal: number
  shippingCost: number
  total: number
  isFreeShipping: boolean
  freeShippingThreshold: number
}

export function CartSummary({
  subtotal,
  shippingCost,
  total,
  isFreeShipping,
  freeShippingThreshold,
}: CartSummaryProps) {
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal)
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100)

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="font-display text-xl font-bold text-anthracite mb-4">Récapitulatif</h2>
      
      {/* Barre de progression livraison gratuite */}
      {!isFreeShipping && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Livraison gratuite</span>
            <span className="text-cta-green font-medium">Plus que {formatPrice(remainingForFree)}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-cta-green rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      
      {isFreeShipping && (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">
          <Truck className="w-4 h-4" />
          <span className="font-medium">🎉 Livraison gratuite !</span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Sous-total</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Livraison</span>
          <span className="font-medium">{isFreeShipping ? 'Gratuite' : formatPrice(shippingCost)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-cta-green">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
