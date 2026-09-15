// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar manufacturerKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const manufacturerKeys = {
  all: ["manufacturers"],
  lists: () => [...manufacturerKeys.all, "list"],
  list: (params) => [...manufacturerKeys.lists(), params],
  modelsByManufacturer: (manufacturerId) => [
    ...manufacturerKeys.all,
    "models",
    manufacturerId,
  ],
}
