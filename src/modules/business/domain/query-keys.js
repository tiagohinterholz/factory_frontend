// Fonte única das query keys do módulo Empreendimentos. Hierárquico por prefixo:
// invalidar businessKeys.all pega a listagem e os detalhes. Padrão "query key
// factory".
export const businessKeys = {
  all: ["businesses"],
  lists: () => [...businessKeys.all, "list"],
  list: (params) => [...businessKeys.lists(), params],
  detail: (id) => [...businessKeys.all, "detail", id],
}
