import { useState } from "react"

// Ordenação de uma listagem no formato do DRF: `ordering` é a string mandada no
// ?ordering= — "campo" (crescente), "-campo" (decrescente) ou "" (sem ordenar).
// `toggle(key)` cicla no mesmo campo: asc -> desc -> sem ordenação.
export function useListSort(onChanged) {
  const [ordering, setOrdering] = useState("")

  function toggle(key) {
    setOrdering((current) => {
      if (current === key) return `-${key}`
      if (current === `-${key}`) return ""
      return key
    })
    onChanged?.()
  }

  return { ordering, toggle }
}
