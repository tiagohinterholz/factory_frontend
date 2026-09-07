import { memo, useEffect, useState } from "react"
import { SlidersHorizontal, ChevronDown, X } from "lucide-react"
import SelectField from "@/modules/core/components/SelectField"
import FormField from "@/modules/core/components/FormField"

// Botão "Filtros" + painel. `fields` descreve os campos:
//   { name, label, type: "select" | "date" | "text", options? }
// `value` é o objeto de filtros JÁ aplicado; `onApply(next)` dispara a busca.
// O painel edita um rascunho e só aplica no "Filtrar" (ou "Limpar").
//
// React.memo + props estáveis (fields memoizado no pai, onApply via useCallback)
// pra NÃO re-renderizar quando o pai re-renderiza (ex.: refetch da lista). Se o
// <select> reconcilia com o popup nativo aberto, o Chromium fecha ele — foi o
// que dava "o dropdown abre e não para pra selecionar" em prod.
//
// Também não fecha ao clicar fora: qualquer listener de mouse no document
// derruba o mesmo popup. Fecha pelo botão "Filtros", pelo X, pelo
// Filtrar/Limpar e por Esc.
function ListFilters({ fields, value, onApply }) {
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

  const setField = (name) => (event) =>
    setDraft((current) => ({ ...current, [name]: event.target.value }))

  // abrir sincroniza o rascunho com o que está aplicado (sem efeito)
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
              <SelectField
                key={field.name}
                label={field.label}
                options={field.options}
                value={draft[field.name] ?? ""}
                onChange={setField(field.name)}
              />
            ) : (
              <FormField
                key={field.name}
                label={field.label}
                type={field.type === "date" ? "date" : "text"}
                value={draft[field.name] ?? ""}
                onChange={setField(field.name)}
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

export default memo(ListFilters)
