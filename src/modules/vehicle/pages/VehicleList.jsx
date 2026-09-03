import { Link, useNavigate } from "react-router-dom"
import { ClipboardList, FileText, Edit2, Trash2 } from "lucide-react"
import { useVehicle } from "../hooks/useVehicle"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function VehicleList() {
  const navigate = useNavigate()
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

  // "Abrir OS" / "Fazer orçamento": vão pro formulário de criação com
  // veículo e cliente já pré-preenchidos.
  const prefillState = (item) => ({
    state: { vehicleId: item.id, clientId: item.client?.id ?? item.client },
  })

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Veículos" buttonText="Novo Veículo" buttonLink="/veiculos/novo" />
      <ListTable
        columns={columns}
        data={vehicle}
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
            <button
              type="button"
              title="Abrir OS para este veículo"
              onClick={() => navigate("/ordens/novo", prefillState(item))}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <ClipboardList size={16} />
            </button>
            <button
              type="button"
              title="Fazer orçamento para este veículo"
              onClick={() => navigate("/orcamentos/novo", prefillState(item))}
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <FileText size={16} />
            </button>
            <Link
              to={`/veiculos/${item.id}`}
              title="Editar veículo"
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Edit2 size={16} />
            </Link>
            <button
              type="button"
              title="Excluir veículo"
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
