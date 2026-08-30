import { useBusiness } from "../hooks/useBusiness"
import { BusinessService } from "../services/business"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function BusinessList() {
  const { 
    business, 
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    load,
    error
  } = useBusiness()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Razão Social', accessor: (item) => item.corporate_name },
    { header: 'CNPJ', accessor: (item) => item.cnpj },
    { header: 'Email', accessor: (item) => item.email },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir empreendimento?",
      message: `"${item.corporate_name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await BusinessService.deleteBusiness(item.id)
      load(searchTerm, currentPage)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o empreendimento.")
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
