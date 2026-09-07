import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"

// Dropdown 100% React (Headless UI) — NÃO usa o <select> nativo, então um
// re-render por trás não fecha o menu (era o que quebrava os filtros no
// Chromium). Mesmo contrato do SelectField: options [{ id, name }], `value`
// string, `onChange(value)`.
export default function FilterSelect({ label, options = [], value, onChange, placeholder }) {
  const items = [
    { id: "", name: placeholder ?? `Selecione o(a) ${label?.toLowerCase()}` },
    ...options,
  ]
  const selected = items.find((item) => String(item.id) === String(value ?? "")) ?? items[0]

  return (
    <Listbox value={value ?? ""} onChange={onChange}>
      <div className="flex flex-col">
        <label className="label-premium">{label}</label>
        <ListboxButton className="input-premium flex items-center justify-between gap-2 text-left cursor-pointer">
          <span className={selected.id ? "text-ink truncate" : "text-muted truncate"}>
            {selected.name}
          </span>
          <ChevronDown className="w-4 h-4 shrink-0 text-muted" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          className="z-[120] w-[var(--button-width)] rounded-lg border border-line bg-surface shadow-pop py-1 text-sm [--anchor-gap:4px] focus:outline-none"
        >
          {items.map((item) => (
            <ListboxOption
              key={String(item.id)}
              value={String(item.id)}
              className="group flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer text-ink data-[focus]:bg-brand-subtle"
            >
              <span className={item.id ? "truncate" : "text-muted truncate"}>{item.name}</span>
              <Check className="w-3.5 h-3.5 shrink-0 text-brand opacity-0 group-data-[selected]:opacity-100" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
