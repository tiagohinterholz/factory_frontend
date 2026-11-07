import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import BackLink from "@/modules/core/components/BackLink"
import StatusToggle from "@/modules/dashboard/components/StatusToggle"
import { formatMoney } from "@/modules/core/utils/format"
import { FinancialEntryService } from "../services/financial-entry"
import { financialEntryKeys } from "../domain"
import EntryExitChart from "../components/EntryExitChart"
import CategoryBreakdownChart from "../components/CategoryBreakdownChart"
import ChartLegend from "../components/ChartLegend"

const GRANULARITIES = [
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
  { id: "year", label: "Ano" },
]

export default function FinancialReports() {
  const [granularity, setGranularity] = useState("month")
  const query = useQuery({
    queryKey: [...financialEntryKeys.all, "charts", granularity],
    queryFn: () => FinancialEntryService.getCharts({ granularity }),
  })
  const data = query.data

  return (
    <div className="p-6 space-y-6">
      <BackLink to="/financeiro" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            Relatórios do Financeiro
          </h1>
          <p className="text-sm text-muted mt-1">
            Valores realizados (lançamentos pagos), pela data de pagamento
          </p>
        </div>
        <StatusToggle options={GRANULARITIES} value={granularity} onChange={setGranularity} />
      </div>

      {query.isPending ? (
        <p className="text-sm text-muted">Carregando gráficos...</p>
      ) : query.error ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">Não foi possível carregar os gráficos.</p>
          <button type="button" onClick={() => query.refetch()} className="btn-primary">
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Total label="Entradas" value={data.inflow_total} />
            <Total label="Saídas" value={data.outflow_total} />
            <Total label="Saldo" value={Number(data.inflow_total) - Number(data.outflow_total)} />
          </div>

          <section className="card-premium space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">Entradas e saídas por período</h2>
              <ChartLegend />
            </div>
            <EntryExitChart series={data.series} />
            <details className="text-sm">
              <summary className="cursor-pointer text-muted">Ver tabela</summary>
              <table className="mt-3 w-full text-left text-[13px]">
                <thead>
                  <tr className="text-muted">
                    <th className="py-1 font-medium">Período</th>
                    <th className="py-1 font-medium text-right">Entradas</th>
                    <th className="py-1 font-medium text-right">Saídas</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.series.map((row) => (
                    <tr key={row.period} className="border-t border-line">
                      <td className="py-1">{row.label}</td>
                      <td className="py-1 text-right">{formatMoney(row.inflow)}</td>
                      <td className="py-1 text-right">{formatMoney(row.outflow)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <section className="card-premium space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">Por categoria</h2>
              <ChartLegend />
            </div>
            <CategoryBreakdownChart rows={data.by_category} />
          </section>
        </>
      )}
    </div>
  )
}

function Total({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-ink">{formatMoney(value)}</p>
    </div>
  )
}
