import { useLicenseForm } from "@/modules/license/hooks/useLicenseForm"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Briefcase, Save } from "lucide-react"
import { LicenseOptions } from "@/modules/license/constants/license"

export default function LicenseCreate() {
  const {
    business, setBusiness,  
    period, setPeriod,
    max_users, setMaxUsers,
    activation_date, setActivationDate,
    businesses,
    isSuperUser,
    loading,
    handleSubmit
  } = useLicenseForm()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Configurar Licença</h1>
        <p className="text-slate-400 font-medium text-sm mb-8 uppercase tracking-[0.15em]">Renovação e limites</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados da Licença</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {isSuperUser ? (
                <SelectField 
                    label="Empreendimento"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    options={businesses.map(b => ({ id: b.id, name: b.corporate_name }))}
                    required
                />
            ) : (
                <FormField 
                    label="Empreendimento"
                    value={business}
                    disabled
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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

            <div className="grid grid-cols-1 gap-6">
              <FormField 
                label="Data de Ativação (Início)"
                value={activation_date}
                onChange={(e) => setActivationDate(e.target.value)}
                type="date"
                required
              />
            </div>

            <div className="pt-8 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false}>
                Confirmar Configuração
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
