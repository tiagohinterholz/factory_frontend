import { useVehicle } from "../hooks/useVehicle"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function VehicleList() {
  const { vehicle, loading } = useVehicle()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='veiculos'
        buttonText='Novo Veiculo'
        buttonLink='/veiculos/novo'
      />
      
      <ListGrid>
        {vehicle.map((vehicle) => (
          <ListCard
            key={vehicle.id}
            to={`/veiculos/${vehicle.id}`}
            title={vehicle.model + " " + vehicle.year}
            subtitle={vehicle.plate}
          />
        ))}
      </ListGrid>
    </div>
  )
}
