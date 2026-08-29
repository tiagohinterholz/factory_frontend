import { useCities } from "@/modules/location/city/hooks/useCity"
import { CityService } from "@/modules/location/city/services/city"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function CityList() {
  const { 
    cities, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    load
  } = useCities()

  const columns = [
    { header: 'Sigla', accessor: (item) => item.state.abbreviation },
    { header: 'Cidade', accessor: (item) => item.name },
    { header: 'Estado', accessor: (item) => item.state.name },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir a cidade ${item.name}?`)) {
      try {
        await CityService.deleteCity(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir a cidade.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Cidades'
        buttonText='Nova Cidade'
        buttonLink='/cidades/novo'
      />
      <ListTable 
        columns={columns}
        data={cities}
        editLinkPrefix="/cidades"
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
