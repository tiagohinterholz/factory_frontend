import { useStates } from "@/modules/location/state/hooks/useState"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"

export default function StateList() {
  const { states, loading } = useStates()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">
      <ListHeader
        title='Estados'
        buttonText='Novo Estado'
        buttonLink='/estados/novo'
      />
      <ListGrid>
        {states.map((state) => (
          <ListCard
            key={state.id}
            to={`/estados/${state.id}`}
            title={state.name}
            subtitle={state.abbreviation}
          />
        ))}
      </ListGrid>
      
    </div>
  )
}
