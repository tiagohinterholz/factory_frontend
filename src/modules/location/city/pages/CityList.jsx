import { useCities } from "@/modules/location/city/hooks/useCity"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { useToast } from "@/modules/core/feedback/toast-context"
import { useConfirm } from "@/modules/core/feedback/confirm-context"

export default function CityList() {
  const {
    cities,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useCities()

  const toast = useToast()
  const confirm = useConfirm()

  const columns = [
    { header: "Sigla", accessor: (item) => item.state.abbreviation },
    { header: "Cidade", accessor: (item) => item.name },
    { header: "Estado", accessor: (item) => item.state.name },
  ]

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Excluir cidade?",
      message: `A cidade "${item.name}" será removida permanentemente.`,
      confirmText: "Excluir",
      danger: true,
    })
    if (!confirmed) return

    try {
      await remove(item.id)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir a cidade.")
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Cidades" buttonText="Nova Cidade" buttonLink="/cidades/novo" />
      <ListTable
        columns={columns}
        data={cities}
        editLinkPrefix="/cidades"
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
