const OPTIONS = [
  { id: "PF", label: "Pessoa Física" },
  { id: "PJ", label: "Pessoa Jurídica" },
]

export default function ClientTypeToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
      {OPTIONS.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-md px-3 py-1.5 text-[12.5px] font-bold transition-colors ${
              active ? "bg-brand text-brand-fg" : "text-muted hover:bg-ground hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
