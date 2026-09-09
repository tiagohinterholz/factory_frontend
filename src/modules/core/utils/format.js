// Formatação de exibição em pt-BR — um lugar só pra dinheiro e data, no lugar
// dos `R$ ${parseFloat(x).toFixed(2)}` / `toLocaleDateString()` espalhados.

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Número (ou string numérica) -> "R$ 1.500,00". Valor ausente/inválido = 0.
// Espaço normal depois do "R$ " (não o NBSP do Intl currency) pra casar com os
// testes e o resto da UI.
export function formatMoney(value) {
  const number = Number(value ?? 0)
  return `R$ ${moneyFormatter.format(Number.isFinite(number) ? number : 0)}`
}

// Aceita "YYYY-MM-DD" (date puro, sem escorregar de fuso) ou datetime ISO.
function toDate(value) {
  if (!value) return null
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// datetime/date ISO -> "dd/mm/aaaa". Vazio/nulo/inválido -> "".
export function formatDate(value) {
  const date = toDate(value)
  if (!date) return ""
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// datetime ISO -> "dd/mm/aaaa hh:mm". Vazio/nulo/inválido -> "".
export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return ""
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
