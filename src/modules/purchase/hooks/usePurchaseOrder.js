import { PurchaseOrderService } from "@/modules/purchase/services/purchase-orders"
import { purchaseOrderKeys } from "@/modules/purchase/domain"
import { useResourceList } from "@/modules/core/hooks/useResourceList"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { dashboardKeys } from "@/modules/dashboard/domain"

const EMPTY_FILTERS = { status: "", supplier_id: "" }

export function usePurchaseOrder() {
  const list = useResourceList({
    keyFactory: purchaseOrderKeys,
    fetchPage: (params) => PurchaseOrderService.getPurchaseOrders(params),
    emptyFilters: EMPTY_FILTERS,
  })

  // soma o estoque de cada item e gera a FinancialEntry "a pagar" —
  // irreversível, mesmo aviso da tela de edição.
  const receive = useResourceAction({
    mutationFn: (item) => PurchaseOrderService.receivePurchaseOrder(item.id, {}),
    confirm: (item) => ({
      title: "Receber pedido de compra?",
      message: `O estoque de cada item do pedido #${item.id} sobe e uma cobrança "a pagar" é gerada pro fornecedor. Não pode ser desfeito.`,
      confirmText: "Confirmar recebimento",
    }),
    invalidate: [purchaseOrderKeys.all, dashboardKeys.all],
    success: (item) => `Pedido #${item.id} recebido — estoque atualizado.`,
    errorFallback: "Erro ao receber o pedido de compra.",
  })

  const cancel = useResourceAction({
    mutationFn: (item) => PurchaseOrderService.cancelPurchaseOrder(item.id),
    confirm: (item) => ({
      title: "Cancelar pedido de compra?",
      message: `O pedido #${item.id} será marcado como cancelado.`,
      confirmText: "Sim, cancelar",
      danger: true,
    }),
    invalidate: [purchaseOrderKeys.all],
    errorFallback: "Erro ao cancelar o pedido de compra.",
  })

  const { items, ...rest } = list
  return {
    ...rest,
    purchaseOrders: items,
    receive: receive.run,
    cancel: cancel.run,
  }
}
