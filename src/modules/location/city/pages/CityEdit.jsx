import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getCity, updateCity, deleteCity } from "@/modules/location/city/services/city"
import { useStates } from "@/modules/location/state/hooks/useState"

export default function CityEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [stateId, setStateId] = useState("")
  const [loadingCity, setLoadingCity] = useState(true)

  const { states, loading: loadingStates } = useStates()

  useEffect(() => {
    async function load() {
      const data = await getCity(id)
      setName(data.name)
      setStateId(data.state.id)
      setLoadingCity(false)
    }
    load()
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()
    await updateCity(id, { name, state_id: stateId })
    navigate("/cidades")
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await deleteCity(id)
    navigate("/cidades")
  }

  if (loadingCity || loadingStates) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold">Editar Cidade</h1>

      <form className="space-y-4" onSubmit={handleUpdate}>
        <div>
          <label className="block mb-1">Nome</label>
          <input
            className="border p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Estado</label>
          <select
            className="border p-2 rounded w-full"
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
          >
            <option value="">Selecione um estado</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name} ({state.abbreviation})
              </option>
            ))}
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Atualizar
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Deletar
      </button>
    </div>
  )
}
