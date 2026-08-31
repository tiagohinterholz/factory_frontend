import { useOrder } from "../hooks/useOrder"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function OrderList() {
  const {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useOrder()

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
    {
      header: "Data Serviço",
      accessor: (item) =>
        item.service_date
          ? new Date(item.service_date + "T12:00:00").toLocaleDateString("pt-BR")
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
      <ListHeader title="Ordens de Serviço" buttonText="Nova OS" buttonLink="/ordens/novo" />
      <ListTable
        columns={columns}
        data={orders}
        editLinkPrefix="/ordens"
        onDelete={handleDelete}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
