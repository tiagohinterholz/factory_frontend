import { useState } from "react"
import { Link } from "react-router-dom"
import { Car, Edit2, MessageCircle, Trash2 } from "lucide-react"
import { useClient } from "../hooks/useClient"
import { ClientService } from "../services/client"
import ClientVehiclesModal from "../components/ClientVehiclesModal"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

const FILTER_FIELDS = [
  { name: "name", label: "Nome", type: "text" },
  { name: "cpf", label: "CPF", type: "text" },
]

// wa.me só aceita dígitos; telefone BR (DDD + 8/9 dígitos) ganha o 55 na frente.
function whatsappLink(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "")
  if (!digits) return null
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}

export default function ClientList() {
  const {
    client,
    loading,
    filters,
    applyFilters,
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
      <ListHeader
        title="Clientes"
        buttonText="Novo Cliente"
        buttonLink="/clientes/novo"
        actions={<ListFilters fields={FILTER_FIELDS} value={filters} onApply={applyFilters} />}
      />
      <ListTable
        columns={columns}
        data={client}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
        renderActions={(item) => {
          const wa = whatsappLink(item.phone)
          return (
            <div className="flex items-center justify-end gap-1">
              <PdfIconButton
                request={() => ClientService.getClientPdf(item.id)}
                title="Baixar PDF do cliente"
              />
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir conversa no WhatsApp"
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                >
                  <MessageCircle size={16} />
                </a>
              )}
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
          )
        }}
      />

      <ClientVehiclesModal client={vehiclesClient} onClose={() => setVehiclesClient(null)} />
    </div>
  )
}
