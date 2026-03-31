import { useLicenseEditForm } from "@/modules/license/hooks/useLicenseEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Briefcase, Milestone, Edit2, Trash2 } from "lucide-react"
import { LicenseOptions } from "@/modules/license/constants/license"

export default function LicenseDetail() {
  const {
    business, setBusiness,
    status,
    period, setPeriod,
    max_users, setMaxUsers,
    activation_date, setActivationDate,
    loading,
    handleRenewSubmit
  } = useLicenseEditForm()
  
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const isSuperUser = !user.business_id

  if (loading || loadingBusinesses) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const businessOptions = businesses?.map(b => ({
    id: b.id,
    name: b.corporate_name
  })) || []

  const statusMap = {
    'TRIAL': { label: 'Em Teste', color: 'text-amber-600 bg-amber-50' },
    'ACTIVE': { label: 'Ativa', color: 'text-emerald-600 bg-emerald-50' },
    'EXPIRED': { label: 'Expirada', color: 'text-rose-600 bg-rose-50' }
  }
  const currentStatus = statusMap[status] || { label: status, color: 'text-slate-400 bg-slate-50' }

  return (
    <div className="p-6 space-y-6">
      
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Gestão de Licença</h1>
            <div className="flex items-center gap-2">
                <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">Configurar renovação</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentStatus.color}`}>
                    {currentStatus.label}
                </span>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Organizacionais</h3>
          </div>

          <form className="space-y-6" onSubmit={handleRenewSubmit}>
            
            {isSuperUser ? (
              <SelectField 
                label="Empreendimento"
                value={business?.id || business || ""}
                onChange={(e) => setBusiness(e.target.value)}
                options={businessOptions}
                required
              />
            ) : (
              <FormField 
                  label="Empreendimento"
                  value={business?.trade_name || business?.corporate_name || "Carregando..."}
                  onChange={() => {}}
                  readOnly
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Período de Renovação"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                options={LicenseOptions}
                required
              />
              <SelectField 
                label="Limite de Usuários"
                value={max_users}
                onChange={(e) => setMaxUsers(e.target.value)}
                options={Array.from({ length: 10 }, (_, i) => ({ id: (i + 1).toString(), name: `${i + 1} Usuários` }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-50 pt-6">
              <FormField 
                label="Início da Vigência (Nova ou Atual)"
                value={activation_date ? new Date(activation_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setActivationDate(e.target.value)}
                type="date"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false}>
                Atualizar e Renovar
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
