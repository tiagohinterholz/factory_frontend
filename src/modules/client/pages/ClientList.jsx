import { useClient } from "../hooks/useClient"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function ClientList() {
  const { 
    client, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    totalItems 
  } = useClient()

  const columns = [
    { header: 'Nome', accessor: (item) => `${item.first_name} ${item.last_name}` },
    { header: 'CPF', accessor: (item) => item.cpf },
    { header: 'Telefone', accessor: (item) => item.phone },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o cliente ${item.first_name}?`)) {
      console.log('Excluindo...', item.id)
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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
