import { useAppointmentEditForm } from "@/modules/appointment/hooks/useAppointmentEditForm"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useClientOptions } from "@/modules/core/hooks/options"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import { useOrderOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"

import { Edit, Trash2 } from "lucide-react"

export default function AppointmentDetail() {
  const { form, onSubmit, loading, handleDelete } = useAppointmentEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const { canChooseBusiness } = usePermissions()

  const businessId = watch("business_id")
  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")

  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { client: clients, loading: loadingClients } = useClientOptions()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicleOptions()
  const { orders, loading: loadingOrders } = useOrderOptions()

  const businessOptions = businesses.map((b) => ({ id: b.id, name: b.corporate_name }))

  const clientOptions = clients
    .filter((c) => {
      const bizId = c.business?.id || c.business
      return !businessId || String(bizId) === String(businessId)
    })
    .map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` }))

  const vehicleOptions = vehicles
    .filter((v) => {
      const ownerId = v.client?.id || v.client
      return !clientId || String(ownerId) === String(clientId)
    })
    .map((v) => ({
      id: v.id,
      name: `${v.manufacturer || ""} ${v.model || ""} ${v.year || ""}`.trim(),
    }))

  const orderOptions = orders
    .filter((o) => {
      const orderVehicleId = o.vehicle?.id || o.vehicle
      return !vehicleId || String(orderVehicleId) === String(vehicleId)
    })
    .map((o) => ({ id: o.id, name: `OS ${o.id} - ${o.plate || ""}` }))

  function resetChildren(...names) {
    names.forEach((name) => setValue(name, ""))
  }

  if (loading || loadingBusinesses || loadingClients || loadingVehicles || loadingOrders)
    return <p className="p-6 text-slate-500 font-medium">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Editar Agendamento
            </h1>
            <p className="text-slate-400 font-medium text-sm">Sincronize os dados do agendamento</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>

        <div className="card-premium">
          <form className="space-y-6" onSubmit={onSubmit}>
            {canChooseBusiness && (
              <SelectField
                label="Empreendimento"
                options={businessOptions}
                error={errors.business_id?.message}
                registration={register("business_id", {
                  onChange: () => resetChildren("client_id", "vehicle_id", "order_id"),
                })}
              />
            )}

            <SelectField
              label="Cliente Proprietário"
              options={clientOptions}
              error={errors.client_id?.message}
              registration={register("client_id", {
                onChange: () => resetChildren("vehicle_id", "order_id"),
              })}
            />

            <SelectField
              label="Veículo"
              options={vehicleOptions}
              error={errors.vehicle_id?.message}
              registration={register("vehicle_id", {
                onChange: () => resetChildren("order_id"),
              })}
            />

            <SelectField
              label="Ordem de Serviço"
              options={orderOptions}
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
