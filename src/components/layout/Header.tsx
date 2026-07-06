import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search, PawPrint, SlidersHorizontal } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { cn } from '../../lib/utils'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Produits', href: '/produits' },
    { label: 'Packs', href: '/#packs' },
    { label: 'À propos', href: '/a-propos' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-warm-beige shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#3D6B3D] flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-anthracite leading-none">
                Horizon Pets
              </span>
              <span className="block text-[10px] text-[#5B8C5A] font-medium tracking-wide uppercase -mt-0.5">
                Hygiène Premium
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-anthracite hover:text-[#3D6B3D] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#3D6B3D] group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-anthracite hover:text-[#3D6B3D] hover:bg-warm-beige rounded-lg transition-all"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Filter (links to products with filters) */}
            <Link
              to="/produits"
              className="hidden sm:flex p-2.5 text-anthracite hover:text-[#3D6B3D] hover:bg-warm-beige rounded-lg transition-all"
              aria-label="Filtrer les produits"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/panier"
              className="relative p-2.5 text-anthracite hover:text-[#3D6B3D] hover:bg-warm-beige rounded-lg transition-all"
              aria-label="Panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#3D6B3D] text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none px-1">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-anthracite hover:text-[#3D6B3D] hover:bg-warm-beige rounded-lg transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 bg-white border-b border-warm-beige',
          searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-beige bg-cream focus:outline-none focus:ring-2 focus:ring-[#3D6B3D] focus:border-transparent text-sm"
              autoFocus={searchOpen}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value
                  if (query.trim()) {
                    setSearchOpen(false)
                    navigate(`/produits?q=${encodeURIComponent(query.trim())}`)
                  }
                }
                if (e.key === 'Escape') setSearchOpen(false)
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 bg-white border-b border-warm-beige',
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-anthracite hover:bg-warm-beige hover:text-[#3D6B3D] transition-colors font-medium text-sm"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-warm-beige mt-2">
            <Link
              to="/panier"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-anthracite hover:bg-warm-beige hover:text-[#3D6B3D] transition-colors font-medium text-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Panier
              {totalItems > 0 && (
                <span className="ml-auto bg-[#3D6B3D] text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
