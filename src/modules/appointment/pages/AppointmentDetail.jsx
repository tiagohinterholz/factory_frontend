import { Link } from "react-router-dom"
import { useAppointmentEditForm } from "@/modules/appointment/hooks/useAppointmentEditForm"
import BackLink from "@/modules/core/components/BackLink"
import { useClientOptions } from "@/modules/core/hooks/options"
import { useVehicleOptions } from "@/modules/core/hooks/options"
import { useOrderOptions } from "@/modules/core/hooks/options"
import FormField from "@/modules/core/components/FormField"
import SelectField from "@/modules/core/components/SelectField"
import PrimaryButton from "@/modules/core/components/PrimaryButton"
import WhatsAppButton from "@/modules/core/components/WhatsAppButton"
import { idOf, withSelectedOption } from "@/api/dto"
import { orderCanFinish } from "@/modules/order/domain"

import {
  CheckCircle2,
  ChevronRight,
  Edit,
  Trash2,
  User,
  Car,
  ClipboardList,
  FileText,
} from "lucide-react"

// Card de vínculo — linka pra tela da entidade relacionada (mesmo tipo de
// atalho que a OS e o orçamento já têm entre si). `to` ausente = sem vínculo
// ainda (ex.: agendamento sem OS/orçamento) e o card vira só informativo.
function ReferenceCard({ icon: Icon, label, title, subtitle, to }) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-lg bg-ground flex items-center justify-center text-brand border border-line shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="font-semibold text-ink text-sm truncate">{title}</p>
        {subtitle && <p className="text-[12px] text-muted truncate">{subtitle}</p>}
      </div>
    </>
  )

  if (!to) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-line bg-ground/50">
        {content}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 rounded-xl border border-line bg-surface transition-colors hover:border-brand hover:bg-brand-subtle/20 group"
    >
      {content}
      <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors shrink-0" />
    </Link>
  )
}

export default function AppointmentDetail() {
  const {
    form,
    onSubmit,
    loading,
    handleDelete,
    handleFinishOrder,
    linkedOrder,
    linkedBudget,
    relatedClient,
    relatedVehicle,
  } = useAppointmentEditForm()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const businessId = watch("business_id")
  const clientId = watch("client_id")
  const vehicleId = watch("vehicle_id")

  const { client: clients, loading: loadingClients } = useClientOptions()
  const { vehicle: vehicles, loading: loadingVehicles } = useVehicleOptions()
  const { orders, loading: loadingOrders } = useOrderOptions()

  // rótulo da <option> de fallback a partir do registro cru do detalhe (ora
  // aninhado, ora id cru — degrada pra "#id" quando não tem o nome)
  const clientLabel = (client) => client?.display_name || `Cliente #${idOf(client)}`
  const vehicleLabel = (vehicle) =>
    vehicle?.model || vehicle?.manufacturer
      ? `${vehicle.manufacturer ?? ""} ${vehicle.model ?? ""} ${vehicle.year ?? ""}`.trim()
      : `Veículo #${idOf(vehicle)}`
  const orderLabel = (order) => {
    const plate = order?.plate || order?.vehicle?.plate || ""
    return `OS ${idOf(order)}${plate ? ` - ${plate}` : ""}`
  }

  // as listas de opção vêm de um cache com staleTime alto ou de um filtro em
  // cascata; o registro já vinculado ao agendamento tem que aparecer no select
  // mesmo assim (senão salvar apagaria a FK). withSelectedOption injeta só
  // quando o valor selecionado é o próprio registro do detalhe.
  const clientOptions = withSelectedOption(
    clients
      .filter((c) => {
        const bizId = c.business?.id || c.business
        return !businessId || String(bizId) === String(businessId)
      })
      .map((c) => ({ id: c.id, name: c.display_name })),
    clientId,
    relatedClient && { id: idOf(relatedClient), name: clientLabel(relatedClient) },
  )

  const vehicleOptions = withSelectedOption(
    vehicles
      .filter((v) => {
        const ownerId = v.client?.id || v.client
        return !clientId || String(ownerId) === String(clientId)
      })
      .map((v) => ({
        id: v.id,
        name: `${v.manufacturer?.name || ""} ${v.model?.name || ""} ${v.year || ""}`.trim(),
      })),
    vehicleId,
    relatedVehicle && { id: idOf(relatedVehicle), name: vehicleLabel(relatedVehicle) },
  )

  const orderOptions = withSelectedOption(
    orders
      .filter((o) => {
        const orderVehicleId = o.vehicle?.id || o.vehicle
        return !vehicleId || String(orderVehicleId) === String(vehicleId)
      })
      .map((o) => ({ id: o.id, name: `OS ${o.id} - ${o.plate || ""}` })),
    watch("order_id"),
    linkedOrder && { id: idOf(linkedOrder), name: orderLabel(linkedOrder) },
  )

  function resetChildren(...names) {
    names.forEach((name) => setValue(name, ""))
  }

  if (loading || loadingClients || loadingVehicles || loadingOrders)
    return <p className="p-6 text-slate-500 font-medium">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-5xl mx-auto">
        <BackLink to="/agendamentos" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight mb-2">
              Editar Agendamento
            </h1>
            <p className="text-slate-400 font-medium text-sm">Sincronize os dados do agendamento</p>
          </div>
          <div className="flex items-center gap-2">
            <WhatsAppButton phone={relatedClient?.phone} label="WhatsApp" />
            {orderCanFinish(linkedOrder?.status) && (
              <button
                type="button"
                onClick={handleFinishOrder}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-fg hover:bg-brand-hover rounded-xl transition duration-300 font-bold text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalizar atendimento
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-danger hover:bg-danger-subtle rounded-xl transition duration-300 font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 card-premium">
            <form className="space-y-6" onSubmit={onSubmit}>
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
                disabled={!clientId}
                disabledHint="Selecione o cliente primeiro"
                error={errors.vehicle_id?.message}
                registration={register("vehicle_id", {
                  onChange: () => resetChildren("order_id"),
                })}
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

              <div className="pt-4 flex justify-end">
                <PrimaryButton type="submit" icon={Edit} fullWidth={false} disabled={isSubmitting}>
                  Salvar Alterações
                </PrimaryButton>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-semibold text-ink px-1">Vínculos</h2>
            <ReferenceCard
              icon={User}
              label="Cliente"
              title={clientLabel(relatedClient)}
              subtitle={relatedClient?.phone}
              to={relatedClient && `/clientes/${idOf(relatedClient)}`}
            />
            <ReferenceCard
              icon={Car}
              label="Veículo"
              title={vehicleLabel(relatedVehicle)}
              subtitle={relatedVehicle?.plate}
              to={relatedVehicle && `/veiculos/${idOf(relatedVehicle)}`}
            />
            <ReferenceCard
              icon={ClipboardList}
              label="Ordem de Serviço"
              title={linkedOrder ? `OS #${idOf(linkedOrder)}` : "Sem OS vinculada"}
              subtitle={linkedOrder?.status}
              to={linkedOrder && `/ordens/${idOf(linkedOrder)}`}
            />
            <ReferenceCard
              icon={FileText}
              label="Orçamento"
              title={linkedBudget ? `Orçamento #${idOf(linkedBudget)}` : "Sem orçamento vinculado"}
              subtitle={linkedBudget?.status}
              to={linkedBudget && `/orcamentos/${idOf(linkedBudget)}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
