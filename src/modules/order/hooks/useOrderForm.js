import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { AppointmentService } from "@/modules/appointment/services/appointment"
import { orderSchema, orderDefaults, toOrderPayload } from "../order.schema"

// `clientId` / `vehicleId`: pré-preenchimento vindo, por exemplo, do botão
// "Abrir OS" na listagem de veículos.
// `appointmentId`: veio do atalho "Criar OS" de um card de agendamento — depois
// de criar, liga a OS nova no agendamento (PATCH order_id).
export function useOrderForm({ clientId, vehicleId, appointmentId } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
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
}
