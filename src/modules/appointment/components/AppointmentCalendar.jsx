import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Car,
  Phone,
  ClipboardList,
  FileText,
} from "lucide-react"
import { Link } from "react-router-dom"
import { appointmentWhen } from "@/modules/appointment/domain"

function clientName(appointment) {
  const client = appointment.client
  if (!client) return "Cliente"
  return (
    client.display_name ||
    `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() ||
    "Cliente"
  )
}

function vehicleName(appointment) {
  const vehicle = appointment.vehicle
  if (!vehicle) return ""
  return `${vehicle.manufacturer ?? ""} ${vehicle.model ?? ""}`.trim()
}

const shortcutClass =
  "inline-flex items-center gap-0.5 rounded border border-line px-1 py-0.5 text-[9px] font-semibold text-brand hover:bg-brand-subtle transition-colors"

const relatedLinkClass =
  "flex items-center gap-1 truncate text-[9px] font-semibold text-brand hover:underline"

function CalendarAppointmentCard({ appointment }) {
  const orderId = appointment.order?.id ?? null
  const budgetId = appointment.budget?.id ?? null
  const clientId = appointment.client?.id ?? null
  const vehicleId = appointment.vehicle?.id ?? null
  const canCreateLinked = clientId != null && vehicleId != null
  const prefill = { clientId, vehicleId, appointmentId: appointment.id }
  const name = clientName(appointment)
  const vehicle = vehicleName(appointment)

  return (
    <div
      data-appointment-card
      className="flex flex-col gap-0.5 overflow-hidden rounded-lg border-l-4 border-brand bg-surface p-2 shadow-card transition-all hover:border-brand-hover hover:shadow-pop"
    >
      <Link
        to={`/agendamentos/${appointment.id}`}
        aria-label={`Abrir agendamento de ${name}`}
        className="flex flex-col gap-0.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="flex items-center gap-1 truncate text-[10px] font-black uppercase text-brand">
          <User size={10} className="shrink-0" />
          <span className="truncate">{name}</span>
        </span>
        <span className="flex items-center gap-1 truncate text-[9px] font-bold text-muted">
          <Clock size={10} className="shrink-0" />
          {appointmentWhen(appointment.date, appointment.time)}
        </span>
        {(vehicle || appointment.vehicle?.plate) && (
          <span className="flex items-center gap-1 truncate text-[9px] text-muted">
            <Car size={10} className="shrink-0" />
            <span className="truncate">
              {[vehicle, appointment.vehicle?.plate].filter(Boolean).join(" · ")}
            </span>
          </span>
        )}
        {appointment.client?.phone && (
          <span className="flex items-center gap-1 truncate text-[9px] text-muted">
            <Phone size={10} className="shrink-0" />
            <span className="truncate">{appointment.client.phone}</span>
          </span>
        )}
      </Link>
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        {orderId != null ? (
          <Link to={`/ordens/${orderId}`} className={relatedLinkClass}>
            <ClipboardList size={10} className="shrink-0" />
            OS #{orderId}
          </Link>
        ) : (
          canCreateLinked && (
            <Link to="/ordens/novo" state={prefill} className={shortcutClass}>
              <Plus size={10} />
              Criar OS
            </Link>
          )
        )}
        {budgetId != null ? (
          <Link to={`/orcamentos/${budgetId}`} className={relatedLinkClass}>
            <FileText size={10} className="shrink-0" />
            Orçamento #{budgetId}
          </Link>
        ) : (
          orderId == null &&
          canCreateLinked && (
            <Link to="/orcamentos/novo" state={prefill} className={shortcutClass}>
              <Plus size={10} />
              Criar Orçamento
            </Link>
          )
        )}
      </div>
    </div>
  )
}

export default function AppointmentCalendar({ appointments, loading }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }, [currentDate])

  const hours = Array.from({ length: 14 }).map((_, i) => i + 7)

  const nextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(currentDate.getDate() + 7)
    setCurrentDate(next)
  }

  const prevWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(currentDate.getDate() - 7)
    setCurrentDate(prev)
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  const formatMonth = (date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  const isToday = (date) => {
    const now = new Date()
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  const getAppointmentsForDay = (date) => {
    return appointments.filter((app) => {
      const appDate = new Date(app.date + "T00:00:00")
      return (
        appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
      )
    })
  }

  return (
    <div className="bg-surface rounded-3xl border border-line overflow-hidden shadow-card">
      <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ground/60">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-ink capitalize">{formatMonth(currentDate)}</h2>
          <div className="flex bg-surface rounded-xl border border-line p-1 shadow-sm">
            <button
              title="Semana anterior"
              aria-label="Semana anterior"
              onClick={prevWeek}
              className="p-1.5 hover:bg-ground rounded-lg text-muted hover:text-ink transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={today}
              className="px-3 py-1.5 text-xs font-bold hover:bg-ground rounded-lg text-muted hover:text-ink transition-colors"
            >
              Hoje
            </button>
            <button
              title="Próxima semana"
              aria-label="Próxima semana"
              onClick={nextWeek}
              className="p-1.5 hover:bg-ground rounded-lg text-muted hover:text-ink transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <Link to="/agendamentos/novo" className="btn-primary">
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </Link>
      </div>

      <div className="relative overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
              <p className="text-muted font-bold text-sm">Atualizando...</p>
            </div>
          </div>
        )}
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b border-line bg-surface">
            <div className="p-4 border-r border-line/60"></div>
            {weekDays.map((date, i) => (
              <div
                key={i}
                className={`p-4 text-center border-r border-line/60 last:border-r-0 ${isToday(date) ? "bg-brand-subtle/40" : ""}`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${isToday(date) ? "text-brand" : "text-muted"}`}
                >
                  {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                </p>
                <p
                  className={`text-2xl font-black mt-1 ${isToday(date) ? "text-brand" : "text-ink"}`}
                >
                  {date.getDate()}
                </p>
                {isToday(date) && (
                  <div className="w-1.5 h-1.5 bg-brand rounded-full mx-auto mt-1"></div>
                )}
              </div>
            ))}
          </div>

          <div className="relative h-[700px] overflow-y-auto">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 min-h-[104px] border-b border-line/60 group"
              >
                <div className="p-2 text-right text-[10px] font-bold text-muted border-r border-line/60">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDays.map((date, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 border-r border-line/60 p-1 last:border-r-0 group-hover:bg-ground/60 transition-colors ${isToday(date) ? "bg-brand-subtle/20" : ""}`}
                  >
                    {getAppointmentsForDay(date)
                      .filter((app) => parseInt(app.time.split(":")[0]) === hour)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((app) => (
                        <CalendarAppointmentCard key={app.id} appointment={app} />
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
