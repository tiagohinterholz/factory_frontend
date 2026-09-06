import { useState } from "react"
import { Link } from "react-router-dom"
import { Car, Edit2, Trash2 } from "lucide-react"
import { useClient } from "../hooks/useClient"
import { ClientService } from "../services/client"
import ClientVehiclesModal from "../components/ClientVehiclesModal"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function ClientList() {
  const {
    client,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useClient()

  const toast = useToast()
  const confirm = useConfirm()
  const [vehiclesClient, setVehiclesClient] = useState(null)

  const columns = [
    { header: "Nome", accessor: (item) => `${item.first_name} ${item.last_name}` },
    { header: "CPF", accessor: (item) => item.cpf },
    { header: "Telefone", accessor: (item) => item.phone },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir cliente?",
      message: `O cliente "${item.first_name} ${item.last_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o cliente.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Clientes" buttonText="Novo Cliente" buttonLink="/clientes/novo" />
      <ListTable
        columns={columns}
        data={client}
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
              request={() => ClientService.getClientPdf(item.id)}
              title="Baixar PDF do cliente"
            />
            <button
              type="button"
              onClick={() => setVehiclesClient(item)}
              title="Ver veículos do cliente"
              className="p-1.5 text-brand hover:bg-brand-subtle rounded transition-colors"
            >
              <Car size={16} />
            </button>
            <Link
              to={`/clientes/${item.id}`}
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

      <ClientVehiclesModal client={vehiclesClient} onClose={() => setVehiclesClient(null)} />
    </div>
  )
}
