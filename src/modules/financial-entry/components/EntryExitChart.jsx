import { formatMoney } from "@/modules/core/utils/format"
import { SERIES, compactMoney, niceTicks } from "./charts"

const WIDTH = 640
const HEIGHT = 240
const PAD = { top: 12, right: 8, bottom: 28, left: 64 }

export default function EntryExitChart({ series = [] }) {
  const plotWidth = WIDTH - PAD.left - PAD.right
  const plotHeight = HEIGHT - PAD.top - PAD.bottom
  const { top: max, ticks } = niceTicks(
    Math.max(0, ...series.flatMap((row) => SERIES.map((s) => Number(row[s.key]) || 0))),
  )
  const band = series.length ? plotWidth / series.length : plotWidth
  const barWidth = Math.max(2, Math.min(18, (band - 8) / 2 - 1))
  const y = (value) => PAD.top + plotHeight - (Number(value) / max) * plotHeight
  const labelEvery = Math.max(1, Math.ceil(series.length / 12))

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Entradas e saídas por período"
    >
      {ticks.map((value) => {
        return (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(value)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {compactMoney(value)}
            </text>
          </g>
        )
      })}
      {series.map((row, index) => {
        const center = PAD.left + band * index + band / 2
        return (
          <g key={row.period} data-testid="period-group">
            <rect
              x={PAD.left + band * index}
              y={PAD.top}
              width={band}
              height={plotHeight}
              fill="transparent"
            >
              <title>
                {`${row.label}: entradas ${formatMoney(row.inflow)}, saídas ${formatMoney(row.outflow)}`}
              </title>
            </rect>
            {SERIES.map((s, seriesIndex) => {
              const value = Number(row[s.key]) || 0
              const height = Math.max(0, PAD.top + plotHeight - y(value))
              const x = seriesIndex === 0 ? center - barWidth - 1 : center + 1
              return value > 0 ? (
                <path
                  key={s.key}
                  d={roundedTopBar(x, y(value), barWidth, height)}
                  fill={s.color}
                  pointerEvents="none"
                />
              ) : null
            })}
            {index % labelEvery === 0 && (
              <text x={center} y={HEIGHT - 10} textAnchor="middle" fontSize="10" fill="#6b7280">
                {row.label}
              </text>
            )}
          </g>
        )
      })}
      <line
        x1={PAD.left}
        x2={WIDTH - PAD.right}
        y1={PAD.top + plotHeight}
        y2={PAD.top + plotHeight}
        stroke="#9ca3af"
        strokeWidth="1"
      />
    </svg>
  )
}

function roundedTopBar(x, top, width, height) {
  const radius = Math.min(4, width / 2, height)
  const bottom = top + height
  return [
    `M${x},${bottom}`,
    `V${top + radius}`,
    `Q${x},${top} ${x + radius},${top}`,
    `H${x + width - radius}`,
    `Q${x + width},${top} ${x + width},${top + radius}`,
    `V${bottom}`,
    "Z",
  ].join(" ")
}
