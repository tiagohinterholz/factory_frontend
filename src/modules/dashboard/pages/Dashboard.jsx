import { useDashboard } from "@/modules/dashboard/hooks/useDashboard"
import SummaryCard from "@/modules/dashboard/components/SummaryCard"
import StatCard from "@/modules/dashboard/components/StatCard"
import HighlightCard from "@/modules/dashboard/components/HighlightCard"

export default function Dashboard() {
  const { loading, data } = useDashboard();

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Carregando dashboard...</div>;
  }

  const summary = data.summary_business;
  const detail = data.detail_business;

  return (
    <div className="p-6 space-y-6">

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Orçamentos em análise"
          value={summary.budgets_wait ?? 0}
          icon="⏱"
          color="bg-orange-100 text-orange-700"
        />
        <SummaryCard
          title="A Faturar"
          value={`R$ ${Number(summary.orders_to_invoice ?? 0).toFixed(2)}`}
          icon="💼"
          color="bg-yellow-100 text-yellow-700"
        />
        <SummaryCard
          title="Faturado"
          value={`R$ ${Number(summary.orders_invoiced ?? 0).toFixed(2)}`}
          icon="✅"
          color="bg-green-100 text-green-700"
        />
        <SummaryCard
          title="Serviços agendados na semana"
          value={summary.orders_on_week ?? 0}
          icon="📅"
          color="bg-blue-100 text-blue-700"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HighlightCard
          title="Faturar hoje"
          icon="⏳"
          colorBar="border-orange-400"
          value={detail.to_invoice_today?.length ?? 0}
        />
        <HighlightCard
          title="A Faturar"
          icon="📌"
          colorBar="border-red-400"
          value={detail.to_invoice_all?.length ?? 0}
        />
        <HighlightCard
          title="Clientes da semana"
          icon="👥"
          colorBar="border-blue-400"
          value={detail.clients_on_week?.length ?? 0}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clientes"
          value={summary.clients ?? 0}
          icon="👥"
          color="bg-blue-600"
        />
        <StatCard
          title="Veículos"
          value={summary.vehicles ?? 0}
          icon="🚗"
          color="bg-purple-600"
        />
        <StatCard
          title="Fornecedores"
          value={summary.suppliers ?? 0}
          icon="🏭"
          color="bg-blue-500"
        />
        <StatCard
          title="Produtos"
          value={summary.products ?? 0}
          icon="📦"
          color="bg-sky-500"
        />
        <StatCard
          title="Serviços"
          value={summary.services ?? 0}
          icon="🛠"
          color="bg-sky-500"
        />
        <StatCard
          title="Agendamentos"
          value={summary.appointments ?? 0}
          icon="📅"
          color="bg-blue-600"
        />
        <StatCard
          title="Orçamentos"
          value={summary.budgets ?? 0}
          icon="🧾"
          color="bg-blue-600"
        />
        <StatCard
          title="Ordens de Serviço"
          value={summary.orders ?? 0}
          icon="📋"
          color="bg-blue-600"
        />
      </section>
    </div>
  );
}