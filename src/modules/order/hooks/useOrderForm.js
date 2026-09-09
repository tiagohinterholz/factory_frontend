import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { BudgetService } from "@/modules/budget/services/budgets"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { orderSchema, orderDefaults, toOrderPayload } from "../domain"

// `clientId` / `vehicleId`: pré-preenchimento vindo, por exemplo, do botão
// "Abrir OS" na listagem de veículos.
// `appointmentId`: veio do atalho "Criar OS" de um card de agendamento — depois
// de criar, liga a OS nova no agendamento (PATCH order_id).
export function useOrderForm({ clientId, vehicleId, appointmentId } = {}) {
  const { businessId } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [approvingBudget, setApprovingBudget] = useState(false)

  const resourceForm = useResourceForm({
    schema: orderSchema,
    defaultValues: {
      ...orderDefaults,
      business_id: businessId ? String(businessId) : "",
      ...(clientId ? { client_id: String(clientId) } : {}),
      ...(vehicleId ? { vehicle_id: String(vehicleId) } : {}),
    },
    submit: async (values) => {
      const order = await OrderService.createOrder(toOrderPayload(values))
      if (appointmentId && order?.id) {
        await AppointmentService.linkAppointment(appointmentId, { order_id: order.id })
      }
      return order
    },
    // cria a "casca" e vai direto pra edição pra adicionar produtos/serviços;
    // sem id, cai na listagem.
    redirectTo: (order) => (order?.id ? `/ordens/${order.id}` : "/ordens"),
    errorFallback: "Erro ao criar ordem",
  })

  // caminho alternativo: aprova um orçamento pendente (base) e o back devolve a
  // OS criada (201). `serviceDate` opcional (ISO 8601) já grava a data no approve.
  async function createFromBudget(budgetId, serviceDate) {
    setApprovingBudget(true)
    try {
      const order = await BudgetService.approveBudget(
        budgetId,
        serviceDate ? { service_date: serviceDate } : undefined,
      )
      queryClient.invalidateQueries()
      navigate(order?.id ? `/ordens/${order.id}` : "/ordens")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao aprovar o orçamento").message)
    } finally {
      setApprovingBudget(false)
    }
  }

  return { ...resourceForm, createFromBudget, approvingBudget }
}
