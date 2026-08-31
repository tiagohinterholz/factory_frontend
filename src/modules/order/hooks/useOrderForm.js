import { useAuth } from "@/modules/auth/context/auth-context"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { OrderService } from "@/modules/order/services/order"
import { orderSchema, orderDefaults, toOrderPayload } from "../order.schema"

export function useOrderForm() {
  const { businessId } = useAuth()

  return useResourceForm({
    schema: orderSchema,
    defaultValues: {
      ...orderDefaults,
      business_id: businessId ? String(businessId) : "",
    },
    submit: (values) => OrderService.createOrder(toOrderPayload(values)),
    redirectTo: "/ordens",
    errorFallback: "Erro ao criar ordem",
  })
}
