import { useVehicle } from "../hooks/useVehicle"
import ListHeader from "@/modules/core/components/ListHeader"
import ListTable from "@/modules/core/components/ListTable"

export default function VehicleList() {
  const { vehicle, loading } = useVehicle()

  const columns = [
    { header: 'Placa', accessor: (item) => item.plate },
    { header: 'Modelo', accessor: (item) => item.model },
    { header: 'Cor', accessor: (item) => item.color },
    { header: 'Cliente', accessor: (item) => `${item.client.first_name} ${item.client.last_name}` },
  ]

  const handleDelete = (item) => {
    if (window.confirm(`Deseja excluir o veículo ${item.plate}?`)) {
      console.log('Excluindo...', item.id)
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
      />
    </div>
  )
}
