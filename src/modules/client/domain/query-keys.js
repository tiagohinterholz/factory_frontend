// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar clientKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const clientKeys = {
  all: ["clients"],
  lists: () => [...clientKeys.all, "list"],
  list: (params) => [...clientKeys.lists(), params],
  detail: (id) => [...clientKeys.all, "detail", id],
}
