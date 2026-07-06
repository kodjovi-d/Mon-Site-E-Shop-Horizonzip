import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { CircleCheck as CheckCircle, Circle as XCircle, Eye, FileText, Image, Video, CircleHelp as HelpCircle, Search, ChevronLeft, ChevronRight, Loader as Loader2, ArrowRight, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface GensparkTask {
  id: string
  product_id: string | null
  task_type: 'seo' | 'description' | 'faq' | 'image' | 'video'
  status: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | 'error'
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  error_message: string | null
  created_at: string
  products?: {
    id: string
    name: string
    main_image: string | null
    description: string | null
    meta_title: string | null
    meta_description: string | null
  } | null
}

const taskTypeLabels: Record<string, string> = {
  seo: 'SEO Meta',
  description: 'Description',
  faq: 'FAQ',
  image: 'Images',
  video: 'Video',
}

const taskTypeIcons: Record<string, React.ElementType> = {
  seo: Search,
  description: FileText,
  faq: HelpCircle,
  image: Image,
  video: Video,
}

export default function AIValidation() {
  const [tasks, setTasks] = useState<GensparkTask[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('genspark_tasks')
      .select('id, product_id, task_type, status, input_data, output_data, error_message, created_at, products(id, name, main_image, description, meta_title, meta_description)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setTasks(data as GensparkTask[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleApprove = async (taskId: string, productId: string, taskType: string, outputData: Record<string, unknown> | null) => {
    if (!outputData) return
    setProcessing(taskId)

    try {
      if (taskType === 'seo' && productId) {
        await supabase
          .from('products')
          .update({
            meta_title: outputData.meta_title as string,
            meta_description: outputData.meta_description as string,
          })
          .eq('id', productId)
      } else if (taskType === 'description' && productId) {
        await supabase
          .from('products')
          .update({
            description: outputData.description as string,
            short_description: outputData.short_description as string,
          })
          .eq('id', productId)
      }

      await supabase
        .from('genspark_tasks')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', taskId)

      setTasks(prev => prev.filter(t => t.id !== taskId))
      if (currentIndex >= tasks.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1))
      }
    } catch (err) {
      console.error('Error approving:', err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (taskId: string) => {
    setProcessing(taskId)
    await supabase
      .from('genspark_tasks')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    if (currentIndex >= tasks.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1))
    }
    setProcessing(null)
  }

  const currentTask = tasks[currentIndex]
  const Icon = currentTask ? taskTypeIcons[currentTask.task_type] : FileText

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Validation IA | Admin E-Shop Horizon</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-anthracite">Validation du contenu IA</h1>
          <p className="text-gray-500 mt-1">{tasks.length} contenus en attente de validation</p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-warm-beige p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-anthracite mb-2">Tout est validé !</h2>
            <p className="text-gray-500">Aucun contenu IA en attente de validation.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{currentIndex + 1} / {tasks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg hover:bg-warm-beige disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentIndex(Math.min(tasks.length - 1, currentIndex + 1))}
                  disabled={currentIndex === tasks.length - 1}
                  className="p-2 rounded-lg hover:bg-warm-beige disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-warm-beige overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-warm-beige bg-warm-beige/30">
                {currentTask.products?.main_image && (
                  <img src={currentTask.products.main_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-anthracite">{currentTask.products?.name || 'Produit'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-500">{taskTypeLabels[currentTask.task_type]}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Avant (original)</h3>
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] text-sm text-gray-700 whitespace-pre-wrap">
                      {currentTask.products ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify({
                          name: currentTask.products.name,
                          description: currentTask.products.description,
                          meta_title: currentTask.products.meta_title,
                          meta_description: currentTask.products.meta_description,
                        }, null, 2)}</pre>
                      ) : (
                        <p className="text-gray-400 italic">Aucune donnée produit</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Apres (IA)</h3>
                    <div className="bg-purple-50 rounded-xl p-4 min-h-[200px] text-sm text-gray-700 whitespace-pre-wrap">
                      {currentTask.output_data ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(currentTask.output_data, null, 2)}</pre>
                      ) : (
                        <p className="text-gray-400 italic">Aucune sortie IA</p>
                      )}
                    </div>
                  </div>
                </div>

                {currentTask.error_message && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                    <strong>Erreur:</strong> {currentTask.error_message}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-warm-beige">
                  <button
                    onClick={() => handleReject(currentTask.id)}
                    disabled={processing === currentTask.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleApprove(currentTask.id, currentTask.product_id || '', currentTask.task_type, currentTask.output_data)}
                    disabled={processing === currentTask.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {processing === currentTask.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approuver et appliquer
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
