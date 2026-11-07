import { useState } from "react"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"

const CREATE_OPTION_VALUE = "__live-select-create__"

export default function LiveSelect({
  label,
  options = [],
  value,
  onChange,
  getSearchText,
  error,
  disabled = false,
  disabledHint,
  createLabel = "Cadastrar novo",
  onCreateNew,
  extraOption,
}) {
  const [query, setQuery] = useState("")

  const allOptions =
    extraOption && !options.some((option) => String(option.id) === String(extraOption.id))
      ? [extraOption, ...options]
      : options

  const searchText = (option) => (getSearchText ? getSearchText(option) : (option.name ?? ""))

  const filtered =
    query === ""
      ? allOptions
      : allOptions.filter((option) =>
          searchText(option).toLowerCase().includes(query.toLowerCase()),
        )

  const selected = allOptions.find((option) => String(option.id) === String(value ?? "")) ?? null
  const showCreateShortcut = Boolean(onCreateNew)
  const placeholder =
    disabled && disabledHint ? disabledHint : `Selecione o(a) ${label?.toLowerCase()}`

  function handleChange(newValue) {
    setQuery("")
    if (newValue === CREATE_OPTION_VALUE) {
      onCreateNew?.()
      return
    }
    onChange?.(newValue)
  }

  return (
    <Combobox value={value ?? ""} onChange={handleChange} disabled={disabled} immediate>
      <div className="flex flex-col group">
        <label className="label-premium group-focus-within:text-brand transition-colors">
          {label}
        </label>
        <div className="relative">
          <ComboboxInput
            className={`input-premium pr-10 ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-text"
            } ${error ? "border-danger focus:border-danger focus:ring-danger/15" : ""}`}
            displayValue={() => selected?.name ?? ""}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            <ChevronDown className="w-4 h-4" />
          </ComboboxButton>
        </div>
        <ComboboxOptions
          anchor="bottom start"
          className="z-[120] w-[var(--input-width)] rounded-lg border border-line bg-surface shadow-pop py-1 text-sm [--anchor-gap:4px] focus:outline-none empty:hidden"
        >
          {showCreateShortcut && (
            <ComboboxOption
              value={CREATE_OPTION_VALUE}
              className="px-3 py-1.5 cursor-pointer text-brand font-medium border-b border-line data-[focus]:bg-brand-subtle"
            >
              {createLabel}
            </ComboboxOption>
          )}
          {filtered.map((option) => (
            <ComboboxOption
              key={String(option.id)}
              value={String(option.id)}
              className="group flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer text-ink data-[focus]:bg-brand-subtle"
            >
              <span className="truncate">{option.name}</span>
              <Check className="w-3.5 h-3.5 shrink-0 text-brand opacity-0 group-data-[selected]:opacity-100" />
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </Combobox>
  )
}
