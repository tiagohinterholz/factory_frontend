import { useState } from "react"
import {
  Hourglass,
  ClipboardList,
  ClipboardCheck,
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
import StatCard from "@/modules/dashboard/components/StatCard"
import AppointmentCard from "@/modules/dashboard/components/AppointmentCard"
import MiniStat from "@/modules/dashboard/components/MiniStat"
import Quadro from "@/modules/dashboard/components/Quadro"
import StatusToggle from "@/modules/dashboard/components/StatusToggle"
import FinancialMonthCard from "@/modules/dashboard/components/FinancialMonthCard"
import { appointmentStatusLabel, APPOINTMENT_STATUS } from "@/modules/appointment/domain"
import { ORDER_STATUS } from "@/modules/order/domain"

function CardList({ items, emptyText, cardKey }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-muted">{emptyText}</p>
  }
  return (
    <div className="max-h-96 overflow-y-auto pr-1">
      <div className="flex flex-wrap items-start gap-3">
        {items.map((item) => (
          <AppointmentCard key={cardKey(item)} item={item} />
        ))}
      </div>
    </div>
  )
}

// Um quadro só cobrindo os 4 status do fluxo — Aguardando, Em Andamento, A
// Faturar e Faturadas — cada um como uma posição própria do toggle.
const FLOW_AWAITING = "awaiting"
const FLOW_IN_PROGRESS = "in_progress"
const FLOW_TO_BILL = "to_bill"
const FLOW_BILLED = "billed"

export default function Dashboard() {
  const { loading, error, data, refetch } = useDashboard()
  const { canManageFinancial } = usePermissions()
  const [flowFilter, setFlowFilter] = useState(FLOW_IN_PROGRESS)

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

  const inProgressCards = serviceCards.filter(
    (item) => appointmentStatusLabel(item) === APPOINTMENT_STATUS.IN_PROGRESS,
  )
  const awaitingCards = serviceCards.filter(
    (item) => appointmentStatusLabel(item) === APPOINTMENT_STATUS.AWAITING,
  )
  const toBillCards = movementCards.filter(
    (item) => appointmentStatusLabel(item) === ORDER_STATUS.TO_BILL,
  )
  const billedCards = movementCards.filter(
    (item) => appointmentStatusLabel(item) === ORDER_STATUS.BILLED,
  )

  const flowOptions = [
    { id: FLOW_AWAITING, label: "Aguardando Execução", count: awaitingCards.length },
    { id: FLOW_IN_PROGRESS, label: "Em Andamento", count: inProgressCards.length },
    { id: FLOW_TO_BILL, label: "A Faturar", count: toBillCards.length },
    { id: FLOW_BILLED, label: "Faturadas", count: billedCards.length },
  ]
  const FLOW_CARDS = {
    [FLOW_AWAITING]: awaitingCards,
    [FLOW_IN_PROGRESS]: inProgressCards,
    [FLOW_TO_BILL]: toBillCards,
    [FLOW_BILLED]: billedCards,
  }
  const FLOW_EMPTY_TEXT = {
    [FLOW_AWAITING]: "Nenhum atendimento aguardando execução.",
    [FLOW_IN_PROGRESS]: "Nenhum atendimento em andamento.",
    [FLOW_TO_BILL]: "Nenhuma OS a faturar.",
    [FLOW_BILLED]: "Nenhuma OS faturada ainda.",
  }
  const flowCards = FLOW_CARDS[flowFilter]
  const flowEmptyText = FLOW_EMPTY_TEXT[flowFilter]
  const totalFlowCards =
    awaitingCards.length + inProgressCards.length + toBillCards.length + billedCards.length

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
        title="Atendimentos e Movimentação"
        subtitle={`${totalFlowCards} agendamentos no total — filtra por status`}
        aside={
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            {totalScheduledThisWeek != null && (
              <MiniStat
                tone="ok"
                icon={CalendarDays}
                label="Agendados na semana"
                value={totalScheduledThisWeek}
              />
            )}
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
        <StatusToggle options={flowOptions} value={flowFilter} onChange={setFlowFilter} />
        <div className="mt-3">
          <CardList items={flowCards} emptyText={flowEmptyText} cardKey={cardKey} />
        </div>
      </Quadro>

      {canManageFinancial && financial && (
        <FinancialMonthCard breakdown={financial.entries_by_status} />
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
