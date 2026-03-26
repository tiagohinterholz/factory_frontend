import { useBusinessEditForm } from "@/modules/business/hooks/useBusinessEditForm"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Briefcase, Milestone, Edit2, Trash2 } from "lucide-react"


export default function BusinessEdit() {
  const {
    corporateName, setCorporateName,  
    tradeName, setTradeName,
    cnpj, setCnpj,
    stateId, setStateId,
    cityId, setCityId,
    address, setAddress,
    number, setNumber,
    complement, setComplement,
    phone, setPhone,
    email, setEmail,
    loading,
    handleUpdate,
    handleDelete
  } = useBusinessEditForm()
  
  const { states, loading: loadingStates } = useStates()
  const { citiesByState, loading: loadingCities } = useCitiesByState(stateId)

  const handleStateChange = (e) => {
    setStateId(e.target.value);
    setCityId(""); 
  };

  if (loading || loadingStates || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Editar Empreendimento</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Gestão de dados corporativos</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Empresa
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Organizacionais</h3>
          </div>

          <form className="space-y-6" onSubmit={handleUpdate}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Razão Social"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
              <FormField 
                label="Nome Fantasia"
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
              <FormField 
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <FormField 
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="pt-6 pb-2">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <Milestone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Localização</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Estado"
                value={stateId}
                onChange={handleStateChange}
                options={states}
              />
              <SelectField 
                label="Cidade"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                options={citiesByState}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                 <FormField 
                  label="Endereço"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <FormField 
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <FormField 
              label="Complemento"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
