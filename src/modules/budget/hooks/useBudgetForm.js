import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { BudgetService } from "@/modules/budget/services/budgets"
import { AppointmentService } from "@/modules/appointment"
import { budgetSchema, budgetDefaults, toBudgetPayload, budgetKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// `clientId` / `vehicleId`: pré-preenchimento vindo, por exemplo, do botão
// "Fazer orçamento" na listagem de veículos.
// `appointmentId`: veio do atalho "Criar Orçamento" de um card de agendamento —
// depois de criar, liga o orçamento novo no agendamento (PATCH budget_id).
export function useBudgetForm({ clientId, vehicleId, appointmentId } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: budgetSchema,
    defaultValues: {
      ...budgetDefaults,
      business_id: businessId ? String(businessId) : "",
      ...(clientId ? { client_id: String(clientId) } : {}),
      ...(vehicleId ? { vehicle_id: String(vehicleId) } : {}),
    },
    submit: async (values) => {
      const budget = await BudgetService.createBudget(toBudgetPayload(values))
      if (appointmentId && budget?.id) {
        await AppointmentService.linkAppointment(appointmentId, { budget_id: budget.id })
      }
      return budget
    },
    // vai direto pro orçamento recém-criado pra adicionar produtos/serviços
    // (é a etapa "Prosseguir para Itens"); sem id, cai na listagem.
    redirectTo: (budget) => (budget?.id ? `/orcamentos/${budget.id}` : "/orcamentos"),
    invalidate: [budgetKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar orçamento",
  })
}
