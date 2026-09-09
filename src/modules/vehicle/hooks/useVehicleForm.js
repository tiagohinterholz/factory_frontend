import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { vehicleSchema, vehicleDefaults } from "../domain"

export function useVehicleForm({ clientId } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: vehicleSchema,
    defaultValues: {
      ...vehicleDefaults,
      business_id: businessId ? String(businessId) : "",
      client_id: clientId ? String(clientId) : "",
    },
    submit: (values) => VehicleService.createVehicle(values),
    redirectTo: "/veiculos",
    errorFallback: "Erro ao criar veículo",
  })
}
