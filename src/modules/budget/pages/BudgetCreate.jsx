import { useLocation } from "react-router-dom"
import { useBudgetForm } from "@/modules/budget/hooks/useBudgetForm"
import BackLink from "@/modules/core/components/BackLink"
import { ClientLiveSelect } from "@/modules/client"
import { VehicleLiveSelect } from "@/modules/vehicle"
import PrimaryButton from "@/modules/core/components/PrimaryButton"

export default function BudgetCreate() {
  const location = useLocation()
  const { form, onSubmit } = useBudgetForm({
    clientId: location.state?.clientId,
    vehicleId: location.state?.vehicleId,
    appointmentId: location.state?.appointmentId,
  })
  const {
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")

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
            <ClientLiveSelect
              label="Cliente"
              value={clientId}
              onChange={(value) => {
                if (value === clientId) return
                setValue("client_id", value)
                setValue("vehicle_id", "")
              }}
              error={errors.client_id?.message}
            />
            <VehicleLiveSelect
              label="Veículo"
              value={vehicleId}
              onChange={(value) => setValue("vehicle_id", value)}
              clientId={clientId}
              disabledHint="Selecione o cliente primeiro"
              error={errors.vehicle_id?.message}
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
