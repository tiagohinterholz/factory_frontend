import { useLocation } from "react-router-dom"
import { useVehicleForm } from "@/modules/vehicle/hooks/useVehicleForm"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useClientOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { fuelOptions } from "../constants/vehicle"
import { Save } from "lucide-react"

export default function VehicleCreate() {
  const location = useLocation()
  const { form, onSubmit } = useVehicleForm({ clientId: location.state?.clientId })
  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()

  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { client: clients, loading: loadingClients } = useClientOptions()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
  }))

  if (loadingBusinesses || loadingClients) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Veículo</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Cadastre as informações técnicas do veículo
        </p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            {canChooseBusiness && (
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
                placeholder="Ex: Toyota"
                error={errors.manufacturer?.message}
                registration={register("manufacturer")}
              />
              <FormField
                label="Modelo"
                placeholder="Ex: Corolla"
                error={errors.model?.message}
                registration={register("model")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Ano de Fabricação"
                type="number"
                placeholder="2023"
                error={errors.year?.message}
                registration={register("year")}
              />
              <FormField
                label="Ano do Modelo"
                type="number"
                placeholder="2024"
                error={errors.year_model?.message}
                registration={register("year_model")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Placa"
                placeholder="ABC-1234"
                error={errors.plate?.message}
                registration={register("plate", {
                  onChange: (event) => setValue("plate", event.target.value.toUpperCase()),
                })}
              />
              <FormField
                label="Cor"
                placeholder="Prata"
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
                placeholder="0"
                error={errors.mileage?.message}
                registration={register("mileage")}
              />
            </div>

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Veículo
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
