import { Link } from "react-router-dom"
import { useVehicleModels } from "@/modules/vehiclemodel/hooks/useVehicleModel"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function VehicleModelList() {
  const {
    vehicleModels,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    refetch,
    remove,
    error,
  } = useVehicleModels()

  const columns = [
    { header: "Modelo", accessor: (item) => item.name },
    {
      header: "Marca",
      accessor: (item) => (
        <Link to={`/marcas/${item.manufacturer.id}`} className="text-brand hover:underline">
          {item.manufacturer.name}
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-4">
      <ListHeader title="Modelos" buttonText="Novo Modelo" buttonLink="/modelos/novo" />
      <ListTable
        columns={columns}
        data={vehicleModels}
        editLinkPrefix="/modelos"
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
