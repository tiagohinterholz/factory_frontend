import { ManufacturerService } from "@/modules/manufacturer/services/manufacturer"
import { manufacturerKeys } from "@/modules/manufacturer/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useManufacturers() {
  const list = useResourceList({
    keyFactory: manufacturerKeys,
    fetchPage: (params) => ManufacturerService.getManufacturers(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => ManufacturerService.deleteManufacturer(item.id),
    confirm: (item) => ({
      title: "Excluir marca?",
      message: `A marca "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [manufacturerKeys.all],
    errorFallback: "Erro ao excluir a marca.",
  })

  const { items, ...rest } = list
  return { ...rest, manufacturers: items, remove: remove.run }
}
