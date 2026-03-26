import { useClient } from "../hooks/useClient"
import ListHeader from "@/modules/core/components/ListHeader"
import ListGrid from "@/modules/core/components/ListGrid"
import ListCard from "@/modules/core/components/ListCard"


export default function ClientList() {
  const { client, loading } = useClient()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <ListHeader
        title='Clientes'
        buttonText='Novo Cliente'
        buttonLink='/clientes/novo'
      />
      
      <ListGrid>
        {client.map((client) => (
          <ListCard
            key={client.id}
            to={`/clientes/${client.id}`}
            title={client.first_name + " " + client.last_name}
            subtitle={client.cpf}
          />
        ))}
      </ListGrid>
    </div>
  )
}
