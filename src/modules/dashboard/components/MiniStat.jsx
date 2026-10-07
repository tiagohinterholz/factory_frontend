const MINI_STAT_TONE = {
  warn: "text-amber-600",
  danger: "text-rose-600",
  ok: "text-emerald-600",
  info: "text-info",
}

export default function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1">
      <Icon className={`w-3.5 h-3.5 ${MINI_STAT_TONE[tone] ?? "text-muted"}`} />
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-sm font-bold text-ink tabular-nums">{value}</span>
    </span>
  )
}
