import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import { formatPrice } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { trackPurchase } from '../lib/pixel'

interface OrderData {
  id: string
  status: string
  payment_status: string
  customer_email: string
  total: number
  created_at: string
  updated_at: string
  tracking_number?: string
}

interface OrderItemData {
  id: string
  product_name: string
  quantity: number
  total_price: number
}

export default function ThankYou() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false)
        setError('Aucun numéro de commande fourni')
        return
      }

      try {
        // Utilise la Netlify Function (plus sécurisé)
        const response = await fetch(`/.netlify/functions/verify-payment?orderId=${orderId}`)
        const rawText = await response.text()
        let data: { success?: boolean; order?: OrderData; message?: string }
        try {
          data = rawText ? JSON.parse(rawText) : {}
        } catch {
          throw new Error('Réponse invalide du serveur')
        }

        if (data.success && data.order) {
          setOrder(data.order)
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('id, product_id, product_name, quantity, total_price')
            .eq('order_id', orderId)

          if (itemsData) {
            setOrderItems(itemsData)
            trackPurchase({
              value: data.order.total,
              currency: 'EUR',
              content_ids: itemsData.map((i: { product_id?: string; id: string }) => i.product_id || i.id),
              num_items: itemsData.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
            })
          }
        } else {
          setError(data.message || 'Commande introuvable')
        }
      } catch (err) {
        console.error('Erreur chargement commande:', err)
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'En attente de paiement',
      'paid': 'Payée',
      'preparation': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'payment_failed': 'Paiement échoué',
      'refunded': 'Remboursée',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    if (status === 'paid' || status === 'delivered') return 'text-green-600 bg-green-100'
    if (status === 'payment_failed' || status === 'refunded') return 'text-red-600 bg-red-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  return (
    <>
      <Helmet>
        <title>Commande confirmée | E-Shop Horizon</title>
        <meta name="description" content="Votre commande a été confirmée avec succès." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-cta-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-cta-green" />
          </div>
          <h1 className="font-display text-3xl font-bold text-anthracite mb-2">
            Merci pour votre commande !
          </h1>
          <p className="text-gray-500">
            Votre commande a bien été reçue et est en cours de traitement.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta-green" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center mb-8">
            {error}
          </div>
        ) : order ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-500">Numéro de commande</span>
                <p className="font-semibold text-anthracite">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Statut</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email</span>
                <p className="font-semibold text-anthracite">{order.customer_email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total</span>
                <p className="font-semibold text-cta-green text-lg">{formatPrice(order.total)}</p>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-medium text-anthracite mb-3">Articles commandés</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-600">
                        {item.product_name}{' '}
                        <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold">
                <span className="text-anthracite">Total</span>
                <span className="text-cta-green text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Package className="h-8 w-8 text-cta-green mx-auto mb-3" />
            <h3 className="font-display font-semibold text-anthracite mb-1">
              Suivi de commande
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Suivez l'état de votre commande en temps réel.
            </p>
            <Link
              to="/suivi"
              className="text-cta-green text-sm font-medium hover:underline inline-flex items-center gap-1"
            >
              Suivre ma commande
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Mail className="h-8 w-8 text-cta-green mx-auto mb-3" />
            <h3 className="font-display font-semibold text-anthracite mb-1">
              Confirmation email
            </h3>
            <p className="text-sm text-gray-500">
              Un email de confirmation a été envoyé à votre adresse.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/produits" className="btn-primary inline-flex items-center gap-2">
            Continuer mes achats
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
