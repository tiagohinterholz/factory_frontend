import { useParams, useNavigate } from "react-router-dom"
import { useClientEditForm } from "@/modules/client/hooks/useClientEditForm"
import { useClientVehicles } from "@/modules/client/hooks/useClientVehicles"
import { useStates } from "@/modules/location/state/hooks/useState"
import { useCitiesByState } from "@/modules/location/city/hooks/useCity"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import MaskedField from "@/modules/core/components/MaskedField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import RelatedDataCard from "@/modules/core/components/RelatedDataCard"

import { User, Car, Edit2, Trash2, Milestone, ChevronRight } from "lucide-react"

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { form, onSubmit, loading, handleDelete } = useClientEditForm()
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()
  const stateId = watch("state_id")

  const { states, loading: loadingStates } = useStates()
  const { citiesByState, loading: loadingCities } = useCitiesByState(stateId)
  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))

  const { vehicles, loading: loadingVehicles } = useClientVehicles(id)

  if (loading || loadingStates || loadingBusinesses || (stateId && loadingCities)) {
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Detalhes do Cliente
          </h1>
          <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">
            Gestão completa e histórico do cliente
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Formulário de Edição */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Informações Pessoais</h3>
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
                  error={errors.first_name?.message}
                  registration={register("first_name")}
                />
                <FormField
                  label="Sobrenome"
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
                  error={errors.cpf?.message}
                />
                <FormField
                  label="E-mail"
                  type="email"
                  error={errors.email?.message}
                  registration={register("email")}
                />
              </div>

              <MaskedField
                control={control}
                name="phone"
                label="Telefone"
                mask="(__) _____-____"
                error={errors.phone?.message}
              />

              <div className="pt-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 tracking-tight">
                    Endereço e Localização
                  </h3>
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
                    error={errors.address?.message}
                    registration={register("address")}
                  />
                </div>
                <FormField
                  label="Número"
                  error={errors.number?.message}
                  registration={register("number")}
                />
              </div>

              <FormField
                label="Complemento"
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

        {/* Lado Direito: Dados Relacionados (Veículos, etc) */}
        <div className="lg:col-span-5 space-y-8">
          <RelatedDataCard
            title="Veículos Vinculados"
            icon={Car}
            items={vehicles.map((v) => ({
              id: v.id,
              name: `${v.model} ${v.year}`,
              subtitle: v.plate,
            }))}
            loading={loadingVehicles}
            emptyMessage="Este cliente ainda não possui veículos cadastrados."
            onAddClick={() => navigate("/veiculos/novo", { state: { clientId: id } })}
            renderItem={(item) => (
              <div
                onClick={() => navigate(`/veiculos/${item.id}`)}
                className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer transition duration-300 hover:bg-white hover:border-indigo-100 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition duration-300 shadow-sm border border-slate-100">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition duration-300">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-indigo-600 transition duration-300 translate-x-0 group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            )}
          />

          {/* Espaço para futuros componentes como Orçamentos ou Ordens de Serviço */}
          <div className="card-premium border-dashed border-slate-200 bg-slate-50 flex items-center justify-center py-10">
            <div className="text-center p-6">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1 opacity-50">
                Histórico em Breve
              </p>
              <p className="text-[10px] text-slate-300 px-4">
                Aqui você poderá visualizar Orçamentos e Ordens de Serviço vinculados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
