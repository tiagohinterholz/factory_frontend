import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetKeys } from "@/modules/budget/domain"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"

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
    queryKey: budgetKeys.list({ page: currentPage, filters, ordering }),
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
    onSuccess: () => {
      // Appointment.budget é CASCADE — excluir o orçamento leva o agendamento junto
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  const approveMutation = useMutation({
    // serviceDate opcional (ISO 8601): cria a OS já com a data/hora do serviço
    mutationFn: ({ id, serviceDate }) =>
      BudgetService.approveBudget(id, serviceDate ? { service_date: serviceDate } : undefined),
    onSuccess: () => {
      // aprovar cria a OS e (com data) sincroniza o agendamento
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => BudgetService.cancelBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id) => BudgetService.duplicateBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
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
