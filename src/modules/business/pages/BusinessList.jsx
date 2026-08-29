import { useBusiness } from "../hooks/useBusiness"
import { BusinessService } from "../services/business"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function BusinessList() {
  const { 
    business, 
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    load
  } = useBusiness()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.corporate_name },
    { header: 'CNPJ', accessor: (item) => item.cnpj },
    { header: 'Email', accessor: (item) => item.email },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir o empreendimento ${item.corporate_name}?`)) {
      try {
        await BusinessService.deleteBusiness(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir o empreendimento.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Empreendimentos'
        buttonText='Novo Empreendimento'
        buttonLink='/empreendimentos/novo'
      />
      <ListTable 
        columns={columns}
        data={business}
        editLinkPrefix="/empreendimentos"
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
