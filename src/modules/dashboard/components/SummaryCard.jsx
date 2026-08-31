const TONES = {
  brand: "bg-brand-subtle text-brand",
  ok: "bg-ok-subtle text-ok",
  warn: "bg-warn-subtle text-warn",
  info: "bg-info-subtle text-info",
}

export default function SummaryCard({ title, value, icon: Icon, tone = "brand" }) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-xl border border-line shadow-card p-4">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${TONES[tone]}`}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-muted truncate">{title}</p>
        <p className="text-lg font-semibold text-ink mt-0.5 tabular-nums">{value}</p>
      </div>
    </div>
  )
}
