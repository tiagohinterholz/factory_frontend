import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetSchema, budgetDefaults, toBudgetPayload } from "../budget.schema"

export function useBudgetForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: budgetSchema,
    defaultValues: {
      ...budgetDefaults,
      business_id: businessId ? String(businessId) : "",
    },
    submit: (values) => BudgetService.createBudget(toBudgetPayload(values)),
    redirectTo: "/orcamentos",
    errorFallback: "Erro ao criar orçamento",
  })
}
