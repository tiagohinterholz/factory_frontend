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
    totalItems
  } = useStates()

  const columns = [
    { header: 'Sigla', accessor: (item) => item.abbreviation },
    { header: 'Estado', accessor: (item) => item.name },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o estado ${item.name}?`)) {
      console.log('Excluindo...', item.id)
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
