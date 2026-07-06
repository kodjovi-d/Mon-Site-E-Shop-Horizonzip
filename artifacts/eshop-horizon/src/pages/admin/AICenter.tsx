import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Sparkles, RefreshCw, Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, Play, Eye, Image, FileText, Video, CircleHelp as HelpCircle, Search, ExternalLink, Loader as Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface GensparkTask {
  id: string
  product_id: string | null
  task_type: 'seo' | 'description' | 'faq' | 'image' | 'video'
  status: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | 'error'
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  error_message: string | null
  estimated_cost: number | null
  created_at: string
  completed_at: string | null
  products?: { id: string; name: string; main_image: string | null } | null
}

const taskTypeLabels: Record<string, string> = {
  seo: 'SEO Meta',
  description: 'Description',
  faq: 'FAQ',
  image: 'Images',
  video: 'Video',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  error: 'Erreur',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  error: 'bg-gray-100 text-gray-700',
}

const taskTypeIcons: Record<string, React.ElementType> = {
  seo: Search,
  description: FileText,
  faq: HelpCircle,
  image: Image,
  video: Video,
}

export default function AICenter() {
  const [tasks, setTasks] = useState<GensparkTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'approved'>('all')
  const [stats, setStats] = useState({ pending: 0, completed: 0, approved: 0, totalCost: 0 })

  const fetchTasks = async () => {
    setLoading(true)
    let query = supabase
      .from('genspark_tasks')
      .select('id, product_id, task_type, status, input_data, output_data, error_message, estimated_cost, created_at, completed_at, products(id, name, main_image)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query
    if (!error && data) {
      setTasks(data as GensparkTask[])
      const pending = data.filter(t => t.status === 'pending').length
      const completed = data.filter(t => t.status === 'completed').length
      const approved = data.filter(t => t.status === 'approved').length
      const totalCost = data.reduce((sum, t) => sum + (t.estimated_cost || 0), 0)
      setStats({ pending, completed, approved, totalCost })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const generateTasks = async (taskType: 'seo' | 'description' | 'faq' | 'image' | 'video') => {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, supplier_url, supplier_url')
      .eq('is_active', true)

    if (!products || products.length === 0) {
      alert('Aucun produit actif trouvé')
      return
    }

    const tasksToCreate = products.map(p => ({
      product_id: p.id,
      task_type: taskType,
      status: 'pending',
      input_data: {
        product_name: p.name,
        current_description: p.description,
        supplier_url: p.supplier_url,
      },
    }))

    const { error } = await supabase.from('genspark_tasks').insert(tasksToCreate)
    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      alert(`${tasksToCreate.length} tâches "${taskTypeLabels[taskType]}" créées`)
      fetchTasks()
    }
  }

  return (
    <>
      <Helmet>
        <title>Centre IA | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-purple-500" />
              <h1 className="font-display text-3xl font-bold text-anthracite">Centre IA Genspark</h1>
            </div>
            <p className="text-gray-500 mt-1">Génération automatique de contenu produit par IA</p>
          </div>
          <Link
            to="/admin/ia/validation"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Valider les contenus
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-warm-beige p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-anthracite">{stats.pending}</p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-beige p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-anthracite">{stats.completed}</p>
            <p className="text-sm text-gray-500">À valider</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-beige p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-anthracite">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approuvés</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-beige p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-anthracite">${stats.totalCost.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Coût total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-beige p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-anthracite mb-4">Générer des tâches IA</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { type: 'seo' as const, label: 'SEO Meta', icon: Search },
              { type: 'description' as const, label: 'Descriptions', icon: FileText },
              { type: 'faq' as const, label: 'FAQ', icon: HelpCircle },
              { type: 'image' as const, label: 'Images', icon: Image },
              { type: 'video' as const, label: 'Video', icon: Video },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => generateTasks(type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm-beige hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Icon className="h-6 w-6 text-purple-500" />
                <span className="text-sm font-medium text-anthracite">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-500">Filtrer:</span>
          {(['all', 'pending', 'completed', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-warm-beige text-gray-600 hover:bg-warm-beige/70'
              }`}
            >
              {f === 'all' ? 'Tous' : statusLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-warm-beige overflow-hidden">
            <table className="w-full">
              <thead className="bg-warm-beige/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-anthracite uppercase">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-anthracite uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-anthracite uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-anthracite uppercase">Créé</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-anthracite uppercase">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-beige">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Aucune tâche IA. Cliquez sur les boutons ci-dessus pour générer du contenu.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const Icon = taskTypeIcons[task.task_type] || FileText
                    return (
                      <tr key={task.id} className="hover:bg-warm-beige/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-beige flex-shrink-0">
                              {task.products?.main_image ? (
                                <img src={task.products.main_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-anthracite line-clamp-1">
                              {task.products?.name || 'Produit inconnu'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{taskTypeLabels[task.task_type]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                            {statusLabels[task.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(task.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {task.estimated_cost ? `$${task.estimated_cost.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
