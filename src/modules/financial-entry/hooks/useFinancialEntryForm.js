import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { FinancialEntryService } from "@/modules/financial-entry/services/financial-entry"
import { dashboardKeys } from "@/modules/dashboard/domain"
import {
  financialEntrySchema,
  financialEntryDefaults,
  toFinancialEntryPayload,
  financialEntryKeys,
} from "../domain"

export function useFinancialEntryForm() {
  return useResourceForm({
    schema: financialEntrySchema,
    defaultValues: financialEntryDefaults,
    submit: (values) => FinancialEntryService.createFinancialEntry(toFinancialEntryPayload(values)),
    redirectTo: "/financeiro",
    invalidate: [financialEntryKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar lançamento",
  })
}
