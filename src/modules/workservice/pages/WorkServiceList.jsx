import { useWorkService } from "../hooks/useWorkService"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function WorkServiceList() {
  const { 
    workservice, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    totalItems 
  } = useWorkService()

  const columns = [
    { header: 'Nome', accessor: (item) => item.name },
    { header: 'Preço', accessor: (item) => item.unit_price ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
    { header: 'Descrição', accessor: (item) => item.description || '-' },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o serviço ${item.name}?`)) {
      console.log('Excluindo...', item.id)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Serviços'
        buttonText='Novo Serviço'
        buttonLink='/servicos/novo'
      />
      <ListTable 
        columns={columns}
        data={workservice}
        editLinkPrefix="/servicos"
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
