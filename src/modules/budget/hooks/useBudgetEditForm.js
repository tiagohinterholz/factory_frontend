import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf, toDateTimeLocalInput } from "@/api/dto"
import { BudgetService } from "@/modules/budget/services/budgets"
import { budgetSchema, budgetDefaults, toBudgetPayload } from "../budget.schema"

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
  const confirm = useConfirm()
  const toast = useToast()
  const queryClient = useQueryClient()

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
  })

  const fetchMeta = useCallback(async () => {
    const data = await BudgetService.getBudgetById(id)
    // o back não some com a linha no DELETE, só marca is_active=false; o
    // detalhe ainda a devolve. Os totais já vêm só com os ativos.
    setMeta({
      products: (data.budget_products ?? []).filter((item) => item.is_active),
      services: (data.budget_services ?? []).filter((item) => item.is_active),
      status: data.status ?? "",
      total: data.total ?? "0.00",
      productsTotal: data.products_total ?? "0.00",
      servicesTotal: data.services_total ?? "0.00",
      approvedAt: data.approved_at ?? null,
      cancelledAt: data.cancelled_at ?? null,
      validUntil: data.valid_until ?? null,
    })
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: budgetSchema,
    defaultValues: budgetDefaults,
    load: async () => toBudgetForm(await fetchMeta()),
    submit: (values) => BudgetService.updateBudget(id, toBudgetPayload(values)),
    redirectTo: "/orcamentos",
    errorFallback: "Erro ao atualizar o orçamento",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir orçamento?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await BudgetService.deleteBudget(id)
    queryClient.invalidateQueries()
    navigate("/orcamentos")
  }

  async function handleApprove() {
    const confirmed = await confirm({
      title: "Aprovar orçamento?",
      message: "Isso pode gerar uma Ordem de Serviço.",
      confirmText: "Aprovar",
    })
    if (!confirmed) return
    try {
      await BudgetService.approveBudget(id)
      await fetchMeta()
      toast.success("Orçamento aprovado com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao aprovar orçamento").message)
    }
  }

  async function handleCancel() {
    const confirmed = await confirm({
      title: "Cancelar orçamento?",
      message: "O orçamento será marcado como cancelado.",
      confirmText: "Sim, cancelar",
      danger: true,
    })
    if (!confirmed) return
    try {
      await BudgetService.cancelBudget(id)
      await fetchMeta()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao cancelar orçamento").message)
    }
  }

  // duplicar: só cancelado/expirado. Abre o novo (pendente) na edição.
  async function handleDuplicate() {
    const confirmed = await confirm({
      title: "Duplicar orçamento?",
      message: "Cria um novo orçamento pendente com os itens ativos deste.",
      confirmText: "Duplicar",
    })
    if (!confirmed) return
    try {
      const created = await BudgetService.duplicateBudget(id)
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success(`Orçamento #${created.id} criado.`)
      navigate(`/orcamentos/${created.id}`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao duplicar orçamento").message)
    }
  }

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
    refresh: fetchMeta,
    handleDelete,
    handleApprove,
    handleCancel,
    handleDuplicate,
  }
}
