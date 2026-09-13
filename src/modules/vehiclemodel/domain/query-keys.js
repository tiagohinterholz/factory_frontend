// Fonte única das query keys do módulo. Hierárquico por prefixo:
// invalidar vehicleModelKeys.all pega a listagem e os detalhes. Padrão "query key factory".
export const vehicleModelKeys = {
  all: ["vehicle-models"],
  lists: () => [...vehicleModelKeys.all, "list"],
  list: (params) => [...vehicleModelKeys.lists(), params],
}
