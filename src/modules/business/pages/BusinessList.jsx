import { useBusiness } from "../hooks/useBusiness"
import { Link } from "react-router-dom"

export default function BusinessList() {
  const { business, loading } = useBusiness()

  if (loading) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Empreendimentos</h1>
      <Link 
          to="/empreendimentos/novo" 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Novo Empreendimento
        </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {business.map((business) => (
          <Link
            key={business.id}
            to={`/empreendimentos/${business.id}`}
            className="border p-4 rounded-lg hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">{business.name}</h2>
            <p className="text-gray-600">CNPJ: {business.document}</p>
            <p className="text-gray-600">Cidade: {business.city?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
