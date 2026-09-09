// Fonte única das query keys do módulo Ordens. Hierárquico por prefixo:
// invalidar orderKeys.all pega a listagem, os detalhes e a NF-e;
// orderKeys.lists() pega só as listagens. Padrão "query key factory"
// (doc do TanStack Query).
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (params) => [...orderKeys.lists(), params],
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],
  fiscalNote: (id) => [...orderKeys.detail(id), "fiscal-note"],
}
