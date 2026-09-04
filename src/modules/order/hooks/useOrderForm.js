import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload } from "../order.schema"

// `clientId` / `vehicleId`: pré-preenchimento vindo, por exemplo, do botão
// "Abrir OS" na listagem de veículos.
export function useOrderForm({ clientId, vehicleId } = {}) {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: orderSchema,
    defaultValues: {
      ...orderDefaults,
      business_id: businessId ? String(businessId) : "",
      ...(clientId ? { client_id: String(clientId) } : {}),
      ...(vehicleId ? { vehicle_id: String(vehicleId) } : {}),
    },
    submit: (values) => OrderService.createOrder(toOrderPayload(values)),
    redirectTo: "/ordens",
    errorFallback: "Erro ao criar ordem",
  })
}
