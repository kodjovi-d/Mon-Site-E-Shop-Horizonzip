import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck as CheckCircle, Heart, ChevronDown, ChevronUp, MessageSquare, Truck, Shield, RotateCcw, Headphones, Leaf } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ProductCard } from '../components/product/ProductCard'
import { SEO } from '../seo/SEO'
import { generateOrganizationSchema, generateWebSiteSchema } from '../seo/schemas'
import { formatPrice } from '../lib/utils'
import type { Product } from '../types/database'

interface Pack {
  id: string
  name: string
  slug: string
  description: string
  price: number
  original_price: number
  discount_percentage: number
  badge: string
  image: string
  is_most_popular: boolean
  product_slugs: string[]
}

const PACK_ITEMS: Record<string, string[]> = {
  'pack-anti-poils': ['Rouleau Anti-Poils', 'Gant de Brossage', 'Brosse Autonettoyante'],
  'pack-toilettage-premium': ['Lime Électrique LED', 'Brosse Autonettoyante', 'Lingettes Premium'],
  'pack-horizon-complet': ['La collection complète (5 produits)', 'Économie maximale', 'Livraison Express offerte'],
}

const PROBLEMS = [
  { emoji: '🧹', title: 'Poils partout', desc: 'Canapé, vêtements, voiture — éliminés en 30 secondes.' },
  { emoji: '✂️', title: 'Griffes douloureuses', desc: 'Notre lime électrique rogne sans stress ni douleur.' },
  { emoji: '💧', title: 'Bain stressant', desc: 'Nos lingettes nettoient sans eau, sans combat.' },
  { emoji: '🦮', title: 'Brosse qui arrache', desc: 'Démêlage doux, retractable, en 1 clic.' },
  { emoji: '💸', title: 'Toiletteur trop cher', desc: 'Professionnel à domicile pour moins de 15€/séance.' },
]

const FAQS = [
  {
    q: 'Comment suivre ma commande ?',
    a: 'Un numéro de suivi vous est envoyé par email dès l\'expédition de votre colis. Vous pouvez l\'utiliser sur notre page de suivi.',
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: 'Oui, vous avez 30 jours pour changer d\'avis. Le produit doit être dans son état d\'origine.',
  },
  {
    q: 'Les paiements sont-ils sécurisés ?',
    a: 'Absolument. Nous utilisons GeniusPay, une solution certifiée, pour garantir des transactions 100% sécurisées et chiffrées.',
  },
  {
    q: 'Les produits conviennent-ils aux chats et aux chiens ?',
    a: 'Oui, tous nos accessoires ont été testés et validés pour le confort des chats et des chiens de toutes tailles.',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Vous pouvez nous joindre 7j/7 via notre page contact ou par email à eshophorizon6@gmail.com.',
  },
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, packsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('packs')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true }),
        ])
        if (productsRes.data) setFeaturedProducts(productsRes.data)
        if (packsRes.data) setPacks(packsRes.data as Pack[])
      } catch (err) {
        console.error('Erreur chargement données:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setNewsletterStatus('loading')
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase(), source: 'home_newsletter' })
      if (error && error.code !== '23505') throw error
      setNewsletterStatus('success')
      setEmail('')
    } catch {
      setNewsletterStatus('error')
    }
  }

  const orgSchema = generateOrganizationSchema()
  const webSiteSchema = generateWebSiteSchema()

  const regularPacks = packs.filter((p) => !p.is_most_popular)
  const popularPack = packs.find((p) => p.is_most_popular)

  return (
    <>
      <SEO
        title="Horizon Pets | Hygiène Premium pour Chiens & Chats"
        description="Des accessoires intelligents pour réduire les poils, faciliter le toilettage et améliorer le bien-être de votre animal. Livraison express."
        canonical="/"
        ogType="website"
      />
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>

      {/* ── HERO ── */}
      <section className="bg-cream pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[#3D6B3D]/10 text-[#3D6B3D] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Innovation Bien-Être
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-anthracite leading-tight mb-6">
            Prenez soin de votre compagnon sans stress ni complications.
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Des accessoires intelligents pour réduire les poils, faciliter le toilettage et améliorer le bien-être de votre animal au quotidien.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link
              to="/produits"
              className="inline-flex items-center gap-2 bg-[#3D6B3D] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#2D5016] transition-colors text-base"
            >
              Découvrir la collection
            </Link>
            <Link
              to="/produits?sort=popular"
              className="inline-flex items-center gap-2 border-2 border-[#3D6B3D] text-[#3D6B3D] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#3D6B3D]/5 transition-colors text-base"
            >
              Voir les meilleures ventes
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {['Paiement sécurisé', 'Livraison suivie', 'Support client réactif', 'Garantie satisfaction'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#3D6B3D]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-8 w-8 text-[#3D6B3D] mx-auto mb-4 fill-[#3D6B3D]/20" />
          <h2 className="font-display text-2xl font-bold text-anthracite mb-4">Notre mission</h2>
          <blockquote className="text-gray-600 text-lg leading-relaxed">
            "Chez <span className="text-[#3D6B3D] font-semibold">Horizon Pets</span>, nous sélectionnons des accessoires simples, efficaces et confortables pour aider les propriétaires à prendre soin de leurs animaux sans stress.
            <br /><br />
            Nous croyons qu'un animal heureux rend une maison plus heureuse."
          </blockquote>
        </div>
      </section>

      {/* ── PROBLEM CARDS ── */}
      <section className="py-16 bg-warm-beige/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-anthracite mb-2">Vous reconnaissez-vous ?</h2>
            <p className="text-gray-500">Ces problèmes du quotidien ont une solution simple.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-display font-bold text-anthracite text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKS ── */}
      <section id="packs" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-anthracite mb-2">Nos offres exclusives</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Des économies importantes et des combinaisons pensées par des experts pour votre compagnon.</p>
            <Link to="/produits" className="inline-flex items-center gap-1 text-[#3D6B3D] text-sm font-semibold mt-2 hover:underline">
              Voir toutes les offres <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D6B3D]" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top 2 packs side by side */}
              {regularPacks.length > 0 && (
                <div className="grid md:grid-cols-2 gap-5">
                  {regularPacks.map((pack) => (
                    <div key={pack.id} className="bg-white border border-warm-beige rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {pack.badge && (
                        <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                          {pack.badge}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-anthracite text-xl mb-4">{pack.name}</h3>
                      <ul className="space-y-2 mb-6">
                        {(PACK_ITEMS[pack.slug] || []).map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-[#3D6B3D] flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-baseline gap-2 mb-5">
                        <span className="font-bold text-3xl text-anthracite">{formatPrice(pack.price)}</span>
                        <span className="text-gray-400 line-through text-base">{formatPrice(pack.original_price)}</span>
                      </div>
                      <Link
                        to={`/produits?pack=${pack.slug}`}
                        className="block text-center bg-[#3D6B3D] text-white font-semibold py-3 rounded-xl hover:bg-[#2D5016] transition-colors"
                      >
                        Découvrir le Pack
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Most popular pack — full width, gold */}
              {popularPack && (
                <div className="relative bg-white border-2 border-[#C9A84C] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block bg-[#C9A84C] text-white text-xs font-bold px-3 py-1 rounded-full">
                      LE PLUS POPULAIRE
                    </span>
                    <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {popularPack.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-anthracite text-2xl mb-4">{popularPack.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {(PACK_ITEMS[popularPack.slug] || []).map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <Leaf className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="font-bold text-3xl text-anthracite">{formatPrice(popularPack.price)}</span>
                    <span className="text-gray-400 line-through text-base">{formatPrice(popularPack.original_price)}</span>
                  </div>
                  <Link
                    to={`/produits?pack=${popularPack.slug}`}
                    className="inline-block text-center bg-[#C9A84C] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#b8963e] transition-colors text-base"
                  >
                    Je veux le Pack Complet
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY TRUST ── */}
      <section className="py-16 bg-[#2D4A2D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12 italic">
            Pourquoi nous faire confiance ?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {[
              { icon: Leaf, label: 'Produits sélectionnés avec soin' },
              { icon: Shield, label: 'Paiement 100% sécurisé' },
              { icon: Headphones, label: 'Assistance rapide 7j/7' },
              { icon: RotateCcw, label: 'Garantie satisfaction 30j' },
              { icon: Truck, label: 'Livraison suivie offerte dès 35€' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white/70" />
                </div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-anthracite mb-1">Produits populaires</h2>
              <p className="text-gray-500 text-sm">Les favoris de nos clients</p>
            </div>
            <Link to="/produits" className="hidden sm:inline-flex items-center gap-1.5 text-[#3D6B3D] font-semibold text-sm hover:underline">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D6B3D]" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Aucun produit disponible.</p>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/produits" className="inline-flex items-center gap-2 bg-[#3D6B3D] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors">
              Tous nos produits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-anthracite text-center mb-10">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-warm-beige rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-warm-beige/30 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-[#3D6B3D] flex-shrink-0" />
                  <span className="font-medium text-anthracite text-sm flex-1">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-warm-beige">
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm">
            <Link to="/contact" className="text-[#3D6B3D] font-semibold hover:underline">
              Vous avez une autre question ? Contactez-nous
            </Link>
          </p>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-16 bg-[#5B8C5A]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block border border-white/40 text-white text-xs font-semibold px-4 py-1 rounded-full mb-5">
            Newsletter Privée
          </span>
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Rejoignez la famille Horizon Pets
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Rejoignez 10 000+ propriétaires et recevez -10% sur votre première commande ainsi que nos meilleurs conseils bien-être.
          </p>
          {newsletterStatus === 'success' ? (
            <div className="bg-white/20 rounded-2xl px-6 py-4 text-white font-semibold">
              Merci ! Votre -10% arrive dans votre boîte mail.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                className="flex-1 px-5 py-3.5 rounded-xl text-anthracite placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-[#C9A84C] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#b8963e] transition-colors disabled:opacity-60 whitespace-nowrap text-sm"
              >
                {newsletterStatus === 'loading' ? 'En cours...' : 'Profiter de mes -10%'}
              </button>
            </form>
          )}
          {newsletterStatus === 'error' && (
            <p className="text-red-200 text-sm mt-3">Une erreur est survenue. Réessayez.</p>
          )}
          <p className="text-white/50 text-xs mt-5">
            En vous inscrivant, vous rejoignez notre liste VIP. Désinscription possible à tout moment.
          </p>
        </div>
      </section>
    </>
  )
}
