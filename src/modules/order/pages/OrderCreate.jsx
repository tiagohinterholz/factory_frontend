import { useState } from "react"
import { useLocation } from "react-router-dom"
import { useOrderForm } from "@/modules/order/hooks/useOrderForm"
import { usePendingBudgets } from "@/modules/order/hooks/usePendingBudgets"
import BackLink from "@/modules/core/components/BackLink"
import { useBusinessOptions } from "@/modules/core/hooks/options"
import { useClientOptions } from "@/modules/core/hooks/options"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { usePermissions } from "@/modules/auth/hooks/usePermissions"
import { fromDateTimeLocalInput } from "@/api/dto"

const money = (value) => `R$ ${parseFloat(value || 0).toFixed(2)}`

export default function OrderCreate() {
  const location = useLocation()
  const { form, onSubmit, createFromBudget, approvingBudget } = useOrderForm({
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

  const { canChooseBusiness } = usePermissions()

  const businessId = watch("business_id")
  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")
  const serviceDate = watch("service_date")

  const [selectedBudgetId, setSelectedBudgetId] = useState(null)
  const clearBudgetChoice = () => setSelectedBudgetId(null)

  const { business: businesses, loading: loadingBusinesses } = useBusinessOptions()
  const { client: clients, loading: loadingClients } = useClientOptions()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicleOptions()
  const { budgets: pendingBudgets, loading: loadingPendingBudgets } = usePendingBudgets(
    clientId,
    vehicleId,
  )

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
        <BackLink to="/ordens" />
        <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
          Nova Ordem de Serviço
        </h1>
        <p className="text-slate-400 font-medium text-sm mb-8">
          Inicie uma nova ordem de manutenção
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
                    clearBudgetChoice()
                  },
                })}
              />
            )}
            <SelectField
              label="Cliente"
              options={clientOptions}
              disabled={!businessId}
              disabledHint="Selecione o empreendimento primeiro"
              error={errors.client_id?.message}
              registration={register("client_id", {
                onChange: () => {
                  setValue("vehicle_id", "")
                  clearBudgetChoice()
                },
              })}
            />
            <SelectField
              label="Veículo"
              options={vehicleOptions}
              disabled={!clientId}
              disabledHint="Selecione o cliente primeiro"
              error={errors.vehicle_id?.message}
              registration={register("vehicle_id", { onChange: clearBudgetChoice })}
            />

            {clientId && vehicleId && (
              <div className="space-y-2">
                <p className="label-premium">Partir de um orçamento pendente (opcional)</p>
                {loadingPendingBudgets ? (
                  <p className="text-sm text-muted">Buscando orçamentos…</p>
                ) : pendingBudgets.length === 0 ? (
                  <p className="text-sm text-muted">
                    Nenhum orçamento pendente para este cliente e veículo — a OS será criada do
                    zero.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {pendingBudgets.map((budget) => {
                      const selected = String(selectedBudgetId) === String(budget.id)
                      return (
                        <button
                          type="button"
                          key={budget.id}
                          onClick={() => setSelectedBudgetId(selected ? null : budget.id)}
                          aria-pressed={selected}
                          className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${
                            selected
                              ? "border-brand bg-brand-subtle"
                              : "border-line hover:bg-ground"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-ink text-sm">
                              Orçamento #{budget.id}
                            </span>
                            <span className="font-bold text-ink text-sm tabular-nums">
                              {money(budget.total)}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted mt-0.5 tabular-nums">
                            Produtos {money(budget.products_total)} · Serviços{" "}
                            {money(budget.services_total)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <FormField
              label="Data e hora do serviço"
              type="datetime-local"
              error={errors.service_date?.message}
              registration={register("service_date")}
            />
            <div className="pt-4">
              {selectedBudgetId ? (
                <PrimaryButton
                  type="button"
                  disabled={approvingBudget}
                  onClick={() =>
                    createFromBudget(selectedBudgetId, fromDateTimeLocalInput(serviceDate))
                  }
                >
                  Aprovar orçamento e abrir a OS
                </PrimaryButton>
              ) : (
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  Prosseguir para Itens
                </PrimaryButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
