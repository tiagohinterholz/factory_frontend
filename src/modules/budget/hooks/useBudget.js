import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { BudgetService } from "@/modules/budget/services/budgets"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"

const QUERY_KEY = "budgets"
const EMPTY_FILTERS = { status: "", client_id: "", date_from: "", date_to: "" }

export function useBudget() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: [QUERY_KEY, { page: currentPage, filters, ordering }],
    queryFn: () =>
      BudgetService.getBudget({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => BudgetService.deleteBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  const approveMutation = useMutation({
    mutationFn: (id) => BudgetService.approveBudget(id),
    // aprovar pode gerar uma OS — invalida tudo pra listas relacionadas refazerem
    onSuccess: () => queryClient.invalidateQueries(),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => BudgetService.cancelBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id) => BudgetService.duplicateBudget(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  return {
    budgets: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    duplicate: duplicateMutation.mutateAsync,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
