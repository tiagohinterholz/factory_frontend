import { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useResourceForm } from "@/modules/core/hooks/useResourceForm"
import { useResourceAction } from "@/modules/core/hooks/useResourceAction"
import { idOf } from "@/api/dto"
import { PurchaseOrderService } from "@/modules/purchase/services/purchase-orders"
import {
  purchaseOrderSchema,
  purchaseOrderDefaults,
  toPurchaseOrderPayload,
  purchaseOrderKeys,
} from "../domain"
import { dashboardKeys } from "@/modules/dashboard/domain"

function toPurchaseOrderForm(data) {
  return {
    supplier_id: idOf(data.supplier),
    notes: data.notes ?? "",
  }
}

export function usePurchaseOrderEditForm() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  // itens, status e totais são somente leitura aqui; vivem fora do form.
  const [meta, setMeta] = useState({
    items: [],
    status: "",
    total: "0.00",
    receivedAt: null,
    cancelledAt: null,
    supplier: null,
  })

  const fetchMeta = useCallback(async () => {
    const data = await PurchaseOrderService.getPurchaseOrderById(id)
    setMeta({
      // PurchaseOrderItem não tem is_active (hard delete, o item some da
      // API de vez) — diferente de OrderProduct/BudgetProduct, não precisa
      // filtrar aqui.
      items: data.items ?? [],
      status: data.status ?? "",
      total: data.total ?? "0.00",
      receivedAt: data.received_at ?? null,
      cancelledAt: data.cancelled_at ?? null,
      supplier: data.supplier ?? null,
    })
    return data
  }, [id])

  const { form, onSubmit, loading } = useResourceForm({
    schema: purchaseOrderSchema,
    defaultValues: purchaseOrderDefaults,
    load: async () => toPurchaseOrderForm(await fetchMeta()),
    submit: (values) =>
      PurchaseOrderService.updatePurchaseOrder(id, toPurchaseOrderPayload(values)),
    redirectTo: "/compras",
    invalidate: [purchaseOrderKeys.all],
    errorFallback: "Erro ao atualizar o pedido de compra",
  })

  function invalidatePurchaseOrderCaches() {
    queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all })
  }

  const receive = useResourceAction({
    mutationFn: () => PurchaseOrderService.receivePurchaseOrder(id, {}),
    confirm: {
      title: "Receber pedido de compra?",
      message:
        "O estoque de cada item sobe e uma cobrança 'a pagar' é gerada pro fornecedor. Não pode ser desfeito.",
      confirmText: "Confirmar recebimento",
    },
    invalidate: [purchaseOrderKeys.all, dashboardKeys.all],
    success: "Pedido de compra recebido — estoque atualizado.",
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao receber o pedido de compra",
  })

  const cancel = useResourceAction({
    mutationFn: () => PurchaseOrderService.cancelPurchaseOrder(id),
    confirm: {
      title: "Cancelar pedido de compra?",
      message: "O pedido será marcado como cancelado.",
      confirmText: "Sim, cancelar",
      danger: true,
    },
    invalidate: [purchaseOrderKeys.all],
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao cancelar o pedido de compra",
  })

  const remove = useResourceAction({
    mutationFn: (itemId) => PurchaseOrderService.purchaseOrderItemDelete(id, itemId),
    invalidate: [purchaseOrderKeys.all],
    onSuccess: () => fetchMeta(),
    errorFallback: "Erro ao remover o item",
  })

  // sem try/catch aqui de propósito: quem chama (a tela) decide como mostrar
  // o erro, mesmo padrão de handleAddProduct em BudgetEdit.
  async function addItem(payload) {
    await PurchaseOrderService.purchaseOrderItemCreate(id, payload)
    await fetchMeta()
    invalidatePurchaseOrderCaches()
  }

  return {
    form,
    onSubmit,
    loading,
    items: meta.items,
    status: meta.status,
    total: meta.total,
    receivedAt: meta.receivedAt,
    cancelledAt: meta.cancelledAt,
    relatedSupplier: meta.supplier,
    refresh: fetchMeta,
    addItem,
    removeItem: remove.run,
    handleReceive: receive.run,
    receiving: receive.pending,
    handleCancel: cancel.run,
  }
}
