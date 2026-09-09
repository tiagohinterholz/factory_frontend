// Fonte única das query keys do módulo Agendamentos. Hierárquico por prefixo:
// invalidar appointmentKeys.all pega todas as listagens (o board do dashboard
// lê essa mesma raiz). Padrão "query key factory".
export const appointmentKeys = {
  all: ["appointments"],
  lists: () => [...appointmentKeys.all, "list"],
  list: (params) => [...appointmentKeys.lists(), params],
}
