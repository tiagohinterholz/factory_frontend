export default function Quadro({ title, subtitle, aside, children }) {
  return (
    <section className="rounded-xl border border-line bg-ground p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-[12.5px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}
