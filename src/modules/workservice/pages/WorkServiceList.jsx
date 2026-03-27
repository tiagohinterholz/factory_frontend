import { useWorkService } from "../hooks/useWorkService"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function WorkServiceList() {
  const { workservice, loading } = useWorkService()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Serviços'
        buttonText='Novo Serviço'
        buttonLink='/servicos/novo'
      />
      
      <ListGrid>
        {workservice.map((workservice) => (
          <ListCard
            key={workservice.id}
            to={`/servicos/${workservice.id}`}
            title={workservice.name}
            subtitle={workservice.reference}
          />
        ))}
      </ListGrid>
    </div>
  )
}
