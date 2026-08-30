import { useClient } from "../hooks/useClient"
import { ClientService } from "../services/client"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
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
    load,
    error
  } = useClient()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Nome', accessor: (item) => `${item.first_name} ${item.last_name}` },
    { header: 'CPF', accessor: (item) => item.cpf },
    { header: 'Telefone', accessor: (item) => item.phone },
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
      await ClientService.deleteClient(item.id)
      load(searchTerm, currentPage)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o cliente.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Clientes'
        buttonText='Novo Cliente'
        buttonLink='/clientes/novo'
      />
      <ListTable 
        columns={columns}
        data={client}
        editLinkPrefix="/clientes"
        onDelete={handleDelete}
        loading={loading}
        error={error}
        onRetry={() => load(searchTerm, currentPage)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
