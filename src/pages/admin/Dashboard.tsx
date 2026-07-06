import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  LogOut,
  PawPrint,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import type { Order } from '../../types/database'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login')
      return
    }
    if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin, authLoading, navigate])

  async function fetchDashboardData() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true }),
      ])

      if (ordersRes.data) {
        const ordersData = ordersRes.data as Order[]
        setOrders(ordersData)
        
        const revenue = ordersData
          .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
          
        const pending = ordersData.filter(
          (o) => o.status === 'pending' || o.status === 'paid' || o.status === 'preparation'
        ).length

        setStats({
          totalOrders: ordersData.length,
          totalRevenue: revenue,
          pendingOrders: pending,
          totalProducts: productsRes.count || 0,
        })
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const getStatusLabel = (status: string | undefined) => {
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
    return status ? (labels[status] || status) : 'N/A'
  }

  const getStatusColor = (status: string | undefined) => {
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
    return status ? (colors[status] || 'bg-gray-100 text-gray-700') : 'bg-gray-100 text-gray-700'
  }

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
        <title>Tableau de bord | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="min-h-screen bg-cream">
        <header className="bg-white border-b border-warm-beige sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-cta-green" />
              <span className="font-display font-bold text-anthracite">Administration</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-cta-green transition-colors hidden sm:block">
                Voir le site →
              </a>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta-green" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Commandes', value: stats.totalOrders, icon: ShoppingBag, color: 'text-cta-green', bg: 'bg-cta-green/10' },
                  { label: 'Revenus', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-soft-gold', bg: 'bg-soft-gold/10' },
                  { label: 'En cours', value: stats.pendingOrders, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
                  { label: 'Produits', value: stats.totalProducts, icon: Package, color: 'text-sage', bg: 'bg-sage/10' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-warm-beige p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-anthracite">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <Link to="/admin/ia" className="block bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-white" />
                        <h3 className="font-display text-lg font-bold text-white">Centre IA Genspark</h3>
                      </div>
                      <p className="text-purple-100 text-sm">Générez du contenu produit avec l'IA</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-white/60" />
                  </div>
                </Link>
                <Link to="/admin/ia/validation" className="block bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-6 w-6 text-white" />
                        <h3 className="font-display text-lg font-bold text-white">Valider le contenu IA</h3>
                      </div>
                      <p className="text-green-100 text-sm">Approuvez ou rejetez les contenus générés</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-white/60" />
                  </div>
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-warm-beige overflow-hidden">
                <div className="p-6 border-b border-warm-beige flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-sage" />
                    <h2 className="font-display text-lg font-semibold text-anthracite">Commandes récentes</h2>
                  </div>
                  <Link to="/admin/commandes" className="text-sm text-cta-green hover:underline flex items-center gap-1">
                    Voir tout <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-warm-beige bg-cream/50">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Commande</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Client</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Date</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">Aucune commande pour le moment.</td>
                        </tr>
                      ) : (
                        orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="border-b border-warm-beige/50 hover:bg-cream/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-anthracite">
                              #{order.id?.slice(0, 8) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {order.customer_name || order.customer_email || 'Client inconnu'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-cta-green">
                              {formatPrice(Number(order.total) || 0)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
