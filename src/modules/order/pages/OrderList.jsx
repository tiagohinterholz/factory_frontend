import { Link } from "react-router-dom"
import { CheckCircle2, Edit2, Receipt, Trash2 } from "lucide-react"
import { useOrder } from "../hooks/useOrder"
import { OrderService } from "../services/order"
import { orderStatusTone, orderCanFinish, orderCanInvoice } from "@/modules/order/domain"
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

export default function OrderList() {
  const {
    orders,
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
    finish,
    invoice,
    error,
  } = useOrder()

  const toast = useToast()
  const confirm = useConfirm()
  const { client: clients } = useClientOptions()

  const filterFields = [
    { name: "status", label: "Status", type: "select", options: REPORT_STATUS_OPTIONS.orders },
    {
      name: "client_id",
      label: "Cliente",
      type: "select",
      options: clients.map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })),
    },
    { name: "date_from", label: "Serviço a partir de", type: "date" },
    { name: "date_to", label: "Serviço até", type: "date" },
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
      header: "Data/Hora Serviço",
      sortKey: "service_date",
      accessor: (item) =>
        item.service_date
          ? new Date(item.service_date).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
    },
    {
      header: "Status",
      sortKey: "status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${orderStatusTone(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Total",
      sortKey: "total",
      accessor: (item) => `R$ ${parseFloat(item.total).toFixed(2)}`,
    },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir ordem de serviço?",
      message: `A OS #${item.id} será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir a ordem de serviço.")
    }
  }

  const handleFinish = async (item) => {
    const confirmed = await confirm({
      title: "Finalizar serviço?",
      message: `A OS #${item.id} vai para 'a faturar' e os itens não poderão mais ser editados.`,
      confirmText: "Finalizar",
    })
    if (!confirmed) return

    try {
      await finish(item.id)
      toast.success(`Serviço da OS #${item.id} finalizado.`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao finalizar o serviço.").message)
    }
  }

  const handleInvoice = async (item) => {
    const confirmed = await confirm({
      title: "Faturar ordem de serviço?",
      message: `A OS #${item.id} será marcada como faturada. Esta ação não pode ser desfeita.`,
      confirmText: "Faturar",
    })
    if (!confirmed) return

    try {
      await invoice(item.id)
      toast.success(`OS #${item.id} faturada.`)
    } catch (error) {
      console.error(error)
      toast.error(parseApiError(error, "Erro ao faturar a ordem de serviço.").message)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Ordens de Serviço"
        buttonText="Nova OS"
        buttonLink="/ordens/novo"
        actions={
          <div className="flex items-center gap-2">
            <ListFilters fields={filterFields} value={filters} onApply={applyFilters} />
            <ExportReportButton type="orders" />
          </div>
        }
      />
      <ListTable
        columns={columns}
        data={orders}
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
              request={() => OrderService.getOrderPdf(item.id)}
              title="Gerar PDF da OS"
            />
            {orderCanFinish(item.status) && (
              <button
                type="button"
                onClick={() => handleFinish(item)}
                title="Finalizar serviço"
                className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            {orderCanInvoice(item.status) && (
              <button
                type="button"
                onClick={() => handleInvoice(item)}
                title="Faturar OS"
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              >
                <Receipt size={16} />
              </button>
            )}
            <Link
              to={`/ordens/${item.id}`}
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
