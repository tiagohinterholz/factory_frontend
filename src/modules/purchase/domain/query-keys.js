// Fonte única das query keys do módulo Compras. Hierárquico por prefixo:
// invalidar purchaseOrderKeys.all pega listagem e detalhes. Padrão "query
// key factory" (mesmo de budget/order/financial-entry).
export const purchaseOrderKeys = {
  all: ["purchase-orders"],
  lists: () => [...purchaseOrderKeys.all, "list"],
  list: (params) => [...purchaseOrderKeys.lists(), params],
  details: () => [...purchaseOrderKeys.all, "detail"],
  detail: (id) => [...purchaseOrderKeys.details(), id],
}

export const stockMovementKeys = {
  all: ["stock-movements"],
  list: (params) => [...stockMovementKeys.all, "list", params],
}
