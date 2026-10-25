import { SERIES } from "./charts"

export default function ChartLegend() {
  return (
    <ul className="flex items-center gap-4 text-[12px] text-muted" aria-label="Legenda">
      {SERIES.map((series) => (
        <li key={series.key} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: series.color }}
            aria-hidden="true"
          />
          {series.label}
        </li>
      ))}
    </ul>
  )
}
