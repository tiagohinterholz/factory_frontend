import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetKeys } from "@/modules/budget/domain"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useListFilters } from "@/modules/core/hooks/useListFilters"
import { useListSort } from "@/modules/core/hooks/useListSort"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { normalizeList } from "@/api/normalize-list"

const EMPTY_FILTERS = { status: "", client_id: "", date_from: "", date_to: "" }

export function useBudget() {
  const navigate = useNavigate()
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

  const remove = useResourceAction({
    mutationFn: (item) => BudgetService.deleteBudget(item.id),
    confirm: (item) => ({
      title: "Excluir orçamento?",
      message: `O orçamento #${item.id} será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    }),
    invalidate: [budgetKeys.all, appointmentKeys.all, dashboardKeys.all], // Appointment.budget é CASCADE
    errorFallback: "Erro ao excluir o orçamento.",
  })

  // sem confirm aqui: o ApproveBudgetModal é a confirmação. `serviceDate` (ISO
  // 8601) opcional cria a OS já com a data/hora do serviço.
  const approve = useResourceAction({
    mutationFn: ({ id, serviceDate }) =>
      BudgetService.approveBudget(id, serviceDate ? { service_date: serviceDate } : undefined),
    invalidate: [budgetKeys.all, orderKeys.all, appointmentKeys.all, dashboardKeys.all],
    success: ({ serviceDate }) =>
      serviceDate ? "Orçamento aprovado com a data do serviço." : "Orçamento aprovado.",
    errorFallback: "Erro ao aprovar o orçamento.",
  })

  const cancel = useResourceAction({
    mutationFn: (item) => BudgetService.cancelBudget(item.id),
    confirm: (item) => ({
      title: "Cancelar orçamento?",
      message: `O orçamento #${item.id} será marcado como cancelado.`,
      confirmText: "Sim, cancelar",
      danger: true,
    }),
    invalidate: [budgetKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao cancelar o orçamento.",
  })

  // duplicar: só cancelado/expirado. Abre o novo (pendente) na edição.
  const duplicate = useResourceAction({
    mutationFn: (item) => BudgetService.duplicateBudget(item.id),
    confirm: (item) => ({
      title: "Duplicar orçamento?",
      message: `Cria um novo orçamento pendente a partir do #${item.id}, com os itens ativos.`,
      confirmText: "Duplicar",
    }),
    invalidate: [budgetKeys.all, dashboardKeys.all],
    success: (item, created) => `Orçamento #${created.id} criado a partir do #${item.id}.`,
    onSuccess: (created) => navigate(`/orcamentos/${created.id}`),
    errorFallback: "Erro ao duplicar o orçamento.",
  })

  return {
    budgets: query.data?.results ?? [],
    totalItems: query.data?.count ?? 0,
    loading: query.isPending,
    error: query.error ?? null,
    refetch: query.refetch,
    remove: remove.run,
    approve: approve.run,
    approving: approve.pending,
    cancel: cancel.run,
    duplicate: duplicate.run,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
  }
}
