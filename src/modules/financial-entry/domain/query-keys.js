// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar financialEntryKeys.all pega a listagem e os detalhes. Padrão
// "query key factory".
export const financialEntryKeys = {
  all: ["financial-entries"],
  lists: () => [...financialEntryKeys.all, "list"],
  list: (params) => [...financialEntryKeys.lists(), params],
  details: () => [...financialEntryKeys.all, "detail"],
  detail: (id) => [...financialEntryKeys.details(), id],
}
