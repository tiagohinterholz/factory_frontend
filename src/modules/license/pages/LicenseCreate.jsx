import { useLicenseForm } from "@/modules/license/hooks/useLicenseForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Briefcase, Save } from "lucide-react"
import { LicenseOptions } from "@/modules/license/constants/license"

const userLimitOptions = Array.from({ length: 10 }, (_, index) => ({
  id: String(index + 1),
  name: `${index + 1} Usuários`,
}))

export default function LicenseCreate() {
  const { form, onSubmit, isSuperUser } = useLicenseForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const { business: businesses, loading: loadingBusinesses } = useBusiness()

  if (isSuperUser && loadingBusinesses) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Configurar Licença</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Renovação e limites</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados da Licença</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            {isSuperUser && (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id")}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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

            <FormField
              label="Data de Ativação (Início)"
              type="date"
              error={errors.activation_date?.message}
              registration={register("activation_date")}
            />

            <div className="pt-8 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Confirmar Configuração
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
