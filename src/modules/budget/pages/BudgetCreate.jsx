import { useLocation } from "react-router-dom"
import { useBudgetForm } from "@/modules/budget/hooks/useBudgetForm"
import BackLink from "@/modules/core/components/BackLink"
import { useClientOptions } from "@/modules/core/hooks/options"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function BudgetCreate() {
  const location = useLocation()
  const { form, onSubmit } = useBudgetForm({
    clientId: location.state?.clientId,
    vehicleId: location.state?.vehicleId,
    appointmentId: location.state?.appointmentId,
  })
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const businessId = watch("business_id")
  const clientId = watch("client_id")

  const { client: clients, loading: loadingClients } = useClientOptions()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicleOptions()

  const clientOptions = clients
    .filter((c) => !businessId || String(c.business?.id || c.business) === String(businessId))
    .map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))
  const vehicleOptions = vehicles
    .filter((v) => !clientId || String(v.client?.id || v.client) === String(clientId))
    .map((v) => ({ id: v.id, name: `${v.manufacturer?.name} ${v.model?.name} (${v.plate})` }))

  if (loadingClients || loadingVehicles) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/orcamentos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Orçamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Crie a estrutura básica do orçamento
        </p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
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
              disabled={!clientId}
              disabledHint="Selecione o cliente primeiro"
              error={errors.vehicle_id?.message}
              registration={register("vehicle_id")}
            />
            <p className="text-xs text-muted">
              A validade é definida automaticamente em 30 dias e pode ser ajustada depois, na edição
              do orçamento.
            </p>
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
