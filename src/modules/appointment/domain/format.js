// "seg., 14:30" (com hora) ou "seg., 05/10" (sem hora), em pt-BR — usa Date +
// Intl em vez de imprimir o time cru da API (que vem "14:30:00", com segundos).
// Vazio/inválido -> "".
export function appointmentWhen(date, time) {
  if (!date) return ""
  const parsed = new Date(`${date}T${time || "00:00:00"}`)
  if (Number.isNaN(parsed.getTime())) return ""
  const options = time
    ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
    : { weekday: "short", day: "2-digit", month: "2-digit" }
  return parsed.toLocaleString("pt-BR", options)
}
