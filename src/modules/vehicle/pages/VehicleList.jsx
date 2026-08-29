import { useVehicle } from "../hooks/useVehicle"
import { VehicleService } from "../services/vehicle"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function VehicleList() {
  const { 
    vehicle, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage,
    totalItems,
    load
  } = useVehicle()

  const columns = [
    { header: 'Placa', accessor: (item) => item.plate },
    { header: 'Modelo', accessor: (item) => item.model },
    { header: 'Cor', accessor: (item) => item.color },
    { header: 'Cliente', accessor: (item) => `${item.client.first_name} ${item.client.last_name}` },
  ]

  const handleDelete = async (item) => {
    if (window.confirm(`Deseja excluir o veículo ${item.plate}?`)) {
      try {
        await VehicleService.deleteVehicle(item.id)
        load(searchTerm, currentPage)
      } catch (error) {
        console.error(error)
        alert('Erro ao excluir o veículo.')
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Veículos'
        buttonText='Novo Veículo'
        buttonLink='/veiculos/novo'
      />
      <ListTable 
        columns={columns}
        data={vehicle}
        editLinkPrefix="/veiculos"
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
