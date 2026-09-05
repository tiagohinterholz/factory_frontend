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
import HighlightCard from "@/modules/dashboard/components/HighlightCard"
import SummaryCard from "@/modules/dashboard/components/SummaryCard"
import StatCard from "@/modules/dashboard/components/StatCard"
import AppointmentCard from "@/modules/dashboard/components/AppointmentCard"

const brl = (value) =>
  `R$ ${Number(value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

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

  const movimentacao = data.movimentacao ?? {}
  const atendimentos = data.atendimentos?.clientes_semana ?? []
  const totalAgendadoSemana = data.atendimentos?.total_agendado_semana
  const financeira = data.financeiro ?? null
  const resumo = data.resumo ?? {}

  const resumoStats = [
    { title: "Clientes", value: resumo.clients ?? 0, icon: Users },
    { title: "Veículos", value: resumo.vehicles ?? 0, icon: Car },
    { title: "Fornecedores", value: resumo.suppliers ?? 0, icon: Factory },
    { title: "Produtos", value: resumo.products ?? 0, icon: Package },
    { title: "Serviços", value: resumo.services ?? 0, icon: Wrench },
    { title: "Agendamentos", value: resumo.appointments ?? 0, icon: CalendarDays },
    { title: "Orçamentos", value: resumo.budgets ?? 0, icon: FileText },
    { title: "Ordens de Serviço", value: resumo.orders ?? 0, icon: ClipboardList },
  ]

  return (
    <div className="space-y-6">
      <Quadro title="Movimentação" subtitle="Ordens de serviço em números">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            flat
            tone="warn"
            icon={Hourglass}
            title="OS a faturar hoje"
            value={movimentacao.os_a_faturar_hoje ?? 0}
          />
          <HighlightCard
            flat
            tone="danger"
            icon={ClipboardList}
            title="OS a faturar (histórico)"
            value={movimentacao.os_a_faturar ?? 0}
          />
          <HighlightCard
            flat
            tone="ok"
            icon={ClipboardCheck}
            title="OS faturadas"
            value={movimentacao.os_faturadas ?? 0}
          />
        </div>
      </Quadro>

      <Quadro
        title="Atendimentos"
        subtitle="Clientes agendados nesta semana"
        aside={
          totalAgendadoSemana != null && (
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-ink tabular-nums leading-tight">
                {totalAgendadoSemana}
              </p>
              <p className="text-[12.5px] text-muted mt-0.5">Clientes agendados na semana</p>
            </div>
          )
        }
      >
        {atendimentos.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum atendimento agendado para a semana.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start gap-3">
              {atendimentos.map((item) => (
                <AppointmentCard
                  key={item.id ?? `${item.client_name}-${item.date}-${item.time}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}
      </Quadro>

      {isAdmin && financeira && (
        <Quadro title="Financeiro do mês" subtitle="Operação do mês vigente">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              flat
              tone="info"
              icon={Wallet}
              title="A faturar"
              value={brl(financeira.a_faturar_total)}
            />
            <SummaryCard
              flat
              tone="ok"
              icon={CheckCircle2}
              title="Faturado"
              value={brl(financeira.faturado_total)}
            />
            <SummaryCard
              flat
              tone="warn"
              icon={FileText}
              title="Orçamentos em aberto"
              value={brl(financeira.orcamentos_em_aberto_total)}
            />
          </div>
        </Quadro>
      )}

      <Quadro title="Resumo" subtitle="Totais do empreendimento">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resumoStats.map((stat) => (
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
