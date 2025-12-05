import { useBusiness } from "../hooks/useBusiness"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function BusinessList() {
  const { business, loading } = useBusiness()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Empreendimentos'
        buttonText='Novo Empreendimento'
        buttonLink='/empreendimentos/novo'
      />
      
      <ListGrid>
        {business.map((business) => (
          <ListCard
            key={business.id}
            to={`/empreendimentos/${business.id}`}
            title={business.corporate_name}
            subtitle={business.cnpj}
          />
        ))}
      </ListGrid>
    </div>
  )
}
