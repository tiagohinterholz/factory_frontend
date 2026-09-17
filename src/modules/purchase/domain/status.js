// Status do pedido de compra: aberto -> recebido (soma estoque + gera
// financeiro "a pagar") | cancelado. O back é a fonte da verdade; aqui é só
// o que o front usa pra mostrar/esconder.
export const PURCHASE_ORDER_STATUS = {
  OPEN: "aberto",
  RECEIVED: "recebido",
  CANCELLED: "cancelado",
}

const PURCHASE_ORDER_STATUS_TONE = {
  aberto: "bg-amber-100 text-amber-700",
  recebido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-rose-100 text-rose-700",
}

export const purchaseOrderStatusTone = (status) =>
  PURCHASE_ORDER_STATUS_TONE[status] ?? "bg-slate-100 text-slate-700"

export const purchaseOrderIsOpen = (status) => status === PURCHASE_ORDER_STATUS.OPEN

// tipo/tom de cada linha do kardex (StockMovement) — mesmo espírito das
// outras tabelas de status do domínio.
const MOVEMENT_TYPE_LABELS = {
  compra: "Compra",
  venda: "Venda",
  cancelamento_venda: "Cancelamento de venda",
  ajuste_manual: "Ajuste manual",
}

export const stockMovementTypeLabel = (value) => MOVEMENT_TYPE_LABELS[value] ?? value

const MOVEMENT_TYPE_TONE = {
  compra: "text-emerald-600",
  venda: "text-rose-600",
  cancelamento_venda: "text-info",
  ajuste_manual: "text-amber-600",
}

export const stockMovementTypeTone = (value) => MOVEMENT_TYPE_TONE[value] ?? "text-muted"
