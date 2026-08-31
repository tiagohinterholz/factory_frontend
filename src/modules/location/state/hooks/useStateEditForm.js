import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { StateService } from "../services/state"
import { stateSchema, stateDefaults } from "../state.schema"

export function useStateEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: stateSchema,
    defaultValues: stateDefaults,
    load: async () => {
      const data = await StateService.getState(id)
      return { name: data.name ?? "", abbreviation: data.abbreviation ?? "" }
    },
    submit: (values) => StateService.updateState(id, values),
    redirectTo: "/estados",
    errorFallback: "Erro ao atualizar estado",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir estado?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await StateService.deleteState(id)
    navigate("/estados")
  }

  return { form, onSubmit, loading, handleDelete }
}
