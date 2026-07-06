import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-4xl font-display text-anthracite mb-4">Oups !</h1>
            <p className="text-sage mb-2">Une erreur est survenue.</p>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.error?.message || 'Erreur inconnue'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="inline-flex items-center px-6 py-3 bg-cta-green text-white rounded-lg font-medium hover:bg-cta-green/90 transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
