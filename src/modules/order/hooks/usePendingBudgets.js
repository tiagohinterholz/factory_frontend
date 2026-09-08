import { useQuery } from "@tanstack/react-query"
import { BudgetService } from "@/modules/budget/services/budgets"

// Orçamentos pendentes de um par cliente+veículo, pra usar como base ao criar
// uma OS. Só busca quando os dois ids estão definidos. Traz só a 1ª página —
// é raro um mesmo cliente/veículo ter dezenas de orçamentos pendentes abertos.
export function usePendingBudgets(clientId, vehicleId) {
  const enabled = Boolean(clientId && vehicleId)

  const query = useQuery({
    queryKey: ["budgets", "pending-for", { clientId, vehicleId }],
    queryFn: () =>
      BudgetService.getBudget({
        client_id: clientId,
        vehicle_id: vehicleId,
        status: "pendente",
      }),
    enabled,
    select: (data) => data?.results ?? [],
  })

  return { budgets: query.data ?? [], loading: enabled && query.isPending }
}
