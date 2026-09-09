import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"

const EMPTY_FILTERS = { status: "", client_id: "", date_from: "", date_to: "" }

export function useOrder() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    filters,
    apply: applyFilters,
    params: filterParams,
  } = useListFilters(EMPTY_FILTERS, () => setCurrentPage(1))
  const { ordering, toggle: toggleSort } = useListSort(() => setCurrentPage(1))

  const query = useQuery({
    queryKey: orderKeys.list({ page: currentPage, filters, ordering }),
    queryFn: () =>
      OrderService.getOrder({
        page: currentPage,
        ...filterParams,
        ...(ordering ? { ordering } : {}),
      }),
    placeholderData: keepPreviousData,
    select: normalizeList,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => OrderService.deleteOrder(id),
    onSuccess: () => {
      // excluir a OS: o back faz CASCADE no agendamento vinculado
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  const finishMutation = useMutation({
    mutationFn: (id) => OrderService.finishService(id),
    onSuccess: () => {
      // finalizar muda a OS, o rótulo do card no board e os números da Movimentação
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  const invoiceMutation = useMutation({
    mutationFn: (id) => OrderService.invoiceOrder(id),
    onSuccess: () => {
      // faturar muda a OS (libera NF-e) e os números do dashboard
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })

  return {
    orders: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: removeMutation.mutateAsync,
    finish: finishMutation.mutateAsync,
    invoice: invoiceMutation.mutateAsync,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
