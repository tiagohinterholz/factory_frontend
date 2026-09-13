import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { VehicleModelService } from "@/modules/vehiclemodel/services/vehiclemodel"
import { vehicleModelSchema, vehicleModelDefaults, vehicleModelKeys } from "../domain"

export function useVehicleModelEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: vehicleModelSchema,
    defaultValues: vehicleModelDefaults,
    load: async () => {
      const data = await VehicleModelService.getVehicleModel(id)
      return { name: data.name ?? "", manufacturer_id: idOf(data.manufacturer) }
    },
    submit: (values) => VehicleModelService.updateVehicleModel(id, values),
    redirectTo: "/modelos",
    invalidate: [vehicleModelKeys.all],
    errorFallback: "Erro ao atualizar modelo",
  })

  const remove = useResourceAction({
    mutationFn: () => VehicleModelService.deleteVehicleModel(id),
    confirm: {
      title: "Excluir modelo?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [vehicleModelKeys.all],
    onSuccess: () => navigate("/modelos"),
    errorFallback: "Erro ao excluir modelo",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
