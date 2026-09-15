// Status do lançamento: pendente -> pago | atrasado (calculado no back a
// partir do vencimento) | cancelado. Uma vez pago/cancelado, o back trava
// qualquer edição — nunca deleta, por auditoria. O back é a fonte da
// verdade; aqui é só o que o front usa pra mostrar/esconder.
export const FINANCIAL_ENTRY_STATUS = {
  PENDING: "pendente",
  PAID: "pago",
  OVERDUE: "atrasado",
  CANCELLED: "cancelado",
}

const FINANCIAL_ENTRY_STATUS_TONE = {
  pendente: "bg-amber-100 text-amber-700",
  pago: "bg-emerald-100 text-emerald-700",
  atrasado: "bg-rose-100 text-rose-700",
  cancelado: "bg-slate-100 text-slate-700",
}

export const financialEntryStatusTone = (status) =>
  FINANCIAL_ENTRY_STATUS_TONE[status] ?? "bg-slate-100 text-slate-700"

// travado: pago ou cancelado, nunca mais edita nem muda de status de novo
// (mesma regra do back, FinancialEntry.LOCKED_STATUSES).
export const financialEntryIsLocked = (status) =>
  status === FINANCIAL_ENTRY_STATUS.PAID || status === FINANCIAL_ENTRY_STATUS.CANCELLED

export const financialEntryCanAct = (status) => !financialEntryIsLocked(status)

// automática: nasceu de um evento do sistema (hoje só invoice_order,
// preenchendo "order"; "supplier" é o equivalente futuro do 5.1b) — só
// due_date é editável manualmente (mesma regra do back).
export const financialEntryIsAutomatic = (entry) =>
  Boolean(entry?.order) || Boolean(entry?.supplier)

const ENTRY_TYPE_LABELS = {
  a_pagar: "A pagar",
  a_receber: "A receber",
}

export const financialEntryTypeLabel = (value) => ENTRY_TYPE_LABELS[value] ?? value

const CATEGORY_LABELS = {
  venda_servico: "Venda de serviço/produto",
  compra_peca: "Compra de peça",
  aluguel: "Aluguel",
  folha: "Folha de pagamento",
  outro: "Outro",
}

export const financialEntryCategoryLabel = (value) => CATEGORY_LABELS[value] ?? value
