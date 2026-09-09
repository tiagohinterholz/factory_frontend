import { useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf, toDateTimeLocalInput, activeItems } from "@/api/dto"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetSchema, budgetDefaults, toBudgetPayload, budgetKeys } from "../domain"
import { orderKeys } from "@/modules/order/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

// dto da API -> shape do form (ids como string, valid_until como
// "YYYY-MM-DDTHH:mm" local pro <input type="datetime-local">)
function toBudgetForm(data) {
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    vehicle_id: idOf(data.vehicle),
    valid_until: toDateTimeLocalInput(data.valid_until),
  }
}

export function useBudgetEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  // itens de linha, status, totais e datas de ação são somente leitura aqui;
  // vivem fora do form. products_total/services_total vêm calculados do back
  // (só itens ativos); total é a soma dos dois.
  const [meta, setMeta] = useState({
    products: [],
    services: [],
    status: "",
    total: "",
    productsTotal: "",
    servicesTotal: "",
    approvedAt: null,
    cancelledAt: null,
    validUntil: null,
    client: null,
    vehicle: null,
  })

  const fetchMeta = useCallback(async () => {
    const data = await BudgetService.getBudgetById(id)
    setMeta({
      products: activeItems(data.budget_products),
      services: activeItems(data.budget_services),
      status: data.status ?? "",
      total: data.total ?? "0.00",
      productsTotal: data.products_total ?? "0.00",
      servicesTotal: data.services_total ?? "0.00",
      approvedAt: data.approved_at ?? null,
      cancelledAt: data.cancelled_at ?? null,
      validUntil: data.valid_until ?? null,
      // registros crus do detalhe: garantem a <option> do select mesmo com o
      // cache de opções velho ou cortado por filtro em cascata
      client: data.client ?? null,
      vehicle: data.vehicle ?? null,
    })
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: budgetSchema,
    defaultValues: budgetDefaults,
    load: async () => toBudgetForm(await fetchMeta()),
    submit: (values) => BudgetService.updateBudget(id, toBudgetPayload(values)),
    redirectTo: "/orcamentos",
    invalidate: [budgetKeys.all, dashboardKeys.all],
    errorFallback: "Erro ao atualizar o orçamento",
  })

  const remove = useResourceAction({
    mutationFn: () => BudgetService.deleteBudget(id),
    confirm: {
      title: "Excluir orçamento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: [budgetKeys.all, appointmentKeys.all, dashboardKeys.all], // Appointment.budget é CASCADE
    onSuccess: () => navigate("/orcamentos"),
    errorFallback: "Erro ao excluir orçamento",
  })

  // sem confirm: o ApproveBudgetModal é a confirmação. `serviceDate` (ISO 8601)
  // opcional cria a OS já com a data/hora do serviço. Sem rethrow: quem chama
  // olha o retorno (truthy = ok) pra fechar/manter o modal.
  const approve = useResourceAction({
    mutationFn: (serviceDate) =>
      BudgetService.approveBudget(id, serviceDate ? { service_date: serviceDate } : undefined),
    invalidate: [budgetKeys.all, orderKeys.all, appointmentKeys.all, dashboardKeys.all],
    success: (serviceDate) =>
      serviceDate ? "Orçamento aprovado com a data do serviço." : "Orçamento aprovado com sucesso!",
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao aprovar orçamento",
  })

  const cancel = useResourceAction({
    mutationFn: () => BudgetService.cancelBudget(id),
    confirm: {
      title: "Cancelar orçamento?",
      message: "O orçamento será marcado como cancelado.",
      confirmText: "Sim, cancelar",
      danger: true,
    },
    invalidate: [budgetKeys.all, dashboardKeys.all],
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao cancelar orçamento",
  })

  // duplicar: só cancelado/expirado. Abre o novo (pendente) na edição.
  const duplicate = useResourceAction({
    mutationFn: () => BudgetService.duplicateBudget(id),
    confirm: {
      title: "Duplicar orçamento?",
      message: "Cria um novo orçamento pendente com os itens ativos deste.",
      confirmText: "Duplicar",
    },
    invalidate: [budgetKeys.all, dashboardKeys.all],
    success: (_arg, created) => `Orçamento #${created.id} criado.`,
    onSuccess: (created) => navigate(`/orcamentos/${created.id}`),
    errorFallback: "Erro ao duplicar orçamento",
  })

  return {
    form,
    onSubmit,
    loading,
    products: meta.products,
    services: meta.services,
    status: meta.status,
    total: meta.total,
    productsTotal: meta.productsTotal,
    servicesTotal: meta.servicesTotal,
    approvedAt: meta.approvedAt,
    cancelledAt: meta.cancelledAt,
    validUntil: meta.validUntil,
    relatedClient: meta.client,
    relatedVehicle: meta.vehicle,
    refresh: fetchMeta,
    handleDelete: remove.run,
    handleApprove: approve.run,
    approving: approve.pending,
    handleCancel: cancel.run,
    handleDuplicate: duplicate.run,
  }
}
