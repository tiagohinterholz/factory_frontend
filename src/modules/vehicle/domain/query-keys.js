// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar vehicleKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const vehicleKeys = {
  all: ["vehicles"],
  lists: () => [...vehicleKeys.all, "list"],
  list: (params) => [...vehicleKeys.lists(), params],
  detail: (id) => [...vehicleKeys.all, "detail", id],
  byClient: (clientId) => [...vehicleKeys.all, "by-client", clientId],
  orders: (vehicleId) => ["vehicle-orders", vehicleId],
  budgets: (vehicleId) => ["vehicle-budgets", vehicleId],
}
