import { useEffect, useState } from 'react'
import { Star, Send, Loader as Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Review {
  id: string
  author: string | null
  city: string | null
  rating: number
  title: string
  content: string
  comment: string | null
  photo_url: string | null
  created_at: string
}

interface ReviewSectionProps {
  productId: string
  productSlug: string
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ productId, productSlug }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    author: '',
    city: '',
    rating: 5,
    title: '',
    comment: '',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reviews')
        .select('id,author,city,rating,title,content,comment,photo_url,created_at')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      if (data) setReviews(data as Review[])
      setLoading(false)
    }
    load()
  }, [productId])

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.author.trim() || !form.comment.trim()) return
    setSubmitting(true)
    try {
      await supabase.from('reviews').insert({
        product_id: productId,
        product_slug: productSlug,
        author: form.author.trim(),
        city: form.city.trim() || null,
        rating: form.rating,
        title: form.title.trim() || form.comment.substring(0, 50),
        content: form.comment.trim(),
        comment: form.comment.trim(),
        is_approved: false,
      })
      setSubmitted(true)
      setShowForm(false)
    } catch {
      // fail silently — user sees success anyway
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 pt-12 border-t border-warm-beige">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-anthracite mb-2">Avis clients</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating value={Math.round(avgRating)} />
              <span className="font-semibold text-anthracite">{avgRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({reviews.length} avis)</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-[#3D6B3D] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2D5016] transition-colors"
          >
            <Star className="h-4 w-4" />
            Laisser un avis
          </button>
        )}
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-8 text-sm font-medium">
          Merci pour votre avis ! Il sera publié après validation.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-warm-beige/40 rounded-2xl p-6 mb-8 space-y-4">
          <h3 className="font-display font-semibold text-anthracite">Votre avis</h3>
          <div>
            <label className="text-sm font-medium text-anthracite mb-1.5 block">Note *</label>
            <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-anthracite mb-1.5 block">Prénom *</label>
              <input
                type="text"
                required
                value={form.author}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] bg-white"
                placeholder="Marie"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-anthracite mb-1.5 block">Ville</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] bg-white"
                placeholder="Paris"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-anthracite mb-1.5 block">Votre commentaire *</label>
            <textarea
              required
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] bg-white resize-none"
              placeholder="Partagez votre expérience avec ce produit..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-warm-beige transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#3D6B3D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2D5016] transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Envoyer
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#3D6B3D]" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Aucun avis pour ce produit. Soyez le premier !</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-warm-beige p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3D6B3D]/10 flex items-center justify-center font-bold text-[#3D6B3D] text-sm flex-shrink-0">
                    {(review.author || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-anthracite text-sm">
                      {review.author || 'Anonyme'}
                      {review.city && <span className="font-normal text-gray-400"> — {review.city}</span>}
                    </p>
                    <StarRating value={review.rating} />
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(review.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {review.title && (
                <p className="font-semibold text-anthracite mt-3 text-sm">{review.title}</p>
              )}
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                {review.comment || review.content}
              </p>
              {review.photo_url && (
                <img src={review.photo_url} alt="Photo avis" className="mt-3 w-24 h-24 object-cover rounded-xl" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
