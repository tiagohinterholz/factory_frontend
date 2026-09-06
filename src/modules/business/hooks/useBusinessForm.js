import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { BusinessService } from "@/modules/business/services/business"
import { businessSchema, businessDefaults, toBusinessPayload } from "../business.schema"

export function useBusinessForm() {
  return useResourceForm({
    schema: businessSchema,
    defaultValues: businessDefaults,
    submit: (values) => BusinessService.createBusiness(toBusinessPayload(values)),
    redirectTo: "/empreendimentos",
    errorFallback: "Erro ao criar empreendimento",
  })
}
