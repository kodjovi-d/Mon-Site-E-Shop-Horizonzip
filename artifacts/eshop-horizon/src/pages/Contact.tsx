import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { z } from 'zod'
import { Mail, MapPin, Clock, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { SITE_CONFIG } from '../lib/constants'

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrors({})

    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'envoi')

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact | E-Shop Horizon</title>
        <meta name="description" content="Contactez l'équipe E-Shop Horizon." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-anthracite mb-2 text-center">
          Contactez-nous
        </h1>
        <p className="text-gray-500 text-center mb-10">
          Une question ? Nous sommes là pour vous aider.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-anthracite">Email</h3>
                <p className="text-sm text-gray-500">{SITE_CONFIG.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-anthracite">Localisation</h3>
                <p className="text-sm text-gray-500">Europe</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-sage" />
              </div>
              <div>
                <h3 className="font-medium text-anthracite">Délai de réponse</h3>
                <p className="text-sm text-gray-500">Sous 24-48h ouvrées</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-cta-green/10 rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-cta-green mx-auto mb-4" />
                <h2 className="font-display text-xl font-semibold text-anthracite mb-2">
                  Message envoyé !
                </h2>
                <p className="text-gray-600">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-anthracite mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-cta-green ${
                        errors.name ? 'border-red-300' : 'border-warm-beige'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-anthracite mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-cta-green ${
                        errors.email ? 'border-red-300' : 'border-warm-beige'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-cta-green ${
                      errors.subject ? 'border-red-300' : 'border-warm-beige'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-anthracite mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-cta-green resize-none ${
                      errors.message ? 'border-red-300' : 'border-warm-beige'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
