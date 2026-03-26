import { useCities } from "@/modules/location/city/hooks/useCity"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"

export default function CityList() {
  const { cities, loading } = useCities()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Cidades'
        buttonText='Nova Cidade'
        buttonLink='/cidades/novo'
      />
      <ListGrid>
        {cities.map((city) => (
          <ListCard
            key={city.id}
            to={`/cidades/${city.id}`}
            title={city.name}
            subtitle={city.state.name}
          />
        ))}
      </ListGrid>
    </div>
  )
}
