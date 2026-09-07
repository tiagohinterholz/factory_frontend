import { useEffect, useState } from "react"
import { SlidersHorizontal, ChevronDown, X } from "lucide-react"
import FilterSelect from "@/modules/core/components/FilterSelect"
import FormField from "@/modules/core/components/FormField"

// Botão "Filtros" + painel. `fields`: [{ name, label, type: "select"|"date"|"text", options? }].
// `value` são os filtros aplicados; o painel edita um rascunho e só dispara
// `onApply(next)` no "Filtrar"/"Limpar". Os selects usam FilterSelect (dropdown
// React, não <select> nativo). Fecha por botão, X ou Esc.
export default function ListFilters({ fields, value, onApply }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const activeCount = fields.filter((field) => value[field.name]).length
  const emptyDraft = Object.fromEntries(fields.map((field) => [field.name, ""]))

  const setValue = (name) => (next) => setDraft((current) => ({ ...current, [name]: next }))

  function toggle() {
    setDraft(value)
    setOpen((current) => !current)
  }

  function apply() {
    onApply(draft)
    setOpen(false)
  }

  function clear() {
    setDraft(emptyDraft)
    onApply(emptyDraft)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-ground hover:text-ink"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {activeCount > 0 && (
          <span className="rounded-full bg-brand text-brand-fg text-[11px] font-bold px-1.5 leading-5 tabular-nums">
            {activeCount}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="fixed inset-x-3 top-24 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface shadow-pop p-4 space-y-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 sm:max-h-none sm:overflow-visible">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink">Filtros (todos opcionais)</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar filtros"
              className="-mr-1 rounded p-1 text-muted hover:bg-ground hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {fields.map((field) =>
            field.type === "select" ? (
              <FilterSelect
                key={field.name}
                label={field.label}
                options={field.options}
                value={draft[field.name] ?? ""}
                onChange={setValue(field.name)}
              />
            ) : (
              <FormField
                key={field.name}
                label={field.label}
                type={field.type === "date" ? "date" : "text"}
                value={draft[field.name] ?? ""}
                onChange={(event) => setValue(field.name)(event.target.value)}
              />
            ),
          )}

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={clear} className="text-[13px] text-muted hover:text-ink">
              Limpar
            </button>
            <button
              type="button"
              onClick={apply}
              className="btn-primary !px-3 !py-1.5 !text-[13px]"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
