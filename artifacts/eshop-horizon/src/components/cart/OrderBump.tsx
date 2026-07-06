import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice, calculateSavings } from '../../lib/utils'

interface OrderBumpProps {
  cartProductIds: string[]
  onAddToCart: (product: any) => void
}

export function OrderBump({ cartProductIds, onAddToCart }: OrderBumpProps) {
  const [product, setProduct] = useState<any>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, compare_price, main_image, slug')
        .eq('is_active', true)
        .not('id', 'in', `(${cartProductIds.join(',')})`)
        .limit(1)
        .single()

      if (data) setProduct(data)
    }

    if (cartProductIds.length > 0) fetchProduct()
  }, [cartProductIds])

  if (!product) return null

  const savings = calculateSavings(product.price, product.compare_price)
  const hasDiscount = savings > 0

  const handleToggle = () => {
    if (!checked) {
      onAddToCart({ ...product, productId: product.id, quantity: 1 })
    }
    setChecked(!checked)
  }

  return (
    <div className="border-2 border-[#C9A84C] rounded-xl p-4 bg-[#C9A84C]/5">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          className="mt-1 w-5 h-5 accent-cta-green cursor-pointer"
        />
        <div className="flex-1">
          <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-wide mb-1">
            Offre spéciale
          </p>
          <div className="flex items-center gap-3">
            <img
              src={product.main_image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium text-anthracite text-sm">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-cta-green">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-gray-400 line-through text-sm">{formatPrice(product.compare_price)}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      -{Math.round((savings / product.compare_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <Plus className="w-3 h-3 inline" /> Ajouter à ma commande
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
