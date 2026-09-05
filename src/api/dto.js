// Helpers de conversão entre o DTO da API e o shape dos formulários.

// FK que a API devolve ora aninhada ({ id, ... }), ora como id cru.
// Normaliza para string, que é o formato dos <select> / react-hook-form.
export function idOf(value) {
  return String(value?.id ?? value ?? "")
}

// datetime ISO da API -> "YYYY-MM-DD" para <input type="date">.
export function toDateInput(value) {
  return value ? value.slice(0, 10) : ""
}

// datetime ISO da API -> "YYYY-MM-DDTHH:mm" (hora local) para
// <input type="datetime-local">. String vazia quando não há valor.
export function toDateTimeLocalInput(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (number) => String(number).padStart(2, "0")
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

// "YYYY-MM-DDTHH:mm" do <input type="datetime-local"> (hora local) -> ISO 8601
// com timezone, que é o que o backend (DateTimeField) espera. null quando vazio.
export function fromDateTimeLocalInput(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
