import { useBusinessEditForm } from "@/modules/business/hooks/useBusinessEditForm"
import { useStateOptions } from "@/modules/core/hooks/options"
import { useCityOptionsByState } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { CNPJ_MASK, PHONE_MASK } from "@/modules/core/schemas/br-fields"
import { Briefcase, Milestone, Edit2, Trash2 } from "lucide-react"

export default function BusinessEdit() {
  const { form, onSubmit, loading, handleDelete } = useBusinessEditForm()
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

  if (loading || loadingStates || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Editar Empreendimento
            </h1>
            <p className="text-slate-400 font-medium text-sm">Gestão de dados corporativos</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Empresa
          </button>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Organizacionais</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Razão Social"
                placeholder="Ex: Empresa de Serviços LTDA"
                error={errors.corporate_name?.message}
                registration={register("corporate_name")}
              />
              <FormField
                label="Nome Fantasia"
                placeholder="Ex: Minha Empresa"
                error={errors.trade_name?.message}
                registration={register("trade_name")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaskedField
                control={control}
                name="cnpj"
                label="CNPJ"
                mask={CNPJ_MASK}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj?.message}
              />
              <FormField
                label="E-mail"
                type="email"
                placeholder="contato@empresa.com"
                error={errors.email?.message}
                registration={register("email")}
              />
            </div>

            <MaskedField
              control={control}
              name="phone"
              label="Telefone"
              mask={PHONE_MASK}
              placeholder="(00) 00000-0000"
              error={errors.phone?.message}
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
                options={states}
                error={errors.state_id?.message}
                registration={register("state_id", { onChange: () => setValue("city_id", "") })}
              />
              <SelectField
                label="Cidade"
                options={citiesByState}
                error={errors.city_id?.message}
                registration={register("city_id")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormField
                  label="Endereço"
                  placeholder="Rua, Avenida, etc."
                  error={errors.address?.message}
                  registration={register("address")}
                />
              </div>
              <FormField
                label="Número"
                placeholder="123"
                error={errors.number?.message}
                registration={register("number")}
              />
            </div>

            <FormField
              label="Complemento"
              placeholder="Sala, Bloco, etc."
              error={errors.complement?.message}
              registration={register("complement")}
            />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit2} fullWidth={false} disabled={isSubmitting}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
