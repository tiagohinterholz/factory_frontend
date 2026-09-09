// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar productKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (params) => [...productKeys.lists(), params],
  detail: (id) => [...productKeys.all, "detail", id],
  bySupplier: (supplierId) => [...productKeys.all, "by-supplier", supplierId],
}
