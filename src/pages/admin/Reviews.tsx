import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Check, X, Trash2, Star, Loader as Loader2, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Review {
  id: string
  product_id: string
  product_slug: string | null
  author: string | null
  city: string | null
  rating: number
  title: string
  content: string
  comment: string | null
  is_approved: boolean
  is_verified_purchase: boolean | null
  created_at: string
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('reviews')
      .select('id,product_id,product_slug,author,city,rating,title,content,comment,is_approved,is_verified_purchase,created_at')
      .order('created_at', { ascending: false })

    if (filter === 'pending') query = query.eq('is_approved', false)
    else if (filter === 'approved') query = query.eq('is_approved', true)

    const { data } = await query
    if (data) setReviews(data as Review[])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const approve = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: true } : r))
  }

  const reject = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: false }).eq('id', id)
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: false } : r))
  }

  const remove = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setDeleteConfirm(null)
  }

  const filtered = reviews.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.author || '').toLowerCase().includes(q) ||
      (r.comment || r.content || '').toLowerCase().includes(q) ||
      (r.product_slug || '').toLowerCase().includes(q)
    )
  })

  const pendingCount = reviews.filter((r) => !r.is_approved).length

  return (
    <>
      <Helmet>
        <title>Admin — Avis | Horizon Pets</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-anthracite">Avis clients</h1>
          {pendingCount > 0 && (
            <p className="text-amber-600 font-medium mt-1 text-sm">
              {pendingCount} avis en attente de modération
            </p>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex rounded-xl border border-warm-beige overflow-hidden bg-white text-sm font-medium">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 transition-colors ${filter === f ? 'bg-[#3D6B3D] text-white' : 'text-gray-600 hover:bg-warm-beige'}`}
              >
                {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Approuvés'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher..."
              className="pl-9 pr-4 py-2 border border-warm-beige rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#3D6B3D]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun avis trouvé</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border p-5 ${!review.is_approved ? 'border-amber-200 bg-amber-50/30' : 'border-warm-beige'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-anthracite text-sm">
                        {review.author || 'Anonyme'}
                        {review.city && <span className="font-normal text-gray-400"> — {review.city}</span>}
                      </span>
                      <Stars value={review.rating} />
                      {!review.is_approved && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          En attente
                        </span>
                      )}
                      {review.is_approved && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Approuvé
                        </span>
                      )}
                    </div>
                    {review.product_slug && (
                      <p className="text-xs text-gray-400 mb-1">Produit : {review.product_slug}</p>
                    )}
                    {review.title && (
                      <p className="font-semibold text-anthracite text-sm mb-1">{review.title}</p>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment || review.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.is_approved && (
                      <button
                        onClick={() => approve(review.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approuver"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    {review.is_approved && (
                      <button
                        onClick={() => reject(review.id)}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Désapprouver"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {deleteConfirm === review.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => remove(review.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg">
                          Oui
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg">
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
