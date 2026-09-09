import { useCities } from "@/modules/location/city/hooks/useCity"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function CityList() {
  const { cities, loading, currentPage, setCurrentPage, totalItems, refetch, remove, error } =
    useCities()

  const columns = [
    { header: "Sigla", accessor: (item) => item.state.abbreviation },
    { header: "Cidade", accessor: (item) => item.name },
    { header: "Estado", accessor: (item) => item.state.name },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Cidades" buttonText="Nova Cidade" buttonLink="/cidades/novo" />
      <ListTable
        columns={columns}
        data={cities}
        editLinkPrefix="/cidades"
        onDelete={remove}
        loading={loading}
        error={error}
        onRetry={refetch}
        currentPage={currentPage}
        handlePageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  )
}
