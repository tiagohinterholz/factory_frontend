import { useNavigate } from "react-router-dom"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetKeys } from "@/modules/budget/domain"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"

const EMPTY_FILTERS = { status: "", client_id: "", date_from: "", date_to: "" }

export function useBudget() {
  const navigate = useNavigate()
  const list = useResourceList({
    keyFactory: budgetKeys,
    fetchPage: (params) => BudgetService.getBudget(params),
    emptyFilters: EMPTY_FILTERS,
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

  const { items, ...rest } = list
  return {
    ...rest,
    budgets: items,
    remove: remove.run,
    approve: approve.run,
    approving: approve.pending,
    cancel: cancel.run,
    duplicate: duplicate.run,
  }
}
