import { useWorkService } from "../hooks/useWorkService"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function WorkServiceList() {
  const { 
    workservice, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error
  } = useWorkService()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Nome', accessor: (item) => item.name },
    { header: 'Preço', accessor: (item) => item.unit_price ? `R$ ${parseFloat(item.unit_price).toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
    { header: 'Descrição', accessor: (item) => item.description || '-' },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir serviço?",
      message: `"${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o serviço.")
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
