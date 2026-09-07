import { useCallback, useEffect, useRef, useState } from "react"

// Estado de filtros estruturados de uma listagem. `apply` troca o conjunto
// inteiro (o painel do ListFilters entrega o objeto pronto) e chama `onApplied`
// — normalmente pra voltar a listagem pra página 1. `params` é o objeto pronto
// pra virar query string: sem os campos vazios.
//
// `apply` tem referência estável (useCallback) de propósito: o ListFilters é
// React.memo e precisa não re-renderizar quando o pai re-renderiza (senão o
// <select> reconcilia e o Chromium fecha o dropdown nativo aberto).
export function useListFilters(initial, onApplied) {
  const [filters, setFilters] = useState(initial)
  const onAppliedRef = useRef(onApplied)
  useEffect(() => {
    onAppliedRef.current = onApplied
  })

  const apply = useCallback((next) => {
    setFilters(next)
    onAppliedRef.current?.()
  }, [])

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  )

  return { filters, apply, params }
}
