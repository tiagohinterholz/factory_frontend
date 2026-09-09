import { VehicleService } from "@/modules/vehicle/services/vehicle"
import { vehicleKeys } from "@/modules/vehicle/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useVehicle() {
  const list = useResourceList({
    keyFactory: vehicleKeys,
    fetchPage: (params) => VehicleService.getVehicle(params),
    emptyFilters: { model: "", plate: "", color: "", client: "" },
  })

  const remove = useResourceAction({
    mutationFn: (item) => VehicleService.deleteVehicle(item.id),
    confirm: (item) => ({
      title: "Excluir veículo?",
      message: `O veículo de placa "${item.plate}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [vehicleKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o veículo.",
  })

  const { items, ...rest } = list
  return { ...rest, vehicle: items, remove: remove.run }
}
