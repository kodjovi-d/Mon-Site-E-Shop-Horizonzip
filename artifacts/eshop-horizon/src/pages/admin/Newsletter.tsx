import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import {
  Mail,
  Users,
  Download,
  Trash2,
  PawPrint,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Subscriber {
  id: string
  email: string
  source: string | null
  subscribed_at: string
  unsubscribed_at: string | null
}

export default function AdminNewsletter() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading, logout } = useAuth()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const itemsPerPage = 20

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login')
      return
    }
    if (isAdmin) {
      fetchSubscribers()
    }
  }, [isAdmin, authLoading, navigate, currentPage])

  async function fetchSubscribers() {
    setLoading(true)
    try {
      const { data, count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' })
        .order('subscribed_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) throw error

      setSubscribers(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Erreur chargement abonnés:', err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteSubscriber(id: string) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDeleteConfirm(null)
      await fetchSubscribers()
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const filtered = subscribers.filter(
    (s) =>
      !searchQuery ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  function exportCSV() {
    const headers = ['Email', 'Source', 'Date inscription', 'Date désinscription']
    const rows = filtered.map((s) => [
      s.email,
      s.source || '',
      new Date(s.subscribed_at).toLocaleDateString('fr-FR'),
      s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('fr-FR') : '',
    ])

    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const stats = {
    total: totalCount,
    active: subscribers.filter((s) => !s.unsubscribed_at).length,
    newThisMonth: subscribers.filter((s) => {
      const date = new Date(s.subscribed_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
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
        <title>Newsletter | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="bg-white border-b border-warm-beige sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-cta-green" />
              <span className="font-display font-bold text-anthracite">Newsletter</span>
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-warm-beige p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-cta-green" />
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-anthracite">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-warm-beige p-5">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-500">Actifs</span>
              </div>
              <p className="text-2xl font-bold text-anthracite">{stats.active}</p>
            </div>
            <div className="bg-white rounded-xl border border-warm-beige p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-soft-gold" />
                <span className="text-sm text-gray-500">Ce mois</span>
              </div>
              <p className="text-2xl font-bold text-anthracite">{stats.newThisMonth}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-warm-beige p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email..."
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
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Email</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Source</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Inscription</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Statut</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            Aucun abonné trouvé.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((subscriber) => (
                          <tr
                            key={subscriber.id}
                            className="border-b border-warm-beige/50 hover:bg-cream/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-anthracite">
                              {subscriber.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {subscriber.source || 'Site web'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(subscriber.subscribed_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  subscriber.unsubscribed_at
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {subscriber.unsubscribed_at ? 'Désabonné' : 'Actif'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {deleteConfirm === subscriber.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-red-600">Confirmer ?</span>
                                  <button
                                    onClick={() => deleteSubscriber(subscriber.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(subscriber.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
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
                      Page {currentPage} sur {totalPages} ({totalCount} abonnés)
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
