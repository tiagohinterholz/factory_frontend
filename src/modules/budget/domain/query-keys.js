// Fonte única das query keys do módulo Orçamentos.
// (o wiring dos hooks deste módulo entra no commit dele; por ora só o
// suficiente pras ações de outros módulos invalidarem o que precisam.)
export const budgetKeys = {
  all: ["budgets"],
  lists: () => [...budgetKeys.all, "list"],
  list: (params) => [...budgetKeys.lists(), params],
  details: () => [...budgetKeys.all, "detail"],
  detail: (id) => [...budgetKeys.details(), id],
  pendingFor: (clientId, vehicleId) => [...budgetKeys.all, "pending-for", { clientId, vehicleId }],
}
