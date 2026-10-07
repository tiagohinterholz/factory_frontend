import { Link } from "react-router-dom"
import { CheckCircle, Edit2, XCircle } from "lucide-react"
import { useFinancialEntry } from "../hooks/useFinancialEntry"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import { formatDate, formatMoney } from "@/modules/core/utils/format"
import {
  FINANCIAL_ENTRY_TYPE_OPTIONS,
  FINANCIAL_ENTRY_CATEGORY_OPTIONS,
  financialEntryStatusTone,
  financialEntryCanAct,
  financialEntryTypeLabel,
  financialEntryCategoryLabel,
} from "../domain"

const STATUS_OPTIONS = [
  { id: "pendente", name: "Pendente" },
  { id: "pago", name: "Pago" },
  { id: "atrasado", name: "Atrasado" },
  { id: "cancelado", name: "Cancelado" },
]

export default function FinancialEntryList() {
  const {
    entries,
    loading,
    filters,
    applyFilters,
    ordering,
    toggleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    error,
    markPaid,
    cancel,
  } = useFinancialEntry()

  const filterFields = [
    { name: "entry_type", label: "Tipo", type: "select", options: FINANCIAL_ENTRY_TYPE_OPTIONS },
    {
      name: "category",
      label: "Categoria",
      type: "select",
      options: FINANCIAL_ENTRY_CATEGORY_OPTIONS,
    },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    { name: "date_from", label: "Vencimento a partir de", type: "date" },
    { name: "date_to", label: "Vencimento até", type: "date" },
  ]

  const columns = [
    { header: "ID", accessor: (item) => `#${item.id}` },
    {
      header: "Tipo",
      sortKey: "entry_type",
      accessor: (item) => financialEntryTypeLabel(item.entry_type),
    },
    {
      header: "Categoria",
      sortKey: "category",
      accessor: (item) => financialEntryCategoryLabel(item.category),
    },
    { header: "Descrição", accessor: (item) => item.description || "—" },
    {
      header: "Vencimento",
      sortKey: "due_date",
      accessor: (item) => formatDate(item.due_date),
    },
    {
      header: "Status",
      sortKey: "status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${financialEntryStatusTone(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Valor",
      sortKey: "amount",
      accessor: (item) => formatMoney(item.amount),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Financeiro"
        buttonText="Novo Lançamento"
        buttonLink="/financeiro/novo"
        actions={
          <div className="flex items-center gap-2">
            <ListFilters fields={filterFields} value={filters} onApply={applyFilters} />
            <ExportReportButton type="cashflow" label="Exportar Fluxo de Caixa" />
          </div>
        }
      />
      <ListTable
        dense
        columns={columns}
        data={entries}
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
            {financialEntryCanAct(item.status) && (
              <>
                <button
                  type="button"
                  onClick={() => markPaid(item)}
                  title="Marcar como pago"
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => cancel(item)}
                  title="Cancelar lançamento"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <Link
              to={`/financeiro/${item.id}`}
              title="Ver/editar lançamento"
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
          </div>
        )}
      />
    </div>
  )
}
