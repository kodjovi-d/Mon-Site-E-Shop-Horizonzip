import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'

interface OrderData {
  id: string
  status: string
  customer_email: string
  customer_name: string
  total: number
  created_at: string
  updated_at: string
  tracking_number?: string
  shipping_address?: Record<string, string>
}

export default function OrderTracking() {
  const [searchValue, setSearchValue] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim() || !email.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const orderId = searchValue.startsWith('#') ? searchValue.slice(1) : searchValue

      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('id, status, customer_email, customer_name, total, created_at, updated_at, tracking_number, shipping_address')
        .eq('id', orderId)
        .eq('customer_email', email.trim())
        .single()

      if (supabaseError || !data) {
        throw new Error('Aucune commande trouvée avec ces informations.')
      }

      setOrder(data as OrderData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche')
    } finally {
      setLoading(false)
    }
  }

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Commande reçue', icon: Clock },
      { key: 'paid', label: 'Paiement confirmé', icon: CheckCircle },
      { key: 'processing', label: 'En préparation', icon: Package },
      { key: 'shipped', label: 'Expédiée', icon: Truck },
      { key: 'delivered', label: 'Livrée', icon: MapPin },
    ]

    const statusIndex = steps.findIndex((s) => s.key === order?.status)
    const effectiveIndex = statusIndex === -1 ? 0 : statusIndex

    return steps.map((step, index) => ({
      ...step,
      active: index <= effectiveIndex,
      current: index === effectiveIndex,
    }))
  }

  return (
    <>
      <Helmet>
        <title>Suivi de commande | E-Shop Horizon</title>
        <meta name="description" content="Suivez votre commande E-Shop Horizon en temps réel." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-anthracite mb-2">
            Suivi de commande
          </h1>
          <p className="text-gray-500">
            Entrez votre numéro de commande et votre email pour suivre votre colis.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de commande
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="#12345678 ou UUID complet"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cta-green text-white py-3 rounded-lg font-medium hover:bg-cta-green/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Rechercher ma commande
              </>
            )}
          </button>
        </form>

        {order && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header commande */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <span className="text-sm text-gray-500">Commande</span>
                <p className="font-semibold text-anthracite text-lg">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.customer_name || order.customer_email}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Total</span>
                <p className="font-semibold text-cta-green text-lg">
                  {formatPrice(order.total)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-medium text-anthracite mb-4">Statut de la commande</h3>
              <div className="space-y-0">
                {getStatusSteps().map((step, index, arr) => (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.active
                            ? step.current
                              ? 'bg-cta-green text-white'
                              : 'bg-cta-green/20 text-cta-green'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <step.icon className="h-4 w-4" />
                      </div>
                      {index < arr.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            step.active ? 'bg-cta-green/30' : 'bg-gray-100'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p
                        className={`text-sm font-medium ${
                          step.active ? 'text-anthracite' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.current && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mis à jour le{' '}
                          {new Date(order.updated_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adresse de livraison */}
            {order.shipping_address && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-anthracite mb-2 text-sm">Adresse de livraison</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-anthracite">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                  </p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.postalCode} {order.shipping_address.city}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
            )}

            {/* Numéro de suivi */}
            {order.tracking_number && (
              <div className="bg-green-50 rounded-lg p-4">
                <span className="text-sm text-green-700 font-medium">
                  Numéro de suivi colis
                </span>
                <p className="font-semibold text-anthracite mt-1">{order.tracking_number}</p>
                <a
                  href={`https://track.aftership.com/${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cta-green text-sm hover:underline mt-2 inline-block"
                >
                  Suivre mon colis →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
