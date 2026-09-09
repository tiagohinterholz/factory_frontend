// Query keys do módulo Estados. Padrão "query key factory".
export const stateKeys = {
  all: ["states"],
  lists: () => [...stateKeys.all, "list"],
  list: (params) => [...stateKeys.lists(), params],
}
