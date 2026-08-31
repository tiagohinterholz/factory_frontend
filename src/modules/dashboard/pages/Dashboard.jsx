import {
  Clock,
  Wallet,
  CheckCircle2,
  CalendarDays,
  Hourglass,
  MapPin,
  Users,
  Car,
  Factory,
  Package,
  Wrench,
  Receipt,
  ClipboardList,
} from "lucide-react"
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard"
import SummaryCard from "@/modules/dashboard/components/SummaryCard"
import StatCard from "@/modules/dashboard/components/StatCard"
import HighlightCard from "@/modules/dashboard/components/HighlightCard"

const brl = (value) =>
  `R$ ${Number(value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

export default function Dashboard() {
  const { loading, data } = useDashboard()

  if (loading) {
    return <div className="p-10 text-center text-muted">Carregando dashboard...</div>
  }

  const summary = data.summary_business
  const detail = data.detail_business

  const stats = [
    { title: "Clientes", value: summary.clients ?? 0, icon: Users },
    { title: "Veículos", value: summary.vehicles ?? 0, icon: Car },
    { title: "Fornecedores", value: summary.suppliers ?? 0, icon: Factory },
    { title: "Produtos", value: summary.products ?? 0, icon: Package },
    { title: "Serviços", value: summary.services ?? 0, icon: Wrench },
    { title: "Agendamentos", value: summary.appointments ?? 0, icon: CalendarDays },
    { title: "Orçamentos", value: summary.budgets ?? 0, icon: Receipt },
    { title: "Ordens de Serviço", value: summary.orders ?? 0, icon: ClipboardList },
  ]

  return (
    <div className="space-y-6">
      {/* Movimento — números que mudam ao longo do dia */}
      <section className="rounded-xl border border-line bg-ground p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Movimento</h2>
          <p className="text-[12.5px] text-muted mt-0.5">Números que mudam ao longo do dia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            flat
            title="Quantidade de OS a faturar hoje"
            icon={Hourglass}
            tone="warn"
            value={detail.to_invoice_today?.length ?? 0}
          />
          <HighlightCard
            flat
            title="Total de OS em andamento a faturar"
            icon={MapPin}
            tone="danger"
            value={detail.to_invoice_all?.length ?? 0}
          />
          <HighlightCard
            flat
            title="Clientes da semana"
            icon={Users}
            tone="info"
            value={detail.clients_on_week?.length ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            flat
            title="Orçamentos em análise"
            value={summary.budgets_wait ?? 0}
            icon={Clock}
            tone="warn"
          />
          <SummaryCard
            flat
            title="A faturar (R$)"
            value={brl(summary.orders_to_invoice)}
            icon={Wallet}
            tone="info"
          />
          <SummaryCard
            flat
            title="Faturado (R$)"
            value={brl(summary.orders_invoiced)}
            icon={CheckCircle2}
            tone="ok"
          />
          <SummaryCard
            flat
            title="Agendados na semana"
            value={summary.orders_on_week ?? 0}
            icon={CalendarDays}
            tone="brand"
          />
        </div>
      </section>

      {/* Cadastros — totais do empreendimento */}
      <section className="rounded-xl border border-line bg-ground p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Cadastros</h2>
          <p className="text-[12.5px] text-muted mt-0.5">Totais do empreendimento</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              flat
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
