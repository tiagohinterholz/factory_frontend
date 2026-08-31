import { useLicenseEditForm } from "@/modules/license/hooks/useLicenseEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useAuth } from "@/modules/auth/context/auth-context"
import { Briefcase, Edit2 } from "lucide-react"
import { LicenseOptions } from "@/modules/license/constants/license"

const userLimitOptions = Array.from({ length: 10 }, (_, index) => ({
  id: String(index + 1),
  name: `${index + 1} Usuários`,
}))

const statusMap = {
  TRIAL: { label: "Em Teste", color: "text-amber-600 bg-amber-50" },
  ACTIVE: { label: "Ativa", color: "text-emerald-600 bg-emerald-50" },
  EXPIRED: { label: "Expirada", color: "text-rose-600 bg-rose-50" },
}

export default function LicenseDetail() {
  const { form, onSubmit, loading, status, businessName } = useLicenseEditForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { isSuperUser } = useAuth()

  if (loading || loadingBusinesses) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const currentStatus = statusMap[status] || {
    label: status,
    color: "text-slate-400 bg-slate-50",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Gestão de Licença
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">
                Configurar renovação
              </p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentStatus.color}`}
              >
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

          <form className="space-y-6" onSubmit={onSubmit}>
            {isSuperUser ? (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id")}
              />
            ) : (
              <FormField label="Empreendimento" value={businessName} onChange={() => {}} readOnly />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Período de Renovação"
                options={LicenseOptions}
                error={errors.period?.message}
                registration={register("period")}
              />
              <SelectField
                label="Limite de Usuários"
                options={userLimitOptions}
                error={errors.max_users?.message}
                registration={register("max_users")}
              />
            </div>

            <div className="border-t border-slate-50 pt-6">
              <FormField
                label="Início da Vigência (Nova ou Atual)"
                type="date"
                error={errors.activation_date?.message}
                registration={register("activation_date")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Atualizar e Renovar
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
