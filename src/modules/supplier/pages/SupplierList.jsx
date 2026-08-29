import { useSupplier } from "../hooks/useSupplier"
import { SupplierService } from "../services/supplier"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function SupplierList() {
  const { 
    supplier, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    load
  } = useSupplier()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.corporate_name },
    { header: 'CNPJ', accessor: (item) => item.cnpj },
    { header: 'Telefone', accessor: (item) => item.phone },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir o fornecedor ${item.corporate_name}?`)) {
      try {
        await SupplierService.deleteSupplier(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir o fornecedor.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Fornecedores'
        buttonText='Novo Fornecedor'
        buttonLink='/fornecedores/novo'
      />
      <ListTable 
        columns={columns}
        data={supplier}
        editLinkPrefix="/fornecedores"
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
