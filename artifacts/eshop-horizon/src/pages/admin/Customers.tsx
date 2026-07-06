import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  Download,
  PawPrint,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

interface CustomerWithOrders {
  id: string
  email: string
  name: string | null
  phone: string | null
  created_at: string
  order_count: number
  total_spent: number
}

export default function AdminCustomers() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading, logout } = useAuth()
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login')
      return
    }
    if (isAdmin) {
      fetchCustomers()
    }
  }, [isAdmin, authLoading, navigate])

  async function fetchCustomers() {
    setLoading(true)
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersError) throw customersError

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, total')

      if (ordersError) throw ordersError

      const enriched = (customersData || []).map((customer) => {
        const customerOrders = ordersData?.filter((o) => o.customer_email === customer.email) || []
        return {
          ...customer,
          order_count: customerOrders.length,
          total_spent: customerOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        }
      })

      setCustomers(enriched)
    } catch (err) {
      console.error('Erreur chargement clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(
    (c) =>
      !searchQuery ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
  )

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  function exportCSV() {
    const headers = ['Email', 'Nom', 'Téléphone', 'Commandes', 'Total dépensé', 'Inscription']
    const rows = filtered.map((c) => [
      c.email,
      c.name || '',
      c.phone || '',
      c.order_count,
      c.total_spent,
      new Date(c.created_at).toLocaleDateString('fr-FR'),
    ])

    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
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
        <title>Clients | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-warm-beige sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-cta-green" />
              <span className="font-display font-bold text-anthracite">Clients</span>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email, nom, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-warm-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-cta-green"
              />
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
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                          Client
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                          Contact
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                          Commandes
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                          Total dépensé
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                          Inscription
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            Aucun client trouvé.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((customer) => (
                          <tr
                            key={customer.id}
                            className="border-b border-warm-beige/50 hover:bg-cream/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cta-green/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-cta-green" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-anthracite">
                                    {customer.name || 'Non renseigné'}
                                  </p>
                                  <p className="text-xs text-gray-500">{customer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-cta-green" />
                                <span className="text-sm font-medium text-anthracite">
                                  {customer.order_count}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-cta-green">
                              {formatPrice(customer.total_spent)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(customer.created_at).toLocaleDateString('fr-FR')}
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
                      {filtered.length} clients • Page {currentPage} / {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-warm-beige rounded-lg hover:bg-cream disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-warm-beige rounded-lg hover:bg-cream disabled:opacity-50"
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
    </>
  )
}
