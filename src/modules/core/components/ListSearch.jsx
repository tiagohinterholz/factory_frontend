import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

export default function ListSearch({ onChange, placeholder = "Buscar...", delay = 300 }) {
  const [value, setValue] = useState("")
  const onChangeRef = useRef(onChange)
  const firstRun = useRef(true)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return undefined
    }
    const timer = setTimeout(() => onChangeRef.current(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        aria-label="Busca rápida"
        className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-8 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          title="Limpar busca"
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
