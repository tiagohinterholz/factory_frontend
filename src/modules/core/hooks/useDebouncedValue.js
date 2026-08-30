import { useEffect, useState } from "react"

// Atrasa a propagação de `value` em `delay` ms.
// Uso: o input de busca atualiza na hora (UI responsiva); o valor debounced
// é o que entra no queryKey, então o request só dispara depois da pausa.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
