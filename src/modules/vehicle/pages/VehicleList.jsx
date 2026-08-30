import { useVehicle } from "../hooks/useVehicle"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function VehicleList() {
  const {
    vehicle,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useVehicle()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: "Placa", accessor: (item) => item.plate },
    { header: "Modelo", accessor: (item) => item.model },
    { header: "Cor", accessor: (item) => item.color },
    { header: "Cliente", accessor: (item) => `${item.client.first_name} ${item.client.last_name}` },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir veículo?",
      message: `O veículo de placa "${item.plate}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o veículo.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Veículos" buttonText="Novo Veículo" buttonLink="/veiculos/novo" />
      <ListTable
        columns={columns}
        data={vehicle}
        editLinkPrefix="/veiculos"
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
