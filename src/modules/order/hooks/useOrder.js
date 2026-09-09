import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { OrderService } from "@/modules/order/services/order"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { normalizeList } from "@/api/normalize-list"

const EMPTY_FILTERS = { status: "", client_id: "", date_from: "", date_to: "" }
// excluir e finalizar mexem na OS, no card do board e nos números da Movimentação
const ORDER_WIDE = [orderKeys.all, appointmentKeys.all, dashboardKeys.all]

export function useOrder() {
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

  const remove = useResourceAction({
    mutationFn: (item) => OrderService.deleteOrder(item.id),
    confirm: (item) => ({
      title: "Excluir ordem de serviço?",
      message: `A OS #${item.id} será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: ORDER_WIDE, // Appointment.order é CASCADE
    errorFallback: "Erro ao excluir a ordem de serviço.",
  })

  const finish = useResourceAction({
    mutationFn: (item) => OrderService.finishService(item.id),
    confirm: (item) => ({
      title: "Finalizar serviço?",
      message: `A OS #${item.id} vai para 'a faturar' e os itens não poderão mais ser editados.`,
      confirmText: "Finalizar",
    }),
    invalidate: ORDER_WIDE,
    success: (item) => `Serviço da OS #${item.id} finalizado.`,
    errorFallback: "Erro ao finalizar o serviço.",
  })

  const invoice = useResourceAction({
    mutationFn: (item) => OrderService.invoiceOrder(item.id),
    confirm: (item) => ({
      title: "Faturar ordem de serviço?",
      message: `A OS #${item.id} será marcada como faturada. Esta ação não pode ser desfeita.`,
      confirmText: "Faturar",
    }),
    invalidate: [orderKeys.all, dashboardKeys.all],
    success: (item) => `OS #${item.id} faturada.`,
    errorFallback: "Erro ao faturar a ordem de serviço.",
  })

  return {
    orders: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: remove.run,
    finish: finish.run,
    invoice: invoice.run,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
