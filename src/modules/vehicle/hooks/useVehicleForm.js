import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { vehicleSchema, vehicleDefaults, vehicleKeys } from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// `redirectTo`/`onSuccess`: default = comportamento atual exato (navega pra
// /veiculos no sucesso). O quick-create (LiveSelect) sobrescreve os dois pra
// ficar na mesma tela e selecionar o veículo novo em vez de navegar.
export function useVehicleForm({ clientId, redirectTo = "/veiculos", onSuccess } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: vehicleSchema,
    defaultValues: {
      ...vehicleDefaults,
      business_id: businessId ? String(businessId) : "",
      client_id: clientId ? String(clientId) : "",
    },
    submit: (values) => VehicleService.createVehicle(values),
    redirectTo,
    onSuccess,
    invalidate: [vehicleKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao criar veículo",
  })
}
