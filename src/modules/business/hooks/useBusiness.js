import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { BusinessService } from "@/modules/business/services/business"
import { normalizeList } from "@/api/normalize-list"
import { businessKeys } from "@/modules/business/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

export function useBusiness() {
  const [currentPage, setCurrentPage] = useState(1)

  const query = useQuery({
    queryKey: businessKeys.list({ page: currentPage }),
    queryFn: () => BusinessService.getBusiness({ page: currentPage }),
    placeholderData: keepPreviousData,
    select: normalizeList,
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

  return {
    business: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: remove.run,
    currentPage,
    setCurrentPage,
  }
}
