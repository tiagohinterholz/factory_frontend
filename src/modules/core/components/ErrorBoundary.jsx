import { Component } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

// Precisa ser classe: getDerivedStateFromError / componentDidCatch não têm
// equivalente em hooks. Só pega erro de render/lifecycle — erro em handler
// ou em código assíncrono NÃO passa por aqui (isso é try/catch + estado de erro).
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturou:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Algo deu errado nesta tela</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tente recarregar. Se o problema continuar, avise o suporte.
          </p>
          {import.meta.env.DEV && this.state.error?.message && (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </button>
        </div>
      </div>
    )
  }
}
