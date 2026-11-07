import { formatMoney } from "@/modules/core/utils/format"
import { SERIES, niceMax } from "./charts"

export default function CategoryBreakdownChart({ rows = [] }) {
  const max = niceMax(
    Math.max(0, ...rows.flatMap((row) => SERIES.map((s) => Number(row[s.key]) || 0))),
  )

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Nada realizado no período.</p>
  }

  return (
    <ul className="space-y-3" aria-label="Entradas e saídas por categoria">
      {rows.map((row) => (
        <li key={row.category_id ?? "none"}>
          <p className="mb-1 text-[13px] font-medium text-ink">{row.name}</p>
          <div className="space-y-[2px]">
            {SERIES.map((s) => {
              const value = Number(row[s.key]) || 0
              return (
                <div
                  key={s.key}
                  className="flex items-center gap-2"
                  title={`${row.name} · ${s.label}: ${formatMoney(value)}`}
                >
                  <div className="h-2.5 flex-1 rounded-r bg-ground">
                    {value > 0 && (
                      <div
                        className="h-2.5 rounded-r"
                        style={{ width: `${(value / max) * 100}%`, backgroundColor: s.color }}
                      />
                    )}
                  </div>
                  <span className="w-28 text-right text-[12px] tabular-nums text-muted">
                    {formatMoney(value)}
                  </span>
                </div>
              )
            })}
          </div>
        </li>
      ))}
    </ul>
  )
}
