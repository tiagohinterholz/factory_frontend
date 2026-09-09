// Fonte única das query keys do módulo Agendamentos.
// (o wiring dos hooks deste módulo entra no commit dele; por ora só a raiz,
// que já é o que outras ações — finalizar OS, etc. — precisam invalidar.)
export const appointmentKeys = {
  all: ["appointments"],
  lists: () => [...appointmentKeys.all, "list"],
  list: (params) => [...appointmentKeys.lists(), params],
}
