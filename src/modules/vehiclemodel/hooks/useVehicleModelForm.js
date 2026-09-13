import { useLocation } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { VehicleModelService } from "@/modules/vehiclemodel/services/vehiclemodel"
import { vehicleModelSchema, vehicleModelDefaults, vehicleModelKeys } from "../domain"

export function useVehicleModelForm() {
  const location = useLocation()
  const preselectedManufacturer = location.state?.manufacturerId

  return useResourceForm({
    schema: vehicleModelSchema,
    defaultValues: {
      ...vehicleModelDefaults,
      manufacturer_id: preselectedManufacturer ? String(preselectedManufacturer) : "",
    },
    submit: (values) => VehicleModelService.createVehicleModel(values),
    redirectTo: "/modelos",
    invalidate: [vehicleModelKeys.all],
    errorFallback: "Erro ao criar modelo",
  })
}
