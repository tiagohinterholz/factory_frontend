import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createCity } from "@/modules/location/city/services/city"
import { useStates } from "@/modules/location/state/hooks/useState"

export default function CityCreate() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [stateId, setStateId] = useState("")
  const { states, loading } = useStates()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await createCity({ name, state_id: stateId })
      navigate("/cidades")
    } catch (error) {
      alert("Erro ao criar cidade!")
      console.log(error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nova Cidade</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">Nome da Cidade</label>
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

        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
      </form>
    </div>
  )
}
