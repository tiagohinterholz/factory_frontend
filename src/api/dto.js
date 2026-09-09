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

// Sub-recursos (itens de OS/orçamento) são soft-delete no back: a linha
// continua no detalhe com is_active=false. Filtra só os ativos.
export function activeItems(list) {
  return (list ?? []).filter((item) => item.is_active)
}

// Garante que o valor selecionado exista na lista de opções de um <select>.
// As opções dos formulários vêm de um cache com staleTime alto (pode estar
// defasado: registro criado agora) ou de um filtro em cascata que corta o valor
// atual — nos dois casos o campo apareceria vazio e um "salvar" apagaria a FK
// sem o usuário perceber. `fallbackOption` ({ id, name }) é montado a partir do
// payload de detalhe, que sempre traz o registro atual. No-op quando não há
// seleção, quando a opção já está na lista ou quando o fallback não é o próprio
// valor selecionado (só o registro do payload de detalhe pode ser garantido).
export function withSelectedOption(options, selectedId, fallbackOption) {
  const id = String(selectedId ?? "")
  if (!id) return options
  if (options.some((option) => String(option.id) === id)) return options
  if (fallbackOption?.id == null || String(fallbackOption.id) !== id) return options
  return [fallbackOption, ...options]
}
