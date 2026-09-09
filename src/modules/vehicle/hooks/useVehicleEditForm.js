import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { vehicleSchema, vehicleDefaults, vehicleKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// dto da API -> shape do form (ids como string)
function toVehicleForm(data) {
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    manufacturer: data.manufacturer ?? "",
    model: data.model ?? "",
    year: data.year ?? "",
    year_model: data.year_model ?? "",
    plate: data.plate ?? "",
    color: data.color ?? "",
    fuel: data.fuel ?? "",
    mileage: data.mileage ?? "",
  }
}

export function useVehicleEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading } = useResourceForm({
    schema: vehicleSchema,
    defaultValues: vehicleDefaults,
    load: async () => toVehicleForm(await VehicleService.getVehicleById(id)),
    submit: (values) => VehicleService.updateVehicle(id, values),
    redirectTo: "/veiculos",
    invalidate: [vehicleKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar veículo",
  })

  const remove = useResourceAction({
    mutationFn: () => VehicleService.deleteVehicle(id),
    confirm: {
      title: "Excluir veículo?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [vehicleKeys.all, dashboardKeys.all],
    onSuccess: () => navigate("/veiculos"),
    errorFallback: "Erro ao excluir veículo",
  })

  return { form, onSubmit, loading, handleDelete: remove.run }
}
