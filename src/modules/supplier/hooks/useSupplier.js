import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { supplierKeys } from "@/modules/supplier/domain"
import { productKeys } from "@/modules/product/domain"
import { workServiceKeys } from "@/modules/workservice/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = { cnpj: "", corporate_name: "" }

export function useSupplier() {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: supplierKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      SupplierService.getSupplier({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const remove = useResourceAction({
    mutationFn: (item) => SupplierService.deleteSupplier(item.id),
    confirm: (item) => ({
      title: "Excluir fornecedor?",
      message: `"${item.corporate_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [supplierKeys.all, productKeys.all, workServiceKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o fornecedor.",
  })

  return {
    supplier: query.data?.results ?? [],
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
