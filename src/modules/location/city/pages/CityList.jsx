import { Link } from "react-router-dom"
import { useCities } from "@/modules/location/city/hooks/useCity"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

export default function CityList() {
  const { cities, loading, currentPage, setCurrentPage, totalItems, refetch, remove, error } =
    useCities()
  const { isSuperUser } = usePermissions()

  const columns = [
    { header: "Sigla", accessor: (item) => item.state.abbreviation },
    { header: "Cidade", accessor: (item) => item.name },
    {
      header: "Estado",
      accessor: (item) => (
        <Link to={`/estados/${item.state.id}`} className="text-brand hover:underline">
          {item.state.name}
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title="Cidades"
        buttonText={isSuperUser ? "Nova Cidade" : undefined}
        buttonLink={isSuperUser ? "/cidades/novo" : undefined}
      />
      <ListTable
        columns={columns}
        data={cities}
        editLinkPrefix="/cidades"
        onDelete={isSuperUser ? remove : undefined}
        readOnly={!isSuperUser}
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
