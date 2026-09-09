import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { CityService } from "@/modules/location/city/services/city"
import { citySchema, cityDefaults, cityKeys } from "../domain"

export function useCityEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: citySchema,
    defaultValues: cityDefaults,
    load: async () => {
      const data = await CityService.getCity(id)
      return { name: data.name ?? "", state_id: String(data.state?.id ?? data.state ?? "") }
    },
    submit: (values) => CityService.updateCity(id, values),
    redirectTo: "/cidades",
    invalidate: [cityKeys.all],
    errorFallback: "Erro ao atualizar cidade",
  })

  const remove = useResourceAction({
    mutationFn: () => CityService.deleteCity(id),
    confirm: {
      title: "Excluir cidade?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [cityKeys.all],
    onSuccess: () => navigate("/cidades"),
    errorFallback: "Erro ao excluir cidade",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
