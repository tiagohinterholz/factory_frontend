import { useState } from "react"
import { Wallet, CheckCircle2, Clock } from "lucide-react"
import Quadro from "@/modules/dashboard/components/Quadro"
import MiniStat from "@/modules/dashboard/components/MiniStat"
import StatusToggle from "@/modules/dashboard/components/StatusToggle"
import FinancialMonthEntryCard from "@/modules/dashboard/components/FinancialMonthEntryCard"
import { useFinancialMonthEntries } from "@/modules/dashboard/hooks/useFinancialMonthEntries"
import {
  financialMonthMiniStats,
  financialMonthTypeOptions,
  financialMonthStatusOptions,
  financialMonthNextStatus,
} from "@/modules/dashboard/domain/financial-month"
import { formatMoney } from "@/modules/core/utils/format"

const STATUS_EMPTY_LABEL = {
  pago: "pagos",
  pendente: "pendentes",
  atrasado: "atrasados",
  cancelado: "cancelados",
}

// Redesenho do quadro "Financeiro do mês" — protótipo aprovado em 16/09
// (https://claude.ai/artifact/RNgaPxiZGnRLgomc2r4Dyy): os 3 números que
// antes ocupavam a largura toda em SummaryCard viram mini-stats no
// cantinho (mesmo estilo do quadro de cima), e no lugar deles entra um
// filtro de dois níveis (Tipo -> Status) com a lista de lançamentos que
// bate a combinação escolhida.
export default function FinancialMonthCard({ breakdown }) {
  const [type, setType] = useState("a_receber")
  const [status, setStatus] = useState("pendente")

  const miniStats = financialMonthMiniStats(breakdown)
  const typeOptions = financialMonthTypeOptions(breakdown)
  const statusOptions = financialMonthStatusOptions(breakdown, type)

  const { entries, loading } = useFinancialMonthEntries(type, status)

  const handleTypeChange = (nextType) => {
    setType(nextType)
    setStatus((currentStatus) => financialMonthNextStatus(breakdown, nextType, currentStatus))
  }

  return (
    <Quadro
      title="Financeiro do mês"
      subtitle="Operação do mês vigente — filtra por tipo e status"
      aside={
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <MiniStat
            tone="info"
            icon={Wallet}
            label="A faturar"
            value={formatMoney(miniStats.toBill)}
          />
          <MiniStat
            tone="ok"
            icon={CheckCircle2}
            label="Faturado"
            value={formatMoney(miniStats.billed)}
          />
          <MiniStat
            tone="warn"
            icon={Clock}
            label="A pagar em aberto"
            value={formatMoney(miniStats.payablesOpen)}
          />
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
            Tipo
          </span>
          <StatusToggle options={typeOptions} value={type} onChange={handleTypeChange} />
        </div>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
            Status
          </span>
          <StatusToggle options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      <div className="mt-3">
        {loading && <p className="text-[13px] text-muted">Carregando lançamentos...</p>}
        {!loading && entries.length === 0 && (
          <p className="text-[13px] text-muted">
            Nenhum lançamento {STATUS_EMPTY_LABEL[status]} neste tipo, no mês.
          </p>
        )}
        {!loading && entries.length > 0 && (
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start gap-3">
              {entries.map((entry) => (
                <FinancialMonthEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Quadro>
  )
}
