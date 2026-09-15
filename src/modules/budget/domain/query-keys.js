// Fonte única das query keys do módulo Orçamentos. Hierárquico por prefixo:
// invalidar budgetKeys.all pega a listagem, os detalhes, a lista de pendentes
// por cliente+veículo (usePendingBudgets) e o histórico por veículo
// (byVehicle). Padrão "query key factory".
export const budgetKeys = {
  all: ["budgets"],
  lists: () => [...budgetKeys.all, "list"],
  list: (params) => [...budgetKeys.lists(), params],
  details: () => [...budgetKeys.all, "detail"],
  detail: (id) => [...budgetKeys.details(), id],
  pendingFor: (clientId, vehicleId) => [...budgetKeys.all, "pending-for", { clientId, vehicleId }],
  byVehicle: (vehicleId) => [...budgetKeys.all, "by-vehicle", vehicleId],
}
