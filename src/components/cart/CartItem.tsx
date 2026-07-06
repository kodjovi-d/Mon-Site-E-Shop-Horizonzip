import { Trash2, Plus, Minus } from 'lucide-react'
import { formatPrice } from '../../lib/utils'

interface CartItemProps {
  item: {
    productId: string
    name: string
    price: number
    quantity: number
    image: string
  }
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-anthracite truncate">{item.name}</h3>
        <p className="text-cta-green font-bold mt-1">{formatPrice(item.price)}</p>
        
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onRemove(item.productId)}
            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-right hidden sm:block">
        <p className="font-bold text-anthracite">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  )
}
