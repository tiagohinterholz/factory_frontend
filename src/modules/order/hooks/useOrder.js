import { useState } from "react"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { OrderService } from "@/modules/order/services/order"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { normalizeList } from "@/api/normalize-list"

const QUERY_KEY = "orders"
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
    queryKey: [QUERY_KEY, { page: currentPage, filters, ordering }],
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })

  const finishMutation = useMutation({
    mutationFn: (id) => OrderService.finishService(id),
    // finalizar mexe no board de agendamento — invalida tudo
    onSuccess: () => queryClient.invalidateQueries(),
  })

  const invoiceMutation = useMutation({
    mutationFn: (id) => OrderService.invoiceOrder(id),
    // faturar mexe em NF-e e no dashboard — invalida tudo
    onSuccess: () => queryClient.invalidateQueries(),
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
