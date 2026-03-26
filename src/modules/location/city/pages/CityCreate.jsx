import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { createCity } from "@/modules/location/city/services/city"
import { useStates } from "@/modules/location/state/hooks/useState"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Milestone, Save } from "lucide-react"

export default function CityCreate() {
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState("")
  const [stateId, setStateId] = useState(location.state?.stateId || "")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Nova Cidade</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Adicione um novo município ao sistema</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Milestone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro Municipal</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              label="Nome da Cidade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Curitiba"
            />
            
            <SelectField
              label="Estado"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              options={states.map(s => ({ id: s.id, name: `${s.name} (${s.abbreviation})` }))}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save}>
                Salvar Cidade
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
