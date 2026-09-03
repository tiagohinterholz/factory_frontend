import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf } from "@/api/dto"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { vehicleSchema, vehicleDefaults } from "../vehicle.schema"

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
  const confirm = useConfirm()
  const queryClient = useQueryClient()

  const { form, onSubmit, loading } = useResourceForm({
    schema: vehicleSchema,
    defaultValues: vehicleDefaults,
    load: async () => toVehicleForm(await VehicleService.getVehicleById(id)),
    submit: (values) => VehicleService.updateVehicle(id, values),
    redirectTo: "/veiculos",
    errorFallback: "Erro ao atualizar veículo",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir veículo?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await VehicleService.deleteVehicle(id)
    queryClient.invalidateQueries()
    navigate("/veiculos")
  }

  return { form, onSubmit, loading, handleDelete }
}
