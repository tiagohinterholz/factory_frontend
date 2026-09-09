import { BusinessService } from "@/modules/business/services/business"
import { businessKeys } from "@/modules/business/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useBusiness() {
  const list = useResourceList({
    keyFactory: businessKeys,
    fetchPage: (params) => BusinessService.getBusiness(params),
  })

  const remove = useResourceAction({
    mutationFn: (item) => BusinessService.deleteBusiness(item.id),
    confirm: (item) => ({
      title: "Excluir empreendimento?",
      message: `"${item.corporate_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [businessKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o empreendimento.",
  })

  const { items, ...rest } = list
  return { ...rest, business: items, remove: remove.run }
}
