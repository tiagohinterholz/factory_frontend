// Sem `tone` no option: toggle neutro (usado no fluxo de
// Aguardando/Em Andamento/A Faturar/Faturadas e no filtro de Tipo) — ativo
// sempre vira brand. Com `tone` ("ok"/"info"/"danger"/"muted"): cada opção
// já nasce com a cor semântica do próprio status (mesmo inativa), e o ativo
// vira essa cor sólida em vez de brand — usado no filtro de Status do card
// "Financeiro do mês".
const TONE_IDLE = {
  ok: "text-ok",
  info: "text-info",
  danger: "text-danger",
  muted: "text-muted",
}

const TONE_ACTIVE = {
  ok: "bg-ok text-white",
  info: "bg-info text-white",
  danger: "bg-danger text-white",
  muted: "bg-muted text-white",
}

export default function StatusToggle({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1 shrink-0 flex-wrap">
      {options.map((option) => {
        const active = value === option.id
        const toneClass = active
          ? (TONE_ACTIVE[option.tone] ?? "bg-brand text-brand-fg")
          : (TONE_IDLE[option.tone] ?? "text-muted hover:bg-ground hover:text-ink")

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ${toneClass}`}
          >
            {option.label}
            <span
              className={`tabular-nums rounded-full px-1.5 text-[10.5px] ${
                active ? "bg-white/25" : "bg-ground"
              }`}
            >
              {option.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
