import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { formatDate, formatMoney } from "@/modules/core/utils/format"
import { FINANCIAL_MONTH_STATUS_META } from "@/modules/dashboard/domain/financial-month"

const DOT_TONE = {
  ok: "bg-ok",
  info: "bg-info",
  danger: "bg-danger",
  muted: "bg-muted",
}

// "OS #<id>" pro lançamento automático de faturamento (nasce vinculado a
// uma ordem de serviço); description em si, quando existe (lançamento
// manual — aluguel/folha/outro); "Lançamento #<id>" como último recurso.
function entryLabel(entry) {
  if (entry.order?.id) return `OS #${entry.order.id}`
  return entry.description || `Lançamento #${entry.id}`
}

export default function FinancialMonthEntryRow({ entry }) {
  const dotTone = DOT_TONE[FINANCIAL_MONTH_STATUS_META[entry.status]?.tone] ?? "bg-muted"

  return (
    <Link
      to={`/financeiro/${entry.id}`}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 transition-colors hover:border-brand hover:bg-brand-subtle/30"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotTone}`} />
      <span className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink truncate">{entryLabel(entry)}</p>
        <p className="text-[11.5px] text-muted">Vencimento {formatDate(entry.due_date)}</p>
      </span>
      <span className="text-[13.5px] font-bold text-ink tabular-nums shrink-0">
        {formatMoney(entry.amount)}
      </span>
      <ChevronRight className="w-4 h-4 text-muted shrink-0" />
    </Link>
  )
}
