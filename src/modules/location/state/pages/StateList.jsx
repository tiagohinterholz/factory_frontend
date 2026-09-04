import { useStates } from "@/modules/location/state/hooks/useState"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function StateList() {
  const {
    states,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    error,
  } = useStates()

  const columns = [
    { header: "Sigla", accessor: (item) => item.abbreviation },
    { header: "Estado", accessor: (item) => item.name },
    { header: "Ativo", accessor: (item) => (item.is_active ? "Sim" : "Não") },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Estados" subtitle="Divisões territoriais — somente leitura" />
      <ListTable
        columns={columns}
        data={states}
        editLinkPrefix="/estados"
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
