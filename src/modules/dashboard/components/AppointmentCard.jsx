import { Link, useNavigate } from "react-router-dom"
import { Clock, Phone, Car, ClipboardList, FileText, Plus } from "lucide-react"

function formatWhen(date, time) {
  if (!date) return ""
  const parsed = new Date(`${date}T${time || "00:00:00"}`)
  if (Number.isNaN(parsed.getTime())) return ""
  const options = time
    ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
    : { weekday: "short", day: "2-digit", month: "2-digit" }
  return parsed.toLocaleString("pt-BR", options)
}

// order / budget podem vir como id cru, objeto { id } ou (legado) *_id.
function relationId(value, legacy) {
  return value?.id ?? value ?? legacy ?? null
}

export default function AppointmentCard({ item }) {
  const navigate = useNavigate()
  const orderId = relationId(item.order, item.order_id)
  const budgetId = relationId(item.budget, item.budget_id)
  const clientId = item.client_id ?? item.client?.id ?? null
  const vehicleId = item.vehicle_id ?? item.vehicle?.id ?? null
  const prefill = { clientId, vehicleId }

  // O card inteiro abre a edição do agendamento; os links internos (contato,
  // OS/orçamento, atalhos de criação) param a propagação pra não disparar isso.
  const editable = item.id != null
  const openAppointment = () => navigate(`/agendamentos/${item.id}`)
  const stop = (event) => event.stopPropagation()

  return (
    <div
      className={`w-full sm:w-64 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-card flex flex-col gap-1 leading-tight ${
        editable
          ? "cursor-pointer transition-colors hover:border-brand hover:bg-brand-subtle/30"
          : ""
      }`}
      {...(editable && {
        role: "button",
        tabIndex: 0,
        onClick: openAppointment,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openAppointment()
          }
        },
        "aria-label": `Editar agendamento de ${item.client_name}`,
      })}
    >
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
          onClick={stop}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {item.contact}
        </a>
      )}

      <div className="flex flex-col items-start gap-1 pt-1.5 mt-0.5 border-t border-line">
        {orderId != null ? (
          <Link
            to={`/ordens/${orderId}`}
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            OS #{orderId}
          </Link>
        ) : (
          <Link
            to="/ordens/novo"
            state={prefill}
            onClick={stop}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand border border-line rounded-md px-1.5 py-0.5 hover:bg-brand-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar OS
          </Link>
        )}

        {budgetId != null ? (
          <Link
            to={`/orcamentos/${budgetId}`}
            onClick={stop}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            Orçamento #{budgetId}
          </Link>
        ) : (
          <Link
            to="/orcamentos/novo"
            state={prefill}
            onClick={stop}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand border border-line rounded-md px-1.5 py-0.5 hover:bg-brand-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Orçamento
          </Link>
        )}
      </div>
    </div>
  )
}
