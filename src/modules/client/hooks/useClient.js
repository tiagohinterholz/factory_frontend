import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { ClientService } from "@/modules/client/services/client"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { clientKeys } from "@/modules/client/domain"
import { vehicleKeys } from "@/modules/vehicle/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = { name: "", cpf: "" }

export function useClient() {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: clientKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      ClientService.getClient({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
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

  return {
    client: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: remove.run,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
