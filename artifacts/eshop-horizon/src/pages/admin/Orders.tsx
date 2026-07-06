import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Search,
  Filter,
  XCircle,
  Download,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  LogOut,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import type { Order } from '../../types/database'

type OrderStatus = 'pending' | 'paid' | 'preparation' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded'

interface OrderWithItems extends Order {
  order_items?: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading, logout } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login')
      return
    }
    if (isAdmin) {
      fetchOrders()
    }
  }, [isAdmin, authLoading, navigate, currentPage, statusFilter])

  async function fetchOrders() {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, count, error } = await query

      if (error) throw error

      setOrders(data || [])
      setFilteredOrders(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Erreur chargement commandes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = orders

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_email?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.tracking_number?.toLowerCase().includes(q)
      )
    }

    setFilteredOrders(result)
  }, [searchQuery, orders])

  async function fetchOrderDetail(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error

      setSelectedOrder(data)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Erreur détail commande:', err)
    }
  }

  async function updateOrderStatus() {
    if (!selectedOrder) return

    setUpdating(true)
    try {
      const updateData: Record<string, string> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
      if (trackingNumber.trim()) {
        updateData.tracking_number = trackingNumber.trim()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id)

      if (error) throw error

      // Call Netlify function to send email
      await fetch('/.netlify/functions/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      }).catch((err) => console.error('Email notification failed:', err))

      await fetchOrders()
      setShowStatusModal(false)
      setShowDetailModal(false)
      setTrackingNumber('')
    } catch (err) {
      console.error('Erreur mise à jour statut:', err)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  function exportCSV() {
    const headers = ['ID', 'Date', 'Client', 'Email', 'Total', 'Statut', 'Tracking']
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.created_at).toLocaleDateString('fr-FR'),
      o.customer_name || '',
      o.customer_email,
      o.total,
      o.status,
      o.tracking_number || '',
    ])

    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      preparation: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      payment_failed: 'Paiement échoué',
      refunded: 'Remboursée',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      preparation: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      payment_failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payée' },
    { value: 'preparation', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
  ]

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Commandes | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-warm-beige sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-cta-green" />
              <span className="font-display font-bold text-anthracite">Commandes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-warm-beige rounded-lg hover:bg-cream transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-warm-beige p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par N°, email, client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as OrderStatus | 'all')
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green bg-white"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-warm-beige overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-warm-beige bg-cream/50">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">N°</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Client</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Statut</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Paiement</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500">
                            Aucune commande trouvée.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-warm-beige/50 hover:bg-cream/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-anthracite">
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-anthracite">
                                  {order.customer_name || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">{order.customer_email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-cta-green">
                              {formatPrice(order.total)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  order.payment_status || 'pending'
                                )}`}
                              >
                                {getStatusLabel(order.payment_status || 'pending')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => fetchOrderDetail(order.id)}
                                  className="p-1.5 text-gray-500 hover:text-cta-green hover:bg-cta-green/10 rounded-lg transition-colors"
                                  title="Voir détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setNewStatus(order.status as OrderStatus)
                                    setShowStatusModal(true)
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Changer statut"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-warm-beige">
                    <p className="text-sm text-gray-500">
                      Page {currentPage} sur {totalPages} ({totalCount} commandes)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-warm-beige rounded-lg hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-warm-beige rounded-lg hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-warm-beige flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-anthracite">
                Commande #{selectedOrder.id.slice(0, 8)}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
                {selectedOrder.tracking_number && (
                  <span className="text-sm text-gray-500">
                    Tracking: <span className="font-mono">{selectedOrder.tracking_number}</span>
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-cream/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
                  <p className="text-anthracite font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-cream/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Livraison</h3>
                  <p className="text-sm text-anthracite">
                    {typeof selectedOrder.shipping_address === 'string'
                      ? selectedOrder.shipping_address
                      : JSON.stringify(selectedOrder.shipping_address)}
                  </p>
                </div>
              </div>

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-cream/30 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-anthracite">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-cta-green">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-warm-beige pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="text-anthracite">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="text-anthracite">{formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-warm-beige">
                  <span className="text-anthracite">Total</span>
                  <span className="text-cta-green">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setNewStatus(selectedOrder.status as OrderStatus)
                    setShowStatusModal(true)
                  }}
                  className="flex-1 py-2.5 bg-cta-green text-white rounded-lg font-medium hover:bg-[#3d6b4a] transition-colors"
                >
                  Changer le statut
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 border border-warm-beige rounded-lg font-medium hover:bg-cream transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="font-display text-lg font-bold text-anthracite mb-4">
              Mettre à jour le statut
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                >
                  {statusOptions
                    .filter((o) => o.value !== 'all')
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>

              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de suivi
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="CJ123456789"
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateOrderStatus}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-cta-green text-white rounded-lg font-medium hover:bg-[#3d6b4a] transition-colors disabled:opacity-50"
                >
                  {updating ? 'Mise à jour...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setTrackingNumber('')
                  }}
                  className="flex-1 py-2.5 border border-warm-beige rounded-lg font-medium hover:bg-cream transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
