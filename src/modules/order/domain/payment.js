export const PAYMENT_METHOD_OPTIONS = [
  { id: "pix", name: "Pix" },
  { id: "cartao", name: "Cartão" },
  { id: "dinheiro", name: "Dinheiro" },
  { id: "deposito", name: "Depósito" },
  { id: "cheque", name: "Cheque" },
]

export const MAX_INSTALLMENTS = 24

export function paymentLabel(payment) {
  if (!payment?.payment_method) return ""
  const name =
    payment.payment_method_display ??
    PAYMENT_METHOD_OPTIONS.find((option) => option.id === payment.payment_method)?.name ??
    payment.payment_method
  return payment.payment_method === "cartao" && payment.installments
    ? `${name} ${payment.installments}x`
    : name
}

const FISCAL_STATUS = {
  pending: { label: "Pendente", tone: "bg-amber-100 text-amber-700" },
  processing: { label: "Processando", tone: "bg-sky-100 text-sky-700" },
  issued: { label: "Emitida", tone: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Falhou", tone: "bg-rose-100 text-rose-700" },
  cancelled: { label: "Cancelada", tone: "bg-slate-100 text-slate-600" },
}

export function fiscalStatusInfo(status) {
  return FISCAL_STATUS[status] ?? null
}
