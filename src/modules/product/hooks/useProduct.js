import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { ProductService } from "@/modules/product/services/product"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { productKeys } from "@/modules/product/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = { name: "", reference: "", supplier_id: "" }

export function useProduct() {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: productKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      ProductService.getProduct({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const remove = useResourceAction({
    mutationFn: (item) => ProductService.deleteProduct(item.id),
    confirm: (item) => ({
      title: "Excluir produto?",
      message: `"${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [productKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao excluir o produto.",
  })

  return {
    product: query.data?.results ?? [],
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
