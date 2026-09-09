import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { BusinessService } from "@/modules/business/services/business"
import { businessSchema, businessDefaults, toBusinessPayload, businessKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

export function useBusinessForm() {
  return useResourceForm({
    schema: businessSchema,
    defaultValues: businessDefaults,
    submit: (values) => BusinessService.createBusiness(toBusinessPayload(values)),
    redirectTo: "/empreendimentos",
    invalidate: [businessKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar empreendimento",
  })
}
