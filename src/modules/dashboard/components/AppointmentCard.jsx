import { Link } from "react-router-dom"
import { Clock, Phone, Car, ClipboardList } from "lucide-react"

function formatWhen(date, time) {
  if (!date) return ""
  const parsed = new Date(`${date}T${time || "00:00:00"}`)
  if (Number.isNaN(parsed.getTime())) return ""
  const options = time
    ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
    : { weekday: "short", day: "2-digit", month: "2-digit" }
  return parsed.toLocaleString("pt-BR", options)
}

export default function AppointmentCard({ item }) {
  return (
    <div className="w-full sm:w-64 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-card flex flex-col gap-1 leading-tight">
      <p className="font-semibold text-ink text-sm truncate">{item.client_name}</p>

      <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {formatWhen(item.date, item.time)}
      </p>

      {item.vehicle && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <Car className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{item.vehicle}</span>
        </p>
      )}

      {item.contact && (
        <a
          href={`tel:${String(item.contact).replace(/[^\d+]/g, "")}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {item.contact}
        </a>
      )}

      {item.order_id != null ? (
        <Link
          to={`/ordens/${item.order_id}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          OS #{item.order_id}
        </Link>
      ) : (
        <span className="text-[12px] text-muted">Sem OS vinculada</span>
      )}
    </div>
  )
}
