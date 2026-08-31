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
