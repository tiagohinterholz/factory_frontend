import { useState } from "react"
import { Link } from "react-router-dom"
import { Car, Edit2, Trash2 } from "lucide-react"
import { useClient } from "../hooks/useClient"
import { ClientService } from "../services/client"
import ClientVehiclesModal from "../components/ClientVehiclesModal"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import ListFilters from "@/modules/core/components/ListFilters"
import PdfIconButton from "@/modules/core/components/PdfIconButton"
import WhatsAppButton from "@/modules/core/components/WhatsAppButton"

const FILTER_FIELDS = [
  { name: "name", label: "Nome", type: "text" },
  { name: "cpf", label: "CPF", type: "text" },
  { name: "cnpj", label: "CNPJ", type: "text" },
  {
    name: "client_type",
    label: "Tipo",
    type: "select",
    options: [
      { id: "PF", name: "Pessoa Física" },
      { id: "PJ", name: "Pessoa Jurídica" },
    ],
  },
]

export default function ClientList() {
  const {
    client,
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
    error,
  } = useClient()

  const [vehiclesClient, setVehiclesClient] = useState(null)

  const columns = [
    {
      header: "Nome",
      sortKey: "first_name",
      accessor: (item) => item.display_name,
    },
    {
      header: "Tipo",
      accessor: (item) => (item.client_type === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"),
    },
    { header: "CPF/CNPJ", accessor: (item) => item.document },
    { header: "Telefone", accessor: (item) => item.phone },
  ]

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
        ordering={ordering}
        onSort={toggleSort}
        renderActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <PdfIconButton
              request={() => ClientService.getClientPdf(item.id)}
              title="Baixar PDF do cliente"
            />
            <WhatsAppButton phone={item.phone} />
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
              onClick={() => remove(item)}
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
