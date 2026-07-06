import { Heart, Leaf, Shield, Truck } from 'lucide-react'
import { SEO } from '../seo/SEO'
import { generateOrganizationSchema } from '../seo/schemas'

export default function About() {
  const orgSchema: Record<string, unknown> = generateOrganizationSchema()

  return (
    <>
      <SEO
        title="À propos | E-Shop Horizon"
        description="Découvrez E-Shop Horizon, votre boutique spécialisée dans l'hygiène pour animaux."
        canonical="/a-propos"
      />

      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-anthracite mb-6 text-center">
          À propos d'E-Shop Horizon
        </h1>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center max-w-2xl mx-auto">
            E-Shop Horizon est une boutique en ligne spécialisée dans l'hygiène et la propreté pour animaux de compagnie. 
            Notre mission est d'offrir des produits de haute qualité pour le bien-être de vos compagnons à quatre pattes.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 my-12">
            {[
              {
                icon: Heart,
                title: 'Notre passion',
                description:
                  'Nous sommes des amoureux des animaux et cela se reflète dans la sélection rigoureuse de nos produits. Chaque article est testé et approuvé pour garantir la sécurité de vos compagnons.',
              },
              {
                icon: Shield,
                title: 'Notre engagement',
                description:
                  "Nous ne proposons que des produits sûrs, efficaces et respectueux de l'environnement. Votre tranquillité d'esprit est notre priorité.",
              },
              {
                icon: Leaf,
                title: 'Notre sélection',
                description:
                  'Des ingrédients naturels, des formules douces et des produits efficaces : c\'est la promesse que nous tenons pour chaque référence de notre catalogue.',
              },
              {
                icon: Truck,
                title: 'Notre service',
                description:
                  'Livraison rapide en France et en Europe, service client réactif et retours simplifiés : nous mettons tout en œuvre pour votre satisfaction.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-warm-beige p-6"
              >
                <item.icon className="h-8 w-8 text-cta-green mb-4" />
                <h3 className="font-display text-lg font-semibold text-anthracite mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-warm-beige/50 rounded-xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-anthracite mb-4">
              Pourquoi nous faire confiance ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-3xl font-bold text-cta-green mb-1">100%</div>
                <p className="text-sm text-gray-600">Produits vérifiés</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cta-green mb-1">24-48h</div>
                <p className="text-sm text-gray-600">Expédition rapide</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-cta-green mb-1">14 jours</div>
                <p className="text-sm text-gray-600">Pour retourner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
