import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

const PENDING_STATES = ["pending", "processing"]

// Estado da NFS-e de uma ordem. GET dá 404 quando nunca foi solicitada
// (tratado como `null`). Enquanto está `pending`/`processing`, refaz a cada 3s.
export function useServiceFiscalNote(orderId, { enabled = true } = {}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const queryKey = orderKeys.serviceFiscalNote(orderId)

  const query = useQuery({
    queryKey,
    enabled: enabled && Boolean(orderId),
    retry: false,
    queryFn: async () => {
      try {
        return await OrderService.getServiceFiscalNote(orderId)
      } catch (error) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    refetchInterval: (currentQuery) =>
      PENDING_STATES.includes(currentQuery.state.data?.status) ? 3000 : false,
  })

  const emission = useMutation({
    mutationFn: () => OrderService.requestServiceFiscalNote(orderId),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
    onError: (error) =>
      toast.error(parseApiError(error, "Não foi possível solicitar a NFS-e.").message),
  })

  return {
    note: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    emit: emission.mutate,
    emitting: emission.isPending,
  }
}
