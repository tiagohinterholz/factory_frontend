// Query keys do módulo Cidades. Hierárquico: invalidar cityKeys.all pega a
// listagem e as cidades por estado. Padrão "query key factory".
export const cityKeys = {
  all: ["cities"],
  lists: () => [...cityKeys.all, "list"],
  list: (params) => [...cityKeys.lists(), params],
  byState: (stateId) => [...cityKeys.all, "by-state", stateId],
}
