import { Link } from "react-router-dom"
import { formatDate, formatMoney } from "@/modules/core/utils/format"

// "OS #<id>" pro lançamento automático de faturamento (nasce vinculado a uma
// ordem de serviço); description em si, quando existe (lançamento manual —
// aluguel/folha/outro); "Lançamento #<id>" como último recurso.
function entryLabel(entry) {
  if (entry.order?.id) return `OS #${entry.order.id}`
  return entry.description || `Lançamento #${entry.id}`
}

export default function FinancialMonthEntryCard({ entry }) {
  return (
    <Link
      to={`/financeiro/${entry.id}`}
      className="w-36 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-card flex flex-col gap-1.5 transition-colors hover:border-brand hover:bg-brand-subtle/30"
    >
      <span className="text-[12.5px] font-semibold text-ink truncate">{entryLabel(entry)}</span>
      <span className="text-[11px] text-muted">{formatDate(entry.due_date)}</span>
      <p className="text-[14px] font-bold text-ink tabular-nums mt-1">
        {formatMoney(entry.amount)}
      </p>
    </Link>
  )
}
