import { useParams, useNavigate } from "react-router-dom"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"
import { useStateEditForm } from "@/modules/location/state/hooks/useStateEditForm"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"

import { MapPin, Globe, Edit2, Trash2, Milestone } from "lucide-react"


export default function StateEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const {
    name,
    setName,
    abbreviation,
    setAbbreviation,
    loading,
    handleUpdate,
    handleDelete
  } = useStateEditForm()

  const { citiesByState, loading: loadingCities } = useCitiesByState(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Editar Estado</h1>
          <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Gestão de divisões territoriais</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir Estado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-7">
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Informações do Estado</h3>
            </div>

            <form className="space-y-6" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    label="Nome do Estado"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <FormField
                  label="Sigla"
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                  placeholder="EX: SP"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit2} fullWidth={false}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        {/* Lado Direito: Cidades do Estado */}
        <div className="lg:col-span-5">
          <RelatedDataCard 
            title="Cidades Vinculadas"
            icon={MapPin}
            items={citiesByState.map(city => ({
              id: city.id,
              name: city.name,
              subtitle: "Município"
            }))}
            loading={loadingCities}
            emptyMessage="Este estado ainda não possui cidades cadastradas."
            onAddClick={() => navigate("/cidades/novo", { state: { stateId: id } })}
            renderItem={(item) => (
               <div 
                onClick={() => navigate(`/cidades/${item.id}`)}
                className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer transition duration-300 hover:bg-white hover:border-indigo-100 hover:shadow-md"
              >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition duration-300 shadow-sm border border-slate-100">
                      <Milestone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition duration-300">{item.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
              </div>
            )}
          />
        </div>

      </div>
    </div>
  )
}
