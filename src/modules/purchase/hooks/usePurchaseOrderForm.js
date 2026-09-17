import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { PurchaseOrderService } from "@/modules/purchase/services/purchase-orders"
import {
  purchaseOrderSchema,
  purchaseOrderDefaults,
  toPurchaseOrderPayload,
  purchaseOrderKeys,
} from "../domain"

// Criação: só o fornecedor (status/total nascem do back). Depois de criado,
// vai direto pra edição pra adicionar os itens — mesmo padrão do orçamento
// ("Prosseguir para Itens").
export function usePurchaseOrderForm() {
  return useResourceForm({
    schema: purchaseOrderSchema,
    defaultValues: purchaseOrderDefaults,
    submit: (values) => PurchaseOrderService.createPurchaseOrder(toPurchaseOrderPayload(values)),
    redirectTo: (purchaseOrder) =>
      purchaseOrder?.id ? `/compras/${purchaseOrder.id}` : "/compras",
    invalidate: [purchaseOrderKeys.all],
    errorFallback: "Erro ao criar o pedido de compra",
  })
}
