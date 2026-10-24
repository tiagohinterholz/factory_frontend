import { useState } from "react"
import { useLocation } from "react-router-dom"
import { useOrderForm } from "@/modules/order/hooks/useOrderForm"
import { usePendingBudgets } from "@/modules/order/hooks/usePendingBudgets"
import BackLink from "@/modules/core/components/BackLink"
import { ClientLiveSelect } from "@/modules/client"
import { VehicleLiveSelect } from "@/modules/vehicle"
import FormField from "@/modules/core/components/FormField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import { fromDateTimeLocalInput } from "@/api/dto"
import { formatMoney } from "@/modules/core/utils/format"

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

  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")
  const serviceDate = watch("service_date")

  const [selectedBudgetId, setSelectedBudgetId] = useState(null)
  const clearBudgetChoice = () => setSelectedBudgetId(null)

  const { budgets: pendingBudgets, loading: loadingPendingBudgets } = usePendingBudgets(
    clientId,
    vehicleId,
  )

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
            <ClientLiveSelect
              label="Cliente"
              value={clientId}
              onChange={(value) => {
                if (value === clientId) return
                setValue("client_id", value)
                setValue("vehicle_id", "")
                clearBudgetChoice()
              }}
              error={errors.client_id?.message}
            />
            <VehicleLiveSelect
              label="Veículo"
              value={vehicleId}
              onChange={(value) => {
                setValue("vehicle_id", value)
                clearBudgetChoice()
              }}
              clientId={clientId}
              disabledHint="Selecione o cliente primeiro"
              error={errors.vehicle_id?.message}
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
                              {formatMoney(budget.total)}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted mt-0.5 tabular-nums">
                            Produtos {formatMoney(budget.products_total)} · Serviços{" "}
                            {formatMoney(budget.services_total)}
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
