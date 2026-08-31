import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/modules/core/feedback/ToastProvider"
import { AuthProvider } from "@/modules/auth/context/AuthProvider"
import { ConfirmProvider } from "@/modules/core/feedback/ConfirmProvider"

// Monta a UI dentro de todos os providers da app + um router em memória.
// queryClient novo por teste, sem retry (falha rápido).
export function renderWithProviders(ui, { route = "/", queryClient } = {}) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AuthProvider>
          <ConfirmProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </ConfirmProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  )
}
