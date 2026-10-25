import { useAppointmentForm } from "@/modules/appointment/hooks/useAppointmentForm"
import BackLink from "@/modules/core/components/BackLink"
import { useOrderOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import { ClientLiveSelect } from "@/modules/client"
import { VehicleLiveSelect } from "@/modules/vehicle"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { Save } from "lucide-react"

export default function AppointmentCreate() {
  const { form, onSubmit } = useAppointmentForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")

  const { orders, loading: loadingOrders } = useOrderOptions()

  const orderOptions = orders
    .filter((o) => {
      const orderVehicleId = o.vehicle?.id || o.vehicle
      return !vehicleId || String(orderVehicleId) === String(vehicleId)
    })
    .map((o) => ({ id: o.id, name: `OS ${o.id} - ${o.plate || ""}` }))

  function resetChildren(...names) {
    names.forEach((name) => setValue(name, ""))
  }

  if (loadingOrders) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <BackLink to="/agendamentos" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">Novo Agendamento</h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Agende um horário para atendimento
        </p>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            <ClientLiveSelect
              label="Cliente Proprietário"
              value={clientId}
              onChange={(value) => {
                if (value === clientId) return
                setValue("client_id", value)
                resetChildren("vehicle_id", "order_id")
              }}
              error={errors.client_id?.message}
            />

            <VehicleLiveSelect
              label="Veículo"
              value={vehicleId}
              onChange={(value) => {
                setValue("vehicle_id", value)
                resetChildren("order_id")
              }}
              clientId={clientId}
              disabledHint="Selecione o cliente primeiro"
              error={errors.vehicle_id?.message}
            />

            <SelectField
              label="Ordem de Serviço"
              options={orderOptions}
              disabled={!vehicleId}
              disabledHint="Selecione o veículo primeiro"
              error={errors.order_id?.message}
              registration={register("order_id")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Data"
                type="date"
                error={errors.date?.message}
                registration={register("date")}
              />
              <FormField
                label="Hora"
                type="time"
                placeholder="00:00"
                error={errors.time?.message}
                registration={register("time")}
              />
            </div>

            <FormField
              label="Observações"
              placeholder="Detalhes sobre o agendamento..."
              error={errors.observation?.message}
              registration={register("observation")}
            />

            <div className="pt-4">
              <PrimaryButton type="submit" icon={Save} disabled={isSubmitting}>
                Salvar Agendamento
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
