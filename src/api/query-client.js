import { QueryClient } from "@tanstack/react-query"

// Cache central do TanStack Query. Uma instância pra app toda.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s "fresco": voltar pra tela nesse intervalo = instantâneo, sem request
      retry: 1,
      refetchOnWindowFocus: false, // o app ainda não está afinado pra refetch agressivo
    },
  },
})
