import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/modules/auth/context/auth-context"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { BudgetService } from "@/modules/budget"
import { AppointmentService } from "@/modules/appointment"
import { orderSchema, orderDefaults, toOrderPayload, orderKeys } from "../domain"
import { budgetKeys } from "@/modules/budget/domain"
import { appointmentKeys } from "@/modules/appointment/domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

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
    invalidate: [orderKeys.all, appointmentKeys.all, dashboardKeys.all],
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
      // aprovar cria a OS, tira o orçamento da lista de pendentes e (com data)
      // sincroniza o agendamento — mexe nos 4
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
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
