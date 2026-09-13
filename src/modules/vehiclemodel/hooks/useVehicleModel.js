import { VehicleModelService } from "@/modules/vehiclemodel/services/vehiclemodel"
import { vehicleModelKeys } from "@/modules/vehiclemodel/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useVehicleModels() {
  const list = useResourceList({
    keyFactory: vehicleModelKeys,
    fetchPage: (params) => VehicleModelService.getVehicleModels(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => VehicleModelService.deleteVehicleModel(item.id),
    confirm: (item) => ({
      title: "Excluir modelo?",
      message: `O modelo "${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [vehicleModelKeys.all],
    errorFallback: "Erro ao excluir o modelo.",
  })

  const { items, ...rest } = list
  return { ...rest, vehicleModels: items, remove: remove.run }
}
