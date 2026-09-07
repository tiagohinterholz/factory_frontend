import { useState } from "react"

// Estado de filtros estruturados de uma listagem. `apply` troca o conjunto
// inteiro (o painel do ListFilters entrega o objeto pronto) e chama `onApplied`
// — normalmente pra voltar a listagem pra página 1. `params` é o objeto pronto
// pra virar query string: sem os campos vazios.
export function useListFilters(initial, onApplied) {
  const [filters, setFilters] = useState(initial)

  function apply(next) {
    setFilters(next)
    onApplied?.()
  }

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  )

  return { filters, apply, params }
}
