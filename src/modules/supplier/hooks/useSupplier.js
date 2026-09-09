import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { SupplierService } from "@/modules/supplier/services/supplier"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"
import { supplierKeys } from "@/modules/supplier/domain"

const EMPTY_FILTERS = { cnpj: "", corporate_name: "" }

export function useSupplier() {
  const queryClient = useQueryClient()
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

  const removeMutation = useMutation({
    mutationFn: (id) => SupplierService.deleteSupplier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  })

  return {
    supplier: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
