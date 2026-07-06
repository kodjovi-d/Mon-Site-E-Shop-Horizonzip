import { Leaf, Truck, Shield, Heart, Recycle, Award } from 'lucide-react'
import { SEO } from '../seo/SEO'

export default function Commitments() {
  return (
    <>
      <SEO
        title="Nos Engagements | E-Shop Horizon"
        description="Découvrez nos engagements qualité, environnement et service client."
        canonical="/engagements"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-anthracite mb-4 text-center">
          Nos engagements
        </h1>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Chez E-Shop Horizon, nous nous engageons au quotidien pour vous offrir les meilleurs produits 
          tout en respectant l'environnement et le bien-être animal.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Leaf,
              title: 'Produits éco-responsables',
              description:
                'Nous privilégions les produits aux ingrédients naturels et aux emballages recyclables pour réduire notre impact environnemental.',
            },
            {
              icon: Shield,
              title: 'Qualité certifiée',
              description:
                'Tous nos produits sont sélectionnés avec soin et proviennent de fournisseurs certifiés respectant les normes européennes.',
            },
            {
              icon: Heart,
              title: 'Bien-être animal',
              description:
                "La santé et le confort de votre animal sont notre priorité. Nous ne proposons que des produits sûrs et testés.",
            },
            {
              icon: Truck,
              title: 'Livraison responsable',
              description:
                'Nous optimisons nos expéditions pour réduire notre empreinte carbone tout en garantissant une livraison rapide.',
            },
            {
              icon: Recycle,
              title: 'Emballages recyclables',
              description:
                'Nous utilisons des emballages en matériaux recyclés et recyclables dans toute notre chaîne logistique.',
            },
            {
              icon: Award,
              title: 'Satisfaction garantie',
              description:
                "Si un produit ne vous convient pas, nous vous garantissons un remboursement ou un échange sous 14 jours.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-warm-beige p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-sage" />
              </div>
              <h3 className="font-display font-semibold text-anthracite mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
