// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar workServiceKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const workServiceKeys = {
  all: ["workservices"],
  lists: () => [...workServiceKeys.all, "list"],
  list: (params) => [...workServiceKeys.lists(), params],
  detail: (id) => [...workServiceKeys.all, "detail", id],
  bySupplier: (supplierId) => ["services", "by-supplier", supplierId],
}
