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

  // itens de linha, status e total são somente leitura aqui; vivem fora do form.
  const [meta, setMeta] = useState({ products: [], services: [], status: "", total: "" })

  const fetchMeta = useCallback(async () => {
    const data = await BudgetService.getBudgetById(id)
    setMeta({
      products: data.budget_products ?? [],
      services: data.budget_services ?? [],
      status: data.status ?? "",
      total: data.total ?? "0.00",
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

  return {
    form,
    onSubmit,
    loading,
    products: meta.products,
    services: meta.services,
    status: meta.status,
    total: meta.total,
    refresh: fetchMeta,
    handleDelete,
    handleApprove,
    handleCancel,
  }
}
