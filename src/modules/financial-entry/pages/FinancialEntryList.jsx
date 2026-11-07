import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle, Edit2, Eye, XCircle } from "lucide-react"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useFinancialEntry } from "../hooks/useFinancialEntry"
import MarkEntryPaidDialog from "../components/MarkEntryPaidDialog"
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
import { paymentLabel } from "@/modules/order/domain"

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
    cancel,
    setSearch,
  } = useFinancialEntry()
  const {
    canCreateFinancialEntry,
    canChangeFinancialEntry,
    canMarkFinancialEntryPaid,
    canCancelFinancialEntry,
  } = usePermissions()
  const [markingPaid, setMarkingPaid] = useState(null)

  const filterFields = [
    { name: "entry_type", label: "Tipo", type: "select", options: FINANCIAL_ENTRY_TYPE_OPTIONS },
    {
      name: "category",
      label: "Categoria",
      type: "select",
      options: FINANCIAL_ENTRY_CATEGORY_OPTIONS,
    },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    { name: "tag", label: "Tag", type: "text" },
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
      accessor: (item) => (
        <div className="flex flex-col gap-0.5">
          <span>{item.financial_category?.name ?? financialEntryCategoryLabel(item.category)}</span>
          {item.financial_subcategory && (
            <span className="text-[11px] text-muted">{item.financial_subcategory.name}</span>
          )}
        </div>
      ),
    },
    {
      header: "Tags",
      accessor: (item) =>
        item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-subtle px-2 py-0.5 text-[11px] font-semibold text-brand"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          "—"
        ),
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
        <div className="flex flex-col items-center gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${financialEntryStatusTone(item.status)}`}
          >
            {item.status}
          </span>
          {paymentLabel(item) && (
            <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-600">
              {paymentLabel(item)}
            </span>
          )}
        </div>
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
        onSearch={setSearch}
        searchPlaceholder="Buscar por descrição, categoria, tag ou cliente"
        title="Financeiro"
        buttonText={canCreateFinancialEntry ? "Novo Lançamento" : undefined}
        buttonLink={canCreateFinancialEntry ? "/financeiro/novo" : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ListFilters fields={filterFields} value={filters} onApply={applyFilters} />
            <ExportReportButton type="cashflow" label="Gerar relatório" />
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
            {financialEntryCanAct(item.status) && canMarkFinancialEntryPaid && (
              <button
                type="button"
                onClick={() => setMarkingPaid(item)}
                title="Marcar como pago"
                aria-label="Marcar como pago"
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              >
                <CheckCircle size={16} />
              </button>
            )}
            {financialEntryCanAct(item.status) && canCancelFinancialEntry && (
              <button
                type="button"
                onClick={() => cancel(item)}
                title="Cancelar lançamento"
                aria-label="Cancelar lançamento"
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <XCircle size={16} />
              </button>
            )}
            {(() => {
              const canEditThisEntry = canChangeFinancialEntry && financialEntryCanAct(item.status)
              return (
                <Link
                  to={`/financeiro/${item.id}`}
                  title={canEditThisEntry ? "Editar lançamento" : "Ver lançamento"}
                  aria-label={canEditThisEntry ? "Editar lançamento" : "Ver lançamento"}
                  className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
                >
                  {canEditThisEntry ? <Edit2 size={16} /> : <Eye size={16} />}
                </Link>
              )
            })()}
          </div>
        )}
      />
      <MarkEntryPaidDialog entry={markingPaid} onClose={() => setMarkingPaid(null)} />
    </div>
  )
}
