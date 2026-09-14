import { useMyLicense } from "@/modules/license/hooks/useMyLicense"
import { useMyLicenseRenewForm } from "@/modules/license/hooks/useMyLicenseRenewForm"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { formatDate } from "@/modules/core/utils/format"
import { LicenseOptions } from "@/modules/license/constants/license"
import { Briefcase, RefreshCw } from "lucide-react"

const userLimitOptions = Array.from({ length: 10 }, (_, index) => ({
  id: String(index + 1),
  name: `${index + 1} Usuários`,
}))

const statusMap = {
  TRIAL: { label: "Em Teste", color: "text-amber-600 bg-amber-50" },
  ACTIVE: { label: "Ativa", color: "text-emerald-600 bg-emerald-50" },
  EXPIRED: { label: "Expirada", color: "text-danger bg-danger-subtle" },
}

// Licença do próprio negócio (rota /configuracoes/licenca — GET
// /configuracoes/licenca/, renovar via PATCH /configuracoes/licenca/renovar/,
// sempre "o meu negócio", sem business_id). Superusuário não usa esta tela.
export default function MyLicense() {
  const { license, loading: loadingLicense } = useMyLicense()
  const { form, onSubmit, loading: loadingForm } = useMyLicenseRenewForm()
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  if (loadingLicense || loadingForm) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentStatus = statusMap[license?.status] || {
    label: license?.status,
    color: "text-slate-400 bg-slate-50",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Licença</h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 font-medium text-sm">Do seu empreendimento</p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentStatus.color}`}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        <div className="card-premium mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="label-premium">Data de Ativação</p>
              <p className="text-sm font-medium text-ink">
                {formatDate(license?.activation_date) || "-"}
              </p>
            </div>
            <div>
              <p className="label-premium">Data de Expiração</p>
              <p className="text-sm font-medium text-ink">
                {formatDate(license?.expiration_date) || "-"}
              </p>
            </div>
            <div>
              <p className="label-premium">Dias Restantes</p>
              <p className="text-sm font-medium text-ink">{license?.remaining_days} dias</p>
            </div>
            <div>
              <p className="label-premium">Usuários</p>
              <p className="text-sm font-medium text-ink">
                {license?.current_users}/{license?.max_users}
              </p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Renovar Licença</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
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

            <div className="pt-4 flex justify-end">
              <PrimaryButton
                type="submit"
                icon={RefreshCw}
                fullWidth={false}
                disabled={isSubmitting}
              >
                Renovar
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
