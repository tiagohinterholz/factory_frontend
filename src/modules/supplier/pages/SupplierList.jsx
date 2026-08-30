import { useSupplier } from "../hooks/useSupplier"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function SupplierList() {
  const { 
    supplier, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error
  } = useSupplier()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.corporate_name },
    { header: 'CNPJ', accessor: (item) => item.cnpj },
    { header: 'Telefone', accessor: (item) => item.phone },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir fornecedor?",
      message: `"${item.corporate_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o fornecedor.")
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
