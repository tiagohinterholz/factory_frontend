// Domínio de Payment (cobrança gerada pra uma FinancialEntry via gateway).
// Vem sempre aninhado dentro do lançamento (GET /financeiro/<id>/), nunca
// tem endpoint de listagem próprio — não é um cadastro, é histórico de
// tentativa de cobrança.
export const PAYMENT_METHOD_OPTIONS = [
  { id: "PIX", name: "Pix" },
  { id: "BOLETO", name: "Boleto" },
  { id: "CREDIT_CARD", name: "Cartão de crédito" },
]

const METHOD_LABELS = {
  PIX: "Pix",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
}

export const paymentMethodLabel = (value) => METHOD_LABELS[value] ?? value

const PAYMENT_STATUS_TONE = {
  pendente: "bg-amber-100 text-amber-700",
  confirmado: "bg-sky-100 text-sky-700",
  recebido: "bg-emerald-100 text-emerald-700",
  atrasado: "bg-rose-100 text-rose-700",
  estornado: "bg-slate-100 text-slate-700",
  falhou: "bg-rose-100 text-rose-700",
}

export const paymentStatusTone = (status) =>
  PAYMENT_STATUS_TONE[status] ?? "bg-slate-100 text-slate-700"

// "em aberto" — mesma regra do back (payment_repository.ACTIVE_STATUSES):
// bloqueia gerar uma cobrança nova enquanto uma dessas não resolver.
const ACTIVE_STATUSES = ["pendente", "confirmado"]

export const paymentIsActive = (status) => ACTIVE_STATUSES.includes(status)
