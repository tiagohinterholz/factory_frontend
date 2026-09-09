import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf, toDateTimeLocalInput } from "@/api/dto"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload } from "../domain"

// dto da API -> shape do form (ids como string; service_date como
// "YYYY-MM-DDTHH:mm" local pro <input type="datetime-local">). billing_date e
// budget não entram no form — são só leitura no meta (billing_date o back grava
// ao faturar; o vínculo do orçamento não deve ser mexido pela edição da OS).
function toOrderForm(data) {
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    vehicle_id: idOf(data.vehicle),
    service_date: toDateTimeLocalInput(data.service_date),
    notes: data.notes ?? "",
  }
}

export function useOrderEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const queryClient = useQueryClient()

  // itens de linha, status e totais são somente leitura aqui; vivem fora do
  // form. products_total/services_total vêm calculados do back (só itens
  // ativos); total é a soma dos dois.
  const [meta, setMeta] = useState({
    products: [],
    services: [],
    status: "",
    total: "",
    productsTotal: "",
    servicesTotal: "",
    billingDate: null,
    budgetId: "",
  })

  const fetchMeta = useCallback(async () => {
    const data = await OrderService.getOrderById(id)
    // o back não some com a linha no DELETE, só marca is_active=false; o
    // detalhe ainda a devolve. Os totais já vêm só com os ativos.
    setMeta({
      products: (data.order_products ?? []).filter((item) => item.is_active),
      services: (data.order_services ?? []).filter((item) => item.is_active),
      status: data.status ?? "",
      total: data.total ?? "0.00",
      productsTotal: data.products_total ?? "0.00",
      servicesTotal: data.services_total ?? "0.00",
      billingDate: data.billing_date ?? null,
      budgetId: idOf(data.budget),
    })
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: orderSchema,
    defaultValues: orderDefaults,
    load: async () => toOrderForm(await fetchMeta()),
    submit: (values) => OrderService.updateOrder(id, toOrderPayload(values)),
    redirectTo: "/ordens",
    errorFallback: "Erro ao atualizar a ordem de serviço",
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return
    await OrderService.deleteOrder(id)
    queryClient.invalidateQueries()
    navigate("/ordens")
  }

  // em andamento -> a faturar. Marca o serviço como concluído; a partir daí
  // os itens ficam travados e libera o faturamento.
  async function handleFinish() {
    const confirmed = await confirm({
      title: "Finalizar serviço?",
      message: "A OS vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    })
    if (!confirmed) return
    try {
      await OrderService.finishService(id)
      await fetchMeta()
      queryClient.invalidateQueries()
      toast.success("Serviço finalizado. OS pronta para faturar.")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao finalizar o serviço").message)
    }
  }

  async function handleInvoice() {
    const confirmed = await confirm({
      title: "Faturar ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Faturar",
    })
    if (!confirmed) return
    try {
      await OrderService.invoiceOrder(id)
      await fetchMeta()
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao faturar a ordem de serviço").message)
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
    billingDate: meta.billingDate,
    budgetId: meta.budgetId,
    refresh: fetchMeta,
    handleDelete,
    handleFinish,
    handleInvoice,
  }
}
