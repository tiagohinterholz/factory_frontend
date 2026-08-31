import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { CityService } from "@/modules/location/city/services/city"
import { citySchema, cityDefaults } from "../city.schema"

export function useCityEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { form, onSubmit, loading } = useResourceForm({
    schema: citySchema,
    defaultValues: cityDefaults,
    load: async () => {
      const data = await CityService.getCity(id)
      return { name: data.name ?? "", state_id: String(data.state?.id ?? data.state ?? "") }
    },
    submit: (values) => CityService.updateCity(id, values),
    redirectTo: "/cidades",
    errorFallback: "Erro ao atualizar cidade",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir cidade?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await CityService.deleteCity(id)
    navigate("/cidades")
  }

  return { form, onSubmit, loading, handleDelete }
}
