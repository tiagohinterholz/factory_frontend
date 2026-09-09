import { useQuery } from "@tanstack/react-query"
import { BudgetService } from "@/modules/budget"
import { budgetKeys, BUDGET_STATUS } from "@/modules/budget/domain"

// Orçamentos pendentes de um par cliente+veículo, pra usar como base ao criar
// uma OS. Só busca quando os dois ids estão definidos. Traz só a 1ª página —
// é raro um mesmo cliente/veículo ter dezenas de orçamentos pendentes abertos.
export function usePendingBudgets(clientId, vehicleId) {
  const enabled = Boolean(clientId && vehicleId)

  const query = useQuery({
    queryKey: budgetKeys.pendingFor(clientId, vehicleId),
    queryFn: () =>
      BudgetService.getBudget({
        client_id: clientId,
        vehicle_id: vehicleId,
        status: BUDGET_STATUS.PENDING,
      }),
    enabled,
    select: (data) => data?.results ?? [],
  })

  return { budgets: query.data ?? [], loading: enabled && query.isPending }
}
