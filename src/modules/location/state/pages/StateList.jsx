import { useStates } from "@/modules/location/state/hooks/useState"
import { StateService } from "@/modules/location/state/services/state"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function StateList() {
  const { 
    states, 
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    load
  } = useStates()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: 'Sigla', accessor: (item) => item.abbreviation },
    { header: 'Estado', accessor: (item) => item.name },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir estado?",
      message: `O estado "${item.name}" será removido permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await StateService.deleteState(item.id)
      load(searchTerm, currentPage)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir o estado.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Estados'
        buttonText='Novo Estado'
        buttonLink='/estados/novo'
      />
      <ListTable 
        columns={columns}
        data={states}
        editLinkPrefix="/estados"
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
