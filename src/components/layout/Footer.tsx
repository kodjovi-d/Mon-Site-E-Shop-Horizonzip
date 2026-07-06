import { Link } from 'react-router-dom'
import { PawPrint, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-anthracite text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#3D6B3D] flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">Horizon Pets</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Innovation et bien-être pour vos animaux. Des produits d'hygiène premium pour une vie plus saine et heureuse.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Liens Rapides
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Nos produits', href: '/produits' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'Nos engagements', href: '/engagements' },
                { label: 'Suivi de commande', href: '/suivi' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-[#C9A84C] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Mentions légales', href: '/mentions-legales' },
                { label: 'Politique de confidentialité', href: '/confidentialite' },
                { label: 'CGV', href: '/cgv' },
                { label: 'Retours et remboursements', href: '/retours' },
                { label: 'Expédition', href: '/expedition' },
                { label: 'Cookies', href: '/cookies' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-[#C9A84C] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9A84C]" />
                <span>eshophorizon6@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9A84C]" />
                <span>Europe — Livraison internationale</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9A84C]" />
                <span>Service client par email</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Horizon Pets. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
