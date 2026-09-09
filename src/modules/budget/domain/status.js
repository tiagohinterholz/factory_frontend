// Status do orçamento: pendente -> aprovado (gera OS) | expirado | cancelado.
// O back é a fonte da verdade; aqui é só o que o front usa pra mostrar/esconder.
export const BUDGET_STATUS = {
  PENDING: "pendente",
  APPROVED: "aprovado",
  EXPIRED: "expirado",
  CANCELLED: "cancelado",
}

const BUDGET_STATUS_TONE = {
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-emerald-100 text-emerald-700",
  expirado: "bg-slate-100 text-slate-700",
  cancelado: "bg-rose-100 text-rose-700",
}

export const budgetStatusTone = (status) =>
  BUDGET_STATUS_TONE[status] ?? "bg-slate-100 text-slate-700"

export const budgetIsPending = (status) => status === BUDGET_STATUS.PENDING

export const budgetCanDuplicate = (status) =>
  status === BUDGET_STATUS.CANCELLED || status === BUDGET_STATUS.EXPIRED

// Data da "situação atual" — a que o back gravou pra esse status. Pendente não
// tem data. `dates` já normalizado em camelCase pelo chamador.
export function budgetStatusDate(status, { approvedAt, cancelledAt, validUntil } = {}) {
  if (status === BUDGET_STATUS.APPROVED) return approvedAt ?? null
  if (status === BUDGET_STATUS.CANCELLED) return cancelledAt ?? null
  if (status === BUDGET_STATUS.EXPIRED) return validUntil ?? null
  return null
}
