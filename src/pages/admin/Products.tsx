import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Save, Loader as Loader2, ImagePlus, Star, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string | null
  price: number
  compare_price: number | null
  stock: number
  sku: string
  main_image: string | null
  images: string[] | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  badge: string | null
  weight: number | null
  weight_unit: string
  cj_product_id: string | null
  cj_stock_status: string | null
  cj_stock_checked_at: string | null
  created_at: string
}

const CJ_STOCK_LABELS: Record<string, { label: string; color: string }> = {
  empty:   { label: '🔴 Rupture',     color: 'bg-red-100 text-red-700 border-red-200' },
  low:     { label: '🟡 Faible',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  medium:  { label: '🟢 Disponible',  color: 'bg-green-100 text-green-700 border-green-200' },
  high:    { label: '🟢 Élevé',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  unknown: { label: '⚪ Inconnu',      color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

type FormData = Omit<Product, 'id' | 'created_at' | 'slug' | 'cj_product_id' | 'cj_stock_status' | 'cj_stock_checked_at'>

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  short_description: '',
  price: 0,
  compare_price: null,
  stock: 0,
  sku: '',
  main_image: '',
  images: [],
  category_id: null,
  is_active: true,
  is_featured: false,
  badge: '',
  weight: null,
  weight_unit: 'kg',
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [stockChecking, setStockChecking] = useState<string | null>(null)
  const [checkingAll, setCheckingAll] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id,name,slug,description,short_description,price,compare_price,stock,sku,main_image,images,category_id,is_active,is_featured,badge,weight,weight_unit,cj_product_id,cj_stock_status,cj_stock_checked_at,created_at')
      .order('created_at', { ascending: false })
    if (data) setProducts(data as Product[])
    setLoading(false)
  }, [])

  const checkCJStock = async (product: Product) => {
    if (!product.cj_product_id) return
    setStockChecking(product.id)
    try {
      const res = await fetch('/.netlify/functions/cj-stock-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || '',
        },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json() as { status?: string; quantity?: number }
      setProducts(prev => prev.map(p =>
        p.id === product.id
          ? { ...p, cj_stock_status: data.status || 'unknown', cj_stock_checked_at: new Date().toISOString() }
          : p
      ))
    } catch {
      // silently fail
    } finally {
      setStockChecking(null)
    }
  }

  const checkAllCJStock = async () => {
    setCheckingAll(true)
    try {
      const res = await fetch('/.netlify/functions/cj-stock-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET || '',
        },
        body: JSON.stringify({ checkAll: true }),
      })
      const data = await res.json() as { results?: Array<{ productId: string; status: string }> }
      if (data.results) {
        setProducts(prev => prev.map(p => {
          const result = data.results!.find(r => r.productId === p.id)
          return result ? { ...p, cj_stock_status: result.status, cj_stock_checked_at: new Date().toISOString() } : p
        }))
      }
    } catch {
      // silently fail
    } finally {
      setCheckingAll(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    supabase.from('categories').select('id,name,slug').order('position').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [fetchProducts])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description,
      short_description: product.short_description || '',
      price: product.price,
      compare_price: product.compare_price,
      stock: product.stock,
      sku: product.sku,
      main_image: product.main_image || '',
      images: product.images || [],
      category_id: product.category_id,
      is_active: product.is_active,
      is_featured: product.is_featured,
      badge: product.badge || '',
      weight: product.weight,
      weight_unit: product.weight_unit || 'kg',
    })
    setError('')
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { contentType: file.type })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filename)
      const url = urlData.publicUrl
      setForm((prev) => ({
        ...prev,
        main_image: url,
        images: [url, ...(prev.images || []).filter((img) => img !== url)],
      }))
    } catch (err) {
      setError("Erreur lors de l'upload de l'image.")
    } finally {
      setImageUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0) {
      setError('Nom, SKU et prix sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        slug: editing ? editing.slug : slugify(form.name.trim()),
        description: form.description,
        short_description: form.short_description || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock: Number(form.stock),
        sku: form.sku.trim(),
        main_image: form.main_image || null,
        images: form.images || [],
        category_id: form.category_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        badge: form.badge || null,
        weight: form.weight ? Number(form.weight) : null,
        weight_unit: form.weight_unit || 'kg',
      }

      if (editing) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert(payload)
        if (insertError) throw insertError
      }

      setShowModal(false)
      await fetchProducts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (product: Product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Helmet>
        <title>Admin — Produits | Horizon Pets</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-anthracite">Produits</h1>
            <p className="text-gray-500 mt-1">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={checkAllCJStock}
              disabled={checkingAll}
              title="Vérifier stock CJ pour tous les produits"
              className="inline-flex items-center gap-2 bg-white border border-warm-beige text-anthracite px-4 py-2.5 rounded-xl font-medium hover:bg-warm-beige/50 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
              {checkingAll ? 'Vérification...' : 'Stock CJ'}
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[#3D6B3D] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2D5016] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau produit
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher par nom ou SKU..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-beige bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] text-sm"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#3D6B3D]" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-beige overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-warm-beige/50 border-b border-warm-beige">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-anthracite">Produit</th>
                    <th className="px-4 py-3 text-left font-semibold text-anthracite hidden md:table-cell">SKU</th>
                    <th className="px-4 py-3 text-right font-semibold text-anthracite">Prix</th>
                    <th className="px-4 py-3 text-right font-semibold text-anthracite hidden sm:table-cell">Stock local</th>
                    <th className="px-4 py-3 text-center font-semibold text-anthracite hidden xl:table-cell">Stock CJ</th>
                    <th className="px-4 py-3 text-center font-semibold text-anthracite">Actif</th>
                    <th className="px-4 py-3 text-center font-semibold text-anthracite hidden lg:table-cell">Vedette</th>
                    <th className="px-4 py-3 text-center font-semibold text-anthracite">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-beige">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product) => (
                      <tr key={product.id} className="hover:bg-warm-beige/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-beige flex-shrink-0">
                              {product.main_image ? (
                                <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-anthracite line-clamp-1">{product.name}</p>
                              {product.badge && (
                                <span className="text-xs bg-[#B8E06A] text-[#2D5016] px-1.5 py-0.5 rounded-full font-medium">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">{product.sku}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-anthracite">{formatPrice(product.price)}</span>
                          {product.compare_price && product.compare_price > product.price && (
                            <span className="block text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span className={`font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-anthracite'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden xl:table-cell">
                          {product.cj_product_id ? (
                            <div className="flex flex-col items-center gap-1">
                              {product.cj_stock_status ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${(CJ_STOCK_LABELS[product.cj_stock_status] || CJ_STOCK_LABELS.unknown).color}`}>
                                  {(CJ_STOCK_LABELS[product.cj_stock_status] || CJ_STOCK_LABELS.unknown).label}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Non vérifié</span>
                              )}
                              <button
                                onClick={() => checkCJStock(product)}
                                disabled={stockChecking === product.id}
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 disabled:opacity-40"
                              >
                                <RefreshCw className={`h-3 w-3 ${stockChecking === product.id ? 'animate-spin' : ''}`} />
                                Actualiser
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleActive(product)} className="hover:opacity-80 transition-opacity">
                            {product.is_active ? (
                              <ToggleRight className="h-6 w-6 text-[#3D6B3D]" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          {product.is_featured && <Star className="h-4 w-4 text-amber-400 mx-auto fill-amber-400" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Oui
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-beige">
              <h2 className="font-display text-lg font-bold text-anthracite">
                {editing ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-warm-beige rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-anthracite mb-2">Image principale</label>
                <div className="flex items-start gap-4">
                  {form.main_image ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-warm-beige flex-shrink-0">
                      <img src={form.main_image} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm((p) => ({ ...p, main_image: '' }))}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-warm-beige flex items-center justify-center flex-shrink-0">
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-warm-beige hover:bg-sage/20 text-anthracite text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                      {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {imageUploading ? 'Upload en cours...' : 'Choisir un fichier'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
                    </label>
                    <p className="text-xs text-gray-400">ou coller une URL :</p>
                    <input
                      type="url"
                      value={form.main_image || ''}
                      onChange={(e) => setForm((p) => ({ ...p, main_image: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-anthracite mb-1.5">Nom du produit *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                  placeholder="Ex: Rouleau Anti-Poils Premium"
                />
              </div>

              {/* Short description */}
              <div>
                <label className="block text-sm font-medium text-anthracite mb-1.5">Description courte</label>
                <input
                  type="text"
                  value={form.short_description || ''}
                  onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                  placeholder="Résumé en une phrase"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-anthracite mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] resize-none"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              {/* Price + Compare price + SKU */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1.5">Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1.5">Prix barré (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compare_price ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, compare_price: e.target.value ? parseFloat(e.target.value) : null }))}
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1.5">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] font-mono"
                    placeholder="HP-001"
                  />
                </div>
              </div>

              {/* Stock + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1.5">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1.5">Catégorie</label>
                  <select
                    value={form.category_id || ''}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value || null }))}
                    className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] bg-white"
                  >
                    <option value="">Aucune catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-anthracite mb-1.5">Badge (ex: "Nouveau", "-20%")</label>
                <input
                  type="text"
                  value={form.badge || ''}
                  onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-warm-beige rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B3D]"
                  placeholder="Optionnel"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#3D6B3D]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-anthracite">Actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm((p) => ({ ...p, is_featured: !p.is_featured }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-amber-400' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-anthracite">Vedette (page d'accueil)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-warm-beige flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-warm-beige transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3D6B3D] text-white rounded-xl text-sm font-semibold hover:bg-[#2D5016] transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
