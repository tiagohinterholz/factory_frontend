import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { StateService } from "../services/state"
import { stateSchema, stateDefaults } from "../state.schema"

export function useStateForm() {
  return useResourceForm({
    schema: stateSchema,
    defaultValues: stateDefaults,
    submit: (values) => StateService.createState(values),
    redirectTo: "/estados",
    errorFallback: "Erro ao criar estado",
  })
}
