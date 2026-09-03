import { useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { StateService } from "../services/state"
import { stateSchema, stateDefaults } from "../state.schema"

export function useStateEditForm() {
  const { id } = useParams()

  return useResourceForm({
    schema: stateSchema,
    defaultValues: stateDefaults,
    load: async () => {
      const data = await StateService.getState(id)
      return {
        name: data.name ?? "",
        abbreviation: data.abbreviation ?? "",
        is_active: data.is_active ?? true,
      }
    },
    // PATCH grava só is_active; name/abbreviation são somente-leitura no backend.
    submit: (values) => StateService.updateState(id, { is_active: values.is_active }),
    redirectTo: "/estados",
    errorFallback: "Erro ao atualizar estado",
  })
}
