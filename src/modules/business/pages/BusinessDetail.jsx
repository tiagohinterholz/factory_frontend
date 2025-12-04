import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getBusinessById } from "../services/business"

export default function BusinessDetail() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)

  useEffect(() => {
    async function load() {
      const data = await getBusinessById(id)
      setBusiness(data)
    }
    load()
  }, [id])

  if (!business) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{business.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Informações</h2>
          <p>CNPJ: {business.document}</p>
          <p>Ativo: {business.is_active ? "Sim" : "Não"}</p>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Localização</h2>
          <p>Estado: {business.state?.name}</p>
          <p>Cidade: {business.city?.name}</p>
        </div>
      </div>
    </div>
  )
}
