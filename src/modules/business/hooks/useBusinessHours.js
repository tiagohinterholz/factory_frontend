import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BusinessService } from "@/modules/business/services/business"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

// Os 7 registros de horário de funcionamento do próprio negócio (um por dia
// da semana, weekday 0=segunda ... 6=domingo). PATCH é por dia individual.
// Sem business_id na URL — sempre "o meu negócio", resolvido pelo token.
export function useBusinessHours() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const queryKey = ["business-hours", "mine"]

  const query = useQuery({
    queryKey,
    queryFn: () => BusinessService.getSelfHours(),
  })

  const mutation = useMutation({
    mutationFn: ({ weekday, payload }) => BusinessService.updateSelfHour(weekday, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, (current) =>
        (current ?? []).map((hour) => (hour.weekday === updated.weekday ? updated : hour)),
      )
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Não foi possível salvar o horário.").message)
    },
  })

  const hours = [...(query.data ?? [])].sort((a, b) => a.weekday - b.weekday)

  return {
    hours,
    loading: query.isPending,
    error: query.error ?? null,
    updateHour: (weekday, payload) => mutation.mutateAsync({ weekday, payload }),
    savingWeekday: mutation.isPending ? mutation.variables?.weekday : null,
  }
}
