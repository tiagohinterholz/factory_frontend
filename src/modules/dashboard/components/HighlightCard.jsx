const TONES = {
  brand: "border-l-brand text-brand",
  ok: "border-l-ok text-ok",
  warn: "border-l-warn text-warn",
  danger: "border-l-danger text-danger",
  info: "border-l-info text-info",
}

export default function HighlightCard({ title, icon: Icon, tone = "brand", value }) {
  const [border, text] = (TONES[tone] || TONES.brand).split(" ")
  return (
    <div
      className={`bg-surface rounded-xl border border-line border-l-4 ${border} shadow-card p-4`}
    >
      <div className={`flex items-center gap-2 ${text}`}>
        {Icon && <Icon className="w-4 h-4" />}
        <h3 className="font-medium text-ink text-sm">{title}</h3>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink tabular-nums">{value}</p>
    </div>
  )
}
