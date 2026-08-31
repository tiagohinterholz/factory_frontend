export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-surface rounded-xl border border-line shadow-card p-4 flex items-center justify-between">
      <div>
        <p className="text-[13px] text-muted">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{value}</p>
      </div>
      {Icon && <Icon className="w-5 h-5 text-muted shrink-0" />}
    </div>
  )
}
