import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { WorkServiceService } from "@/modules/workservice/services/workservice"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { workServiceKeys } from "@/modules/workservice/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = { name: "", description: "", supplier_id: "" }

export function useWorkService() {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: workServiceKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      WorkServiceService.getWorkService({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
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

  return {
    workservice: query.data?.results ?? [],
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
