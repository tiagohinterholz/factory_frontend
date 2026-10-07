// Deriva tudo que o card "Financeiro do mês" precisa a partir de
// `financial.entries_by_status` (GET /dashboard/) — matriz entry_type x
// status, cada célula { count, total }. Protótipo aprovado:
// https://claude.ai/artifact/RNgaPxiZGnRLgomc2r4Dyy

export const FINANCIAL_MONTH_STATUS_META = {
  pago: { label: "Pago", tone: "ok" },
  pendente: { label: "Pendente", tone: "info" },
  atrasado: { label: "Atrasado", tone: "danger" },
  cancelado: { label: "Cancelado", tone: "muted" },
}

export const FINANCIAL_MONTH_TYPE_LABELS = {
  a_receber: "A receber",
  a_pagar: "A pagar",
}

// "em aberto" pro lado de quem cobra e pra quem paga — mesmo critério dos
// mini-stats do protótipo (soma pendente + atrasado).
const OPEN_STATUSES = ["pendente", "atrasado"]

function toNumber(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function cell(breakdown, type, status) {
  return breakdown?.[type]?.[status] ?? { count: 0, total: 0 }
}

function sumTotals(breakdown, type, statuses) {
  return statuses.reduce((acc, status) => acc + toNumber(cell(breakdown, type, status).total), 0)
}

// { toBill, billed, payablesOpen } em número puro (sem formatar) — mesma
// conta do protótipo: a_receber pendente+atrasado = "A faturar", a_receber
// pago = "Faturado", a_pagar pendente+atrasado = "A pagar em aberto".
export function financialMonthMiniStats(breakdown) {
  return {
    toBill: sumTotals(breakdown, "a_receber", OPEN_STATUSES),
    billed: sumTotals(breakdown, "a_receber", ["pago"]),
    payablesOpen: sumTotals(breakdown, "a_pagar", OPEN_STATUSES),
  }
}

// opções do filtro de Tipo (nível 1) com a contagem total de lançamentos
// do mês naquele tipo, somando os 4 status.
export function financialMonthTypeOptions(breakdown) {
  return Object.entries(FINANCIAL_MONTH_TYPE_LABELS).map(([type, label]) => ({
    id: type,
    label,
    count: Object.keys(FINANCIAL_MONTH_STATUS_META).reduce(
      (acc, status) => acc + toNumber(cell(breakdown, type, status).count),
      0,
    ),
  }))
}

// opções do filtro de Status (nível 2), recalculadas pro tipo escolhido.
export function financialMonthStatusOptions(breakdown, type) {
  return Object.entries(FINANCIAL_MONTH_STATUS_META).map(([status, meta]) => ({
    id: status,
    label: meta.label,
    tone: meta.tone,
    count: toNumber(cell(breakdown, type, status).count),
  }))
}

// mesma regra do protótipo: ao trocar de Tipo, se o status atualmente
// selecionado não tem nenhum lançamento no tipo novo, pula pro primeiro
// status com contagem > 0 — sem isso o usuário cai numa aba vazia sem
// entender por quê.
export function financialMonthNextStatus(breakdown, type, currentStatus) {
  if (toNumber(cell(breakdown, type, currentStatus).count) > 0) return currentStatus

  const withEntries = Object.keys(FINANCIAL_MONTH_STATUS_META).find(
    (status) => toNumber(cell(breakdown, type, status).count) > 0,
  )
  return withEntries ?? "pendente"
}

// primeiro/último dia do mês corrente, no formato que a API espera
// (date_from/date_to de GET /financeiro/) — mesmo recorte de "mês vigente"
// que o back usa (due_date) pra montar o entries_by_status.
export function currentMonthRange(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const pad = (value) => String(value).padStart(2, "0")
  const lastDay = new Date(year, month + 1, 0).getDate()

  return {
    date_from: `${year}-${pad(month + 1)}-01`,
    date_to: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  }
}
