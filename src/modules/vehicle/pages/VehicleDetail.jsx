import { useVehicleEditForm } from "@/modules/vehicle/hooks/useVehicleEditForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { useAuth } from "@/modules/auth/context/auth-context"
import { fuelOptions } from "../constants/vehicle"

import { Edit, Trash2 } from "lucide-react"

export default function VehicleEdit() {
  const { form, onSubmit, loading, handleDelete } = useVehicleEditForm()
  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { isSuperUser } = useAuth()

  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
  }))

  if (loading || loadingBusinesses || loadingClients) return <p className="p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Editar Veículo
            </h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-[0.15em]">
              Sincronize os dados técnicos
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            {isSuperUser && (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id")}
              />
            )}

            <SelectField
              label="Cliente Proprietário"
              options={clientOptions}
              error={errors.client_id?.message}
              registration={register("client_id")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Fabricante"
                error={errors.manufacturer?.message}
                registration={register("manufacturer")}
              />
              <FormField
                label="Modelo"
                error={errors.model?.message}
                registration={register("model")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Ano de Fabricação"
                type="number"
                error={errors.year?.message}
                registration={register("year")}
              />
              <FormField
                label="Ano do Modelo"
                type="number"
                error={errors.year_model?.message}
                registration={register("year_model")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Placa"
                error={errors.plate?.message}
                registration={register("plate", {
                  onChange: (event) => setValue("plate", event.target.value.toUpperCase()),
                })}
              />
              <FormField
                label="Cor"
                error={errors.color?.message}
                registration={register("color")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Combustível"
                options={fuelOptions}
                error={errors.fuel?.message}
                registration={register("fuel")}
              />
              <FormField
                label="Quilometragem"
                type="number"
                error={errors.mileage?.message}
                registration={register("mileage")}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <PrimaryButton type="submit" icon={Edit} fullWidth={false} disabled={isSubmitting}>
                Salvar Alterações
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
