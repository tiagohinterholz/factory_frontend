import { Link } from "react-router-dom"
import { Edit2, Trash2 } from "lucide-react"
import { useBudget } from "../hooks/useBudget"
import { BudgetService } from "../services/budgets"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function BudgetList() {
  const {
    budgets,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useBudget()

  const toast = useToast()
  const confirm = useConfirm()

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
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
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

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Orçamentos"
        buttonText="Novo Orçamento"
        buttonLink="/orcamentos/novo"
        actions={<ExportReportButton type="budgets" />}
      />
      <ListTable
        columns={columns}
        data={budgets}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <PdfIconButton
              request={() => BudgetService.getBudgetPdf(item.id)}
              title="Gerar PDF do orçamento"
            />
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
