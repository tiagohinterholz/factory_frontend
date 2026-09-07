// Formata um datetime ISO da API para exibição em pt-BR (dd/mm/aaaa hh:mm).
// Valor vazio/nulo ou data inválida vira "".
export function formatDateTime(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
