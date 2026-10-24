import { useId, useState } from "react"
import { X } from "lucide-react"

export default function TagInput({ value = [], onChange, suggestions = [], disabled = false }) {
  const inputId = useId()
  const listId = useId()
  const [draft, setDraft] = useState("")

  function add(raw) {
    const name = raw.split(/\s+/).filter(Boolean).join(" ")
    if (!name) return
    if (value.some((tag) => tag.toLowerCase() === name.toLowerCase())) {
      setDraft("")
      return
    }
    onChange([...value, name])
    setDraft("")
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      add(draft)
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="label-premium">
        Tags
      </label>
      <div className="input-premium flex flex-wrap items-center gap-1.5 !py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-semibold text-brand"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== tag))}
                title={`Remover tag ${tag}`}
                aria-label={`Remover tag ${tag}`}
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            id={inputId}
            list={listId}
            className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => add(draft)}
            placeholder={value.length ? "" : "Digite e tecle Enter"}
          />
        )}
      </div>
      <datalist id={listId}>
        {suggestions
          .filter((tag) => !value.includes(tag))
          .map((tag) => (
            <option key={tag} value={tag} />
          ))}
      </datalist>
    </div>
  )
}
