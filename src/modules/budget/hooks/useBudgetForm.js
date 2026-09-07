import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetSchema, budgetDefaults, toBudgetPayload } from "../budget.schema"

// `clientId` / `vehicleId`: pré-preenchimento vindo, por exemplo, do botão
// "Fazer orçamento" na listagem de veículos.
export function useBudgetForm({ clientId, vehicleId } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: budgetSchema,
    defaultValues: {
      ...budgetDefaults,
      business_id: businessId ? String(businessId) : "",
      ...(clientId ? { client_id: String(clientId) } : {}),
      ...(vehicleId ? { vehicle_id: String(vehicleId) } : {}),
    },
    submit: (values) => BudgetService.createBudget(toBudgetPayload(values)),
    // vai direto pro orçamento recém-criado pra adicionar produtos/serviços
    // (é a etapa "Prosseguir para Itens"); sem id, cai na listagem.
    redirectTo: (budget) => (budget?.id ? `/orcamentos/${budget.id}` : "/orcamentos"),
    errorFallback: "Erro ao criar orçamento",
  })
}
