import { Link } from "react-router-dom"
import { Calendar, User, Car, Wallet } from "lucide-react"
import { FINANCIAL_MONTH_STATUS_META } from "@/modules/dashboard/domain/financial-month"
import { formatDate, formatMoney } from "@/modules/core/utils/format"

const BADGE_TONE = {
  ok: "bg-ok/10 text-ok",
  info: "bg-info/10 text-info",
  danger: "bg-danger/10 text-danger",
  muted: "bg-ground text-muted",
}

// "OS #<id>" pro lançamento automático de faturamento (nasce vinculado a uma
// ordem de serviço); description em si, quando existe (lançamento manual —
// aluguel/folha/outro); "Lançamento #<id>" como último recurso.
function entryLabel(entry) {
  if (entry.order?.id) return `OS #${entry.order.id}`
  return entry.description || `Lançamento #${entry.id}`
}

// "Pago em X" quando já foi pago, "Vence em X" caso contrário — mesma ideia
// do statusDate condicional do AppointmentCard.
function dateLine(entry) {
  if (entry.status === "pago" && entry.payment_date) {
    return `Pago em ${formatDate(entry.payment_date)}`
  }
  return `Vence em ${formatDate(entry.due_date)}`
}

export default function FinancialMonthEntryCard({ entry }) {
  const meta = FINANCIAL_MONTH_STATUS_META[entry.status]
  const client = entry.order?.client
  const vehicle = entry.order?.vehicle

  return (
    <Link
      to={`/financeiro/${entry.id}`}
      className="w-full sm:w-64 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-card flex flex-col gap-1 leading-tight transition-colors hover:border-brand hover:bg-brand-subtle/30"
    >
      {meta && (
        <span
          className={`self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            BADGE_TONE[meta.tone] ?? BADGE_TONE.muted
          }`}
        >
          {meta.label}
        </span>
      )}

      <p className="font-semibold text-ink text-sm truncate">{entryLabel(entry)}</p>

      {client && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{client.display_name}</span>
        </p>
      )}

      {vehicle && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <Car className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {vehicle.manufacturer} {vehicle.model} · {vehicle.plate}
          </span>
        </p>
      )}

      <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>{dateLine(entry)}</span>
      </p>

      <div className="flex items-center justify-end gap-1.5 pt-1.5 mt-0.5 border-t border-line">
        <Wallet className="w-3.5 h-3.5 text-muted" />
        <span className="text-[14px] font-bold text-ink tabular-nums">
          {formatMoney(entry.amount)}
        </span>
      </div>
    </Link>
  )
}
