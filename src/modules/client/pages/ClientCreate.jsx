import { useClientForm } from "@/modules/client/hooks/useClientForm"
import { useStateOptions } from "@/modules/core/hooks/options"
import { useCityOptionsByState } from "@/modules/core/hooks/options"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

import { User, Save, Milestone } from "lucide-react"

export default function ClientCreate() {
  const { form, onSubmit } = useClientForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()
  const stateId = watch("state_id")

  const { states, loading: loadingStates } = useStateOptions()
  const { citiesByState, loading: loadingCities } = useCityOptionsByState(stateId)
  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))

  if (loadingStates || loadingBusinesses || (stateId && loadingCities)) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Cliente</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">Gestão de clientes e parcerias</p>

        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-brand-subtle rounded-lg flex items-center justify-center text-brand border border-line">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Dados Pessoais</h3>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            {canChooseBusiness && (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id")}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nome"
                placeholder="Ex: João"
                error={errors.first_name?.message}
                registration={register("first_name")}
              />
              <FormField
                label="Sobrenome"
                placeholder="Ex: Silva"
                error={errors.last_name?.message}
                registration={register("last_name")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaskedField
                control={control}
                name="cpf"
                label="CPF"
                mask="___.___.___-__"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
              />
              <FormField
                label="E-mail"
                type="email"
                placeholder="joao@email.com"
                error={errors.email?.message}
                registration={register("email")}
              />
            </div>

            <MaskedField
              control={control}
              name="phone"
              label="Telefone"
              mask="(__) _____-____"
              placeholder="(00) 00000-0000"
              error={errors.phone?.message}
            />

            <div className="pt-6 pb-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <Milestone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Endereço e Localização</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Estado"
                options={states}
                error={errors.state_id?.message}
                registration={register("state_id", {
                  onChange: () => setValue("city_id", ""),
                })}
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
              placeholder="Apto, Casa, etc."
              error={errors.complement?.message}
              registration={register("complement")}
            />

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Save} fullWidth={false} disabled={isSubmitting}>
                Salvar Cliente
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
