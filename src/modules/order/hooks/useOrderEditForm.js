import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { idOf, toDateInput, toDateTimeLocalInput } from "@/api/dto"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload } from "../order.schema"

// dto da API -> shape do form (ids como string; service_date como
// "YYYY-MM-DDTHH:mm" local pro <input type="datetime-local">, billing_date
// como YYYY-MM-DD)
function toOrderForm(data) {
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    vehicle_id: idOf(data.vehicle),
    budget_id: idOf(data.budget),
    service_date: toDateTimeLocalInput(data.service_date),
    billing_date: toDateInput(data.billing_date),
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
    refresh: fetchMeta,
    handleDelete,
    handleInvoice,
  }
}
