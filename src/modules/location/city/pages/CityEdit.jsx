import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Milestone, Trash2, Edit2 } from "lucide-react"
import { CityService } from "../services/city"
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
      try {
        const data = await CityService.getCity(id)
        setName(data.name)
        setStateId(data.state.id)
      } finally {
        setLoadingCity(false)
      }
    }
    if (id) load()
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()
    try {
      await CityService.updateCity(id, { name, state_id: stateId })
      navigate("/cidades")
    } catch {
      alert("Erro ao atualizar cidade")
    }
  }

  async function handleDelete() {
    if (!confirm("Deseja realmente deletar?")) return
    await CityService.deleteCity(id)
    navigate("/cidades")
  }

  if (loadingCity || loadingStates) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Editar Cidade</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Gestão de municípios</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Milestone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Cadastro Municipal</h3>
          </div>

          <form className="space-y-6" onSubmit={handleUpdate}>
            <FormField
              label="Nome da Cidade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: São Paulo"
            />
            
            <SelectField
              label="Estado"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              options={states.map(s => ({ id: s.id, name: `${s.name} (${s.abbreviation})` }))}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Edit2}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
