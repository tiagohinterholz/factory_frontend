import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Copy, Edit2, Trash2, XCircle } from "lucide-react"
import { useBudget } from "../hooks/useBudget"
import { BudgetService } from "../services/budgets"
import ApproveBudgetModal from "../components/ApproveBudgetModal"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import { useClientOptions } from "@/modules/core/hooks/options"
import { REPORT_STATUS_OPTIONS } from "@/modules/core/constants/report"
import { formatDateTime } from "@/modules/core/utils/datetime"
import { budgetStatusTone, budgetIsPending, budgetCanDuplicate, budgetStatusDate } from "../domain"

export default function BudgetList() {
  const {
    budgets,
    loading,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    approve,
    cancel,
    duplicate,
    approving,
    error,
  } = useBudget()

  const { client: clients } = useClientOptions()

  const [approveTarget, setApproveTarget] = useState(null)

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
    {
      header: "Cliente",
      sortKey: "client__first_name",
      accessor: (item) => item.first_name || item.client?.first_name || "N/A",
    },
    {
      header: "Veículo",
      accessor: (item) =>
        item.vehicle_name || `${item.vehicle?.model || ""} ${item.vehicle?.plate || ""}`,
    },
    {
      header: "Validade",
      sortKey: "valid_until",
      accessor: (item) => new Date(item.valid_until).toLocaleDateString(),
    },
    {
      header: "Status",
      sortKey: "status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${budgetStatusTone(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Situação em",
      accessor: (item) =>
        formatDateTime(
          budgetStatusDate(item.status, {
            approvedAt: item.approved_at,
            cancelledAt: item.cancelled_at,
            validUntil: item.valid_until,
          }),
        ) || "—",
    },
    {
      header: "Total",
      sortKey: "total",
      accessor: (item) => `R$ ${parseFloat(item.total).toFixed(2)}`,
    },
  ]

  // o botão abre o modal; o approve (com service_date opcional) roda no confirm do modal
  const handleApproveConfirm = async (serviceDate) => {
    if (!approveTarget) return
    const ok = await approve({ id: approveTarget.id, serviceDate })
    if (ok) setApproveTarget(null)
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
        ordering={ordering}
        onSort={toggleSort}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <PdfIconButton
              request={() => BudgetService.getBudgetPdf(item.id)}
              title="Gerar PDF do orçamento"
            />
            {budgetIsPending(item.status) && (
              <>
                <button
                  type="button"
                  onClick={() => setApproveTarget(item)}
                  title="Aprovar orçamento"
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => cancel(item)}
                  title="Cancelar orçamento"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            {budgetCanDuplicate(item.status) && (
              <button
                type="button"
                onClick={() => duplicate(item)}
                title="Duplicar orçamento"
                className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
              >
                <Copy size={16} />
              </button>
            )}
            <Link
              to={`/orcamentos/${item.id}`}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
            <button
              type="button"
              onClick={() => remove(item)}
              className="p-1.5 text-danger hover:bg-danger-subtle rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />
      <ApproveBudgetModal
        open={approveTarget != null}
        onClose={() => setApproveTarget(null)}
        budgetId={approveTarget?.id}
        onConfirm={handleApproveConfirm}
        submitting={approving}
      />
    </div>
  )
}
