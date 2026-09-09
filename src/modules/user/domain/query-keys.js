// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar userKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (params) => [...userKeys.lists(), params],
  detail: (id) => [...userKeys.all, "detail", id],
}
