import { Link } from "react-router-dom"
import { CheckCircle, Edit2, Trash2, XCircle } from "lucide-react"
import { useBudget } from "../hooks/useBudget"
import { BudgetService } from "../services/budgets"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import { useClientOptions } from "@/modules/core/hooks/options"
import { REPORT_STATUS_OPTIONS } from "@/modules/core/constants/report"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"
import { parseApiError } from "@/api/parse-api-error"
import { formatDateTime } from "@/modules/core/utils/datetime"

// data da situação atual: aprovado -> approved_at, cancelado -> cancelled_at,
// expirado -> valid_until (data em que expirou), pendente -> nenhuma
function statusDate(item) {
  if (item.status === "aprovado") return item.approved_at
  if (item.status === "cancelado") return item.cancelled_at
  if (item.status === "expirado") return item.valid_until
  return null
}

export default function BudgetList() {
  const {
    budgets,
    loading,
    filters,
    applyFilters,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    approve,
    cancel,
    error,
  } = useBudget()

  const toast = useToast()
  const confirm = useConfirm()
  const { client: clients } = useClientOptions()

  const filterFields = [
    { name: "status", label: "Status", type: "select", options: REPORT_STATUS_OPTIONS.budgets },
    {
      name: "client_id",
      label: "Cliente",
      type: "select",
      options: clients.map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })),
    },
    { name: "date_from", label: "Criado a partir de", type: "date" },
    { name: "date_to", label: "Criado até", type: "date" },
  ]

  const columns = [
    { header: "ID", accessor: (item) => `#${item.id}` },
    { header: "Cliente", accessor: (item) => item.first_name || item.client?.first_name || "N/A" },
    {
      header: "Veículo",
      accessor: (item) =>
        item.vehicle_name || `${item.vehicle?.model || ""} ${item.vehicle?.plate || ""}`,
    },
    { header: "Validade", accessor: (item) => new Date(item.valid_until).toLocaleDateString() },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
            item.status === "aprovado"
              ? "bg-emerald-100 text-emerald-700"
              : item.status === "pendente"
                ? "bg-amber-100 text-amber-700"
                : item.status === "cancelado"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    { header: "Situação em", accessor: (item) => formatDateTime(statusDate(item)) || "—" },
    { header: "Total", accessor: (item) => `R$ ${parseFloat(item.total).toFixed(2)}` },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir orçamento?",
      message: `O orçamento #${item.id} será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o orçamento.")
    }
  }

  const handleApprove = async (item) => {
    const confirmed = await confirm({
      title: "Aprovar orçamento?",
      message: `O orçamento #${item.id} será aprovado. Isso pode gerar uma Ordem de Serviço.`,
      confirmText: "Aprovar",
    })
    if (!confirmed) return

    try {
      await approve(item.id)
      toast.success("Orçamento aprovado.")
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao aprovar o orçamento.").message)
    }
  }

  const handleCancel = async (item) => {
    const confirmed = await confirm({
      title: "Cancelar orçamento?",
      message: `O orçamento #${item.id} será marcado como cancelado.`,
      confirmText: "Sim, cancelar",
      danger: true,
    })
    if (!confirmed) return

    try {
      await cancel(item.id)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao cancelar o orçamento.").message)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Orçamentos"
        buttonText="Novo Orçamento"
        buttonLink="/orcamentos/novo"
        actions={
          <div className="flex items-center gap-2">
            <ListFilters fields={filterFields} value={filters} onApply={applyFilters} />
            <ExportReportButton type="budgets" />
          </div>
        }
      />
      <ListTable
        dense
        columns={columns}
        data={budgets}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <PdfIconButton
              request={() => BudgetService.getBudgetPdf(item.id)}
              title="Gerar PDF do orçamento"
            />
            {item.status === "pendente" && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(item)}
                  title="Aprovar orçamento"
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCancel(item)}
                  title="Cancelar orçamento"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <Link
              to={`/orcamentos/${item.id}`}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="p-1.5 text-danger hover:bg-danger-subtle rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />
    </div>
  )
}
