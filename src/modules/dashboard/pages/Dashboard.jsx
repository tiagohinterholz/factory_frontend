import {
  Hourglass,
  ClipboardList,
  ClipboardCheck,
  Wallet,
  CheckCircle2,
  FileText,
  Users,
  Car,
  Factory,
  Package,
  Wrench,
  CalendarDays,
} from "lucide-react"
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import SummaryCard from "@/modules/dashboard/components/SummaryCard"
import StatCard from "@/modules/dashboard/components/StatCard"
import AppointmentCard from "@/modules/dashboard/components/AppointmentCard"
import { appointmentStatusLabel } from "@/modules/appointment/domain"
import { ORDER_STATUS } from "@/modules/order/domain"
import { formatMoney } from "@/modules/core/utils/format"

const MINI_STAT_TONE = {
  warn: "text-amber-600",
  danger: "text-rose-600",
  ok: "text-emerald-600",
}

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1">
      <Icon className={`w-3.5 h-3.5 ${MINI_STAT_TONE[tone] ?? "text-muted"}`} />
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-sm font-bold text-ink tabular-nums">{value}</span>
    </span>
  )
}

function Quadro({ title, subtitle, aside, children }) {
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

// Bloco menor dentro de um Quadro — cada um com sua própria rolagem, pra
// dividir "Movimentação" em "A faturar" e "Faturadas" sem um crescer o dobro.
function Subquadro({ title, items, emptyText, cardKey }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[12.5px] font-semibold text-ink">{title}</h3>
        <span className="text-[11px] font-bold text-muted tabular-nums">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[12.5px] text-muted">{emptyText}</p>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-start gap-3">
            {items.map((item) => (
              <AppointmentCard key={cardKey(item)} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { loading, error, data, refetch } = useDashboard()
  const { isAdmin } = usePermissions()

  if (loading) {
    return <div className="p-10 text-center text-muted">Carregando dashboard...</div>
  }

  if (error || !data) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-sm text-muted">Não foi possível carregar o dashboard.</p>
        <button type="button" onClick={() => refetch()} className="btn-primary mx-auto">
          Tentar de novo
        </button>
      </div>
    )
  }

  const activity = data.activity ?? {}
  // "Atendimentos" (aguardando/em andamento) e "Movimentação" (a faturar/
  // faturado) já vêm separados em chaves distintas — o back que filtra, o
  // front só exibe cada lista no quadro certo.
  const serviceCards = data.appointments?.scheduled_this_week ?? []
  const totalScheduledThisWeek = data.appointments?.total_scheduled_this_week
  const movementCards = data.movements?.bills_this_week ?? []
  const financial = data.financial ?? null
  const summary = data.summary ?? {}

  const cardKey = (item) => item.id ?? `${item.client_name}-${item.date}-${item.time}`
  const toBillCards = movementCards.filter(
    (item) => appointmentStatusLabel(item) === ORDER_STATUS.TO_BILL,
  )
  const billedCards = movementCards.filter(
    (item) => appointmentStatusLabel(item) === ORDER_STATUS.BILLED,
  )

  const summaryStats = [
    { title: "Clientes", value: summary.clients ?? 0, icon: Users },
    { title: "Veículos", value: summary.vehicles ?? 0, icon: Car },
    { title: "Fornecedores", value: summary.suppliers ?? 0, icon: Factory },
    { title: "Produtos", value: summary.products ?? 0, icon: Package },
    { title: "Serviços", value: summary.services ?? 0, icon: Wrench },
    { title: "Agendamentos", value: summary.appointments ?? 0, icon: CalendarDays },
    { title: "Orçamentos", value: summary.budgets ?? 0, icon: FileText },
    { title: "Ordens de Serviço", value: summary.orders ?? 0, icon: ClipboardList },
  ]

  return (
    <div className="space-y-6">
      <Quadro
        title="Movimentação"
        subtitle="OS com serviço concluído — a faturar e faturadas"
        aside={
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            <MiniStat
              tone="warn"
              icon={Hourglass}
              label="A faturar hoje"
              value={activity.orders_to_bill_today ?? 0}
            />
            <MiniStat
              tone="danger"
              icon={ClipboardList}
              label="A faturar"
              value={activity.orders_to_bill ?? 0}
            />
            <MiniStat
              tone="ok"
              icon={ClipboardCheck}
              label="Faturadas"
              value={activity.orders_billed ?? 0}
            />
          </div>
        }
      >
        {movementCards.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhuma OS a faturar ou faturada por aqui.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Subquadro
              title="A faturar"
              items={toBillCards}
              emptyText="Nenhuma OS a faturar."
              cardKey={cardKey}
            />
            <Subquadro
              title="Faturadas"
              items={billedCards}
              emptyText="Nenhuma OS faturada ainda."
              cardKey={cardKey}
            />
          </div>
        )}
      </Quadro>

      <Quadro
        title="Atendimentos"
        subtitle="Aguardando execução e em andamento"
        aside={
          totalScheduledThisWeek != null && (
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-ink tabular-nums leading-tight">
                {totalScheduledThisWeek}
              </p>
              <p className="text-[12.5px] text-muted mt-0.5">Clientes agendados na semana</p>
            </div>
          )
        }
      >
        {serviceCards.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum atendimento em aberto.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start gap-3">
              {serviceCards.map((item) => (
                <AppointmentCard key={cardKey(item)} item={item} />
              ))}
            </div>
          </div>
        )}
      </Quadro>

      {isAdmin && financial && (
        <Quadro title="Financeiro do mês" subtitle="Operação do mês vigente">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              flat
              tone="info"
              icon={Wallet}
              title="A faturar"
              value={formatMoney(financial.to_bill_total)}
            />
            <SummaryCard
              flat
              tone="ok"
              icon={CheckCircle2}
              title="Faturado"
              value={formatMoney(financial.billed_total)}
            />
            <SummaryCard
              flat
              tone="warn"
              icon={FileText}
              title="Orçamentos em aberto"
              value={formatMoney(financial.open_budgets_total)}
            />
          </div>
        </Quadro>
      )}

      <Quadro title="Resumo" subtitle="Totais do empreendimento">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat) => (
            <StatCard
              key={stat.title}
              flat
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      </Quadro>
    </div>
  )
}
