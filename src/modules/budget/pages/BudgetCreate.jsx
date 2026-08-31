import { useBudgetForm } from "@/modules/budget/hooks/useBudgetForm"
import { useBusiness } from "@/modules/business/hooks/useBusiness"
import { useClient } from "@/modules/client/hooks/useClient"
import { useVehicle } from "@/modules/vehicle/hooks/useVehicle"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

export default function BudgetCreate() {
  const { form, onSubmit } = useBudgetForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()

  const businessId = watch("business_id")
  const clientId = watch("client_id")

  const { business: businesses, loading: loadingBusinesses } = useBusiness()
  const { client: clients, loading: loadingClients } = useClient()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicle()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))
  const clientOptions = clients
    .filter((c) => !businessId || String(c.business?.id || c.business) === String(businessId))
    .map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOptions = vehicles
    .filter((v) => !clientId || String(v.client?.id || v.client) === String(clientId))
    .map((v) => ({ id: v.id, name: `${v.manufacturer} ${v.model} (${v.plate})` }))

  if (loadingBusinesses || loadingClients || loadingVehicles) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Orçamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Crie a estrutura básica do orçamento
        </p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            {canChooseBusiness && (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id", {
                  onChange: () => {
                    setValue("client_id", "")
                    setValue("vehicle_id", "")
                  },
                })}
              />
            )}
            <SelectField
              label="Cliente"
              options={clientOptions}
              error={errors.client_id?.message}
              registration={register("client_id", {
                onChange: () => setValue("vehicle_id", ""),
              })}
            />
            <SelectField
              label="Veículo"
              options={vehicleOptions}
              error={errors.vehicle_id?.message}
              registration={register("vehicle_id")}
            />
            <FormField
              label="Validade"
              type="date"
              error={errors.valid_until?.message}
              registration={register("valid_until")}
            />
            <div className="pt-4">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                Prosseguir para Itens
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
