import { useOrder } from "../hooks/useOrder"
import ListHeader from "@/modules/core/components/ListHeader"
import ExportReportButton from "@/modules/core/components/ExportReportButton"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import { useClientOptions } from "@/modules/core/hooks/options"
import { REPORT_STATUS_OPTIONS } from "@/modules/core/constants/report"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function OrderList() {
  const {
    orders,
    loading,
    filters,
    applyFilters,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
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
    { header: "Cliente", accessor: (item) => item.first_name || item.client?.first_name || "N/A" },
    {
      header: "Veículo",
      accessor: (item) =>
        item.vehicle_name || `${item.vehicle?.model || ""} ${item.vehicle?.plate || ""}`,
    },
    {
      header: "Data/Hora Serviço",
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
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
            item.status === "faturado"
              ? "bg-emerald-100 text-emerald-700"
              : item.status === "a faturar"
                ? "bg-brand-subtle text-brand"
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
        editLinkPrefix="/ordens"
        onDelete={handleDelete}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
