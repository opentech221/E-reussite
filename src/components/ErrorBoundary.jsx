import React from 'react';

/**
 * ErrorBoundary pour capturer les erreurs React
 * Empêche l'écran blanc en cas d'erreur dans un composant
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 [ErrorBoundary] Erreur capturée:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 [ErrorBoundary] Détails erreur:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback en cas d'erreur
      return (
        <div className="fixed bottom-4 right-4 bg-red-50 border-2 border-red-300 rounded-lg p-4 max-w-md shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">
                Erreur du composant
              </h3>
              <p className="text-sm text-red-700 mb-2">
                {this.props.componentName || 'Un composant'} a rencontré une erreur.
              </p>
              {this.state.error && (
                <details className="text-xs text-red-600 bg-red-100 p-2 rounded mt-2">
                  <summary className="cursor-pointer font-semibold">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
