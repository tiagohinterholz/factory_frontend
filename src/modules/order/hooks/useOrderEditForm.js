import { useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf, toDateTimeLocalInput, activeItems } from "@/api/dto"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload, orderKeys } from "../domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

const ORDER_WIDE = [orderKeys.all, appointmentKeys.all, dashboardKeys.all]

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
    setMeta({
      products: activeItems(data.order_products),
      services: activeItems(data.order_services),
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
    invalidate: ORDER_WIDE,
    errorFallback: "Erro ao atualizar a ordem de serviço",
  })

  const remove = useResourceAction({
    mutationFn: () => OrderService.deleteOrder(id),
    confirm: {
      title: "Excluir ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      danger: true,
    },
    invalidate: ORDER_WIDE, // Appointment.order é CASCADE
    onSuccess: () => navigate("/ordens"),
    errorFallback: "Erro ao excluir a ordem de serviço",
  })

  // em andamento -> a faturar. Marca o serviço como concluído; a partir daí os
  // itens ficam travados e libera o faturamento.
  const finish = useResourceAction({
    mutationFn: () => OrderService.finishService(id),
    confirm: {
      title: "Finalizar serviço?",
      message: "A OS vai para 'a faturar' e os itens não poderão mais ser editados.",
      confirmText: "Finalizar",
    },
    invalidate: ORDER_WIDE,
    success: "Serviço finalizado. OS pronta para faturar.",
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao finalizar o serviço",
  })

  const invoice = useResourceAction({
    mutationFn: () => OrderService.invoiceOrder(id),
    confirm: {
      title: "Faturar ordem de serviço?",
      message: "Esta ação não pode ser desfeita.",
      confirmText: "Faturar",
    },
    invalidate: [orderKeys.all, dashboardKeys.all],
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao faturar a ordem de serviço",
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
    billingDate: meta.billingDate,
    budgetId: meta.budgetId,
    refresh: fetchMeta,
    handleDelete: remove.run,
    handleFinish: finish.run,
    handleInvoice: invoice.run,
  }
}
