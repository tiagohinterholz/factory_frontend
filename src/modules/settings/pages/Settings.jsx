import {
  useBusinessEditForm,
  useBusinessHours,
  useBusinessLogo,
  BusinessHoursPanel,
} from "@/modules/business"
import { TAX_REGIME_OPTIONS } from "@/modules/business/domain"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { useStateOptions } from "@/modules/core/hooks/options"
import { useCityOptionsByState } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import LogoUploadField from "@/modules/core/components/LogoUploadField"
import { CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"
import { Briefcase, Milestone, Edit2, Landmark, Building2 } from "lucide-react"

const FORM_ID = "business-edit-form"

// Gestão do empreendimento (rota /configuracoes — GET/PATCH /configuracoes/,
// sempre "o meu negócio", resolvido pelo token; superusuário não tem um e
// não usa esta tela). Cada usuário só tem um empreendimento: sem listagem,
// sem excluir aqui (quebraria dados dependentes; isso é coisa de
// superusuário, em outro lugar). Abre em visualização; "Editar
// Empreendimento" libera o form inteiro de uma vez (bloco único, não campo
// a campo).
export default function Settings() {
  const { isAdmin } = usePermissions()
  const { form, onSubmit, loading, editing, startEdit, cancelEdit } = useBusinessEditForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const stateId = watch("state_id")
  const { states, loading: loadingStates } = useStateOptions()
  const { citiesByState, loading: loadingCities } = useCityOptionsByState(stateId)
  const { hours, loading: loadingHours, savingWeekday, updateHour } = useBusinessHours()
  const { logoUrl, loading: loadingLogo } = useBusinessLogo()

  if (loading || loadingStates || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Gestão do Empreendimento
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              {editing ? "Editando os dados corporativos" : "Dados do seu empreendimento"}
            </p>
          </div>

          {isAdmin &&
            (editing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-muted hover:bg-ground transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form={FORM_ID}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-60 disabled:pointer-events-none"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <button type="button" onClick={startEdit} className="btn-primary">
                <Edit2 className="w-4 h-4" />
                Editar Empreendimento
              </button>
            ))}
        </div>

        <div className="card-premium">
          <form id={FORM_ID} onSubmit={onSubmit}>
            {/* Dados organizacionais */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Dados Organizacionais</h3>
            </div>

            {editing ? (
              <LogoUploadField
                label="Logo do empreendimento"
                value={watch("logo")}
                currentUrl={logoUrl}
                onChange={(next) => setValue("logo", next, { shouldValidate: true })}
                error={errors.logo?.message}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-line bg-ground flex items-center justify-center overflow-hidden shrink-0">
                  {loadingLogo ? (
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo do empreendimento"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-muted" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink">{watch("corporate_name")}</p>
                  <p className="text-sm text-muted">{watch("trade_name")}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <FormField
                label="Razão Social"
                placeholder="Ex: Empresa de Serviços LTDA"
                disabled={!editing}
                error={errors.corporate_name?.message}
                registration={register("corporate_name")}
              />
              <FormField
                label="Nome Fantasia"
                placeholder="Ex: Minha Empresa"
                disabled={!editing}
                error={errors.trade_name?.message}
                registration={register("trade_name")}
              />
              <MaskedField
                control={control}
                name="cnpj"
                label="CNPJ"
                mask={CNPJ_MASK}
                placeholder="00.000.000/0000-00"
                disabled={!editing}
                error={errors.cnpj?.message}
              />
              <FormField
                label="E-mail"
                type="email"
                placeholder="contato@empresa.com"
                disabled={!editing}
                error={errors.email?.message}
                registration={register("email")}
              />
              <MaskedField
                control={control}
                name="phone"
                label="Telefone"
                mask={PHONE_MASK}
                placeholder="(00) 00000-0000"
                disabled={!editing}
                error={errors.phone?.message}
              />
            </div>

            <div className="pt-8 pb-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Dados Fiscais</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Inscrição Estadual"
                placeholder="Opcional"
                disabled={!editing}
                error={errors.state_registration?.message}
                registration={register("state_registration")}
              />
              <FormField
                label="Inscrição Municipal"
                placeholder="Opcional"
                disabled={!editing}
                error={errors.municipal_registration?.message}
                registration={register("municipal_registration")}
              />
              <SelectField
                label="Regime Tributário"
                options={TAX_REGIME_OPTIONS}
                disabled={!editing}
                error={errors.tax_regime?.message}
                registration={register("tax_regime")}
              />
            </div>

            <div className="pt-8 pb-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <Milestone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Localização</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SelectField
                label="Estado"
                options={states}
                disabled={!editing}
                error={errors.state_id?.message}
                registration={register("state_id", { onChange: () => setValue("city_id", "") })}
              />
              <SelectField
                label="Cidade"
                options={citiesByState}
                disabled={!editing}
                error={errors.city_id?.message}
                registration={register("city_id")}
              />
              <FormField
                label="Endereço"
                placeholder="Rua, Avenida, etc."
                disabled={!editing}
                error={errors.address?.message}
                registration={register("address")}
              />
              <FormField
                label="Número"
                placeholder="123"
                disabled={!editing}
                error={errors.number?.message}
                registration={register("number")}
              />
              <FormField
                label="Complemento"
                placeholder="Sala, Bloco, etc."
                disabled={!editing}
                error={errors.complement?.message}
                registration={register("complement")}
              />
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <BusinessHoursPanel
              hours={hours}
              loading={loadingHours}
              canEdit={isAdmin && editing}
              savingWeekday={savingWeekday}
              onSave={updateHour}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
