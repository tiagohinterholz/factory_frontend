import { useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload } from "../order.schema"

// dto da API -> shape do form (ids como string, datas em YYYY-MM-DD)
function toOrderForm(data) {
  const idOf = (value) => String(value?.id ?? value ?? "")
  return {
    business_id: idOf(data.business),
    client_id: idOf(data.client),
    vehicle_id: idOf(data.vehicle),
    budget_id: idOf(data.budget),
    service_date: data.service_date ? data.service_date.slice(0, 10) : "",
    billing_date: data.billing_date ? data.billing_date.slice(0, 10) : "",
    notes: data.notes ?? "",
  }
}

export function useOrderEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()

  // itens de linha, status e total são somente leitura aqui; vivem fora do form.
  const [meta, setMeta] = useState({ products: [], services: [], status: "", total: "" })

  const fetchMeta = useCallback(async () => {
    const data = await OrderService.getOrderById(id)
    setMeta({
      products: data.order_products ?? [],
      services: data.order_services ?? [],
      status: data.status ?? "",
      total: data.total ?? "",
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
    refresh: fetchMeta,
    handleDelete,
    handleInvoice,
  }
}
