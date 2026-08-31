const TONES = {
  brand: "border-l-brand text-brand bg-brand-subtle/30",
  ok: "border-l-ok text-ok bg-ok-subtle/30",
  warn: "border-l-warn text-warn bg-warn-subtle/30",
  danger: "border-l-danger text-danger bg-danger-subtle/30",
  info: "border-l-info text-info bg-info-subtle/30",
}

export default function HighlightCard({ title, icon: Icon, tone = "brand", value, flat = false }) {
  const [border, text, wash] = (TONES[tone] || TONES.brand).split(" ")
  return (
    <div
      className={`rounded-xl border border-line border-l-4 ${border} ${wash} ${
        flat ? "" : "shadow-card"
      } p-4`}
    >
      <div className={`flex items-center gap-2 ${text}`}>
        {Icon && <Icon className="w-4 h-4" />}
        <h3 className="font-medium text-ink text-sm">{title}</h3>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink tabular-nums">{value}</p>
    </div>
  )
}
