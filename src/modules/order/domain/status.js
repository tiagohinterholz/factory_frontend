// Status da OS: em andamento -> a faturar -> faturado, ou cancelado.
// "em andamento" é o inicial (budget_approve cria assim); "a faturar" só via
// a ação "Finalizar serviço" e significa "serviço concluído, pronto pra cobrar".
export const ORDER_STATUS = {
  IN_PROGRESS: "em andamento",
  TO_BILL: "a faturar",
  BILLED: "faturado",
  CANCELLED: "cancelado",
}

export const ORDER_STATUS_TONE = {
  "em andamento": "bg-amber-100 text-amber-700",
  "a faturar": "bg-brand-subtle text-brand",
  faturado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-rose-100 text-rose-700",
}

export const orderStatusTone = (status) =>
  ORDER_STATUS_TONE[status] ?? "bg-slate-100 text-slate-700"

// Regras de transição/edição da OS (o back é a fonte da verdade; aqui é só o
// que o front usa pra mostrar/esconder ação).
export const orderCanEditItems = (status) => status === ORDER_STATUS.IN_PROGRESS
export const orderCanFinish = (status) => status === ORDER_STATUS.IN_PROGRESS
export const orderCanInvoice = (status) => status === ORDER_STATUS.TO_BILL
export const orderIsBilled = (status) => status === ORDER_STATUS.BILLED
