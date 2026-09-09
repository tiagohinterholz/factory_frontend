import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { workServiceKeys } from "@/modules/workservice/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useWorkService() {
  const list = useResourceList({
    keyFactory: workServiceKeys,
    fetchPage: (params) => WorkServiceService.getWorkService(params),
    emptyFilters: { name: "", description: "", supplier_id: "" },
  })

  const remove = useResourceAction({
    mutationFn: (item) => WorkServiceService.deleteWorkService(item.id),
    confirm: (item) => ({
      title: "Excluir serviço?",
      message: `"${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [workServiceKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o serviço.",
  })

  const { items, ...rest } = list
  return { ...rest, workservice: items, remove: remove.run }
}
