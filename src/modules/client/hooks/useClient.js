import { ClientService } from "@/modules/client/services/client"
import { clientKeys } from "@/modules/client/domain"
import { vehicleKeys } from "@/modules/vehicle/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useClient() {
  const list = useResourceList({
    keyFactory: clientKeys,
    fetchPage: (params) => ClientService.getClient(params),
    emptyFilters: { name: "", cpf: "" },
  })

  const remove = useResourceAction({
    mutationFn: (item) => ClientService.deleteClient(item.id),
    confirm: (item) => ({
      title: "Excluir cliente?",
      message: `O cliente "${item.first_name} ${item.last_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [clientKeys.all, vehicleKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o cliente.",
  })

  const { items, ...rest } = list
  return { ...rest, client: items, remove: remove.run }
}
